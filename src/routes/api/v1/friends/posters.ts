import { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { friendsSchema } from "./friendsSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { FriendshipStatus, NotificationType } from "@prisma/client";

const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
  // POST /api/v1/friends/requests
  fastify.post<{
    Body: { targetUserId: number }
  }>(
    "/requests",
    { schema: friendsSchema.createRequest },
    async (req, reply) => {
      const authUser = getUserIdFromJWT(req, reply, fastify);
      const { targetUserId } = req.body;

      if (!authUser || !targetUserId) {
        reply.code(400);
        return { error: "Invalid authenticated user or targetUserId" };
      }

      if (authUser === targetUserId) {
        reply.code(400);
        return { error: "You cannot send a friend request to yourself" };
      }

      const targetUser = await fastify.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, name: true, surname: true, email: true },
      });

      if (!targetUser) {
        reply.code(404);
        return { error: "Target user not found" };
      }

      // controllo se esiste già una friendship in qualsiasi verso
      const existing = await fastify.prisma.friendship.findFirst({
        where: {
          OR: [
            { senderId: authUser, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: authUser },
          ],
        },
        select: { id: true, status: true },
      });

      if (existing) {
        if (existing.status === "PENDING") {
          reply.code(409);
          return { error: "Friend request already pending" };
        }
        if (existing.status === "ACCEPTED") {
          reply.code(409);
          return { error: "Users are already friends" };
        }
        if (existing.status === "BLOCKED") {
          reply.code(403);
          return { error: "Friendship is blocked" };
        }
        if (existing.status === 'REJECTED') {
        const fr = await fastify.prisma.friendship.update({
          where: { id: existing.id },
          data: {
            senderId: authUser,
            receiverId: targetUserId,
            status: 'PENDING',
          },
        })
        // WS realtime verso receiver
        fastify.wsSendToUser(targetUserId, {
          type: "friend:request",
          requestId: fr.id,
          fromUserId: authUser,
          status: "PENDING",
          notificationId: existing.id,
          ts: Date.now(),
        });
        }
      }

      try {
        const created = await fastify.prisma.$transaction(async (tx) => {
          // 1) crea friendship PENDING
          const friendship = await tx.friendship.create({
            data: {
              senderId: authUser,
              receiverId: targetUserId,
              status: FriendshipStatus.PENDING,
            },
          });

          // 2) crea notification legata alla friendship (friendshipId è UNIQUE → una sola)
          const notification = await tx.notification.create({
            data: {
              userId: targetUserId,          
              senderId: authUser,            
              friendshipId: friendship.id,   
              type: NotificationType.FRIEND_REQUEST,
              message: "You received a friend request",
            },
          });

          return { friendship, notification };
        });

        // WS realtime verso receiver
        fastify.wsSendToUser(targetUserId, {
          type: "friend:request",
          requestId: created.friendship.id,
          fromUserId: authUser,
          status: "PENDING",
          notificationId: created.notification.id,
          ts: Date.now(),
        });

        reply.code(201);
        return { success: true, friendship: created.friendship };
      } catch (error: any) {
        fastify.log.error(error);
        if (error?.code === "P2002") {
          reply.code(409);
          return { error: "Friend request already exists" };
        }
        reply.code(400);
        return { error: "Unable to create friend request" };
      }
    }
  );

  // POST /api/v1/friends/requests/:requestId/accept
  fastify.post<{ Params: { requestId: string } }>(
    "/requests/:requestId/accept",
    { schema: friendsSchema.acceptRequest },
    async (req, reply) => {
      const authUser = getUserIdFromJWT(req, reply, fastify);
      const requestId = Number(req.params.requestId);

      if (!authUser || Number.isNaN(requestId)) {
        reply.code(400);
        return { error: "Invalid authenticated user or requestId" };
      }

      try {
        const out = await fastify.prisma.$transaction(async (tx) => {
          const friendship = await tx.friendship.findUnique({
            where: { id: requestId },
            select: { id: true, senderId: true, receiverId: true, status: true },
          });

          if (!friendship) {
            return { ok: false as const, code: 404, error: "Friend request not found" };
          }

          if (friendship.receiverId !== authUser) {
            return { ok: false as const, code: 403, error: "Forbidden" };
          }

          if (friendship.status !== FriendshipStatus.PENDING) {
            return { ok: false as const, code: 409, error: `Friend request already ${friendship.status}` };
          }

          const updatedFriendship = await tx.friendship.update({
            where: { id: requestId },
            data: { status: FriendshipStatus.ACCEPTED },
          });

          // aggiorna quella della request
          await tx.notification.updateMany({
            where: { friendshipId: requestId },
            data: {
              type: NotificationType.SYSTEM,
              message: "Friend request accepted",
            },
          });

          // notifica al sender (senza friendshipId, per evitare vincolo unique)
          const notifySender = await tx.notification.create({
            data: {
              userId: friendship.senderId,
              senderId: authUser,
              type: NotificationType.SYSTEM,
              message: "Your friend request was accepted",
            },
          });

          return {
            ok: true as const,
            updatedFriendship,
            senderId: friendship.senderId,
            notifyId: notifySender.id,
          };
        });

        if (!out.ok) {
          reply.code(out.code);
          return { error: out.error };
        }

        fastify.wsSendToUser(out.senderId, {
          type: "friend:request:accepted",
          requestId,
          acceptedByUserId: authUser,
          status: "ACCEPTED",
          notificationId: out.notifyId,
          ts: Date.now(),
        });

        reply.code(200);
        return { success: true, friendship: out.updatedFriendship };
      } catch (error: any) {
        fastify.log.error(error);
        reply.code(400);
        return { error: "Unable to accept friend request" };
      }
    }
  );

// POST /api/v1/friends/requests/:requestId/reject
fastify.post<{ Params: { requestId: string } }>(
  "/requests/:requestId/reject",
  { schema: friendsSchema.rejectRequest },
  async (req, reply) => {
    const authUser = getUserIdFromJWT(req, reply, fastify);
    const requestId = Number(req.params.requestId);

    if (!authUser || Number.isNaN(requestId)) {
      reply.code(400);
      return { error: "Invalid authenticated user or requestId" };
    }

    try {
      const out = await fastify.prisma.$transaction(async (tx) => {
        const friendship = await tx.friendship.findUnique({
          where: { id: requestId },
          select: { id: true, senderId: true, receiverId: true, status: true },
        });

        if (!friendship) {
          return { ok: false as const, code: 404, error: "Friend request not found" };
        }

        // solo il receiver può rifiutare
        if (friendship.receiverId !== authUser) {
          return { ok: false as const, code: 403, error: "Forbidden" };
        }

        if (friendship.status !== FriendshipStatus.PENDING) {
          return { ok: false as const, code: 409, error: `Friend request already ${friendship.status}` };
        }

        const updated = await tx.friendship.update({
          where: { id: requestId },
          data: { status: FriendshipStatus.REJECTED },
        });

        await tx.notification.updateMany({
          where: { friendshipId: requestId },
          data: {
            type: NotificationType.SYSTEM,
            message: "Friend request rejected",
          },
        });

        const notifySender = await tx.notification.create({
          data: {
            userId: friendship.senderId,
            senderId: authUser,
            type: NotificationType.SYSTEM,
            message: "Your friend request was rejected",
          },
        });

        return {
          ok: true as const,
          updated,
          senderId: friendship.senderId,
          notifyId: notifySender.id,
        };
      });

      if (!out.ok) {
        reply.code(out.code);
        return { error: out.error };
      }

      // WS al sender
      fastify.wsSendToUser(out.senderId, {
        type: "friend:request:rejected",
        requestId,
        rejectedByUserId: authUser,
        status: "REJECTED",
        notificationId: out.notifyId,
        ts: Date.now(),
      });

      reply.code(200);
      return { success: true, friendship: out.updated };
    } catch (error: any) {
      fastify.log.error(error);
      reply.code(400);
      return { error: "Unable to reject friend request" };
    }
  }
);
};

export default Posters;