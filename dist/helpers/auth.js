import {} from "fastify";
const parseRoomKey = (key) => {
    // org:12
    const orgMatch = /^org:(\d+)$/.exec(key);
    if (orgMatch)
        return { type: 'ORG', orgId: Number(orgMatch[1]), projectId: null };
    // proj:12:5
    const projMatch = /^proj:(\d+):(\d+)$/.exec(key);
    if (projMatch)
        return { type: 'PROJECT', orgId: Number(projMatch[1]), projectId: Number(projMatch[2]) };
    // fallback: room “generica”
    return { type: 'ORG', orgId: null, projectId: null };
};
const isMember = async (userId, orgId, fastify) => {
    return !!(await fastify.prisma.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: orgId, userId } },
        select: { organizationId: true },
    }));
};
const isParticipant = async (userId, projectId, fastify) => {
    return !!(await fastify.prisma.projectParticipant.findUnique({
        where: { projectId_userId: { projectId: projectId, userId } },
        select: { projectId: true },
    }));
};
const canAccessRoom = async (userId, roomKey, fastify) => {
    const parsed = parseRoomKey(roomKey);
    switch (parsed.type) {
        case 'ORG':
            if (Number.isNaN(parsed.orgId) || parsed.orgId === 0)
                return false;
            return isMember(userId, Number(parsed.orgId), fastify);
            break;
        case 'PROJECT':
            if (Number.isNaN(parsed.projectId) || parsed.projectId === 0)
                return false;
            return isParticipant(userId, Number(parsed.projectId), fastify);
            break;
        default:
            return false;
            break;
    }
};
export default {
    parseRoomKey: parseRoomKey,
    canAccessRoom: canAccessRoom,
    isMember: isMember,
    isParticipant: isParticipant
};
//# sourceMappingURL=auth.js.map