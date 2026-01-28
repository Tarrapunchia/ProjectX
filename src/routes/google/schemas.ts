// import type { FastifySchema } from 'fastify';

// const googleAuthRedirectSchema: FastifySchema = {
//   description: 'Start Google OAuth2 login flow',
//   tags: ['google OAuth'],
//   response: {
//     302: {
//       description: 'Redirect to Google OAuth2 consent screen',
//       headers: {
//         location: {
//           type: 'string',
//           description: 'Google OAuth2 authorization URL'
//         }
//       }
//     }
//   }
// };

// const googleAuthCallbackSchema: FastifySchema = {
//   description: 'Google OAuth2 callback endpoint',
//   tags: ['google OAuth'],
//   querystring: {
//     type: 'object',
//     properties: {
//       code: {
//         type: 'string',
//         description: 'Authorization code returned by Google'
//       },
//       scope: {
//         type: 'string',
//         description: 'Granted scopes (space-separated)'
//       },
//       authuser: {
//         type: 'string',
//         description: 'Google account index when multiple accounts are logged in'
//       },
//       prompt: {
//         type: 'string',
//         description: 'Prompt parameter (e.g. consent)'
//       }
//     },
//     required: ['code']
//   },
//   response: {
//     200: {
//       description: 'User successfully authenticated with Google',
//       type: 'object',
//       properties: {
//         message: { type: 'string' },
//         user: {
//           type: 'object',
//           properties: {
//             id: { type: 'number' },
//             username: { type: 'string' },
//             email: { type: 'string', format: 'email' },
//             googleId: { type: 'string', nullable: true },
//             googleSecret: { type: 'string', nullable: true },
//             gamesWon: { type: 'number' },
//             gamesLost: { type: 'number' },
//             elo: { type: 'number' },
//             createdAt: { type: 'string', format: 'date-time' },
//             updatedAt: { type: 'string', format: 'date-time' }
//           },
//           required: ['id', 'username', 'email']
//         }
//       },
//       required: ['message', 'user']
//     },
//     400: {
//       description: 'Missing or invalid Google authorization code',
//       type: 'object',
//       properties: {
//         error: { type: 'string' }
//       },
//       required: ['error']
//     },
//     500: {
//       description: 'Internal error during Google auth flow',
//       type: 'object',
//       properties: {
//         error: { type: 'string' }
//       },
//       required: ['error']
//     }
//   }
// };

// export const googleSchemas = {
//     redirect: googleAuthRedirectSchema,
//     callback: googleAuthCallbackSchema
// }