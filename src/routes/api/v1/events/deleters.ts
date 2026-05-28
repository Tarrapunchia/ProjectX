import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { eventsSchemas } from "./eventsSchema.js";

const Deleters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // DELETE /api/v1/events/:id
    fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { schema: eventsSchemas.deleteEventSchema },
    async (req, reply) => {
        const userId = getUserIdFromJWT(req, reply, fastify)
        if (!userId || Number.isNaN(userId)) {
        reply.code(401)
        return { error: 'Unauthorized: User not connected' }
        }

        const eventId = Number(req.params.id)
        if (Number.isNaN(eventId)) {
        reply.code(400)
        return { error: 'invalid event id' }
        }

        try {
        const out = await fastify.prisma.$transaction(async (tx) => {
            const existing = await tx.event.findUnique({
            where: { id: eventId },
            select: { id: true, ownerId: true },
            })
            if (!existing) return { ok: false as const, code: 404, error: 'Event not found' }
            if (existing.ownerId !== userId) return { ok: false as const, code: 403, error: 'Only owner can delete event' }

            // cancella prima participants (così siamo sicuri anche senza cascade)
            await tx.eventParticipant.deleteMany({ where: { eventId } })
            await tx.event.delete({ where: { id: eventId } })

            return { ok: true as const }
        })

        if (!out.ok) {
            reply.code(out.code)
            return { error: out.error }
        }

        reply.code(200)
        return { success: true }
        } catch (err) {
        fastify.log.error(err)
        reply.code(500)
        return { error: 'Internal server error while deleting event' }
        }
    }
    )
}

export default Deleters