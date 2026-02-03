import { type FastifyInstance, type FastifyPluginAsync, type FastifyReply, type FastifyRequest } from 'fastify';
import { userSchemas } from './schemas/usersSchemas.js';
import { setAuthCookie, getUserIdFromJWT } from '../../../helpers/cookies.js';

const Users: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
    fastify.get('/', { schema: userSchemas.getAllUsers },  async (req, res) => {
        return fastify.prisma.user.findMany()
    })

    // GET /api/v1/users/:id/profile
    fastify.get<{
        Params: { id: string }
        }>(
        '/:id/profile',
        { schema: userSchemas.getUserProfile },
        async (req, res) => {
            const id = Number(req.params.id)
            if (Number.isNaN(id)) {
            res.code(400)
            return { error: 'invalid id' }
            }

            const user = await fastify.prisma.user.findUnique({
            where: { id },
            include: {
                memberships: {
                include: { organization: true },
                },
                projectParticipants: {
                include: {
                    project: true,
                    role: true,
                },
                },
            },
            })

            if (!user) {
            res.code(404)
            return { error: 'User not found' }
            }

            // DTO pulito (così non mando dentro tutto nudo/crudo)
            return {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                city: user.city,
                address: user.address,
                cap: user.cap,
                state: user.state,
                jobQualifier: user.jobQualifier,
                googleId: user.googleId,
                googleSecret: user.googleSecret,
                isLoggedIn: user.isLoggedIn,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,

                organizations: user.memberships.map((m: any) => ({
                    id: m.organization.id,
                    name: m.organization.name,
                    email: m.organization.email,
                    createdAt: m.createdAt,
            })),

            projects: user.projectParticipants.map((pp: any) => ({
                id: pp.project.id,
                name: pp.project.name,
                organizationId: pp.project.organizationId,
                role: pp.role.name,
                joinedAt: pp.createdAt,
            })),
            }
        }
    )



    // GET /api/v1/users/:id/friends
    fastify.get<{
        Params: { id: string }
        }>(
        '/:id/friends',
        { schema: userSchemas.getUserFriends },
        async (req, res) => {
            fastify.log.info('Fetching Friends')

            const id = Number(req.params.id)
            if (Number.isNaN(id)) {
            res.code(400)
            return { error: 'id must be a number' }
            }

            // prendo tutte le friendship ACCEPTED dove l'utente è sender o receiver
            const friendships = await fastify.prisma.friendship.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [{ senderId: id }, { receiverId: id }],
            },
            include: {
                sender: true,
                receiver: true,
            },
            })

            // se l'utente non esiste e non ha friendship, voglio comunque distinguere
            // (altrimenti chi ha 0 amici sembra "not found")
            const userExists = await fastify.prisma.user.findUnique({
            where: { id },
            select: { id: true },
            })

            if (!userExists) {
            res.code(404)
            return { error: 'User not found' }
            }

            // deduplica: per ogni friendship prendo "l'altro"
            const friendsMap = new Map<number, { id: number; name: string; surname: string; email: string }>()

            for (const f of friendships) {
            const other = f.senderId === id ? f.receiver : f.sender
            if (other.id !== id) {
                friendsMap.set(other.id, {
                id: other.id,
                name: other.name,
                surname: other.surname,
                email: other.email,
                })
            }
            }

            const friends = Array.from(friendsMap.values()).sort((a, b) => {
            const aKey = `${a.surname} ${a.name}`.toLowerCase()
            const bKey = `${b.surname} ${b.name}`.toLowerCase()
            return aKey.localeCompare(bKey)
            })

            return res.send({
            userId: id,
            count: friends.length,
            friends,
            })
        }
    )

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


    // // PUT /api/v1/users/modifyUserProfile
    // fastify.put('/modifyUserProfile',
    //     // {},
    //     async (req, res) => {
    //         let userId = getUserIdFromJWT(req, res, fastify)
    //         if (userId) {
    //             // const user = await fastify.prisma.user.findUnique({
    //             //     where: { id: userId }
    //             // })
    //             const {
    //                 id,
    //                 name,
    //                 surname,
    //                 email,
    //                 phone,
    //                 city,
    //                 address,
    //                 cap,
    //                 state,
    //                 jobQualifier,
    //                 password
    //             } = req.body

    //             // TODO - HASH PASSWORD

    //             const user = await fastify.prisma.user.update({
    //                 where: { id: userId },
    //                 data: {
    //                     id: id,
    //                     name: name,
    //                     surname: surname,
    //                     email: email,
    //                     phone: phone,
    //                     city: city,
    //                     address: address,
    //                     cap: cap,
    //                     state: state,
    //                     jobQualifier: jobQualifier,
    //                     hashedPw: password
    //                 }
    //             })
    //         }
    //     }
    // )


    /// FATTO DA CHATGPT EH, FIDIAMOCI?
    // DEBUG SEED - POST /api/users/seed
    fastify.post<{
    Querystring: {
        users?: string
        orgs?: string
        projectsPerOrg?: string
        friendships?: string
    }
    }>('/seed', { schema: userSchemas.seed }, async (req, res) => {
        const prisma = fastify.prisma

        // ---- parametri opzionali ----
        const USERS_N = Math.max(1, Number(req.query.users ?? 25))
        const ORGS_N = Math.max(1, Number(req.query.orgs ?? 6))
        const PROJECTS_PER_ORG = Math.max(1, Number(req.query.projectsPerOrg ?? 3))
        const FRIENDSHIPS_N = Math.max(0, Number(req.query.friendships ?? 60))

        // ---- helpers random ----
        const randInt = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min

        function pick<T>(arr: readonly T[]): T {
        if (arr.length === 0) {
            throw new Error('pick() called with empty array')
        }
        return arr[randInt(0, arr.length - 1)]!
        }

        function sampleUnique<T>(arr: readonly T[], k: number): T[] {
        const copy = [...arr]
        const out: T[] = []
        k = Math.min(k, copy.length)
        for (let i = 0; i < k; i++) {
            const idx = randInt(0, copy.length - 1)
            out.push(copy[idx]!)   // <- ! risolve TS2345
            copy.splice(idx, 1)
        }
        return out
        }

        const randomEmail = (i: number) => `user${i}_${randInt(1000, 9999)}@test.local`
        const randomPhone = () => `3${randInt(20, 99)}${randInt(1000000, 9999999)}`

        const firstNames = ['Luca', 'Marco', 'Giulia', 'Anna', 'Paolo', 'Sara', 'Franco', 'Elisa', 'Davide', 'Marta']
        const lastNames  = ['Rossi', 'Bianchi', 'Verdi', 'Romano', 'Gallo', 'Costa', 'Fontana', 'Conti', 'Greco', 'Marino']
        const cities     = ['Roma', 'Milano', 'Torino', 'Bologna', 'Firenze', 'Napoli']
        const jobQuals   = ['Dev', 'PM', 'Designer', 'QA', 'Ops']

        const statuses = ['PENDING', 'ACCEPTED', 'BLOCKED'] as const

        try {
            // 1) PULIZIA (ordine importante per FK)
            await prisma.friendship.deleteMany()
            await prisma.projectParticipant.deleteMany()
            await prisma.project.deleteMany()
            await prisma.organizationMember.deleteMany()
            await prisma.organization.deleteMany()
            await prisma.role.deleteMany()
            await prisma.permission.deleteMany()
            await prisma.user.deleteMany()

            // 2) PERMISSIONS + ROLES (1:1)
            const roleDefs = [
            { name: 'OWNER',  perm: { bOwner: true,  bCreateTask: true } },
            { name: 'ADMIN',  perm: { bOwner: false, bCreateTask: true } },
            { name: 'MEMBER', perm: { bOwner: false, bCreateTask: false } },
            ]

            const roles = []
            for (const def of roleDefs) {
            const perm = await prisma.permission.create({ data: def.perm })
            const role = await prisma.role.create({
                data: {
                name: def.name,
                permissionsId: perm.id,
                },
            })
            roles.push(role)
            }

            // 3) USERS
            const users = []
            for (let i = 1; i <= USERS_N; i++) {
            const u = await prisma.user.create({
                data: {
                name: pick(firstNames),
                surname: pick(lastNames),
                email: randomEmail(i),
                phone: randomPhone(),
                city: Math.random() < 0.7 ? pick(cities) : null,
                address: Math.random() < 0.6 ? `Via Test ${randInt(1, 200)}` : null,
                cap: Math.random() < 0.6 ? String(randInt(10000, 99999)) : null,
                state: Math.random() < 0.6 ? 'IT' : null,
                jobQualifier: pick(jobQuals),
                hashedPw: Math.random() < 0.8 ? `hash_${randInt(100000, 999999)}` : null,
                googleId: Math.random() < 0.3 ? `google_${randInt(100000, 999999)}` : null,
                googleSecret: Math.random() < 0.3 ? `secret_${randInt(100000, 999999)}` : null,
                isLoggedIn: false,
                },
            })
            users.push(u)
            }

            // 4) ORGANIZATIONS (con owner)
            const orgs = []
            for (let i = 1; i <= ORGS_N; i++) {
            const owner = pick(users)
            const org = await prisma.organization.create({
                data: {
                name: `Org ${i}`,
                email: `org${i}_${randInt(1000, 9999)}@test.local`,
                phone: randomPhone(),
                city: Math.random() < 0.8 ? pick(cities) : null,
                address: Math.random() < 0.5 ? `Piazza Demo ${randInt(1, 50)}` : null,
                cap: Math.random() < 0.5 ? String(randInt(10000, 99999)) : null,
                state: 'IT',
                ownerId: owner.id,
                },
            })
            orgs.push(org)

            // owner come membro
            await prisma.organizationMember.create({
                data: { organizationId: org.id, userId: owner.id },
            })
            }

            // 5) MEMBERSHIPS extra (OrganizationMember)
            for (const org of orgs) {
            const howMany = randInt(5, Math.min(12, users.length))
            const pickedUsers = sampleUnique(users, howMany)
            for (const u of pickedUsers) {
                try {
                await prisma.organizationMember.create({
                    data: { organizationId: org.id, userId: u.id },
                })
                } catch {
                // ignora duplicati (owner già inserito, ecc.)
                }
            }
            }

            // 6) PROJECTS
            const projects = []
            for (const org of orgs) {
            for (let i = 1; i <= PROJECTS_PER_ORG; i++) {
                const p = await prisma.project.create({
                data: {
                    name: `Project ${org.id}.${i}`,
                    organizationId: org.id,
                },
                })
                projects.push(p)
            }
            }

            // 7) PROJECT PARTICIPANTS
            for (const p of projects) {
            const orgMembers = await prisma.organizationMember.findMany({
                where: { organizationId: p.organizationId },
                select: { userId: true },
            })
            const memberIds = orgMembers.map((m: any) => m.userId)

            const participantCount = randInt(2, Math.min(8, memberIds.length))
            const chosenIds = sampleUnique(memberIds, participantCount)

            for (const uid of chosenIds) {
                const role = pick(roles)
                try {
                await prisma.projectParticipant.create({
                    data: {
                    projectId: p.id,
                    userId: uid,
                    roleId: role.id,
                    },
                })
                } catch {
                // in teoria non serve (@@id([projectId,userId]) evita doppioni)
                }
            }
            }

            // 8) FRIENDSHIPS
            const used = new Set<string>() // "a:b"
            let created = 0
            while (created < FRIENDSHIPS_N) {
            const a = pick(users).id
            const b = pick(users).id
            if (a === b) continue

            const key = `${a}:${b}`
            if (used.has(key)) continue
            used.add(key)

            try {
                await prisma.friendship.create({
                data: {
                    senderId: a,
                    receiverId: b,
                    status: pick([...statuses]) as any,
                },
                })
                created++
            } catch {
                // ignora collisioni
            }
            }

            // risposta
            return res.send({
            ok: true,
            created: {
                users: users.length,
                organizations: orgs.length,
                projects: projects.length,
                roles: roles.length,
                friendships: FRIENDSHIPS_N,
            },
            hint: 'Puoi cambiare i numeri con ?users=..&orgs=..&projectsPerOrg=..&friendships=..',
            })
        } catch (err) {
            fastify.log.error(err)
            return res.code(500).send({ ok: false, error: 'seed failed' })
        }
    })
}

export default Users