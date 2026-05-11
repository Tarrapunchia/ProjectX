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
                status: { type: 'string' },
                description: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                closedAt: { type: 'string', format: 'date-time' },
            }
        }
    }
};

const singleOrgResponse = {
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
                status: { type: 'string' },
                description: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                closedAt: { type: 'string', format: 'date-time' },
                tasks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            projectId: { type: 'number' },
                            name: { type: 'string' },
                            status: { type: 'string' },
                            priority: { type: 'string' },
                            dueDate: { type: 'string', format: 'date-time'},
                            createdAt: { type: 'string', format: 'date-time'},
                            closedAt: { type: 'string', format: 'date-time'},
                            description: { type: 'string', nullable: true },
                        }
                    }
                }
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
                required: ['id', 'name', 'email', 'phone', 'ownerId'],
            },
        },
    },
};

const getOrgProfileById: Schema = {
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
            properties: singleOrgResponse,
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

const getOrgByName: Schema = {
    description: 'Search organizations by name or part of it (or all orgs if the name is empty)',
    tags: ['organizations'],
    querystring: {
        type: 'object',
        properties: {
        organizationName: { type: 'string' },
        },
    },
    response: {
        200: {
        type: 'object',
        properties: {
            result: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                projects: {
                    type: 'array',
                    items: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                    },
                    required: ['id', 'name'],
                    },
                },
                members: {
                    type: 'array',
                    items: {
                    type: 'object',
                    properties: {
                        userId: { type: 'number' },
                        joinedAt: { type: 'string', format: 'date-time' },
                        user: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            surname: { type: 'string' },
                            jobQualifier: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                        },
                        required: ['id', 'name', 'surname', 'jobQualifier', 'email'],
                        },
                    },
                    required: ['userId', 'joinedAt', 'user'],
                    },
                },
                },
                required: ['id', 'name', 'projects', 'members'],
            },
            },
        },
        required: ['result'],
        },
        400: {
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
        properties: { email: { type: 'string', format: 'email' } },
        required: ['email'],
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                organizationId: { type: 'number' },
                email: { type: 'string', format: 'email' },
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

const inviteMember: Schema = {
  description: 'Invite a user to join an organization',
  tags: ['organizations'],
  summary: 'Create organization invitation',
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
    },
    required: ['email'],
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        invitation: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            organizationId: { type: 'integer' },
            requesterId: { type: 'integer' },
            targetUserId: { type: 'integer' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: [
            'id',
            'organizationId',
            'requesterId',
            'targetUserId',
            'status',
            'createdAt',
            'updatedAt',
          ],
        },
      },
      required: ['success', 'invitation'],
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
    403: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
    404: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
    409: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
  },
};

const acceptInvitation: Schema = {
  description: 'Accept an organization invitation',
  tags: ['organizations'],
  summary: 'Accept organization invitation',
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      requestId: { type: 'integer' },
    },
    required: ['id', 'requestId'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        invitation: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            organizationId: { type: 'integer' },
            requesterId: { type: 'integer' },
            targetUserId: { type: 'integer' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        membership: {
          type: 'object',
          properties: {
            organizationId: { type: 'integer' },
            userId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
    403: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
    404: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
    409: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
  },
};

const getPendingInvitations: Schema = {
  description: 'Get pending organization invitations for authenticated user',
  tags: ['organizations'],
  summary: 'Get pending organization invitations',
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        invitations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              organizationId: { type: 'integer' },
              requesterId: { type: 'integer' },
              targetUserId: { type: 'integer' },
              status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
            required: [
              'id',
              'organizationId',
              'requesterId',
              'targetUserId',
              'status',
              'createdAt',
              'updatedAt',
            ],
          },
        },
      },
      required: ['success', 'invitations'],
    },
    401: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
  },
};

export const orgSchemas = {
    getAllOrgs: getAllOrgsSchema,
    getOrgProfile: getOrgProfileById,
    getOrgByName: getOrgByName,
    getOrgMembers: getOrgMembers,
    createOrg: createOrg,
    modifyOrgInfos: modifyOrgInfos,
    addMember: addMember,
    inviteMember,
    acceptInvitation,
    getPendingInvitations,
};
