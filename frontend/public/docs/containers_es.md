# Configuración de Contenedores

Este proyecto se ejecuta mediante Docker y Docker Compose con una arquitectura multi-servicio basada en:

* **backend**: Node.js / Fastify / Prisma / SQLite
* **frontend**: React / Vite construido y servido por **nginx**
* **prometheus**: recolección de métricas y evaluación de alertas
* **grafana**: dashboards de monitorización e interfaz de observabilidad

El modelo de ejecución es:

* el navegador se conecta a `https://localhost:8443`
* nginx sirve los archivos estáticos del frontend
* nginx reenvía al backend rutas como `/api`, `/auth`, `/ws` y rutas operativas
* el backend se ejecuta internamente en la red Docker, sin TLS externo
* Prometheus hace scrape de las métricas del backend desde la red interna
* Grafana se conecta a Prometheus y carga automáticamente los dashboards provisionados
* SQLite, subidas, avatares y copias de seguridad se persisten mediante bind mounts

---

## Estructura relevante

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

## Requisitos

Necesitas:

* Docker
* plugin de Docker Compose
* lockfiles presentes tanto en `backend/` como en `frontend/`

Si falta un lockfile, `npm ci` fallará.

Para generarlos:

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Inicio

Desde la raíz del proyecto:

```bash
docker compose up --build
```

La aplicación principal estará disponible en:

```text
https://localhost:8443
```

El navegador puede mostrar una advertencia por el certificado autofirmado. Es normal en desarrollo local.

Las interfaces de monitorización suelen estar disponibles en:

```text
Prometheus: http://localhost:9090
Grafana:    http://localhost:3000
```

El acceso a Grafana está protegido mediante credenciales explícitas configuradas en Docker Compose.

---

## Arquitectura

### Backend

El backend se construye desde `./backend`.

Características:

* usa Prisma
* usa SQLite
* expone internamente el puerto `5000`
* no está pensado como punto de entrada público principal desde el navegador
* recibe el tráfico de la aplicación desde nginx
* expone `/metrics` para el scraping de Prometheus
* expone `/health`, `/ready` y `/status` para comprobaciones operativas

### Frontend

El frontend se construye desde `./frontend`.

Características:

* construye la aplicación React/Vite en una etapa Node
* copia los archivos estáticos finales a nginx
* expone `443` dentro del contenedor
* mapea `8443:443` en el host
* actúa como punto de entrada HTTPS para acceso desde el navegador

### Prometheus

Prometheus se usa para:

* hacer scrape de métricas del backend
* evaluar reglas de alerta
* almacenar datos de monitorización en series temporales

Lee la configuración desde:

```text
monitoring/prometheus/prometheus.yml
monitoring/prometheus/alerts.yml
```

### Grafana

Grafana se usa para:

* conectarse a Prometheus como datasource
* provisionar dashboards automáticamente
* mostrar métricas operativas y de runtime del backend

Lee los archivos de provisioning desde:

```text
monitoring/grafana/provisioning/
monitoring/grafana/dashboards/
```

### HTTPS

HTTPS termina en nginx.

Esto satisface el requisito del proyecto de que el acceso externo al backend debe usar HTTPS, mientras que la comunicación interna entre contenedores puede permanecer sin cifrar.

En la práctica:

* **externo → nginx**: HTTPS
* **nginx → backend**: HTTP interno sobre Docker
* **prometheus → backend**: HTTP interno sobre Docker
* **grafana → prometheus**: HTTP interno sobre Docker

---

## Archivos importantes

### `docker-compose.yml`

Define toda la pila de contenedores:

* `backend`
* `frontend`
* `prometheus`
* `grafana`

El backend usa volúmenes para persistir:

* `prisma/`
* `uploads/`
* `avatar/`
* `backups/`

### `backend/Dockerfile`

Build multi-stage del backend:

* instala dependencias
* genera el cliente Prisma
* compila el código TypeScript
* produce una imagen runtime lista para ejecución en contenedor

### `backend/deploy.sh`

Script de arranque del backend.

Normalmente:

* prepara directorios de runtime
* aplica el esquema o las migraciones de Prisma
* inicia `node dist/server.js`

### `backend/scripts/backup_db.sh`

Crea copias SQLite con marca temporal en `backend/backups/`.

### `backend/scripts/restore_db.sh`

Restaura una copia seleccionada en el archivo SQLite activo.

### `frontend/Dockerfile`

Build multi-stage del frontend:

* instala dependencias del frontend
* ejecuta `npm run build`
* copia `dist/` a nginx

### `frontend/default.conf`

Configuración de nginx usada para:

* servir la SPA
* hacer proxy de rutas del backend como:

  * `/api`
  * `/auth`
  * `/ws`
  * endpoints operativos si están configurados (`/health`, `/ready`, `/status`)
  * páginas adicionales orientadas al backend como docs o status pages si están configuradas

### `frontend/entrypoint.sh`

Script de arranque de nginx, usado también para preparar o generar certificados autofirmados en desarrollo local.

### `monitoring/prometheus/prometheus.yml`

Configuración de scrape de Prometheus.

### `monitoring/prometheus/alerts.yml`

Reglas de alerta de Prometheus para monitorización del backend.

### `monitoring/grafana/provisioning/datasources/datasource.yml`

Provisiona automáticamente Prometheus como datasource de Grafana.

### `monitoring/grafana/provisioning/dashboards/dashboard.yml`

Provisiona automáticamente la carga de dashboards.

### `monitoring/grafana/dashboards/ft_transcendence_backend_monitoring.json`

Dashboard custom de Grafana para FT_TRANSCENDENCE.

---

## Volúmenes

El servicio backend monta:

* `./backend/prisma:/app/prisma`
* `./backend/uploads:/app/uploads`
* `./backend/avatar:/app/avatar`
* `./backend/backups:/app/backups`

Esto te permite:

* persistir la base de datos SQLite fuera del contenedor
* conservar subidas y avatares aunque los contenedores se recrean
* mantener las copias de seguridad de la base de datos fuera del ciclo de vida del contenedor

Grafana y Prometheus también pueden usar volúmenes nombrados dedicados para su propio estado persistente, según la configuración de Compose.

---

## Notas sobre Prisma

### Modo recomendado

Si ya tienes migraciones versionadas en:

```text
backend/prisma/migrations
```

puedes usar un flujo basado en migraciones con:

```bash
npx prisma migrate deploy
```

### Modo pragmático

Si solo quieres alinear el esquema de la base de datos durante el desarrollo:

```bash
npx prisma db push
```

Esto es más cómodo al containerizar el proyecto, pero menos estricto que `migrate deploy`.

---

## Certificados HTTPS

Para desarrollo, nginx puede usar certificados autofirmados.

Puedes:

* generarlos previamente en el host
* o generarlos al arrancar el contenedor nginx usando `openssl`

### Limitación de los certificados autofirmados

Los navegadores no confiarán automáticamente en ellos, así que verás una advertencia.

Eso no impide tener un HTTPS técnicamente correcto en desarrollo local.

---

## Monitorización y observabilidad

La pila de monitorización se basa en métricas Prometheus del backend, scraping de Prometheus y visualización con Grafana.

### Métricas del backend

El backend expone:

```text
/metrics
```

Estas métricas incluyen:

* métricas de proceso
* métricas de runtime de Node.js
* uso de memoria y heap
* event loop lag
* métricas de garbage collection
* métricas de peticiones HTTP
* histogramas y summaries de latencia de peticiones

### Endpoints operativos

El backend también expone:

```text
/health
/ready
/status
```

Estos endpoints se usan para:

* comprobaciones de liveness
* comprobaciones de readiness
* resúmenes de estado
* verificación de dashboards
* demostraciones de monitorización durante la evaluación

### Prometheus

Prometheus está configurado para hacer scrape del endpoint de métricas del backend desde la red interna Docker.

Objetivo interno típico:

```text
backend:5000/metrics
```

### Grafana

Grafana se provisiona automáticamente con:

* un datasource Prometheus
* un dashboard backend custom FT_TRANSCENDENCE

El dashboard incluye paneles como:

* estado backend up/down
* peticiones por segundo
* latencia P95
* memoria residente
* tasa de peticiones por ruta
* latencia P95 por ruta
* event loop lag
* uso de heap
* tasa de duración de GC
* tráfico y latencia de endpoints operativos

### Alertas

Las reglas de alerta están configuradas para escenarios de degradación del runtime como:

* backend caído
* alto uso de memoria
* event loop lag excesivo

### Seguridad de Grafana

Grafana no queda abierto de forma anónima.

La configuración usa:

* credenciales admin explícitas
* acceso anónimo deshabilitado
* exposición local controlada

---

## Copias de seguridad y recuperación

La configuración containerizada también soporta procedimientos de backup y restore para SQLite.

### Script de backup

```bash
./backend/scripts/backup_db.sh
```

Este script:

* crea una copia de seguridad con marca temporal de la base SQLite
* la guarda dentro de `backend/backups/`
* puede programarse automáticamente si hace falta

### Script de restore

```bash
./backend/scripts/restore_db.sh <backup-file>
```

Este script:

* restaura un archivo de backup seleccionado en la base de datos en uso
* crea una copia de seguridad previa antes de sobrescribir la DB actual

### Flujo recomendado de restore

```bash
docker compose stop backend
./backend/scripts/restore_db.sh <backup-file>
docker compose start backend
```

Esto evita restaurar SQLite mientras el backend está usando activamente el archivo.

---

## Problemas comunes

### 1. `npm ci` falla

Mensaje típico:

```text
The npm ci command can only install with an existing package-lock.json
```

Causa:

* falta `package-lock.json`

Solución:

* ejecuta `npm install` en el directorio afectado
* asegúrate de que el lockfile no esté excluido por `.dockerignore`

---

### 2. Faltan migraciones de Prisma

Mensaje típico:

```text
prisma/migrations not found or empty
```

Causa:

* las migraciones no existen
* o están excluidas por `.dockerignore`

Solución:

* asegúrate de que `backend/prisma/migrations` exista
* no excluyas `prisma/` del contexto de build de Docker

---

### 3. `tsconfig.json` no encontrado en el frontend

Mensaje típico:

```text
Cannot read file '/app/tsconfig.json'
```

Causa:

* el archivo está excluido del contexto de build
* el `context` Docker no coincide con lo que asume el Dockerfile

Solución:

* usa `context: ./frontend`
* no excluyas `tsconfig*.json` en `.dockerignore`

---

### 4. `Cannot find module './ChatMenu'`

Causa común:

* diferencia entre mayúsculas/minúsculas del import y el nombre real del archivo

Los sistemas de archivos Linux distinguen mayúsculas de minúsculas, así que Docker suele exponer estos problemas.

Solución:

* asegúrate de que el nombre del archivo coincida exactamente con el import

---

### 5. `pino-pretty` no encontrado en runtime

Causa:

* `pino-pretty` es una dependencia de desarrollo, pero la configuración del logger en runtime sigue usándola

Solución:

* habilítalo solo en desarrollo
* usa el logger estándar en producción

---

### 6. El target de Prometheus está caído

Síntoma típico:

* Prometheus muestra el target del backend como `DOWN`

Posibles causas:

* el contenedor backend no está healthy
* `/metrics` no está expuesto correctamente
* nombre/puerto del target de scrape incorrectos en `prometheus.yml`

Solución:

* revisa `docker compose logs backend`
* revisa `docker compose logs prometheus`
* verifica que Prometheus haga scrape de `backend:5000`

---

### 7. El dashboard de Grafana no se carga automáticamente

Posibles causas:

* los archivos de provisioning están montados en la ubicación equivocada
* el UID del datasource no coincide con el JSON del dashboard
* la carpeta de dashboards no está montada correctamente

Solución:

* revisa `docker compose logs grafana`
* verifica las rutas de provisioning dentro del contenedor
* verifica el UID del datasource usado en el JSON del dashboard

---

## Comandos útiles

Arranque y rebuild:

```bash
docker compose up --build
```

Detener:

```bash
docker compose down
```

Rebuild sin caché:

```bash
docker compose build --no-cache
```

Limpiar caché del builder:

```bash
docker builder prune -f
```

Abrir una shell en el contenedor backend:

```bash
docker compose exec backend sh
```

Abrir una shell en el contenedor frontend:

```bash
docker compose exec frontend sh
```

Abrir una shell en el contenedor Prometheus:

```bash
docker compose exec prometheus sh
```

Abrir una shell en el contenedor Grafana:

```bash
docker compose exec grafana sh
```

---

## Sugerencias prácticas

* mantén acotados los build contexts de Docker (`./backend`, `./frontend`)
* no excluyas archivos necesarios mediante `.dockerignore`
* usa `npm ci` solo cuando existan lockfiles
* termina HTTPS en nginx
* evita habilitar HTTPS dentro del backend salvo que sea realmente necesario
* persiste SQLite, subidas, avatares y backups mediante volúmenes
* mantén en control de versiones la scrape config de Prometheus y el provisioning de Grafana
* protege Grafana con credenciales y exposición controlada

---

## Estado recomendado del proyecto

Para una configuración estable:

* existe `backend/package-lock.json`
* existe `frontend/package-lock.json`
* existe `backend/prisma/migrations/` y está versionado
* el frontend no usa URLs hardcodeadas a `localhost:5000` como punto de entrada público
* nginx es el único punto de entrada HTTPS público
* Prometheus puede hacer scrape del backend correctamente
* Grafana carga automáticamente el dashboard provisionado

---

## Flujo de desarrollo sugerido

1. arregla backend y frontend localmente
2. genera lockfiles faltantes si existen
3. asegúrate de que las migraciones Prisma existen
4. prepara los archivos de monitoring bajo `monitoring/`
5. ejecuta `docker compose up --build`
6. abre `https://localhost:8443`
7. acepta la advertencia del certificado autofirmado si hace falta
8. abre Prometheus y verifica que el target del backend esté `UP`
9. abre Grafana y verifica que el dashboard FT_TRANSCENDENCE esté cargado

---

## Objetivo final

Con esta configuración:

* el frontend se sirve mediante HTTPS
* el backend se alcanza externamente solo a través de nginx usando HTTPS
* la comunicación interna entre contenedores sigue siendo simple
* la monitorización queda integrada directamente en la pila containerizada
* Prometheus recopila métricas del backend
* Grafana expone un dashboard custom de monitorización
* el proyecto se acerca más a un modelo de despliegue real y resulta más fácil de operar, depurar y demostrar
