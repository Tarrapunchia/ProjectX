type Schema = Record<string, any>

const orgMini = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        name: { type: 'string' },
    },
    required: ['id', 'name'],
}

const userMini = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        surname: { type: 'string' },
        email: { type: 'string', format: 'email' },
    },
    required: ['id', 'name', 'surname', 'email'],
}

const participant = {
    type: 'object',
    properties: {
        user: userMini,
        role: { type: 'string' },
        joinedAt: { type: 'string', format: 'date-time' },
    },
    required: ['user', 'role', 'joinedAt'],
}

const projResponse = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        organization: orgMini,
        status: { type: 'string' },
        description: { type: 'string' },
        participants: {
            type: 'array',
            items: participant,
        },
        createdAt: { type: 'string', format: 'date-time'},
        closedAt: { type: 'string', format: 'date-time'}
    },
    required: ['id', 'name', 'organization', 'participants', 'status', 'description'],
}

const getAllProjectsSchema: Schema = {
    description: 'Get all projects with participants',
    tags: ['projects'],
    response: {
        200: {
            type: 'array',
            items: projResponse,
        },
    },
}

const getProjectByIdSchema: Schema = {
    description: 'Get a single project with participants',
    tags: ['projects'],
    response: {
        200: projResponse,
    },
}

const getProjectRoom: Schema = {
    description: 'Get the room id for the given project',
    tags: ['projects'],
    response: {
        200: {
            type: 'object',
            properties: {
                roomId: { type: 'string' },
            }
        },
    },
}

const getOrgProjectsByNameSchema: Schema = {
    description: 'Search projects by organizationId and optional name substring. Leaving the name empty returns all the projects of an Organization.',
    tags: ['projects'],
    querystring: {
        type: 'object',
        properties: {
        organizationId: { type: 'string', description: 'Organization id (required)' },
        name: { type: 'string', description: 'Optional search term (contains, case-insensitive)' },
        },
        required: ['organizationId'],
    },
    response: {
        200: {
        type: 'object',
        properties: {
            organizationId: { type: 'number' },
            query: { type: 'string', nullable: true },
            count: { type: 'number' },
            projects: {
            type: 'array',
            items: projResponse,
            },
        },
        required: ['organizationId', 'query', 'count', 'projects'],
        },
        400: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
        },
    },
}


const addParticipantSchema: Schema = {
    description: 'Add a user as member the group',
    tags: ['groups'],
    body: {
        type: 'object',
        properties: {
            userId: { type: 'number'},
            groupId: { type: 'number' },
        },
        required: ['userId', 'groupId'],
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
            },
            required: ['id', 'name'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
}

const createGroupSchema: Schema = {
    description: 'Creates a new group setting the creator as member the group, using a name and a description [opt] as input',
    tags: ['groups'],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string'},
            description: { type: 'string' },
        },
        required: ['name'],
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                description: { type: 'string' },
            },
            required: ['id', 'name', 'description'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
}


export const groupSchemas = {
    addParticipantSchema,
    createGroupSchema: createGroupSchema,
};




// const getOrgProfile: Schema = {
//     description: 'Fetch an Organization profile',
//     tags: ['projects'],
//     params: {
//         type: 'object',
//         properties: {
//             id: { type: 'string', description: 'organization id' },
//         },
//         required: ['id'],
//     },
//     response: {
//         200: {
//             type: 'object',
//             properties: orgResponse,
//             required: ['id', 'name', 'email', 'phone', 'city', 'address', 'cap', 'state', 'ownerId'],
//         },
//         400: {
//             type: 'object',
//             properties: { error: { type: 'string' } },
//             required: ['error'],
//         },
//         404: {
//             type: 'object',
//             properties: { error: { type: 'string' } },
//             required: ['error'],
//         },
//     },
// }

// const getOrgMembers: Schema = {
//     description: 'Fetch the members of an Organization',
//     tags: ['projects'],
//     params: {
//         type: 'object',
//         properties: {
//             id: { type: 'string', description: 'organization id' },
//         },
//         required: ['id'],
//     },
//     response: {
//         200: {
//             type: 'array',
//             items: {
//                 type: 'object',
//                 properties: userSchemas.userResponse,
//                 required: ['id', 'name', 'surname', 'email', 'phone', 'jobQualifier', 'joinedAt'],
//             },
//         },
//         400: {
//             type: 'object',
//             properties: { error: { type: 'string' } },
//             required: ['error'],
//         },
//         404: {
//             type: 'object',
//             properties: { error: { type: 'string' } },
//             required: ['error'],
//         },
//     },
// }

// const createOrg: Schema = {
//     description: 'Adds a new Organization and returns it on success',
//     tags: ['projects'],
//     body: {
//         type: 'object',
//         properties: orgCreation,
//         required: ['name', 'email', 'phone'],
//     },
//     response: {
//         201: {
//             type: 'object',
//             properties: orgResponse,
//             required: ['id', 'name', 'email', 'phone', 'city', 'address', 'cap', 'state', 'ownerId'],
//         },
//         400: {
//             type: 'object',
//             properties: { error: { type: 'string' } },
//             required: ['error'],
//         },
//     },
// };

// const modifyOrgInfos: Schema = {
//     description: 'Modify Organization infos and returns it on success',
//     tags: ['projects'],
//     body: {
//         type: 'object',
//         properties: orgCreation,
//     },
//     response: {
//         201: {
//             type: 'object',
//             properties: orgResponse,
//             required: ['id', 'name', 'email', 'phone', 'city', 'address', 'cap', 'state', 'ownerId'],
//         },
//         400: {
//             type: 'object',
//             properties: { error: { type: 'string' } },
//             required: ['error'],
//         },
//     },
// };

// const addMember: Schema = {
//     description: 'Adds a new user to the Organization and returns it on success',
//     tags: ['projects'],
//     body: {
//         type: 'object',
//         properties: { userId: { type: 'number' } },
//         required: ['userId'],
//     },
//     response: {
//         201: {
//             type: 'object',
//             properties: {
//                 success: { type: 'boolean' },
//                 organizationId: { type: 'number' },
//                 userId: { type: 'number' },
//                 joinedAt: { type : 'string' }

//             },
//         },
//         400: {
//             type: 'object',
//             properties: { error: { type: 'string' } },
//             required: ['error'],
//         },
//     },
// };


