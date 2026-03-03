import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { userSchemas } from "../users/usersSchemas.js";
import { RoleName, Status, FriendshipStatus } from "@prisma/client";

const Debug: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {

    fastify.post<{
        Querystring: {
            users?: string
        }
    }>(
        '/addTestUsers',
        { schema: {
            description: 'Adds test users passed as QS separated by space (or a@a.a and b@b.b if empty) and assign them to test org \'42\' and test proj \'transcendence\'',
            tags: ['debug'],
            querystring: {
                type: 'object',
                properties: { users: { type: 'string' } }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean' },
                        created: {
                            type: 'object',
                            properties: {
                                users: { type: 'number' },
                                organization: { type: 'string' },
                                project: { type: 'string' }
                            }
                        }
                    }
                },
                400: {
                    type: 'object',
                    properties: { error: { type: 'string'} }
                }
            }
        }},
        async (req, res) => {
            const qs = req.query.users
            const parsedQs: any[] = []
            if (qs) {
                const users = qs.split(" ")
                fastify.log.info(users)
                users.map(u => {
                    parsedQs.push(u)
                })
            }

            const prisma = fastify.prisma
            const orgName = '42'
            const projName = 'transcendence'

            if (parsedQs.length === 0) {
                parsedQs.push('a@a.a')
                parsedQs.push('b@b.b')
            }

            try {
                const created = await fastify.prisma.$transaction(async (tx) => {
                // 1) PERMISSIONS + ROLES (1:1)
                const roleDefs = [
                    { name: RoleName.OWNER,  perm: { bOwner: true,  bCreateTask: true } },
                    { name: RoleName.EDITOR,  perm: { bOwner: false, bCreateTask: true } },
                    { name: RoleName.VIEWER, perm: { bOwner: false, bCreateTask: false } },
                ]

                for (const def of roleDefs) {
                    const existing = await tx.role.findUnique({ where: { name: def.name } })
                    if (existing) continue
                    const perm = await tx.permission.create({ data: def.perm })
                    const role = await tx.role.create({
                        data: {
                        name: def.name,
                        permissionsId: perm.id,
                        },
                    })
                }

                const users = []
                for (let i = 0; i < parsedQs.length; i++) {
                    if (parsedQs[i]) {
                        const email = String(parsedQs[i])
                        const u = await tx.user.create({
                            data: {
                                name: email,
                                surname: email,
                                email: email,
                                phone: email,
                                city: email,
                                address: email,
                                cap: email,
                                state: email,
                                jobQualifier: email,
                                hashedPw: email,
                                googleId: email,
                                googleSecret: email,
                                isLoggedIn: false,
                                },
                        })
                        users.push(u)
                    }   
                }

                const org = await tx.organization.create({
                    data: {
                        name: orgName,
                        email: `42@42.it`,
                        phone: '',
                        city: 'Florence',
                        address: 'Via del Tiratoio 1',
                        cap: '',
                        state: 'IT',
                        ownerId: users[0]?.id ?? 0,
                    }
                })

                await tx.organizationMember.create({
                    data: { organizationId: org.id, userId: org.ownerId },
                })
                
                for (const u of users) {
                    try {
                        if (u.id === org.ownerId) continue
                        await tx.organizationMember.create({
                            data: { organizationId: org.id, userId: u.id },
                        })
                    } catch {
                    // ignora duplicati (owner già inserito, ecc.)
                    }
                }

                const p = await tx.project.create({
                    data: {
                        name: projName,
                        organizationId: org.id,
                        status: Status.ACTIVE,
                        description: "Final Project"
                    },
                })

                for (const u of users) {
                    try {
                    await tx.projectParticipant.create({
                        data: {
                            projectId: p.id,
                            userId: u.id,
                            roleId: 2, // e' id di EDITOR
                        },
                    })
                    } catch {
                    // in teoria non serve (@@id([projectId,userId]) evita doppioni)
                    }
                }

                return res.send({
                    ok: true,
                    created: {
                        users: users.length,
                        organization: orgName,
                        project: projName,
                    }
                })
            // const u = await prisma.user.create()
            })
        } catch(error) {
            fastify.log.error(error)
            res.code(400)
            return res.send({
                error: error
            })
        }}
    )

/// FATTO DA CHATGPT EH, FIDIAMOCI?
    // DEBUG SEED - POST /api/users/seed

    // POST /api/v1/users/seed
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
        if (arr.length === 0) throw new Error('pick() called with empty array')
        return arr[randInt(0, arr.length - 1)]!
    }

    function sampleUnique<T>(arr: readonly T[], k: number): T[] {
        const copy = [...arr]
        const out: T[] = []
        k = Math.min(k, copy.length)
        for (let i = 0; i < k; i++) {
        const idx = randInt(0, copy.length - 1)
        out.push(copy[idx]!)
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

    const friendshipStatuses = [FriendshipStatus.PENDING, FriendshipStatus.ACCEPTED, FriendshipStatus.BLOCKED] as const

    // helper per evitare undefined con exactOptionalPropertyTypes
    function maybeNull<T>(value: T, p = 0.5): T | null {
        return Math.random() < p ? value : null
    }

    try {
        // 1) PULIZIA (ordine: prima tabelle “figlie”, poi padri)
        await prisma.roomMessage.deleteMany()
        await prisma.directMessage.deleteMany()
        await prisma.chatRoom.deleteMany()
        await prisma.directConversation.deleteMany()

        await prisma.friendship.deleteMany()
        await prisma.projectParticipant.deleteMany()
        await prisma.project.deleteMany()
        await prisma.organizationMember.deleteMany()
        await prisma.organization.deleteMany()

        await prisma.role.deleteMany()
        await prisma.permission.deleteMany()
        await prisma.user.deleteMany()

        // 2) PERMISSIONS + ROLES (1:1) — crea solo se non esistono
        const roleDefs = [
        {
            name: RoleName.OWNER,
            perm: {
            bOwner: true,
            bModPermissions: true,
            bCreateTask: true,
            bEditTask: true,
            bCloseTask: true,
            bInvite: true,
            bRemoveUser: true,
            },
        },
        {
            name: RoleName.EDITOR,
            perm: {
            bOwner: false,
            bModPermissions: false,
            bCreateTask: true,
            bEditTask: true,
            bCloseTask: true,
            bInvite: true,
            bRemoveUser: false,
            },
        },
        {
            name: RoleName.VIEWER,
            perm: {
            bOwner: false,
            bModPermissions: false,
            bCreateTask: false,
            bEditTask: false,
            bCloseTask: false,
            bInvite: false,
            bRemoveUser: false,
            },
        },
        ] as const

        const roles: Array<{ id: number; name: RoleName }> = []
        for (const def of roleDefs) {
        const existing = await prisma.role.findUnique({ where: { name: def.name } })
        if (existing) {
            roles.push({ id: existing.id, name: existing.name })
            continue
        }

        const perm = await prisma.permission.create({ data: def.perm })
        const role = await prisma.role.create({
            data: {
            name: def.name,
            permissionsId: perm.id,
            },
        })
        roles.push({ id: role.id, name: role.name })
        }

        const roleOwner = roles.find(r => r.name === RoleName.OWNER)!
        const roleEditor = roles.find(r => r.name === RoleName.EDITOR)!

        // 3) USERS random
        const users: any[] = []
        for (let i = 1; i <= USERS_N; i++) {
        const u = await prisma.user.create({
            data: {
            name: pick(firstNames),
            surname: pick(lastNames),
            email: randomEmail(i),
            phone: randomPhone(),
            city: maybeNull(pick(cities), 0.7),
            address: maybeNull(`Via Test ${randInt(1, 200)}`, 0.6),
            cap: maybeNull(String(randInt(10000, 99999)), 0.6),
            state: maybeNull('IT', 0.6),
            jobQualifier: pick(jobQuals),

            hashedPw: maybeNull(`hash_${randInt(100000, 999999)}`, 0.8),
            googleId: maybeNull(`google_${randInt(100000, 999999)}`, 0.3),
            googleSecret: maybeNull(`secret_${randInt(100000, 999999)}`, 0.3),

            isLoggedIn: false,
            },
        })
        users.push(u)
        }

        // 3b) USERS fixed (42)
        const fixedUsersData = [
        { name: 'fabio',  surname: 'zucconi',     email: 'fzucconi@student.42campus.com' },
        { name: 'manuel', surname: 'chiaramello', email: 'mchiaram@42firenze.com' },
        { name: 'giulia', surname: 'vigano',      email: 'gvigano@42firenze.com' },
        { name: 'ansi',   surname: 'osmenaj',     email: 'aosmenaj@42firenze.com' },
        ] as const

        const fixedUsers: any[] = []
        for (const fu of fixedUsersData) {
        const u = await prisma.user.create({
            data: {
            name: fu.name,
            surname: fu.surname,
            email: fu.email,
            phone: randomPhone(),
            city: 'Firenze',
            address: 'Via del Tiratoio 1',
            cap: '50100',
            state: 'IT',
            jobQualifier: 'developer',
            hashedPw: '1234',
            googleId: null,
            googleSecret: null,
            isLoggedIn: false,
            },
        })
        fixedUsers.push(u)
        }

        const fabio = fixedUsers[0]
        users.push(...fixedUsers)

        // 4) ORGANIZATIONS random (con owner)
        const orgs: any[] = []
        for (let i = 1; i <= ORGS_N; i++) {
        const owner = pick(users)
        const org = await prisma.organization.create({
            data: {
            name: `Org ${i}`,
            email: `org${i}_${randInt(1000, 9999)}@test.local`,
            phone: randomPhone(),
            city: maybeNull(pick(cities), 0.8),
            address: maybeNull(`Piazza Demo ${randInt(1, 50)}`, 0.5),
            cap: maybeNull(String(randInt(10000, 99999)), 0.5),
            state: 'IT',
            description: maybeNull('Generated organization', 0.6),
            ownerId: owner.id,
            },
        })
        orgs.push(org)

        // owner come membro
        await prisma.organizationMember.create({
            data: { organizationId: org.id, userId: owner.id },
        })
        }

        // 4b) ORGANIZATION special "42"
        const org42 = await prisma.organization.create({
        data: {
            name: '42',
            email: '42@42.it',
            phone: '',
            city: 'Florence',
            address: 'Via del Tiratoio 1',
            cap: '',
            state: 'IT',
            description: '42 campus organization',
            ownerId: fabio.id,
        },
        })
        orgs.push(org42)

        // tutti membri della 42
        for (const u of fixedUsers) {
        await prisma.organizationMember.create({
            data: { organizationId: org42.id, userId: u.id },
        })
        }

        // 5) MEMBERSHIPS extra (random orgs)
        for (const org of orgs) {
        // evita di aggiungere random anche alla 42 (se vuoi solo i 4)
        if (org.name === '42') continue

        const howMany = randInt(5, Math.min(12, users.length))
        const pickedUsers = sampleUnique(users, howMany)
        for (const u of pickedUsers) {
            try {
            await prisma.organizationMember.create({
                data: { organizationId: org.id, userId: u.id },
            })
            } catch {
            // ignora duplicati
            }
        }
        }

        // 6) PROJECTS random
        const projects: any[] = []
        for (const org of orgs) {
        // per la 42, project speciale lo facciamo dopo
        if (org.name === '42') continue

        for (let i = 1; i <= PROJECTS_PER_ORG; i++) {
            const p = await prisma.project.create({
            data: {
                name: `Project ${org.id}.${i}`,
                organizationId: org.id,
                status: Status.TODO,
                description: `Project ${org.id}.${i}`,
            },
            })
            projects.push(p)
        }
        }

        // 6b) PROJECT special "Transcendence" in 42
        const transcendence = await prisma.project.create({
        data: {
            name: 'Transcendence',
            organizationId: org42.id,
            status: Status.ACTIVE,
            description: 'Final Project',
        },
        })
        projects.push(transcendence)

        // 7) PROJECT PARTICIPANTS random
        for (const p of projects) {
        // speciale per transcendence: vogliamo SOLO i 4 fixed in role EDITOR
        if (p.id === transcendence.id) continue

        const orgMembers = await prisma.organizationMember.findMany({
            where: { organizationId: p.organizationId },
            select: { userId: true },
        })
        const memberIds = orgMembers.map((m) => m.userId)

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
            // ignora collisioni/duplicati
            }
        }
        }

        // 7b) PARTICIPANTS special per Transcendence: tutti e 4 fixed come "admin" -> RoleName.EDITOR
        for (const u of fixedUsers) {
        await prisma.projectParticipant.create({
            data: {
            projectId: transcendence.id,
            userId: u.id,
            roleId: roleEditor.id,
            },
        })
        }

        // 8) FRIENDSHIPS random (solo tra users random+fixed)
        const used = new Set<string>()
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
                status: pick([...friendshipStatuses]),
            },
            })
            created++
        } catch {
            // ignora
        }
        }

        return res.send({
        ok: true,
        created: {
            users: users.length,
            organizations: orgs.length,
            projects: projects.length,
            roles: roles.length,
            friendships: FRIENDSHIPS_N,
            org42Id: org42.id,
            transcendenceId: transcendence.id,
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