import type { FastifyInstance } from "fastify"

const getMsgs = async (server: FastifyInstance, roomKey: string) => {
    await server.prisma.roomMessage.findMany({
        where: {
            room: { key: roomKey }, // es: "org:12" o "proj:12:5"
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
        select: {
            id: true,
            content: true,
            createdAt: true,
            sender: { select: { id: true, name: true, surname: true } },
        },
    })
}

export default getMsgs