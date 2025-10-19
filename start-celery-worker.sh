#!/bin/bash
set -e

echo "Starting Celery Worker..."
exec celery -A warhammer_list_parser worker --loglevel=info