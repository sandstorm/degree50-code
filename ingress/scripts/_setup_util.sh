#!/bin/bash

SSH_PRODUCTION_HOST="deployment@degree40.tu-dortmund.de"
SSH_TEST_HOST="deployment@degree40-test.tu-dortmund.de"

function checkTargetIsValid() {
    if [[ "$TARGET" != "localDev" && "$TARGET" != "test" && "$TARGET" != "production" ]]; then
        echo "Error: TARGET must be one of localDev, test or production"
        exit 1
    fi
}

# check that $INSTANCE_NAME follows our naming conventions; when not exit with error
function checkInstanceNameIsValid() {
    if [[ ! $INSTANCE_NAME =~ ^[a-z][a-z0-9]*$ ]]; then
        echo "Error: instance name must be a-z0-9 starting with a-z"
        exit 1
    elif [[ "$INSTANCE_NAME" == "ingress" ]]; then
        echo "Error: ingress as INSTANCE_NAME is forbidden!"
        exit 1
    fi
}

function copyToTarget() {
    if [[ "$TARGET" == "localDev" ]]
    then
        cp "$1" "$LOCAL_RUNTIME_DIR"
    elif [[ "$TARGET" == "test" || "$TARGET" == "production" ]]
    then
        SSH_HOST=$([ "$TARGET" = "test" ] && echo $SSH_TEST_HOST || echo $SSH_PRODUCTION_HOST)
        scp "$1" "$SSH_HOST":
    fi
}
function executeOnTarget() {
    if [[ "$TARGET" == "localDev" ]]
    then
        # execute in sub shell
        (cd "$LOCAL_RUNTIME_DIR"; bash -c "$1")
    elif [[ "$TARGET" == "test" || "$TARGET" == "production" ]]
    then
        SSH_HOST=$([ "$TARGET" = "test" ] && echo $SSH_TEST_HOST || echo $SSH_PRODUCTION_HOST)
        ssh "$SSH_HOST" "$1"
    fi
}
