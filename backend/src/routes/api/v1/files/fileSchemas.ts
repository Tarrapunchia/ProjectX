type Schema = Record<string, any>

const getProjectUserFilesSchema: Schema = {
  description: 'List ONLY user-subfolder files for a project (includes uploader + file stats)',
  tags: ['files'],
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string' },
      projectId: { type: 'string' },
    },
    required: ['organizationId', 'projectId'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uploaderId: { type: 'number' },
              filename: { type: 'string' },
              relativePath: { type: 'string' },
              uploaderFullName: { type: 'string' },
              size: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: [
              'uploaderId',
              'filename',
              'relativePath',
              'uploaderFullName',
              'size',
              'createdAt',
            ],
          },
        },
      },
      required: ['files'],
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

export default {
    getProjectUserFilesSchema
}