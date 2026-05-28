import { ChatMessage } from "../types";
// Riceve messaggio --> Parse JSON --> routing
// Switch su type (come switch su PRIVMS, JOIN ecc...)

export function handleMessage(socketId: string, message: ChatMessage) {
	
}

// ======= ESEMPIO FLUSSO DI UN MESSAGGIO =======

// 1. Client → socket.send(JSON.stringify({
//      type: 'chat_message',
//      payload: { roomId: 'general', message: 'ciao' }
//    }))

// 2. Server → socket.on('message') cattura il dato

// 3. MessageHandler.handleMessage(socketId, data)
//    ├─ Parse JSON
//    ├─ Vede type = 'chat_message'
//    └─ Chiama handleChatMessage()

// 4. Verifica: "User1 è nella room general?"
//    └─ SÌ → procedi

// 5. Broadcaster.broadcastToRoom('general', message)
//    ├─ Prende lista di tutti gli utenti in 'general'
//    └─ Per ognuno:
//        ConnectionManager.getConnection(socketId)
//        socket.send(JSON.stringify(message))

// 6. Altri client ricevono il messaggio in tempo reale
