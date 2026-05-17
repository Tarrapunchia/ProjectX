import { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { eventsSchemas } from "./eventsSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";

const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {

    // POST /api/v1/events/create
    fastify.post(
        '/create',
        { schema: eventsSchemas.createEventSchema }, 
        async (req, res) => {
            const userId = getUserIdFromJWT(req, res, fastify);

            if (!userId || Number.isNaN(userId)) {
                res.code(401);
                return { error: 'Unauthorized: User not connected' };
            }

            // Estraiamo i dati dal body (che Fastify ha già validato tramite schema)
            const { name, type, message, dueDate, participants } = req.body as any;

            try {
                const newEvent = await fastify.prisma.$transaction(async (tx) => {
                    
                    // 1. Creiamo l'evento
                    const event = await tx.event.create({
                        data: {
                            name,
                            type: type.toUpperCase(),
                            message,
                            dueDate: new Date(dueDate),
                            ownerId: userId,
                        }
                    });

                    // 2. Aggiungiamo l'owner come partecipante (EventParticipant)
                    await tx.eventParticipant.create({
                        data: {
                            userId: userId,
                            eventId: event.id
                        }
                    });

                    if (participants && Array.isArray(participants)) {
                        const otherParticipants = participants.map((pId: number) => ({
                            userId: pId,
                            eventId: event.id
                        }));
                        
                        await tx.eventParticipant.createMany({
                            data: otherParticipants
                        });
                    }

                    return event;
                });

                res.code(201);
                return { success: true, data: newEvent };

            } catch (error) {
                fastify.log.error(error);
                res.code(500);
                return { error: 'Internal server error while creating event' };
            }
        }
    );
};

export default Posters;