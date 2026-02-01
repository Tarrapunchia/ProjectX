import { FastifyInstance } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import { connectionManager } from './core/ConnectionManager';
import { roomManager } from './core/RoomManager';

interface WebSocketQuery {
	token?: string
}

export async function setupWebSocket(app: FastifyInstance) { 
	app.get<{ Querystring: WebSocketQuery }>('/ws', { websocket: true }, async (socket: WebSocket, request) => {
		const token = request.query.token as string;

		// continuo solo se l'utente ha fatto login
		// TUTTI GLI UTENTI DEVONO ESSERE AUTENTICATI
		if (!token) {
			socket.close(1008, 'Token not found!');
			return;
		}
		try {
			const decoded = app.jwt.verify(token) as { userId: string, username: string };
			const { userId, username } = decoded;

			const socketId = generateSocketId();
			connectionManager.addConnection(socketId, socket);
			connectionManager.updateUserInfo(socketId, userId, username);

			socket.on('close', () => {
				connectionManager.removeConnection(socketId)
			});
		} catch (error) {
			socket.close(1008, 'Non valid token');
		}
	});

}

function generateSocketId(): string {
	return `socket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}