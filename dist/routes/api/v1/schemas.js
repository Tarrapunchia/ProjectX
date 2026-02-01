const userResponse = {
    id: { type: 'number' },
    name: { type: 'string' },
    surname: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    city: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
    cap: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
    jobQualifier: { type: 'string' },
    hashedPw: { type: 'string', nullable: true },
    googleId: { type: 'string', nullable: true },
    googleSecret: { type: 'string', nullable: true },
    isLoggedIn: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
};
const friend = {
    id: { type: 'number' },
    name: { type: 'string' },
    surname: { type: 'string' },
    email: { type: 'string', format: 'email' },
};
const getAllUsersSchema = {
    description: 'Get all users',
    tags: ['users'],
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: userResponse,
                required: ['id', 'name', 'surname', 'email', 'phone', 'jobQualifier', 'createdAt', 'updatedAt', 'isLoggedIn'],
            },
        },
    },
};
const getUserProfile = {
    description: 'Fetch a user profile (user + organizations + projects)',
    tags: ['users'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'user id' },
        },
        required: ['id'],
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                surname: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                city: { type: 'string', nullable: true },
                address: { type: 'string', nullable: true },
                cap: { type: 'string', nullable: true },
                state: { type: 'string', nullable: true },
                jobQualifier: { type: 'string' },
                googleId: { type: 'string', nullable: true },
                googleSecret: { type: 'string', nullable: true },
                isLoggedIn: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                organizations: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            createdAt: { type: 'string', format: 'date-time' }, // OrganizationMember.createdAt
                        },
                        required: ['id', 'name', 'email', 'createdAt'],
                    },
                },
                projects: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            organizationId: { type: 'number' },
                            role: { type: 'string' },
                            joinedAt: { type: 'string', format: 'date-time' }, // ProjectParticipant.createdAt
                        },
                        required: ['id', 'name', 'organizationId', 'role', 'joinedAt'],
                    },
                },
            },
            required: [
                'id',
                'name',
                'surname',
                'email',
                'phone',
                'jobQualifier',
                'isLoggedIn',
                'createdAt',
                'updatedAt',
                'organizations',
                'projects',
            ],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
        404: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};
const getUserFriends = {
    description: `Fetch all user's friends`,
    tags: ['users'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'user id' },
        },
        required: ['id'],
    },
    response: {
        200: {
            type: 'object',
            properties: {
                userId: { type: 'number' },
                count: { type: 'number' },
                friends: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: friend,
                        required: ['id', 'name', 'surname', 'email'],
                    },
                },
            },
            required: ['userId', 'count', 'friends'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
        404: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};
const createUser = {
    description: 'Adds a new User and returns it on success',
    tags: ['users'],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'first name' },
            surname: { type: 'string', description: 'last name' },
            email: { type: 'string', format: 'email', description: 'email' },
            phone: { type: 'string', description: 'phone number' },
            jobQualifier: { type: 'string', description: 'job qualifier' },
            password: { type: 'string', description: 'password (plain for now, you hash it server-side)' },
            passwordRepeat: { type: 'string', description: 'repeat password' },
            city: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            cap: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
        },
        required: ['name', 'surname', 'email', 'phone', 'jobQualifier', 'password', 'passwordRepeat'],
    },
    response: {
        201: {
            type: 'object',
            properties: userResponse,
            required: ['id', 'name', 'surname', 'email', 'phone', 'jobQualifier', 'createdAt', 'updatedAt', 'isLoggedIn'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};
const login = {
    description: 'Login user with email and password',
    tags: ['users'],
    body: {
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
        },
        required: ['email', 'password'],
    },
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
};
const logout = {
    description: 'Log the current user out using the id stored in the jwt http only session token.',
    tags: ['users'],
    response: {
        200: {
            type: 'object',
            properties: { success: { type: 'string' } },
            required: ['success']
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error']
        }
    }
};
const seed = {
    description: 'Seeds the database for testing',
    tags: ['debug'],
    querystring: {
        type: 'object',
        properties: {
            users: { type: 'string' },
            orgs: { type: 'string' },
            projectsPerOrg: { type: 'string' },
            friendships: { type: 'string' },
        },
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
                        organizations: { type: 'number' },
                        projects: { type: 'number' },
                        roles: { type: 'number' },
                        friendships: { type: 'number' },
                    },
                    required: ['users', 'organizations', 'projects', 'roles', 'friendships'],
                },
                hint: { type: 'string' },
            },
            required: ['ok', 'created'],
        },
        500: {
            type: 'object',
            properties: {
                ok: { type: 'boolean' },
                error: { type: 'string' },
            },
            required: ['ok', 'error'],
        },
    },
};
export const userSchemas = {
    getAllUsers: getAllUsersSchema,
    getUserProfile: getUserProfile,
    getUserFriends: getUserFriends,
    createUser: createUser,
    login: login,
    logout: logout,
    seed: seed,
};
//# sourceMappingURL=schemas.js.map