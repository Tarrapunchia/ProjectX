# Build
FROM node:24-alpine AS build
WORKDIR /app

# Copia i file di configurazione
COPY package*.json ./

# Installa tutte le dipendenze
RUN npm ci

# Copia tutto il codice sorgente
COPY . .

# Compila TypeScript e builda con Vite
RUN npm run build

# Immagine finale (Serve con Nginx):
FROM nginx:alpine

# Rimuovi la configurazione di default di Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la configurazione nginx del server
COPY default.conf /etc/nginx/conf.d/default.conf

# Copia i file compilati da build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]