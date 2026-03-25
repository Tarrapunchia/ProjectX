FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npx prisma migrate dev --name init
COPY certs ./certs
RUN npm run build

FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY certs ./certs
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/public ./dist/public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/deploy.sh ./deploy.sh

COPY .env ./
RUN chmod +x ./deploy.sh

EXPOSE 5000
CMD ["sh", "deploy.sh"]