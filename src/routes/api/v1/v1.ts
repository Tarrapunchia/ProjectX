import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import Users from "./users/users.js";
import Debug from "./debug/debug.js";
import Organizations from "./organizations/organizations.js";
import Projects from "./projects/projects.js";
import Tasks from "./tasks/tasks.js";
import Messages from "./messages/messages.js";
import Files from "./files/files.js"

const V1: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.register(Users, { prefix: 'users'})
    fastify.register(Organizations, { prefix: 'organizations'})
    fastify.register(Projects, { prefix: 'projects'})
    fastify.register(Tasks, { prefix: 'tasks'})
    fastify.register(Messages, { prefix: 'messages'})
    fastify.register(Files, { prefix: 'files'})
    fastify.register(Debug, { prefix: 'debug'})
}

export default V1