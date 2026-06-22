#!/bin/sh
set -e

mkdir -p prisma uploads avatar/users certs dist/public

# Con il progetto attuale non hai migrations versionate,
# quindi allineo il DB direttamente dallo schema.
npx prisma db push

node dist/server.js