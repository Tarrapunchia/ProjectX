import { FastifyInstance } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import { connectionManager } from './core/ConnectionManager';
import { roomManager } from './core/RoomManager';
import { broadcastToAll } from './core/Broadcaster';

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

			// =========== EVENTI ============

			// Messaggio ricevuto dal client
			socket.on('message', (rawData: Buffer | string) => {
				const text = typeof rawData === 'string'
					? rawData
					: rawData.toString();
				// ora hai un messaggio da client CHE FARCI ??
				try {
					const message = JSON.parse(text);

					switch (message.type) { // leggo il campo type dalle definizioni Typescript interfaccia messaggio 
						// decido quale handler chiamare
						// da decidere che tipo di messaggi gestire
						case 'chat_massage':
							break;
						case 'join_room': // notifiche a room ?
							break;
					}
				} catch (error) {
					console.error('Invakid JSON received:', error);
					console.error('Raw text:', text);

					socket.send(JSON.stringify({
						type: 'error',
						message: 'Invalid message format'
					}));
				}
			});

			// Connessione chiusa
			socket.on('close', (code: number, reason: Buffer) => {
				// per logs errori
				console.log(`${username} disconnected with code: ${code} and reason: ${reason.toString()}`)
				
				// Togli il client da tutte le room !

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

// ===== CODICI di CHIUSURA WEBSOCKET =====

// 1000 // Normal closure (tutto ok)
// 1001 // Going away (client chiude tab)
// 1006 // Abnormal closure (connessione persa)
// 1008 // Policy violation (tipo token non valido)
// 1011 // Internal error