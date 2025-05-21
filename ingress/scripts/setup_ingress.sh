#!/bin/bash

set -e

source ./scripts/_setup_util.sh

TARGET=$1

checkTargetIsValid "$TARGET"

LOCAL_RUNTIME_DIR="./local-runtime/"

function initRuntime() {
    if [[ "$TARGET" == "localDev" ]]
    then
        mkdir -p $LOCAL_RUNTIME_DIR
        mkdir -p $LOCAL_RUNTIME_DIR/deployments

        # create local mail config
        SECRET_ENV_FILE="$LOCAL_RUNTIME_DIR/deployments/.secrets.env"
        if [ ! -f "$SECRET_ENV_FILE" ]; then
            echo "MAILER_DSN=smtp://mailpit:1025" > $SECRET_ENV_FILE
            echo "MAILER_SENDER_ADDRESS=no-reply@degree.de" >> $SECRET_ENV_FILE
        fi
    fi
}

initRuntime
copyToTarget ./scripts/setup_ingress_on_target.sh
copyToTarget ./files/ingress/docker-compose.yml
copyToTarget ./files/ingress/Caddyfile

executeOnTarget "./setup_ingress_on_target.sh"
