import fastify, {} from "fastify";
import { messageSchemas } from "./messagesSchema.js";
import Helpers from '../../../../helpers/auth.js';
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
const Getters = async (fastify, opts) => {
    // GET /api/v1/messages/roomHistory?roomKey=foo
    fastify.get('/roomHistory', { schema: messageSchemas.getGroupMsg }, async (req, res) => {
        var _a;
        const roomKey = (_a = req.query.roomKey) !== null && _a !== void 0 ? _a : '';
        if (roomKey.length === 0) {
            res.code(400);
            return { error: 'wrong room identifier' };
        }
        // controllo auth a leggere i messaggi della room (per ora basta essere membro)
        const userId = getUserIdFromJWT(req, res, fastify);
        if (!userId) {
            res.code(400);
            return res.send({
                error: 'Wrong userId',
            });
        }
        if (!Helpers.canAccessRoom(userId, roomKey, fastify)) {
            if (!userId) {
                res.code(400);
                return res.send({
                    error: `User ${userId} has not the rights to read this history.`
                });
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
        });
        const result = room === null || room === void 0 ? void 0 : room.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            senderMail: m.sender.email,
            content: m.content,
            timestamp: m.createdAt
        }));
        return res.send({
            roomKey,
            count: room ? room.messages.length : 0,
            messages: result !== null && result !== void 0 ? result : null,
        });
    });
    // GET /api/v1/messages/pvtHistory?userA=1&userB=2
    fastify.get('/pvtHistory', { schema: messageSchemas.getPvtMsg }, async (req, res) => {
        var _a;
        const A = Number(req.query.userA);
        const B = Number(req.query.userB);
        // controllo se user e' user A o user B
        const user = getUserIdFromJWT(req, res, fastify);
        if (!user) {
            res.code(400);
            return res.send({
                error: 'You must log in in order to start a conversation'
            });
        }
        if (user != A && user != B) {
            res.code(400);
            return res.send({
                error: 'Access to pvt msg history denied'
            });
        }
        const userA = A > B ? B : A;
        const userB = A > B ? A : B;
        if (Number.isNaN(userA) || Number.isNaN(userB)) {
            res.code(400);
            return { error: 'Error in users ids' };
        }
        const room = await fastify.prisma.directConversation.findUnique({
            where: { userAId_userBId: { userAId: userA, userBId: userB } },
            include: {
                messages: {
                    include: {
                        sender: true
                    }
                }
            }
        });
        const result = room === null || room === void 0 ? void 0 : room.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            senderMail: m.sender.email,
            content: m.content,
            timestamp: m.createdAt
        }));
        return res.send({
            count: (_a = room === null || room === void 0 ? void 0 : room.messages.length) !== null && _a !== void 0 ? _a : 0,
            messages: result !== null && result !== void 0 ? result : [],
        });
    });
};
export default Getters;
//# sourceMappingURL=getters.js.map