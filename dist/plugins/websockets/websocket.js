import {} from '@fastify/websocket';
// import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastify, {} from 'fastify';
import { getUserIdFromJWT, wsGetUserIdFromJWT } from '../../helpers/cookies.js';
function safeSend(ws, payload) {
    try {
        ws.send(payload);
        return true;
    }
    catch (_a) {
        return false;
    }
}
const websocketPlugin = fp(async (server) => {
    // 1) stato condiviso
    server.decorate('wsClientsByUserId', new Map());
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
    server.get('/ws', { websocket: true }, (connOrSocket, req) => {
        var _a;
        // compat: se è { socket } usa .socket, altrimenti è già il ws
        const ws = (_a = connOrSocket.socket) !== null && _a !== void 0 ? _a : connOrSocket;
        const userId = wsGetUserIdFromJWT(req, server);
        if (!userId) {
            ws.close(1008, 'No valid token - start.');
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
            server.log.info({ userId, code, reason: (_a = reason === null || reason === void 0 ? void 0 : reason.toString) === null || _a === void 0 ? void 0 : _a.call(reason), remainingWs: (_b = curUsr === null || curUsr === void 0 ? void 0 : curUsr.size) !== null && _b !== void 0 ? _b : 0 }, 'ws closed');
        });
        ws.on('message', (raw) => {
            var _a, _b;
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
            catch (_c) {
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
                case "cursor:move":
                    server.wsBroadcastExcept(ws, {
                        type: 'cursor:move',
                        userId,
                        x: msg.x,
                        y: msg.y,
                        ts: Date.now()
                    });
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
//# sourceMappingURL=websocket.js.map