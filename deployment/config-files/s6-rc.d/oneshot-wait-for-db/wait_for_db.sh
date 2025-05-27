#!/bin/bash

WAIT_COUNT=1
MAX_WAIT=60
until php /app/bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1
do
  echo "waiting for database to be ready...$WAIT_COUNT"
  sleep 1
  WAIT_COUNT=$((WAIT_COUNT+1))
  if [[ $WAIT_COUNT -gt $MAX_WAIT ]]
  then
    echo "Database not ready after $MAX_WAIT seconds, exiting."
    exit 1
  fi
done

echo "Database ready!"
