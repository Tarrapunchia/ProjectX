import { userSchemas } from "../users/usersSchemas.js";

type Schema = Record<string, any>

const orgResponse = {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },

    city: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
    cap: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
    ownerId: { type: 'number'},
    projects: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
            }
        }
    }
};

const orgCreation = {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },

    city: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
    cap: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
};

const getAllOrgsSchema: Schema = {
    description: 'Get all organizations',
    tags: ['organizations'],
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: orgResponse,
                required: ['id', 'name', 'email', 'phone', 'city', 'address', 'cap', 'state', 'ownerId'],
            },
        },
    },
};

const getOrgProfile: Schema = {
    description: 'Fetch an Organization profile',
    tags: ['organizations'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'organization id' },
        },
        required: ['id'],
    },
    response: {
        200: {
            type: 'object',
            properties: orgResponse,
            required: ['id', 'name', 'email', 'phone', 'city', 'address', 'cap', 'state', 'ownerId'],
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
}

const getOrgMembers: Schema = {
    description: 'Fetch the members of an Organization',
    tags: ['organizations'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'organization id' },
        },
        required: ['id'],
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: userSchemas.userResponse,
                required: ['id', 'name', 'surname', 'email', 'phone', 'jobQualifier', 'joinedAt'],
            },
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
}

const createOrg: Schema = {
    description: 'Adds a new Organization and returns it on success',
    tags: ['organizations'],
    body: {
        type: 'object',
        properties: orgCreation,
        required: ['name', 'email', 'phone'],
    },
    response: {
        201: {
            type: 'object',
            properties: orgResponse,
            required: ['id', 'name', 'email', 'phone', 'city', 'address', 'cap', 'state', 'ownerId'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};

const modifyOrgInfos: Schema = {
    description: 'Modify Organization infos and returns it on success',
    tags: ['organizations'],
    body: {
        type: 'object',
        properties: orgCreation,
    },
    response: {
        201: {
            type: 'object',
            properties: orgResponse,
            required: ['id', 'name', 'email', 'phone', 'city', 'address', 'cap', 'state', 'ownerId'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};

const addMember: Schema = {
    description: 'Adds a new user to the Organization and returns it on success',
    tags: ['organizations'],
    body: {
        type: 'object',
        properties: { userId: { type: 'number' } },
        required: ['userId'],
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                organizationId: { type: 'number' },
                userId: { type: 'number' },
                joinedAt: { type : 'string' }

            },
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};


export const orgSchemas = {
    getAllOrgs: getAllOrgsSchema,
    getOrgProfile: getOrgProfile,
    getOrgMembers: getOrgMembers,
    createOrg: createOrg,
    modifyOrgInfos: modifyOrgInfos,
    addMember: addMember
};
