import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { groupSchemas } from "./groupsSchema.js";

const Deleters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // DELETE /api/v1/group/:groupId/leave
    fastify.delete<{ Params: { groupId: string } }>(
    '/:groupId/leave',
    { schema: groupSchemas.leaveGroupSchema },
    async (req, res) => {
        const activeId = getUserIdFromJWT(req, res, fastify)
        if (!activeId) {
            res.code(401)
            return { error: 'You must be logged in in order to leave a group' }
        }
        const groupId = Number(req.params.groupId)

        if (!Number.isFinite(groupId)) {
            res.code(400)
            return { error: 'All fields are required' }
        }

        // verifico che gruppo esista e che l'utente ne faccia parte
        const group = await fastify.prisma.group.findFirst({
            where: {
                id: groupId,
                participants: { some: { userId: activeId } },
            },
            select: { id: true, name: true },
        })
        if (!group) {
            res.code(404)
            return { error: 'Group not found' }
        }

        try {
            await fastify.prisma.groupParticipant.delete({
                where: { groupId_userId: { groupId, userId: activeId } }
            })
            res.code(200)
            return { success: true }
        } catch (error: any) {
            fastify.log.error(error)

            if (error?.code === 'P2002') {
                res.code(409)
                return { error: 'Duplicate constraint' }
            }

            if (error?.code === 'P2003') {
                res.code(400)
                return { error: 'Foreign key constraint ' }
            }

            res.code(400)
            return { error: 'Unable to add member' }
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