import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { taskSchemas } from "./tasksSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";

const Getters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {

    // // GET /api/v1/tasks/projTasks/:id
    fastify.get<{
        Params: { id: string }
        }>(
        '/projTasks/:id',
        { schema: taskSchemas.getProjTasksSchema }, 
        async (req, res) => {
        const id = Number(req.params.id)

        if (Number.isNaN(id)) {
            res.code(400)
            return { error: 'invalid project id' }
        }
        // TODO controllare se registrato ad organizzazione madre

        const project = await fastify.prisma.project.findUnique({
            where: { id },
        })

        if (!project) {
            res.code(404)
            return { error: 'Project not found' }
        }

        const tasks = await fastify.prisma.task.findMany({
            where: { projectId: id }
        })

        const result = tasks.map((t) => ({
                id: t.id,
                name: t.name,
                description: t.description ?? null,
                status: t.status,
                createdAt: t.createdAt,
                closedAt: t.closedAt ?? null,
            }))

        res.code(200)
        return res.send(result)
    })

    fastify.get(
    '/activeUserTasks',
    { schema: taskSchemas.getUserTasksSchema }, 
    async (req, res) => {
        const id = getUserIdFromJWT(req, res, fastify)

        if (!id || Number.isNaN(id)) {
            res.code(400)
            return { error: 'invalid user id' }
        }

        const tasks = await fastify.prisma.taskParticipant.findMany({
            where: { userId: id },
            include: {
                task: {
                    include: {
                        project: {
                            select: { name: true }
                        }
                    }
                }
            }
        })

        if (!tasks) {
            res.code(404)
            return { error: 'no tasks found' }
        }

        let priority = {
            'NONE': 0,
            'LOW': 0,
            'MEDIUM': 0,
            'HIGH': 0,
            'CRITICAL': 0,
        }

        const result = {
            tasks: tasks.map((t) => (
                priority[t.task.priority]++,
                {
                id: t.taskId,
                name: t.task.name,
                description: t.task.description ?? null,
                status: t.task.status,
                priority: t.task.priority,
                createdAt: t.task.createdAt,
                dueDate: t.task.dueDate,
                closedAt: t.task.closedAt ?? null,
            })),
            NONE: priority.NONE,
            LOW: priority.LOW,
            MEDIUM: priority.MEDIUM,
            HIGH: priority.HIGH,
            CRITICAL: priority.CRITICAL,
        }

        res.code(200)
        return res.send(result)
    })

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
}

export default Getters