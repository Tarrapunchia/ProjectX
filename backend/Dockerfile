FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Fastify static cerca dist/public
RUN mkdir -p dist/public && cp -r src/public/. dist/public/


FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL=file:./prisma/dev.db
ENV HTTPS=

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/avatar ./avatar
COPY --from=build /app/deploy.sh ./deploy.sh

# Cartelle runtime usate dal progetto
RUN mkdir -p certs uploads avatar/users

# Genera il Prisma Client nello stage finale, così evitiamo
# di trascinarci roba interna da node_modules del builder.
RUN npx prisma generate

RUN chmod +x ./deploy.sh

EXPOSE 5000

CMD ["sh", "./deploy.sh"]