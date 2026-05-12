import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { getUserIdFromJWT } from '../../../../helpers/cookies.js';
import { orgSchemas } from './organizationsSchema.js';

// DELETE api/v1/organizations/delete/:id
const Deleters: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.delete<{
    Params: { id: string }
  }>(
    '/delete/:id',
    { schema: orgSchemas.deleteOrganization },
    async (req, res) => {
      const actorId = getUserIdFromJWT(req, res, fastify);
      const organizationId = Number(req.params.id);

      if (!actorId) {
        res.code(401);
        return { error: 'Unauthorized' };
      }

      if (Number.isNaN(organizationId)) {
        res.code(400);
        return { error: 'Invalid organization id' };
      }

      const org = await fastify.prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true, ownerId: true, name: true },
      });

      if (!org) {
        res.code(404);
        return { error: 'Organization not found' };
      }

      if (org.ownerId !== actorId) {
        res.code(403);
        return { error: 'Only the owner can delete this organization' };
      }

      try {
        await fastify.prisma.$transaction(async (tx) => {
          // eventuali join request org
          if ((tx as any).organizationJoinRequest) {
            await (tx as any).organizationJoinRequest.deleteMany({
              where: { organizationId },
            });
          }

          // progetti dell'org
          const projects = await tx.project.findMany({
            where: { organizationId },
            select: { id: true },
          });

          const projectIds = projects.map((p) => p.id);

          if (projectIds.length > 0) {
            // task dei progetti
            const tasks = await tx.task.findMany({
              where: { projectId: { in: projectIds } },
              select: { id: true },
            });

            const taskIds = tasks.map((t) => t.id);

            if (taskIds.length > 0) {
              await tx.taskParticipant.deleteMany({
                where: { taskId: { in: taskIds } },
              });

              await tx.task.deleteMany({
                where: { id: { in: taskIds } },
              });
            }

            await tx.projectParticipant.deleteMany({
              where: { projectId: { in: projectIds } },
            });

            await tx.chatRoom.deleteMany({
              where: { projectId: { in: projectIds } },
            });

            await tx.project.deleteMany({
              where: { id: { in: projectIds } },
            });
          }

          // chatroom org-level
          await tx.chatRoom.deleteMany({
            where: { orgId: organizationId },
          });

          // membri org
          await tx.organizationMember.deleteMany({
            where: { organizationId },
          });

          // infine org
          await tx.organization.delete({
            where: { id: organizationId },
          });
        });

        return res.code(200).send({ success: true });
      } catch (err) {
        fastify.log.error(err);
        res.code(500);
        return { error: 'Failed to delete organization' };
      }
    }
  );
};

export default Deleters;