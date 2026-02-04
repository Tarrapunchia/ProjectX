import fastify, {} from "fastify";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import { orgSchemas } from "./organizationsSchema.js";
const Putters = async (fastify, opts) => {
    // PUT /api/v1/organizations/modifyOrganizationInfos
    fastify.put('/modifyOrganizationInfos', { schema: orgSchemas.modifyOrgInfos }, async (req, res) => {
        // Controllo se loggati (vedo se ho JWT nei session token)
        let ownerId = getUserIdFromJWT(req, res, fastify);
        if (!ownerId) {
            res.code(400);
            return { error: 'You must be logged in in order to modify an Organization' };
        }
        const existing = await fastify.prisma.user.findUnique({
            where: { id: ownerId },
            select: { id: true },
        });
        if (!existing) {
            res.code(404);
            return { error: 'User not found' };
        }
        const { orgId, name, email, phone, city, address, cap, state, } = req.body;
        const existingOrg = await fastify.prisma.organization.findUnique({
            where: { id: orgId, ownerId: ownerId },
            select: { id: true },
        });
        if (!existingOrg) {
            res.code(404);
            return { error: 'Organization not found / no rights to modify' };
        }
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (email !== undefined)
            data.email = email;
        if (phone !== undefined)
            data.phone = phone;
        if (city !== undefined)
            data.city = city;
        if (address !== undefined)
            data.address = address;
        if (cap !== undefined)
            data.cap = cap;
        if (state !== undefined)
            data.state = state;
        if (Object.keys(data).length === 0) {
            res.code(400);
            return { error: 'No fields to update' };
        }
        try {
            const org = await fastify.prisma.organization.update({
                where: { id: orgId },
                data,
            });
            res.code(200);
            return org;
        }
        catch (error) {
            fastify.log.error(error);
            // nome duplicato
            if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
                res.code(400);
                return { error: 'Name already in use' };
            }
            res.code(400);
            return { error: 'Unable to update organization' };
        }
    });
};
export default Putters;
//# sourceMappingURL=putters.js.map