#!/bin/bash

mkdir -p /etc/vector/

echo "------------------------------"
echo "Starting up"
echo "------------------------------"
exec vector --config /etc/vector/$VECTOR_CONFIG_FILE_NAME
