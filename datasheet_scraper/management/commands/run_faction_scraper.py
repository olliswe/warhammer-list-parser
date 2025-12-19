from django.core.management.base import BaseCommand
from datasheet_scraper.scripts.faction_scraper import scrape_factions

class Command(BaseCommand):
    help = 'Run the faction scraper to update faction data'

    def handle(self, *args, **options):
        self.stdout.write('Starting faction scraper...')
        try:
            scrape_factions()
            self.stdout.write(
                self.style.SUCCESS('Successfully completed faction scraping')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Faction scraper failed: {str(e)}')
            )
            import traceback
            self.stdout.write(traceback.format_exc())
            raise