#!/bin/bash

npx prisma init --datasource-provider sqlite
npx prisma migrate dev --name init
npx prisma generate

sudo apt install -y libnss3-tools mkcert
mkdir -p certs && cd certs
mkcert -install

npm run dev