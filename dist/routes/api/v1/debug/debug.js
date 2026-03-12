import fastify, {} from "fastify";
import { userSchemas } from "../users/usersSchemas.js";
import { RoleName, Status, FriendshipStatus } from "@prisma/client";
const Debug = async (fastify, opts) => {
    fastify.post('/addTestUsers', { schema: {
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
                    properties: { error: { type: 'string' } }
                }
            }
        } }, async (req, res) => {
        const qs = req.query.users;
        const parsedQs = [];
        if (qs) {
            const users = qs.split(" ");
            fastify.log.info(users);
            users.map(u => {
                parsedQs.push(u);
            });
        }
        const prisma = fastify.prisma;
        const orgName = '42';
        const projName = 'transcendence';
        if (parsedQs.length === 0) {
            parsedQs.push('a@a.a');
            parsedQs.push('b@b.b');
        }
        try {
            const created = await fastify.prisma.$transaction(async (tx) => {
                var _a, _b;
                // 1) PERMISSIONS + ROLES (1:1)
                const roleDefs = [
                    { name: RoleName.OWNER },
                    { name: RoleName.EDITOR },
                    { name: RoleName.VIEWER },
                ];
                for (const def of roleDefs) {
                    const existing = await tx.role.findUnique({ where: { name: def.name } });
                    if (existing)
                        continue;
                    // const perm = await tx.permission.create({ data: def.perm })
                    const role = await tx.role.create({
                        data: {
                            name: def.name,
                            // permissionsId: perm.id,
                        },
                    });
                }
                const users = [];
                for (let i = 0; i < parsedQs.length; i++) {
                    if (parsedQs[i]) {
                        const email = String(parsedQs[i]);
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
                        });
                        users.push(u);
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
                        ownerId: (_b = (_a = users[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 0,
                    }
                });
                await tx.organizationMember.create({
                    data: { organizationId: org.id, userId: org.ownerId },
                });
                for (const u of users) {
                    try {
                        if (u.id === org.ownerId)
                            continue;
                        await tx.organizationMember.create({
                            data: { organizationId: org.id, userId: u.id },
                        });
                    }
                    catch (_c) {
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
                });
                for (const u of users) {
                    try {
                        await tx.projectParticipant.create({
                            data: {
                                projectId: p.id,
                                userId: u.id,
                                roleId: 2, // e' id di EDITOR
                            },
                        });
                    }
                    catch (_d) {
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
                });
                // const u = await prisma.user.create()
            });
        }
        catch (error) {
            fastify.log.error(error);
            res.code(400);
            return res.send({
                error: error
            });
        }
    });
    /// FATTO DA CHATGPT EH, FIDIAMOCI?
    // DEBUG SEED - POST /api/users/seed
    // POST /api/v1/users/seed
    fastify.post('/seed', { schema: userSchemas.seed }, async (req, reply) => {
        var _a, _b, _c, _d, _e;
        const prisma = fastify.prisma;
        const USERS_N = Math.max(1, Number((_a = req.query.users) !== null && _a !== void 0 ? _a : 25));
        const ORGS_N = Math.max(1, Number((_b = req.query.orgs) !== null && _b !== void 0 ? _b : 6));
        const PROJECTS_PER_ORG = Math.max(1, Number((_c = req.query.projectsPerOrg) !== null && _c !== void 0 ? _c : 3));
        const TASKS_PER_PROJECT = Math.max(0, Number((_d = req.query.tasksPerProject) !== null && _d !== void 0 ? _d : 4));
        const FRIENDSHIPS_N = Math.max(0, Number((_e = req.query.friendships) !== null && _e !== void 0 ? _e : 60));
        const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        function pick(arr) {
            if (arr.length === 0)
                throw new Error('pick() called with empty array');
            return arr[randInt(0, arr.length - 1)];
        }
        function sampleUnique(arr, k) {
            const copy = [...arr];
            const out = [];
            k = Math.min(k, copy.length);
            for (let i = 0; i < k; i++) {
                const idx = randInt(0, copy.length - 1);
                out.push(copy[idx]);
                copy.splice(idx, 1);
            }
            return out;
        }
        function maybeNull(value, p = 0.5) {
            return Math.random() < p ? value : null;
        }
        const randomEmail = (i) => `user${i}_${randInt(1000, 9999)}@test.local`;
        const randomPhone = () => `3${randInt(20, 99)}${randInt(1000000, 9999999)}`;
        const firstNames = ['Luca', 'Marco', 'Giulia', 'Anna', 'Paolo', 'Sara', 'Franco', 'Elisa', 'Davide', 'Marta'];
        const lastNames = ['Rossi', 'Bianchi', 'Verdi', 'Romano', 'Gallo', 'Costa', 'Fontana', 'Conti', 'Greco', 'Marino'];
        const cities = ['Roma', 'Milano', 'Torino', 'Bologna', 'Firenze', 'Napoli'];
        const jobQuals = ['Dev', 'PM', 'Designer', 'QA', 'Ops'];
        const friendshipStatuses = [
            FriendshipStatus.PENDING,
            FriendshipStatus.ACCEPTED,
            FriendshipStatus.BLOCKED,
        ];
        try {
            // 1) CLEANUP (children -> parents)
            await prisma.roomMessage.deleteMany();
            await prisma.directMessage.deleteMany();
            await prisma.chatRoom.deleteMany();
            await prisma.directConversation.deleteMany();
            await prisma.friendship.deleteMany();
            await prisma.taskParticipant.deleteMany();
            await prisma.task.deleteMany();
            await prisma.projectParticipant.deleteMany();
            await prisma.project.deleteMany();
            await prisma.organizationMember.deleteMany();
            await prisma.organization.deleteMany();
            await prisma.role.deleteMany();
            // await prisma.permission.deleteMany()
            await prisma.user.deleteMany();
            // 2) ROLES + PERMISSIONS (1:1)
            const roleDefs = [
                {
                    name: RoleName.OWNER,
                    // perm: {
                    // bOwner: true,
                    // bModPermissions: true,
                    // bCreateTask: true,
                    // bEditTask: true,
                    // bCloseTask: true,
                    // bInvite: true,
                    // bRemoveUser: true,
                    // },
                },
                {
                    name: RoleName.EDITOR,
                    // perm: {
                    // bOwner: false,
                    // bModPermissions: false,
                    // bCreateTask: true,
                    // bEditTask: true,
                    // bCloseTask: true,
                    // bInvite: true,
                    // bRemoveUser: false,
                    // },
                },
                {
                    name: RoleName.VIEWER,
                    // perm: {
                    // bOwner: false,
                    // bModPermissions: false,
                    // bCreateTask: false,
                    // bEditTask: false,
                    // bCloseTask: false,
                    // bInvite: false,
                    // bRemoveUser: false,
                    // },
                },
                {
                    name: RoleName.SUPERVISOR
                }
            ];
            const roles = [];
            for (const def of roleDefs) {
                // const perm = await prisma.permission.create({ data: def.perm })
                const role = await prisma.role.create({
                    data: { name: def.name },
                    // data: { name: def.name, permissionsId: perm.id },
                });
                roles.push({ id: role.id, name: role.name });
            }
            const roleOwner = roles.find(r => r.name === RoleName.OWNER);
            const roleEditor = roles.find(r => r.name === RoleName.EDITOR);
            // 3) USERS random
            const users = [];
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
                });
                users.push(u);
            }
            // 3b) USERS fixed (42)
            const fixedUsersData = [
                { name: 'fabio', surname: 'zucconi', email: 'fzucconi@student.42firenze.it' },
                { name: 'manuel', surname: 'chiaramello', email: 'mchiaram@student.42firenze.it' },
                { name: 'giulia', surname: 'vigano', email: 'gvigano@student.42firenze.it' },
                { name: 'ansi', surname: 'osmenaj', email: 'aosmenaj@student.42firenze.it' },
            ];
            const fixedUsers = [];
            for (const fu of fixedUsersData) {
                const u = await prisma.user.create({
                    data: {
                        name: fu.name,
                        surname: fu.surname,
                        email: fu.email,
                        phone: randomPhone(),
                        city: 'Florence',
                        address: 'Via del Tiratoio 1',
                        cap: '50100',
                        state: 'IT',
                        jobQualifier: 'developer',
                        hashedPw: '1234',
                        googleId: null,
                        googleSecret: null,
                        isLoggedIn: false,
                    },
                });
                fixedUsers.push(u);
            }
            const fabio = fixedUsers[0];
            users.push(...fixedUsers);
            // 4) ORGANIZATIONS random
            const orgs = [];
            for (let i = 1; i <= ORGS_N; i++) {
                const owner = pick(users);
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
                });
                orgs.push(org);
                await prisma.organizationMember.create({
                    data: { organizationId: org.id, userId: owner.id },
                });
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
            });
            orgs.push(org42);
            // members of 42
            for (const u of fixedUsers) {
                await prisma.organizationMember.create({
                    data: { organizationId: org42.id, userId: u.id },
                });
            }
            // 5) extra memberships for random orgs (skip 42)
            for (const org of orgs) {
                if (org.name === '42')
                    continue;
                const howMany = randInt(5, Math.min(12, users.length));
                const pickedUsers = sampleUnique(users, howMany);
                for (const u of pickedUsers) {
                    try {
                        await prisma.organizationMember.create({
                            data: { organizationId: org.id, userId: u.id },
                        });
                    }
                    catch (_f) { }
                }
            }
            // 6) PROJECTS random + Transcendence in 42
            const projects = [];
            for (const org of orgs) {
                if (org.name === '42')
                    continue;
                for (let i = 1; i <= PROJECTS_PER_ORG; i++) {
                    const p = await prisma.project.create({
                        data: {
                            name: `Project ${org.id}.${i}`,
                            organizationId: org.id,
                            status: Status.TODO,
                            description: `Project ${org.id}.${i}`,
                        },
                    });
                    projects.push(p);
                }
            }
            const transcendence = await prisma.project.create({
                data: {
                    name: 'Transcendence',
                    organizationId: org42.id,
                    status: Status.ACTIVE,
                    description: 'Final Project',
                },
            });
            projects.push(transcendence);
            // 7) PROJECT PARTICIPANTS random (skip transcendence)
            for (const p of projects) {
                if (p.id === transcendence.id)
                    continue;
                const orgMembers = await prisma.organizationMember.findMany({
                    where: { organizationId: p.organizationId },
                    select: { userId: true },
                });
                const memberIds = orgMembers.map((m) => m.userId);
                const participantCount = randInt(2, Math.min(8, memberIds.length));
                const chosenIds = sampleUnique(memberIds, participantCount);
                for (const uid of chosenIds) {
                    const role = pick(roles);
                    try {
                        await prisma.projectParticipant.create({
                            data: { projectId: p.id, userId: uid, roleId: role.id },
                        });
                    }
                    catch (_g) { }
                }
            }
            // 7b) Transcendence participants: 4 fixed as EDITOR ("admin")
            for (const u of fixedUsers) {
                await prisma.projectParticipant.create({
                    data: { projectId: transcendence.id, userId: u.id, roleId: roleOwner.id },
                });
            }
            // 8) TASKS + TASK PARTICIPANTS
            const tasks = [];
            const statusPool = [Status.TODO, Status.ACTIVE, Status.REVIEW, Status.CLOSED];
            for (const p of projects) {
                for (let i = 1; i <= TASKS_PER_PROJECT; i++) {
                    const t = await prisma.task.create({
                        data: {
                            name: `Task ${p.id}.${i}`,
                            projectId: p.id,
                            status: pick(statusPool),
                            description: maybeNull(`Task ${p.id}.${i} description`, 0.7),
                        },
                    });
                    tasks.push(t);
                    // assegnatari task: subset dei partecipanti progetto
                    const pparts = await prisma.projectParticipant.findMany({
                        where: { projectId: p.id },
                        select: { userId: true },
                    });
                    const pUserIds = pparts.map(pp => pp.userId);
                    if (pUserIds.length === 0)
                        continue;
                    const assigneesCount = randInt(1, Math.min(3, pUserIds.length));
                    const chosen = sampleUnique(pUserIds, assigneesCount);
                    for (const uid of chosen) {
                        try {
                            await prisma.taskParticipant.create({
                                data: { taskId: t.id, userId: uid },
                            });
                        }
                        catch (_h) { }
                    }
                }
            }
            // 9) FRIENDSHIPS random
            const used = new Set();
            let created = 0;
            while (created < FRIENDSHIPS_N) {
                const a = pick(users).id;
                const b = pick(users).id;
                if (a === b)
                    continue;
                const key = `${a}:${b}`;
                if (used.has(key))
                    continue;
                used.add(key);
                try {
                    await prisma.friendship.create({
                        data: {
                            senderId: a,
                            receiverId: b,
                            status: pick(friendshipStatuses),
                        },
                    });
                    created++;
                }
                catch (_j) { }
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
                },
                special: {
                    org42Id: org42.id,
                    transcendenceId: transcendence.id,
                },
                hint: 'QS: ?users=..&orgs=..&projectsPerOrg=..&tasksPerProject=..&friendships=..',
            });
        }
        catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ ok: false, error: 'seed failed' });
        }
    });
};
export default Debug;
//# sourceMappingURL=debug.js.map