import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { userSchemas } from "../users/usersSchemas.js";

const Debug: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {
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
            await prisma.roomMessage.deleteMany()
            await prisma.directMessage.deleteMany()
            await prisma.chatRoom.deleteMany()
            await prisma.directConversation.deleteMany()

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

export default Debug