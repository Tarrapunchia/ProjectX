import fastify, {} from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { orgSchemas } from "./organizationsSchema.js";
const Posters = async (fastify, opts) => {
    // // POST /api/v1/organizations/addOrganization
    fastify.post('/addOrganization', { schema: orgSchemas.createOrg }, async (req, res) => {
        // Controllo se loggati (vedo se ho JWT nei session token)
        let ownerId = getUserIdFromJWT(req, res, fastify);
        if (!ownerId) {
            res.code(400);
            return { error: 'You must be logged in in order to create an Organization' };
        }
        const { name, email, phone, city, address, cap, state, } = req.body;
        // validazione (minima)
        if (!name || !email || !phone) {
            res.code(400);
            return { error: 'All fields are required' };
        }
        try {
            const organization = await fastify.prisma.organization.create({
                data: {
                    name,
                    email,
                    phone,
                    city: city !== null && city !== void 0 ? city : null,
                    address: address !== null && address !== void 0 ? address : null,
                    cap: cap !== null && cap !== void 0 ? cap : null,
                    state: state !== null && state !== void 0 ? state : null,
                    ownerId: ownerId
                },
            });
            // Aggiunge l'owner ai membri
            const membership = await fastify.prisma.organizationMember.create({
                data: { organizationId: organization.id, userId: ownerId },
            });
            res.code(201);
            return organization;
        }
        catch (error) {
            fastify.log.error(error);
            // msg errore per nome org duplicato
            if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
                res.code(400);
                return { error: 'Name already in use' };
            }
            res.code(400);
            return { error: 'Unable to create the organization' };
        }
    });
    // POST /api/v1/organizations/:id/addMember
    fastify.post('/:id/addMember', { schema: orgSchemas.addMember }, async (req, res) => {
        const organizationId = Number(req.params.id);
        if (Number.isNaN(organizationId)) {
            res.code(400);
            return { error: 'invalid organization id' };
        }
        const { email } = req.body;
        if (!email) {
            res.code(400);
            return { error: 'email address is required' };
        }
        const actorId = getUserIdFromJWT(req, res, fastify);
        if (!actorId) {
            res.code(400);
            return { error: "You must be logged in to perform the action" };
        }
        // org esiste?
        const org = await fastify.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { id: true, ownerId: true },
        });
        if (!org) {
            res.code(404);
            return { error: 'Organization not found' };
        }
        // solo owner puo' espandere ruoli
        if (org.ownerId !== actorId) {
            res.code(403);
            return { error: 'Only the owner can add members' };
        }
        // user esiste?
        const user = await fastify.prisma.user.findUnique({
            where: { email: email },
            select: { email: true, id: true },
        });
        if (!user) {
            res.code(404);
            return { error: 'User not found' };
        }
        // crea membership (gestiscendo duplicati)
        try {
            const membership = await fastify.prisma.organizationMember.create({
                data: { organizationId, userId: user.id },
            });
            return res.code(201).send({
                success: true,
                organizationId,
                email,
                joinedAt: membership.createdAt,
            });
        }
        catch (error) {
            // duplicato (già membro) → Prisma unique/PK violation
            // sqlite = P2002 (unique constraint)
            if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
                res.code(409);
                return { error: 'User is already a member' };
            }
            fastify.log.error(error);
            res.code(400);
            return { error: 'Unable to add member' };
        }
    });
};
export default Posters;
//# sourceMappingURL=posters.js.map