import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { userSchemas } from "./usersSchemas.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import fs from 'fs'
import path from 'path'

const getMimeType = (filename: string) => {
  const ext = path.extname(filename).toLowerCase()
  const m: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  }
  return m[ext] ?? 'application/octet-stream'
}

function safeResolveFromPublic(rootDir: string, avatarUrl: string) {
  const clean = avatarUrl.split('?')[0]?.replace(/^\/+/, '') ?? ''
  const base = path.resolve(rootDir)
  const full = path.resolve(base, clean)

  if (!full.startsWith(base + path.sep)) return null
  return full
}

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
                    avatar: user.avatarUrl,

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
                            avatar: user.avatarUrl,
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
                    res.code(400)
                    return res.send({ error: error})
                }
        })

        // // GET /api/v1/users/activeUserAvatar
        // fastify.get(
        //     '/activeUserAvatar',
        //     { schema: {
        //         description: 'Fetch a user\'s avatar url',
        //         tags: ['users'],
        //         response: {
        //             200: {
        //                 type: 'object',
        //                 properties: {
        //                     email: { type: 'string', format: 'email' },
        //                     avatar: { type: 'string' }
        //                 },
        //                 required: ['email', 'avatar'],
        //             },
        //             404: {
        //                 type: 'object',
        //                 properties: {
        //                     error: { type: 'string' },
        //                 },
        //                 required: ['error'],
        //             },
        //             400: {
        //                 type: 'object',
        //                 properties: {
        //                     error: { type: 'string' },
        //                 },
        //                 required: ['error'],
        //             }
        //         }
        //     } },
        //     async (req, res) => {
        //         const id = getUserIdFromJWT(req, res, fastify)
        //         if (Number.isNaN(id) || !id) {
        //             res.code(400)
        //             return { error: 'User not connected' }
        //         }
        //         try {
        //             const user = await fastify.prisma.user.findUnique({
        //                 where: { id },
        //                 select: { email: true, avatarUrl: true }
        //             })
        //             if (!user) {
        //                 res.code(404)
        //                 return { error: 'User not found' }
        //             }
        //             return {
        //                 email: user.email,
        //                 avatar: user.avatarUrl
        //             }
        //         } catch (error) {
        //             res.code(400)
        //             return res.send({ error: error})
        //         }
        // })

    const getMimeType = (filename: string) => {
        const ext = path.extname(filename).toLowerCase()
        const m: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
        }
        return m[ext] ?? 'application/octet-stream'
        }

        function safeResolve(baseDir: string, rel: string) {
        const base = path.resolve(baseDir)
        const full = path.resolve(base, rel)
        if (!full.startsWith(base + path.sep)) return null
        return full
        }

        fastify.get<{ Params: { id: string } }>(
        '/:id/avatar',
        {
            schema: {
            description: 'Get user avatar as binary image',
            tags: ['users'],
            params: {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
            },
            },
        },
        async (req, reply) => {
            const userId = Number(req.params.id)
            if (Number.isNaN(userId)) return reply.code(400).send({ error: 'invalid user id' })

            const user = await fastify.prisma.user.findUnique({
            where: { id: userId },
            select: { avatarUrl: true },
            })
            if (!user) return reply.code(404).send({ error: 'User not found' })

            const AVATAR_ROOT = path.join(process.cwd(), 'avatar')  // ✅ <projectFolder>/avatar
            const DEFAULT_REL = path.join('default.png')            // ✅ <projectFolder>/avatar/default.png

            // avatarUrl può essere:
            // - null/empty -> default.png
            // - "/avatar/26/foto CV.jpg"  (path relativo "avatar/..")
            // - "foto CV.jpg"             (solo filename)
            // - "26/foto CV.jpg"          (rel user folder)
            let relPath = DEFAULT_REL

            const raw = (user.avatarUrl ?? '').trim()
            if (raw) {
            // normalizza: togli leading "/"
            const cleaned = raw.replace(/^\/+/, '')
            if (cleaned.startsWith('avatar/')) {
                // es: "avatar/26/foto CV.jpg" -> relativo ad AVATAR_ROOT? togli "avatar/"
                relPath = cleaned.slice('avatar/'.length)
            } else if (cleaned.includes('/')) {
                // es: "26/foto CV.jpg"
                relPath = cleaned
            } else {
                // es: "foto CV.jpg" -> assume avatar/<userId>/<filename>
                relPath = path.join(String(userId), cleaned)
            }
            } else {
            relPath = DEFAULT_REL
            }

            const fullPath = safeResolve(AVATAR_ROOT, relPath)
            const fallbackPath = safeResolve(AVATAR_ROOT, DEFAULT_REL)

            const chosen =
            fullPath && fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()
                ? fullPath
                : (fallbackPath && fs.existsSync(fallbackPath) ? fallbackPath : null)

            if (!chosen) return reply.code(404).send({ error: 'Avatar file not found' })

            reply.type(getMimeType(chosen))
            reply.header('Cache-Control', 'no-store')
            return reply.send(fs.createReadStream(chosen))
        }
    )

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
                        { name: { startsWith: t } },
                        { surname: { startsWith: t } },
                        // { email: { contains: t } },
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
                isLoggedIn: u.isLoggedIn,
                avatar: u.avatarUrl
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

        // GET /api/v1/users/ activeUserProjects
        fastify.get(
            '/activeUsersProjects',
            { schema: userSchemas.getProjects },
            async (req, res) => {
                const userId = getUserIdFromJWT(req, res, fastify)
                if (!userId) {
                    res.code(400)
                    return { error: 'not connected' }
                }
    
                const rows = await fastify.prisma.projectParticipant.findMany({
                    where: { userId },
                    include: {
                        project: {
                            include: {
                                tasks: {
                                    include: {
                                        participants: {
                                            select: { userId: true }
                                        }
                                    }
                                }
                            },
                        },
                        role: { select: { name: true } }, // RoleName enum
                    },
                    orderBy: { createdAt: 'desc' },
                })
    
    
                const result = rows.map((pp) => ({
                    roleId: pp.roleId,
                    project: {
                        id: pp.project.id,
                        name: pp.project.name,
                        status: pp.project.status,
                        description: pp.project.description ?? '',
                        createdAt: pp.project.createdAt,
                        closedAt: pp.project.closedAt,
                        tasks: pp.project.tasks.map((t) => ({
                            id: t.id,
                            projectId: pp.project.id,
                            name: t.name,
                            status: t.status,
                            priority: t.priority,
                            dueDate: t.dueDate,
                            createdAt: t.createdAt,
                            closedAt: t.closedAt,
                            description: t.description,
                            participants: t.participants.map((tp) => ({
                                participantId: tp.userId
                            }))
                        })),
                    },
                }))
                return result
            }
        )

        // GET /api/v1/users/calendarEntries
        fastify.get(
        '/calendarEntries',
        { schema: userSchemas.getCalendarEntries },
        async (req, res) => {
            try {
                
                const data = await fastify.prisma.$transaction(async (tx) => {
                    const userId = getUserIdFromJWT(req, res, fastify)
                    if (!userId) {
                        res.code(400)
                        return { error: 'not connected' }
                    }

                    const tasks = await tx.taskParticipant.findMany({
                        where: { userId },
                        include: {
                            task: {
                                select: { id: true, name: true, dueDate: true, createdAt: true, description: true,
                                    projectId: true, status: true, priority: true, closedAt: true
                                    }
                            }
                        }
                    })

                    const events = await tx.eventParticipant.findMany({
                        where: { userId },
                        include: {
                            event: {
                                select: { id: true, name: true, dueDate: true, createdAt: true,
                                    type: true, message: true, ownerId: true, 
                                    participants: {
                                        select: { userId: true }
                                    }
                                }
                            }
                        }
                    })

                    return {
                        tasks: tasks.map((t) => ({
                            id: t.task.id,
                            name: t.task.name,
                            dueDate: t.task.dueDate,
                            createdAt: t.task.createdAt,
                            description: t.task.description,
                        })),
                        events: events.map((e) => ({
                            id: e.event.id,
                            name: e.event.name,
                            dueDate: e.event.dueDate,
                            createdAt: e.event.createdAt,
                            type: e.event.type,
                            description: e.event.message,
                            ownerId: e.event.ownerId,
                            participants: e.event.participants?.map(p => p.userId) || []
                        }))
                    }
                })

                return res.send(data)
            } catch (error) {
                res.code(400)
                res.send({ error: error })
            }
    }
    )
}

export default Getters