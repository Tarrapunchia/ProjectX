const orgResponse = {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    city: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
    cap: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
    ownerId: { type: 'number' }
};
const getAllOrgsSchema = {
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
const getOrgProfile = {
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
};
const createOrg = {
    description: 'Adds a new Organization and returns it on success',
    tags: ['organizations'],
    body: {
        type: 'object',
        properties: orgResponse,
        required: ['name', 'email', 'phone', 'ownerId'],
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
export const orgSchemas = {
    getAllOrgs: getAllOrgsSchema,
    getOrgProfile: getOrgProfile,
    createOrg: createOrg,
};
//# sourceMappingURL=organizationsSchema.js.map