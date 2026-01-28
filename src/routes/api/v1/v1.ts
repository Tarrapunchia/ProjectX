import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import users from "./users.js";

const V1: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.register(users, { prefix: 'users'})
}

export default V1