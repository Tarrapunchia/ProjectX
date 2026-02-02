// import { type WebSocket } from '@fastify/websocket';
// import { type ClientInfo } from './types.js';
// import type { FastifyInstance } from 'fastify';

// // Come gestione ft_set in ft_irc

// export class ConnectionManager {
// 	private connections = new Map<string, ClientInfo>();

// 	addConnection(id: string, socket: WebSocket, userId: Number) {
// 		this.connections.set(id, {
// 			socketId: id,
// 			socket: socket,
//             userId: userId,
// 			connectedAt: new Date(),
// 			lastActivity: new Date()
// 		});
// 	}

// 	// aggiorna ClientInfo appena fatto il login
// 	updateUserInfo(socketId: string, Id: string, name: string, fastify: FastifyInstance): void {
// 		const client = this.connections.get(socketId);
// 		if (client) {
// 			client.userId = Id;
// 			client.username = name;
// 			client.lastActivity = new Date();
// 		}
// 	}

// 	getConnection(id:string) {
// 		return this.connections.get(id);
// 	}

// 	removeConnection(id: string) {
// 		this.connections.delete(id);
// 	}
// }

// export const connectionManager = new ConnectionManager();