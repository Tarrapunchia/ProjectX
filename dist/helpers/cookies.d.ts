import type { FastifyInstance } from "fastify";
declare function setAuthCookie(reply: any, token: string): void;
declare function getUserIdFromJWT(req: any, res: any, fastify: FastifyInstance): number | null;
declare function wsGetUserIdFromJWT(req: any, fastify: FastifyInstance): number | null;
export { setAuthCookie, getUserIdFromJWT, wsGetUserIdFromJWT };
//# sourceMappingURL=cookies.d.ts.map