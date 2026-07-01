# Container Setup

This project runs through Docker and Docker Compose with a multi-service architecture based on:

* **backend**: Node.js / Fastify / Prisma / SQLite
* **frontend**: React / Vite built and served by **nginx**
* **prometheus**: metrics collection and alert evaluation
* **grafana**: monitoring dashboards and observability UI

The runtime model is:

* the browser connects to `https://localhost:8443`
* nginx serves the frontend static files
* nginx forwards backend-facing routes such as `/api`, `/auth`, `/ws`, and operational routes to the backend
* the backend runs internally on the Docker network, without external TLS
* Prometheus scrapes backend metrics from the internal network
* Grafana connects to Prometheus and loads provisioned dashboards automatically
* SQLite, uploads, avatars, and backups are persisted through bind mounts

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
│   ├── uploads
│   ├── backups
│   └── scripts
│       ├── backup_db.sh
│       └── restore_db.sh
├── frontend
│   ├── Dockerfile
│   ├── default.conf
│   ├── entrypoint.sh
│   ├── package.json
│   ├── package-lock.json
│   └── src
└── monitoring
    ├── prometheus
    │   ├── prometheus.yml
    │   └── alerts.yml
    └── grafana
        ├── dashboards
        │   └── ft_transcendence_backend_monitoring.json
        └── provisioning
            ├── dashboards
            │   └── dashboard.yml
            └── datasources
                └── datasource.yml
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

The main application will be available at:

```text
https://localhost:8443
```

The browser may show a warning because of the self-signed certificate. That is expected in local development.

Monitoring interfaces are typically available at:

```text
Prometheus: http://localhost:9090
Grafana:    http://localhost:3000
```

Grafana access is protected through explicit credentials configured in Docker Compose.

---

## Architecture

### Backend

The backend is built from `./backend`.

It:

* uses Prisma
* uses SQLite
* exposes port `5000` internally
* is not meant to be the main public browser entry point
* receives application traffic from nginx
* exposes `/metrics` for Prometheus scraping
* exposes `/health`, `/ready`, and `/status` for operational checks

### Frontend

The frontend is built from `./frontend`.

It:

* builds the React/Vite application in a Node stage
* copies the final static files into nginx
* exposes `443` inside the container
* maps `8443:443` on the host
* acts as the HTTPS entry point for browser access

### Prometheus

Prometheus is used to:

* scrape backend metrics
* evaluate alert rules
* store time-series monitoring data

It reads configuration from:

```text
monitoring/prometheus/prometheus.yml
monitoring/prometheus/alerts.yml
```

### Grafana

Grafana is used to:

* connect to Prometheus as datasource
* automatically provision dashboards
* display backend runtime and operational metrics

It reads provisioning files from:

```text
monitoring/grafana/provisioning/
monitoring/grafana/dashboards/
```

### HTTPS

HTTPS is terminated by nginx.

This satisfies the project requirement that external access to the backend must use HTTPS, while internal communication between containers can remain unencrypted.

In practice:

* **external → nginx**: HTTPS
* **nginx → backend**: internal HTTP over Docker
* **prometheus → backend**: internal HTTP over Docker
* **grafana → prometheus**: internal HTTP over Docker

---

## Important Files

### `docker-compose.yml`

Defines the full container stack:

* `backend`
* `frontend`
* `prometheus`
* `grafana`

The backend uses volumes to persist:

* `prisma/`
* `uploads/`
* `avatar/`
* `backups/`

### `backend/Dockerfile`

Multi-stage backend build:

* installs dependencies
* generates the Prisma client
* builds the TypeScript source
* produces a runtime image ready for container execution

### `backend/deploy.sh`

Backend startup script.

Typically it:

* prepares runtime directories
* applies the Prisma schema or migrations
* starts `node dist/server.js`

### `backend/scripts/backup_db.sh`

Creates timestamped SQLite backups in `backend/backups/`.

### `backend/scripts/restore_db.sh`

Restores a selected backup into the active SQLite database file.

### `frontend/Dockerfile`

Multi-stage frontend build:

* installs frontend dependencies
* runs `npm run build`
* copies `dist/` into nginx

### `frontend/default.conf`

nginx configuration used to:

* serve the SPA
* proxy backend routes such as:

  * `/api`
  * `/auth`
  * `/ws`
  * operational endpoints if configured (`/health`, `/ready`, `/status`)
  * additional backend-facing pages such as docs or status pages if configured

### `frontend/entrypoint.sh`

nginx startup script, also used to prepare or generate self-signed certificates in local development.

### `monitoring/prometheus/prometheus.yml`

Prometheus scrape configuration.

### `monitoring/prometheus/alerts.yml`

Prometheus alert rules for backend monitoring.

### `monitoring/grafana/provisioning/datasources/datasource.yml`

Automatically provisions Prometheus as Grafana datasource.

### `monitoring/grafana/provisioning/dashboards/dashboard.yml`

Automatically provisions dashboard loading.

### `monitoring/grafana/dashboards/ft_transcendence_backend_monitoring.json`

Custom FT_TRANSCENDENCE Grafana dashboard.

---

## Volumes

The backend service mounts:

* `./backend/prisma:/app/prisma`
* `./backend/uploads:/app/uploads`
* `./backend/avatar:/app/avatar`
* `./backend/backups:/app/backups`

This allows you to:

* persist the SQLite database outside the container
* keep uploads and avatars even if containers are recreated
* keep database backups available outside the container lifecycle

Grafana and Prometheus may also use dedicated named volumes for their own persistent state, depending on the Compose configuration.

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

That does not prevent you from having technically correct HTTPS in local development.

---

## Monitoring and Observability

The monitoring stack is based on backend Prometheus metrics, Prometheus scraping, and Grafana visualization.

### Backend metrics

The backend exposes:

```text
/metrics
```

These metrics include:

* process metrics
* Node.js runtime metrics
* memory and heap usage
* event loop lag
* garbage collection metrics
* HTTP request metrics
* request latency histograms and summaries

### Operational endpoints

The backend also exposes:

```text
/health
/ready
/status
```

These endpoints are used for:

* liveness checks
* readiness checks
* status summaries
* dashboard verification
* monitoring demonstrations during evaluation

### Prometheus

Prometheus is configured to scrape the backend metrics endpoint from the internal Docker network.

Typical internal target:

```text
backend:5000/metrics
```

### Grafana

Grafana is provisioned automatically with:

* a Prometheus datasource
* a custom FT_TRANSCENDENCE backend dashboard

The dashboard includes panels such as:

* backend up/down state
* requests per second
* P95 latency
* resident memory
* request rate by route
* P95 latency by route
* event loop lag
* heap usage
* GC duration rate
* operational endpoints traffic and latency

### Alerting

Alert rules are configured for runtime degradation scenarios such as:

* backend down
* high memory usage
* excessive event loop lag

### Security of Grafana

Grafana is not left open anonymously.

The setup uses:

* explicit admin credentials
* disabled anonymous access
* controlled local exposure

---

## Backup and Recovery

The containerized setup also supports SQLite backup and restore procedures.

### Backup script

```bash
./backend/scripts/backup_db.sh
```

This script:

* creates a timestamped backup of the SQLite database
* stores it inside `backend/backups/`
* can be scheduled automatically if needed

### Restore script

```bash
./backend/scripts/restore_db.sh <backup-file>
```

This script:

* restores a selected backup file into the working database
* creates a safety copy before overwriting the current DB

### Recommended restore flow

```bash
docker compose stop backend
./backend/scripts/restore_db.sh <backup-file>
docker compose start backend
```

This avoids restoring SQLite while the backend is actively using the file.

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

### 6. Prometheus target is down

Typical symptom:

* Prometheus shows the backend target as `DOWN`

Possible causes:

* backend container is not healthy
* `/metrics` is not exposed correctly
* scrape target name/port is wrong in `prometheus.yml`

Fix:

* check `docker compose logs backend`
* check `docker compose logs prometheus`
* verify that Prometheus scrapes `backend:5000`

---

### 7. Grafana dashboard is not loaded automatically

Possible causes:

* provisioning files are mounted in the wrong location
* datasource UID does not match the dashboard JSON
* dashboard folder is not mounted correctly

Fix:

* check `docker compose logs grafana`
* verify provisioning paths inside the container
* verify the datasource UID used in the dashboard JSON

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

Open a shell in the Prometheus container:

```bash
docker compose exec prometheus sh
```

Open a shell in the Grafana container:

```bash
docker compose exec grafana sh
```

---

## Practical Suggestions

* keep Docker build contexts narrow (`./backend`, `./frontend`)
* do not exclude required files through `.dockerignore`
* use `npm ci` only when lockfiles are present
* terminate HTTPS at nginx
* avoid enabling HTTPS inside the backend unless really necessary
* persist SQLite, uploads, avatars, and backups through volumes
* keep Prometheus scrape config and Grafana provisioning under version control
* protect Grafana with credentials and controlled exposure

---

## Recommended Project State

For a stable setup:

* `backend/package-lock.json` exists
* `frontend/package-lock.json` exists
* `backend/prisma/migrations/` exists and is versioned
* the frontend does not use hardcoded `localhost:5000` URLs as its public entry point
* nginx is the single public HTTPS entry point
* Prometheus can scrape the backend successfully
* Grafana loads the provisioned dashboard automatically

---

## Suggested Development Flow

1. fix backend and frontend locally
2. generate missing lockfiles
3. make sure Prisma migrations exist
4. prepare monitoring files under `monitoring/`
5. run `docker compose up --build`
6. open `https://localhost:8443`
7. accept the self-signed certificate warning if needed
8. open Prometheus and verify the backend target is `UP`
9. open Grafana and verify the FT_TRANSCENDENCE dashboard is loaded

---

## Final Goal

With this setup:

* the frontend is served over HTTPS
* the backend is only reached externally through nginx in HTTPS
* internal communication between containers remains simple
* monitoring is integrated directly into the containerized stack
* Prometheus collects backend metrics
* Grafana exposes a custom monitoring dashboard
* the project is closer to a real deployment model and easier to operate, debug, and demonstrate
