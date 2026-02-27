import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { messageSchemas } from "./messagesSchema.js";
import Helpers from '../../../../helpers/auth.js'
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";

const Getters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // GET /api/v1/messages/roomHistory?roomKey=foo
    fastify.get<{
    Querystring: { roomKey: string; }
    }>(
    '/roomHistory',
    { schema: messageSchemas.getGroupMsg },
    async (req, reply) => {
        const roomKey = req.query.roomKey ?? ''

        if (roomKey.length === 0) {
            reply.code(400)
            return { error: 'wrong room identifier' }
        }

        // controllo auth a leggere i messaggi della room (per ora basta essere membro)
        const userId = getUserIdFromJWT(req, reply, fastify)
        if (!userId) {
            reply.code(400)
            return reply.send({
                error: 'Wrong userId',
            })
        }
        if (!Helpers.canAccessRoom(userId, roomKey, fastify)) {
            if (!userId) {
                reply.code(400)
                return reply.send({
                    error: `User ${userId} has not the rights to read this history.`
                })
            } 
        }

        const room = await fastify.prisma.chatRoom.findUnique({
            where: { key: roomKey },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: { select: { id: true, email: true } }
                    }
                }
            }
        })

        const result = room?.messages.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderMail: m.sender.email,
            content: m.content,
            timestamp: m.createdAt
        }))

        return reply.send({
            roomKey,
            count: room? room.messages.length: 0,
            messages: result ?? null,
        })
    })

    // // GET /api/v1/messages/pvtHistory?userA=1&userB=2
    // fastify.get<{
    // Querystring: { userA: number; userB: number }
    // }>(
    // '/pvtHistory',
    // { schema: messageSchemas.getGroupMsg },
    // async (req, reply) => {
    //     const userA = Number(req.query.userA)
    //     const userB = Number(req.query.userB)

    //     if (Number.isNaN(userA) || Number.isNaN(userB)) {
    //         reply.code(400)
    //         return { error: 'Error in users ids' }
    //     }
    //     const room = await fastify.prisma.directConversation.findUnique({
    //         where: { userAId: userA, userBId: userB },
    //         include: {
    //             messages: {
    //                 include: {
    //                     sender: true
    //                 }
    //             }
    //         }
    //     })

    //     const result = room?.messages.map((m) => ({
    //         id: m.id,
    //         senderId: m.senderId,
    //         senderMail: m.sender.email,
    //         content: m.content,
    //         timestamp: m.createdAt
    //     }))

    //     return reply.send({
    //         roomKey,
    //         count: room?.messages.length,
    //         messages: result,
    //     })
    // })
}



export default Getters