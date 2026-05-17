import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { eventsSchemas } from "./eventsSchema.js";

const Putters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // PUT /api/v1/events/:id
    fastify.put<{
    Params: { id: string }
    Body: {
        name?: string
        type?: string
        message?: string
        dueDate?: string
        participants?: number[] // opzionale: lista completa (senza owner) oppure lista totale, vedi nota
    }
    }>(
    '/:id',
    { schema: eventsSchemas.updateEventSchema },
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

        const { name, type, message, dueDate, participants } = req.body

        // almeno un campo
        if (
            name === undefined &&
            type === undefined &&
            message === undefined &&
            dueDate === undefined &&
            participants === undefined
        ) {
            reply.code(400)
            return { error: 'No fields to update' }
        }

        try {
            const out = await fastify.prisma.$transaction(async (tx) => {
                const existing = await tx.event.findUnique({
                where: { id: eventId },
                select: { id: true, ownerId: true },
                })
                if (!existing) return { ok: false as const, code: 404, error: 'Event not found' }
                if (existing.ownerId !== userId) return { ok: false as const, code: 403, error: 'Only owner can update event' }

                // update campi event
                const updated = await tx.event.update({
                where: { id: eventId },
                data: {
                    ...(name !== undefined ? { name } : {}),
                    ...(type !== undefined ? { type: type.toUpperCase() as any } : {}),
                    ...(message !== undefined ? { message } : {}),
                    ...(dueDate !== undefined ? { dueDate: new Date(dueDate) } : {}),
                },
                })

                if (participants !== undefined) {
                const unique = Array.from(new Set(participants.filter((p) => Number.isFinite(p) && p !== userId)))

                // cancello tutti i participant tranne owner
                await tx.eventParticipant.deleteMany({
                    where: { eventId, userId: { not: userId } },
                })

                // reinserisco
                if (unique.length > 0) {
                    await tx.eventParticipant.createMany({
                        data: unique.map((uid) => ({ eventId, userId: uid })),
                    })
                }
                }

                return { ok: true as const, updated }
            })

            if (!out.ok) {
                reply.code(out.code)
                return { error: out.error }
            }

            reply.code(200)
            return { success: true, data: out.updated }
            } catch (err) {
                fastify.log.error(err)
                reply.code(500)
                return { error: 'Internal server error while updating event' }
            }
        }
    )
}

export default Putters