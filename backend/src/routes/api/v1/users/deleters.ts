import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { compareSync } from 'bcrypt-ts';
import { getUserIdFromJWT } from '../../../../helpers/cookies.js';
import { userSchemas } from './usersSchemas.js';

const Deleters: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.delete<{
        Body: { password: string }
    }>(
    '/delete',
    { schema: userSchemas.deleteSchema },
    async (req, reply) => {
      const userId = getUserIdFromJWT(req, reply, fastify);
      const { password } = req.body;

      if (!userId) {
        reply.code(401);
        return { error: 'Unauthorized' };
      }

      if (!password) {
        reply.code(400);
        return { error: 'Password is required' };
      }

      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        reply.code(404);
        return { error: 'User not found' };
      }

      if (!user.hashedPw) {
        reply.code(400);
        return { error: 'This account has no password set' };
      }

      if (!compareSync(password, user.hashedPw)) {
        reply.code(401);
        return { error: 'Invalid password' };
      }

      const [ownedOrganizations, ownedEvents] = await fastify.prisma.$transaction([
        fastify.prisma.organization.count({
          where: { ownerId: userId },
        }),
        fastify.prisma.event.count({
          where: { ownerId: userId },
        }),
      ]);

      if (ownedOrganizations > 0) {
        reply.code(409);
        return {
          error: 'You must transfer or delete your organizations before deleting your account',
        };
      }

      if (ownedEvents > 0) {
        reply.code(409);
        return {
          error: 'You must transfer or delete your events before deleting your account',
        };
      }

      try {
        await fastify.prisma.$transaction(async (tx) => {
          const friendshipIds = await tx.friendship.findMany({
            where: {
              OR: [
                { senderId: userId },
                { receiverId: userId },
              ],
            },
            select: { id: true },
          });

          const ids = friendshipIds.map(f => f.id);

          if (ids.length > 0) {
            await tx.notification.deleteMany({
              where: {
                friendshipId: { in: ids },
              },
            });
          }

          await tx.notification.deleteMany({
            where: {
              OR: [
                { userId },
                { senderId: userId },
              ],
            },
          });

          await tx.directMessage.deleteMany({
            where: {
              OR: [
                { senderId: userId },
                { receiverId: userId },
              ],
            },
          });

          await tx.directConversation.deleteMany({
            where: {
              OR: [
                { userAId: userId },
                { userBId: userId },
              ],
            },
          });

          await tx.roomMessage.deleteMany({
            where: { senderId: userId },
          });

          await tx.friendship.deleteMany({
            where: {
              OR: [
                { senderId: userId },
                { receiverId: userId },
              ],
            },
          });

          await tx.eventParticipant.deleteMany({
            where: { userId },
          });

          await tx.taskParticipant.deleteMany({
            where: { userId },
          });

          await tx.projectParticipant.deleteMany({
            where: { userId },
          });

          await tx.organizationMember.deleteMany({
            where: { userId },
          });

          await tx.groupParticipant.deleteMany({
            where: { userId },
          });

          await tx.groupJoinRequest.deleteMany({
            where: {
              OR: [
                { requesterId: userId },
                { targetUserId: userId },
              ],
            },
          });

          if ((tx as any).organizationJoinRequest) {
            await (tx as any).organizationJoinRequest.deleteMany({
              where: {
                OR: [
                  { requesterId: userId },
                  { targetUserId: userId },
                ],
              },
            });
          }

          await tx.user.delete({
            where: { id: userId },
          });
        });

        reply.clearCookie('session', { path: '/' });

        return reply.code(200).send({
          success: true,
        });
      } catch (err) {
        fastify.log.error(err);
        reply.code(500);
        return { error: 'Failed to delete account' };
      }
    }
  );
};

export default Deleters;