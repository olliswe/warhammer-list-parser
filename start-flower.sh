#!/bin/bash
set -e

echo "Starting Flower..."
exec celery -A warhammer_list_parser flower --basic-auth=${FLOWER_USER:-admin}:${FLOWER_PASSWORD:-admin} --port=5555