# README Backend Transcendence

## Panoramica

Il backend di Transcendence è un server API basato su Fastify progettato per supportare una web application collaborativa di project management ispirata a Jira. Fornisce autenticazione, gestione utenti, organizzazioni, progetti, task, eventi, upload di file, amicizie, gruppi, chat realtime, notifiche e asset Markdown/statici per sviluppo e debugging.

L'applicazione è costruita attorno a una struttura modulare di route e usa Prisma come livello di accesso al database. L'autenticazione è gestita tramite JWT memorizzati in un cookie HTTP-only, mentre le funzionalità realtime sono implementate con `@fastify/websocket`.

Responsabilità principali del backend:

- esporre REST API sotto `/api/v1`
- gestire utenti e autenticazione
- supportare login email/password e login Google OAuth
- gestire organizzazioni e membership delle organizzazioni
- gestire progetti e partecipanti ai progetti
- gestire task board e task di progetto
- esporre elementi legati al calendario per il frontend
- gestire amicizie, gruppi, inviti e blocchi
- gestire upload file e upload avatar tramite richieste multipart
- fornire chat private realtime, chat di stanza, presenza e notifiche tramite WebSocket
- esporre documentazione Swagger e metriche in stile Prometheus

---

## Stack tecnologico

| Area | Tecnologia |
|---|---|
| Runtime | Node.js |
| Linguaggio | TypeScript |
| Web framework | Fastify |
| ORM | Prisma Client |
| Autenticazione | JWT + cookie HTTP-only |
| Hash password | `bcrypt-ts` |
| OAuth | Google OAuth 2.0 / OpenID Connect |
| Realtime | `@fastify/websocket` |
| Upload file | `@fastify/multipart` |
| Validazione / docs | JSON schema Fastify + Swagger |
| CORS | `@fastify/cors` |
| File statici | `@fastify/static` |
| Metriche | `fastify-metrics` |
| Logging | Fastify logger / Pino Pretty in development |

---

## Entry point dell'applicazione

Il backend parte da:

```txt
src/server.ts
```

Il server ascolta sulla porta `5000` e fa bind su `0.0.0.0`, risultando raggiungibile sia da localhost sia da ambienti containerizzati/dev.

```ts
server.listen({ port: PORT, host: '0.0.0.0' })
```

Il server può funzionare sia in HTTP sia in HTTPS a seconda della variabile d'ambiente `HTTPS`.

Quando HTTPS è abilitato, il server si aspetta certificati locali in:

```txt
certs/localhost-key.pem
certs/localhost.pem
```

In sviluppo, il backend è di solito disponibile su:

```txt
http://localhost:5000
```

Quando HTTPS è abilitato:

```txt
https://localhost:5000
```

---

## Configurazione globale del server

L'istanza Fastify è configurata con:

```ts
ignoreTrailingSlash: true
caseSensitive: false
```

Questo significa che le route sono più tolleranti rispetto a slash finali e casing.

Esempi:

```txt
/api/v1/users/login
/api/v1/users/login/
```

vengono trattati in modo più permissivo rispetto a una configurazione stretta di default.

---

## Plugin registrati

Il server principale registra i seguenti plugin:

| Plugin | Scopo |
|---|---|
| `@fastify/swagger` | Generazione specifica OpenAPI |
| `@fastify/swagger-ui` | Pagina Swagger UI su `/docs` |
| `@fastify/cors` | Richieste cross-origin dal frontend |
| `@fastify/jwt` | Firma e verifica JWT |
| `@fastify/rate-limit` | Rate limiting per route |
| `@fastify/cookie` | Parsing e scrittura cookie |
| `fastify-metrics` | Endpoint metriche su `/metrics` |
| `@fastify/formbody` | Parsing form body |
| plugin custom `prismaPlugin` | Aggiunge `server.prisma` |
| `@fastify/websocket` | Supporto WebSocket |
| plugin custom `websocketPlugin` | Gestore connessioni realtime e route `/ws` |
| `@fastify/multipart` | Upload multipart con max file size 100 MB |
| `@fastify/static` | File statici da `src/public` |

---

## Struttura del progetto

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

Il backend usa una strategia modulare di registrazione delle route. Il plugin API root registra la versione `v1` e ogni dominio registra le proprie route.

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

## Albero di registrazione delle route

L'albero delle route viene costruito così:

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

Quindi, per esempio:

```txt
POST /api/v1/users/login
GET  /api/v1/projects/:id
POST /api/v1/tasks/addTask
```

---

## Modello di autenticazione

L'autenticazione si basa su un JWT memorizzato in un cookie HTTP-only chiamato:

```txt
session
```

Il payload JWT contiene:

```ts
{ userId: number }
```

Il token è firmato con Fastify JWT e dura 24 ore:

```ts
fastify.jwt.sign({ userId: user.id }, { expiresIn: '24h' })
```

Il cookie viene impostato tramite `setAuthCookie()` in:

```txt
src/helpers/cookies.ts
```

In sviluppo, il cookie è configurato come:

```ts
httpOnly: true
secure: false
sameSite: 'lax'
path: '/'
```

In produzione, il cookie passa a:

```ts
secure: true
sameSite: 'none'
```

Questa distinzione è importante perché i cookie `secure: true` non vengono salvati dal browser su semplice HTTP.

---

## Helper di autenticazione

### `setAuthCookie(reply, token)`

Imposta il cookie di sessione HTTP-only dopo login, registrazione o callback Google OAuth.

### `getUserIdFromJWT(req, res, fastify)`

Legge il cookie `session`, verifica il JWT e restituisce lo `userId` autenticato.

Se il token non è valido, può rispondere con:

```json
{ "error": "Invalid token" }
```

### `wsGetUserIdFromJWT(req, fastify)`

Versione specifica WebSocket dell'helper di estrazione JWT. Verifica il cookie durante l'handshake WebSocket e restituisce l'id utente autenticato oppure `null`.

---

## Flusso Google OAuth

Le route Google OAuth sono registrate con prefisso:

```txt
/auth
```

Le route disponibili sono:

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/auth/google` | Reindirizza il browser a Google OAuth |
| GET | `/auth/google/callback` | Riceve il codice di autorizzazione Google |

Il flusso OAuth funziona così:

1. Il frontend reindirizza il browser verso:

   ```txt
   http://localhost:5000/auth/google
   ```

2. Il backend costruisce la URL di autorizzazione Google con:

   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_REDIRECT_URI`
   - scope: `openid`, `email`, `profile`
   - response type: `code`

3. Google reindirizza verso:

   ```txt
   /auth/google/callback?code=...
   ```

4. Il backend scambia il codice con token tramite:

   ```txt
   https://oauth2.googleapis.com/token
   ```

5. Il backend valida l'ID token Google tramite:

   ```txt
   https://oauth2.googleapis.com/tokeninfo
   ```

6. Il backend recupera le informazioni profilo utente da:

   ```txt
   https://openidconnect.googleapis.com/v1/userinfo
   ```

7. L'utente viene creato o aggiornato tramite Prisma usando `upsert()`.

8. Viene creato un cookie di sessione JWT.

9. L'utente viene reindirizzato alla dashboard frontend:

   ```txt
   http://localhost:5173/dashboard
   ```

Variabili ambiente richieste:

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:5000/auth/google/callback"
```

Il valore di `GOOGLE_REDIRECT_URI` deve corrispondere esattamente alla redirect URI configurata in Google Cloud Console.

---

## Configurazione CORS

Il backend consente richieste dai principali origin frontend locali:

```txt
http://localhost:5173
http://127.0.0.1:5173
https://localhost:5173
https://127.0.0.1:5173
```

Consente anche origin backend/locali per tool di sviluppo e pagine debug statiche:

```txt
http://localhost:5000
http://127.0.0.1:5000
https://localhost:5000
https://127.0.0.1:5000
```

Le credenziali sono abilitate:

```ts
credentials: true
```

Questo è necessario perché l'autenticazione usa cookie. Quando il frontend chiama endpoint protetti, le richieste devono includere:

```ts
credentials: 'include'
```

Esempio:

```ts
await fetch('http://localhost:5000/api/v1/users/activeUser', {
  method: 'GET',
  credentials: 'include',
})
```

---

## Documentazione Swagger

Swagger UI è esposta su:

```txt
http://localhost:5000/docs
```

I metadati OpenAPI sono configurati in `server.ts`:

```ts
title: 'Transcendence'
description: 'Backend Fastify'
version: '1.0.0'
```

Ogni modulo di route usa file schema come:

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

Questi schema vengono usati per validazione richieste e documentazione Swagger.

---

## Metriche

Il backend espone un endpoint metriche su:

```txt
/metrics
```

Questo viene registrato tramite `fastify-metrics`.

---

## File statici e comportamento fallback

I file statici vengono serviti da:

```txt
src/public
```

Il server definisce anche un custom not-found handler.

Per route API sconosciute che iniziano con `/api`, il server restituisce:

```json
{ "error": "Not found" }
```

Per route non API, il server fa fallback a:

```txt
src/public/index.html
```

Questo permette di servire direttamente dal backend pagine statiche frontend/debug.

---

# Riferimento REST API

Tutti gli endpoint REST v1 sono montati sotto:

```txt
/api/v1
```

---

## Users API

Base path:

```txt
/api/v1/users
```

### Responsabilità principali

- registrare nuovi utenti
- login/logout
- recuperare profili utente
- recuperare l'utente autenticato attivo
- cercare utenti
- recuperare gli amici di un utente
- recuperare i progetti dell'utente
- recuperare elementi di calendario
- aggiornare informazioni profilo
- aggiornare password
- eliminare l'utente attivo
- recuperare avatar utente

### Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/users/` | Restituisce tutti gli utenti |
| POST | `/api/v1/users/addUser` | Crea un nuovo utente ed esegue il login |
| POST | `/api/v1/users/login` | Esegue il login con email e password |
| POST | `/api/v1/users/logout` | Cancella il cookie di sessione e segna l'utente offline |
| GET | `/api/v1/users/activeUser` | Restituisce il profilo dell'utente autenticato |
| GET | `/api/v1/users/:id/profile` | Restituisce un profilo pubblico/dettagliato per user id |
| GET | `/api/v1/users/:id/avatar` | Restituisce in streaming l'immagine avatar di un utente |
| GET | `/api/v1/users/search?username=...` | Cerca utenti per nome/cognome |
| GET | `/api/v1/users/:id/friends` | Restituisce gli amici di un utente |
| GET | `/api/v1/users/activeUsersProjects` | Restituisce i progetti dell'utente autenticato |
| GET | `/api/v1/users/calendarEntries` | Restituisce task ed eventi per il calendario |
| PUT | `/api/v1/users/modifyUserProfile` | Aggiorna i dati profilo dell'utente autenticato |
| PUT | `/api/v1/users/modifyUserPassword` | Aggiorna la password dell'utente autenticato |
| DELETE | `/api/v1/users/delete` | Elimina l'utente autenticato |

### Registrazione utente

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

Il backend esegue l'hash della password con `bcrypt-ts`, crea l'utente, lo segna come loggato, firma un JWT e imposta il cookie di sessione.

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

Risposta di successo:

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

La route di login ha un rate limit per-route:

```txt
5 requests every 15 minutes
```

### Logout

```http
POST /api/v1/users/logout
```

Il backend cancella il cookie `session` e aggiorna lo stato utente a `isLoggedIn: false`.

---

## Organizations API

Base path:

```txt
/api/v1/organizations
```

### Responsabilità principali

- creare organizzazioni
- elencare organizzazioni
- recuperare profilo/dettagli organizzazione
- cercare organizzazioni per nome
- recuperare membri
- invitare utenti
- accettare join request/inviti
- aggiornare informazioni organizzazione
- eliminare organizzazioni

### Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/organizations/` | Restituisce organizzazioni / overview data |
| GET | `/api/v1/organizations/:id/organization` | Restituisce i dettagli dell'organizzazione |
| GET | `/api/v1/organizations/search` | Cerca organizzazioni |
| GET | `/api/v1/organizations/:id/members` | Restituisce i membri dell'organizzazione |
| GET | `/api/v1/organizations/invitations/pending` | Restituisce gli inviti pending alle organizzazioni |
| POST | `/api/v1/organizations/addOrganization` | Crea una nuova organizzazione |
| POST | `/api/v1/organizations/:id/addMember` | Aggiunge direttamente un membro |
| POST | `/api/v1/organizations/:id/invitations` | Crea un invito / join request |
| POST | `/api/v1/organizations/:id/invitations/:requestId/accept` | Accetta un invito/richiesta |
| PUT | `/api/v1/organizations/modifyOrganizationInfos` | Aggiorna i dati dell'organizzazione |
| DELETE | `/api/v1/organizations/delete/:id` | Elimina un'organizzazione |

La creazione di un'organizzazione usa una transaction per creare sia l'organizzazione sia la membership iniziale del proprietario.

Le notifiche realtime vengono inviate tramite WebSocket quando gli inviti vengono creati o accettati.

---

## Projects API

Base path:

```txt
/api/v1/projects
```

### Responsabilità principali

- creare progetti dentro le organizzazioni
- recuperare tutti i progetti
- recuperare un progetto per id
- recuperare informazioni room per un progetto
- cercare progetti
- eliminare progetti

### Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/projects/` | Restituisce i progetti |
| GET | `/api/v1/projects/:id` | Restituisce un progetto per id |
| GET | `/api/v1/projects/room/:id` | Restituisce metadata room/chat per un progetto |
| GET | `/api/v1/projects/search` | Cerca progetti |
| POST | `/api/v1/projects/addProject` | Crea un progetto |
| DELETE | `/api/v1/projects/delete/:id` | Elimina un progetto |

La creazione del progetto valida l'organizzazione padre e crea il progetto dentro una Prisma transaction. Il creatore viene aggiunto come project participant, di solito con ruolo OWNER.

---

## Tasks API

Base path:

```txt
/api/v1/tasks
```

### Responsabilità principali

- creare task di progetto
- recuperare task per progetto
- recuperare task per l'utente autenticato
- aggiornare task
- eliminare task

### Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/tasks/projTasks/:id` | Restituisce i task di un progetto |
| GET | `/api/v1/tasks/activeUserTasks` | Restituisce i task assegnati/collegati all'utente attivo |
| POST | `/api/v1/tasks/addTask` | Crea un task |
| PUT | `/api/v1/tasks/:id` | Aggiorna un task |
| DELETE | `/api/v1/tasks/:id/remove` | Elimina un task |

### Crea task

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

La creazione del task verifica che l'utente autenticato sia partecipante del progetto target e abbia permessi sufficienti. Solo utenti con ruolo `OWNER` o `EDITOR` possono creare task.

Quando un task viene creato, il backend crea anche una entry `taskParticipant` che collega il creatore al task.

---

## Events API

Base path:

```txt
/api/v1/events
```

### Responsabilità principali

- creare eventi calendario
- recuperare eventi dell'utente attivo
- aggiornare eventi
- eliminare eventi

### Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/events/activeUserEvents` | Restituisce gli eventi per l'utente autenticato |
| POST | `/api/v1/events/create` | Crea un evento |
| PUT | `/api/v1/events/:id` | Aggiorna un evento |
| DELETE | `/api/v1/events/:id` | Elimina un evento |

Gli eventi vengono usati insieme ai task per popolare il calendario frontend.

---

## Messages API

Base path:

```txt
/api/v1/messages
```

### Responsabilità principali

- recuperare cronologia chat di stanza
- recuperare cronologia conversazioni private

### Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/messages/roomHistory` | Restituisce i messaggi di una chat room |
| GET | `/api/v1/messages/pvtHistory` | Restituisce la cronologia di una conversazione privata |

I messaggi vengono creati principalmente tramite il layer WebSocket e recuperati in seguito tramite endpoint REST.

---

## Files API

Base path:

```txt
/api/v1/files
```

### Responsabilità principali

- upload file organizzazione
- upload file progetto
- upload file utente/progetto
- upload avatar utente
- listare file
- stream/download file
- preview file
- eliminare file

L'upload multipart è abilitato globalmente con dimensione massima file di:

```txt
100 MB
```

### Endpoint upload

| Metodo | Endpoint | Descrizione |
|---|---|---|
| POST | `/api/v1/files/` | Carica un file generico di organizzazione/progetto |
| POST | `/api/v1/files/user` | Carica un file collegato a un utente |
| POST | `/api/v1/files/project` | Carica un file collegato a un progetto |
| POST | `/api/v1/files/avatar` | Carica l'avatar dell'utente autenticato |

### Endpoint list/read

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/files/:organizationId/:projectId` | Elenca i file di progetto |
| GET | `/api/v1/files/:organizationId/:projectId/user` | Elenca i file utente per un progetto |
| GET | `/api/v1/files/files/:organizationId/:filename` | Esegue lo streaming di un file organizzazione |
| GET | `/api/v1/files/files/:organizationId/:projectId/:filename` | Esegue lo streaming di un file progetto |
| GET | `/api/v1/files/files/preview/:organizationId/:projectId/:filename` | Mostra l'anteprima di un file progetto |
| GET | `/api/v1/files/files/:organizationId/:projectId/user/:uploaderId/:filename` | Esegue lo streaming di un file progetto caricato da un utente |
| GET | `/api/v1/files/files/preview/:organizationId/:projectId/user/:uploaderId/:filename` | Mostra l'anteprima di un file progetto caricato da un utente |

### Endpoint delete

| Metodo | Endpoint | Descrizione |
|---|---|---|
| DELETE | `/api/v1/files/:organizationId/:filename` | Elimina un file organizzazione |
| DELETE | `/api/v1/files/:organizationId/:projectId/:filename` | Elimina un file progetto |
| DELETE | `/api/v1/files/:organizationId/:projectId/user/:filename` | Elimina un file utente di progetto |

Le route file validano esistenza organizzazione/progetto e permessi utente prima di consentire upload o eliminazioni.

---

## Friends API

Base path:

```txt
/api/v1/friends
```

### Responsabilità principali

- elencare amicizie per stato
- elencare richieste amicizia pending
- creare richieste amicizia
- accettare/rifiutare richieste
- bloccare/sbloccare utenti
- inviare notifiche realtime

### Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/friends/:status` | Restituisce amicizie filtrate per stato |
| GET | `/api/v1/friends/requests/pending` | Restituisce richieste amicizia pending |
| POST | `/api/v1/friends/requests` | Crea una richiesta amicizia |
| POST | `/api/v1/friends/requests/:requestId/accept` | Accetta una richiesta amicizia |
| POST | `/api/v1/friends/requests/:requestId/reject` | Rifiuta una richiesta amicizia |
| POST | `/api/v1/friends/block` | Blocca un utente |
| POST | `/api/v1/friends/unblock` | Sblocca un utente |

Le azioni friendship inviano notifiche WebSocket agli utenti coinvolti quando sono online.

---

## Groups API

Base path:

```txt
/api/v1/groups
```

### Responsabilità principali

- creare gruppi
- recuperare dettagli gruppo
- recuperare gruppi joined
- recuperare inviti gruppo pending
- aggiungere partecipanti
- invitare utenti
- accettare inviti
- aggiornare informazioni gruppo
- lasciare gruppi
- notificare room di gruppo in realtime

### Endpoint

| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | `/api/v1/groups/:id` | Restituisce i dettagli del gruppo |
| GET | `/api/v1/groups/pending` | Restituisce gli inviti gruppo pending |
| GET | `/api/v1/groups/joined` | Restituisce i gruppi joined dall'utente autenticato |
| POST | `/api/v1/groups/addGroup` | Crea un gruppo |
| POST | `/api/v1/groups/addPartecipant` | Aggiunge un partecipante a un gruppo |
| POST | `/api/v1/groups/:groupId/invitations` | Crea un invito di gruppo |
| POST | `/api/v1/groups/:groupId/invitations/:requestId/accept` | Accetta un invito di gruppo |
| PUT | `/api/v1/groups/:id` | Aggiorna i dati del gruppo |
| DELETE | `/api/v1/groups/:id/leave` | Lascia un gruppo |

I gruppi hanno anche room realtime usando room id in questo formato:

```txt
group:<groupId>
```

---

## Debug API

Base path:

```txt
/api/v1/debug
```

Le route debug sono helper solo per sviluppo.

| Metodo | Endpoint | Descrizione |
|---|---|---|
| POST | `/api/v1/debug/seed` | Inserisce dati di test |
| POST | `/api/v1/debug/forceAddFriend/:friendId` | Forza una relazione di amicizia |
| GET | `/api/v1/debug/loginFabio` | Helper login development |
| GET | `/api/v1/debug/loginOsme` | Helper login development |

Queste route non dovrebbero essere abilitate in produzione senza protezione.

---

# WebSocket API

L'endpoint WebSocket è:

```txt
/ws
```

Example frontend connection:

```ts
const ws = new WebSocket('ws://localhost:5000/ws')
```

Quando HTTPS è abilitato, l'URL WebSocket deve usare `wss://`:

```ts
const ws = new WebSocket('wss://localhost:5000/ws')
```

L'handshake WebSocket usa lo stesso cookie `session` usato dalla REST API. Se il cookie è mancante o invalido, il socket viene chiuso con:

```txt
1008 - No valid token.
```

---

## Connection manager WebSocket

Il backend tiene traccia dei socket attivi con:

```ts
type WsClientSet = Set<WebSocket>
type WsClientsByUserId = Map<number, WsClientSet>
type WsRoomMap = Map<string, WsClientSet>
```

Un utente può avere più socket contemporaneamente. Questo supporta più tab browser o più dispositivi.

Il server decora l'istanza Fastify con helper realtime:

| Helper | Descrizione |
|---|---|
| `wsSendToUser(userId, data)` | Invia un payload a ogni socket di uno specifico utente |
| `wsBroadcast(data)` | Invia un payload a tutti i socket connessi |
| `wsBroadcastExcept(except, data)` | Fa broadcast a tutti tranne un socket |
| `wsRoomBroadcast(roomId, data, except?)` | Invia un payload a tutti i socket dentro una room |
| `wsDisconnectUser(userId, code?, reason?)` | Chiude tutti i socket di un utente |

---

## Ciclo di vita WebSocket

Quando un socket si connette:

1. Il backend valida il cookie JWT.
2. Il socket viene aggiunto a `wsClientsByUserId`.
3. Il socket entra automaticamente nelle project room dei progetti in cui l'utente è partecipante.
4. Il socket entra automaticamente nelle group room dei gruppi in cui l'utente è partecipante.
5. Il backend fa broadcast della presenza utente.
6. Il client riceve:

```json
{
  "type": "ws:connected",
  "userId": 1
}
```

Quando un socket si chiude:

1. Il socket viene rimosso dal set di socket dell'utente.
2. Se l'utente non ha più socket rimanenti, viene rimosso da `wsClientsByUserId`.
3. La presenza viene broadcastata come disconnessa.
4. `isLoggedIn` viene aggiornato a `false`.
5. Il socket viene rimosso da tutte le room.

---

## Messaggi WebSocket supportati

### Ping

Richiesta:

```txt
ping
```

Risposta:

```json
{ "type": "pong" }
```

---

### Broadcast

Richiesta:

```json
{
  "type": "broadcast",
  "payload": {
    "message": "Hello everyone"
  }
}
```

Risposta broadcastata:

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

### Messaggio privato

Richiesta:

```json
{
  "type": "private",
  "toUserId": 2,
  "payload": {
    "message": "Hello"
  }
}
```

Risposta all'utente target:

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

### Messaggio chat diretta

Richiesta:

```json
{
  "type": "chat:send",
  "toUserId": 2,
  "text": "Hello from direct chat"
}
```

Il backend:

1. controlla che l'utente target esista
2. normalizza la coppia di utenti per evitare conversazioni duplicate
3. esegue upsert di `directConversation`
4. salva `directMessage`
5. invia un evento realtime `chat:message` all'utente target

Risposta all'utente target:

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

Richiesta:

```json
{
  "type": "room:join",
  "roomId": "proj:1:3"
}
```

Formati room id supportati:

```txt
org:<orgId>
proj:<orgId>:<projectId>
group:<groupId>
```

Il backend controlla:

- se il room id è valido
- se la room esiste
- se l'utente autenticato può accedere alla room

Risposta di successo:

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

Richiesta:

```json
{
  "type": "room:leave",
  "roomId": "proj:1:3"
}
```

Il backend rimuove il socket dalla room specificata.

---

### Room message

Richiesta:

```json
{
  "type": "room:message",
  "roomId": "proj:1:3",
  "payload": {
    "text": "Message inside project room"
  }
}
```

Il backend:

1. verifica che il socket sia attualmente dentro la room
2. esegue upsert di `chatRoom` in base alla chiave room
3. salva un `roomMessage`
4. fa broadcast del messaggio agli altri socket della room

Risposta broadcastata:

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

### Notifica a un solo utente

Richiesta:

```json
{
  "type": "notify",
  "toUserId": 2,
  "notification": "You have a new invitation"
}
```

Risposta all'utente target:

```json
{
  "type": "notify",
  "notification": "You have a new invitation",
  "ts": 1710000000000
}
```

---

### Notifica a tutti gli utenti

Richiesta:

```json
{
  "type": "notifyAll",
  "notification": "System message"
}
```

Risposta broadcastata:

```json
{
  "type": "notify",
  "notification": "System message",
  "ts": 1710000000000
}
```

---

# Autorizzazione e permessi

Il backend segue comunemente questo pattern:

1. Estrae l'utente attivo dal cookie JWT.
2. Valida che la risorsa target esista.
3. Valida che l'utente sia membro/partecipante della risorsa.
4. Valida i permessi basati sui ruoli dove necessario.
5. Esegue l'operazione.

Esempi:

- creare un task richiede membership del progetto e ruolo `OWNER` o `EDITOR`
- accedere a una project room richiede partecipazione al progetto
- accedere a una organization room richiede membership dell'organizzazione
- accedere a una group room richiede partecipazione al gruppo
- le route upload/delete file validano esistenza organizzazione/progetto e permessi

L'accesso alle room è centralizzato in:

```txt
src/helpers/auth.ts
```

Helper importanti:

```ts
parseRoomKey(key)
canAccessRoom(userId, roomKey, fastify)
roomExist(roomKey, fastify)
isMember(userId, orgId, fastify)
isParticipant(userId, projectId, fastify)
isGroupParticipant(userId, groupId, fastify)
```

---

# Integrazione Prisma

Prisma è integrato tramite:

```txt
src/plugins/prismaPlugin.ts
```

Il plugin:

1. crea un nuovo `PrismaClient`
2. si connette al database
3. decora Fastify con `server.prisma`
4. disconnette Prisma quando il server Fastify si chiude

Questo consente a ogni route di accedere al database con:

```ts
fastify.prisma.user.findUnique(...)
fastify.prisma.project.findMany(...)
fastify.prisma.$transaction(...)
```

Le transaction vengono usate per operazioni che devono restare atomiche, come:

- creare un'organizzazione e la membership del proprietario
- creare un progetto e la relazione partecipante
- creare un task e la relazione partecipante
- accettare inviti
- eliminare risorse complesse

---

# Convenzioni di error handling

Il backend restituisce in generale errori JSON in questo formato:

```json
{ "error": "Message" }
```

Status code comuni:

| Status | Significato |
|---|---|
| `400` | Input non valido o richiesta malformata |
| `401` | Autenticazione mancante o invalida |
| `403` | Autenticato ma non autorizzato |
| `404` | Risorsa non trovata |
| `409` | Vincolo duplicato o conflitto |
| `500` | Errore interno server |

Esempi:

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

# Note di sviluppo

## Esecuzione del backend

Un flusso di sviluppo tipico è:

```bash
npm install
npm run dev
```

oppure, a seconda degli script package:

```bash
npm run build
npm start
```

Il server dovrebbe quindi essere disponibile su:

```txt
http://localhost:5000
```

## Origine frontend

Il frontend è previsto sulla porta di sviluppo predefinita di Vite:

```txt
http://localhost:5173
```

Poiché frontend e backend sono su porte diverse, ogni richiesta frontend autenticata deve includere:

```ts
credentials: 'include'
```

## HTTP vs HTTPS

Se `process.env.HTTPS` è impostata, il backend parte in modalità HTTPS.

In quel caso:

- la REST API base URL diventa `https://localhost:5000`
- la WebSocket URL diventa `wss://localhost:5000/ws`
- i cookie possono usare `secure: true`

Se HTTPS non è abilitato:

- la REST API base URL è `http://localhost:5000`
- la WebSocket URL è `ws://localhost:5000/ws`
- i cookie devono usare `secure: false`

---

# Esempi frontend utili

## Richiesta login

```ts
const res = await fetch('http://localhost:5000/api/v1/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
})
```

## Recupero utente attivo

```ts
const res = await fetch('http://localhost:5000/api/v1/users/activeUser', {
  method: 'GET',
  credentials: 'include',
})
```

## Connessione WebSocket

```ts
const ws = new WebSocket('ws://localhost:5000/ws')

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  console.log(msg)
}
```

## Invio messaggio chat diretta

```ts
ws.send(JSON.stringify({
  type: 'chat:send',
  toUserId: 2,
  text: 'Hello!'
}))
```

## Join di una project room

```ts
ws.send(JSON.stringify({
  type: 'room:join',
  roomId: 'proj:1:3'
}))
```

## Invio di un room message

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

# Considerazioni di sicurezza

Meccanismi di sicurezza attuali:

- sessione JWT memorizzata in cookie HTTP-only
- hashing password con bcrypt
- rate limiting sulla route di login
- CORS configurato con origin espliciti consentiti
- autenticazione WebSocket tramite cookie JWT
- authorization check per room e operazioni progetto/task
- risoluzione sicura dei path file per il serving avatar
- limiti upload multipart

Miglioramenti consigliati prima della produzione:

- spostare il secret JWT in una variabile ambiente
- proteggere o rimuovere le debug route
- rivedere gli origin CORS ed evitare origin di sviluppo non necessari
- garantire che HTTPS sia sempre abilitato in produzione
- validare MIME type ed estensioni dei file caricati dove necessario
- fare scan dei file caricati se sono consentiti download pubblici
- evitare di memorizzare refresh token Google salvo stretta necessità
- assicurarsi che `GOOGLE_REDIRECT_URI` corrisponda esattamente alla callback URL di produzione
- assicurarsi che tutte le route distruttive verifichino ownership/ruoli

---

# Note implementative note

- Il backend usa sia REST sia WebSocket API: REST per recupero risorse e dati storici, WebSocket per delivery realtime.
- Alcuni messaggi chat vengono persistiti dal layer WebSocket e recuperati successivamente tramite endpoint REST.
- Gli utenti possono avere più connessioni WebSocket attive contemporaneamente.
- Le project room e group room vengono joinate automaticamente quando un utente si connette via WebSocket.
- Il backend include attualmente varie pagine HTML statiche di debug sotto `src/public`.
- Le debug route vanno considerate solo per sviluppo.

---

# Riepilogo

Il backend di Transcendence è il layer API centrale per una web application collaborativa in stile Jira. Combina route REST Fastify, accesso database Prisma, autenticazione JWT tramite cookie, Google OAuth, upload multipart e comunicazione realtime WebSocket.

La sua struttura modulare rende ogni dominio indipendente e facilmente estendibile:

- `users` gestisce identità e dati profilo
- `organizations` gestisce workspace e membership
- `projects` gestisce contenitori di progetto
- `tasks` gestisce work item di progetto
- `events` supporta gli elementi calendario
- `files` gestisce upload e preview
- `friends` e `groups` supportano il layer social/collaborativo
- `messages` recupera la cronologia chat
- `websocketPlugin` alimenta la comunicazione realtime

Questo backend è progettato per supportare un workflow collaborativo completo: gli utenti fanno login, si uniscono alle organizzazioni, creano progetti, gestiscono task, caricano file, comunicano in realtime e tracciano il loro lavoro da una dashboard frontend centralizzata.

---

# Addendum Monitoring, Prometheus e Grafana

Questa sezione integra il README backend esistente senza sostituire alcuna delle informazioni precedenti. Documenta lo stack di monitoring e osservabilità aggiunto sopra il backend Fastify + Prisma esistente.

## Ambito monitoraggio DevOps

Il backend ora fa parte di uno stack di monitoring basato su:

- **Prometheus** per raccolta metriche e scraping
- **Grafana** per dashboard e visualizzazione
- endpoint operativi backend per controlli di stato del servizio
- alert rules per scenari critici e warning

Questo layer di monitoring completa l'endpoint metriche già esposto da `fastify-metrics`.

---

## Endpoint operativi

Oltre a `/metrics`, il backend ora espone endpoint operativi pensati per health checking e readiness verification:

```txt
/health
/ready
/status
```

### `/health`
Usato come endpoint di liveness.

Scopo:
- verificare che il processo backend sia vivo
- verificare che Fastify stia rispondendo

Significato tipico della risposta:
- `200 OK` significa che il processo backend è in esecuzione

### `/ready`
Usato come endpoint di readiness.

Scopo:
- verificare che il backend sia realmente pronto a servire traffico
- verificare che Prisma possa accedere a una tabella reale dell'applicazione
- verificare che il layer database sia utilizzabile, non solo che il processo sia vivo

Significato tipico della risposta:
- `200 OK` significa che il backend può accedere correttamente al database
- `503` significa che il servizio è vivo ma non pronto a servire traffico normale

### `/status`
Usato come endpoint di riepilogo operativo compatto.

Scopo:
- esporre lo stato runtime in un semplice formato JSON
- fornire un piccolo snapshot di stato per operatori e dashboard di monitoring
- riassumere environment, uptime e stato database

---

## Metriche e osservabilità

Il backend espone già metriche Prometheus su:

```txt
/metrics
```

Queste metriche includono:

- metriche di processo Node.js
- uso di memoria e CPU
- heap usage
- event loop lag
- metriche di garbage collection
- metriche richieste HTTP
- istogrammi e summary di durata richiesta

In particolare, le metriche raccolte dal backend includono il monitoraggio richieste per:

```txt
/health
/ready
/status
```

Questo rende possibile monitorare sia la performance generica del backend sia gli specifici endpoint operativi introdotti per il modulo DevOps.

---

## Architettura dello stack di monitoring

Il setup monitoring usa servizi Docker Compose per:

- backend
- frontend / nginx
- Prometheus
- Grafana

### Responsabilità di Prometheus

Prometheus è responsabile di:

- fare scrape di `backend:5000/metrics`
- valutare le alert rules
- memorizzare metriche time-series per la visualizzazione successiva nelle dashboard

### Responsabilità di Grafana

Grafana è responsabile di:

- collegarsi a Prometheus come datasource
- caricare la dashboard FT_TRANSCENDENCE preconfigurata
- mostrare pannelli operativi e runtime del backend
- fornire un'interfaccia visuale per ispezione durante sviluppo ed evaluation

---

## Configurazione Prometheus

Prometheus è configurato per fare scrape dell'endpoint metriche backend tramite un target della rete Docker interna simile a:

```txt
backend:5000
```

La scrape configuration include:

- self-monitoring di Prometheus
- scraping metriche backend
- caricamento di custom alert rules

I file di configurazione sono memorizzati nella cartella monitoring del progetto, tipicamente sotto:

```txt
monitoring/prometheus/prometheus.yml
monitoring/prometheus/alerts.yml
```

---

## Alerting rules

Lo stack monitoring include alert rules per problemi operativi del backend.

Esempi di alert configurati per il progetto includono:

- backend down / scrape target non disponibile
- elevato uso memoria backend
- event loop lag elevato

Queste regole permettono al sistema di monitoring di andare oltre dashboard passive e rilevare attivamente condizioni di runtime degradate.

---

## Provisioning Grafana

Grafana è configurata con provisioning automatico, in modo che datasource e dashboard vengano caricati senza setup manuale.

File di provisioning tipici:

```txt
monitoring/grafana/provisioning/datasources/datasource.yml
monitoring/grafana/provisioning/dashboards/dashboard.yml
monitoring/grafana/dashboards/ft_transcendence_backend_monitoring.json
```

Questo significa che, una volta avviato lo stack monitoring tramite Docker Compose, Grafana:

1. crea il datasource Prometheus
2. carica la dashboard FT_TRANSCENDENCE
3. rende la dashboard disponibile senza import manuale

---

## Contenuto dashboard

La dashboard custom Grafana si concentra sull'osservabilità del backend e include pannelli come:

- stato backend up/down
- richieste al secondo
- latenza richiesta P95
- uso memoria
- request rate per route
- latenza per route
- event loop lag
- heap usage
- garbage collection rate
- rate e latenza degli endpoint operativi `/health`, `/ready` e `/status`

Questa dashboard è stata progettata specificamente attorno ai nomi metrica esposti dal backend del progetto, invece di affidarsi solo a una dashboard generica prebuilt per Node.js.

---

## Sicurezza dell'interfaccia di monitoring

Lo stack di monitoring include anche protezione di accesso per Grafana.

Le misure di sicurezza previste includono:

- accesso non anonimo
- credenziali admin esplicite configurate tramite variabili ambiente
- binding solo locale per l'accesso development, quando appropriato

Questo è stato aggiunto per allineare il setup monitoring al requisito del subject che richiede accesso sicuro a Grafana.

---

## Esecuzione dello stack di monitoring

Quando si usa il path di deployment Docker Compose, i servizi monitoring vengono avviati insieme allo stack applicativo.

Un comando tipico è:

```bash
docker compose up --build
```

A seconda del setup locale, i seguenti endpoint diventano disponibili:

```txt
Frontend:   https://localhost:8443
Prometheus: http://localhost:9090
Grafana:    http://localhost:3000
```

Prometheus può essere usato per verificare i target tramite la sua UI, mentre Grafana fornisce la vista operativa basata su dashboard.

---

## Flusso di verifica operativa

Una semplice procedura di verifica per lo stack monitoring è:

1. avviare l'intero stack Docker Compose
2. aprire Prometheus e verificare che il target `backend` sia `UP`
3. aprire Grafana e verificare che la dashboard FT_TRANSCENDENCE sia caricata
4. generare traffico verso `/health`, `/ready` e `/status`
5. verificare che i grafici si aggiornino in Grafana
6. opzionalmente simulare una condizione backend degradata e osservare il comportamento degli alert

Questo rende il modulo facile da dimostrare durante l'evaluation.

---

## Ownership backend per il modulo monitoring

Owner principale implementazione:
- **Fabio Zucconi (`fzucconi`)**

Supporto / validazione backend:
- **Giulia Vigano (`gvigano`)**
