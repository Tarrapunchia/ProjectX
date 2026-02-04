import fastify, {} from "fastify";
import Users from "./users/users.js";
import Debug from "./debug/debug.js";
import Organizations from "./organizations/organizations.js";
import Projects from "./projects/projects.js";
const V1 = async (fastify, opts) => {
    fastify.register(Users, { prefix: 'users' });
    fastify.register(Organizations, { prefix: 'organizations' });
    fastify.register(Projects, { prefix: 'projects' });
    fastify.register(Debug, { prefix: 'debug' });
};
export default V1;
//# sourceMappingURL=v1.js.map