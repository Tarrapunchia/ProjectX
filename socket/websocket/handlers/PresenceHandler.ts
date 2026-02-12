import { pathToFileURL } from "node:url";
import { broadcastToRoom, sendToSocket } from "../core/Broadcaster";
import { connectionManager } from "../core/ConnectionManager";
import { roomManager } from "../core/RoomManager";
import { PresenceMessage, RoomRole } from "../types";
import { userInfo } from "node:os";
import { METHODS } from "node:http";
import { timeStamp } from "node:console";

export function handlePresence(socketId: string, message: PresenceMessage) {
	
	const client = connectionManager.getConnection(socketId);
	if (!client)
		return;
	const roomId = message.metadata.roomId;
	switch(message.action) {
		case "join":
			if (!roomId) {
				sendToSocket(socketId, {
					type: 'error',
					message: 'roomId is needed !'
				});
				return;
			}
			// cosi pero il role lo manda il client con il messaggio!!
			roomManager.joinRoom(socketId, roomId, message.payload.role || RoomRole.VIEWER);
			broadcastToRoom(roomId, {
				type: 'presence',
				action: 'user_joined',
				payload: {
					userId: client.userId,
					username: client.username,
					status: 'online'
				},
				metadata: {
					messageId: `presence_${Date.now()}`,
					senderId: client.userId || '',
					senderUsername: client.username || '',
					timestamp: Date.now(),
					roomId: roomId
				}
			}, socketId);
			
			break;
		case "leave":
			if (!roomId) {
				sendToSocket(socketId, {
					type: 'error',
					message: 'roomId is needed !'
				});
				return;
			}
			roomManager.leaveRoom(socketId, roomId);
			broadcastToRoom(roomId, {
				type: 'presence',
				action: 'user_left',
				payload: {
					userId: client.userId,
					username: client.username,
					status: 'offline'
				},
				metadata: {
					messageId: `presence_${Date.now()}`,
					senderId: client.userId || '',
					senderUsername: client.username || '',
					timestamp: Date.now(),
					roomId: roomId
				}
			}, socketId); // lo status dovrebbe essere il messsaggi ìo "utente ha abbandonato",  per ora c'e 'out'
			break;
		case "typing":
			if (roomId){
				broadcastToRoom(roomId, {
					type: 'presence',
					action: 'typing',
					payload: {
						userId: client.userId,
						username: client.username,
						isTyping: message.payload.isTyping ?? true
					},
					metadata: {
						messageId: `presence_${Date.now()}`,
						senderId: client.userId || '',
						senderUsername: client.username || '',
						timestamp: Date.now(),
						roomId: roomId
					}
				}, socketId);
			} else if (message.metadata.targetUserId) {
				const targetSocketId = connectionManager.getSocketIdByUserId(message.metadata.targetUserId);
				if (targetSocketId)
					sendToSocket(message.metadata.targetUserId, message.payload);
			}

	}
}