import { WebSocket } from '@fastify/websocket';
import { ClientInfo } from '../types';

// Come gestione ft_set in ft_irc

export class ConnectionManager {
	private connections = new Map<string, ClientInfo>();

	addConnection(id: string, socket: WebSocket) {
		this.connections.set(id, {
			socketId: id,
			socket: socket,
			connectedAt: new Date(),
			lastActivity: new Date()
		});
	}

	// aggiorna ClientInfo appena fatto il login
	updateUserInfo(socketId: string, Id: string, name: string): void {
		const client = this.connections.get(socketId);
		if (client) {
			client.userId = Id;
			client.username = name;
			client.lastActivity = new Date();
		}
	}

	getConnection(id:string) {
		return this.connections.get(id);
	}

	getAllConnection() {
		return this.connections;
	}

	removeConnection(id: string) {
		this.connections.delete(id);
	}
}

export const connectionManager = new ConnectionManager();



// Istanza UNICA , tutti i file con ( import { ConnectionManager} from ..)
// RICEVONO LA STESSA IDENTICA ISTANZA , tutti hanno bisogno di accedere
// alle stesse CONNESSIONI !!
// Come una VARIABILE GLOBALE condivisa

// SE NON usassi l'ISTANZA SINGLETON ogni file creerebbe la sua MAP separata
// --> Le CONNESSIONI NON sarebbero CONDIVISE !!

// L'ISTANZA ESPORTATA garantisce che tutto il tuo server usi la stessa RUBRICA di connessioni


// === oggetto WEBSOCKET ===
// Cosa contiene concretamente un oggetto WebSocket?
// Internamente ha:

// 1. La connessione TCP sottostante (come il tuo fd in C++)
// 2. Lo stato della connessione (aperta, chiusa, in chiusura)
// 3. Buffer per i dati in entrata/uscita
// 4. Metodi per inviare/ricevere messaggi
// 5. Event handlers per messaggi, chiusura, errori


// client si connette -->
// fastify.get('/ws', { websocket: true}, (socket: WebSocket)[oggetto della classe Websocket] => {
	// const clientId = generateId();
	// connectionManager.addConnection(clientId, socket); [passi quell'oggetto] 
	
	// Quando arriva un messaggio da questo client -->
	// socket.on('message', (data) => {
	// 	socket.send("RICEVUTO!"); [Risponde al client]
	// })
//});

// PER OTTENERE QUEL CLIENT -->
// const client = connectionManager.getConnection(..id);
// COSÌ OTTIENI l'oggetto websocket salvato, per avere socket per comunicare--> ' client.socket.send() ecc.. '