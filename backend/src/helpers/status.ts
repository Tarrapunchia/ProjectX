import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fastifyMetrics from 'fastify-metrics'

const Status: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // GET /metrics
    await fastify.register(fastifyMetrics.default ?? fastifyMetrics, {
      endpoint: '/metrics'
    })

    fastify.get('/health', async (_req: FastifyRequest, res: FastifyReply) => {
    res: res.code(200);
    return {
      status: 'ok',
      service: 'backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/ready', async (_req: FastifyRequest, res: FastifyReply) => {
    try {
      // Real readiness check:
      // Prisma must be connected and at least one core application table must exist.
      await fastify.prisma.user.count();

      res: res.code(200);
      return {
        status: 'ready',
        database: 'up',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      fastify.log.error(error);

      res: res.code(503);
      return {
        status: 'not_ready',
        database: 'down',
        timestamp: new Date().toISOString(),
      };
    }
  });

  fastify.get('/status', async (_req: FastifyRequest, res: FastifyReply) => {
    let dbStatus: 'up' | 'down' = 'down';

    try {
      await fastify.prisma.user.count();
      dbStatus = 'up';
    } catch (error) {
      fastify.log.error(error);
    }

    res: res.code(dbStatus === 'up' ? 200 : 503);
    return {
      service: 'ft_transcendence-backend',
      status: dbStatus === 'up' ? 'operational' : 'degraded',
      environment: process.env.NODE_ENV ?? 'development',
      uptime: process.uptime(),
      database: {
        provider: 'sqlite',
        url: process.env.DATABASE_URL ?? 'not_set',
        status: dbStatus,
      },
      timestamp: new Date().toISOString(),
    };
  });
}

export default Status