import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { orgSchemas } from "./organizationsSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";

const Getters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // GET /api/v1/organizations
    fastify.get('/', { schema: orgSchemas.getAllOrgs },  async (req, res) => {
        return fastify.prisma.organization.findMany()
    })

    // GET /api/v1/organizations/:id/organization
    fastify.get<{
        Params: { id: string }
        }>(
        '/:id/organization',
        { schema: orgSchemas.getOrgProfile },
        async (req, res) => {
            const id = Number(req.params.id)
            if (Number.isNaN(id)) {
            res.code(400)
            return { error: 'invalid id' }
            }

            const org = await fastify.prisma.organization.findUnique({
                where: { id },
                include: {
                    projects: true
                }
            })

            if (!org) {
                res.code(404)
                return { error: 'Organization not found' }
            }

            return {
                id: org.id,
                name: org.name,
                email: org.email,
                phone: org.phone,
                city: org.city,
                address: org.address,
                cap: org.cap,
                state: org.state,
                ownerId: org.ownerId,
                projects: org.projects
            }
        }
    )

    // GET /api/v1/organizations/search?organizationName=foo
    fastify.get<{
        Querystring: { organizationName: string }
    }>(
    '/search',
    { schema: orgSchemas.getOrgByName },
    async (req, reply) => {
        const organizationName = (req.query.organizationName ?? '').trim()

        const organizations = await fastify.prisma.organization.findMany({
            where: { name: { contains: organizationName } },
            include: {
                projects: {
                    select: { id: true, name: true }
                },
                members: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: { name: 'asc' },
        })

        const result = organizations.map((o) => ({
            id: o.id,
            name: o.name,
            projects: o.projects.map((p) => ({ id: p.id, name: p.name, })),
            members: o.members.map((m) => ({
                userId: m.userId,
                joinedAt: m.createdAt,
                user: {
                    id: m.user.id,
                    name: m.user.name,
                    surname: m.user.surname,
                    jobQualifier: m.user.jobQualifier,
                    email: m.user.email,
                }
            }))
        }
        ),
        )

        return reply.send({ result })
    })

    // GET /api/v1/organizations/:id/members
    // TODO: getOrgMembers - limitare la visibilita' agli iscritti all'org?
    fastify.get<{
    Params: { id: string }
    }>(
    '/:id/members',
    { schema: orgSchemas.getOrgMembers },
    async (req, res) => {
        // Controllo se loggati (vedo se ho JWT nei session token)
        let ownerId = getUserIdFromJWT(req, res, fastify)
        if (!ownerId) {
            res.code(400)
            return { error: 'You must be logged in in order to see the Organization\'s members' }
        }
        const orgId = Number(req.params.id)
        if (Number.isNaN(orgId)) {
        res.code(400)
        return { error: 'invalid id' }
        }

        const org = await fastify.prisma.organization.findUnique({
            where: { id: orgId },
            select: { id: true, name: true },
        })

        if (!org) {
            res.code(404)
            return { error: 'Organization not found' }
        }

        // faccio JOIN
        const memberships = await fastify.prisma.organizationMember.findMany({
            where: { organizationId: orgId },
            include: {
                user: true
            },
            orderBy: { userId: 'asc' },
        })

        const members = memberships.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            surname: m.user.surname,
            email: m.user.email,
            phone: m.user.phone,
            jobQualifier: m.user.jobQualifier,
            joinedAt: m.createdAt,
        }))

        return res.send(
            // organizationId: org.id,
            // organizationName: org.name,
            // count: members.length,
            members
        )
    }
    )
}

export default Getters