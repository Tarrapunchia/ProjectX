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

export const friendsSchema = {
    getFriends: getFriends
};
