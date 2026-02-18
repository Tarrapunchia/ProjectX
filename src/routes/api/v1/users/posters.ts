import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { userSchemas } from "./usersSchemas.js";
import { getUserIdFromJWT, setAuthCookie } from "../../../../helpers/cookies.js";

const Posters: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    // // POST /api/v1/users/addUser
    fastify.post<{
        Body: {
            name: string
            surname: string
            email: string
            phone: string
            jobQualifier: string
            password: string
            passwordRepeat: string
            city?: string | null
            address?: string | null
            cap?: string | null
            state?: string | null
        }
        }>(
        '/addUser',
        { schema: userSchemas.createUser },
        async (req, res) => {
            const {
            name,
            surname,
            email,
            phone,
            jobQualifier,
            password,
            passwordRepeat,
            city,
            address,
            cap,
            state,
            } = req.body

            // validazione (minima)
            if (!name || !surname || !email || !phone || !jobQualifier || !password || !passwordRepeat) {
            res.code(400)
            return { error: 'All fields are required' }
            }

            if (password !== passwordRepeat) {
            res.code(400)
            return { error: 'Passwords do not match' }
            }

            // Hash password (placeholder)
            const hashedPw = password

            try {
            const user = await fastify.prisma.user.create({
                data: {
                name,
                surname,
                email,
                phone,
                jobQualifier,
                hashedPw,
                city: city ?? null,
                address: address ?? null,
                cap: cap ?? null,
                state: state ?? null,
                // googleId/googleSecret restano null di default
                // isLoggedIn default false
                },
            })

            res.code(201)
            return user
            } catch (error: any) {
            fastify.log.error(error)

            // msg errore per mail duplicate
            if (error?.code === 'P2002') {
                res.code(400)
                return { error: 'Email already in use' }
            }

            res.code(400)
            return { error: 'Unable to create user' }
            }
        }
    )

    // POST /api/v1/users/login
    fastify.post<{
    Body: { email: string; password: string }
    }>(
    '/login',
    {
        config: {
        rateLimit: {
            max: 5,
            timeWindow: '15 minutes',
        },
        },
        schema: userSchemas.login,
    },
    async (req, res) => {
        const { email, password } = req.body

        // check base
        if (!email || !password) {
            res.code(400)
            return { error: 'Email and password are mandatory!' }
        }

        // prendo user
        const user = await fastify.prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            res.code(401)
            return { error: 'Invalid credentials' }
        }

        // verifica password
        // TODO: POI CAMBIARE GESTIONE PASSWORD UTENTE CON BCRYPT (per hash pw)
        if (!user.hashedPw || user.hashedPw !== password) {
            res.code(401)
            return { error: 'Invalid credentials' }
        }

        // setto logged-in
        await fastify.prisma.user.update({
            where: { id: user.id },
            data: { isLoggedIn: true },
        })

        // // JWT payload MEGLIO FARLO HTTP ONLY
        // const token = fastify.jwt.sign(
        //     {
        //         userId: user.id,
        //         email: user.email,
        //         name: user.name,
        //         surname: user.surname,
        //     },
        //     { expiresIn: '24h' }
        // )

        // HTTP ONLY
        const token = fastify.jwt.sign({ userId: user.id }, { expiresIn: '24h' })
        setAuthCookie(res, token)

        // TODO: LOGIN - INSERIRE GESTIONE WEBSOCKETS 
        return res.send({
            success: true,
            user: { id: user.id, name: user.name, surname: user.surname, email: user.email },
        })
    }
    )

    // POST /api/v1/users/logout

    fastify.post('/logout',
        { schema: userSchemas.logout },
        async (req, res) => {
        let userId = getUserIdFromJWT(req, res, fastify)

        res.clearCookie('session', { path: '/' })

        if (userId) {
            await fastify.prisma.user.update({
                where: { id: userId },
                data: { isLoggedIn: false },
            })
        }

        // TODO: LOGOUT - INSERIRE GESTIONE WEBSOCKETS 

        return res.send({ success: true })
    })
}

export default Posters