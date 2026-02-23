const msgResponse = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        senderId: { type: 'number' },
        senderMail: { type: 'string', format: 'email' },
        content: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
    }
};
const getGroupMsgHistoryByRoomKeySchema = {
    description: 'Get the message history of a group chat room given its identifier [orgId:projId or projId].',
    tags: ['messages'],
    querystring: {
        type: 'object',
        properties: {
            roomKey: { type: 'string', description: 'Room identifier (required)' },
        },
        required: ['roomKey'],
    },
    response: {
        200: {
            type: 'object',
            properties: {
                roomKey: { type: 'string' },
                count: { type: 'number' },
                messages: {
                    type: 'array',
                    items: msgResponse,
                },
            },
            required: ['roomKey', 'count', 'messages'],
        },
        400: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error'],
        },
    },
};
export const messageSchemas = {
    getGroupMsg: getGroupMsgHistoryByRoomKeySchema,
};
//# sourceMappingURL=messagesSchema.js.map