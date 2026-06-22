# Transcendence Backend README

## Overview

The Transcendence backend is a Fastify-based API server designed to support a collaborative project-management web application inspired by Jira. It provides authentication, user management, organizations, projects, tasks, events, file uploads, friendships, groups, realtime chat, notifications, and Markdown/static assets for development and debugging.

The application is built around a modular route structure and uses Prisma as the database access layer. Authentication is handled through JWTs stored in an HTTP-only cookie, while realtime features are implemented with `@fastify/websocket`.

Main responsibilities of the backend:

- expose REST APIs under `/api/v1`
- manage users and authentication
- support email/password login and Google OAuth login
- manage organizations and organization membership
- manage projects and project participants
- manage task boards and project tasks
- expose calendar-related entries for the frontend calendar
- manage friendships, groups, invitations, and blocking
- handle file uploads and avatar uploads through multipart requests
- provide realtime private chat, room chat, presence, and notifications through WebSocket
- expose Swagger documentation and Prometheus-style metrics

---

## Tech stack

| Area | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Web framework | Fastify |
| ORM | Prisma Client |
| Authentication | JWT + HTTP-only cookies |
| Password hashing | `bcrypt-ts` |
| OAuth | Google OAuth 2.0 / OpenID Connect |
| Realtime | `@fastify/websocket` |
| File upload | `@fastify/multipart` |
| Validation / docs | Fastify JSON schemas + Swagger |
| CORS | `@fastify/cors` |
| Static files | `@fastify/static` |
| Metrics | `fastify-metrics` |
| Logging | Fastify logger / Pino Pretty in development |

---

## Application entry point

The backend starts from:

```txt
src/server.ts
```

The server listens on port `5000` and binds to `0.0.0.0`, making it reachable both from localhost and from containerized/dev environments.

```ts
server.listen({ port: PORT, host: '0.0.0.0' })
```

The server can run either in HTTP or HTTPS mode depending on the `HTTPS` environment variable.

When HTTPS is enabled, the server expects local certificates inside:

```txt
certs/localhost-key.pem
certs/localhost.pem
```

In development, the backend is usually available at:

```txt
http://localhost:5000
```

When HTTPS is enabled:

```txt
https://localhost:5000
```

---

## Global server configuration

The Fastify instance is configured with:

```ts
ignoreTrailingSlash: true
caseSensitive: false
```

This means that routes are more tolerant regarding trailing slashes and casing.

Examples:

```txt
/api/v1/users/login
/api/v1/users/login/
```

are treated more permissively than in a strict default configuration.

---

## Registered plugins

The main server registers the following plugins:

| Plugin | Purpose |
|---|---|
| `@fastify/swagger` | OpenAPI specification generation |
| `@fastify/swagger-ui` | Swagger UI page at `/docs` |
| `@fastify/cors` | Cross-origin requests from the frontend |
| `@fastify/jwt` | JWT signing and verification |
| `@fastify/rate-limit` | Per-route rate limiting |
| `@fastify/cookie` | Cookie parsing and cookie writing |
| `fastify-metrics` | Metrics endpoint at `/metrics` |
| `@fastify/formbody` | Form body parsing |
| custom `prismaPlugin` | Adds `server.prisma` |
| `@fastify/websocket` | WebSocket support |
| custom `websocketPlugin` | Realtime connection manager and `/ws` route |
| `@fastify/multipart` | Multipart uploads with max 100 MB file size |
| `@fastify/static` | Static files from `src/public` |

---

## Project structure

```txt
src/
├─ server.ts
├─ helpers/
│  ├─ auth.ts
│  ├─ cookies.ts
│  └─ googleOAuth.ts
├─ plugins/
│  ├─ prismaPlugin.ts
│  └─ websockets/
│     ├─ types.ts
│     └─ websocket.ts
├─ public/
│  ├─ avatar/
│  │  └─ default.png
│  ├─ chatDbg.html
│  ├─ chatNuda.html
│  ├─ index.html
│  ├─ lavagna.html
│  ├─ privateChat.html
│  ├─ roomchat.html
│  ├─ uploads.html
│  └─ wsREADME.html
└─ routes/
   ├─ google/
   │  ├─ auth.ts
   │  └─ schemas.ts
   └─ api/
      ├─ api.ts
      └─ v1/
         ├─ v1.ts
         ├─ users/
         ├─ organizations/
         ├─ projects/
         ├─ tasks/
         ├─ events/
         ├─ files/
         ├─ friends/
         ├─ groups/
         ├─ messages/
         └─ debug/
```

The backend uses a modular route registration strategy. The root API plugin registers version `v1`, and each domain registers its own routes.

```txt
/api
└─ /v1
   ├─ /users
   ├─ /organizations
   ├─ /projects
   ├─ /tasks
   ├─ /events
   ├─ /messages
   ├─ /files
   ├─ /friends
   ├─ /groups
   └─ /debug
```

---

## Route registration tree

The route tree is built as follows:

```ts
server.register(api, { prefix: 'api' })
```

`api.ts` registers:

```ts
fastify.register(V1, { prefix: 'v1' })
```

`v1.ts` registers:

```ts
fastify.register(Users, { prefix: 'users' })
fastify.register(Organizations, { prefix: 'organizations' })
fastify.register(Projects, { prefix: 'projects' })
fastify.register(Tasks, { prefix: 'tasks' })
fastify.register(Events, { prefix: 'events' })
fastify.register(Messages, { prefix: 'messages' })
fastify.register(Files, { prefix: 'files' })
fastify.register(Friends, { prefix: 'friends' })
fastify.register(Groups, { prefix: 'groups' })
fastify.register(Debug, { prefix: 'debug' })
```

Therefore, for example:

```txt
POST /api/v1/users/login
GET  /api/v1/projects/:id
POST /api/v1/tasks/addTask
```

---

## Authentication model

Authentication is based on a JWT stored inside an HTTP-only cookie named:

```txt
session
```

The JWT payload contains:

```ts
{ userId: number }
```

The token is signed with Fastify JWT and has a duration of 24 hours:

```ts
fastify.jwt.sign({ userId: user.id }, { expiresIn: '24h' })
```

The cookie is set through `setAuthCookie()` in:

```txt
src/helpers/cookies.ts
```

In development, the cookie is configured as:

```ts
httpOnly: true
secure: false
sameSite: 'lax'
path: '/'
```

In production, the cookie switches to:

```ts
secure: true
sameSite: 'none'
```

This distinction is important because `secure: true` cookies are not stored by the browser over plain HTTP.

---

## Authentication helpers

### `setAuthCookie(reply, token)`

Sets the HTTP-only session cookie after login, registration, or Google OAuth callback.

### `getUserIdFromJWT(req, res, fastify)`

Reads the `session` cookie, verifies the JWT, and returns the authenticated `userId`.

If the token is invalid, it can respond with:

```json
{ "error": "Invalid token" }
```

### `wsGetUserIdFromJWT(req, fastify)`

WebSocket-specific version of the JWT extraction helper. It verifies the cookie during the WebSocket handshake and returns the authenticated user id or `null`.

---

## Google OAuth flow

Google OAuth routes are registered with the prefix:

```txt
/auth
```

The available routes are:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/google` | Redirects the browser to Google OAuth |
| GET | `/auth/google/callback` | Receives the Google authorization code |

The OAuth flow works as follows:

1. The frontend redirects the browser to:

   ```txt
   http://localhost:5000/auth/google
   ```

2. The backend builds the Google authorization URL with:

   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_REDIRECT_URI`
   - scopes: `openid`, `email`, `profile`
   - response type: `code`

3. Google redirects back to:

   ```txt
   /auth/google/callback?code=...
   ```

4. The backend exchanges the code for tokens through:

   ```txt
   https://oauth2.googleapis.com/token
   ```

5. The backend validates the Google ID token through:

   ```txt
   https://oauth2.googleapis.com/tokeninfo
   ```

6. The backend fetches user profile information from:

   ```txt
   https://openidconnect.googleapis.com/v1/userinfo
   ```

7. The user is created or updated through Prisma using `upsert()`.

8. A JWT session cookie is created.

9. The user is redirected to the frontend dashboard:

   ```txt
   http://localhost:5173/dashboard
   ```

Required environment variables:

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:5000/auth/google/callback"
```

The value of `GOOGLE_REDIRECT_URI` must exactly match the redirect URI configured inside Google Cloud Console.

---

## CORS configuration

The backend allows requests from the main local frontend origins:

```txt
http://localhost:5173
http://127.0.0.1:5173
https://localhost:5173
https://127.0.0.1:5173
```

It also allows backend/local origins for development tools and static debug pages:

```txt
http://localhost:5000
http://127.0.0.1:5000
https://localhost:5000
https://127.0.0.1:5000
```

Credentials are enabled:

```ts
credentials: true
```

This is required because authentication uses cookies. When the frontend calls protected endpoints, requests should include:

```ts
credentials: 'include'
```

Example:

```ts
await fetch('http://localhost:5000/api/v1/users/activeUser', {
  method: 'GET',
  credentials: 'include',
})
```

---

## Swagger documentation

Swagger UI is exposed at:

```txt
http://localhost:5000/docs
```

The OpenAPI metadata is configured in `server.ts`:

```ts
title: 'Transcendence'
description: 'Backend Fastify'
version: '1.0.0'
```

Each route module uses schema files such as:

```txt
usersSchemas.ts
organizationsSchema.ts
projectsSchema.ts
tasksSchema.ts
friendsSchema.ts
groupsSchema.ts
messagesSchema.ts
eventsSchema.ts
fileSchemas.ts
```

These schemas are used for request validation and Swagger documentation.

---

## Metrics

The backend exposes a metrics endpoint at:

```txt
/metrics
```

This is registered through `fastify-metrics`.

---

## Static files and fallback behavior

Static files are served from:

```txt
src/public
```

The server also defines a custom not-found handler.

For unknown API routes starting with `/api`, the server returns:

```json
{ "error": "Not found" }
```

For non-API routes, the server falls back to:

```txt
src/public/index.html
```

This allows static frontend/debug pages to be served directly by the backend.

---

# REST API Reference

All v1 REST endpoints are mounted under:

```txt
/api/v1
```

---

## Users API

Base path:

```txt
/api/v1/users
```

### Main responsibilities

- register new users
- login/logout
- retrieve user profiles
- retrieve active authenticated user
- search users
- retrieve user friends
- retrieve user projects
- retrieve calendar entries
- update profile information
- update password
- delete the active user
- retrieve user avatars

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/users/` | Returns all users |
| POST | `/api/v1/users/addUser` | Creates a new user and logs them in |
| POST | `/api/v1/users/login` | Logs in with email and password |
| POST | `/api/v1/users/logout` | Clears the session cookie and marks the user offline |
| GET | `/api/v1/users/activeUser` | Returns the authenticated user profile |
| GET | `/api/v1/users/:id/profile` | Returns a public/detailed profile by user id |
| GET | `/api/v1/users/:id/avatar` | Streams the avatar image for a user |
| GET | `/api/v1/users/search?username=...` | Searches users by name/surname |
| GET | `/api/v1/users/:id/friends` | Returns a user's friends |
| GET | `/api/v1/users/activeUsersProjects` | Returns projects for the authenticated user |
| GET | `/api/v1/users/calendarEntries` | Returns tasks and events for the calendar |
| PUT | `/api/v1/users/modifyUserProfile` | Updates authenticated user profile data |
| PUT | `/api/v1/users/modifyUserPassword` | Updates authenticated user password |
| DELETE | `/api/v1/users/delete` | Deletes the authenticated user |

### Register user

```http
POST /api/v1/users/addUser
Content-Type: application/json
```

Example body:

```json
{
  "name": "Fabio",
  "surname": "Rossi",
  "email": "fabio@example.com",
  "phone": "+390000000000",
  "jobQualifier": "Software Developer",
  "password": "secret",
  "passwordRepeat": "secret",
  "city": "Florence",
  "address": "Example Street",
  "cap": "50100",
  "state": "Italy"
}
```

The backend hashes the password using `bcrypt-ts`, creates the user, marks them as logged in, signs a JWT, and sets the session cookie.

### Login

```http
POST /api/v1/users/login
Content-Type: application/json
```

Example body:

```json
{
  "email": "fabio@example.com",
  "password": "secret"
}
```

Successful response:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Fabio",
    "surname": "Rossi",
    "email": "fabio@example.com"
  }
}
```

The login route has a per-route rate limit:

```txt
5 requests every 15 minutes
```

### Logout

```http
POST /api/v1/users/logout
```

The backend clears the `session` cookie and updates the user status to `isLoggedIn: false`.

---

## Organizations API

Base path:

```txt
/api/v1/organizations
```

### Main responsibilities

- create organizations
- list organizations
- retrieve organization profile/details
- search organizations by name
- retrieve members
- invite users
- accept join requests/invitations
- update organization information
- delete organizations

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/organizations/` | Returns organizations / overview data |
| GET | `/api/v1/organizations/:id/organization` | Returns organization details |
| GET | `/api/v1/organizations/search` | Searches organizations |
| GET | `/api/v1/organizations/:id/members` | Returns organization members |
| GET | `/api/v1/organizations/invitations/pending` | Returns pending organization invitations |
| POST | `/api/v1/organizations/addOrganization` | Creates a new organization |
| POST | `/api/v1/organizations/:id/addMember` | Adds a member directly |
| POST | `/api/v1/organizations/:id/invitations` | Creates an invitation/join request |
| POST | `/api/v1/organizations/:id/invitations/:requestId/accept` | Accepts an invitation/request |
| PUT | `/api/v1/organizations/modifyOrganizationInfos` | Updates organization data |
| DELETE | `/api/v1/organizations/delete/:id` | Deletes an organization |

Organization creation uses a transaction to create both the organization and the initial membership for the owner.

Realtime notifications are sent through WebSocket when invitations are created or accepted.

---

## Projects API

Base path:

```txt
/api/v1/projects
```

### Main responsibilities

- create projects inside organizations
- retrieve all projects
- retrieve a project by id
- retrieve room information for a project
- search projects
- delete projects

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/projects/` | Returns projects |
| GET | `/api/v1/projects/:id` | Returns a project by id |
| GET | `/api/v1/projects/room/:id` | Returns room/chat metadata for a project |
| GET | `/api/v1/projects/search` | Searches projects |
| POST | `/api/v1/projects/addProject` | Creates a project |
| DELETE | `/api/v1/projects/delete/:id` | Deletes a project |

Project creation validates the parent organization and creates the project inside a Prisma transaction. The creator is added as a project participant, usually with an OWNER role.

---

## Tasks API

Base path:

```txt
/api/v1/tasks
```

### Main responsibilities

- create project tasks
- retrieve tasks by project
- retrieve tasks for the authenticated user
- update tasks
- delete tasks

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/tasks/projTasks/:id` | Returns tasks for a project |
| GET | `/api/v1/tasks/activeUserTasks` | Returns tasks assigned/linked to the active user |
| POST | `/api/v1/tasks/addTask` | Creates a task |
| PUT | `/api/v1/tasks/:id` | Updates a task |
| DELETE | `/api/v1/tasks/:id/remove` | Deletes a task |

### Create task

```http
POST /api/v1/tasks/addTask
Content-Type: application/json
```

Example body:

```json
{
  "name": "Implement dashboard charts",
  "projId": 1,
  "status": "TODO",
  "description": "Create charts for task priorities and project progress."
}
```

Task creation checks that the authenticated user is a participant of the target project and has enough permissions. Only users with an `OWNER` or `EDITOR` role can create tasks.

When a task is created, the backend also creates a `taskParticipant` entry linking the creator to the task.

---

## Events API

Base path:

```txt
/api/v1/events
```

### Main responsibilities

- create calendar events
- retrieve active user events
- update events
- delete events

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/events/activeUserEvents` | Returns events for the authenticated user |
| POST | `/api/v1/events/create` | Creates an event |
| PUT | `/api/v1/events/:id` | Updates an event |
| DELETE | `/api/v1/events/:id` | Deletes an event |

Events are used together with tasks to populate the frontend calendar.

---

## Messages API

Base path:

```txt
/api/v1/messages
```

### Main responsibilities

- retrieve room chat history
- retrieve private conversation history

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/messages/roomHistory` | Returns messages for a chat room |
| GET | `/api/v1/messages/pvtHistory` | Returns messages for a private conversation |

Messages are created primarily through the WebSocket layer and retrieved later through REST endpoints.

---

## Files API

Base path:

```txt
/api/v1/files
```

### Main responsibilities

- upload organization files
- upload project files
- upload user/project files
- upload user avatar
- list files
- stream/download files
- preview files
- delete files

Multipart upload is enabled globally with a maximum file size of:

```txt
100 MB
```

### Upload endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/files/` | Uploads a generic organization/project file |
| POST | `/api/v1/files/user` | Uploads a user-linked file |
| POST | `/api/v1/files/project` | Uploads a project-linked file |
| POST | `/api/v1/files/avatar` | Uploads the authenticated user's avatar |

### List/read endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/files/:organizationId/:projectId` | Lists project files |
| GET | `/api/v1/files/:organizationId/:projectId/user` | Lists user files for a project |
| GET | `/api/v1/files/files/:organizationId/:filename` | Streams an organization file |
| GET | `/api/v1/files/files/:organizationId/:projectId/:filename` | Streams a project file |
| GET | `/api/v1/files/files/preview/:organizationId/:projectId/:filename` | Previews a project file |
| GET | `/api/v1/files/files/:organizationId/:projectId/user/:uploaderId/:filename` | Streams a user-uploaded project file |
| GET | `/api/v1/files/files/preview/:organizationId/:projectId/user/:uploaderId/:filename` | Previews a user-uploaded project file |

### Delete endpoints

| Method | Endpoint | Description |
|---|---|---|
| DELETE | `/api/v1/files/:organizationId/:filename` | Deletes an organization file |
| DELETE | `/api/v1/files/:organizationId/:projectId/:filename` | Deletes a project file |
| DELETE | `/api/v1/files/:organizationId/:projectId/user/:filename` | Deletes a user project file |

The file routes validate organization/project existence and user permissions before allowing uploads or deletions.

---

## Friends API

Base path:

```txt
/api/v1/friends
```

### Main responsibilities

- list friendships by status
- list pending friend requests
- create friend requests
- accept/reject requests
- block/unblock users
- send realtime notifications

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/friends/:status` | Returns friendships filtered by status |
| GET | `/api/v1/friends/requests/pending` | Returns pending friendship requests |
| POST | `/api/v1/friends/requests` | Creates a friend request |
| POST | `/api/v1/friends/requests/:requestId/accept` | Accepts a friend request |
| POST | `/api/v1/friends/requests/:requestId/reject` | Rejects a friend request |
| POST | `/api/v1/friends/block` | Blocks a user |
| POST | `/api/v1/friends/unblock` | Unblocks a user |

Friend actions send WebSocket notifications to involved users when they are online.

---

## Groups API

Base path:

```txt
/api/v1/groups
```

### Main responsibilities

- create groups
- retrieve group details
- retrieve joined groups
- retrieve pending group invitations
- add participants
- invite users
- accept invitations
- update group information
- leave groups
- notify group rooms in realtime

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/groups/:id` | Returns group details |
| GET | `/api/v1/groups/pending` | Returns pending group invitations |
| GET | `/api/v1/groups/joined` | Returns groups joined by the authenticated user |
| POST | `/api/v1/groups/addGroup` | Creates a group |
| POST | `/api/v1/groups/addPartecipant` | Adds a participant to a group |
| POST | `/api/v1/groups/:groupId/invitations` | Creates a group invitation |
| POST | `/api/v1/groups/:groupId/invitations/:requestId/accept` | Accepts a group invitation |
| PUT | `/api/v1/groups/:id` | Updates group data |
| DELETE | `/api/v1/groups/:id/leave` | Leaves a group |

Groups also have realtime rooms using room ids in this format:

```txt
group:<groupId>
```

---

## Debug API

Base path:

```txt
/api/v1/debug
```

Debug routes are development-only helpers.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/debug/seed` | Seeds test data |
| POST | `/api/v1/debug/forceAddFriend/:friendId` | Forces a friendship relation |
| GET | `/api/v1/debug/loginFabio` | Development login helper |
| GET | `/api/v1/debug/loginOsme` | Development login helper |

These routes should not be enabled in production without protection.

---

# WebSocket API

The WebSocket endpoint is:

```txt
/ws
```

Example frontend connection:

```ts
const ws = new WebSocket('ws://localhost:5000/ws')
```

When HTTPS is enabled, the WebSocket URL must use `wss://`:

```ts
const ws = new WebSocket('wss://localhost:5000/ws')
```

The WebSocket handshake uses the same `session` cookie used by the REST API. If the cookie is missing or invalid, the socket is closed with:

```txt
1008 - No valid token.
```

---

## WebSocket connection manager

The backend keeps track of active sockets with:

```ts
type WsClientSet = Set<WebSocket>
type WsClientsByUserId = Map<number, WsClientSet>
type WsRoomMap = Map<string, WsClientSet>
```

A user can have multiple sockets at the same time. This supports multiple browser tabs or multiple devices.

The server decorates the Fastify instance with realtime helpers:

| Helper | Description |
|---|---|
| `wsSendToUser(userId, data)` | Sends a payload to every socket of a specific user |
| `wsBroadcast(data)` | Sends a payload to every connected socket |
| `wsBroadcastExcept(except, data)` | Broadcasts to everyone except one socket |
| `wsRoomBroadcast(roomId, data, except?)` | Sends a payload to all sockets inside a room |
| `wsDisconnectUser(userId, code?, reason?)` | Closes all sockets of a user |

---

## WebSocket lifecycle

When a socket connects:

1. The backend validates the JWT cookie.
2. The socket is added to `wsClientsByUserId`.
3. The socket automatically joins project rooms for projects where the user is a participant.
4. The socket automatically joins group rooms for groups where the user is a participant.
5. The backend broadcasts user presence.
6. The client receives:

```json
{
  "type": "ws:connected",
  "userId": 1
}
```

When a socket closes:

1. The socket is removed from the user's socket set.
2. If the user has no remaining sockets, they are removed from `wsClientsByUserId`.
3. Presence is broadcast as disconnected.
4. `isLoggedIn` is updated to `false`.
5. The socket is removed from all rooms.

---

## Supported WebSocket messages

### Ping

Request:

```txt
ping
```

Response:

```json
{ "type": "pong" }
```

---

### Broadcast

Request:

```json
{
  "type": "broadcast",
  "payload": {
    "message": "Hello everyone"
  }
}
```

Broadcasted response:

```json
{
  "type": "broadcast",
  "fromUserId": 1,
  "payload": {
    "message": "Hello everyone"
  }
}
```

---

### Private message

Request:

```json
{
  "type": "private",
  "toUserId": 2,
  "payload": {
    "message": "Hello"
  }
}
```

Response to target user:

```json
{
  "type": "private",
  "fromUserId": 1,
  "payload": {
    "message": "Hello"
  }
}
```

---

### Direct chat message

Request:

```json
{
  "type": "chat:send",
  "toUserId": 2,
  "text": "Hello from direct chat"
}
```

The backend:

1. checks whether the target user exists
2. normalizes the user pair to avoid duplicated conversations
3. upserts the `directConversation`
4. stores the `directMessage`
5. sends a realtime `chat:message` event to the target user

Response to the target user:

```json
{
  "type": "chat:message",
  "fromUserId": 1,
  "toUserId": 2,
  "text": "Hello from direct chat",
  "ts": 1710000000000
}
```

---

### Join room

Request:

```json
{
  "type": "room:join",
  "roomId": "proj:1:3"
}
```

Supported room id formats:

```txt
org:<orgId>
proj:<orgId>:<projectId>
group:<groupId>
```

The backend checks:

- whether the room id is valid
- whether the room exists
- whether the authenticated user can access the room

Successful response:

```json
{
  "type": "room:joined",
  "roomId": "proj:1:3",
  "userId": 1,
  "ts": 1710000000000
}
```

---

### Leave room

Request:

```json
{
  "type": "room:leave",
  "roomId": "proj:1:3"
}
```

The backend removes the socket from the given room.

---

### Room message

Request:

```json
{
  "type": "room:message",
  "roomId": "proj:1:3",
  "payload": {
    "text": "Message inside project room"
  }
}
```

The backend:

1. verifies that the socket is currently inside the room
2. upserts a `chatRoom` based on the room key
3. stores a `roomMessage`
4. broadcasts the message to the other sockets in the room

Broadcasted response:

```json
{
  "type": "room:message",
  "roomId": "proj:1:3",
  "fromUserId": 1,
  "payload": {
    "text": "Message inside project room"
  },
  "ts": 1710000000000
}
```

---

### Notify one user

Request:

```json
{
  "type": "notify",
  "toUserId": 2,
  "notification": "You have a new invitation"
}
```

Response to target user:

```json
{
  "type": "notify",
  "notification": "You have a new invitation",
  "ts": 1710000000000
}
```

---

### Notify all users

Request:

```json
{
  "type": "notifyAll",
  "notification": "System message"
}
```

Broadcasted response:

```json
{
  "type": "notify",
  "notification": "System message",
  "ts": 1710000000000
}
```

---

# Authorization and permissions

The backend commonly follows this pattern:

1. Extract the active user from the JWT cookie.
2. Validate that the target resource exists.
3. Validate that the user is a member/participant of the resource.
4. Validate role-based permissions where required.
5. Execute the operation.

Examples:

- creating a task requires project membership and an `OWNER` or `EDITOR` role
- accessing a project room requires project participation
- accessing an organization room requires organization membership
- accessing a group room requires group participation
- file upload/delete routes validate organization/project existence and permissions

Room access is centralized in:

```txt
src/helpers/auth.ts
```

Important helpers:

```ts
parseRoomKey(key)
canAccessRoom(userId, roomKey, fastify)
roomExist(roomKey, fastify)
isMember(userId, orgId, fastify)
isParticipant(userId, projectId, fastify)
isGroupParticipant(userId, groupId, fastify)
```

---

# Prisma integration

Prisma is integrated through:

```txt
src/plugins/prismaPlugin.ts
```

The plugin:

1. creates a new `PrismaClient`
2. connects to the database
3. decorates Fastify with `server.prisma`
4. disconnects Prisma when the Fastify server closes

This allows every route to access the database with:

```ts
fastify.prisma.user.findUnique(...)
fastify.prisma.project.findMany(...)
fastify.prisma.$transaction(...)
```

Transactions are used for operations that must remain atomic, such as:

- creating an organization and its owner membership
- creating a project and its participant relation
- creating a task and its participant relation
- accepting invitations
- deleting complex resources

---

# Error handling conventions

The backend generally returns JSON errors in this format:

```json
{ "error": "Message" }
```

Common status codes:

| Status | Meaning |
|---|---|
| `400` | Invalid input or malformed request |
| `401` | Missing or invalid authentication |
| `403` | Authenticated but not allowed |
| `404` | Resource not found |
| `409` | Duplicate constraint or conflict |
| `500` | Internal server error |

Examples:

```json
{ "error": "Invalid credentials" }
```

```json
{ "error": "You must be logged in in order to create a Task" }
```

```json
{ "error": "You are not a participant of this project" }
```

---

# Development notes

## Running the backend

A typical development flow is:

```bash
npm install
npm run dev
```

or, depending on the package scripts:

```bash
npm run build
npm start
```

The server should then be available at:

```txt
http://localhost:5000
```

## Frontend origin

The frontend is expected to run on Vite's default development port:

```txt
http://localhost:5173
```

Because the frontend and backend are on different ports, every authenticated frontend request must include:

```ts
credentials: 'include'
```

## HTTP vs HTTPS

If `process.env.HTTPS` is set, the backend starts in HTTPS mode.

In that case:

- REST API base URL becomes `https://localhost:5000`
- WebSocket URL becomes `wss://localhost:5000/ws`
- cookies can use `secure: true`

If HTTPS is not enabled:

- REST API base URL is `http://localhost:5000`
- WebSocket URL is `ws://localhost:5000/ws`
- cookies must use `secure: false`

---

# Useful frontend examples

## Login request

```ts
const res = await fetch('http://localhost:5000/api/v1/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
})
```

## Get active user

```ts
const res = await fetch('http://localhost:5000/api/v1/users/activeUser', {
  method: 'GET',
  credentials: 'include',
})
```

## Connect WebSocket

```ts
const ws = new WebSocket('ws://localhost:5000/ws')

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  console.log(msg)
}
```

## Send direct chat message

```ts
ws.send(JSON.stringify({
  type: 'chat:send',
  toUserId: 2,
  text: 'Hello!'
}))
```

## Join a project room

```ts
ws.send(JSON.stringify({
  type: 'room:join',
  roomId: 'proj:1:3'
}))
```

## Send a room message

```ts
ws.send(JSON.stringify({
  type: 'room:message',
  roomId: 'proj:1:3',
  payload: {
    text: 'Hello project team!'
  }
}))
```

---

# Security considerations

Current security-related mechanisms:

- JWT session stored in an HTTP-only cookie
- password hashing with bcrypt
- route-level login rate limiting
- CORS configured with explicit allowed origins
- WebSocket authentication through cookie JWT
- authorization checks for rooms and project/task operations
- safe file path resolution for avatar serving
- multipart upload limits

Recommended improvements before production:

- move JWT secret to an environment variable
- protect or remove debug routes
- review CORS origins and avoid unnecessary development origins
- ensure HTTPS is always enabled in production
- validate uploaded file MIME types and extensions where needed
- scan uploaded files if public downloads are allowed
- avoid storing Google refresh tokens unless strictly required
- make sure `GOOGLE_REDIRECT_URI` exactly matches production callback URL
- ensure all destructive routes verify ownership/role permissions

---

# Known implementation notes

- The backend uses both REST and WebSocket APIs: REST is used for resource retrieval and historical data, WebSocket is used for realtime delivery.
- Some chat messages are persisted by the WebSocket layer and later retrieved by REST endpoints.
- Users can have multiple active WebSocket connections at the same time.
- Project and group rooms are automatically joined when a user connects through WebSocket.
- The backend currently includes several static HTML debug pages under `src/public`.
- Debug routes should be treated as development-only.

---

# Summary

The Transcendence backend is the central API layer for a Jira-like collaborative web application. It combines Fastify REST routes, Prisma database access, JWT cookie authentication, Google OAuth, multipart uploads, and WebSocket realtime communication.

Its modular structure makes each domain independent and easy to extend:

- `users` handles identity and profile data
- `organizations` handles workspaces and memberships
- `projects` handles project containers
- `tasks` handles project work items
- `events` supports calendar entries
- `files` handles uploads and previews
- `friends` and `groups` support the social/collaboration layer
- `messages` retrieves chat history
- `websocketPlugin` powers realtime communication

This backend is designed to support a complete collaborative workflow: users log in, join organizations, create projects, manage tasks, upload files, communicate in realtime, and track their work from a centralized frontend dashboard.
