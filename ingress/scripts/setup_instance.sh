#!/bin/bash

set -e

source ./scripts/_setup_util.sh

# one of localDev, test, production
TARGET=$1

# name of the instance
INSTANCE_NAME=$2

# optional override for domains to be configured
# for multiple domains use comma separated list
DOMAINS=$3

# check that all parameters are valid
checkTargetIsValid "$TARGET"
checkInstanceNameIsValid "$INSTANCE_NAME"

# build default domain suffix and target ip address for target
if [[ "$TARGET" == "localDev" ]]; then
    DOMAIN_SUFFIX='degree.localhost'
    TARGET_IP_ADDRESS='127.0.0.1'
elif [[ "$TARGET" == "test" ]]; then
    DOMAIN_SUFFIX='degree40-test.tu-dortmund.de'
    TARGET_IP_ADDRESS='192.35.69.41'
elif [[ "$TARGET" == "production" ]]; then
    DOMAIN_SUFFIX='degree40.tu-dortmund.de'
    TARGET_IP_ADDRESS='192.35.69.40'
fi

# set default domain when nothing was specified
if [[ -z $DOMAINS ]]; then
    DOMAINS=$INSTANCE_NAME.$DOMAIN_SUFFIX
fi

if [[ "$TARGET_IP_ADDRESS" != "127.0.0.1" ]]; then
    # check that all domains are pointing to the target server
    IFS=',' read -ra DOMAIN_ARRAY <<< "$DOMAINS"
    for DOMAIN in "${DOMAIN_ARRAY[@]}"; do
        # Trim whitespace
        DOMAIN=$(echo "$DOMAIN" | xargs)
        echo "Checking that $DOMAIN resolves to $TARGET_IP_ADDRESS..."
        if dig +short "$DOMAIN" @1.1.1.1 | grep -q "$TARGET_IP_ADDRESS"; then
            echo "$DOMAIN resolves to $TARGET_IP_ADDRESS"
        else
            echo "$DOMAIN does not resolve to $TARGET_IP_ADDRESS, aborting!"
            exit 1
        fi
    done
fi

# directory used for local setup testing
LOCAL_RUNTIME_DIR="$(pwd)/local-runtime/"

copyToTarget ./scripts/setup_instance_on_target.sh
copyToTarget ./files/instance/docker-compose.yml
copyToTarget ./files/instance/.general.env.template

DATA_DIR=$([ "$TARGET" = "localDev" ] && echo "$LOCAL_RUNTIME_DIR/data" || echo '/data')

executeOnTarget "./setup_instance_on_target.sh $INSTANCE_NAME $DATA_DIR $DOMAINS"
