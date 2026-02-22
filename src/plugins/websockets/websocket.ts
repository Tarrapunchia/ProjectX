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

// decorators per le rooms
type WsRoomId  = string
type WsRoomMap  = Map<WsRoomId, WsClientSet>


// Uso il module augmentation di TS per dare il tipo a server.ws: WebSocket
declare module 'fastify' {
    interface FastifyInstance {
        wsClientsByUserId: WsClientsByUserId
        wsRooms: WsRoomMap
        wsRoomBroadcast: (roomId: string, data: unknown, except?: WebSocket) => number
        wsSendToUser: (userId: number, data: unknown) => number
        wsBroadcast: (data: unknown) => number
        wsDisconnectUser: (userId: number, code?: number, reason?: string) => number
        wsBroadcastExcept: (except: WebSocket, data: unknown) => number
    }
}

function safeSend(ws: WebSocket, payload: string) {
    // constrollo se socket sono aperti
    const anyWs = ws as any
    if (anyWs.readyState !== 1) return false

    // mando roba
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
    server.decorate('wsRooms', new Map<string, WsClientSet>())

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

    // il broadcast senza aggiornare anche chi lo invia
    server.decorate('wsBroadcastExcept', (except: WebSocket, data: unknown) => {
        const payload = JSON.stringify(data)
        let sent = 0

        for (const set of server.wsClientsByUserId.values()) {
            for (const client of set) {
                if (client === except) continue
                const anyWs = client as any
                if (anyWs.readyState !== 1) continue
                try { client.send(payload); sent++ } catch {}
            }
        }

        return sent
    })

    server.decorate('wsRoomBroadcast', (roomId: string, data: unknown, except?: WebSocket) => {
        const set = server.wsRooms.get(roomId)
        if (!set || set.size === 0) return 0

        const payload = JSON.stringify(data)
        let sent = 0

        for (const client of set) {
            if (except && client === except) continue
            const anyWs = client as any
            if (anyWs.readyState !== 1) continue
            try { client.send(payload); sent++ } catch {}
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
            ws.close(1008, 'No valid token.')
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
            // rimuovi ws da tutte le rooms
            for (const [roomId, roomSet] of server.wsRooms) {
                if (roomSet.delete(ws) && roomSet.size === 0) {
                    server.wsRooms.delete(roomId)
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
            switch (msg?.type) {
                case "broadcast":
                    server.wsBroadcast({
                        type: 'broadcast',
                        fromUserId: userId,
                        payload: msg.payload ?? null
                    })
                    break;
                case "private":
                    server.wsSendToUser(
                        msg.toUserId,
                        {
                            type: 'private',
                            fromUserId: userId,
                            payload: msg.payload ?? null
                        })
                    break;
                
                case "cursor:move":
                    server.wsBroadcastExcept(
                        ws,
                        {
                            type: 'cursor:move',
                            userId,
                            x: msg.x,
                            y: msg.y,
                            ts: Date.now()
                        })
                    break;
                case 'chat:send':
                    const toUserId = Number(msg.toUserId)
                    const text = String(msg.text ?? '')

                    if (!toUserId || !text.trim()) return

                    server.wsSendToUser(toUserId, {
                        type: 'chat:message',
                        fromUserId: userId,
                        toUserId,
                        text,
                        ts: Date.now(),
                    })
                    break;

                // GESTIONE ROOMS
                case 'room:join': {
                    const roomId = String(msg.roomId)
                    if (!roomId) {
                        server.log.error('No roomId given')
                        return
                    }

                    // aggiungo ai ws della room
                    let set = server.wsRooms.get(roomId)
                    if (!set) {
                        set = new Set<WebSocket>()
                        server.wsRooms.set(roomId, set)
                    }
                    set.add(ws)
                    server.log.info({ userId, roomId, connectionsForRoom: set.size }, 'WS added to room')

                    server.wsSendToUser(userId, {
                        type: 'room:joined',
                        roomId: roomId,
                        userId: userId,
                        ts: Date.now(),
                    })
                }
                    break;
                case 'room:leave': {
                    const roomId = String(msg.roomId)
                    if (!roomId) {
                        server.log.error('No roomId given')
                        return
                    }
                    const curRoom = server.wsRooms.get(roomId)
                    if (curRoom) {
                        curRoom.delete(ws)
                        if (curRoom.size == 0) {
                            server.wsRooms.delete(roomId)
                        }
                    }
                    server.log.info({userId, roomId, reason: 'User exited room', remainingWs: curRoom?.size ?? 0}, 'ws deleted from room')
                
                }

                    break;

                case 'room:message':
                    const roomId = String(msg.roomId ?? '').trim()
                    if (!roomId) return

                    // sicurezza: può scrivere solo se è dentro alla stanza
                    const roomSet = server.wsRooms.get(roomId)
                    if (!roomSet || !roomSet.has(ws)) {
                        safeSend(ws, JSON.stringify({ type: 'error', error: 'NOT_IN_ROOM', roomId }))
                        return
                    }

                    // broadcast agli altri della room
                    server.wsRoomBroadcast(roomId, {
                        type: 'room:message',
                        roomId,
                        fromUserId: userId,
                        payload: msg.payload ?? null,
                        ts: Date.now(),
                    }, ws)

                    break

                // per notifiche
                case 'notify':{
                    const toUserId = Number(msg.toUserId)
                    if (!toUserId) {
                        server.log.error('No User Id given')
                        return
                        }
                    server.wsSendToUser(toUserId,
                        { type: 'notify', notification: String(msg.notification ?? ''), ts: Date.now() }
                        )
                    }
                    break;
                
                // a tutti i connessi
                case 'notifyAll':
                    server.wsBroadcast({ type: 'notify', notification: String(msg.notification ?? ''), ts: Date.now() })
                    break;

                default:
                    break;
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