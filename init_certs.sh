#!/bin/sh
# crea i certificati di sicurezza
if [ ! -f ./certs/localhost.pem ]; then
    echo "Creating certificate"
    sudo apt update && apt install -y libnss3-tools mkcert
    mkdir -p certs && cd certs
    mkcert -install
    mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
else
    echo "Certificate found!"
fi
