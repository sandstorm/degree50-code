#!/bin/bash

set -e

source ./scripts/_setup_util.sh

# one of localDev, test, production
TARGET=$1

# name of the instance
INSTANCE_NAME=$2

# optional override for domain to be configured
DOMAIN=$3

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
if [[ -z $DOMAIN ]]; then
    DOMAIN=$INSTANCE_NAME.$DOMAIN_SUFFIX
fi

if [[ "$TARGET_IP_ADDRESS" != "127.0.0.1" ]]; then
    # Trim whitespace
    DOMAIN_TO_CHECK=$(echo "$DOMAIN" | xargs)
    echo "Checking that $DOMAIN_TO_CHECK resolves to $TARGET_IP_ADDRESS..."
    if dig +short "$DOMAIN_TO_CHECK" @1.1.1.1 | grep -q "$TARGET_IP_ADDRESS"; then
        echo "$DOMAIN_TO_CHECK resolves to $TARGET_IP_ADDRESS"
    else
        echo "$DOMAIN_TO_CHECK does not resolve to $TARGET_IP_ADDRESS, aborting!"
        exit 1
    fi
fi

# directory used for local setup testing
LOCAL_RUNTIME_DIR="$(pwd)/local-runtime/"

copyToTarget ./scripts/setup_instance_on_target.sh
copyToTarget ./files/instance/docker-compose.yml
copyToTarget ./files/instance/.general.env.template

DATA_DIR=$([ "$TARGET" = "localDev" ] && echo "$LOCAL_RUNTIME_DIR/data" || echo '/data')

executeOnTarget "./setup_instance_on_target.sh $INSTANCE_NAME $DATA_DIR $DOMAIN"
