import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getUserIdFromJWT } from '../../../../helpers/cookies.js';


// DELETE api/v1/projects/delete/:id
const Deleters: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.delete<{
    Params: { id: string }
  }>(
    '/delete/:id',
    {
      schema: {
        description: 'Hard delete a project',
        tags: ['projects'],
        summary: 'Delete project',
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
            required: ['success'],
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
            required: ['error'],
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
            required: ['error'],
          },
          403: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
            required: ['error'],
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
            required: ['error'],
          },
        },
      },
    },
    async (req, res) => {
      const actorId = getUserIdFromJWT(req, res, fastify);
      const projectId = Number(req.params.id);

      if (!actorId) {
        res.code(401);
        return { error: 'Unauthorized' };
      }

      if (Number.isNaN(projectId)) {
        res.code(400);
        return { error: 'Invalid project id' };
      }

      const participant = await fastify.prisma.projectParticipant.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: actorId,
          },
        },
        include: {
          role: {
            select: {
              name: true,
              permissions: true,
            },
          },
        },
      });

      if (!participant) {
        res.code(403);
        return { error: 'You are not a participant of this project' };
      }

      const canDelete =
        participant.role.name === 'OWNER' ||
        participant.role.permissions.bOwner === true ||
        participant.role.permissions.bRemoveUser === true;

      if (!canDelete) {
        res.code(403);
        return { error: 'You do not have permission to delete this project' };
      }

      const project = await fastify.prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true },
      });

      if (!project) {
        res.code(404);
        return { error: 'Project not found' };
      }

      try {
        await fastify.prisma.$transaction(async (tx) => {
          const tasks = await tx.task.findMany({
            where: { projectId },
            select: { id: true },
          });

          const taskIds = tasks.map((t) => t.id);

          if (taskIds.length > 0) {
            await tx.taskParticipant.deleteMany({
              where: {
                taskId: { in: taskIds },
              },
            });

            await tx.task.deleteMany({
              where: {
                id: { in: taskIds },
              },
            });
          }

          const participants = await tx.projectParticipant.findMany({
                where: { projectId },
                select: { userId: true }
            })

            participants.map((p) => {
            fastify.wsSendToUser(
                p.userId,
                {
                    type: 'project:modified',
                    payload: null
            })
          })

          await tx.projectParticipant.deleteMany({
            where: { projectId },
          });

          await tx.chatRoom.deleteMany({
            where: { projectId },
          });

          await tx.project.delete({
            where: { id: projectId },
          });
        });

        return res.code(200).send({ success: true });
      } catch (err) {
        fastify.log.error(err);
        res.code(500);
        return { error: 'Failed to delete project' };
      }
    }
  );
};

export default Deleters;