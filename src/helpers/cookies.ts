import type { FastifyInstance } from "fastify"

function setAuthCookie(reply: any, token: string) {
  const isProd = process.env.NODE_ENV === 'production'

  reply.setCookie('session', token, {
    httpOnly: true,
    secure: isProd,                     // in dev: false
    sameSite: isProd ? 'none' : 'lax', // se prod e cross-site -> none
    path: '/',
    maxAge: 60 * 60 * 24, // 1 giorno,
  })
}

function getUserIdFromJWT(req: any, res: any, fastify: FastifyInstance) {
  const token = req.cookies?.session
  let userId: number | null = null
  fastify.log.info("GETUSERJWT")

    if (token) {
        try {
            const payload = fastify.jwt.verify<{ userId: number }>(token)
            userId = payload.userId
            fastify.log.info("GETUSERJWT - has token -> userId " + userId)
        } catch {
        // token scaduto/invalid: logout comunque? boh, penso di si
            if (res) {
              res.code(400)
              res.send({ error: 'Invalid token' })
            }
            fastify.log.error('GETUSERJWT - problema su estrazuione')
            return null
        }
    }
    return userId
}

function wsGetUserIdFromJWT(req: any, fastify: FastifyInstance) {
  const token = req.cookies?.session
  let userId: number | null = null
  fastify.log.info("GETUSERJWT")

    if (token) {
        try {
            const payload = fastify.jwt.verify<{ userId: number }>(token)
            userId = payload.userId
            fastify.log.info("GETUSERJWT - has token -> userId " + userId)
        } catch {
        // token scaduto/invalid: logout comunque? boh, penso di si
            fastify.log.error('GETUSERJWT - problema su estrazuione')
            return null
        }
    }
    return userId
}

export {
    setAuthCookie,
    getUserIdFromJWT,
    wsGetUserIdFromJWT
}