#!/bin/sh
set -e

mkdir -p /etc/nginx/certs

if [ ! -f /etc/nginx/certs/localhost.pem ] || [ ! -f /etc/nginx/certs/localhost-key.pem ]; then
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /etc/nginx/certs/localhost-key.pem \
    -out /etc/nginx/certs/localhost.pem \
    -days 365 \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi

exec nginx -g "daemon off;"