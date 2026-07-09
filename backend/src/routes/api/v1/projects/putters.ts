import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { projectSchemas } from "./projectsSchema.js";

async function canManageProject(
  userId: number,
  projectId: number,
  tx: any
) {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      organizationId: true,
      organization: {
        select: {
          ownerId: true,
        },
      },
      participants: {
        where: {
          userId,
        },
        include: {
          role: true,
        },
      },
    },
  })

  if (!project) {
    return {
      ok: false as const,
      code: 404,
      error: 'Project not found',
    }
  }

  const isOrganizationOwner = project.organization.ownerId === userId

  const isProjectOwner = project.participants.some((p: any) => {
    return p.role.name === 'OWNER'
  })

  if (!isOrganizationOwner && !isProjectOwner) {
    return {
      ok: false as const,
      code: 403,
      error: 'Only project owner or organization owner can modify this project',
    }
  }

  return {
    ok: true as const,
    project,
  }
}

const Putters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // PUT /api/v1/projects/:projectId
    // body is like
    // {
    //   "name": "Nuovo nome progetto",
    //   "description": "Nuova descrizione",
    //   "status": "ACTIVE"
    // }
    fastify.put<{
    Params: { projectId: string }
    Body: {
        name?: string
        description?: string | null
        status?: 'TODO' | 'ACTIVE' | 'REVIEW' | 'CLOSED'
    }
    }>(
    '/:projectId',
    { schema: projectSchemas.updateProjectSchema },
    async (req, reply) => {
        const authUserId = getUserIdFromJWT(req, reply, fastify)

        if (!authUserId) {
        reply.code(401)
        return { error: 'You must be logged in' }
        }

        const projectId = Number(req.params.projectId)

        if (Number.isNaN(projectId)) {
        reply.code(400)
        return { error: 'Invalid project id' }
        }

        const { name, description, status } = req.body

        if (
        name === undefined &&
        description === undefined &&
        status === undefined
        ) {
        reply.code(400)
        return { error: 'Provide at least one field to update' }
        }

        const allowedStatus = ['TODO', 'ACTIVE', 'REVIEW', 'CLOSED']

        if (status !== undefined && !allowedStatus.includes(status)) {
        reply.code(400)
        return { error: 'Invalid project status' }
        }

        try {
        const result = await fastify.prisma.$transaction(async (tx) => {
            const permission = await canManageProject(authUserId, projectId, tx)

            if (!permission.ok) {
            return permission
            }

            const data: any = {}

            if (name !== undefined) {
            const cleanName = name.trim()

            if (!cleanName) {
                return {
                ok: false as const,
                code: 400,
                error: 'Project name cannot be empty',
                }
            }

            data.name = cleanName
            }

            if (description !== undefined) {
            data.description = description ?? ''
            }

            if (status !== undefined) {
            data.status = status

            if (status === 'CLOSED') {
                data.closedAt = new Date()
            } else {
                data.closedAt = null
            }
            }

            const updatedProject = await tx.project.update({
            where: { id: projectId },
            data,
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                organizationId: true,
                createdAt: true,
                closedAt: true,
            },
            })

            const participants = await tx.projectParticipant.findMany({
                where: { projectId },
                select: { userId: true }
            })

            participants.map((p) => {
            fastify.wsSendToUser(
                p.userId,
                {
                    type: 'project:modified',
                    payload: null
            })
            })

            return {
            ok: true as const,
            project: updatedProject,
            }
        })

        if (!result.ok) {
            reply.code(result.code)
            return { error: result.error }
        }

        reply.code(200)
        return {
            success: true,
            project: result.project,
        }
        } catch (error: any) {
        fastify.log.error(error)

        if (error?.code === 'P2002') {
            reply.code(409)
            return { error: 'Project name already exists' }
        }

        reply.code(500)
        return { error: 'Unable to update project' }
        }
    }
    )

    // PUT /api/v1/projects/:projectId/participants
    // {
    //   "participants": [
    //         { "userId": 26, "role": "OWNER" },
    //         { "userId": 31, "role": "EDITOR" },
    //         { "userId": 45, "role": "VIEWER" }
    //     ]
    // }
    fastify.put<{
    Params: { projectId: string }
    Body: {
        participants: Array<{
            user: {
                id: number,
                name: string,
                surname: string,
                email: string
            }
            role: 'OWNER' | 'EDITOR' | 'VIEWER'
        }>
    }
    }>(
    '/:projectId/participants',
    { schema: projectSchemas.updateProjectParticipantsSchema },
    async (req, reply) => {
        const authUserId = getUserIdFromJWT(req, reply, fastify)

        if (!authUserId) {
        reply.code(401)
        return { error: 'You must be logged in' }
        }

        const projectId = Number(req.params.projectId)

        if (Number.isNaN(projectId)) {
        reply.code(400)
        return { error: 'Invalid project id' }
        }

        const { participants } = req.body

        if (!Array.isArray(participants) || participants.length === 0) {
        reply.code(400)
        return { error: 'participants array is required' }
        }

        const allowedRoles = ['OWNER', 'EDITOR', 'VIEWER'] as const

        const invalid = participants.find((p) => {
        return (
            !p ||
            typeof p.user.id !== 'number' ||
            Number.isNaN(p.user.id) ||
            !allowedRoles.includes(p.role as any)
        )
        })

        if (invalid) {
        reply.code(400)
        return { error: 'Invalid participants payload' }
        }

        const uniqueParticipants = Array.from(
        new Map(participants.map((p) => [p.user.id, p])).values()
        )

        const hasOwner = uniqueParticipants.some((p) => p.role === 'OWNER')

        if (!hasOwner) {
        reply.code(400)
        return { error: 'Project must have at least one OWNER' }
        }

        try {
        const result = await fastify.prisma.$transaction(async (tx) => {
            const permission = await canManageProject(authUserId, projectId, tx)

            if (!permission.ok) {
            return permission
            }

            const organizationId = permission.project.organizationId

            const userIds = uniqueParticipants.map((p) => p.user.id)

            const users = await tx.user.findMany({
            where: {
                id: {
                in: userIds,
                },
            },
            select: {
                id: true,
            },
            })

            const existingUserIds = new Set(users.map((u: any) => u.id))

            const missingUser = uniqueParticipants.find((p) => {
            return !existingUserIds.has(p.user.id)
            })

            if (missingUser) {
            return {
                ok: false as const,
                code: 404,
                error: `User ${missingUser.user.id} not found`,
            }
            }

            const orgMembers = await tx.organizationMember.findMany({
            where: {
                organizationId,
                userId: {
                in: userIds,
                },
            },
            select: {
                userId: true,
            },
            })

            const orgMemberIds = new Set(orgMembers.map((m: any) => m.userId))

            const notOrgMember = uniqueParticipants.find((p) => {
            return !orgMemberIds.has(p.user.id)
            })

            if (notOrgMember) {
            return {
                ok: false as const,
                code: 403,
                error: `User ${notOrgMember.user.id} is not a member of the organization`,
            }
            }

            const roles = await Promise.all(
            allowedRoles.map((roleName) =>
                tx.role.upsert({
                where: { name: roleName },
                update: {},
                create: {
                    name: roleName,
                    permissions: {
                    create:
                        roleName === 'OWNER'
                        ? {
                            bOwner: true,
                            bModPermissions: true,
                            bCreateTask: true,
                            bEditTask: true,
                            bCloseTask: true,
                            bInvite: true,
                            bRemoveUser: true,
                            }
                        : roleName === 'EDITOR'
                            ? {
                                bCreateTask: true,
                                bEditTask: true,
                                bCloseTask: true,
                                bInvite: true,
                            }
                            : {},
                    },
                },
                })
            )
            )

            const roleByName = new Map(roles.map((r: any) => [r.name, r]))

            await tx.projectParticipant.deleteMany({
            where: {
                projectId,
                userId: {
                notIn: userIds,
                },
            },
            })

            for (const p of uniqueParticipants) {
            const role = roleByName.get(p.role)

            if (!role) {
                return {
                ok: false as const,
                code: 400,
                error: `Invalid role ${p.role}`,
                }
            }

            await tx.projectParticipant.upsert({
                where: {
                projectId_userId: {
                    projectId,
                    userId: p.user.id,
                },
                },
                update: {
                roleId: role.id,
                },
                create: {
                projectId,
                userId: p.user.id,
                roleId: role.id,
                },
            })
            }

            const updatedParticipants = await tx.projectParticipant.findMany({
            where: { projectId },
            include: {
                user: {
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    email: true,
                },
                },
                role: {
                select: {
                    name: true,
                },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
            })
            const newOrgMembers = await fastify.prisma.organizationMember.findMany({
                where: { organizationId },
                select: { userId: true }
            })

            newOrgMembers.map((o: any) => {
            fastify.wsSendToUser(
                o.userId,
                {
                    type: 'project:modified',
                    payload: null
            })
            })


            return {
            ok: true as const,
            participants: updatedParticipants.map((p: any) => ({
                user: {
                id: p.user.id,
                name: p.user.name,
                surname: p.user.surname,
                email: p.user.email,
                },
                role: p.role.name,
                joinedAt: p.createdAt,
            })),
            }
        })

        if (!result.ok) {
            reply.code(result.code)
            return { error: result.error }
        }

        reply.code(200)
        return {
            success: true,
            participants: result.participants,
        }
        } catch (error: any) {
        fastify.log.error(error)

        if (error?.code === 'P2002') {
            reply.code(409)
            return { error: 'Duplicate project participant' }
        }

        if (error?.code === 'P2003') {
            reply.code(400)
            return { error: 'Foreign key constraint failed' }
        }

        reply.code(500)
        return { error: 'Unable to update project participants' }
        }
    }
    )
}

export default Putters