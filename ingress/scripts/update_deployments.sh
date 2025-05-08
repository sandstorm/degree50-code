#!/bin/bash

# This script is run by the CI/CD pipeline to update the deployments of all instances

set -e

CI_REGISTRY_USER=$1
CI_REGISTRY_PASSWORD=$2
CI_REGISTRY=$3
IMAGE_TAG=$4

docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"

cd deployments

for dir in */
do
    DIR=$(basename "$dir")

    if [[ "$DIR" == "ingress" ]]
    then
        echo "Skipping ingress directory"
        continue
    fi

    cd "$dir"
    echo "=== Updating Instance $DIR to $IMAGE_TAG ==="

    if [[ ! -f ".env" ]]
    then
        echo "Missing .env file, SKIPPING!"
        continue
    fi

    if [[ ! -f "docker-compose.yml" ]]
    then
        echo "Missing docker-compose.yaml.. aborting!"
        continue
    fi

    sed -i "s/^IMAGE_TAG='[^']*'/IMAGE_TAG='$IMAGE_TAG'/" .env

    echo "Restarting docker compose setup with new env:"
    echo " === "
    cat .env
    echo " === "

    docker compose pull
    docker compose up -d

    cd ..
done

echo " === Update done === "
