import { WebSocket } from '@fastify/websocket';
// Definizioni typescript ( come struct Client, struct Channel in C++ )

// ======== CONNECTIONS ========
export interface ClientInfo {
	socketId: string;
	socket: WebSocket;
	userId?: string;
	username?: string;
	connectedAt: Date;
	lastActivity: Date;
}

// ========= ROOM ==========
export enum RoomRole {
	PROJECT_MANAGER = 'project-manager',
	EDITOR = 'editor',
	VIEWER = 'viewer'
}

export enum RoomType {
	DOCUMENT = 'document',
	CHAT = 'chat',
	PROJECT = 'project' // (interfaccia) dove puoi vedere le task di un progetto ? 
}

export interface RoomPartecipants {
	socketId: string,
	userId?: string,
	username?: string,
	role: RoomRole,
	joinedAt: Date,
	lastActivity: Date
}

export interface RoomInfo {
	roomId: string,
	type: RoomType,
	name: string,
	ownerId: string,
	createdAt: Date,
	partecipants: Map<string, RoomPartecipants>,
}

// ===== MESSAGES =====
export interface Message {
	type: string;
	action: string;
	payload: any;
	metadata: MessageMetadata;
}

export interface MessageMetadata {
	messageId: string;
	senderId: string;
	senderUsername: string;
	timestamp: number;
	roomId?: string; // per chat room
	targetUserId?: string; // per chat privata
	documentId?: string;
}

// ======== CHAT MESSAGE =========
export interface ChatMessage extends Message {
	type: 'chat';
	action: 'send' | /* 'edit' | */ 'delete';
	payload: ChatPayload;
}

export interface ChatPayload {
	text: string;
	attachments?: string[] // path da filesystem, URL di file (per aggiungere file al messaggio)
	replyToId?: string; // risposta a quel messaggio con ID 'sring'  
}
