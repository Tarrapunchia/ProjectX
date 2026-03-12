import fastify, {} from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { projectSchemas } from "./projectsSchema.js";
const Posters = async (fastify, opts) => {
    // // POST /api/v1/organizations/addProject
    fastify.post('/addProject', { schema: projectSchemas.createProjectSchema }, async (req, res) => {
        const ownerId = getUserIdFromJWT(req, res, fastify);
        if (!ownerId) {
            res.code(401);
            return { error: 'You must be logged in in order to create a Project' };
        }
        const { name, orgId, status, description } = req.body;
        if (!name || !orgId) {
            res.code(400);
            return { error: 'All fields are required' };
        }
        // verifico che org esista
        const org = await fastify.prisma.organization.findUnique({
            where: { id: orgId },
            select: { id: true, ownerId: true },
        });
        if (!org) {
            res.code(404);
            return { error: 'Organization not found' };
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
                        description: description !== null && description !== void 0 ? description : ''
                    },
                });
                // // 2) trova o crea il ruolo OWNER (in questo caso, upsert fa update or insert)
                // const ownerRole = await tx.role.upsert({
                //     where: { name: 'OWNER' },
                //     update: {},
                //     create: {
                //         name: 'OWNER',
                //         permissions: {
                //             create: { bOwner: true },
                //         },
                //     },
                // })
                // 2) trova o crea il ruolo OWNER (in questo caso, upsert fa update or insert)
                const ownerRole = await tx.role.findUnique({
                    where: { name: 'OWNER' },
                });
                if (!ownerRole)
                    throw ('error');
                // 3) aggiunge il creatore come participant OWNER
                await tx.projectParticipant.create({
                    data: {
                        projectId: project.id,
                        userId: ownerId,
                        roleId: ownerRole.id,
                    },
                });
                // 4) se il creatore non e' anche l'owner della organizzazione, lo aggiungo
                if (org.ownerId != ownerId) {
                    await tx.projectParticipant.create({
                        data: {
                            projectId: project.id,
                            userId: ownerId,
                            roleId: ownerRole.id,
                        },
                    });
                }
                return project;
            });
            res.code(201);
            return created;
        }
        catch (error) {
            fastify.log.error(error);
            if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
                res.code(409);
                return { error: 'Duplicate constraint' };
            }
            if ((error === null || error === void 0 ? void 0 : error.code) === 'P2003') {
                res.code(400);
                return { error: 'Foreign key constraint (orgId/roleId/userId invalid)' };
            }
            res.code(400);
            return { error: 'Unable to create project' };
        }
    });
    //  // // POST /api/v1/organizations/addPartecipant
    // fastify.post<{
    // Body: { name: string; orgId: number }
    // }>(
    // '/addPartecipant',
    // { schema: projectSchemas.createProjectSchema },
    // async (req, res) => {
    //     const ownerId = getUserIdFromJWT(req, res, fastify)
    //     if (!ownerId) {
    //         res.code(401)
    //         return { error: 'You must be logged in in order to add a Partecipant' }
    //     }
    //     const { email, name, orgId } = req.body
    //     if (!name || !orgId || !email) {
    //         res.code(400)
    //         return { error: 'All fields are required' }
    //     }
    //     // verifico che org esista
    //     const org = await fastify.prisma.organization.findUnique({
    //         where: { id: orgId },
    //         select: { id: true, ownerId: true },
    //     })
    //     if (!org) {
    //         res.code(404)
    //         return { error: 'Organization not found' }
    //     }
    //     // verifico che user esista e che faccia parte dell'organizzazione
    //     try {
    //         const userIsAllowed
    //     }
    //     // (opzionale) permesso: solo owner dell'org può creare progetti???
    //     // if (org.ownerId !== ownerId) {
    //     //     res.code(403)
    //     //     return { error: 'Only the organization owner can create projects' }
    //     // }
    //     // vado ad usare $transaction che mi crea un client prisma ad hoc per la transazione in atto
    //     // in modo che tutto quello che viene eseguito viene eseguito atomicamente (se anche solo una
    //     // delle query che esegue fallisce fa il rollback, comodo)
    //     try {
    //         const created = await fastify.prisma.$transaction(async (tx) => {
    //             // 1) creo il progetto
    //             const project = await tx.project.create({
    //                 data: {
    //                     name,
    //                     organizationId: orgId,
    //                 },
    //             })
    //             // 2) trova o crea il ruolo OWNER (in questo caso, upsert fa update or insert)
    //             const ownerRole = await tx.role.upsert({
    //                 where: { name: 'OWNER' },
    //                 update: {},
    //                 create: {
    //                     name: 'OWNER',
    //                     permissions: {
    //                         create: { bOwner: true },
    //                     },
    //                 },
    //             })
    //             // 3) aggiunge il creatore come participant OWNER
    //             await tx.projectParticipant.create({
    //                 data: {
    //                     projectId: project.id,
    //                     userId: ownerId,
    //                     roleId: ownerRole.id,
    //                 },
    //             })
    //             // 4) se il creatore non e' anche l'owner della organizzazione, lo aggiungo
    //             if (org.ownerId != ownerId) {
    //                 await tx.projectParticipant.create({
    //                     data: {
    //                         projectId: project.id,
    //                         userId: ownerId,
    //                         roleId: ownerRole.id,
    //                     },
    //                 })
    //             }
    //             return project
    //         })
    //         res.code(201)
    //         return created
    //     } catch (error: any) {
    //         fastify.log.error(error)
    //         if (error?.code === 'P2002') {
    //             res.code(409)
    //             return { error: 'Duplicate constraint' }
    //         }
    //         if (error?.code === 'P2003') {
    //             res.code(400)
    //             return { error: 'Foreign key constraint (orgId/roleId/userId invalid)' }
    //         }
    //         res.code(400)
    //         return { error: 'Unable to create project' }
    //     }
    //     }
    // )
};
export default Posters;
//# sourceMappingURL=posters.js.map