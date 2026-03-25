import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import V1 from "./v1/v1.js";
import Upload from "./uploads.js";
import Delete from "./deletes.js"

const Api: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.register(V1, { prefix: 'v1'})
    // fastify.register(Upload, {prefix: 'uploads'})
	// fastify.register(Delete)
}

export default Api