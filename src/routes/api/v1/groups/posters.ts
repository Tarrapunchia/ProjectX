import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { groupSchemas } from "./groupsSchema.js";

const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // // POST /api/v1/groups/addGroup
    fastify.post<{
        Body: { name: string; description?: 'string' }
    }>(
    '/addGroup',
    { schema: groupSchemas.createGroupSchema },
    async (req, res) => {
        const ownerId = getUserIdFromJWT(req, res, fastify)
        if (!ownerId) {
            res.code(401)
            return { error: 'You must be logged in in order to create a Group' }
        }

        const { name, description } = req.body

        if (!name) {
            res.code(400)
            return { error: 'Name is required' }
        }

        // vado ad usare $transaction che mi crea un client prisma ad hoc per la transazione in atto
        // in modo che tutto quello che viene eseguito viene eseguito atomicamente (se anche solo una
        // delle query che esegue fallisce fa il rollback, comodo)
        try {
            const created = await fastify.prisma.$transaction(async (tx) => {
                // 1) creo il gruppo
                const group = await tx.group.create({
                    data: {
                        name,
                        description: description ?? ''
                    },
                })

                // 2) aggiunge il creatore come participant
                await tx.groupParticipant.create({
                    data: {
                        groupId: group.id,
                        userId: ownerId,
                    },
                })

                res.code(201)
                return ({
                    id: group.id,
                    name: group.name,
                    description: group.description ?? ''
                })
        })} catch (error: any) {
            fastify.log.error(error)

            if (error?.code === 'P2002') {
                res.code(409)
                return { error: 'Duplicate constraint' }
            }

            if (error?.code === 'P2003') {
                res.code(400)
                return { error: 'Foreign key constraint' }
            }

            res.code(400)
            return { error: 'Unable to create group' }
        }
        }
    )

     // // POST /api/v1/group/addPartecipant
    fastify.post<{
        Body: { userId: number; groupId: number }
    }>(
    '/addPartecipant',
    { schema: groupSchemas.addParticipantSchema },
    async (req, res) => {
        const activeId = getUserIdFromJWT(req, res, fastify)
        if (!activeId) {
            res.code(401)
            return { error: 'You must be logged in in order to add a Partecipant' }
        }

        const { userId, groupId } = req.body

        if (!Number.isFinite(userId) || !Number.isFinite(groupId)) {
            res.code(400)
            return { error: 'All fields are required' }
        }

        // verifico che gruppo esista e che l'utente ne faccia parte
        const group = await fastify.prisma.group.findFirst({
            where: {
                id: groupId,
                participants: { some: { userId: activeId } },
            },
            select: { id: true, name: true },
        })
        if (!group) {
            res.code(404)
            return { error: 'Group not found' }
        }

        // vado ad usare $transaction che mi crea un client prisma ad hoc per la transazione in atto
        // in modo che tutto quello che viene eseguito viene eseguito atomicamente (se anche solo una
        // delle query che esegue fallisce fa il rollback, comodo)
        try {
            const created = await fastify.prisma.groupParticipant.create({
                data: {
                    userId: userId,
                    groupId: groupId
                }
            })
            res.code(200)
            return {
                userId: userId,
                groupId: groupId
            }
        } catch (error: any) {
            fastify.log.error(error)

            if (error?.code === 'P2002') {
                res.code(409)
                return { error: 'Duplicate constraint' }
            }

            if (error?.code === 'P2003') {
                res.code(400)
                return { error: 'Foreign key constraint ' }
            }

            res.code(400)
            return { error: 'Unable to add member' }
        }
        }
    )
}

export default Posters