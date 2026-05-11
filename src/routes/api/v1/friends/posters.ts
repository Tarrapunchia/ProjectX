import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { friendsSchema } from "./friendsSchema.js";
import { getUserIdFromJWT, setAuthCookie } from "../../../../helpers/cookies.js";
import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";

const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // // POST /api/v1/friends/requests
    fastify.post<{
        Body: { targetUserId: number }
    }>(
    '/requests',
    {
      schema: friendsSchema.createRequest,
    },
    async (req, res) => {
      const authUser = getUserIdFromJWT(req, res, fastify);
      const { targetUserId } = req.body;

      if (!authUser || !targetUserId) {
        res.code(400);
        return { error: 'Invalid authenticated user or targetUserId' };
      }

      if (authUser === targetUserId) {
        res.code(400);
        return { error: 'You cannot send a friend request to yourself' };
      }

      const targetUser = await fastify.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true, surname: true, email: true },
      });

      if (!targetUser) {
        res.code(404);
        return { error: 'Target user not found' };
      }

      // controllo se esiste già una friendship in qualsiasi verso
      const existing = await fastify.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              senderId: authUser,
              receiverId: targetUserId,
            },
            {
              senderId: targetUserId,
              receiverId: authUser,
            },
          ],
        },
      });

      if (existing) {
        if (existing.status === 'PENDING') {
          res.code(409);
          return { error: 'Friend request already pending' };
        }
        if (existing.status === 'ACCEPTED') {
          res.code(409);
          return { error: 'Users are already friends' };
        }
        if (existing.status === 'BLOCKED') {
          res.code(403);
          return { error: 'Friendship is blocked' };
        }
      }

      const friendship = await fastify.prisma.friendship.create({
        data: {
          senderId: authUser,
          receiverId: targetUserId,
          status: 'PENDING',
        },
      });

      // opzionale: creo anche una notifica DB
      const notification = await fastify.prisma.notification.create({
        data: {
          userId: targetUserId,
          senderId: authUser,
          friendshipId: friendship.id,
          type: 'FRIEND_REQUEST',
          message: 'You received a friend request',
        },
      });

      // notifica realtime WS
      fastify.wsSendToUser(targetUserId, {
        type: 'friend:request',
        requestId: friendship.id,
        fromUserId: authUser,
        status: 'PENDING',
        notificationId: notification.id,
        ts: Date.now(),
      });

      return res.code(201).send({
        success: true,
        friendship,
      });
    }
  );

    // POST /api/v1/friends/requests/:requestId/accept
    fastify.post<{
        Params: { requestId: string }
    }>(
    '/requests/:requestId/accept',
    {
        schema: friendsSchema.acceptRequest,
    },
    async (req, res) => {
        const authUser = getUserIdFromJWT(req, res, fastify);
        const requestId = Number(req.params.requestId);

        if (!authUser || Number.isNaN(requestId)) {
        res.code(400);
        return { error: 'Invalid authenticated user or requestId' };
        }

        const friendship = await fastify.prisma.friendship.findUnique({
        where: { id: requestId },
        });

        if (!friendship) {
        res.code(404);
        return { error: 'Friend request not found' };
        }

        if (friendship.receiverId !== authUser) {
        res.code(403);
        return { error: 'You are not allowed to accept this friend request' };
        }

        if (friendship.status !== 'PENDING') {
        res.code(409);
        return { error: `Friend request already ${friendship.status}` };
        }

        const updatedFriendship = await fastify.prisma.friendship.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
        });

        // opzionale: crea notifica al sender
        const notification = await fastify.prisma.notification.create({
        data: {
            userId: friendship.senderId,
            senderId: authUser,
            friendshipId: friendship.id,
            type: 'FRIEND_REQUEST',
            message: 'Your friend request was accepted',
        },
        });

        fastify.wsSendToUser(friendship.senderId, {
        type: 'friend:request:accepted',
        requestId: friendship.id,
        acceptedByUserId: authUser,
        status: 'ACCEPTED',
        notificationId: notification.id,
        ts: Date.now(),
        });

        return res.code(200).send({
        success: true,
        friendship: updatedFriendship,
        });
    }
    );

    // POST 
    fastify.post<{
        Params: { requestId: string }
    }>(
    '/requests/:requestId/reject',
    {
        schema: friendsSchema.rejectRequest,
    },
    async (req, res) => {
        const authUser = getUserIdFromJWT(req, res, fastify);
        const requestId = Number(req.params.requestId);

        if (!authUser || Number.isNaN(requestId)) {
        res.code(400);
        return { error: 'Invalid authenticated user or requestId' };
        }

        const friendship = await fastify.prisma.friendship.findUnique({
        where: { id: requestId },
        });

        if (!friendship) {
        res.code(404);
        return { error: 'Friend request not found' };
        }

        if (friendship.receiverId !== authUser) {
        res.code(403);
        return { error: 'You are not allowed to reject this friend request' };
        }

        if (friendship.status !== 'PENDING') {
        res.code(409);
        return { error: `Friend request already ${friendship.status}` };
        }

        const updatedFriendship = await fastify.prisma.friendship.update({
            where: { id: requestId },
            data: { status: 'REJECTED' }, // oppure puoi delete, ma meglio tenere stato
        });

        fastify.wsSendToUser(friendship.senderId, {
        type: 'friend:request:rejected',
        requestId: friendship.id,
        rejectedByUserId: authUser,
        ts: Date.now(),
        });

        return res.code(200).send({
        success: true,
        friendship: updatedFriendship,
        });
    }
    );
}

export default Posters