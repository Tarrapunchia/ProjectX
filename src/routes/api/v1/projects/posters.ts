// import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
// import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
// import { orgSchemas } from "./projectsSchema.js";

// const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
//     // // POST /api/v1/organizations/addOrganization
//         fastify.post<{
//             Body: {
//                 name: string
//                 email: string
//                 phone: string
//                 city?: string | null
//                 address?: string | null
//                 cap?: string | null
//                 state?: string | null
//             }
//             }>(
//             '/addOrganization',
//             { schema: orgSchemas.createOrg },
//             async (req, res) => {
//                 // Controllo se loggati (vedo se ho JWT nei session token)
//                 let ownerId = getUserIdFromJWT(req, res, fastify)
//                 if (!ownerId) {
//                     res.code(400)
//                     return { error: 'You must be logged in in order to create an Organization' }
//                 }
    
//                 const {
//                     name,
//                     email,
//                     phone,
//                     city,
//                     address,
//                     cap,
//                     state,
//                 } = req.body
    
//                 // validazione (minima)
//                 if (!name || !email || !phone) {
//                     res.code(400)
//                     return { error: 'All fields are required' }
//                 }
    
//                 try {
//                     const organization = await fastify.prisma.organization.create({
//                         data: {
//                             name,
//                             email,
//                             phone,
//                             city: city ?? null,
//                             address: address ?? null,
//                             cap: cap ?? null,
//                             state: state ?? null,
//                             ownerId: ownerId
//                         },
//                     })
    
//                     // Aggiunge l'owner ai membri
//                     const membership = await fastify.prisma.organizationMember.create({
//                         data: { organizationId: organization.id, userId: ownerId },
//                     })
    
//                     res.code(201)
//                     return organization
//                 } catch (error: any) {
//                     fastify.log.error(error)
    
//                     // msg errore per nome org duplicato
//                     if (error?.code === 'P2002') {
//                         res.code(400)
//                         return { error: 'Name already in use' }
//                     }
    
//                     res.code(400)
//                     return { error: 'Unable to create the organization' }
//                 }
//             }
//         )
    
//         // POST /api/v1/organizations/:id/addMember
//         fastify.post<{
//         Params: { id: string }
//         Body: { userId: number }
//         }>(
//         '/:id/addMember',
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
    
//             // solo owner puo' espandere ruoli
//             if (org.ownerId !== actorId) {
//                 res.code(403)
//                 return { error: 'Only the owner can add members' }
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
//                 const membership = await fastify.prisma.organizationMember.create({
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
// }

// export default Posters