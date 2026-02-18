import {type WebSocket } from '@fastify/websocket'
// import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin'
import fastify, { type FastifyInstance, type FastifyPluginAsync, type FastifyReply, type FastifyRequest } from 'fastify'
import { getUserIdFromJWT, wsGetUserIdFromJWT } from '../../helpers/cookies.js'

// integro il connection manager nel server, in modo che quando e' su viene stoccato al suo interno assieme
// alle funzioni di utilita'

// e' un set e non una connessione unica perche' potrebbe avere piu' schede aperte
type WsClientSet = Set<WebSocket>
type WsClientsByUserId = Map<number, WsClientSet>

// Uso il module augmentation di TS per dare il tipo a server.ws: WebSocket
declare module 'fastify' {
    interface FastifyInstance {
        wsClientsByUserId: WsClientsByUserId
        wsSendToUser: (userId: number, data: unknown) => number
        wsBroadcast: (data: unknown) => number
        wsDisconnectUser: (userId: number, code?: number, reason?: string) => number 
    }
}

function safeSend(ws: WebSocket, payload: string) {
    try {
        ws.send(payload)
        return true
    } catch {
        return false
    }
}

const websocketPlugin: FastifyPluginAsync = fp(async (server) => {
    // 1) stato condiviso
    server.decorate('wsClientsByUserId', new Map<number, WsClientSet>())

    // 2) helpers
    server.decorate('wsSendToUser', (userId: number, data: unknown) => {
        const set = server.wsClientsByUserId.get(userId)
        if (!set || set.size === 0) return 0

        const payload = JSON.stringify(data)
        let sent = 0

        for (const ws of set) {
            if (safeSend(ws, payload)) sent++
        }
        return sent
    })

    server.decorate('wsBroadcast', (data: unknown) => {
        const payload = JSON.stringify(data)
        let sent = 0

        for (const set of server.wsClientsByUserId.values()) {
            for (const ws of set) {
                if (safeSend(ws, payload)) sent++
            }
        }
        return sent
    })

    server.decorate('wsDisconnectUser', (userId: number, code = 1000, reason = 'bye') => {
        const set = server.wsClientsByUserId.get(userId)
        if (!set || set.size === 0) return 0

        let closed = 0
        for (const ws of set) {
            try {
                ws.close(code, reason)
                closed++
            } catch {
                // ignore
            }
        }
        server.wsClientsByUserId.delete(userId)
        return closed
    })

    // 3) route WS
    server.get('/ws', { websocket: true }, (connOrSocket: any, req) => {
        // compat: se è { socket } usa .socket, altrimenti è già il ws
        const ws: WebSocket = connOrSocket.socket ?? connOrSocket

        const userId = wsGetUserIdFromJWT(req, server)
        if (!userId) {
            ws.close(1008, 'No valid token - start.')
            return
        }

        // faccio l'add alla mappa
        let set = server.wsClientsByUserId.get(userId)
        if (!set) {
            set = new Set<WebSocket>()
            server.wsClientsByUserId.set(userId, set)
        }
        set.add(ws)
        server.log.info({ userId, connectionsForUser: set.size }, 'WS connected')

        ws.on('close', (code: number, reason: Buffer) => {
            const curUsr = server.wsClientsByUserId.get(userId)
            if (curUsr) {
                curUsr.delete(ws)
                if (curUsr.size == 0) {
                    server.wsClientsByUserId.delete(userId)
                }
            }
            server.log.info({userId, code, reason: reason?.toString?.(), remainingWs: curUsr?.size ?? 0}, 'ws closed')
        })

        ws.on('message', (raw: any) => {
            // TEST
            const text = raw.toString()
            if (text === 'ping') { ws.send(JSON.stringify({ type: 'pong' })); return }

            let msg: any
            try {
                msg = JSON.parse(text)
            } catch {
                server.log.info({ userId, text }, 'WS non-JSON msg')
                return
            }

            if (msg?.type == "broadcast") {
                server.wsBroadcast({
                    type: 'broadcast',
                    fromUserId: userId,
                    payload: msg.payload ?? null
                })
            }

            if (msg?.type == 'private') {
                server.wsSendToUser(
                    msg.toUserId,
                    {
                        type: 'private',
                        fromUserId: userId,
                        payload: msg.payload ?? null
                    })
            }

            server.log.info(`Received from the user ${userId} = ${text}`)
        })

        // conferma al client
        ws.send(JSON.stringify({ type: 'ws:connected', userId }))
    })
})

function generateSocketId(): string {
	return `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default websocketPlugin

// ===== CODICI di CHIUSURA WEBSOCKET =====

// 1000 // Normal closure (tutto ok)
// 1001 // Going away (client chiude tab)
// 1006 // Abnormal closure (connessione persa)
// 1008 // Policy violation (tipo token non valido)
// 1011 // Internal error