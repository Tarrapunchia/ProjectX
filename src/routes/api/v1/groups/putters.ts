import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { groupSchemas } from "./groupsSchema.js";

const Putters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.put<{
    Params: { id: string }
    Body: { name?: string; description?: string | null }
    }>(
    '/:id',
    { schema: groupSchemas.updateGroupSchema },
    async (req, reply) => {
        const userId = getUserIdFromJWT(req, reply, fastify)
        if (!userId) {
        reply.code(401)
        return { error: 'You must be logged in' }
        }

        const groupId = Number(req.params.id)
        if (Number.isNaN(groupId)) {
        reply.code(400)
        return { error: 'invalid group id' }
        }

        const { name, description } = req.body
        const hasName = typeof name === 'string' && name.trim().length > 0
        const hasDescription = description !== undefined // può essere string oppure null

        if (!hasName && !hasDescription) {
        reply.code(400)
        return { error: 'Provide at least one field: name or description' }
        }

        try {
        const out = await fastify.prisma.$transaction(async (tx) => {
            // check group exists
            const group = await tx.group.findUnique({
            where: { id: groupId },
            select: { id: true },
            })
            if (!group) {
            return { ok: false as const, code: 404, error: 'Group not found' }
            }

            // check membership
            const membership = await tx.groupParticipant.findUnique({
            where: { groupId_userId: { groupId, userId } },
            select: { groupId: true },
            })
            if (!membership) {
            return { ok: false as const, code: 403, error: 'Forbidden' }
            }

            const updated = await tx.group.update({
            where: { id: groupId },
            data: {
                ...(hasName ? { name: name!.trim() } : {}),
                ...(hasDescription ? { description } : {}),
            },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                closedAt: true,
            },
            })

            return { ok: true as const, updated }
        })

        if (!out.ok) {
            reply.code(out.code)
            return { error: out.error }
        }

        reply.code(200)
        return { success: true, group: out.updated }
        } catch (err) {
        fastify.log.error(err)
        reply.code(500)
        return { error: 'Internal error' }
        }
    }
    )
}

export default Putters