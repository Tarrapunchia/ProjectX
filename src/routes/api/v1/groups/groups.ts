import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
// import Getters from "./getters.js";
import Posters from "./posters.js";
// import Putters from "./putters.js";

const V1: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // fastify.register(Getters)
    fastify.register(Posters)
    // fastify.register(Putters)
    // fastify.register(Deleters)

}

export default V1