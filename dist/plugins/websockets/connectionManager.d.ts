import { type WebSocket } from '@fastify/websocket';
import { type ClientInfo } from './types.js';
import type { FastifyInstance } from 'fastify';
export declare class ConnectionManager {
    private connections;
    addConnection(id: string, socket: WebSocket, userId: Number): void;
    updateUserInfo(socketId: string, Id: number, fastify: FastifyInstance): void;
    getConnection(id: string): ClientInfo | undefined;
    removeConnection(id: string): void;
}
export declare const connectionManager: ConnectionManager;
//# sourceMappingURL=connectionManager.d.ts.map