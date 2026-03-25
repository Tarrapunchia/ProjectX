// import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
// import { friendsSchema } from "./friendsSchema.js";
// import { getUserIdFromJWT, setAuthCookie } from "../../../../helpers/cookies.js";
// import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";

// const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
//     // // POST /api/v1/friends/sendRequest/:id
//     fastify.post<{
//         Params: {
//             id: string
//         }
//         }>(
//         '/sendRequest/:id',
//         { schema: friendsSchema.getFriends },
//         async (req, res) => {
//             const receiverId = Number(req.params.id)

//             // validazione (minima)
//             if (Number.isNaN(receiverId) || receiverId <= 0 ) {
//                 res.code(400)
//                 return { error: 'Invalid friend id' }
//             }

//             const senderId = getUserIdFromJWT(req, res, fastify)
//             if (!senderId) {
//                 res.code(500)
//                 return res.send({ error: 'You must be connected in order to see your friends list.'})
//             } 

//             try {
//                 await fastify.prisma.$transaction(async (tx) => {
//                 const existing = await tx.friendship.findFirst({
//                     where: {
//                     OR: [
//                         { senderId, receiverId },
//                         { senderId: receiverId, receiverId: senderId },
//                     ],
//                     },
//                 })
//                 if (existing) return existing

//                 return tx.friendship.create({
//                     data: { senderId, receiverId, status: 'PENDING' },
//                 })
//                 })
//             }
//         }
//     )

//     // POST /api/v1/users/login
//     fastify.post<{
//     Body: { email: string; password: string }
//     }>(
//     '/login',
//     {
//         config: {
//         rateLimit: {
//             max: 5,
//             timeWindow: '15 minutes',
//         },
//         },
//         schema: userSchemas.login,
//     },
//     async (req, res) => {
//         const { email, password } = req.body
//         // check base
//         if (!email || !password) {
//             res.code(400)
//             return { error: 'Email and password are mandatory!' }
//         }

//         // prendo user
//         const user = await fastify.prisma.user.findUnique({
//             where: { email },
//         })

//         if (!user) {
//             res.code(401)
//             return { error: 'Invalid credentials' }
//         }

//         // verifica password
//         if (!user.hashedPw || !compareSync(password, String(user.hashedPw))) {
//             res.code(401)
//             return { error: 'Invalid credentials' }
//         }

//         // setto logged-in
//         await fastify.prisma.user.update({
//             where: { id: user.id },
//             data: { isLoggedIn: true },
//         })

//         // HTTP ONLY
//         const token = fastify.jwt.sign({ userId: user.id }, { expiresIn: '24h' })
//         setAuthCookie(res, token)

//         return res.send({
//             success: true,
//             user: { id: user.id, name: user.name, surname: user.surname, email: user.email },
//         })
//     }
//     )

//     // POST /api/v1/users/logout

//     fastify.post('/logout',
//         { schema: userSchemas.logout },
//         async (req, res) => {
//         let userId = getUserIdFromJWT(req, res, fastify)

//         res.clearCookie('session', { path: '/' })

//         if (userId) {
//             await fastify.prisma.user.update({
//                 where: { id: userId },
//                 data: { isLoggedIn: false },
//             })
//         }

//         // TODO: LOGOUT - INSERIRE GESTIONE WEBSOCKETS 

//         return res.send({ success: true })
//     })
// }

// export default Posters