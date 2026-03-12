import { Priority } from "@prisma/client";
const getProjTasksSchema = {
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
};
const createTaskchema = {
    description: 'Creates a new task setting the creator as paticipant and returning the task, using a name and the projId id as input',
    tags: ['tasks'],
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            projId: { type: 'number' },
            status: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string' },
        },
        required: ['name', 'projId'],
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                projectId: { type: 'number' },
                status: { type: 'string' },
                priority: { type: 'string' },
            },
            required: ['id', 'name', 'projectId', 'status', 'priority'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};
const deleteTaskSchema = {
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
};
export const taskSchemas = {
    getProjTasksSchema: getProjTasksSchema,
    createTaskchema: createTaskchema,
    deleteTaskSchema: deleteTaskSchema
};
//# sourceMappingURL=tasksSchema.js.map