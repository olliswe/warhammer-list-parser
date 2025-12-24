import time
from celery import shared_task
from celery.utils.log import get_task_logger
from django.utils import timezone
from django.core.management import call_command

from datasheet_scraper.models import FactionJson, DetachmentJson, DatasheetJson
from datasheet_scraper.scripts.faction_scraper import scrape_factions
from datasheet_scraper.scripts.detachment_scraper import scrape_detachments
from datasheet_scraper.scripts.datasheet_scraper import scrape_datasheets

logger = get_task_logger(__name__)


@shared_task(bind=True)
def full_scrape_task(self):
    """
    Async task to run complete scraping pipeline (factions -> detachments -> datasheets)
    All data is scraped first, then if successful, old data is deleted and new data is saved.
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
        faction_results = scrape_factions()
        logger.info(f"Scraped {len(faction_results)} factions")

        # Step 2: Scrape detachments
        logger.info("Step 2: Scraping detachments")
        self.update_state(state="PROGRESS", meta={"status": "Scraping detachments"})
        detachment_results = scrape_detachments(faction_results)
        logger.info(f"Scraped {len(detachment_results)} detachments")

        # Step 3: Scrape datasheets
        logger.info("Step 3: Scraping datasheets")
        self.update_state(state="PROGRESS", meta={"status": "Scraping datasheets"})
        datasheet_results = scrape_datasheets(faction_results)
        logger.info(f"Scraped {len(datasheet_results)} datasheets")

        # Step 4: Delete all old data and create new entries
        logger.info("Step 4: Replacing database with new data")
        self.update_state(state="PROGRESS", meta={"status": "Saving to database"})

        # Delete all old entries
        FactionJson.objects.all().delete()
        DetachmentJson.objects.all().delete()
        DatasheetJson.objects.all().delete()
        logger.info("Deleted all old data")

        # Create new faction entries
        for faction_data in faction_results:
            FactionJson.objects.create(
                faction_id=faction_data["faction_id"],
                faction_name=faction_data["faction"],
                data=faction_data,
            )
        logger.info(f"Created {len(faction_results)} faction entries")

        # Create new detachment entries
        for detachment_data in detachment_results:
            DetachmentJson.objects.create(
                detachment_id=detachment_data["detachment_id"],
                detachment_name=detachment_data["detachment_name"],
                faction_id=detachment_data["faction_id"],
                data=detachment_data,
            )
        logger.info(f"Created {len(detachment_results)} detachment entries")

        # Create new datasheet entries
        for datasheet_data in datasheet_results:
            DatasheetJson.objects.create(
                datasheet_id=datasheet_data["datasheet_id"],
                datasheet_name=datasheet_data["datasheet_name"],
                faction_id=datasheet_data["faction_id"],
                data=datasheet_data,
            )
        logger.info(f"Created {len(datasheet_results)} datasheet entries")

        # Clear all Redis cache (entity caches, rate limits, etc.)
        logger.info("Clearing all Redis cache")
        call_command("clear_entity_cache")

        result = {
            "status": "completed",
            "faction_count": len(faction_results),
            "detachment_count": len(detachment_results),
            "datasheet_count": len(datasheet_results),
            "cache_cleared": True,
            "completed_at": timezone.now().isoformat(),
        }

        logger.info(f"Full scraping pipeline completed successfully: {result}")
        return result

    except Exception as e:
        logger.error(f"Full scraping pipeline failed: {str(e)}")
        self.update_state(state="FAILURE", meta={"error": str(e)})
        raise
