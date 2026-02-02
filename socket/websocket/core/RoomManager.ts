import { connectionManager } from "./ConnectionManager";
import { RoomRole, RoomType, RoomPartecipants, RoomInfo } from '../types';
// Come i canali in ft_irc (#channel)

export class RoomManager {
	private rooms = new Map<string, RoomInfo>();
	private userRooms = new Map<string, Set<string>>();

	createRoom(roomId: string, type: RoomType, name: string, ownerId: string) : RoomInfo {
		const room: RoomInfo = {
			roomId,
			type,
			name,
			ownerId,
			createdAt: new Date(),
			partecipants: new Map()
		};
		this.rooms.set(roomId, room);
		return room;
	} 

	joinRoom(socketId: string, roomId: string, role: RoomRole): void {
		// trova la room
		const room = this.rooms.get(roomId);
		if (!room) return;

		const client = connectionManager.getConnection(socketId);
		if (!client) return;
		// crea oggetto partecipante
		const partecipant: RoomPartecipants = {
			socketId: socketId,
			userId: client.userId,
			username: client.username,
			role: role,
			joinedAt: new Date(),
			lastActivity: new Date()
		};
		// aggiungilo alla mappa in roominfo
		room.partecipants.set(socketId, partecipant);
	};

	leaveRoom(socketId: string, roomId: string): void {
		const room = this.rooms.get(roomId);
		if (!room) return;
		const client = connectionManager.getConnection(socketId);
		if (!client) return;
		room.partecipants.delete(socketId);
	};
}

export const roomManager = new RoomManager();