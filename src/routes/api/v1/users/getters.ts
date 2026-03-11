import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { userSchemas } from "./usersSchemas.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";

const Getters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.get('/', { schema: userSchemas.getAllUsers },  async (req, res) => {
            return fastify.prisma.user.findMany()
        })

        // GET /api/v1/users/:id/profile
        fastify.get<{
            Params: { id: string }
            }>(
            '/:id/profile',
            { schema: userSchemas.getUserProfile },
            async (req, res) => {
                const id = Number(req.params.id)
                if (Number.isNaN(id)) {
                res.code(400)
                return { error: 'invalid id' }
                }

                const user = await fastify.prisma.user.findUnique({
                where: { id },
                include: {
                    memberships: {
                        include: { organization: true },
                    },
                    projectParticipants: {
                        include: {
                            project: true,
                            role: true,
                    },
                    },
                },
                })

                if (!user) {
                res.code(404)
                return { error: 'User not found' }
                }

                // DTO pulito (così non mando dentro tutto nudo/crudo)
                return {
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    phone: user.phone,
                    city: user.city,
                    address: user.address,
                    cap: user.cap,
                    state: user.state,
                    jobQualifier: user.jobQualifier,
                    isLoggedIn: user.isLoggedIn,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,

                    organizations: user.memberships.map((m: any) => ({
                        id: m.organization.id,
                        name: m.organization.name,
                        email: m.organization.email,
                        createdAt: m.createdAt,
                })),

                projects: user.projectParticipants.map((pp: any) => ({
                    id: pp.project.id,
                    name: pp.project.name,
                    description: pp.project.description,
                    status: pp.project.status,
                    organizationId: pp.project.organizationId,
                    createdAt: pp.project.createdAt,
                    closedAt: pp.project.closedAt ?? '',
                    role: pp.role.name,
                    joinedAt: pp.createdAt,
                })),
                }
            }
        )

        // GET /api/v1/users/activeUser
        fastify.get(
            '/activeUser',
            { schema: userSchemas.getActiveUserProfile },
            async (req, res) => {
                const id = getUserIdFromJWT(req, res, fastify)
                if (Number.isNaN(id) || !id) {
                    res.code(400)
                    return { error: 'User not connected' }
                }
                try {
                    
                    const transaction = await fastify.prisma.$transaction(async (tx) => {
                        const user = await tx.user.findUnique({
                        where: { id },
                        include: {
                            memberships: {
                                include: { organization: true },
                            },
                            projectParticipants: {
                                include: {
                                    project: true,
                                    role: true,
                            },
                            },
                        },
                        })
        
                        if (!user) {
                            res.code(404)
                            return { error: 'User not found' }
                        }
    
                    const tasks = await tx.taskParticipant.findMany({
                    where: { userId: id },
                    include: {
                        task: {
                        include: {
                            project: { select: { name: true } },
                        },
                        },
                    },
                    })
                            
                        // DTO pulito (così non mando dentro tutto nudo/crudo)
                        return {
                            id: user.id,
                            name: user.name,
                            surname: user.surname,
                            email: user.email,
                            phone: user.phone,
                            city: user.city,
                            address: user.address,
                            cap: user.cap,
                            state: user.state,
                            jobQualifier: user.jobQualifier,
                            isLoggedIn: user.isLoggedIn,
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt,
                            organizations: user.memberships.map((m: any) => ({
                            id: m.organization.id,
                            name: m.organization.name,
                            email: m.organization.email,
                            createdAt: m.createdAt,
                    })),

                        projects: user.projectParticipants.map((pp: any) => ({
                            id: pp.project.id,
                            name: pp.project.name,
                            description: pp.project.description,
                            status: pp.project.status,
                            createdAt: pp.project.createdAt,
                            closedAt: pp.project.closedAt ?? '',
                            organizationId: pp.project.organizationId,
                            role: pp.role.name,
                            joinedAt: pp.createdAt,
                        })),
                        tasks: tasks.map((t: any) => ({
                            id: t.task.id,
                            name: t.task.name,
                            projectName: t.task.project.name,
                            status: t.task.status,
                            description: t.task.description
                        }))
                        }})
                    return res.send(transaction)
                } catch (error) {
                    return res.code(400)
                    return res.send({ error: error})
                }
        })

        // // GET /api/v1/users/:id/tasks
        // fastify.get<{
        //     Params: { id: string }
        //     }>(
        //     '/activeUser',
        //     { schema: userSchemas.getActiveUserProfile },
        //     async (req, res) => {
        //         const id = getUserIdFromJWT(req, res, fastify)
        //         if (Number.isNaN(id) || !id) {
        //             res.code(400)
        //             return { error: 'User not connected' }
        //         }

        //         const user = await fastify.prisma.user.findUnique({
        //         where: { id },
        //         include: {
        //             memberships: {
        //                 include: { organization: true },
        //             },
        //             projectParticipants: {
        //                 include: {
        //                     project: true,
        //                     role: true,
        //             },
        //             },
        //         },
        //         })

        //         if (!user) {
        //             res.code(404)
        //             return { error: 'User not found' }
        //         }

        //         // DTO pulito (così non mando dentro tutto nudo/crudo)
        //         return {
        //             id: user.id,
        //             name: user.name,
        //             surname: user.surname,
        //             email: user.email,
        //             phone: user.phone,
        //             city: user.city,
        //             address: user.address,
        //             cap: user.cap,
        //             state: user.state,
        //             jobQualifier: user.jobQualifier,
        //             isLoggedIn: user.isLoggedIn,
        //             createdAt: user.createdAt,
        //             updatedAt: user.updatedAt,

        //             organizations: user.memberships.map((m: any) => ({
        //                 id: m.organization.id,
        //                 name: m.organization.name,
        //                 email: m.organization.email,
        //                 createdAt: m.createdAt,
        //         })),

        //         projects: user.projectParticipants.map((pp: any) => ({
        //             id: pp.project.id,
        //             name: pp.project.name,
        //             description: pp.project.description,
        //             status: pp.project.status,
        //             createdAt: pp.project.createdAt,
        //             closedAt: pp.project.closedAt ?? '',
        //             organizationId: pp.project.organizationId,
        //             role: pp.role.name,
        //             joinedAt: pp.createdAt,
        //         })),
        //         }
        //     }
        // )

        // GET /api/v1/users/search?username=foo
        fastify.get<{
            Querystring: { 'username': string; }
        }>(
        '/search',
        { schema:  userSchemas.searchUsers },
        async (req, reply) => {
            const username = req.query.username ?? ''
            const terms = username.split(/\s+/).filter(Boolean)

            const userId = getUserIdFromJWT(req, reply, fastify)
            if (!userId) {
                reply.code(400)
                return reply.send({
                    error: 'You must log in in order to search the database',
                })
            }

            const users = await fastify.prisma.user.findMany({
                where: terms.length
                ? {
                    AND: terms.map((t) => ({
                    OR: [
                        { name: { contains: t } },
                        { surname: { contains: t } },
                        { email: { contains: t } },
                    ],
                    })),
                } : {}
            })
    
            const result = users?.map((u: any) => ({
                id: u.id,
                name: u.name,
                surname: u.surname,
                email: u.email,
                jobQualifier: u.jobQualifier,
                isLoggedIn: u.isLoggedIn
            }))
    
            return reply.send(result)
        })

        // GET /api/v1/users/:id/friends
        fastify.get<{
            Params: { id: string }
            }>(
            '/:id/friends',
            { schema: userSchemas.getUserFriends },
            async (req, res) => {
                fastify.log.info('Fetching Friends')

                const id = Number(req.params.id)
                if (Number.isNaN(id)) {
                res.code(400)
                return { error: 'id must be a number' }
                }

                // prendo tutte le friendship ACCEPTED dove l'utente è sender o receiver
                const friendships = await fastify.prisma.friendship.findMany({
                where: {
                    status: 'ACCEPTED',
                    OR: [{ senderId: id }, { receiverId: id }],
                },
                include: {
                    sender: true,
                    receiver: true,
                },
                })

                // se l'utente non esiste e non ha friendship, voglio comunque distinguere
                // (altrimenti chi ha 0 amici sembra "not found")
                const userExists = await fastify.prisma.user.findUnique({
                where: { id },
                select: { id: true },
                })

                if (!userExists) {
                res.code(404)
                return { error: 'User not found' }
                }

                // deduplica: per ogni friendship prendo "l'altro"
                const friendsMap = new Map<number, { id: number; name: string; surname: string; email: string }>()

                for (const f of friendships) {
                const other = f.senderId === id ? f.receiver : f.sender
                if (other.id !== id) {
                    friendsMap.set(other.id, {
                    id: other.id,
                    name: other.name,
                    surname: other.surname,
                    email: other.email,
                    })
                }
                }

                const friends = Array.from(friendsMap.values()).sort((a, b) => {
                const aKey = `${a.surname} ${a.name}`.toLowerCase()
                const bKey = `${b.surname} ${b.name}`.toLowerCase()
                return aKey.localeCompare(bKey)
                })

                return res.send({
                userId: id,
                count: friends.length,
                friends,
                })
            }
        )
}

export default Getters