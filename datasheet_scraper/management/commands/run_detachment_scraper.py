from django.core.management.base import BaseCommand
from datasheet_scraper.scripts.detachment_scraper import run_detachment_scrape

class Command(BaseCommand):
    help = 'Run the detachment scraper to update detachment data'

    def handle(self, *args, **options):
        self.stdout.write('Starting detachment scraper...')
        try:
            run_detachment_scrape()
            self.stdout.write(
                self.style.SUCCESS('Successfully completed detachment scraping')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'detachment scraper failed: {str(e)}')
            )
            import traceback
            self.stdout.write(traceback.format_exc())
            raise