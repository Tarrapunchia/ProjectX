import fastify, {} from "fastify";
import users from "./users.js";
const V1 = async (fastify, opts) => {
    fastify.register(users, { prefix: 'users' });
};
export default V1;
//# sourceMappingURL=v1.js.map