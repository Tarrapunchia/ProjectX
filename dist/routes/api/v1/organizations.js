import {} from 'fastify';
import { getUserIdFromJWT, setAuthCookie } from '../../../helpers/cookies.js';
import { orgSchemas } from './schemas/organizationsSchema.js';
const Organizations = async (fastify, opts) => {
    // GET /api/v1/organizations
    fastify.get('/', { schema: orgSchemas.getAllOrgs }, async (req, res) => {
        return fastify.prisma.organization.findMany();
    });
    // GET /api/v1/organizations/:id/profile
    fastify.get('/:id/profile', { schema: orgSchemas.getOrgProfile }, async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.code(400);
            return { error: 'invalid id' };
        }
        const org = await fastify.prisma.organization.findUnique({ where: { id }, });
        if (!org) {
            res.code(404);
            return { error: 'Organization not found' };
        }
        return {
            id: org.id,
            name: org.name,
            email: org.email,
            phone: org.phone,
            city: org.city,
            address: org.address,
            cap: org.cap,
            state: org.state,
            ownerId: org.ownerId
        };
    });
    // GET /api/v1/organizations/:id/members
    // TODO: getOrgMembers - limitare la visibilita' agli iscritti all'org?
    fastify.get('/:id/members', { schema: orgSchemas.getOrgMembers }, async (req, res) => {
        // Controllo se loggati (vedo se ho JWT nei session token)
        let ownerId = getUserIdFromJWT(req, res, fastify);
        if (!ownerId) {
            res.code(400);
            return { error: 'You must be logged in in order to see the Organization\'s members' };
        }
        const orgId = Number(req.params.id);
        if (Number.isNaN(orgId)) {
            res.code(400);
            return { error: 'invalid id' };
        }
        const org = await fastify.prisma.organization.findUnique({
            where: { id: orgId },
            select: { id: true, name: true },
        });
        if (!org) {
            res.code(404);
            return { error: 'Organization not found' };
        }
        // faccio JOIN
        const memberships = await fastify.prisma.organizationMember.findMany({
            where: { organizationId: orgId },
            include: {
                user: true
            },
            orderBy: { userId: 'asc' },
        });
        const members = memberships.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            surname: m.user.surname,
            email: m.user.email,
            phone: m.user.phone,
            jobQualifier: m.user.jobQualifier,
            joinedAt: m.createdAt,
        }));
        return res.send(
        // organizationId: org.id,
        // organizationName: org.name,
        // count: members.length,
        members);
    });
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
        const { userId } = req.body;
        if (!userId || Number.isNaN(Number(userId))) {
            res.code(400);
            return { error: 'userId is required' };
        }
        const actorId = getUserIdFromJWT(req, res, fastify);
        if (!actorId)
            return;
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
            where: { id: userId },
            select: { id: true },
        });
        if (!user) {
            res.code(404);
            return { error: 'User not found' };
        }
        // crea membership (gestiscendo duplicati)
        try {
            const membership = await fastify.prisma.organizationMember.create({
                data: { organizationId, userId },
            });
            return res.code(201).send({
                success: true,
                organizationId,
                userId,
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
export default Organizations;
//# sourceMappingURL=organizations.js.map