from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service


def chrome_driver(headless=True):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    # Minimal additional options for stability
    options.add_argument("--disable-web-security")
    options.add_argument("--disable-features=VizDisplayCompositor")
    options.add_argument("--remote-debugging-port=9222")

    # Keep the same user agent as your working version
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    )

    # Use system chromium in Docker, fallback to webdriver manager locally
    import os
    import shutil

    # Check if we're in Docker and chromium is available
    if shutil.which("chromium") and os.path.exists("/usr/bin/chromium"):
        # Use system Chromium with the chromedriver
        service = (
            Service("/usr/bin/chromedriver")
            if os.path.exists("/usr/bin/chromedriver")
            else Service("/usr/bin/chromium-driver")
        )
        options.binary_location = "/usr/bin/chromium"
        # Add extra arguments for Docker environment
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-plugins")
        options.add_argument("--disable-default-apps")
        print("Using system Chromium browser")
    else:
        # Fallback for local development
        os.environ["WDM_CACHE_PATH"] = "/tmp/.wdm"
        service = Service(ChromeDriverManager().install())
        print("Using ChromeDriverManager")

    return webdriver.Chrome(service=service, options=options)


def cleanup_old_data(new_faction_ids, new_detachment_ids, new_datasheet_ids):
    from datasheet_scraper.models import DetachmentJson, DatasheetJson, FactionJson

    factions_to_be_deleted = FactionJson.objects.exclude(faction_id__in=new_faction_ids)
    print(f"Deleting {len(factions_to_be_deleted)} factions")
    factions_to_be_deleted.delete()

    detachment_to_be_deleted = DetachmentJson.objects.exclude(
        detachment_id__in=new_detachment_ids
    )
    print(f"Deleting {len(detachment_to_be_deleted)} detachment")
    detachment_to_be_deleted.delete()

    datasheet_to_be_deleted = DatasheetJson.objects.exclude(
        datasheet_id__in=new_datasheet_ids
    )
    print(f"Deleting {len(datasheet_to_be_deleted)} datasheet")
    datasheet_to_be_deleted.delete()
