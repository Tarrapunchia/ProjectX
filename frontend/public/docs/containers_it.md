# Setup Container

Questo progetto gira tramite Docker e Docker Compose con un'architettura multi-servizio basata su:

* **backend**: Node.js / Fastify / Prisma / SQLite
* **frontend**: React / Vite buildato e servito da **nginx**
* **prometheus**: raccolta metriche e valutazione alert
* **grafana**: dashboard di monitoraggio e interfaccia di osservabilità

Il modello di runtime è il seguente:

* il browser si connette a `https://localhost:8443`
* nginx serve i file statici del frontend
* nginx inoltra al backend route come `/api`, `/auth`, `/ws` e route operative
* il backend gira internamente sulla rete Docker, senza TLS esterno
* Prometheus esegue lo scrape delle metriche del backend dalla rete interna
* Grafana si collega a Prometheus e carica automaticamente le dashboard provisionate
* SQLite, upload, avatar e backup vengono persistiti tramite bind mount

---

## Struttura rilevante

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

## Requisiti

Ti servono:

* Docker
* plugin Docker Compose
* lockfile presenti sia in `backend/` che in `frontend/`

Se manca un lockfile, `npm ci` fallirà.

Per generarli:

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Avvio

Dalla root del progetto:

```bash
docker compose up --build
```

L'applicazione principale sarà disponibile su:

```text
https://localhost:8443
```

Il browser potrebbe mostrare un warning a causa del certificato self-signed. In locale è previsto.

Le interfacce di monitoraggio sono tipicamente disponibili su:

```text
Prometheus: http://localhost:9090
Grafana:    http://localhost:3000
```

L'accesso a Grafana è protetto tramite credenziali esplicite configurate in Docker Compose.

---

## Architettura

### Backend

Il backend viene buildato da `./backend`.

Caratteristiche:

* usa Prisma
* usa SQLite
* espone internamente la porta `5000`
* non è pensato come punto di ingresso pubblico principale dal browser
* riceve il traffico applicativo da nginx
* espone `/metrics` per lo scraping di Prometheus
* espone `/health`, `/ready` e `/status` per i controlli operativi

### Frontend

Il frontend viene buildato da `./frontend`.

Caratteristiche:

* builda l'app React/Vite in uno stage Node
* copia i file statici finali in nginx
* espone `443` dentro il container
* mappa `8443:443` sull'host
* agisce come punto di ingresso HTTPS per l'accesso dal browser

### Prometheus

Prometheus viene usato per:

* fare scrape delle metriche backend
* valutare le regole di alert
* memorizzare dati di monitoraggio time-series

Legge la configurazione da:

```text
monitoring/prometheus/prometheus.yml
monitoring/prometheus/alerts.yml
```

### Grafana

Grafana viene usato per:

* collegarsi a Prometheus come datasource
* provisionare automaticamente le dashboard
* mostrare metriche operative e runtime del backend

Legge i file di provisioning da:

```text
monitoring/grafana/provisioning/
monitoring/grafana/dashboards/
```

### HTTPS

HTTPS termina su nginx.

Questo soddisfa il requisito del progetto secondo cui l'accesso esterno al backend deve usare HTTPS, mentre la comunicazione interna tra container può restare non cifrata.

In pratica:

* **esterno → nginx**: HTTPS
* **nginx → backend**: HTTP interno su Docker
* **prometheus → backend**: HTTP interno su Docker
* **grafana → prometheus**: HTTP interno su Docker

---

## File importanti

### `docker-compose.yml`

Definisce l'intero stack di container:

* `backend`
* `frontend`
* `prometheus`
* `grafana`

Il backend usa volumi per persistere:

* `prisma/`
* `uploads/`
* `avatar/`
* `backups/`

### `backend/Dockerfile`

Build multi-stage del backend:

* installa le dipendenze
* genera il Prisma client
* compila il sorgente TypeScript
* produce un'immagine runtime pronta per l'esecuzione nel container

### `backend/deploy.sh`

Script di avvio del backend.

Tipicamente:

* prepara le directory runtime
* applica schema o migration Prisma
* avvia `node dist/server.js`

### `backend/scripts/backup_db.sh`

Crea backup SQLite timestampati in `backend/backups/`.

### `backend/scripts/restore_db.sh`

Ripristina un backup selezionato nel file SQLite attivo.

### `frontend/Dockerfile`

Build multi-stage del frontend:

* installa le dipendenze frontend
* esegue `npm run build`
* copia `dist/` in nginx

### `frontend/default.conf`

Configurazione nginx usata per:

* servire la SPA
* fare proxy verso route backend come:

  * `/api`
  * `/auth`
  * `/ws`
  * endpoint operativi se configurati (`/health`, `/ready`, `/status`)
  * ulteriori pagine backend-facing come docs o status page se configurate

### `frontend/entrypoint.sh`

Script di avvio di nginx, usato anche per preparare o generare certificati self-signed in sviluppo locale.

### `monitoring/prometheus/prometheus.yml`

Configurazione scrape di Prometheus.

### `monitoring/prometheus/alerts.yml`

Regole di alert Prometheus per il monitoraggio del backend.

### `monitoring/grafana/provisioning/datasources/datasource.yml`

Provisiona automaticamente Prometheus come datasource di Grafana.

### `monitoring/grafana/provisioning/dashboards/dashboard.yml`

Provisiona automaticamente il caricamento delle dashboard.

### `monitoring/grafana/dashboards/ft_transcendence_backend_monitoring.json`

Dashboard Grafana custom di FT_TRANSCENDENCE.

---

## Volumi

Il servizio backend monta:

* `./backend/prisma:/app/prisma`
* `./backend/uploads:/app/uploads`
* `./backend/avatar:/app/avatar`
* `./backend/backups:/app/backups`

Questo permette di:

* persistere il database SQLite fuori dal container
* mantenere upload e avatar anche se i container vengono ricreati
* mantenere disponibili i backup del database al di fuori del ciclo di vita del container

Grafana e Prometheus possono usare anche volumi dedicati nominati per il proprio stato persistente, a seconda della configurazione Compose.

---

## Note su Prisma

### Modalità consigliata

Se hai già migration versionate in:

```text
backend/prisma/migrations
```

puoi usare un workflow basato sulle migration con:

```bash
npx prisma migrate deploy
```

### Modalità pragmatica

Se vuoi solo allineare lo schema del database durante lo sviluppo:

```bash
npx prisma db push
```

È più comodo durante la containerizzazione del progetto, ma meno rigoroso di `migrate deploy`.

---

## Certificati HTTPS

Per lo sviluppo, nginx può usare certificati self-signed.

Puoi:

* generarli prima sull'host
* oppure generarli all'avvio del container nginx usando `openssl`

### Limite dei certificati self-signed

I browser non si fideranno automaticamente, quindi mostreranno un warning.

Questo non impedisce di avere HTTPS tecnicamente corretto in sviluppo locale.

---

## Monitoraggio e osservabilità

Lo stack di monitoraggio si basa su metriche Prometheus del backend, scraping Prometheus e visualizzazione Grafana.

### Metriche backend

Il backend espone:

```text
/metrics
```

Queste metriche includono:

* metriche di processo
* metriche runtime Node.js
* uso memoria e heap
* event loop lag
* metriche garbage collection
* metriche richieste HTTP
* istogrammi e summary di latenza delle richieste

### Endpoint operativi

Il backend espone anche:

```text
/health
/ready
/status
```

Questi endpoint vengono usati per:

* controlli di liveness
* controlli di readiness
* riepiloghi di stato
* verifica dashboard
* demo di monitoraggio in evaluation

### Prometheus

Prometheus è configurato per fare scrape dell'endpoint metriche del backend dalla rete Docker interna.

Target interno tipico:

```text
backend:5000/metrics
```

### Grafana

Grafana viene provisionato automaticamente con:

* un datasource Prometheus
* una dashboard backend custom FT_TRANSCENDENCE

La dashboard include pannelli come:

* stato backend up/down
* richieste al secondo
* latenza P95
* memoria resident
* request rate per route
* latenza P95 per route
* event loop lag
* heap usage
* GC duration rate
* traffico e latenza degli endpoint operativi

### Alerting

Le regole di alert sono configurate per scenari di degrado runtime come:

* backend down
* alto uso di memoria
* eccessivo event loop lag

### Sicurezza di Grafana

Grafana non è lasciato aperto anonimamente.

La configurazione usa:

* credenziali admin esplicite
* accesso anonimo disabilitato
* esposizione locale controllata

---

## Backup e recovery

La configurazione containerizzata supporta anche procedure di backup e restore per SQLite.

### Script di backup

```bash
./backend/scripts/backup_db.sh
```

Questo script:

* crea un backup timestampato del database SQLite
* lo salva dentro `backend/backups/`
* può essere schedulato automaticamente se necessario

### Script di restore

```bash
./backend/scripts/restore_db.sh <backup-file>
```

Questo script:

* ripristina un file di backup selezionato nel database in uso
* crea una safety copy prima di sovrascrivere il DB corrente

### Flusso di restore consigliato

```bash
docker compose stop backend
./backend/scripts/restore_db.sh <backup-file>
docker compose start backend
```

Questo evita di ripristinare SQLite mentre il backend sta usando attivamente il file.

---

## Problemi comuni

### 1. `npm ci` fallisce

Messaggio tipico:

```text
The npm ci command can only install with an existing package-lock.json
```

Causa:

* manca `package-lock.json`

Fix:

* esegui `npm install` nella directory interessata
* assicurati che il lockfile non sia escluso da `.dockerignore`

---

### 2. Mancano le migration Prisma

Messaggio tipico:

```text
prisma/migrations not found or empty
```

Causa:

* le migration non esistono
* oppure sono escluse da `.dockerignore`

Fix:

* assicurati che `backend/prisma/migrations` esista
* non escludere `prisma/` dal contesto di build Docker

---

### 3. `tsconfig.json` non trovato nel frontend

Messaggio tipico:

```text
Cannot read file '/app/tsconfig.json'
```

Causa:

* il file è escluso dal build context
* il `context` Docker non corrisponde alle assunzioni del Dockerfile

Fix:

* usa `context: ./frontend`
* non escludere `tsconfig*.json` in `.dockerignore`

---

### 4. `Cannot find module './ChatMenu'`

Causa comune:

* differenza di maiuscole/minuscole tra import e nome file reale

I filesystem Linux sono case-sensitive, quindi Docker fa emergere spesso questi problemi.

Fix:

* assicurati che il nome file coincida esattamente con l'import

---

### 5. `pino-pretty` non trovato a runtime

Causa:

* `pino-pretty` è una dipendenza di sviluppo, ma la configurazione logger a runtime la usa ancora

Fix:

* abilitalo solo in sviluppo
* usa il logger standard in produzione

---

### 6. Il target Prometheus è down

Sintomo tipico:

* Prometheus mostra il target backend come `DOWN`

Cause possibili:

* il container backend non è healthy
* `/metrics` non è esposto correttamente
* nome/porta target di scrape errati in `prometheus.yml`

Fix:

* controlla `docker compose logs backend`
* controlla `docker compose logs prometheus`
* verifica che Prometheus faccia scrape di `backend:5000`

---

### 7. La dashboard Grafana non viene caricata automaticamente

Cause possibili:

* i file di provisioning sono montati nella posizione sbagliata
* il datasource UID non corrisponde al JSON della dashboard
* la cartella dashboard non è montata correttamente

Fix:

* controlla `docker compose logs grafana`
* verifica i percorsi di provisioning dentro il container
* verifica il datasource UID usato nel JSON della dashboard

---

## Comandi utili

Avvio e rebuild:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Rebuild senza cache:

```bash
docker compose build --no-cache
```

Pulizia cache builder:

```bash
docker builder prune -f
```

Aprire una shell nel container backend:

```bash
docker compose exec backend sh
```

Aprire una shell nel container frontend:

```bash
docker compose exec frontend sh
```

Aprire una shell nel container Prometheus:

```bash
docker compose exec prometheus sh
```

Aprire una shell nel container Grafana:

```bash
docker compose exec grafana sh
```

---

## Suggerimenti pratici

* mantieni stretti i build context Docker (`./backend`, `./frontend`)
* non escludere file richiesti tramite `.dockerignore`
* usa `npm ci` solo quando i lockfile sono presenti
* termina HTTPS in nginx
* evita di abilitare HTTPS dentro il backend a meno che non serva davvero
* persisti SQLite, upload, avatar e backup tramite volumi
* tieni sotto version control la scrape config di Prometheus e il provisioning di Grafana
* proteggi Grafana con credenziali ed esposizione controllata

---

## Stato progetto consigliato

Per una configurazione stabile:

* `backend/package-lock.json` esiste
* `frontend/package-lock.json` esiste
* `backend/prisma/migrations/` esiste ed è versionato
* il frontend non usa URL hardcodati a `localhost:5000` come entry point pubblico
* nginx è l'unico entry point HTTPS pubblico
* Prometheus riesce a fare scrape del backend con successo
* Grafana carica automaticamente la dashboard provisionata

---

## Flusso di sviluppo consigliato

1. sistema backend e frontend in locale
2. genera eventuali lockfile mancanti
3. assicurati che le migration Prisma esistano
4. prepara i file di monitoring sotto `monitoring/`
5. esegui `docker compose up --build`
6. apri `https://localhost:8443`
7. accetta il warning del certificato self-signed se necessario
8. apri Prometheus e verifica che il target backend sia `UP`
9. apri Grafana e verifica che la dashboard FT_TRANSCENDENCE sia caricata

---

## Obiettivo finale

Con questa configurazione:

* il frontend è servito in HTTPS
* il backend è raggiunto esternamente solo tramite nginx in HTTPS
* la comunicazione interna tra container resta semplice
* il monitoraggio è integrato direttamente nello stack containerizzato
* Prometheus raccoglie le metriche del backend
* Grafana espone una dashboard di monitoraggio custom
* il progetto è più vicino a un modello di deploy reale ed è più facile da operare, debuggare e dimostrare
