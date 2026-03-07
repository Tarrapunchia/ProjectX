import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart  from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { setupWebSocket } from './websocket'; // ?
import { db } from './database/index';
import fs from 'fs'; // fs è il modulo File System di Node.js (serve per leggere, scrivere, creare, cancellare file e cartelle)
import { pipeline } from 'stream';  // pipeline è un pacchetto di Node.js che collega due o piu strem e gestisce automaticamente gli errori (per trasferire i dati dal file ricevuto (strem) al file sul disco (strem di scrittura))
import path from 'path'; // path è il modulo di Node.js per gestire e manipolare i percorsi dei file ('path.join' unisce piu parti di un percorso in modo sicuro, indipendentemente dal sistema operativo)
import zlib from 'zlib'; // pacchetto per compattare un file prima di 



const app = Fastify({
	logger: true,  // logger automatici
	caseSensitive: false,
	// trustProxy: true,  // Se dietro Nginx ??
	ignoreTrailingSlash: true,
});

// "Attacca" il database all'oggetto app di Fastify 
app.decorate('db', db)

declare module 'fastify' {
	interface FastifyInstance {
		db: typeof db;
	}
	interface FastifyRequest {
		file: typeof import('@fastify/multipart').fastifyMultipart['file'];
		files: typeof import ('@fastify/multipart').fastifyMultipart['files'];
	}
}

// === INSTALLAZIONE PLUGIN ===
// Plugin Static (serve STATIC FILE)
await app.register(fastifyStatic, {
	root: path.join(__dirname, '..', 'uploads'),
	prefix: '/files/',
});

// Plugin WebSocket
await app.register(fastifyWebsocket);
// --> Ora websocket è disponibile

await app.register(fastifyMultipart, {limits:{fileSize: 100000000}}); // massimo file da 100MB


// Plugin JWT (JASON WEB TOKEN )
await app.register(fastifyJwt, {
	secret: "%pRojeCTx$"
});

// 	================ UPLOAD =================
app.post('/upload', async function (request, reply) {
	const { clientId, projectId, organizationId } = request.body as {clientId: string, projectId: string, organizationId: string };
	const file = await request.file();
	const allowedTypes = ['image/png', 'application/pdf']; // piu tipi ? tutti ??s
	if (!file) {
		return reply.code(400).send({ error: 'No file uploaded' });
	}
	if (file.file.truncated) {
		return reply.code(400).send({ error: 'File too large' });
	}
	if (!allowedTypes.includes(file.mimetype)) {
		return reply.code(400).send({ error: 'Not supported type of file'});
	}
	// e se il file dovesse andare solo nella cartella organizationId ?
	const orgDir = path.join('uploads', organizationId, projectId);
	if (!fs.existsSync(orgDir))
		fs.mkdirSync(orgDir, { recursive: true });
	const client = await app.db.clients.findById((clientId)); // connessione a database 
	if (!client || client.role != 'project manager') {
		return reply.code(403).send({ error: 'You are not authorized '});
	}
	// anche qui metto subito in projectId senza considerare che potrebbe essere in organizationId
	const upload_path = path.join('socket', '..', 'uploads/organizationId/projectId', file.filename);
	pipeline(
		file.file,
		fs.createWriteStream(upload_path),
		(err) => {
			if (err) {
				return reply.code(400).send({ error: err});
			}
		}
	);
});

// ===== RICHIESTA FILE =====
app.get<{ Params: { filename: string, clientId: string } }>('/files/:filename', async (request, reply) => {
	const filePath = path.join('uploads', request.params.filename);
	// permessi da gestire 
	const client = await app.db.clients.findById((request.params.clientId));
	if (!client || client.role != 'project manager') {
		return reply.code(403).send({ error: 'You are not authorized '});
	}
	if (fs.existsSync(filePath)) {
		return reply.sendFile(filePath); // il file deve esistere nella cartella
	} else {
		return reply.code(404).send({ error: 'File not found' });
	}
});
// ====== DELETE FILE ======
app.delete<{ Params: {filename: string, clientId: string} }>('/files:filename', async (request, reply) => {
	const filePath = path.join('uploads', request.params.filename);
	// permessi da gestire 
	const client = await app.db.clients.findById((request.params.clientId));
	if (!client || client.role != 'project manager') {
		return reply.code(403).send({ error: 'You are not authorized '});
	}
	fs.unlink(filePath, (err) => {
		if (err)
			return reply.code(400).send({ error: 'Failed to delete file' });
		return reply.code(400).send({ success: true });
	})
});


// COSA MANCA LATO CLIENT:
// Validazione lato client (React): tipo, dimensione, formato.
// Anteprima file (React): mostra preview immagini/PDF.
// Barra di progresso upload (React): usa fetch/XHR/axios con onProgress.

// =========== LOGIN (bozza) ===========
app.post('/api/login', {
	config: {
		rateLimit: {
			max: 5,
			timeWindow: '15 minutes'
		}
	}
}, async (request, reply) => {
	// login logic..
	const { username, password } = request.body as { username: string, password: string };

	if (!username || !password) {
		return reply.code(400).send({error: 'Username and password are mandatory!'});
	}
	// verifica credenziali nel database:
	const user = await app.db.users.findByUsername(username);

	if (!user || !user.password) {
		return reply.code(400).send({error: 'Non valid credential!'});
	}
	
	// genera JWT Token
	const token = app.jwt.sign(
		{
			userId: user.id,
			username: user.username
		},
		{ expiresIn: '24h' }
	);	
	
	// risposta al client con il token 
	return reply.send({
		success: true,
		token: token,
		user: {
			id: user.id,
			username: user.username
		}
	});
});


// === WEBSOCKET (real-time) ===
await setupWebSocket(app);

// === START SERVER ===
await app.listen({ port: 3000 });


