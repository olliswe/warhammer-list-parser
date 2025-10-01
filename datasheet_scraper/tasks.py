import time
from celery import shared_task
from celery.utils.log import get_task_logger
from django.utils import timezone
from django.core.management import call_command

from datasheet_scraper.models import FactionJson, DetachmentJson, DatasheetJson

logger = get_task_logger(__name__)


@shared_task(bind=True)
def full_scrape_task(self):
    """
    Async task to run complete scraping pipeline (factions -> detachments -> datasheets)
    """
    logger.info("Starting full scraping pipeline")
    try:
        # Update task state
        self.update_state(
            state="PROGRESS", meta={"status": "Starting full scrape pipeline"}
        )

        # Step 1: Scrape factions
        logger.info("Step 1: Scraping factions")
        self.update_state(state="PROGRESS", meta={"status": "Scraping factions"})
        call_command("run_faction_scraper")

        # Step 2: Scrape detachments
        logger.info("Step 2: Scraping detachments")
        self.update_state(state="PROGRESS", meta={"status": "Scraping detachments"})
        call_command("run_detachment_scraper")

        # Step 3: Scrape datasheets
        logger.info("Step 3: Scraping datasheets")
        self.update_state(state="PROGRESS", meta={"status": "Scraping datasheets"})
        call_command("run_datasheet_scraper")

        # Final counts
        faction_count = FactionJson.objects.count()
        detachment_count = DetachmentJson.objects.count()
        datasheet_count = DatasheetJson.objects.count()

        result = {
            "status": "completed",
            "faction_count": faction_count,
            "detachment_count": detachment_count,
            "datasheet_count": datasheet_count,
            "completed_at": timezone.now().isoformat(),
        }

        logger.info(f"Full scraping pipeline completed successfully: {result}")
        return result

    except Exception as e:
        logger.error(f"Full scraping pipeline failed: {str(e)}")
        self.update_state(state="FAILURE", meta={"error": str(e)})
        raise
