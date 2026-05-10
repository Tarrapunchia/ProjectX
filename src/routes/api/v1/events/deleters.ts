// import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
// import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
// import { taskSchemas } from "./eventsSchema.js";

// const Deleters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
//     // DELETE /api/v1/tasks/:id/remove
//     fastify.delete<{
//         Params: { id: string }
//     }>(
//         '/:id/remove',
//         { schema: taskSchemas.deleteTaskSchema },
//         async (req, res) => {
//             try {
                
//                 const userId = getUserIdFromJWT(req, res, fastify)
//                 if (!userId) {
//                     res.code(401)
//                     return { error: 'You must be logged in in order to delete a Task' }
//                 }
    
//                 const taskId = Number(req.params.id)
//                 if (Number.isNaN(taskId)) {
//                     res.code(400)
//                     return { error: 'invalid task id' }
//                 }
    
//                 // const transaction = await fastify.prisma.$transaction(async (tx) => {
//                 const task = await fastify.prisma.task.findUnique({
//                     where: { id: taskId },
//                     select: { projectId: true }
//                 })
    
//                 if (!task) {
//                     res.code(404)
//                     return ({ error: 'Task not found' })
//                 }
    
//                 // verifico di avere i permessi
//                 const membership = await fastify.prisma.projectParticipant.findUnique({
//                 where: {
//                     projectId_userId: { projectId: task.projectId, userId: userId },
//                 },
//                 include: {
//                     role: { select: { name: true } }, // RoleName enum
//                 },
//                 })
    
//                 if (!membership) {
//                     res.code(403)
//                     return { error: 'You are not a participant of this project' }
//                 }
    
//                 if (membership.role.name !== 'OWNER') {
//                     res.code(403)
//                     return { error: 'Insufficient permissions (OWNER required)' }
//                 }
                
    
//                 // tutto ok a sto punto, cancello la task
//                 const remove = await fastify.prisma.task.delete({
//                     where: { id: taskId }
//                 })

//                 res.code(200)
//                 return { success: true }
//             } catch (error) {
//                 res.code(400)
//                 return ({ error: error })
//             }

//         }
//     )

// }
// // const Deleters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
// //         // POST /api/v1/organizations/:id/removeMember
// //         fastify.post<{
// //         Params: { id: string }
// //         Body: { userId: number }
// //         }>(
// //         '/:id/removeMember',
// //         { schema: orgSchemas.addMember },
// //         async (req, res) => {
// //             const organizationId = Number(req.params.id)
// //             if (Number.isNaN(organizationId)) {
// //                 res.code(400)
// //                 return { error: 'invalid organization id' }
// //             }
    
// //             const { userId } = req.body
// //             if (!userId || Number.isNaN(Number(userId))) {
// //                 res.code(400)
// //                 return { error: 'userId is required' }
// //             }
    
// //             const actorId = getUserIdFromJWT(req, res, fastify)
// //             if (!actorId) return
    
// //             // org esiste?
// //             const org = await fastify.prisma.organization.findUnique({
// //                 where: { id: organizationId },
// //                 select: { id: true, ownerId: true },
// //             })
// //             if (!org) {
// //                 res.code(404)
// //                 return { error: 'Organization not found' }
// //             }
    
// //             // solo owner puo' cancellare utenti
// //             if (org.ownerId !== actorId) {
// //                 res.code(403)
// //                 return { error: 'Only the owner can remove members' }
// //             }
    
// //             // user esiste?
// //             const user = await fastify.prisma.user.findUnique({
// //                 where: { id: userId },
// //                 select: { id: true },
// //             })
// //             if (!user) {
// //                 res.code(404)
// //                 return { error: 'User not found' }
// //             }
    
// //             // crea membership (gestiscendo duplicati)
// //             try {
// //                 const membership = await fastify.prisma.organizationMember.delete({
// //                     where: { userId: userId, organizationId: or}
// //                     data: { organizationId, userId },
// //                 })
    
// //                 return res.code(201).send({
// //                     success: true,
// //                     organizationId,
// //                     userId,
// //                     joinedAt: membership.createdAt,
// //             })
// //             } catch (error: any) {
// //             // duplicato (già membro) → Prisma unique/PK violation
// //             // sqlite = P2002 (unique constraint)
// //                 if (error?.code === 'P2002') {
// //                     res.code(409)
// //                     return { error: 'User is already a member' }
// //             }
    
// //             fastify.log.error(error)
// //                 res.code(400)
// //                 return { error: 'Unable to add member' }
// //             }
// //         }
// //     )
// // }

// export default Deleters