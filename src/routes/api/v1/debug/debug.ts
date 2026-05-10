import fastify, { type FastifyInstance, type FastifyPluginAsync } from "fastify";
import { userSchemas } from "../users/usersSchemas.js";
import { RoleName, Status, FriendshipStatus, Priority, NotificationType, EventType, ChatRoomType } from "@prisma/client";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import { setAuthCookie } from "../../../../helpers/cookies.js";

const Debug: FastifyPluginAsync = async (fastify: FastifyInstance, opts) => {

    fastify.post<{
    Querystring: {
        users?: string
        orgs?: string
        projectsPerOrg?: string
        tasksPerProject?: string
        friendships?: string
        events?: string
        groups?: string
    }
    }>('/seed', { schema: userSchemas.seed }, async (req, reply) => {
    const prisma = fastify.prisma

    const USERS_N = Math.max(1, Number(req.query.users ?? 25))
    const ORGS_N = Math.max(1, Number(req.query.orgs ?? 6))
    const PROJECTS_PER_ORG = Math.max(1, Number(req.query.projectsPerOrg ?? 3))
    const TASKS_PER_PROJECT = Math.max(0, Number(req.query.tasksPerProject ?? 4))
    const FRIENDSHIPS_N = Math.max(0, Number(req.query.friendships ?? 60))
    const EVENTS_N = Math.max(0, Number(req.query.events ?? 20))
    const GROUPS_N = Math.max(0, Number(req.query.groups ?? 6))

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

    function maybeNull<T>(value: T, p = 0.5): T | null {
        return Math.random() < p ? value : null
    }

    const randomEmail = (i: number) => `user${i}_${randInt(1000, 9999)}@test.local`

    // phone è @unique: generiamo numeri unici e li teniamo in un set
    const usedPhones = new Set<string>()
    const uniquePhone = () => {
        let p = ''
        do {
        p = `3${randInt(20, 99)}${randInt(1000000, 9999999)}`
        } while (usedPhones.has(p))
        usedPhones.add(p)
        return p
    }

    const firstNames = ['Luca', 'Marco', 'Giulia', 'Anna', 'Paolo', 'Sara', 'Franco', 'Elisa', 'Davide', 'Marta']
    const lastNames  = ['Rossi', 'Bianchi', 'Verdi', 'Romano', 'Gallo', 'Costa', 'Fontana', 'Conti', 'Greco', 'Marino']
    const cities     = ['Roma', 'Milano', 'Torino', 'Bologna', 'Firenze', 'Napoli']
    const jobQuals   = ['Dev', 'PM', 'Designer', 'QA', 'Ops']

    const friendshipStatuses = [
        FriendshipStatus.PENDING,
        FriendshipStatus.ACCEPTED,
        FriendshipStatus.BLOCKED,
    ] as const

    const statusPool = [Status.TODO, Status.ACTIVE, Status.REVIEW, Status.CLOSED] as const
    const priorityPool = [Priority.NONE, Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.CRITICAL] as const
    const eventTypes = [EventType.NONE, EventType.CALL, EventType.MEETING, EventType.CONFERENCE, EventType.GENERIC] as const

    const randomFutureDate = (daysMin = 1, daysMax = 30) => {
        const d = new Date()
        d.setDate(d.getDate() + randInt(daysMin, daysMax))
        d.setHours(randInt(9, 18), randInt(0, 59), 0, 0)
        return d
    }

    try {
        // 1) CLEANUP (children -> parents)
        await prisma.roomMessage.deleteMany()

        // chatroom dipende da org/project/group: quindi prima delete groupParticipant+group, poi chatRoom
        await prisma.groupParticipant.deleteMany()
        await prisma.group.deleteMany()

        await prisma.chatRoom.deleteMany()
        await prisma.directMessage.deleteMany()
        await prisma.directConversation.deleteMany()

        // notification prima di friendship (FK friendshipId)
        await prisma.notification.deleteMany()
        await prisma.friendship.deleteMany()

        await prisma.eventParticipant.deleteMany()
        await prisma.event.deleteMany()

        await prisma.taskParticipant.deleteMany()
        await prisma.task.deleteMany()

        await prisma.projectParticipant.deleteMany()
        await prisma.project.deleteMany()

        await prisma.organizationMember.deleteMany()
        await prisma.organization.deleteMany()

        await prisma.role.deleteMany()
        await prisma.permission.deleteMany()

        await prisma.user.deleteMany()

        // 2) ROLES + PERMISSIONS (1:1)
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
        const perm = await prisma.permission.create({ data: def.perm })
        const role = await prisma.role.create({
            data: { name: def.name, permissionsId: perm.id },
        })
        roles.push({ id: role.id, name: role.name })
        }

        const roleEditor = roles.find(r => r.name === RoleName.EDITOR)!

        // 3) USERS random
        const users: any[] = []
        for (let i = 1; i <= USERS_N; i++) {
        const password = `pw_${randInt(100000, 999999)}`
        const salt = genSaltSync(10)
        const hashedPw = hashSync(password, salt)

        const u = await prisma.user.create({
            data: {
            name: pick(firstNames),
            surname: pick(lastNames),
            email: randomEmail(i),
            phone: maybeNull(uniquePhone(), 0.95), // phone è opzionale ma unique se presente
            city: maybeNull(pick(cities), 0.7),
            address: maybeNull(`Via Test ${randInt(1, 200)}`, 0.6),
            cap: maybeNull(String(randInt(10000, 99999)), 0.6),
            state: maybeNull('IT', 0.6),
            jobQualifier: pick(jobQuals),
            hashedPw,
            googleId: maybeNull(`google_${randInt(100000, 999999)}`, 0.3),
            googleSecret: maybeNull(`secret_${randInt(100000, 999999)}`, 0.3),
            isLoggedIn: false,
            },
        })
        users.push(u)
        }

        // 3b) USERS fixed (42) — phone unique obbligatoria se la mettiamo
        const fixedUsersData = [
        { name: 'fabio',  surname: 'zucconi',     email: 'fzucconi@student.42campus.com' },
        { name: 'manuel', surname: 'chiaramello', email: 'mchiaram@42firenze.com' },
        { name: 'giulia', surname: 'vigano',      email: 'gvigano@42firenze.com' },
        { name: 'ansi',   surname: 'osmenaj',     email: 'aosmenaj@42firenze.com' },
        ] as const

        const fixedUsers: any[] = []
        for (const fu of fixedUsersData) {
        const salt = genSaltSync(10)
        const hashedPw = hashSync("1234", salt)

        const u = await prisma.user.create({
            data: {
            name: fu.name,
            surname: fu.surname,
            email: fu.email,
            phone: uniquePhone(),
            city: 'Firenze',
            address: 'Via del Tiratoio 1',
            cap: '50100',
            state: 'IT',
            jobQualifier: 'developer',
            hashedPw,
            googleId: null,
            googleSecret: null,
            isLoggedIn: false,
            },
        })
        fixedUsers.push(u)
        }

        const fabio = fixedUsers[0]
        users.push(...fixedUsers)

        // 4) ORGANIZATIONS random
        const orgs: any[] = []
        for (let i = 1; i <= ORGS_N; i++) {
        const owner = pick(users)
        const org = await prisma.organization.create({
            data: {
            name: `Org ${i}`,
            email: `org${i}_${randInt(1000, 9999)}@test.local`,
            phone: uniquePhone(),
            city: maybeNull(pick(cities), 0.8),
            address: maybeNull(`Piazza Demo ${randInt(1, 50)}`, 0.5),
            cap: maybeNull(String(randInt(10000, 99999)), 0.5),
            state: 'IT',
            description: maybeNull('Generated organization', 0.6),
            ownerId: owner.id,
            },
        })
        orgs.push(org)

        await prisma.organizationMember.create({
            data: { organizationId: org.id, userId: owner.id },
        })
        }

        // 4b) ORGANIZATION special "42"
        const org42 = await prisma.organization.create({
        data: {
            name: '42',
            email: '42@42.it',
            phone: uniquePhone(),
            city: 'Firenze',
            address: 'Via del Tiratoio 1',
            cap: '',
            state: 'IT',
            description: '42 campus organization',
            ownerId: fabio.id,
        },
        })
        orgs.push(org42)

        // members of 42
        for (const u of fixedUsers) {
        await prisma.organizationMember.create({
            data: { organizationId: org42.id, userId: u.id },
        })
        }

        // 5) extra memberships for random orgs (skip 42)
        for (const org of orgs) {
        if (org.name === '42') continue
        const howMany = randInt(5, Math.min(12, users.length))
        const pickedUsers = sampleUnique(users, howMany)
        for (const u of pickedUsers) {
            try {
            await prisma.organizationMember.create({
                data: { organizationId: org.id, userId: u.id },
            })
            } catch {}
        }
        }

        // 6) PROJECTS random + Transcendence in 42
        const projects: any[] = []
        for (const org of orgs) {
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

        const transcendence = await prisma.project.create({
        data: {
            name: 'Transcendence',
            organizationId: org42.id,
            status: Status.ACTIVE,
            description: 'Final Project',
        },
        })
        projects.push(transcendence)

        // 7) PROJECT PARTICIPANTS random (skip transcendence)
        for (const p of projects) {
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
                data: { projectId: p.id, userId: uid, roleId: role.id },
            })
            } catch {}
        }
        }

        // 7b) Transcendence participants: 4 fixed as EDITOR ("admin")
        for (const u of fixedUsers) {
        await prisma.projectParticipant.create({
            data: { projectId: transcendence.id, userId: u.id, roleId: roleEditor.id },
        })
        }

        // 8) TASKS + TASK PARTICIPANTS
        const tasks: any[] = []
        for (const p of projects) {
        for (let i = 1; i <= TASKS_PER_PROJECT; i++) {
            const st = pick(statusPool)
            const pr = pick(priorityPool)

            const t = await prisma.task.create({
            data: {
                name: `Task ${p.id}.${i}`, // unique
                projectId: p.id,
                status: st,
                priority: pr,
                description: maybeNull(`Task ${p.id}.${i} description`, 0.7),
                dueDate: st === Status.CLOSED ? null : maybeNull(randomFutureDate(1, 30), 0.75),
                closedAt: st === Status.CLOSED ? new Date() : null,
            },
            })
            tasks.push(t)

            const pparts = await prisma.projectParticipant.findMany({
            where: { projectId: p.id },
            select: { userId: true },
            })
            const pUserIds = pparts.map(pp => pp.userId)
            if (pUserIds.length === 0) continue

            const assigneesCount = randInt(1, Math.min(3, pUserIds.length))
            const chosen = sampleUnique(pUserIds, assigneesCount)

            for (const uid of chosen) {
            try {
                await prisma.taskParticipant.create({
                data: { taskId: t.id, userId: uid },
                })
            } catch {}
            }
        }
        }

        // 9) FRIENDSHIPS + NOTIFICATIONS (PENDING)
        const used = new Set<string>()
        let created = 0

        while (created < FRIENDSHIPS_N) {
        const a = pick(users).id
        const b = pick(users).id
        if (a === b) continue

        const key = `${a}:${b}`
        if (used.has(key)) continue
        used.add(key)

        const st = pick(friendshipStatuses)

        try {
            const fr = await prisma.friendship.create({
            data: {
                senderId: a,
                receiverId: b,
                status: st,
            },
            })
            created++

            if (st === FriendshipStatus.PENDING) {
            await prisma.notification.create({
                data: {
                userId: b,
                senderId: a,
                friendshipId: fr.id, // unique 1:1
                type: NotificationType.FRIEND_REQUEST,
                message: `Friend request from user ${a}`,
                },
            })
            }
        } catch {}
        }

        // 10) EVENTS + EVENT PARTICIPANTS
        const events: any[] = []
        for (let i = 1; i <= EVENTS_N; i++) {
        const owner = pick(users)
        const ev = await prisma.event.create({
            data: {
            name: `Event ${i}`,
            type: pick(eventTypes),
            message: `Event ${i} message`,
            ownerId: owner.id,
            dueDate: randomFutureDate(1, 60),
            },
        })
        events.push(ev)

        await prisma.eventParticipant.create({
            data: { eventId: ev.id, userId: owner.id },
        })

        const others = sampleUnique(users.filter(u => u.id !== owner.id), randInt(0, 4))
        for (const u of others) {
            try {
            await prisma.eventParticipant.create({
                data: { eventId: ev.id, userId: u.id },
            })
            } catch {}
        }
        }

        // 11) GROUPS + GROUP PARTICIPANTS + CHATROOM (GROUP)
        const groups: any[] = []
        for (let i = 1; i <= GROUPS_N; i++) {
        const g = await prisma.group.create({
            data: {
            name: `Group ${i}`,
            description: maybeNull(`Group ${i} description`, 0.7),
            closedAt: null,
            },
        })
        groups.push(g)

        // chatroom 1:1 per group (groupId è unique)
        await prisma.chatRoom.create({
            data: {
            key: `group:${g.id}`,
            type: ChatRoomType.GROUP,
            groupId: g.id,
            },
        })

        // partecipanti (2..6)
        const members = sampleUnique(users, randInt(2, Math.min(6, users.length)))
        for (const u of members) {
            try {
            await prisma.groupParticipant.create({
                data: { groupId: g.id, userId: u.id },
            })
            } catch {}
        }
        }

        return reply.send({
        ok: true,
        created: {
            users: users.length,
            organizations: orgs.length,
            projects: projects.length,
            tasks: tasks.length,
            roles: roles.length,
            friendships: FRIENDSHIPS_N,
            notifications: await prisma.notification.count(),
            events: events.length,
            groups: groups.length,
        },
        special: {
            org42Id: org42.id,
            transcendenceId: transcendence.id,
        },
        hint: 'QS: ?users=..&orgs=..&projectsPerOrg=..&tasksPerProject=..&friendships=..&events=..&groups=..',
        })
    } catch (err) {
        fastify.log.error(err)
        return reply.code(500).send({ ok: false, error: 'seed failed' })
    }
    })

    // POST /api/v1/debug/loginFabio
    fastify.get(
    '/loginFabio',
    {
        config: {
        rateLimit: {
            max: 5,
            timeWindow: '15 minutes',
        },
        },
        schema: {
    description: 'Login user fabio',
    tags: ['debug'],
    response: {
        200: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            user: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                surname: { type: 'string' },
                email: { type: 'string', format: 'email' },
            },
            required: ['id', 'name', 'surname', 'email'],
            },
        },
        required: ['success', 'user'],
        },
        400: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
        },
        401: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
        },
    },
}},
    async (req, res) => {
        const { email, password } = { email: "fzucconi@student.42campus.com", password: '1234'}
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
        if (!user.hashedPw || !compareSync(password, String(user.hashedPw))) {
            res.code(401)
            return { error: 'Invalid credentials' }
        }

        // setto logged-in
        await fastify.prisma.user.update({
            where: { id: user.id },
            data: { isLoggedIn: true },
        })

        // HTTP ONLY
        const token = fastify.jwt.sign({ userId: user.id }, { expiresIn: '24h' })
        setAuthCookie(res, token)

        return res.send({
            success: true,
            user: { id: user.id, name: user.name, surname: user.surname, email: user.email },
        })
    }
    )
}

export default Debug

