import fastify from 'fastify'
import api from './routes/api/api.js'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
import formBody from '@fastify/formbody'
import prismaPlugin from './plugins/prismaPlugin.js'
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
// import AuthGoogle from './routes/google/auth.js'

const PORT = 5000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
})

const start = () => {
		server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
			if (err) { server.log.error(err), process.exit(-1) };
			console.log(`Server listening at ${address}`)
		}
	)
}

await server.register(swagger, {
  openapi: {
	info: {
	  title: 'Transcendence',
	  description: 'Backend Fastify',
	  version: '1.0.0'
	},
	// when dockerized
	// servers: [
	//   { url: `localhost:${PORT}`, description: 'dev' }
	// ]
  }
})

// @fastify/swagger-ui → espone la UI
await server.register(swaggerUi, {
  routePrefix: '/docs', // → http://localhost:5000/docs
  uiConfig: {
	docExpansion: 'list',
	deepLinking: false
  },
  staticCSP: true
  // transformSpecification, transformSpecificationClone… se servissero
})

await server.register(formBody)
await server.register(prismaPlugin)
await server.register(fastifyWebsocket);
await server.register(fastifyJwt, {
	secret: "%pRojeCTx$"
});
await server.register(rateLimit, {
  global: false, // così lo usi per singola route
})
await server.register(cookie, {
//   secret: process.env.COOKIE_SECRET, // opzionale, se si vuol usare signed cookies
})
// await fastify.register(cors, {			// per quando BE e FE non saranno su stessa porta
//   origin: ['http://localhost:5173'],		// indirizzo FE
//   credentials: true,
// })
// await server.register(AuthGoogle, { prefix: 'auth'})

server.register(api, { prefix: 'api'})
server.register(fastifyStatic, {
	root: path.join(__dirname, 'public'),
})

// route catch-all
server.setNotFoundHandler((request, reply) => {
  const url = request.raw.url || ''

  if (url.startsWith('/api')) {
	// vere 404 per le API
	reply.code(404).send({ error: 'Not found' })
  } else {
	return reply.sendFile('./public/index.html')
  }
})

start()