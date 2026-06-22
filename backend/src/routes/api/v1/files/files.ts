import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
// import Getters from "./getters.js";
import Posters from "./posters.js";
import Deleters from "./deletes.js";
import Getters from "./getters.js";

const V1: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.register(Posters)
    fastify.register(Deleters)
    fastify.register(Getters)

}

export default V1