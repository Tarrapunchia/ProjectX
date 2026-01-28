import { type FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}
declare const prismaPlugin: FastifyPluginAsync;
export default prismaPlugin;
//# sourceMappingURL=prismaPlugin.d.ts.map