#!/bin/bash
set -e

echo "Starting Celery Beat..."
exec celery -A warhammer_list_parser beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler