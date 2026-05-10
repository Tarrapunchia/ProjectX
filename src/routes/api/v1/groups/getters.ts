import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { groupSchemas } from "./groupsSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import auth from "../../../../helpers/auth.js";

const Getters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {

    // // GET /api/v1/groups/:id
    fastify.get<{
        Params: { id: string }
        }>(
        '/:id',
        { schema: groupSchemas.getGroupByIdSchema }, 
        async (req, res) => {
        const id = Number(req.params.id)

        if (Number.isNaN(id)) {
            res.code(400)
            return { error: 'invalid group id' }
        }

        const userId = getUserIdFromJWT(req, res, fastify);
        if (!userId || Number.isNaN(userId)) {
            res.code(400)
            return { error: 'no user logged in' }
        }

        if (!(await auth.canAccessRoom(userId, `group:${id}`, fastify))) {
            res.code(403)
            return { error: 'Forbidden' }
        }

        const group = await fastify.prisma.group.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, surname: true, email: true },
                        },
                    },
                },
                chatRoom: {
                    select: { id: true, key: true, type: true }
                }
            },
        })

        if (!group) {
            res.code(404)
            return { error: 'Group not found' }
        }

        fastify.log.error(group)

        const result = {
            id: group.id,
            name: group.name,
            participants: group.participants.map((pp) => ({
                user: pp.user,
                joinedAt: pp.createdAt,
            })),
            chatRoom: group.chatRoom,
            description: group.description ?? '',
            createdAt: group.createdAt,
            closedAt: group.closedAt ?? null
        }

        res.code(200)
        return res.send(result)
    })

    

    // // // GET /api/v1/projects/summary/:id
    // fastify.get<{
    //     Params: { id: string }
    //     }>(
    //     '/summary/:id',
    //     { schema: projectSchemas.getProjectByIdSchema }, 
    //     async (req, res) => {
    //     const id = Number(req.params.id)

    //     if (Number.isNaN(id)) {
    //         res.code(400)
    //         return { error: 'invalid id' }
    //     }
    //     const project = await fastify.prisma.project.findUnique({
    //         where: { id },
    //         include: {
    //             organization : { select: { id: true, name: true }},
    //             participants: {
    //                 include: {
    //                     user: {
    //                         select: { id: true, name: true, surname: true, email: true },
    //                     },
    //                     role: { select: { id: true, name: true }},
    //                 },
    //             },
    //         },
    //     })

    //     if (!project) {
    //         res.code(404)
    //         return { error: 'Project not found' }
    //     }

    //     const result = {
    //         id: project.id,
    //         name: project.name,
    //         status: project.status,
    //         description: project.description ?? '',
    //         organization: project.organization,
    //         participants: project.participants.map((pp) => ({
    //             user: pp.user,
    //             role: pp.role.name,
    //             joinedAt: pp.createdAt,
    //         })),
    //     }

    //     res.code(200)
    //     return res.send(result)
    // })

    // // GET /api/v1/group/room/:id

    // GET /api/v1/projects/search?organizationId=1&name=foo
    // TODO aggiungere check su pox ricerca?
    // fastify.get<{
    // Querystring: { organizationId: string; name?: string }
    // }>(
    // '/search',
    // { schema: projectSchemas.getOrgProjectsByNameSchema },
    // async (req, reply) => {
    //     const organizationId = Number(req.query.organizationId)
    //     const name = (req.query.name ?? '').trim()

    //     if (Number.isNaN(organizationId)) {
    //         reply.code(400)
    //         return { error: 'organizationId must be a number' }
    //     }

    //     const where = name
    //         ? { organizationId, name: { contains: name } }
    //         : { organizationId }

    //     const projects = await fastify.prisma.project.findMany({
    //         where,
    //         include: {
    //         organization: { select: { id: true, name: true } },
    //         participants: {
    //             include: {
    //             user: { select: { id: true, name: true, surname: true, email: true } },
    //             role: { select: { name: true } },
    //             },
    //         },
    //         },
    //         orderBy: { name: 'asc' },
    //     })

    //     const result = projects.map((p) => ({
    //         id: p.id,
    //         name: p.name,
    //         status: p.status,
    //         description: p.description,
    //         organizationId: p.organizationId,
    //         organization: p.organization,
    //         participants: p.participants.map((pp) => ({
    //         user: pp.user,
    //         role: pp.role.name,
    //         joinedAt: pp.createdAt,
    //         })),
    //         createdAt: p.createdAt,
    //         closedAt: p.closedAt ?? null
    //     }))

    //     return reply.send({
    //         organizationId,
    //         query: name || null,
    //         count: result.length,
    //         projects: result,
    //     })
    // })


    // // GET /api/v1/projects/:id/project
    // fastify.get<{
    //     Params: { id: string }
    //     }>(
    //     '/:id/project',
    //     { schema: orgSchemas.getOrgProfile },
    //     async (req, res) => {
    //         const id = Number(req.params.id)
    //         if (Number.isNaN(id)) {
    //             res.code(400)
    //             return { error: 'invalid id' }
    //         }

    //         const project = await fastify.prisma.project.findUnique( {where: { id },} )

    //         if (!project) {
    //             res.code(404)
    //             return { error: 'Project not found' }
    //         }

    //         return {
    //             id: project.id,
    //             name: project.name
    //         }
    //     }
    // )

    // // GET /api/v1/projects/:id/members
    // // TODO: getOrgMembers - limitare la visibilita' agli iscritti all'org?
    // fastify.get<{
    // Params: { id: string }
    // }>(
    // '/:id/members',
    // { schema: orgSchemas.getOrgMembers },
    // async (req, res) => {
    //     // Controllo se loggati (vedo se ho JWT nei session token)
    //     let ownerId = getUserIdFromJWT(req, res, fastify)
    //     if (!ownerId) {
    //         res.code(400)
    //         return { error: 'You must be logged in in order to see the Organization\'s members' }
    //     }
    //     const orgId = Number(req.params.id)
    //     if (Number.isNaN(orgId)) {
    //     res.code(400)
    //     return { error: 'invalid id' }
    //     }

    //     const org = await fastify.prisma.organization.findUnique({
    //         where: { id: orgId },
    //         select: { id: true, name: true },
    //     })

    //     if (!org) {
    //         res.code(404)
    //         return { error: 'Organization not found' }
    //     }

    //     // faccio JOIN
    //     const memberships = await fastify.prisma.organizationMember.findMany({
    //         where: { organizationId: orgId },
    //         include: {
    //             user: true
    //         },
    //         orderBy: { userId: 'asc' },
    //     })

    //     const members = memberships.map((m) => ({
    //         id: m.user.id,
    //         name: m.user.name,
    //         surname: m.user.surname,
    //         email: m.user.email,
    //         phone: m.user.phone,
    //         jobQualifier: m.user.jobQualifier,
    //         joinedAt: m.createdAt,
    //     }))

    //     return res.send(
    //         // organizationId: org.id,
    //         // organizationName: org.name,
    //         // count: members.length,
    //         members
    //     )
    // }
    // )
}

export default Getters