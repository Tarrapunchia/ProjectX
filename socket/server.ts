import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import { setupWebSocket } from './websocket'; // ?

const app = Fastify({
	logger: true,  // logger automatici
	caseSensitive: false,
	// trustProxy: true,  // Se dietro Nginx ??
	ignoreTrailingSlash: true,
});

// === INSTALLAZIONE PLUGIN ===

// Plugin WebSocket
await app.register(fastifyWebsocket);
// --> Ora websocket è disponibile


// Plugin JWT (JASON WEB TOKEN )
await app.register(fastifyJwt, {
	secret: "%pRojeCTx$"
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

