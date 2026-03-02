#!/bin/bash

npx prisma init --datasource-provider sqlite
npx prisma migrate dev --name init
npx prisma generate

# crea i certificati di sicurezza
# sudo apt install -y libnss3-tools mkcert
# mkdir -p certs && cd certs
# mkcert -install
# mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1

npm run dev