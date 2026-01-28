import fastify, {} from "fastify";
import V1 from "./v1/v1.js";
const Api = async (fastify, opts) => {
    fastify.register(V1, { prefix: 'v1' });
};
export default Api;
//# sourceMappingURL=api.js.map