# README del Backend de Transcendence

## Descripción general

El backend de Transcendence es un servidor API basado en Fastify diseñado para soportar una aplicación web colaborativa de gestión de proyectos inspirada en Jira. Proporciona autenticación, gestión de usuarios, organizaciones, proyectos, tareas, eventos, subida de archivos, amistades, grupos, chat en tiempo real, notificaciones y recursos Markdown/estáticos para desarrollo y depuración.

La aplicación está construida alrededor de una estructura modular de rutas y usa Prisma como capa de acceso a base de datos. La autenticación se gestiona mediante JWT almacenados en una cookie HTTP-only, mientras que las funciones en tiempo real se implementan con `@fastify/websocket`.

Responsabilidades principales del backend:

- exponer REST APIs bajo `/api/v1`
- gestionar usuarios y autenticación
- soportar login por email/password y login con Google OAuth
- gestionar organizaciones y membresías de organizaciones
- gestionar proyectos y participantes de proyectos
- gestionar task boards y tareas de proyecto
- exponer elementos relacionados con calendario para el frontend
- gestionar amistades, grupos, invitaciones y bloqueos
- manejar subida de archivos y subida de avatar mediante solicitudes multipart
- proporcionar chat privado en tiempo real, chat por salas, presencia y notificaciones mediante WebSocket
- exponer documentación Swagger y métricas estilo Prometheus

---

## Stack tecnológico

| Área | Tecnología |
|---|---|
| Runtime | Node.js |
| Lenguaje | TypeScript |
| Web framework | Fastify |
| ORM | Prisma Client |
| Autenticación | JWT + cookies HTTP-only |
| Hash de contraseñas | `bcrypt-ts` |
| OAuth | Google OAuth 2.0 / OpenID Connect |
| Realtime | `@fastify/websocket` |
| Subida de archivos | `@fastify/multipart` |
| Validación / docs | JSON schemas de Fastify + Swagger |
| CORS | `@fastify/cors` |
| Archivos estáticos | `@fastify/static` |
| Métricas | `fastify-metrics` |
| Logging | Fastify logger / Pino Pretty en desarrollo |

---

## Punto de entrada de la aplicación

El backend arranca desde:

```txt
src/server.ts
```

El servidor escucha en el puerto `5000` y se enlaza a `0.0.0.0`, lo que lo hace accesible tanto desde localhost como desde entornos containerizados/dev.

```ts
server.listen({ port: PORT, host: '0.0.0.0' })
```

El servidor puede ejecutarse en modo HTTP o HTTPS según la variable de entorno `HTTPS`.

Cuando HTTPS está habilitado, el servidor espera certificados locales en:

```txt
certs/localhost-key.pem
certs/localhost.pem
```

En desarrollo, el backend suele estar disponible en:

```txt
http://localhost:5000
```

Cuando HTTPS está habilitado:

```txt
https://localhost:5000
```

---

## Configuración global del servidor

La instancia Fastify está configurada con:

```ts
ignoreTrailingSlash: true
caseSensitive: false
```

Esto significa que las rutas son más tolerantes respecto a barras finales y al uso de mayúsculas/minúsculas.

Ejemplos:

```txt
/api/v1/users/login
/api/v1/users/login/
```

se tratan de forma más permisiva que en una configuración estricta por defecto.

---

## Plugins registrados

El servidor principal registra los siguientes plugins:

| Plugin | Propósito |
|---|---|
| `@fastify/swagger` | Generación de la especificación OpenAPI |
| `@fastify/swagger-ui` | Página Swagger UI en `/docs` |
| `@fastify/cors` | Peticiones cross-origin desde el frontend |
| `@fastify/jwt` | Firma y verificación de JWT |
| `@fastify/rate-limit` | Rate limiting por ruta |
| `@fastify/cookie` | Parseo y escritura de cookies |
| `fastify-metrics` | Endpoint de métricas en `/metrics` |
| `@fastify/formbody` | Parseo de body de formularios |
| plugin custom `prismaPlugin` | Añade `server.prisma` |
| `@fastify/websocket` | Soporte WebSocket |
| plugin custom `websocketPlugin` | Gestor de conexiones realtime y ruta `/ws` |
| `@fastify/multipart` | Subidas multipart con tamaño máximo de 100 MB |
| `@fastify/static` | Archivos estáticos desde `src/public` |

---

## Estructura del proyecto

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

El backend usa una estrategia modular de registro de rutas. El plugin raíz de API registra la versión `v1` y cada dominio registra sus propias rutas.

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

## Árbol de registro de rutas

El árbol de rutas se construye así:

```ts
server.register(api, { prefix: 'api' })
```

`api.ts` registra:

```ts
fastify.register(V1, { prefix: 'v1' })
```

`v1.ts` registra:

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

Por lo tanto, por ejemplo:

```txt
POST /api/v1/users/login
GET  /api/v1/projects/:id
POST /api/v1/tasks/addTask
```

---

## Modelo de autenticación

La autenticación se basa en un JWT almacenado dentro de una cookie HTTP-only llamada:

```txt
session
```

El payload JWT contiene:

```ts
{ userId: number }
```

El token se firma con Fastify JWT y tiene una duración de 24 horas:

```ts
fastify.jwt.sign({ userId: user.id }, { expiresIn: '24h' })
```

La cookie se establece mediante `setAuthCookie()` en:

```txt
src/helpers/cookies.ts
```

En desarrollo, la cookie se configura como:

```ts
httpOnly: true
secure: false
sameSite: 'lax'
path: '/'
```

En producción, la cookie pasa a:

```ts
secure: true
sameSite: 'none'
```

Esta distinción es importante porque las cookies `secure: true` no son almacenadas por el navegador sobre HTTP plano.

---

## Helpers de autenticación

### `setAuthCookie(reply, token)`

Establece la cookie de sesión HTTP-only después de login, registro o callback de Google OAuth.

### `getUserIdFromJWT(req, res, fastify)`

Lee la cookie `session`, verifica el JWT y devuelve el `userId` autenticado.

Si el token es inválido, puede responder con:

```json
{ "error": "Invalid token" }
```

### `wsGetUserIdFromJWT(req, fastify)`

Versión específica para WebSocket del helper de extracción JWT. Verifica la cookie durante el handshake WebSocket y devuelve el id del usuario autenticado o `null`.

---

## Flujo Google OAuth

Las rutas Google OAuth se registran con el prefijo:

```txt
/auth
```

Las rutas disponibles son:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/auth/google` | Redirige el navegador a Google OAuth |
| GET | `/auth/google/callback` | Recibe el código de autorización de Google |

El flujo OAuth funciona así:

1. El frontend redirige el navegador a:

   ```txt
   http://localhost:5000/auth/google
   ```

2. El backend construye la URL de autorización de Google con:

   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_REDIRECT_URI`
   - scopes: `openid`, `email`, `profile`
   - response type: `code`

3. Google redirige de vuelta a:

   ```txt
   /auth/google/callback?code=...
   ```

4. El backend intercambia el código por tokens a través de:

   ```txt
   https://oauth2.googleapis.com/token
   ```

5. El backend valida el Google ID token mediante:

   ```txt
   https://oauth2.googleapis.com/tokeninfo
   ```

6. El backend obtiene información de perfil del usuario desde:

   ```txt
   https://openidconnect.googleapis.com/v1/userinfo
   ```

7. El usuario se crea o actualiza mediante Prisma usando `upsert()`.

8. Se crea una cookie de sesión JWT.

9. El usuario se redirige al dashboard del frontend:

   ```txt
   http://localhost:5173/dashboard
   ```

Variables de entorno requeridas:

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:5000/auth/google/callback"
```

El valor de `GOOGLE_REDIRECT_URI` debe coincidir exactamente con la redirect URI configurada en Google Cloud Console.

---

## Configuración CORS

El backend permite solicitudes desde los principales orígenes locales del frontend:

```txt
http://localhost:5173
http://127.0.0.1:5173
https://localhost:5173
https://127.0.0.1:5173
```

También permite orígenes backend/locales para herramientas de desarrollo y páginas estáticas de depuración:

```txt
http://localhost:5000
http://127.0.0.1:5000
https://localhost:5000
https://127.0.0.1:5000
```

Las credenciales están habilitadas:

```ts
credentials: true
```

Esto es necesario porque la autenticación usa cookies. Cuando el frontend llama endpoints protegidos, las peticiones deben incluir:

```ts
credentials: 'include'
```

Ejemplo:

```ts
await fetch('http://localhost:5000/api/v1/users/activeUser', {
  method: 'GET',
  credentials: 'include',
})
```

---

## Documentación Swagger

Swagger UI está expuesta en:

```txt
http://localhost:5000/docs
```

Los metadatos OpenAPI se configuran en `server.ts`:

```ts
title: 'Transcendence'
description: 'Backend Fastify'
version: '1.0.0'
```

Cada módulo de rutas usa archivos de esquemas como:

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

Estos esquemas se usan para validación de peticiones y documentación Swagger.

---

## Métricas

El backend expone un endpoint de métricas en:

```txt
/metrics
```

Esto se registra mediante `fastify-metrics`.

---

## Archivos estáticos y comportamiento fallback

Los archivos estáticos se sirven desde:

```txt
src/public
```

El servidor también define un manejador not-found custom.

Para rutas API desconocidas que comienzan con `/api`, el servidor devuelve:

```json
{ "error": "Not found" }
```

Para rutas no API, el servidor hace fallback a:

```txt
src/public/index.html
```

Esto permite servir páginas estáticas frontend/debug directamente desde el backend.

---

# Referencia de la REST API

Todos los endpoints REST v1 están montados bajo:

```txt
/api/v1
```

---

## Users API

Base path:

```txt
/api/v1/users
```

### Responsabilidades principales

- registrar nuevos usuarios
- login/logout
- obtener perfiles de usuario
- obtener el usuario autenticado activo
- buscar usuarios
- obtener amigos del usuario
- obtener proyectos del usuario
- obtener entradas de calendario
- actualizar información de perfil
- actualizar contraseña
- eliminar el usuario activo
- obtener avatares de usuario

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/users/` | Devuelve todos los usuarios |
| POST | `/api/v1/users/addUser` | Crea un nuevo usuario y lo loguea |
| POST | `/api/v1/users/login` | Hace login con email y contraseña |
| POST | `/api/v1/users/logout` | Borra la cookie de sesión y marca al usuario offline |
| GET | `/api/v1/users/activeUser` | Devuelve el perfil del usuario autenticado |
| GET | `/api/v1/users/:id/profile` | Devuelve un perfil público/detallado por id |
| GET | `/api/v1/users/:id/avatar` | Sirve en streaming la imagen avatar de un usuario |
| GET | `/api/v1/users/search?username=...` | Busca usuarios por nombre/apellido |
| GET | `/api/v1/users/:id/friends` | Devuelve los amigos de un usuario |
| GET | `/api/v1/users/activeUsersProjects` | Devuelve proyectos del usuario autenticado |
| GET | `/api/v1/users/calendarEntries` | Devuelve tareas y eventos para el calendario |
| PUT | `/api/v1/users/modifyUserProfile` | Actualiza los datos de perfil del usuario autenticado |
| PUT | `/api/v1/users/modifyUserPassword` | Actualiza la contraseña del usuario autenticado |
| DELETE | `/api/v1/users/delete` | Elimina al usuario autenticado |

### Registrar usuario

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

El backend hashea la contraseña usando `bcrypt-ts`, crea el usuario, lo marca como logueado, firma un JWT y establece la cookie de sesión.

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

Respuesta correcta:

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

La ruta de login tiene un rate limit por ruta:

```txt
5 requests every 15 minutes
```

### Logout

```http
POST /api/v1/users/logout
```

El backend borra la cookie `session` y actualiza el estado del usuario a `isLoggedIn: false`.

---

## Organizations API

Base path:

```txt
/api/v1/organizations
```

### Responsabilidades principales

- crear organizaciones
- listar organizaciones
- obtener perfil/detalles de una organización
- buscar organizaciones por nombre
- obtener miembros
- invitar usuarios
- aceptar solicitudes/invitaciones
- actualizar información de la organización
- eliminar organizaciones

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/organizations/` | Devuelve organizaciones / datos de resumen |
| GET | `/api/v1/organizations/:id/organization` | Devuelve detalles de la organización |
| GET | `/api/v1/organizations/search` | Busca organizaciones |
| GET | `/api/v1/organizations/:id/members` | Devuelve miembros de la organización |
| GET | `/api/v1/organizations/invitations/pending` | Devuelve invitaciones pendientes de organización |
| POST | `/api/v1/organizations/addOrganization` | Crea una nueva organización |
| POST | `/api/v1/organizations/:id/addMember` | Añade un miembro directamente |
| POST | `/api/v1/organizations/:id/invitations` | Crea una invitación/join request |
| POST | `/api/v1/organizations/:id/invitations/:requestId/accept` | Acepta una invitación/solicitud |
| PUT | `/api/v1/organizations/modifyOrganizationInfos` | Actualiza datos de la organización |
| DELETE | `/api/v1/organizations/delete/:id` | Elimina una organización |

La creación de organizaciones usa una transacción para crear tanto la organización como la membresía inicial del owner.

Las notificaciones realtime se envían por WebSocket cuando las invitaciones se crean o se aceptan.

---

## Projects API

Base path:

```txt
/api/v1/projects
```

### Responsabilidades principales

- crear proyectos dentro de organizaciones
- obtener todos los proyectos
- obtener un proyecto por id
- obtener información de sala para un proyecto
- buscar proyectos
- eliminar proyectos

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/projects/` | Devuelve proyectos |
| GET | `/api/v1/projects/:id` | Devuelve un proyecto por id |
| GET | `/api/v1/projects/room/:id` | Devuelve metadata de room/chat para un proyecto |
| GET | `/api/v1/projects/search` | Busca proyectos |
| POST | `/api/v1/projects/addProject` | Crea un proyecto |
| DELETE | `/api/v1/projects/delete/:id` | Elimina un proyecto |

La creación del proyecto valida la organización padre y crea el proyecto dentro de una transacción Prisma. El creador se añade como project participant, normalmente con rol OWNER.

---

## Tasks API

Base path:

```txt
/api/v1/tasks
```

### Responsabilidades principales

- crear tareas de proyecto
- obtener tareas por proyecto
- obtener tareas del usuario autenticado
- actualizar tareas
- eliminar tareas

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/tasks/projTasks/:id` | Devuelve tareas de un proyecto |
| GET | `/api/v1/tasks/activeUserTasks` | Devuelve tareas asignadas/vinculadas al usuario activo |
| POST | `/api/v1/tasks/addTask` | Crea una tarea |
| PUT | `/api/v1/tasks/:id` | Actualiza una tarea |
| DELETE | `/api/v1/tasks/:id/remove` | Elimina una tarea |

### Crear tarea

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

La creación de tareas comprueba que el usuario autenticado sea participante del proyecto objetivo y tenga permisos suficientes. Solo los usuarios con rol `OWNER` o `EDITOR` pueden crear tareas.

Cuando se crea una tarea, el backend también crea una entrada `taskParticipant` que vincula al creador con la tarea.

---

## Events API

Base path:

```txt
/api/v1/events
```

### Responsabilidades principales

- crear eventos de calendario
- obtener eventos del usuario activo
- actualizar eventos
- eliminar eventos

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/events/activeUserEvents` | Devuelve eventos del usuario autenticado |
| POST | `/api/v1/events/create` | Crea un evento |
| PUT | `/api/v1/events/:id` | Actualiza un evento |
| DELETE | `/api/v1/events/:id` | Elimina un evento |

Los eventos se usan junto con las tareas para poblar el calendario del frontend.

---

## Messages API

Base path:

```txt
/api/v1/messages
```

### Responsabilidades principales

- obtener historial de chat de sala
- obtener historial de conversación privada

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/messages/roomHistory` | Devuelve mensajes de una chat room |
| GET | `/api/v1/messages/pvtHistory` | Devuelve el historial de una conversación privada |

Los mensajes se crean principalmente mediante la capa WebSocket y después se recuperan a través de endpoints REST.

---

## Files API

Base path:

```txt
/api/v1/files
```

### Responsabilidades principales

- subir archivos de organización
- subir archivos de proyecto
- subir archivos usuario/proyecto
- subir avatar de usuario
- listar archivos
- hacer stream/download de archivos
- previsualizar archivos
- eliminar archivos

La subida multipart está habilitada globalmente con un tamaño máximo de archivo de:

```txt
100 MB
```

### Endpoints de subida

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/v1/files/` | Sube un archivo genérico de organización/proyecto |
| POST | `/api/v1/files/user` | Sube un archivo vinculado a un usuario |
| POST | `/api/v1/files/project` | Sube un archivo vinculado a un proyecto |
| POST | `/api/v1/files/avatar` | Sube el avatar del usuario autenticado |

### Endpoints de lista/lectura

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/files/:organizationId/:projectId` | Lista archivos de proyecto |
| GET | `/api/v1/files/:organizationId/:projectId/user` | Lista archivos de usuario para un proyecto |
| GET | `/api/v1/files/files/:organizationId/:filename` | Hace streaming de un archivo de organización |
| GET | `/api/v1/files/files/:organizationId/:projectId/:filename` | Hace streaming de un archivo de proyecto |
| GET | `/api/v1/files/files/preview/:organizationId/:projectId/:filename` | Previsualiza un archivo de proyecto |
| GET | `/api/v1/files/files/:organizationId/:projectId/user/:uploaderId/:filename` | Hace streaming de un archivo de proyecto subido por un usuario |
| GET | `/api/v1/files/files/preview/:organizationId/:projectId/user/:uploaderId/:filename` | Previsualiza un archivo de proyecto subido por un usuario |

### Endpoints de borrado

| Método | Endpoint | Descripción |
|---|---|---|
| DELETE | `/api/v1/files/:organizationId/:filename` | Elimina un archivo de organización |
| DELETE | `/api/v1/files/:organizationId/:projectId/:filename` | Elimina un archivo de proyecto |
| DELETE | `/api/v1/files/:organizationId/:projectId/user/:filename` | Elimina un archivo de usuario de proyecto |

Las rutas de archivos validan la existencia de la organización/proyecto y los permisos del usuario antes de permitir subidas o borrados.

---

## Friends API

Base path:

```txt
/api/v1/friends
```

### Responsabilidades principales

- listar amistades por estado
- listar solicitudes de amistad pendientes
- crear solicitudes de amistad
- aceptar/rechazar solicitudes
- bloquear/desbloquear usuarios
- enviar notificaciones en tiempo real

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/friends/:status` | Devuelve amistades filtradas por estado |
| GET | `/api/v1/friends/requests/pending` | Devuelve solicitudes de amistad pendientes |
| POST | `/api/v1/friends/requests` | Crea una solicitud de amistad |
| POST | `/api/v1/friends/requests/:requestId/accept` | Acepta una solicitud de amistad |
| POST | `/api/v1/friends/requests/:requestId/reject` | Rechaza una solicitud de amistad |
| POST | `/api/v1/friends/block` | Bloquea a un usuario |
| POST | `/api/v1/friends/unblock` | Desbloquea a un usuario |

Las acciones de amistad envían notificaciones WebSocket a los usuarios implicados cuando están online.

---

## Groups API

Base path:

```txt
/api/v1/groups
```

### Responsabilidades principales

- crear grupos
- obtener detalles de grupo
- obtener grupos a los que el usuario se ha unido
- obtener invitaciones de grupo pendientes
- añadir participantes
- invitar usuarios
- aceptar invitaciones
- actualizar información del grupo
- abandonar grupos
- notificar salas de grupo en tiempo real

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/groups/:id` | Devuelve detalles del grupo |
| GET | `/api/v1/groups/pending` | Devuelve invitaciones pendientes de grupo |
| GET | `/api/v1/groups/joined` | Devuelve grupos a los que el usuario autenticado se ha unido |
| POST | `/api/v1/groups/addGroup` | Crea un grupo |
| POST | `/api/v1/groups/addPartecipant` | Añade un participante a un grupo |
| POST | `/api/v1/groups/:groupId/invitations` | Crea una invitación de grupo |
| POST | `/api/v1/groups/:groupId/invitations/:requestId/accept` | Acepta una invitación de grupo |
| PUT | `/api/v1/groups/:id` | Actualiza los datos del grupo |
| DELETE | `/api/v1/groups/:id/leave` | Abandona un grupo |

Los grupos también tienen salas realtime usando ids de sala con este formato:

```txt
group:<groupId>
```

---

## Debug API

Base path:

```txt
/api/v1/debug
```

Las rutas debug son helpers solo para desarrollo.

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/v1/debug/seed` | Inserta datos de prueba |
| POST | `/api/v1/debug/forceAddFriend/:friendId` | Fuerza una relación de amistad |
| GET | `/api/v1/debug/loginFabio` | Helper de login para desarrollo |
| GET | `/api/v1/debug/loginOsme` | Helper de login para desarrollo |

Estas rutas no deberían habilitarse en producción sin protección.

---

# WebSocket API

El endpoint WebSocket es:

```txt
/ws
```

Example frontend connection:

```ts
const ws = new WebSocket('ws://localhost:5000/ws')
```

Cuando HTTPS está habilitado, la URL WebSocket debe usar `wss://`:

```ts
const ws = new WebSocket('wss://localhost:5000/ws')
```

El handshake WebSocket usa la misma cookie `session` que la REST API. Si la cookie falta o es inválida, el socket se cierra con:

```txt
1008 - No valid token.
```

---

## Gestor de conexiones WebSocket

El backend mantiene un seguimiento de sockets activos con:

```ts
type WsClientSet = Set<WebSocket>
type WsClientsByUserId = Map<number, WsClientSet>
type WsRoomMap = Map<string, WsClientSet>
```

Un usuario puede tener varios sockets al mismo tiempo. Esto soporta múltiples pestañas o múltiples dispositivos.

El servidor decora la instancia Fastify con helpers realtime:

| Helper | Descripción |
|---|---|
| `wsSendToUser(userId, data)` | Envía un payload a todos los sockets de un usuario específico |
| `wsBroadcast(data)` | Envía un payload a todos los sockets conectados |
| `wsBroadcastExcept(except, data)` | Hace broadcast a todos excepto a un socket |
| `wsRoomBroadcast(roomId, data, except?)` | Envía un payload a todos los sockets dentro de una sala |
| `wsDisconnectUser(userId, code?, reason?)` | Cierra todos los sockets de un usuario |

---

## Ciclo de vida WebSocket

Cuando un socket se conecta:

1. El backend valida la cookie JWT.
2. El socket se añade a `wsClientsByUserId`.
3. El socket entra automáticamente en las salas de proyecto de los proyectos en los que el usuario participa.
4. El socket entra automáticamente en las salas de grupo de los grupos en los que el usuario participa.
5. El backend hace broadcast de la presencia del usuario.
6. El cliente recibe:

```json
{
  "type": "ws:connected",
  "userId": 1
}
```

Cuando un socket se cierra:

1. El socket se elimina del conjunto de sockets del usuario.
2. Si el usuario no tiene más sockets, se elimina de `wsClientsByUserId`.
3. La presencia se broadcasta como desconectada.
4. `isLoggedIn` se actualiza a `false`.
5. El socket se elimina de todas las salas.

---

## Mensajes WebSocket soportados

### Ping

Petición:

```txt
ping
```

Respuesta:

```json
{ "type": "pong" }
```

---

### Broadcast

Petición:

```json
{
  "type": "broadcast",
  "payload": {
    "message": "Hello everyone"
  }
}
```

Respuesta broadcast:

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

### Mensaje privado

Petición:

```json
{
  "type": "private",
  "toUserId": 2,
  "payload": {
    "message": "Hello"
  }
}
```

Respuesta al usuario destino:

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

### Mensaje de chat directo

Petición:

```json
{
  "type": "chat:send",
  "toUserId": 2,
  "text": "Hello from direct chat"
}
```

El backend:

1. comprueba que el usuario destino existe
2. normaliza el par de usuarios para evitar conversaciones duplicadas
3. hace upsert de `directConversation`
4. guarda `directMessage`
5. envía un evento realtime `chat:message` al usuario destino

Respuesta al usuario destino:

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

Petición:

```json
{
  "type": "room:join",
  "roomId": "proj:1:3"
}
```

Formatos de room id soportados:

```txt
org:<orgId>
proj:<orgId>:<projectId>
group:<groupId>
```

El backend comprueba:

- si el room id es válido
- si la sala existe
- si el usuario autenticado puede acceder a la sala

Respuesta exitosa:

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

Petición:

```json
{
  "type": "room:leave",
  "roomId": "proj:1:3"
}
```

El backend elimina el socket de la sala dada.

---

### Room message

Petición:

```json
{
  "type": "room:message",
  "roomId": "proj:1:3",
  "payload": {
    "text": "Message inside project room"
  }
}
```

El backend:

1. verifica que el socket está actualmente dentro de la sala
2. hace upsert de `chatRoom` según la room key
3. guarda un `roomMessage`
4. emite el mensaje al resto de sockets de la sala

Respuesta broadcast:

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

### Notificar a un usuario

Petición:

```json
{
  "type": "notify",
  "toUserId": 2,
  "notification": "You have a new invitation"
}
```

Respuesta al usuario destino:

```json
{
  "type": "notify",
  "notification": "You have a new invitation",
  "ts": 1710000000000
}
```

---

### Notificar a todos los usuarios

Petición:

```json
{
  "type": "notifyAll",
  "notification": "System message"
}
```

Respuesta broadcast:

```json
{
  "type": "notify",
  "notification": "System message",
  "ts": 1710000000000
}
```

---

# Autorización y permisos

El backend sigue habitualmente este patrón:

1. Extraer el usuario activo desde la cookie JWT.
2. Validar que el recurso objetivo exista.
3. Validar que el usuario sea miembro/participante del recurso.
4. Validar permisos basados en roles cuando sea necesario.
5. Ejecutar la operación.

Ejemplos:

- crear una tarea requiere membresía del proyecto y rol `OWNER` o `EDITOR`
- acceder a una sala de proyecto requiere participación en el proyecto
- acceder a una sala de organización requiere membresía de la organización
- acceder a una sala de grupo requiere participación en el grupo
- las rutas de subida/borrado de archivos validan existencia de organización/proyecto y permisos

El acceso a salas está centralizado en:

```txt
src/helpers/auth.ts
```

Helpers importantes:

```ts
parseRoomKey(key)
canAccessRoom(userId, roomKey, fastify)
roomExist(roomKey, fastify)
isMember(userId, orgId, fastify)
isParticipant(userId, projectId, fastify)
isGroupParticipant(userId, groupId, fastify)
```

---

# Integración Prisma

Prisma está integrado mediante:

```txt
src/plugins/prismaPlugin.ts
```

El plugin:

1. crea un nuevo `PrismaClient`
2. se conecta a la base de datos
3. decora Fastify con `server.prisma`
4. desconecta Prisma cuando el servidor Fastify se cierra

Esto permite que cada ruta acceda a la base de datos con:

```ts
fastify.prisma.user.findUnique(...)
fastify.prisma.project.findMany(...)
fastify.prisma.$transaction(...)
```

Las transacciones se usan para operaciones que deben permanecer atómicas, como:

- crear una organización y la membresía de su owner
- crear un proyecto y su relación de participante
- crear una tarea y su relación de participante
- aceptar invitaciones
- eliminar recursos complejos

---

# Convenciones de manejo de errores

El backend generalmente devuelve errores JSON en este formato:

```json
{ "error": "Message" }
```

Códigos de estado comunes:

| Status | Significado |
|---|---|
| `400` | Entrada inválida o solicitud mal formada |
| `401` | Autenticación ausente o inválida |
| `403` | Autenticado pero no permitido |
| `404` | Recurso no encontrado |
| `409` | Restricción duplicada o conflicto |
| `500` | Error interno del servidor |

Ejemplos:

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

# Notas de desarrollo

## Ejecutar el backend

Un flujo típico de desarrollo es:

```bash
npm install
npm run dev
```

O, según los scripts del package:

```bash
npm run build
npm start
```

El servidor debería estar disponible en:

```txt
http://localhost:5000
```

## Origen del frontend

Se espera que el frontend se ejecute en el puerto por defecto de desarrollo de Vite:

```txt
http://localhost:5173
```

Como frontend y backend están en puertos distintos, toda petición autenticada del frontend debe incluir:

```ts
credentials: 'include'
```

## HTTP vs HTTPS

Si `process.env.HTTPS` está definida, el backend arranca en modo HTTPS.

En ese caso:

- la REST API base URL pasa a ser `https://localhost:5000`
- la WebSocket URL pasa a ser `wss://localhost:5000/ws`
- las cookies pueden usar `secure: true`

Si HTTPS no está habilitado:

- la REST API base URL es `http://localhost:5000`
- la WebSocket URL es `ws://localhost:5000/ws`
- las cookies deben usar `secure: false`

---

# Ejemplos útiles de frontend

## Solicitud de login

```ts
const res = await fetch('http://localhost:5000/api/v1/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
})
```

## Obtener usuario activo

```ts
const res = await fetch('http://localhost:5000/api/v1/users/activeUser', {
  method: 'GET',
  credentials: 'include',
})
```

## Conectar WebSocket

```ts
const ws = new WebSocket('ws://localhost:5000/ws')

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  console.log(msg)
}
```

## Enviar mensaje de chat directo

```ts
ws.send(JSON.stringify({
  type: 'chat:send',
  toUserId: 2,
  text: 'Hello!'
}))
```

## Unirse a una sala de proyecto

```ts
ws.send(JSON.stringify({
  type: 'room:join',
  roomId: 'proj:1:3'
}))
```

## Enviar un mensaje a la sala

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

# Consideraciones de seguridad

Mecanismos de seguridad actuales:

- sesión JWT almacenada en cookie HTTP-only
- hash de contraseñas con bcrypt
- rate limiting en la ruta de login
- CORS configurado con orígenes permitidos explícitos
- autenticación WebSocket mediante cookie JWT
- comprobaciones de autorización para salas y operaciones de proyecto/tarea
- resolución segura de rutas de archivos para servir avatares
- límites en subidas multipart

Mejoras recomendadas antes de producción:

- mover el secreto JWT a una variable de entorno
- proteger o eliminar las rutas debug
- revisar los orígenes CORS y evitar orígenes de desarrollo innecesarios
- garantizar que HTTPS esté siempre habilitado en producción
- validar tipos MIME y extensiones de los archivos subidos cuando sea necesario
- escanear los archivos subidos si se permiten descargas públicas
- evitar guardar refresh tokens de Google salvo que sea estrictamente necesario
- asegurar que `GOOGLE_REDIRECT_URI` coincida exactamente con la callback URL de producción
- garantizar que todas las rutas destructivas verifiquen ownership/permisos de rol

---

# Notas conocidas de implementación

- El backend usa tanto REST como WebSocket APIs: REST se usa para recuperación de recursos y datos históricos, WebSocket para entrega en tiempo real.
- Algunos mensajes de chat se persisten desde la capa WebSocket y luego se recuperan mediante endpoints REST.
- Los usuarios pueden tener múltiples conexiones WebSocket activas al mismo tiempo.
- Las salas de proyecto y grupo se unen automáticamente cuando un usuario se conecta por WebSocket.
- El backend incluye actualmente varias páginas HTML estáticas de depuración bajo `src/public`.
- Las rutas debug deben considerarse solo para desarrollo.

---

# Resumen

El backend de Transcendence es la capa API central para una aplicación web colaborativa estilo Jira. Combina rutas REST Fastify, acceso a base de datos con Prisma, autenticación JWT mediante cookies, Google OAuth, subidas multipart y comunicación realtime por WebSocket.

Su estructura modular hace que cada dominio sea independiente y fácil de extender:

- `users` gestiona identidad y datos de perfil
- `organizations` gestiona workspaces y membresías
- `projects` gestiona contenedores de proyecto
- `tasks` gestiona work items del proyecto
- `events` soporta entradas de calendario
- `files` gestiona subidas y vistas previas
- `friends` y `groups` soportan la capa social/colaborativa
- `messages` recupera el historial de chat
- `websocketPlugin` impulsa la comunicación en tiempo real

Este backend está diseñado para soportar un flujo colaborativo completo: los usuarios hacen login, se unen a organizaciones, crean proyectos, gestionan tareas, suben archivos, se comunican en tiempo real y siguen su trabajo desde un dashboard frontend centralizado.

---

# Addendum de Monitoring, Prometheus y Grafana

Esta sección complementa el README backend existente sin reemplazar ninguna de la información anterior. Documenta la pila de monitorización y observabilidad añadida sobre el backend Fastify + Prisma existente.

## Alcance de monitorización DevOps

El backend ahora forma parte de una pila de monitorización basada en:

- **Prometheus** para recolección de métricas y scraping
- **Grafana** para dashboards y visualización
- endpoints operativos del backend para comprobaciones de estado del servicio
- reglas de alerta para escenarios críticos y de warning

Esta capa de monitorización complementa el endpoint de métricas ya expuesto por `fastify-metrics`.

---

## Endpoints operativos

Además de `/metrics`, el backend ahora expone endpoints operativos pensados para health checking y readiness verification:

```txt
/health
/ready
/status
```

### `/health`
Usado como endpoint de liveness.

Propósito:
- verificar que el proceso backend está vivo
- verificar que Fastify responde

Significado típico de la respuesta:
- `200 OK` significa que el proceso backend está en ejecución

### `/ready`
Usado como endpoint de readiness.

Propósito:
- verificar que el backend está realmente listo para servir tráfico
- verificar que Prisma puede acceder a una tabla real de la aplicación
- verificar que la capa de base de datos es utilizable, no solo que el proceso está vivo

Significado típico de la respuesta:
- `200 OK` significa que el backend puede acceder correctamente a la base de datos
- `503` significa que el servicio está vivo pero no preparado para servir tráfico normal

### `/status`
Usado como endpoint de resumen operativo compacto.

Propósito:
- exponer el estado de runtime en formato JSON simple
- proporcionar un pequeño snapshot de estado para operadores y para la dashboard de monitorización
- resumir environment, uptime y estado de base de datos

---

## Métricas y observabilidad

El backend ya expone métricas Prometheus en:

```txt
/metrics
```

Estas métricas incluyen:

- métricas de proceso Node.js
- uso de memoria y CPU
- uso de heap
- event loop lag
- métricas de garbage collection
- métricas de peticiones HTTP
- histogramas y summaries de duración de peticiones

En particular, las métricas recogidas del backend incluyen monitorización de solicitudes para:

```txt
/health
/ready
/status
```

Esto permite monitorizar tanto el rendimiento genérico del backend como los endpoints operativos específicos introducidos para el módulo DevOps.

---

## Arquitectura de la pila de monitorización

La configuración de monitorización usa servicios Docker Compose para:

- backend
- frontend / nginx
- Prometheus
- Grafana

### Responsabilidades de Prometheus

Prometheus es responsable de:

- hacer scrape de `backend:5000/metrics`
- evaluar reglas de alerta
- almacenar métricas en series temporales para su posterior visualización en dashboards

### Responsabilidades de Grafana

Grafana es responsable de:

- conectarse a Prometheus como datasource
- cargar el dashboard FT_TRANSCENDENCE preconfigurado
- mostrar paneles operativos y de runtime del backend
- proporcionar una interfaz visual para inspección durante desarrollo y evaluación

---

## Configuración de Prometheus

Prometheus está configurado para hacer scrape del endpoint de métricas del backend mediante un objetivo de la red Docker interna similar a:

```txt
backend:5000
```

La configuración de scraping incluye:

- automonitorización de Prometheus
- scraping de métricas del backend
- carga de reglas de alerta personalizadas

Los archivos de configuración se almacenan en la carpeta monitoring del proyecto, normalmente bajo:

```txt
monitoring/prometheus/prometheus.yml
monitoring/prometheus/alerts.yml
```

---

## Reglas de alerta

La pila de monitorización incluye reglas de alerta para problemas operativos del backend.

Ejemplos de alertas configuradas para el proyecto incluyen:

- backend caído / objetivo de scrape no disponible
- uso alto de memoria del backend
- event loop lag alto

Estas reglas permiten que el sistema vaya más allá de dashboards pasivos y detecte activamente condiciones degradadas del runtime.

---

## Provisioning de Grafana

Grafana está configurada con provisioning automático para que el datasource y el dashboard se carguen sin configuración manual.

Archivos típicos de provisioning:

```txt
monitoring/grafana/provisioning/datasources/datasource.yml
monitoring/grafana/provisioning/dashboards/dashboard.yml
monitoring/grafana/dashboards/ft_transcendence_backend_monitoring.json
```

Esto significa que, una vez que Docker Compose arranca la pila de monitorización, Grafana automáticamente:

1. crea el datasource Prometheus
2. carga el dashboard FT_TRANSCENDENCE
3. deja el dashboard disponible sin import manual

---

## Contenido del dashboard

El dashboard custom de Grafana se centra en la observabilidad del backend e incluye paneles como:

- estado backend up/down
- peticiones por segundo
- latencia P95
- uso de memoria
- tasa de peticiones por ruta
- latencia por ruta
- event loop lag
- uso de heap
- tasa de garbage collection
- tasa y latencia de endpoints operativos `/health`, `/ready` y `/status`

Este dashboard fue diseñado específicamente alrededor de los nombres de métricas expuestos por el backend del proyecto, en lugar de depender solo de un dashboard genérico prebuilt de Node.js.

---

## Seguridad de la interfaz de monitorización

La pila de monitorización también incluye protección de acceso para Grafana.

Las medidas de seguridad previstas incluyen:

- acceso no anónimo
- credenciales admin explícitas configuradas mediante variables de entorno
- binding solo local para acceso de desarrollo cuando corresponda

Esto se añadió para alinearse con el requisito del subject de que el acceso a Grafana debe estar asegurado.

---

## Ejecución de la pila de monitorización

Cuando se usa la ruta de despliegue con Docker Compose, los servicios de monitorización se arrancan junto con la pila de la aplicación.

Un comando típico es:

```bash
docker compose up --build
```

Según la configuración local, los siguientes endpoints quedan disponibles:

```txt
Frontend:   https://localhost:8443
Prometheus: http://localhost:9090
Grafana:    http://localhost:3000
```

Prometheus puede usarse para verificar targets mediante su UI, mientras que Grafana proporciona la vista operativa basada en dashboard.

---

## Flujo de verificación operativa

Un procedimiento simple de verificación para la pila de monitorización es:

1. arrancar toda la pila Docker Compose
2. abrir Prometheus y comprobar que el target `backend` está `UP`
3. abrir Grafana y comprobar que el dashboard FT_TRANSCENDENCE está cargado
4. generar tráfico contra `/health`, `/ready` y `/status`
5. comprobar que los gráficos se actualizan en Grafana
6. opcionalmente simular una condición degradada del backend y observar el comportamiento de las alertas

Esto hace que el módulo sea fácil de demostrar durante la evaluación.

---

## Ownership del backend para el módulo de monitorización

Responsable principal de implementación:
- **Fabio Zucconi (`fzucconi`)**

Soporte / validación backend:
- **Giulia Vigano (`gvigano`)**
