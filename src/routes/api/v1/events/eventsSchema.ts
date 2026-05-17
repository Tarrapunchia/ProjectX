type Schema = Record<string, any>

const getUserEventsSchema: Schema = {
    description: 'Get a single user\'s events',
    tags: ['events'],
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string'},
                    time: { type: 'string', format: 'date-time' },
                    description: { type: 'string', nullable: true },
                    owner: { type: 'string' },
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

const createEventSchema: Schema = {
    description: 'Create a new event',
    tags: ['events'],
    body: {
        type: 'object',
        required: ['name', 'type', 'dueDate'],
        properties: {
            name: { type: 'string', minLength: 1 },
            type: { type: 'string' },
            dueDate: { type: 'string', format: 'date-time' },
            description: { type: 'string', nullable: true },
            participants: { 
                type: 'array', 
                items: { type: 'number' }
            }
        }
    },
    response: {
        201: {
            description: 'Event created successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                id: { type: 'string' }
            }
        },
        400: {
            type: 'object',
            properties: {
                error: { type: 'string' }
            }
        }
    }
}

export const eventsSchemas = {
    getUserEventsSchema,
    createEventSchema
};