import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { taskSchemas } from "./tasksSchema.js";

const Putters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
// PUT /api/v1/tasks/:taskId/status
    fastify.put<{
    Params: { taskId: string }
    Body: {
        status: 'TODO' | 'ACTIVE' | 'REVIEW' | 'CLOSED'
    }
    }>(
    '/:taskId/status',
    { schema: taskSchemas.updateTaskStatusSchema },
    async (req, res) => {
        const userId = getUserIdFromJWT(req, res, fastify)

        if (!userId) {
        res.code(401)
        return { error: 'You must be logged in in order to update task status' }
        }

        const taskId = Number(req.params.taskId)

        if (Number.isNaN(taskId)) {
        res.code(400)
        return { error: 'Invalid task id' }
        }

        const { status } = req.body

        const allowedStatus = ['TODO', 'ACTIVE', 'REVIEW', 'CLOSED'] as const

        if (!status || !allowedStatus.includes(status)) {
        res.code(400)
        return { error: 'Invalid task status' }
        }

        try {
        const result = await fastify.prisma.$transaction(async (tx) => {
            const task = await tx.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                projectId: true,
            },
            })

            if (!task) {
                console.log("AAAAAAAAAAAA NOT FOUND!")
            return {
                ok: false as const,
                code: 404,
                error: 'Task not found',
            }
            }

            const membership = await tx.projectParticipant.findUnique({
            where: {
                projectId_userId: {
                projectId: task.projectId,
                userId,
                },
            },
            select: {
                userId: true,
            },
            })

            if (!membership) {
            return {
                ok: false as const,
                code: 403,
                error: 'You are not a participant of this project',
            }
            }

            const updated = await tx.task.update({
            where: { id: taskId },
            data: {
                status,
                closedAt: status === 'CLOSED' ? new Date() : null,
            },
            select: {
                id: true,
                name: true,
                projectId: true,
                status: true,
                priority: true,
                description: true,
                createdAt: true,
                dueDate: true,
                closedAt: true,
            },
            })

            return {
            ok: true as const,
            task: updated,
            }
        })

        if (!result.ok) {
            res.code(result.code)
            return { error: result.error }
        }

        res.code(200)
        return {
            success: true,
            task: result.task,
        }
        } catch (error: any) {
        fastify.log.error(error)
        res.code(500)
        return { error: 'Unable to update task status' }
        }
    }
    )
}

export default Putters