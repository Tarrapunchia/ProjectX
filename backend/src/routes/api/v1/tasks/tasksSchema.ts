type Schema = Record<string, any>

const getProjTasksSchema: Schema = {
    description: 'Get a single project with participants',
    tags: ['tasks'],
    params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    status: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    closedAt: { type: 'string', format: 'date-time', nullable: true },
                    projectId: { type: 'string' },
                    priority: { type: 'string' }
                }
            }
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' }
            }
        }
    },
}

const createTaskchema: Schema = {
    description: 'Creates a new task setting the creator as paticipant and returning the task, using a name and the projId id as input',
    tags: ['tasks'],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string'},
            projId: { type: 'number' },
            status: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string' }
        },
        required: ['name', 'projId', 'status'],
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                projectId: { type: 'number' },
                status: { type: 'string' },
            },
            required: ['id', 'name', 'projectId', 'status'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
}

const deleteTaskSchema: Schema = {
    description: 'Deletes a task using the taskId as parameter, it checks if the user has permission',
    tags: ['tasks'],
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' }
            },
            required: ['success'],
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
    },
}

const getUserTasksSchema: Schema = {
    description: 'Get a single user\'s tasks',
    tags: ['tasks'],
    response: {
        200: {
            type: 'object',
            properties: {
                tasks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string', nullable: true },
                            status: { type: 'string' },
                            priority: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            dueDate: { type: 'string', format: 'date-time' },
                            closedAt: { type: 'string', format: 'date-time', nullable: true },
                        }
                    }
                },
                NONE: { type: 'string' },
                LOW: { type: 'string' },
                MEDIUM: { type: 'string' },
                HIGH: { type: 'string' },
                CRITICAL: { type: 'string' },
            }
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' }
            }
        }
    },
}

export const updateTaskStatusSchema: Schema = {
  description: 'Update task status. Every project participant can update task status.',
  tags: ['tasks'],
  params: {
    type: 'object',
    properties: {
      taskId: { type: 'string' },
    },
    required: ['taskId'],
  },
  body: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['TODO', 'ACTIVE', 'REVIEW', 'CLOSED'],
      },
    },
    required: ['status'],
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        task: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            projectId: { type: 'number' },
            status: {
              type: 'string',
              enum: ['TODO', 'ACTIVE', 'REVIEW', 'CLOSED'],
            },
            priority: {
              type: 'string',
              enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            },
            description: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            closedAt: { type: 'string', format: 'date-time', nullable: true },
          },
          required: [
            'id',
            'name',
            'projectId',
            'status',
            'priority',
            'description',
            'createdAt',
            'dueDate',
            'closedAt',
          ],
        },
      },
      required: ['success', 'task'],
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
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
      required: ['error'],
    },
  },
}

export const taskSchemas = {
    getProjTasksSchema: getProjTasksSchema,
    createTaskchema: createTaskchema,
    deleteTaskSchema: deleteTaskSchema,
    getUserTasksSchema,
    updateTaskStatusSchema
};