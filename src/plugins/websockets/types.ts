// import { type WebSocket } from '@fastify/websocket';
// // Definizioni typescript ( come struct Client, struct Channel in C++ )

// // ======== CONNECTIONS ========
export interface ClientInfo {
	socketId: string;
	socket: WebSocket;
	userId: Number;
	email?: string;
	connectedAt: Date;
	lastActivity: Date;
}

// // ========= ROOM ==========
// export enum RoomRole {
// 	PROJECT_MANAGER = 'project-manager',
// 	EDITOR = 'editor',
// 	VIEWER = 'viewer'
// }

// export enum RoomType {
// 	DOCUMENT = 'document',
// 	CHAT = 'chat',
// 	PROJECT = 'project' // (interfaccia) dove puoi vedere le task di un progetto ? 
// }

// export interface RoomPartecipants {
// 	socketId: string,
// 	userId?: string,
// 	username?: string,
// 	role: RoomRole,
// 	joinedAt: Date,
// 	lastActivity: Date
// }

// export interface RoomInfo {
// 	roomId: string,
// 	type: RoomType,
// 	name: string,
// 	ownerId: string,
// 	createdAt: Date,
// 	partecipants: Map<string, RoomPartecipants>,
// }

