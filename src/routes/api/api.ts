import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import V1 from "./v1/v1.js";

const Api: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.register(V1, { prefix: 'v1'})
}

export default Api