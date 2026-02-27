import { type FastifyInstance } from "fastify"

const parseRoomKey = (key: string): { type: 'ORG' | 'PROJECT', orgId: number | null, projectId: number | null } => {
    // org:12
    const orgMatch = /^org:(\d+)$/.exec(key)
    if (orgMatch) return { type: 'ORG', orgId: Number(orgMatch[1]), projectId: null }

    // proj:12:5
    const projMatch = /^proj:(\d+):(\d+)$/.exec(key)
    if (projMatch) return { type: 'PROJECT', orgId: Number(projMatch[1]), projectId: Number(projMatch[2]) }

    // fallback: room “generica”
    return { type: 'ORG', orgId: null, projectId: null }
}

const isMember = async (userId: number, orgId: number, fastify: FastifyInstance) => {
    return !!(
        await fastify.prisma.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId: orgId, userId } },
            select: { organizationId: true },
        })
    )
}

const isParticipant = async (userId: number, projectId: number, fastify: FastifyInstance) => {
    return !!(
        await fastify.prisma.projectParticipant.findUnique({
            where: { projectId_userId: { projectId: projectId, userId } },
            select: { projectId: true },
        })
    )
}

const orgExist = async (orgId: number, fastify: FastifyInstance) => {
    return !!(
        await fastify.prisma.organization.findUnique({
            where: { id: orgId }
        })
    )
}

const projExist = async (orgId: number, projId: number, fastify: FastifyInstance) => {
    return !!(
        await fastify.prisma.project.findUnique({
            where: { id: projId, organizationId: orgId }
        })
    )
}

const canAccessRoom = async (userId: number, roomKey: string, fastify: FastifyInstance): Promise<boolean> => {
    const parsed = parseRoomKey(roomKey)
    switch (parsed.type) {
        case 'ORG':
            if (Number.isNaN(parsed.orgId) || parsed.orgId === 0) return false
            return isMember(userId, Number(parsed.orgId), fastify)
            break;
        case 'PROJECT':
            if (Number.isNaN(parsed.projectId) || parsed.projectId === 0) return false
            return isParticipant(userId, Number(parsed.projectId), fastify)
            break;
        default:
            return false
            break;
    }
}

const roomExist = async (roomKey: string, fastify: FastifyInstance): Promise<boolean> => {
    const parsed = parseRoomKey(roomKey)
    switch (parsed.type) {
    case 'ORG':
        if (Number.isNaN(parsed.orgId) || parsed.orgId === 0) return false
        return orgExist(Number(parsed.orgId), fastify)
        break;
    case 'PROJECT':
        if (Number.isNaN(parsed.projectId) || parsed.projectId === 0) return false
        return projExist(Number(parsed.orgId), Number(parsed.projectId), fastify)
        break;
    default:
        return false
        break;
    }
}

export default {
    parseRoomKey: parseRoomKey,
    canAccessRoom: canAccessRoom,
    isMember: isMember,
    isParticipant: isParticipant,
    roomExist: roomExist,
    orgExist: orgExist,
    projExist: projExist
}