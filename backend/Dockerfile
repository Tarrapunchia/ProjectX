FROM node:24-alpine AS build
WORKDIR /app

# Copia i file di configurazione e installa le dipendenze
COPY package*.json ./
RUN npm ci

# Copia tutto il codice sorgente
COPY . .

# Genera il client Prisma (senza migrazioni, che vanno fatte in deploy.sh)
RUN npx prisma generate

# Crea la cartella certs se non esiste
RUN mkdir -p certs

# Compila TypeScript
RUN npm run build

# Copia lo script di avvio
COPY backend/deploy.sh ./deploy.sh

# ===== Stage 2: Immagine finale per la produzione =====
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copia i file di configurazione e installa solo le dipendenze di produzione
COPY package*.json ./
RUN npm ci --omit=dev

# Crea la cartella certs se non esiste
RUN mkdir -p certs

# Copia la build, i file statici, prisma e i moduli necessari
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/public ./dist/public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/deploy.sh ./deploy.sh

# Copia il file .env
COPY .env ./

# Rendi eseguibile lo script di avvio
RUN chmod +x ./deploy.sh

# Espone la porta del backend
EXPOSE 5000

# Comando di avvio (deploy.sh si occuperà di migrare il DB e avviare il server)
CMD ["sh", "deploy.sh"]