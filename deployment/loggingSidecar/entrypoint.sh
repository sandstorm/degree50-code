#!/bin/bash

mkdir -p /etc/vector/

gomplate --input-dir /etc/vector_template --output-dir /etc/vector

echo "------------------------------"
echo "Dumping Processed Vector Config File: /etc/vector/$VECTOR_CONFIG_FILE_NAME"
echo "------------------------------"
cat /etc/vector/$VECTOR_CONFIG_FILE_NAME

echo "------------------------------"
echo "Starting up"
echo "------------------------------"
exec vector --config /etc/vector/$VECTOR_CONFIG_FILE_NAME