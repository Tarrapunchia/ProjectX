import fastify, {} from "fastify";
import V1 from "./v1/v1.js";
import Upload from "./uploads.js";
const Api = async (fastify, opts) => {
    fastify.register(V1, { prefix: 'v1' }),
        fastify.register(Upload, { prefix: 'uploads' });
};
export default Api;
//# sourceMappingURL=api.js.map