import fastify from 'fastify';
import api from './routes/api/api.js';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import formBody from '@fastify/formbody';
import prismaPlugin from './plugins/prismaPlugin.js';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fs from 'fs';
import websocketPlugin from './plugins/websockets/websocket.js';
import AuthGoogle from './routes/google/auth.js';
import fastifyMultipart from '@fastify/multipart';
const PORT = 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// per TLS (metto certs in ./certs, per ora generati con mkcert, forse conviene
// fare reverse proxy da nginx e poi lasciare fastify normale?)
const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'localhost.pem')),
};
const server = fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true
            }
        }
    },
    ignoreTrailingSlash: true,
    caseSensitive: false,
    // per https
    https: httpsOptions
});
const start = () => {
    server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            server.log.error(err), process.exit(-1);
        }
        ;
        console.log(`Server listening at ${address}`);
    });
};
await server.register(swagger, {
    openapi: {
        info: {
            title: 'Transcendence',
            description: 'Backend Fastify',
            version: '1.0.0'
        },
        // when dockerized
        servers: [
            { url: `https://localhost:${PORT}`, description: 'dev https' }
        ]
    }
});
// @fastify/swagger-ui → espone la UI
await server.register(swaggerUi, {
    routePrefix: '/docs', // → http://localhost:5000/docs
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    },
    staticCSP: true
    // transformSpecification, transformSpecificationClone… se servissero
});
// TODO - rivedere bene cors policy
// per ora attivo per i test per il ws
await server.register(cors, {
    origin: [
        'https://localhost:5000',
        'https://127.0.0.1:5000',
        'http://localhost:5173', // tutto FE
        'http://127.0.0.1:5173',
        'https://localhost:5173',
        'https://127.0.0.1:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});
await server.register(fastifyJwt, {
    secret: "%pRojeCTx$"
});
await server.register(rateLimit, {
    global: false, // così lo usi per singola route
});
await server.register(cookie, {
//   secret: process.env.COOKIE_SECRET, // opzionale, se si vuol usare signed cookies
});
await server.register(formBody);
await server.register(prismaPlugin);
await server.register(fastifyWebsocket);
await server.register(websocketPlugin);
await server.register(AuthGoogle, { prefix: 'auth' });
await server.register(fastifyMultipart, { limits: { fileSize: 100000000 } }); // massimo file da 100MB
server.register(api, { prefix: 'api' });
server.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
});
// route catch-all
server.setNotFoundHandler((request, reply) => {
    const url = request.raw.url || '';
    if (url.startsWith('/api')) {
        // vere 404 per le API
        reply.code(404).send({ error: 'Not found' });
    }
    else {
        return reply.sendFile('./public/index.html');
    }
});
start();
//# sourceMappingURL=server.js.map