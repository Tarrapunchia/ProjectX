import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { projectSchemas } from "./projectsSchema.js";

const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // // POST /api/v1/organizations/addProject
    fastify.post<{
    Body: { name: string; orgId: number, status: 'TODO' | 'ACTIVE' | 'REVIEW' | 'CLOSED', description?: 'string', closedAt: Date }
    }>(
    '/addProject',
    { schema: projectSchemas.createProjectSchema },
    async (req, res) => {
        const ownerId = getUserIdFromJWT(req, res, fastify)
        if (!ownerId) {
            res.code(401)
            return { error: 'You must be logged in in order to create a Project' }
        }

        const { name, orgId, status, description, closedAt } = req.body

        if (!name || !orgId) {
            res.code(400)
            return { error: 'All fields are required' }
        }

        // verifico che org esista
        const org = await fastify.prisma.organization.findUnique({
            where: { id: orgId },
            select: { id: true, ownerId: true },
        })
        if (!org) {
            res.code(404)
            return { error: 'Organization not found' }
        }

        // (opzionale) permesso: solo owner dell'org può creare progetti???
        // if (org.ownerId !== ownerId) {
        //     res.code(403)
        //     return { error: 'Only the organization owner can create projects' }
        // }

        // vado ad usare $transaction che mi crea un client prisma ad hoc per la transazione in atto
        // in modo che tutto quello che viene eseguito viene eseguito atomicamente (se anche solo una
        // delle query che esegue fallisce fa il rollback, comodo)
        try {
            const created = await fastify.prisma.$transaction(async (tx) => {
                // 1) creo il progetto
                const project = await tx.project.create({
                    data: {
                        name,
                        organizationId: orgId,
                        status: status,
                        description: description ?? '',
                        closedAt: closedAt
                    },
                })

                // 2) trova o crea il ruolo OWNER (in questo caso, upsert fa update or insert)
                const ownerRole = await tx.role.upsert({
                    where: { name: 'OWNER' },
                    update: {},
                    create: {
                        name: 'OWNER',
                        permissions: {
                            create: { bOwner: true },
                        },
                    },
                })

                // 3) aggiunge il creatore come participant OWNER
                await tx.projectParticipant.create({
                    data: {
                        projectId: project.id,
                        userId: ownerId,
                        roleId: ownerRole.id,
                    },
                })

                // 4) se il creatore non e' anche l'owner della organizzazione, lo aggiungo
                if (org.ownerId != ownerId) {
                    await tx.projectParticipant.create({
                        data: {
                            projectId: project.id,
                            userId: ownerId,
                            roleId: ownerRole.id,
                        },
                    })
                }

                return project
            })

            res.code(201)
            return created
        } catch (error: any) {
            fastify.log.error(error)

            if (error?.code === 'P2002') {
                res.code(409)
                return { error: 'Duplicate constraint' }
            }

            if (error?.code === 'P2003') {
                res.code(400)
                return { error: 'Foreign key constraint (orgId/roleId/userId invalid)' }
            }

            res.code(400)
            return { error: 'Unable to create project' }
        }
        }
    )
    fastify.post<{
    Params: { projectId: string }
    Body: {
        participants: Array<{
            user: {
                id: number,
                name: string,
                surname: string,
                email: string
            }
            role: 'OWNER' | 'EDITOR' | 'VIEWER',
            joinedAt: Date
        }>
    }
    }>(
    '/:projectId/participants',
    { schema: projectSchemas.addProjectParticipantsSchema },
    async (req, reply) => {
        const authUserId = getUserIdFromJWT(req, reply, fastify)

        if (!authUserId) {
        reply.code(401)
        return { error: 'You must be logged in in order to add project participants' }
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

        try {
        const result = await fastify.prisma.$transaction(async (tx) => {
            const project = await tx.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                organizationId: true,
            },
            })

            if (!project) {
            return {
                ok: false as const,
                code: 404,
                error: 'Project not found',
            }
            }

            const authMembership = await tx.projectParticipant.findUnique({
            where: {
                projectId_userId: {
                projectId,
                userId: authUserId,
                },
            },
            include: {
                role: true,
            },
            })

            if (!authMembership) {
            return {
                ok: false as const,
                code: 403,
                error: 'You are not a participant of this project',
            }
            }

            if (authMembership.role.name !== 'OWNER' && authMembership.role.name !== 'EDITOR') {
            return {
                ok: false as const,
                code: 403,
                error: 'You do not have permission to add participants to this project',
            }
            }

            const uniqueParticipants = Array.from(
            new Map(participants.map((p) => [p.user.id, p])).values()
            )

            const users = await tx.user.findMany({
            where: {
                id: {
                in: uniqueParticipants.map((p) => p.user.id),
                },
            },
            select: {
                id: true,
            },
            })

            const existingUserIds = new Set(users.map((u) => u.id))

            const missingUser = uniqueParticipants.find((p) => !existingUserIds.has(p.user.id))

            if (missingUser) {
            return {
                ok: false as const,
                code: 404,
                error: `User ${missingUser.user.id} not found`,
            }
            }

            const orgMembers = await tx.organizationMember.findMany({
            where: {
                organizationId: project.organizationId,
                userId: {
                in: uniqueParticipants.map((p) => p.user.id),
                },
            },
            select: {
                userId: true,
            },
            })

            const orgMemberIds = new Set(orgMembers.map((m) => m.userId))

            const notOrgMember = uniqueParticipants.find((p) => !orgMemberIds.has(p.user.id))

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

            const roleByName = new Map(roles.map((r) => [r.name, r]))

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

            return {
            ok: true as const,
            participants: updatedParticipants.map((p) => ({
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
        return { error: 'Unable to add project participants' }
        }
    }
    )
}

export default Posters