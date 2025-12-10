"""
Django management command to clear all Redis cache (including entity caches and rate limits).

Usage:
    python manage.py clear_entity_cache
"""

from django.core.management.base import BaseCommand
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Clear all Redis cache (entity data, rate limits, etc.)'

    def handle(self, *args, **options):
        try:
            cache.clear()
            self.stdout.write(
                self.style.SUCCESS('Successfully cleared all Redis cache')
            )
            logger.info("Cleared all Redis cache via management command")
        except Exception as e:
            error_msg = f'Error clearing cache: {str(e)}'
            self.stdout.write(self.style.ERROR(error_msg))
            logger.error(error_msg)
            raise