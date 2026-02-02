import type { FastifyInstance } from "fastify";
declare function setAuthCookie(reply: any, token: string): void;
declare function getUserIdFromJWT(req: any, res: any, fastify: FastifyInstance): number | null;
export { setAuthCookie, getUserIdFromJWT };
//# sourceMappingURL=cookies.d.ts.map