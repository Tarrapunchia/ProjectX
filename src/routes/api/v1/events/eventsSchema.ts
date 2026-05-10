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

export const eventsSchemas = {
    getUserEventsSchema,
};