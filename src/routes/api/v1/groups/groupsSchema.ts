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
                userId: { type: 'number' },
                groupId: { type: 'number' },
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

const leaveGroupSchema: Schema = {
    description: 'Leave a group (removes current user from group participants)',
    tags: ['groups'],
    params: {
        type: 'object',
        properties: {
            id: { type: 'string', description: 'group id' },
        },
        required: ['id'],
    },
    response: {
    200: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            deletedGroup: { type: 'boolean' },
            remainingMembers: { type: 'number' }
        },
        required: ['success'],
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
    404: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
    },
    },
}

const getGroupByIdSchema: Schema = {
    description: 'Get a single group with participants',
    tags: ['groups'],
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                participants: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            surname: { type: 'string' },
                            email: { type: 'string' },
                            joinedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                chatRoom: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        key: { type: 'string' },
                        type: { type: 'string' },
                    }
                }
            }
        },
    },
}

const updateGroupSchema: Schema = {
  description: 'Update group name and/or description (must be member)',
  tags: ['groups'],
  params: {
    type: 'object',
    properties: { id: { type: 'string' } },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        group: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            closedAt: { type: 'string', format: 'date-time', nullable: true },
          },
          required: ['id', 'name', 'createdAt'],
        },
      },
      required: ['success', 'group'],
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
  },
}

const groupInvitationSchema = {
    description: 'Invite a user to join a group',
    tags: ['groups'],
    summary: 'Create group invitation',
    params: {
      type: 'object',
      properties: {
        groupId: { type: 'integer' },
      },
      required: ['groupId'],
    },
    body: {
      type: 'object',
      properties: {
        targetUserId: { type: 'integer' },
      },
      required: ['targetUserId'],
    },
    response: {
      201: {
        description: 'Invitation created successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          invitation: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              groupId: { type: 'integer' },
              requesterId: { type: 'integer' },
              targetUserId: { type: 'integer' },
              status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
            required: [
              'id',
              'groupId',
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
        description: 'Invalid groupId or targetUserId',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
      403: {
        description: 'User is not allowed to invite users to this group',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
      404: {
        description: 'Group not found',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
      409: {
        description: 'User already in group or invitation already pending',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
    }
}

const acceptInvitationSchema: Schema = {
    description: 'Accept a group invitation',
    tags: ['groups'],
    summary: 'Accept invitation to join a group',
    params: {
      type: 'object',
      properties: {
        groupId: { type: 'integer' },
        requestId: { type: 'integer' },
      },
      required: ['groupId', 'requestId'],
    },
    response: {
      200: {
        description: 'Invitation accepted successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          invitation: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              groupId: { type: 'integer' },
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
              groupId: { type: 'integer' },
              userId: { type: 'integer' },
            },
          },
          message: { type: 'string' },
        },
      },
      400: {
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
    },
};

const getPendingInvitationsSchema: Schema = {
    description: 'Get pending group invitations for the authenticated user',
    tags: ['groups'],
    summary: 'Get pending group invitations',
    response: {
      200: {
        description: 'Pending invitations retrieved successfully',
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          invitations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                groupId: { type: 'integer' },
                requesterId: { type: 'integer' },
                targetUserId: { type: 'integer' },
                status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
                createdAt: { type: 'string', format: 'date-time' },
                },
              required: [
                'id',
                'groupId',
                'requesterId',
                'targetUserId',
                'status',
                'createdAt',
              ],
            },
          },
        },
        required: ['success', 'invitations'],
      },
      401: {
        description: 'Unauthorized',
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
    },
}

const getJoinedGroupsSchema: Schema = {
  description: 'Get all groups joined by the authenticated user',
  tags: ['groups'],
  summary: 'Get joined groups',
  response: {
    200: {
      description: 'Joined groups retrieved successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        groups: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'integer' },
              groupId: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
              group: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  description: { type: ['string', 'null'] },
                  createdAt: { type: 'string', format: 'date-time' },
                  closedAt: { type: ['string', 'null'], format: 'date-time' },
                  participants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        userId: { type: 'integer' },
                        groupId: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            surname: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                            avatarUrl: { type: 'string' },
                            isLoggedIn: { type: 'boolean' },
                          },
                          required: [
                            'id',
                            'name',
                            'surname',
                            'email',
                            'avatarUrl',
                            'isLoggedIn',
                          ],
                        },
                      },
                      required: [
                        'userId',
                        'groupId',
                        'createdAt',
                        'user',
                      ],
                    },
                  },
                },
                required: [
                  'id',
                  'name',
                  'description',
                  'createdAt',
                  'closedAt',
                  'participants',
                ],
              },
            },
            required: [
              'userId',
              'groupId',
              'createdAt',
              'group',
            ],
          },
        },
      },
      required: ['success', 'groups'],
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
  },
};

export default getJoinedGroupsSchema;

export const groupSchemas = {
    addParticipantSchema,
    createGroupSchema: createGroupSchema,
    getGroupByIdSchema,
    leaveGroupSchema,
    updateGroupSchema,
    inviteSchema: groupInvitationSchema,
    acceptSchema: acceptInvitationSchema,
    getPendingInvitationsSchema,
    getJoinedGroupsSchema,
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


