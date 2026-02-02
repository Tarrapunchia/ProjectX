import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import users from "./users.js";
import organizations from "./organizations.js";

const V1: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.register(users, { prefix: 'users'})
    fastify.register(organizations, { prefix: 'organizations'})
}

export default V1