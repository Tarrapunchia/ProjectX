import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
// import Getters from "./getters.js";
import Posters from "./posters.js";
import Deleters from "./deletes.js";
// import Putters from "./putters.js";

const V1: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.register(Posters)
    fastify.register(Deleters)
    // fastify.register(Putters)

}

export default V1