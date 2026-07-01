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

const createProjectSchema: Schema = {
    description: 'Creates a new project setting the creator as owner - god mode and returning the project, using a name and the org id as input',
    tags: ['projects'],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string'},
            orgId: { type: 'number' },
            status: { type: 'string' },
            description: { type: 'string' },
            closedAt: { type: 'string', format: 'date-time', nullable: true },
        },
        required: ['name', 'orgId', 'status'],
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                organizationId: { type: 'number' }
            },
            required: ['id', 'name', 'organizationId'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
}

export const addProjectParticipantsSchema: Schema = {
  description: 'Add one or more participants to a project',
  tags: ['projects'],
  params: {
    type: 'object',
    properties: {
      projectId: { type: 'string' },
    },
    required: ['projectId'],
  },
  body: {
    type: 'object',
    properties: {
      participants: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            user: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    surname: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                }
            },
            role: {
              type: 'string',
              enum: ['OWNER', 'EDITOR', 'VIEWER'],
            },
            joinedAt: { type: 'string', format: 'date-time' }
          },
          required: ['user', 'role'],
        },
      },
    },
    required: ['participants'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
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
              role: { type: 'string' },
              joinedAt: { type: 'string', format: 'date-time' },
            },
            required: ['user', 'role', 'joinedAt'],
          },
        },
      },
      required: ['success', 'participants'],
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
    403: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
    409: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
  },
}


export const updateProjectSchema: Schema = {
  description: 'Update project information',
  tags: ['projects'],
  params: {
    type: 'object',
    properties: {
      projectId: { type: 'string' },
    },
    required: ['projectId'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
      status: {
        type: 'string',
        enum: ['TODO', 'ACTIVE', 'REVIEW', 'CLOSED'],
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        project: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            organizationId: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            closedAt: { type: 'string', format: 'date-time', nullable: true },
          },
          required: [
            'id',
            'name',
            'description',
            'status',
            'organizationId',
            'createdAt',
            'closedAt',
          ],
        },
      },
      required: ['success', 'project'],
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
    500: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
  },
}

export const updateProjectParticipantsSchema: Schema = {
  description: 'Replace/update project participants',
  tags: ['projects'],
  params: {
    type: 'object',
    properties: {
      projectId: { type: 'string' },
    },
    required: ['projectId'],
  },
  body: {
    type: 'object',
    properties: {
      participants: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            user: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    surname: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                }
            },
            role: {
              type: 'string',
              enum: ['OWNER', 'EDITOR', 'VIEWER'],
            },
          },
          required: ['user', 'role'],
          additionalProperties: false,
        },
      },
    },
    required: ['participants'],
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
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
              role: {
                type: 'string',
                enum: ['OWNER', 'EDITOR', 'VIEWER'],
              },
              joinedAt: { type: 'string', format: 'date-time' },
            },
            required: ['user', 'role', 'joinedAt'],
          },
        },
      },
      required: ['success', 'participants'],
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
    500: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
  },
}


export const projectSchemas = {
    getAllProjectsSchema: getAllProjectsSchema,
    getProjectByIdSchema: getProjectByIdSchema,
    getProjectRoom: getProjectRoom,
    getOrgProjectsByNameSchema: getOrgProjectsByNameSchema,
    createProjectSchema: createProjectSchema,
    addProjectParticipantsSchema,
    updateProjectSchema,
    updateProjectParticipantsSchema

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


