#!/bin/bash
############################## DEV_SCRIPT_MARKER ##############################
# This script is used to document and run recurring tasks in development.     #
#                                                                             #
# You can run your tasks using the script `./dev some-task`.                  #
# You can install the Sandstorm Dev Script Runner and run your tasks from any #
# nested folder using `dev some-task`.                                        #
# https://github.com/sandstorm/Sandstorm.DevScriptRunner                      #
###############################################################################

source ./dev_utilities.sh

set -e

######### TASKS #########
# prune local runtime dir
function localPrune() {
    # if local-runtime/deployments does not exist, just return from this function
    if [ ! -d "local-runtime/deployments" ]; then
        _log_green "No local runtime dir found ... nothing to remove"
        return
    fi

    # Loop through all subdirectories (instances and ingress)
    cd local-runtime/deployments
    for dir in */; do
        # Check if docker-compose.yml exists in this directory
        if [ -f "${dir}docker-compose.yml" ]; then
            _log_green "Found docker-compose.yml for ${dir}"
            # Change to that directory
            cd "${dir}" || continue
            # Execute docker compose down -v for each instance + ingress
            _log_yellow "stopping ${dir} docker compose down -v in ${dir}"
            docker compose down -v --remove-orphans
            # Return to the original directory
            cd ..
        fi
    done

    cd ../..
    rm -r local-runtime || true
    _log_green "removed local runtime dir"
}

function localSetup() {
    _log_yellow "Pruning runtime for fresh setup"
    localPrune
    _log_green "Setting up local runtime"
    ./scripts/setup_ingress.sh localDev

    _log_green "Local Runtime up and running"
}

function localContainerLogs() {
    (cd local-runtime/deployments/ingress; docker compose logs -f)
}

function localSetupInstance() {
    _log_green "Setting up local instance $1"
    ./scripts/setup_instance.sh localDev "$1" "$2"
}

function testSetup() {
    _log_yellow "going to setup the ingress on the degree test server!"
    _log_yellow "     you got 5 seconds to cancel this!"
    # sleep 5
    _log_green "Starting! Touch your YubiKey!"
    ./scripts/setup_ingress.sh test
}

function testSetupInstance() {
    _log_yellow "going to setup instance $1 on the degree test server!"
    _log_yellow "     you got 5 seconds to cancel this!"
    # sleep 5
    _log_green "Starting! Touch your YubiKey!"
    ./scripts/setup_instance.sh test "$1" "$2"
}

_log_green "---------------------------- RUNNING TASK: $1 ----------------------------"

# THIS NEEDS TO BE LAST!!!
# this will run your tasks
"$@"
