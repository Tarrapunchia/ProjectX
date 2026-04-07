// src/schemas/userSchemas.ts
// import type { Schema } from 'fastify';
type Schema = Record<string, any>

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

    avatar: { type: 'string' }
    };

    const friend = {
    id: { type: 'number' },
    name: { type: 'string' },
    surname: { type: 'string' },
    email: { type: 'string', format: 'email' },
};

const getAllUsersSchema: Schema = {
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

const searchUsers: Schema = {
    description: 'Search for users by name, surname or email',
    querystring: {
        type: 'object',
        properties: {
            username: { type: 'string', description: 'User\'s identifier (required)' },
        },
        required: ['username'],
    },
    tags: ['users'],
    response: {
        200: {
        type: 'array',
        items: {
            type: 'object',
            properties: userResponse,
            required: ['id', 'name', 'surname', 'email', 'jobQualifier', 'isLoggedIn'],
        },
        },
    },
};

const userProfileResponse = {
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

            isLoggedIn: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            avatar: { type: 'string' },

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
                description: { type: 'string' },
                status: { type: 'string' },
                organizationId: { type: 'number' },
                role: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                closedAt: { type: 'string', format: 'date-time' },
                joinedAt: { type: 'string', format: 'date-time' }, // ProjectParticipant.createdAt
                },
                required: ['id', 'name', 'organizationId', 'role', 'joinedAt'],
            },
            },

            tasks: {
                type: 'array',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    projectName: { type: 'string' },
                    status: { type: 'string' },
                    description: { type: 'string' }
                }
            }
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
            'tasks',
            'avatar'
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
    }

const getUserProfile: Schema = {
    description: 'Fetch a user profile (user + organizations + projects)',
    tags: ['users'],
    params: {
        type: 'object',
        properties: {
        id: { type: 'string', description: 'user id' },
        },
        required: ['id'],
    },
    response: userProfileResponse
}

const getActiveUserProfile: Schema = {
    description: 'Fetch the profile of the currently connected user (get id from JWT)',
    tags: ['users'],
    response: userProfileResponse
}


const getUserFriends: Schema = {
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

const createUser: Schema = {
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

const modUser: Schema = {
    description: 'Modify a User and returns it on success',
    tags: ['users'],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'first name' },
            surname: { type: 'string', description: 'last name' },
            email: { type: 'string', format: 'email', description: 'email' },
            phone: { type: 'string', description: 'phone number' },
            jobQualifier: { type: 'string', description: 'job qualifier' },

            city: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            cap: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
        },
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

const modPassword: Schema = {
    description: 'Modify an User password',
    tags: ['users'],
    body: {
        type: 'object',
        properties: {
            password: { type: 'string', description: 'password' },
        },
    },
    response: {
        201: {
            type: 'object',
            properties: { success: { type: 'boolean' } },
            required: ['success'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};

const login: Schema = {
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
}

const logout: Schema = {
    description: 'Log the current user out using the id stored in the jwt http only session token.',
    tags: ['users'],
    response : {
        200: {
            type: 'object',
            properties: { success: {type: 'string'} },
            required: ['success']
        },
        400: {
            type: 'object',
            properties: { error: {type: 'string'} },
            required: ['error']
        }
    }
}

const getUserProjects: Schema = {
  description: "Get current user's projects.",
  tags: ['users'],
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          roleId: { type: 'number' },
          project: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              status: { type: 'string', enum: ['TODO', 'ACTIVE', 'REVIEW', 'CLOSED'] },
              description: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              closedAt: { type: 'string', format: 'date-time', nullable: true },
              tasks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    projectId: { type: 'number' },
                    name: { type: 'string' },
                    status: { type: 'string', enum: ['TODO', 'ACTIVE', 'REVIEW', 'CLOSED'] },
                    priority: { type: 'string', enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                    dueDate: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    closedAt: { type: 'string', format: 'date-time', nullable: true },
                    description: { type: 'string', nullable: true },
                  },
                  required: ['id', 'projectId', 'name', 'status', 'priority', 'createdAt'],
                },
              },
            },
            required: ['id', 'name', 'status', 'createdAt', 'tasks'],
          },
        },
        required: ['roleId', 'project'],
      },
    },
    400: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
  },
}


const seed: Schema = {
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
    searchUsers: searchUsers,
    getUserProfile: getUserProfile,
    getActiveUserProfile: getActiveUserProfile,
    getUserFriends: getUserFriends,
    createUser: createUser,
    modUser: modUser,
    modPassword: modPassword,
    login: login,
    logout: logout,
    seed: seed,
    userResponse: userResponse,
    getProjects: getUserProjects
};
