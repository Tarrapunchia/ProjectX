import {} from '@fastify/websocket';
import {} from './types.js';
// Come gestione ft_set in ft_irc
export class ConnectionManager {
    constructor() {
        this.connections = new Map();
    }
    addConnection(id, socket, userId) {
        this.connections.set(id, {
            socketId: id,
            socket: socket,
            userId: userId,
            connectedAt: new Date(),
            lastActivity: new Date()
        });
    }
    // aggiorna ClientInfo appena fatto il login
    updateUserInfo(socketId, Id, fastify) {
        const client = this.connections.get(socketId);
        if (client) {
            client.userId = Id;
            // client.username = name;
            client.lastActivity = new Date();
            client.connectedAt = new Date();
        }
    }
    getConnection(id) {
        return this.connections.get(id);
    }
    removeConnection(id) {
        this.connections.delete(id);
    }
}
export const connectionManager = new ConnectionManager();
//# sourceMappingURL=connectionManager.js.map