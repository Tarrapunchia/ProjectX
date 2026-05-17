type Schema = Record<string, any>

const getFriends: Schema = {
    description: 'Get all the friendships of the current user filtered by the param status (PENDING | ACCEPTED | BLOCKED)',
    tags: ['friends'],
    params: {
        type: 'object',
        properties: {
        status: { type: 'string', description: 'friendship status' },
        },
        required: ['status'],
    },
    response: {
        200: {
            type: 'object',
            properties: {
                userId: { type: 'string'},
                count: { type: 'number'},
                friends: {
                    type: 'array',
                    items: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        surname: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        jobQualifier: { type: 'string' },
                        isLoggedIn: { type: 'boolean'},
                        avatar: { type: 'string' }
                    }
                }
            },
            required: ['userId', 'count', 'friends']
        }
    }
}

const createRequest: Schema = {
  description: 'Send a friend request to another user',
  tags: ['friends'],
  summary: 'Create friend request',
  body: {
    type: 'object',
    properties: {
      targetUserId: { type: 'integer' },
    },
    required: ['targetUserId'],
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        friendship: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            senderId: { type: 'integer' },
            receiverId: { type: 'integer' },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'BLOCKED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'senderId', 'receiverId', 'status', 'createdAt'],
        },
      },
      required: ['success', 'friendship'],
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

const acceptRequest: Schema = {
  description: 'Accept a friend request',
  tags: ['friends'],
  summary: 'Accept friend request',
  params: {
    type: 'object',
    properties: {
      requestId: { type: 'integer' },
    },
    required: ['requestId'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        friendship: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            senderId: { type: 'integer' },
            receiverId: { type: 'integer' },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'BLOCKED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      required: ['success', 'friendship'],
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

const getPendingRequests: Schema = {
  description: 'Get pending friend requests for authenticated user',
  tags: ['friends'],
  summary: 'Get pending friend requests',
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        requests: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              senderId: { type: 'integer' },
              receiverId: { type: 'integer' },
              status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'BLOCKED'] },
              createdAt: { type: 'string', format: 'date-time' },
              sender: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  surname: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  avatarUrl: { type: 'string' },
                  isLoggedIn: { type: 'boolean' },
                },
                required: ['id', 'name', 'surname', 'email', 'avatarUrl', 'isLoggedIn'],
              },
            },
            required: ['id', 'senderId', 'receiverId', 'status', 'createdAt', 'sender'],
          },
        },
      },
      required: ['success', 'requests'],
    },
    401: {
      type: 'object',
      properties: { error: { type: 'string' } },
      required: ['error'],
    },
  },
};

const rejectRequest: Schema = {
  description: 'Reject a friend request',
  tags: ['friends'],
  summary: 'Reject friend request',
  params: {
    type: 'object',
    properties: {
      requestId: { type: 'integer' },
    },
    required: ['requestId'],
  },
  response: {
    200: {
      description: 'Friend request rejected successfully',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        friendship: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            senderId: { type: 'integer' },
            receiverId: { type: 'integer' },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: [
            'id',
            'senderId',
            'receiverId',
            'status',
            'createdAt',
          ],
        },
      },
      required: ['success', 'friendship'],
    },
    400: {
      description: 'Invalid request id or user',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
    403: {
      description: 'User is not allowed to reject this request',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
    404: {
      description: 'Friend request not found',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
    409: {
      description: 'Friend request already handled',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
  },
};

const blockUser: Schema = {
    description: 'Block a user (creates/updates Friendship as BLOCKED)',
    tags: ['friends'],
    body: {
      type: 'object',
      properties: {
        targetUserId: { type: 'number' },
      },
      required: ['targetUserId'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          blockedUserId: { type: 'number' },
          friendshipId: { type: 'number' },
          status: { type: 'string' },
        },
        required: ['success', 'blockedUserId', 'friendshipId', 'status'],
      },
      400: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] },
      401: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] },
      404: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] },
    },
}

const unblockUser: Schema = {
  description: 'Unblock a user (removes BLOCKED friendship made by current user)',
  tags: ['friends'],
  body: {
    type: 'object',
    properties: {
      targetUserId: { type: 'number' },
    },
    required: ['targetUserId'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        unblockedUserId: { type: 'number' },
      },
      required: ['success', 'unblockedUserId'],
    },
    400: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] },
    401: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] },
    404: { type: 'object', properties: { error: { type: 'string' } }, required: ['error'] },
  },
}


export const friendsSchema = {
    getFriends: getFriends,
    createRequest,
    getPendingRequests,
    acceptRequest,
    rejectRequest,
    blockUser,
    unblockUser,
};
