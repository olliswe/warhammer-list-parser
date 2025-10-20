from django.core.management.base import BaseCommand
from datasheet_scraper.tasks import full_scrape_task


class Command(BaseCommand):
    help = 'Run complete scraping pipeline asynchronously (factions -> detachments -> datasheets)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sync',
            action='store_true',
            help='Run the task synchronously instead of queuing it',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting full scraping pipeline...'))
        self.stdout.write('This will scrape factions, then detachments, then datasheets in sequence.')

        if options['sync']:
            # Run synchronously for testing/debugging
            result = full_scrape_task.apply()
            self.stdout.write(self.style.SUCCESS(f'Pipeline completed: {result.result}'))
        else:
            # Queue the task
            task = full_scrape_task.delay()
            self.stdout.write(self.style.SUCCESS(f'Pipeline queued with ID: {task.id}'))
            self.stdout.write(f'Monitor progress with: celery -A warhammer_list_parser flower')
            self.stdout.write(f'Or check task status: celery -A warhammer_list_parser inspect active')
            self.stdout.write(self.style.WARNING('Note: This may take a significant amount of time to complete.'))