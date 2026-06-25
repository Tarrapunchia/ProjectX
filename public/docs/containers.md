# Container Setup

This project can be run with Docker and Docker Compose by separating:

* **backend**: Node/Fastify/Prisma
* **frontend**: React/Vite built and served by **nginx**
* **external HTTPS** on the frontend/nginx side
* **internal HTTP** between nginx and the backend

The intended flow is:

* the browser connects to `https://localhost:8443`
* nginx serves the frontend static files
* nginx forwards `/api`, `/auth`, and `/ws` to the backend
* the backend runs internally on the Docker network, without TLS
* SQLite, uploads, and avatars are persisted through bind mounts

---

## Relevant Structure

```text
.
├── docker-compose.yml
├── backend
│   ├── Dockerfile
│   ├── deploy.sh
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── migrations
│   ├── avatar
│   └── uploads
└── frontend
    ├── Dockerfile
    ├── default.conf
    ├── entrypoint.sh
    ├── package.json
    ├── package-lock.json
    └── src
```

---

## Requirements

You need:

* Docker
* Docker Compose plugin
* lockfiles present in both `backend/` and `frontend/`

If a lockfile is missing, `npm ci` will fail.

To generate them:

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Startup

From the project root:

```bash
docker compose up --build
```

The frontend will be available at:

```text
https://localhost:8443
```

Your browser will probably show a warning because of the self-signed certificate. That is expected.

---

## Architecture

### Backend

The backend is built from `./backend`.

It:

* uses Prisma
* uses SQLite
* exposes port `5000` internally
* is not published directly to the host
* only receives traffic from nginx

### Frontend

The frontend is built from `./frontend`.

It:

* builds the React/Vite application in a Node stage
* copies the final static files into nginx
* exposes `443` inside the container
* maps `8443:443` on the host

### HTTPS

HTTPS is terminated by nginx.

This satisfies the requirement:

> Any connection to the backend, from a browser, from a script, from an external API, etc., must use HTTPS. Connections inside the backend itself can be without encryption.

In practice:

* **external → nginx**: HTTPS
* **nginx → backend**: internal HTTP over Docker

---

## Important Files

### `docker-compose.yml`

Defines the two services:

* `backend`
* `frontend`

The backend uses volumes to persist:

* `prisma/`
* `uploads/`
* `avatar/`

### `backend/Dockerfile`

Multi-stage backend build:

* installs dependencies
* generates the Prisma client
* builds the TypeScript source
* produces a cleaner runtime image

### `backend/deploy.sh`

Backend startup script.

Typically it:

* prepares runtime directories
* applies the Prisma schema or migrations
* starts `node dist/server.js`

### `frontend/Dockerfile`

Multi-stage frontend build:

* installs frontend dependencies
* runs `npm run build`
* copies `dist/` into nginx

### `frontend/default.conf`

nginx configuration used to:

* serve the SPA
* proxy backend routes:

  * `/api`
  * `/auth`
  * `/ws`

### `frontend/entrypoint.sh`

nginx startup script, also useful if you want to generate or prepare self-signed certificates automatically.

---

## Volumes

The backend service mounts:

* `./backend/prisma:/app/prisma`
* `./backend/uploads:/app/uploads`
* `./backend/avatar:/app/avatar`

This allows you to:

* persist the SQLite database outside the container
* keep uploads and avatars even if containers are recreated

---

## Prisma Notes

### Recommended mode

If you already have versioned migrations in:

```text
backend/prisma/migrations
```

you can use a migration-based workflow with:

```bash
npx prisma migrate deploy
```

### Pragmatic mode

If you only want to align the database schema during development:

```bash
npx prisma db push
```

This is easier while containerizing the project, but less strict than `migrate deploy`.

---

## HTTPS Certificates

For development, nginx can use self-signed certificates.

You can either:

* generate them ahead of time on the host
* or generate them when the nginx container starts using `openssl`

### Limitation of self-signed certificates

Browsers will not trust them automatically, so you will get a warning.

That does not prevent you from having real HTTPS technically enabled.

---

## Common Problems

### 1. `npm ci` fails

Typical message:

```text
The npm ci command can only install with an existing package-lock.json
```

Cause:

* `package-lock.json` is missing

Fix:

* run `npm install` in the affected directory
* make sure the lockfile is not excluded by `.dockerignore`

---

### 2. Prisma migrations are missing

Typical message:

```text
prisma/migrations not found or empty
```

Cause:

* migrations do not exist
* or they are excluded by `.dockerignore`

Fix:

* make sure `backend/prisma/migrations` exists
* do not exclude `prisma/` from the Docker build context

---

### 3. `tsconfig.json` not found in the frontend

Typical message:

```text
Cannot read file '/app/tsconfig.json'
```

Cause:

* the file is excluded from the build context
* the Docker `context` does not match the Dockerfile assumptions

Fix:

* use `context: ./frontend`
* do not exclude `tsconfig*.json` in `.dockerignore`

---

### 4. `Cannot find module './ChatMenu'`

Common cause:

* mismatch between import casing and actual file name

Linux filesystems are case-sensitive, so Docker often exposes these problems.

Fix:

* make sure the file name matches the import exactly

---

### 5. `pino-pretty` not found in runtime

Cause:

* `pino-pretty` is a development dependency, but runtime logger configuration still uses it

Fix:

* only enable it in development
* use the standard logger in production

---

## Useful Commands

Start and rebuild:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Rebuild without cache:

```bash
docker compose build --no-cache
```

Clean builder cache:

```bash
docker builder prune -f
```

Open a shell in the backend container:

```bash
docker compose exec backend sh
```

Open a shell in the frontend container:

```bash
docker compose exec frontend sh
```

---

## Practical Suggestions

* keep Docker build contexts narrow (`./backend`, `./frontend`)
* do not exclude required files through `.dockerignore`
* use `npm ci` only when lockfiles are present
* terminate HTTPS at nginx
* avoid enabling HTTPS inside the backend unless you really need it
* persist SQLite and uploads through volumes

---

## Recommended Project State

For a stable setup:

* `backend/package-lock.json` exists
* `frontend/package-lock.json` exists
* `backend/prisma/migrations/` exists and is versioned
* the frontend does not use hardcoded `localhost:5000` URLs
* nginx is the single public entry point

---

## Suggested Development Flow

1. fix backend and frontend locally
2. generate missing lockfiles
3. make sure Prisma migrations exist
4. run `docker compose up --build`
5. open `https://localhost:8443`
6. accept the self-signed certificate warning if needed

---

## Final Goal

With this setup:

* the frontend is served over HTTPS
* the backend is only reachable externally through HTTPS
* internal communication between containers remains simple
* the project is closer to a real deployment model and easier to maintain
