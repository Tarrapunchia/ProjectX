import { type FastifyInstance } from "fastify";
declare const _default: {
    parseRoomKey: (key: string) => {
        type: "ORG" | "PROJECT";
        orgId: number | null;
        projectId: number | null;
    };
    canAccessRoom: (userId: number, roomKey: string, fastify: FastifyInstance) => Promise<boolean>;
    isMember: (userId: number, orgId: number, fastify: FastifyInstance) => Promise<boolean>;
    isParticipant: (userId: number, projectId: number, fastify: FastifyInstance) => Promise<boolean>;
    roomExist: (roomKey: string, fastify: FastifyInstance) => Promise<boolean>;
    orgExist: (orgId: number, fastify: FastifyInstance) => Promise<boolean>;
    projExist: (orgId: number, projId: number, fastify: FastifyInstance) => Promise<boolean>;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map