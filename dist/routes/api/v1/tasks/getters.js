import fastify, {} from "fastify";
import { taskSchemas } from "./tasksSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
const Getters = async (fastify, opts) => {
    // // GET /api/v1/tasks/projTasks/:id
    fastify.get('/projTasks/:id', { schema: taskSchemas.getProjTasksSchema }, async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.code(400);
            return { error: 'invalid project id' };
        }
        // TODO controllare se registrato ad organizzazione madre
        const project = await fastify.prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            res.code(404);
            return { error: 'Project not found' };
        }
        const tasks = await fastify.prisma.task.findMany({
            where: { projectId: id }
        });
        const result = tasks.map((t) => {
            var _a, _b;
            return ({
                id: t.id,
                name: t.name,
                description: (_a = t.description) !== null && _a !== void 0 ? _a : null,
                status: t.status,
                createdAt: t.createdAt,
                closedAt: (_b = t.closedAt) !== null && _b !== void 0 ? _b : null,
            });
        });
        res.code(200);
        return res.send(result);
    });
    // // GET /api/v1/projects/search?organizationId=1&name=foo
    // // TODO aggiungere check su pox ricerca?
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
};
export default Getters;
//# sourceMappingURL=getters.js.map