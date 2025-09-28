import time

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
import json
from urllib.parse import urljoin

from datasheet_scraper.models import FactionJson

BASE = "https://39k.pro/"

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
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                         "AppleWebKit/537.36 (KHTML, like Gecko) "
                         "Chrome/123.0.0.0 Safari/537.36")

    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)


def wait_main(driver, timeout=15):
    WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.TAG_NAME, "main"))
    )

def get_faction_links(driver):
    driver.get(BASE)
    # Wait for the nav list of factions to appear
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "#navlinks a[href^='/faction/']"))
    )
    links = driver.find_elements(By.CSS_SELECTOR, "#navlinks a[href^='/faction/']")
    out = []
    for a in links:
        name = a.text.strip()
        href = a.get_attribute("href")
        if not href:
            # fallback to relative href
            href = urljoin(BASE, a.get_attribute("href"))
        out.append((name, href))
    # De-duplicate by href
    seen = set()
    unique = []
    for name, href in out:
        if href not in seen:
            unique.append((name, href))
            seen.add(href)
    return unique

def extract_rules(driver):
    rules = []
    # There can be multiple rule headers; expand each and read the adjacent content container
    headers = driver.find_elements(By.CSS_SELECTOR, ".army_rule_header")
    for h in headers:
        rule_name = h.text.strip()
        # Click the container if possible (handles cases where header itself isn’t clickable)
        try:
            container = h.find_element(By.XPATH, "./ancestor::div[contains(@class,'collapsible_header')]")
        except Exception:
            container = h
        try:
            driver.execute_script("arguments[0].scrollIntoView({block:'center'});", container)
            container.click()
            time.sleep(0.25)  # small pause for animation/render
        except Exception:
            pass

        # The content is the *immediate next sibling* of the collapsible_header
        content_text = ""
        try:
            content_block = container.find_element(By.XPATH, "following-sibling::div[1]")
            # collect all text nodes within, keeping simple line breaks
            parts = []
            for div in content_block.find_elements(By.XPATH, ".//div"):
                t = div.text.strip()
                if t:
                    parts.append(t)
            content_text = "\n".join(parts).strip() or content_block.text.strip()
        except Exception:
            content_text = ""

        rules.append({
            "rules_name": rule_name,
            "rules_content": content_text
        })
    return rules

def extract_list_after_h2(driver, header_text):
    """
    Finds the UL right after an H2 with exact text (normalized) and returns list of (name, id) from <a>.
    """
    items = []
    try:
        h2 = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, f"//h2[normalize-space(text())='{header_text}']"))
        )
        ul = h2.find_element(By.XPATH, "following-sibling::*[self::ul][1]")
        links = ul.find_elements(By.CSS_SELECTOR, "a[href]")
        for a in links:
            name = a.text.strip()
            href = a.get_attribute("href") or a.get_attribute("data-href") or ""
            # If href is relative (e.g., /detachment/ID), keep only the last segment as the ID
            ident = href.strip("/").split("/")[-1] if href else ""
            items.append((name, ident))
    except Exception:
        pass
    return items

def extract_faction(driver, url):
    driver.get(url)
    wait_main(driver)

    # Faction title
    try:
        faction = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "main h1"))
        ).text.strip()
    except Exception:
        faction = ""

    # Faction id from URL
    faction_id = url.rstrip("/").split("/")[-1]

    # Expand & read Rules
    rules = extract_rules(driver)

    # Detachments
    det_pairs = extract_list_after_h2(driver, "Detachments")
    detachments = [{"detachment_name": n, "detachment_id": i} for n, i in det_pairs]

    # Datasheets
    ds_pairs = extract_list_after_h2(driver, "Datasheets")
    datasheets = [{"datasheet_name": n, "datasheet_id": i} for n, i in ds_pairs]

    return {
        "faction": faction,
        "faction_id": faction_id,   # ✅ added
        "rules": rules,
        "detachments": detachments,
        "datasheets": datasheets,
        "url": url
    }

def main():
    time.sleep(1)  # Small delay before starting
    driver = chrome_driver()
    try:
        factions_index = get_faction_links(driver)
        print(f"Found {len(factions_index)} factions...")
        results = []

        for idx, (name, href) in enumerate(factions_index, 1):
            print(f"[{idx}/{len(factions_index)}] Scraping: {name} -> {href}")
            try:
                data = extract_faction(driver, href)
                results.append(data)
            except Exception as e:
                print(f"  !! Error on {href}: {e}")
            # Be polite to the site
            time.sleep(0.4)

        # Save to db
        for faction_data in results:
            print(f"Saving: {faction_data.get('faction')}")
            faction_id = faction_data.get("faction_id")
            faction_name = faction_data.get("faction")
            if not faction_id or not faction_name:
                print(f"  !! Skipping faction with no ID: {faction_data.get('faction')}")
                continue
            try:
                existing_faction = FactionJson.objects.get(faction_id=faction_id)
                # Update existing
                existing_faction.data = json.dumps(faction_data)
                existing_faction.save()
                print(f"  !! Updated existing faction: {faction_name} {faction_id}")
            except Exception as e:
                new_faction = FactionJson(faction_id=faction_id, faction_name=faction_name, data=json.dumps(faction_data))
                new_faction.save()
                print(f"  !! Created new faction: {faction_name} {faction_id}")
    except Exception as e:
        print(f"Fatal error: {e}")


    finally:
        driver.quit()


if __name__ == "__main__":
    main()
