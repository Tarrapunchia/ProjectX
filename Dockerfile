FROM node:24-alpine
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm i
COPY . .
EXPOSE 5000
RUN chmod +x ./init.sh
# CMD ["node", "index.js"]
CMD ["sh", "./init.sh"]