import fastify, { type FastifyInstance } from "fastify"
import { type Notification } from "@prisma/client"
import {safeSend} from "../../../../plugins/websockets/websocket.js"


const sendNotification = (notification: Notification) => {
    websocketPlugin.
}