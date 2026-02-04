import fastify, {} from "fastify";
import Getters from "./getters.js";
import Posters from "./posters.js";
import Putters from "./putters.js";
const V1 = async (fastify, opts) => {
    fastify.register(Getters);
    fastify.register(Posters);
    fastify.register(Putters);
    // fastify.register(Deleters)
};
export default V1;
//# sourceMappingURL=users.js.map