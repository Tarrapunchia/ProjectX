// Come fare send() a tutti i membri di un canale
import { text } from "node:stream/consumers";
import { connectionManager } from "./ConnectionManager"
import { roomManager } from "./RoomManager";

export function broadcastToAll(message: any, excudeSocketId: string) {
	const allConnection = connectionManager.getAllConnection();

	// per ogni coppia chiave-valore (id, clientInfo)
	allConnection.forEach((client, id) => {
		if (id != excudeSocketId) { // controlla anche stato conessione ?
			client.socket.send(JSON.stringify(message));
		}
	});
}

export function broadcastToRoom(roomId: string, message: any, excludeSocketId?: string) {
	// const members = roomManager.getRoomMembers(roomId);

	// members.forEach(socketId => {
	// 	if (socketId != excludeSocketId) {
	// 		const client = connectionManager.getConnection(socketId);

	// 		if (client && client.socket.readyState === WebSocket.OPEN) {
	// 			const text = typeof message === 'string'
	// 				? message
	// 				: JSON.stringify(message);

	// 			client.socket.send(text);
	// 		}
	// 	}
	// });
}

export function sendToSocket(socketId: string, message: any) {
	const client = connectionManager.getConnection(socketId);

	if (client ) { // && client.socket.readyState === WebSocket.OPEN
		const data = typeof message === 'string'
			? message
			: JSON.stringify(message);
		client.socket.send(data);
	}
}

// esempio di utilizzo:
// broadcastToAll({
//     type: 'chat',
//     text: 'Ciao',
//     userId: 123
// }, socketId);