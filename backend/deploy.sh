#!/bin/sh
set -eu

mkdir -p prisma uploads avatar/users certs

if [ ! -d prisma/migrations ] || [ -z "$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d 2>/dev/null)" ]; then
  echo "ERROR: prisma/migrations non trovata o vuota."
  echo "Esegui una volta in locale:"
  echo "  npx prisma migrate dev --name init"
  echo "e committa la cartella prisma/migrations."
  exit 1
fi

npx prisma migrate deploy

exec node dist/server.js