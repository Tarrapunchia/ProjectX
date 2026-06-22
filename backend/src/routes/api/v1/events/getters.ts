import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { eventsSchemas } from "./eventsSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { Priority } from "@prisma/client";

const Getters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {

    // GET /api/v1/events/activeUserEvents
    fastify.get(
    '/activeUserEvents',
    { schema: eventsSchemas
    .getUserEventsSchema }, 
    async (req, res) => {
        const id = getUserIdFromJWT(req, res, fastify)

        if (!id || Number.isNaN(id)) {
            res.code(400)
            return { error: 'user not connected' }
        }

        const events = await fastify.prisma.eventParticipant.findMany({
            where: { userId: id },
            include: {
                event: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        message: true,
                        createdAt: true,
                        dueDate: true,
                        ownerId: true
                    }
                }
            }
        })

        if (!events) {
            res.code(404)
            return { error: 'no event found' }
        }

        const result = events.map((e) => ({
            id: e.event.id,
            name: e.event.name,
            type: e.event.type,
            time: e.event.dueDate,
            description: e.event.message ?? '',
            owner: e.event.ownerId,
        }))

        res.code(200)
        return res.send(result)
    })

}

export default Getters