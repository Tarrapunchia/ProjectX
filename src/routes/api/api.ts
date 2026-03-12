import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import V1 from "./v1/v1.js";
import Upload from "./upload.js"

const Api: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.register(V1, { prefix: 'v1'}),
    fastify.register(Upload, { prefix: 'upload' })
}

export default Api