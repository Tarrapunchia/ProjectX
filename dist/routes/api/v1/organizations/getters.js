import fastify, {} from "fastify";
import { orgSchemas } from "./organizationsSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
const Getters = async (fastify, opts) => {
    // GET /api/v1/organizations
    fastify.get('/', { schema: orgSchemas.getAllOrgs }, async (req, res) => {
        return fastify.prisma.organization.findMany();
    });
    // GET /api/v1/organizations/:id/organization
    fastify.get('/:id/organization', { schema: orgSchemas.getOrgProfile }, async (req, res) => {
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
};
export default Getters;
//# sourceMappingURL=getters.js.map