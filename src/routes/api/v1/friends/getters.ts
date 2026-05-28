import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { friendsSchema } from "./friendsSchema.js";
import { getUserIdFromJWT } from "../../../../helpers/cookies.js";
import type { FriendshipStatus } from "@prisma/client";

const Getters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {

        // GET /api/v1/friends
        fastify.get<{
            Params: { status: FriendshipStatus }
        }>(
        '/:status',
        { schema: friendsSchema.getFriends },
        async (req, res) => {
            const status = req.params.status
            const userId = getUserIdFromJWT(req, res, fastify)
            if (!userId) {
                res.code(500)
                return res.send({ error: 'You must be connected in order to see your friends list.'})
            } 

            const [sent, received] = await Promise.all([
            fastify.prisma.friendship.findMany({
                where: { senderId: userId, status: status },
                include: {
                receiver: { select: { id: true, name: true, surname: true, email: true, jobQualifier: true, isLoggedIn: true, avatarUrl: true } },
                },
            }),
            fastify.prisma.friendship.findMany({
                where: { receiverId: userId, status: status },
                include: {
                sender: { select: { id: true, name: true, surname: true, email: true, jobQualifier: true, isLoggedIn: true, avatarUrl: true } },
                },
            }),
            ])

            // deduplico
            const map = new Map<number, any>()

            for (const f of sent) map.set(f.receiver.id, f.receiver)
            for (const f of received) map.set(f.sender.id, f.sender)

            const friends = Array.from(map.values()).sort((a, b) => a.surname.localeCompare(b.surname))

            return res.send({
                userId,
                count: friends.length,
                friends,
            })
        }
        )


    // GET /api/v1/friends/requests/pending
    fastify.get(
        '/requests/pending',
    {
        schema: friendsSchema.getPendingRequests,
    },
    async (req, res) => {
        const authUser = getUserIdFromJWT(req, res, fastify);

        if (!authUser) {
        res.code(401);
        return { error: 'Unauthorized' };
        }

        const requests = await fastify.prisma.friendship.findMany({
        where: {
            receiverId: authUser,
            status: 'PENDING',
        },
        include: {
            sender: {
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                avatarUrl: true,
                isLoggedIn: true,
            },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        });

        return res.code(200).send({
        success: true,
        requests,
        });
    }
    );
}

export default Getters