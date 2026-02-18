import { type WebSocket } from '@fastify/websocket';
import { type FastifyPluginAsync } from 'fastify';
type WsClientSet = Set<WebSocket>;
type WsClientsByUserId = Map<number, WsClientSet>;
declare module 'fastify' {
    interface FastifyInstance {
        wsClientsByUserId: WsClientsByUserId;
        wsSendToUser: (userId: number, data: unknown) => number;
        wsBroadcast: (data: unknown) => number;
        wsDisconnectUser: (userId: number, code?: number, reason?: string) => number;
    }
}
declare const websocketPlugin: FastifyPluginAsync;
export default websocketPlugin;
//# sourceMappingURL=websocket.d.ts.map