import { type WebSocket } from '@fastify/websocket';
import { type FastifyPluginAsync } from 'fastify';
type WsClientSet = Set<WebSocket>;
type WsClientsByUserId = Map<number, WsClientSet>;
type WsRoomId = string;
type WsRoomMap = Map<WsRoomId, WsClientSet>;
declare module 'fastify' {
    interface FastifyInstance {
        wsClientsByUserId: WsClientsByUserId;
        wsRooms: WsRoomMap;
        wsRoomBroadcast: (roomId: string, data: unknown, except?: WebSocket) => number;
        wsSendToUser: (userId: number, data: unknown) => number;
        wsBroadcast: (data: unknown) => number;
        wsDisconnectUser: (userId: number, code?: number, reason?: string) => number;
        wsBroadcastExcept: (except: WebSocket, data: unknown) => number;
    }
}
declare const websocketPlugin: FastifyPluginAsync;
export default websocketPlugin;
//# sourceMappingURL=websocket.d.ts.map