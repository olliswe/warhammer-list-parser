from django.core.management.base import BaseCommand
from datasheet_scraper.scripts.datasheet_scraper import datasheet_scraper


class Command(BaseCommand):
    help = "Run the detachment scraper to update detachment data"

    def handle(self, *args, **options):
        self.stdout.write("Starting detachment scraper...")
        try:
            datasheet_scraper()
            self.stdout.write(
                self.style.SUCCESS("Successfully completed datasheet scraping")
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"datasheet scraper failed: {str(e)}"))
            import traceback

            self.stdout.write(traceback.format_exc())
            raise
