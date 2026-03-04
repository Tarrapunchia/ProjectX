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

export const taskSchemas = {
    getProjTasksSchema: getProjTasksSchema

};