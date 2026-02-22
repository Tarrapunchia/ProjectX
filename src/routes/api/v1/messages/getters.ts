// import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
// import { userSchemas } from "./usersSchemas.js";

// const Getters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
//     // GET /api/v1/projects/search?organizationId=1&name=foo
//     fastify.get<{
//     Querystring: { organizationId: string; name?: string }
//     }>(
//     '/search',
//     { schema: projectSchemas.getOrgProjectsByNameSchema },
//     async (req, reply) => {
//         const roomKey = Number(req.query.organizationId)
//         const name = (req.query.name ?? '').trim()

//         if (Number.isNaN(organizationId)) {
//             reply.code(400)
//             return { error: 'organizationId must be a number' }
//         }

//         const where = name
//             ? { organizationId, name: { contains: name } }
//             : { organizationId }

//         const projects = await fastify.prisma.project.findMany({
//             where,
//             include: {
//             organization: { select: { id: true, name: true } },
//             participants: {
//                 include: {
//                 user: { select: { id: true, name: true, surname: true, email: true } },
//                 role: { select: { name: true } },
//                 },
//             },
//             },
//             orderBy: { name: 'asc' },
//         })

//         const result = projects.map((p) => ({
//             id: p.id,
//             name: p.name,
//             organizationId: p.organizationId,
//             organization: p.organization,
//             participants: p.participants.map((pp) => ({
//             user: pp.user,
//             role: pp.role.name,
//             joinedAt: pp.createdAt,
//             })),
//         }))

//         return reply.send({
//             organizationId,
//             query: name || null,
//             count: result.length,
//             projects: result,
//         })
//     })
// }

// export default Getters