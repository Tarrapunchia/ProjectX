import {} from '@fastify/websocket';
// import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastify, {} from 'fastify';
import { getUserIdFromJWT, wsGetUserIdFromJWT } from '../../helpers/cookies.js';
import Helpers from '../../helpers/auth.js';
function safeSend(ws, payload) {
    // constrollo se socket sono aperti
    const anyWs = ws;
    if (anyWs.readyState !== 1)
        return false;
    // mando roba
    try {
        ws.send(payload);
        ws;
        return true;
    }
    catch (_a) {
        return false;
    }
}
const websocketPlugin = fp(async (server) => {
    // 1) stato condiviso
    server.decorate('wsClientsByUserId', new Map());
    server.decorate('wsRooms', new Map());
    // 2) helpers
    server.decorate('wsSendToUser', (userId, data) => {
        const set = server.wsClientsByUserId.get(userId);
        if (!set || set.size === 0)
            return 0;
        const payload = JSON.stringify(data);
        let sent = 0;
        for (const ws of set) {
            if (safeSend(ws, payload))
                sent++;
        }
        return sent;
    });
    server.decorate('wsBroadcast', (data) => {
        const payload = JSON.stringify(data);
        let sent = 0;
        for (const set of server.wsClientsByUserId.values()) {
            for (const ws of set) {
                if (safeSend(ws, payload))
                    sent++;
            }
        }
        return sent;
    });
    // il broadcast senza aggiornare anche chi lo invia
    server.decorate('wsBroadcastExcept', (except, data) => {
        const payload = JSON.stringify(data);
        let sent = 0;
        for (const set of server.wsClientsByUserId.values()) {
            for (const client of set) {
                if (client === except)
                    continue;
                const anyWs = client;
                if (anyWs.readyState !== 1)
                    continue;
                try {
                    client.send(payload);
                    sent++;
                }
                catch (_a) { }
            }
        }
        return sent;
    });
    server.decorate('wsRoomBroadcast', (roomId, data, except) => {
        const set = server.wsRooms.get(roomId);
        if (!set || set.size === 0)
            return 0;
        const payload = JSON.stringify(data);
        let sent = 0;
        for (const client of set) {
            if (except && client === except)
                continue;
            const anyWs = client;
            if (anyWs.readyState !== 1)
                continue;
            try {
                client.send(payload);
                sent++;
            }
            catch (_a) { }
        }
        return sent;
    });
    server.decorate('wsDisconnectUser', (userId, code = 1000, reason = 'bye') => {
        const set = server.wsClientsByUserId.get(userId);
        if (!set || set.size === 0)
            return 0;
        let closed = 0;
        for (const ws of set) {
            try {
                ws.close(code, reason);
                closed++;
            }
            catch (_a) {
                // ignore
            }
        }
        server.wsClientsByUserId.delete(userId);
        return closed;
    });
    // 3) route WS
    server.get('/ws', { websocket: true }, async (connOrSocket, req) => {
        var _a;
        // compat: se è { socket } usa .socket, altrimenti è già il ws
        const ws = (_a = connOrSocket.socket) !== null && _a !== void 0 ? _a : connOrSocket;
        const userId = wsGetUserIdFromJWT(req, server);
        if (!userId) {
            ws.close(1008, 'No valid token.');
            return;
        }
        // faccio l'add alla mappa
        let set = server.wsClientsByUserId.get(userId);
        if (!set) {
            set = new Set();
            server.wsClientsByUserId.set(userId, set);
        }
        set.add(ws);
        server.log.info({ userId, connectionsForUser: set.size }, 'WS connected');
        ws.on('close', (code, reason) => {
            var _a, _b;
            const curUsr = server.wsClientsByUserId.get(userId);
            if (curUsr) {
                curUsr.delete(ws);
                if (curUsr.size == 0) {
                    server.wsClientsByUserId.delete(userId);
                }
            }
            // rimuovi ws da tutte le rooms
            for (const [roomId, roomSet] of server.wsRooms) {
                if (roomSet.delete(ws) && roomSet.size === 0) {
                    server.wsRooms.delete(roomId);
                }
            }
            server.log.info({ userId, code, reason: (_a = reason === null || reason === void 0 ? void 0 : reason.toString) === null || _a === void 0 ? void 0 : _a.call(reason), remainingWs: (_b = curUsr === null || curUsr === void 0 ? void 0 : curUsr.size) !== null && _b !== void 0 ? _b : 0 }, 'ws closed');
        });
        ws.on('message', async (raw) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            // TEST
            const text = raw.toString();
            if (text === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
                return;
            }
            let msg;
            try {
                msg = JSON.parse(text);
            }
            catch (_k) {
                server.log.info({ userId, text }, 'WS non-JSON msg');
                return;
            }
            switch (msg === null || msg === void 0 ? void 0 : msg.type) {
                case "broadcast":
                    server.wsBroadcast({
                        type: 'broadcast',
                        fromUserId: userId,
                        payload: (_a = msg.payload) !== null && _a !== void 0 ? _a : null
                    });
                    break;
                case "private":
                    server.wsSendToUser(msg.toUserId, {
                        type: 'private',
                        fromUserId: userId,
                        payload: (_b = msg.payload) !== null && _b !== void 0 ? _b : null
                    });
                    break;
                // case "cursor:move":
                //     server.wsBroadcastExcept(
                //         ws,
                //         {
                //             type: 'cursor:move',
                //             userId,
                //             x: msg.x,
                //             y: msg.y,
                //             ts: Date.now()
                //         })
                //     break;
                case 'chat:send':
                    {
                        const toUserId = Number(msg.toUserId);
                        const msgText = String((_c = msg.text) !== null && _c !== void 0 ? _c : '');
                        if (!toUserId || !text.trim())
                            return;
                        // controllo se il destinatario esiste
                        const exist = await Helpers.userExist(toUserId, server);
                        if (!exist) {
                            return server.wsSendToUser(userId, {
                                type: 'error',
                                error: `User ${toUserId} does not exist.`
                            });
                        }
                        // normalizza coppia (senno' mi duplicava le conversazioni, a quanto pare)
                        const a = Math.min(userId, toUserId);
                        const b = Math.max(userId, toUserId);
                        // upsert conversation
                        const conv = await server.prisma.directConversation.upsert({
                            where: { userAId_userBId: { userAId: a, userBId: b } },
                            create: { userAId: a, userBId: b },
                            update: {}, // updatedAt si aggiorna da solo se hai @updatedAt nel modello prisma (a quel che ho capito)
                        });
                        // 2) salva messaggio
                        const saved = await server.prisma.directMessage.create({
                            data: {
                                conversationId: conv.id,
                                senderId: userId,
                                receiverId: toUserId,
                                content: msgText,
                            },
                            select: {
                                id: true,
                                senderId: true,
                                receiverId: true,
                                content: true,
                                createdAt: true,
                                conversationId: true,
                            }
                        });
                        // 3) alla fine rispondo a user
                        server.wsSendToUser(toUserId, {
                            type: 'chat:message',
                            fromUserId: userId,
                            toUserId,
                            text,
                            ts: Date.now(),
                        });
                    }
                    break;
                // GESTIONE ROOMS
                case 'room:join':
                    {
                        const roomId = String(msg.roomId);
                        if (!roomId) {
                            server.log.error('No roomId given');
                            return;
                        }
                        // check se posso accedere alla room
                        if (!Helpers.canAccessRoom(userId, roomId, server)) {
                            return server.wsSendToUser(userId, {
                                type: 'error',
                                error: `User ${userId} has not the rights to open this chat.`
                            });
                        }
                        // check se la room esiste
                        if (await Helpers.roomExist(roomId, server) === false) {
                            return server.wsSendToUser(userId, {
                                type: 'error',
                                error: `Room ${roomId} does not exist.`
                            });
                        }
                        // aggiungo ai ws della room
                        let set = server.wsRooms.get(roomId);
                        if (!set) {
                            set = new Set();
                            server.wsRooms.set(roomId, set);
                        }
                        set.add(ws);
                        server.log.info({ userId, roomId, connectionsForRoom: set.size }, 'WS added to room');
                        server.wsSendToUser(userId, {
                            type: 'room:joined',
                            roomId: roomId,
                            userId: userId,
                            ts: Date.now(),
                        });
                        // a sto punto, con il room:joined, il client fara' la get di tutti i messaggi della chat
                    }
                    break;
                case 'room:leave':
                    {
                        const roomId = String(msg.roomId);
                        if (!roomId) {
                            server.log.error('No roomId given');
                            return;
                        }
                        const curRoom = server.wsRooms.get(roomId);
                        if (curRoom) {
                            curRoom.delete(ws);
                            if (curRoom.size == 0) {
                                server.wsRooms.delete(roomId);
                            }
                        }
                        server.log.info({ userId, roomId, reason: 'User exited room', remainingWs: (_d = curRoom === null || curRoom === void 0 ? void 0 : curRoom.size) !== null && _d !== void 0 ? _d : 0 }, 'ws deleted from room');
                    }
                    break;
                case 'room:message':
                    const roomId = String((_e = msg.roomId) !== null && _e !== void 0 ? _e : '').trim(); // sara' org:orgId oppure proj:orgId:projId
                    const msgText = String((_f = msg.payload.text) !== null && _f !== void 0 ? _f : '');
                    if (!roomId)
                        return;
                    // sicurezza: può scrivere solo se è dentro alla stanza
                    const roomSet = server.wsRooms.get(roomId);
                    if (!roomSet || !roomSet.has(ws)) {
                        safeSend(ws, JSON.stringify({ type: 'error', error: 'NOT_IN_ROOM', roomId }));
                        return;
                    }
                    // es: "org:12" or "proj:12:5"
                    const parsed = Helpers.parseRoomKey(roomId);
                    // 1) upsert ChatRoom
                    const room = await server.prisma.chatRoom.upsert({
                        where: { key: roomId },
                        create: {
                            key: roomId,
                            type: parsed.type,
                            orgId: parsed.orgId,
                            projectId: parsed.projectId,
                        },
                        update: {}, // nulla
                        select: { id: true, key: true }
                    });
                    // 2) salvo messaggio
                    const saved = await server.prisma.roomMessage.create({
                        data: {
                            roomId: room.id,
                            senderId: userId,
                            content: msgText,
                        },
                        select: {
                            id: true,
                            senderId: true,
                            content: true,
                            createdAt: true,
                            roomId: true,
                        }
                    });
                    // broadcast agli altri della room
                    server.wsRoomBroadcast(roomId, {
                        type: 'room:message',
                        roomId,
                        fromUserId: userId,
                        payload: (_g = msg.payload) !== null && _g !== void 0 ? _g : null,
                        ts: Date.now(),
                    }, ws);
                    break;
                // per notifiche
                case 'notify':
                    {
                        const toUserId = Number(msg.toUserId);
                        if (!toUserId) {
                            server.log.error('No User Id given');
                            return;
                        }
                        server.wsSendToUser(toUserId, { type: 'notify', notification: String((_h = msg.notification) !== null && _h !== void 0 ? _h : ''), ts: Date.now() });
                    }
                    break;
                // a tutti i connessi
                case 'notifyAll':
                    server.wsBroadcast({ type: 'notify', notification: String((_j = msg.notification) !== null && _j !== void 0 ? _j : ''), ts: Date.now() });
                    break;
                default:
                    break;
            }
            server.log.info(`Received from the user ${userId} = ${text}`);
        });
        // conferma al client
        ws.send(JSON.stringify({ type: 'ws:connected', userId }));
    });
});
function generateSocketId() {
    return `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export default websocketPlugin;
// ===== CODICI di CHIUSURA WEBSOCKET =====
// 1000 // Normal closure (tutto ok)
// 1001 // Going away (client chiude tab)
// 1006 // Abnormal closure (connessione persa)
// 1008 // Policy violation (tipo token non valido)
// 1011 // Internal error
// in REACT si fa unmount del component quando cambio la route/chiudo la chat della room
// useEffect(() => {
//   // quando entri nella room
//   ws.send(JSON.stringify({ type: "room:join", roomId }));
//   return () => {
//     // quando esci (route change/unmount)
//     if (ws?.readyState === WebSocket.OPEN) {
//       ws.send(JSON.stringify({ type: "room:leave", roomId }));
//     }
//   };
// }, [roomId]);
//# sourceMappingURL=websocket.js.map