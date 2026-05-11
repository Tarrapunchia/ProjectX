import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { groupSchemas } from "./groupsSchema.js";

const Deleters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // DELETE /api/v1/groups/:id/leave
    fastify.delete<{ Params: { id: string } }>(
    '/:id/leave',
    { schema: groupSchemas.leaveGroupSchema },
    async (req, reply) => {
        const userId = getUserIdFromJWT(req, reply, fastify)
        if (!userId) {
            reply.code(401)
            return { error: 'You must be logged in in order to leave a group' }
        }

        const groupId = Number(req.params.id)
        if (Number.isNaN(groupId)) {
            reply.code(400)
            return { error: 'invalid group id' }
        }

        try {
            const result = await fastify.prisma.$transaction(async (tx) => {
                const groupExists = await tx.group.findUnique({
                    where: { id: groupId },
                    select: { id: true },
                })
                if (!groupExists) {
                    reply.code(404)
                    return { error: 'Group not found' }
                }
                // check membership
                const membership = await tx.groupParticipant.findUnique({
                    where: { groupId_userId: { groupId, userId } },
                    select: { groupId: true },
                })
                if (!membership) {
                    reply.code(404)
                    return { error: 'You are not a member of this group' }
                }

                // delete membership (PK composta)
                await tx.groupParticipant.delete({
                    where: { groupId_userId: { groupId, userId } },
                })

                // controllo se il gruppo e' vuoto => cancello tutto
                // conta membri rimasti
                const remaining = await tx.groupParticipant.count({
                    where: { groupId },
                })

                if (remaining === 0) {
                    // cancella chatroom di gruppo -> cascata RoomMessage
                    await tx.chatRoom.deleteMany({
                        where: { groupId },
                    })

                    // cancella gruppo (cascata su GroupParticipant già vuoto)
                    await tx.group.delete({
                        where: { id: groupId },
                    })

                    return { ok: true as const, deletedGroup: true, remaining: 0 }
                }

                return { ok: true as const, deletedGroup: false, remaining }
            })

            if (!result.ok) {
                reply.code(400)
                return { error: result.error }
            }

            reply.code(200)
            return {
                success: true,
                deletedGroup: result.deletedGroup,
                remainingMembers: result.remaining,
            }
            } catch (err) {
                fastify.log.error(err)
                reply.code(500)
                return { error: 'Internal error' }
            }
        }
    )

//         // POST /api/v1/organizations/:id/removeMember
//         fastify.post<{
//         Params: { id: string }
//         Body: { userId: number }
//         }>(
//         '/:id/removeMember',
//         { schema: orgSchemas.addMember },
//         async (req, res) => {
//             const organizationId = Number(req.params.id)
//             if (Number.isNaN(organizationId)) {
//                 res.code(400)
//                 return { error: 'invalid organization id' }
//             }
    
//             const { userId } = req.body
//             if (!userId || Number.isNaN(Number(userId))) {
//                 res.code(400)
//                 return { error: 'userId is required' }
//             }
    
//             const actorId = getUserIdFromJWT(req, res, fastify)
//             if (!actorId) return
    
//             // org esiste?
//             const org = await fastify.prisma.organization.findUnique({
//                 where: { id: organizationId },
//                 select: { id: true, ownerId: true },
//             })
//             if (!org) {
//                 res.code(404)
//                 return { error: 'Organization not found' }
//             }
    
//             // solo owner puo' cancellare utenti
//             if (org.ownerId !== actorId) {
//                 res.code(403)
//                 return { error: 'Only the owner can remove members' }
//             }
    
//             // user esiste?
//             const user = await fastify.prisma.user.findUnique({
//                 where: { id: userId },
//                 select: { id: true },
//             })
//             if (!user) {
//                 res.code(404)
//                 return { error: 'User not found' }
//             }
    
//             // crea membership (gestiscendo duplicati)
//             try {
//                 const membership = await fastify.prisma.organizationMember.delete({
//                     where: { userId: userId, organizationId: or}
//                     data: { organizationId, userId },
//                 })
    
//                 return res.code(201).send({
//                     success: true,
//                     organizationId,
//                     userId,
//                     joinedAt: membership.createdAt,
//             })
//             } catch (error: any) {
//             // duplicato (già membro) → Prisma unique/PK violation
//             // sqlite = P2002 (unique constraint)
//                 if (error?.code === 'P2002') {
//                     res.code(409)
//                     return { error: 'User is already a member' }
//             }
    
//             fastify.log.error(error)
//                 res.code(400)
//                 return { error: 'Unable to add member' }
//             }
//         }
//     )
}

export default Deleters