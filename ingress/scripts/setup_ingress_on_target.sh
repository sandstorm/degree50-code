#!/bin/bash

INGRESS_DIR="deployments/ingress"

# create file structure for ingress
mkdir -p $INGRESS_DIR/caddyfiles
mkdir -p $INGRESS_DIR/db-sync

# copy relevant files to ingress dir
mv docker-compose.yml $INGRESS_DIR/
mv Caddyfile $INGRESS_DIR/caddyfiles/

if [ ! -f $INGRESS_DIR/.env ]; then
    # generate random mariadb root password
    # TODO: is this the way? => this is the way
    echo "MYSQL_ROOT_PASSWORD=\"$(openssl rand -base64 32)"\" > $INGRESS_DIR/.env
fi

# start ingress
cd "$INGRESS_DIR"
docker compose up -d
