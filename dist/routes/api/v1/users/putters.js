import fastify, {} from "fastify";
import { userSchemas } from "./usersSchemas.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
const Putters = async (fastify, opts) => {
    // PUT /api/v1/users/modifyUserProfile
    fastify.put('/modifyUserProfile', { schema: userSchemas.modUser }, async (req, res) => {
        const userId = getUserIdFromJWT(req, res, fastify);
        if (!userId) {
            res.code(401);
            return { error: 'Unauthorized' };
        }
        const existing = await fastify.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!existing) {
            res.code(404);
            return { error: 'User not found' };
        }
        const { name, surname, email, phone, jobQualifier, city, address, cap, state, } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (surname !== undefined)
            data.surname = surname;
        if (email !== undefined)
            data.email = email;
        if (phone !== undefined)
            data.phone = phone;
        if (jobQualifier !== undefined)
            data.jobQualifier = jobQualifier;
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
            const user = await fastify.prisma.user.update({
                where: { id: userId },
                data,
            });
            res.code(200);
            return user;
        }
        catch (error) {
            fastify.log.error(error);
            // email duplicata
            if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
                res.code(400);
                return { error: 'Email already in use' };
            }
            res.code(400);
            return { error: 'Unable to update user' };
        }
    });
    // PUT /api/v1/users/modifyUserPassword
    fastify.put('/modifyUserPassword', { schema: userSchemas.modPassword }, async (req, res) => {
        const userId = getUserIdFromJWT(req, res, fastify);
        if (!userId) {
            res.code(401);
            return { error: 'Unauthorized' };
        }
        const existing = await fastify.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (!existing) {
            res.code(404);
            return { error: 'User not found' };
        }
        const { password, } = req.body;
        // if (password != repeatPassword) // dovrebbe esser gestito direttamente nel form da FE
        // TODO: modPassword - HASH PW
        const hashedPw = password;
        try {
            const user = await fastify.prisma.user.update({
                where: { id: userId },
                data: {
                    hashedPw: hashedPw
                },
            });
            // TODO Cambio pw fa fare logout?
            res.code(200);
            return { success: true };
        }
        catch (error) {
            fastify.log.error(error);
            res.code(400);
            return { error: 'Unable to update the password' };
        }
    });
};
export default Putters;
//# sourceMappingURL=putters.js.map