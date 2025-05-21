#!/bin/bash

set -e

# name of the instance to create
INSTANCE_NAME=$1
# directory to mount large files to (used on prod for more disk space)
GLOBAL_DATA_DIR=$2
# comma separated list of domains to be configured
DOMAINS=$3

echo "  ##"
echo "  ##"
echo "  ##       Creating or updating instance $INSTANCE_NAME"
echo "  ##       DOMAINS: $DOMAINS"
echo "  ##"
echo "  ###########################################################"
echo "  ##"

# check that $INSTANCE_NAME follows our naming conventions; when not exit with error
echo "Checking instance name '$INSTANCE_NAME' to be a valid subdomain, linux directory and docker-network name..."
if [[ ! "$INSTANCE_NAME" =~ ^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$ ]]; then
    echo "Error: instance name must match '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$' i.e. start alphanumeric & end alphanumeric & can have single dashes in between & 1-63 characters."
    exit 1
elif [[ "$INSTANCE_NAME" == "ingress" ]]; then
    echo "Error: ingress as INSTANCE_NAME is reserved!"
    exit 1
fi

if [[ -z $DOMAINS ]]; then
    echo "Error: no domains supplied!"
    exit 1
fi

# home folder of the deployment user; for local the local-runtime directory
RUNTIME_ROOT_DIR=$(pwd)
DEPLOYMENTS_DIR="$RUNTIME_ROOT_DIR/deployments"
INSTANCE_DIR="$DEPLOYMENTS_DIR/$INSTANCE_NAME"
INGRESS_DIR="$DEPLOYMENTS_DIR/ingress"

# setup instance directory
mkdir -p "$INSTANCE_DIR"
mv docker-compose.yml "$INSTANCE_DIR/"

cd "$INSTANCE_DIR"

GENERAL_ENV_FILE="$INSTANCE_DIR/.general.env"

# The .saml.env will be put on the server manually - create an empty file if not present
# Create a .general.env file for the instance
# Secrets .secrets.env is stored on the system at deployments/.secrets.env
function createEnvFile() {
    echo "  ##           generating environment files ..."
    # copy .secrets.env to instance dir
    cp "$DEPLOYMENTS_DIR/.secrets.env" .secrets.env

    # load .general.env file if exists to keep specific settings
    if [[ -f $GENERAL_ENV_FILE ]]; then source "$GENERAL_ENV_FILE"; fi

    export MYSQL_USER="$INSTANCE_NAME"
    export MYSQL_DATABASE="$INSTANCE_NAME"

    export APP_SECRET=${APP_SECRET:-$(openssl rand -hex 32)}
    export MYSQL_PASSWORD=${MYSQL_PASSWORD:-$(openssl rand -hex 32)}
    export JWT_KEY=${JWT_KEY:-$(openssl rand -hex 32)}

    # set env vars in .general.env based on template
    envsubst < "$RUNTIME_ROOT_DIR/.general.env.template" > "$GENERAL_ENV_FILE"

    # this file is for docker-compose itself
    echo "INSTANCE_NAME=$INSTANCE_NAME" > .env
    echo "IMAGE_TAG='latest'" >> .env

    # generate an empty .saml.env file by default; override manually when needed
    if [[ ! -f .saml.env ]]
    then
        echo "SAML_ENABLED=disabled" > .saml.env
    fi

    echo "  ##           ... done!"
    echo "  ##"
}

function createDataSymlink() {
    INSTANCE_DATA_DIR="$GLOBAL_DATA_DIR/$INSTANCE_NAME-data"

    echo "  ##           creating data symlink to $INSTANCE_DATA_DIR"

    mkdir -p "$INSTANCE_DATA_DIR"
    # create soft-link, replacing exiting one, -n to not re-create the symlink inside the target
    ln -sfn "$INSTANCE_DATA_DIR" "$INSTANCE_DIR/data"

    # We create the directories here before docker creates them with root permissions
    echo "  ##           creating mounted directories"
    mkdir -p "$INSTANCE_DATA_DIR/app/var/log"
    mkdir -p "$INSTANCE_DATA_DIR/app/var/data"
    mkdir -p "$INSTANCE_DATA_DIR/app/public/data"
    mkdir -p "$INSTANCE_DATA_DIR/app/config/secrets"

    echo "  ##           ... done!"
    echo "  ##"
}

function createInitSql() {
    echo "  ##           creating database and user for $INSTANCE_NAME"
    source "$GENERAL_ENV_FILE" &>/dev/null

    echo "create database if not exists \`$MYSQL_DATABASE\`;" > init.sql
    echo "create user if not exists \"$MYSQL_USER\"@\"%\" identified by \"$MYSQL_PASSWORD\";" >> init.sql
    echo "grant all privileges on \`$MYSQL_DATABASE\`.* to \"$MYSQL_USER\"@\"%\";" >> init.sql

    # copy to share db dir
    cp init.sql "$INGRESS_DIR/db-sync/$INSTANCE_NAME-init.sql"
    # create run init.sql in db container
    (cd "$INGRESS_DIR"; docker compose exec db bash -c "mysql -u root -p\"\$MYSQL_ROOT_PASSWORD\" < /db-sync/$INSTANCE_NAME-init.sql")

    echo "  ##           ... done!"
    echo "  ##"
}

function createCaddyFile() {
    # create caddy file for instance with subdomain === instance name
    echo "  ##           creating webserver configuration for $INSTANCE_NAME"

    CADDYFILE_NAME="$INSTANCE_NAME.Caddyfile"
    # remove caddyfile for instance if it already exists
    rm "$CADDYFILE_NAME" 2>/dev/null || true
    # then create empty Caddyfile
    touch "$CADDYFILE_NAME"

    # now fill the caddyfile with all configured domains
    IFS=',' read -ra DOMAIN_ARRAY <<< "$DOMAINS"
    for DOMAIN in "${DOMAIN_ARRAY[@]}"; do
        # TODO: use caddy file template and envsubst?
        # Trim whitespace
        DOMAIN=$(echo "$DOMAIN" | xargs)
        echo "$DOMAIN {" >> "$CADDYFILE_NAME"
        echo "  reverse_proxy http://$INSTANCE_NAME:8080" >> "$CADDYFILE_NAME"
        echo "}" >> "$CADDYFILE_NAME"
        echo "" >> "$CADDYFILE_NAME"
        echo "  ##             - https://$DOMAIN"
    done

    # copy to share caddy dir
    cp "$CADDYFILE_NAME" "$INGRESS_DIR/caddyfiles/$CADDYFILE_NAME"

    # run caddy reload
    (cd "$INGRESS_DIR"; docker compose exec caddy sh -c "caddy reload --config /etc/caddy/Caddyfile")

    echo "  ##           ... done!"
    echo "  ##"
}

function bootInstance() {
    echo "  ##           starting degree application!"

    cd "$INSTANCE_DIR"
    docker compose up -d

    echo "  ##           Application started!"
    echo "  ##"
}

function cleanUp() {
    echo "  ##           Cleaning up ..."

    cd "$RUNTIME_ROOT_DIR"
    rm .general.env.template

    echo "  ##           ... done!"
    echo "  ##"
}

createEnvFile
createDataSymlink
createInitSql
createCaddyFile
cleanUp
bootInstance
