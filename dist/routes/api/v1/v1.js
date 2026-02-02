import fastify, {} from "fastify";
import users from "./users.js";
import organizations from "./organizations.js";
const V1 = async (fastify, opts) => {
    fastify.register(users, { prefix: 'users' });
    fastify.register(organizations, { prefix: 'organizations' });
};
export default V1;
//# sourceMappingURL=v1.js.map