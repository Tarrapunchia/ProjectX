import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart  from '@fastify/multipart';
import { setupWebSocket } from './websocket'; // ?
import { db } from './database/index';
import fs from 'fs'; // fs è il modulo File System di Node.js (serve per leggere, scrivere, creare, cancellare file e cartelle)
import pump from 'pump';  // pump è un pacchetto npm che collega due o piu strem e gestisce automaticamente gli errori (per trasferire i dati dal file ricevuto (strem) al file sul disco (strem di scrittura))
import path from 'path'; // path è il modulo di Node.js per gestire e manipolare i percorsi dei file ('path.join' unisce piu parti di un percorso in modo sicuro, indipendentemente dal sistema operativo)



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

// Plugin WebSocket
await app.register(fastifyWebsocket);
// --> Ora websocket è disponibile

await app.register(fastifyMultipart, {limits:{fileSize: 100000000}}); // massimo file da 100MB


// Plugin JWT (JASON WEB TOKEN )
await app.register(fastifyJwt, {
	secret: "%pRojeCTx$"
});

// =========== UPLOAD ============
app.post('/upload', async function (request, reply) {
	const file = await request.file();
	if (!file) {
		return reply.code(400).send({ error: 'No file uploaded' });
	}
	if (file.file.truncated) {
		return reply.code(400).send({ error: 'File too large' });
	}
	const upload_path = path.join('socket', '..', 'uploads', file.filename); // per ora finisce in /uploads
	await pump(file.file, fs.createWriteStream(upload_path));
});

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


// REST API (Fabio ?)
// Major: A public API to interact with the database with a secured API key, rate
// limiting, documentation, and at least 5 endpoints:
// ◦GET /api/{something}
// ◦POST /api/{something}
// ◦PUT /api/{something}
// ◦DELETE /api/{something}

// === PLUGIN NON IMPLEMENTATI === (gia installati qui )
// import fastifyMultipart from '@fastify/multipart';
// import fastifyStatic from '@fastify/static';
// import fastifyRateLimit from '@fastify/rate-limit'; // plugin

// Plugin Multipart (UPLOAD FILE)
// await app.register(fastifyMultipart);

// // Plugin Static (serve STATIC FILE)
// await app.register(fastifyStatic, {
// 	root: '/public'
// });

// // Plugin RATE LIMIT (protection from SPAM)
// await app.register(fastifyRateLimit, {
// 	global: false,  // Applicato solo dove specificato
// 	max: 100,
// 	timeWindow: '1 minute'
// });

