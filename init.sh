#!/bin/bash

if [ ! -f ./prisma/dev.db ]; then
    echo "Initializing database"
    # npx prisma init --datasource-provider sqlite
    npx prisma migrate dev --name init
    npx prisma generate
else
    echo "Database found!"
fi


# crea i certificati di sicurezza
if [ ! -f ./certs/localhost.pem ]; then
    echo "Creating certificate"
    sudo apt install -y libnss3-tools mkcert
    mkdir -p certs && cd certs
    mkcert -install
    mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
else
    echo "Certificate found!"
fi

npm run dev