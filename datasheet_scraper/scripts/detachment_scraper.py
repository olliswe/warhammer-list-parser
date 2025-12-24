import time
from typing import Any, Dict, List


from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datasheet_scraper.utils import chrome_driver

BASE = "https://39k.pro"
DETACHMENT_URL = BASE + "/detachment/{}"


# ---------------- Scraping utils ----------------
def _inner_text(el) -> str:
    try:
        return el.text.strip()
    except Exception:
        return ""


def _click_all_collapsibles(driver):
    """
    Try to expand everything once to help lazy-rendered content appear.
    """
    selectors = [
        ".enhancements .collapsible_header",
        ".stratagems .collapsible_header",
        ".collapsible_header",
    ]
    for sel in selectors:
        try:
            headers = driver.find_elements(By.CSS_SELECTOR, sel)
            for h in headers:
                try:
                    driver.execute_script(
                        "arguments[0].scrollIntoView({block:'center'});", h
                    )
                    h.click()
                    time.sleep(0.12)
                except Exception:
                    pass
        except Exception:
            pass


def _parse_rules(driver) -> List[Dict[str, str]]:
    """
    Rules appear as multiple <div class="rule"> blocks under <h2>Rules</h2>.
    We capture their text in order and deduplicate identical repeats.
    """
    items = []
    try:
        rule_divs = driver.find_elements(By.CSS_SELECTOR, "main .rule")
        for div in rule_divs:
            txt = _inner_text(div)
            if txt:
                items.append({"text": txt})
    except Exception:
        pass

    deduped, seen = [], set()
    for r in items:
        key = r["text"]
        if key not in seen:
            seen.add(key)
            deduped.append(r)
    return deduped


def _expand_and_get(driver, item, header_sel, body_sel, wait_seconds=2) -> str:
    """
    Click item's header, wait for the body selector to be present *inside that item*,
    then return concatenated body text (some pages split content across multiple blocks).
    """
    try:
        hdr = item.find_element(By.CSS_SELECTOR, header_sel)
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", hdr)
        hdr.click()
    except Exception:
        pass

    # wait for at least one body element
    try:
        WebDriverWait(item, wait_seconds).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, body_sel))
        )
    except Exception:
        # if it never appears, we’ll attempt a fallback below
        pass

    parts = []
    try:
        bodies = item.find_elements(By.CSS_SELECTOR, body_sel)
        for b in bodies:
            t = _inner_text(b)
            if t:
                parts.append(t)
    except Exception:
        pass
    return "\n\n".join(parts).strip()


def parse_enhancements(driver) -> List[Dict[str, str]]:
    """
    Enhancements:
      container: main .enhancements
      item:      .enhancement
      name:      .enhancement_name
      body:      .enhancement_rule  (visible after expanding header)
    """
    out = []
    try:
        container = driver.find_element(By.CSS_SELECTOR, "main .enhancements")
    except Exception:
        return out

    items = container.find_elements(By.CSS_SELECTOR, ".enhancement")
    for it in items:
        try:
            name = it.find_element(By.CSS_SELECTOR, ".enhancement_name").text.strip()
        except Exception:
            name = ""

        text = _expand_and_get(
            driver,
            item=it,
            header_sel=".collapsible_header",
            body_sel=".enhancement_rule",
            wait_seconds=3,
        )

        # fallback: if still empty, try item.text minus the name prefix
        if not text:
            full = _inner_text(it)
            if name and full.startswith(name):
                text = full[len(name) :].strip()

        if name or text:
            # Optional: normalize "Cost: 20" etc. (keep raw by default)
            out.append({"name": name, "text": text})
    return out


def parse_stratagems(driver) -> List[Dict[str, str]]:
    """
    Stratagems:
      container: main .stratagems
      item:      .stratagem
      name:      .stratagem_name
      body:      .stratagem_rules (visible after expanding header)
    """
    out = []
    try:
        container = driver.find_element(By.CSS_SELECTOR, "main .stratagems")
    except Exception:
        return out

    items = container.find_elements(By.CSS_SELECTOR, ".stratagem")
    for it in items:
        try:
            name = it.find_element(By.CSS_SELECTOR, ".stratagem_name").text.strip()
        except Exception:
            name = ""

        text = _expand_and_get(
            driver,
            item=it,
            header_sel=".collapsible_header",
            body_sel=".stratagem_rules",
            wait_seconds=3,
        )

        if not text:
            full = _inner_text(it)
            if name and full.startswith(name):
                text = full[len(name) :].strip()

        if name or text:
            out.append({"name": name, "text": text})
    return out


# ---------------- Single-page scrape ----------------
def scrape_detachment(driver, detachment_id: str) -> Dict[str, Any]:
    """
    Visit a detachment page and scrape: title, Rules, Enhancements, Stratagems.
    """
    url = DETACHMENT_URL.format(detachment_id)
    driver.get(url)

    # Wait for title
    try:
        h1 = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "main h1"))
        )
        detachment_name = h1.text.strip()
    except Exception:
        detachment_name = ""

    # Expand collapsibles to help lazy content render
    _click_all_collapsibles(driver)

    rules = _parse_rules(driver)
    enhancements = parse_enhancements(driver)
    stratagems = parse_stratagems(driver)

    return {
        "detachment_name": detachment_name,
        "detachment_id": detachment_id,
        "url": url,
        "rules": rules,
        "enhancements": enhancements,
        "stratagems": stratagems,
    }


# ---------------- Orchestrator ----------------
def scrape_detachments(faction_results: List[Dict[str, Any]], headless: bool = True):
    """
    Scrapes all detachments for the given faction data and returns a list of dicts.
    Does NOT save to database - that's handled by the caller.

    Args:
        faction_results: List of faction dicts from scrape_factions()
        headless: Whether to run browser in headless mode

    Returns:
        List of detachment dicts
    """
    # Prepare list of all detachments with faction context
    all_detachments = []
    for faction_data in faction_results:
        raw_name = faction_data.get("faction", "")
        # strip common prefixes for a clean stored name
        clean_name = raw_name
        for prefix in ("Codex Supplement: ", "Codex: ", "Index: "):
            if clean_name.lower().startswith(prefix.lower()):
                clean_name = clean_name[len(prefix) :]
        clean_name = clean_name.strip()

        for d in faction_data.get("detachments", []):
            all_detachments.append(
                {
                    "faction_name": clean_name,
                    "faction_id": faction_data["faction_id"],
                    "detachment_name": d["detachment_name"],
                    "detachment_id": d["detachment_id"],
                }
            )

    total = len(all_detachments)
    if total == 0:
        print("No detachments found!")
        return []

    driver = chrome_driver(headless=headless)
    results = []

    try:
        processed = 0
        for det in all_detachments:
            det_id = det["detachment_id"]

            try:
                data = scrape_detachment(driver, det_id)
                record_data = {
                    "faction_name": det["faction_name"],
                    "faction_id": det["faction_id"],
                    "detachment_name": data["detachment_name"] or det["detachment_name"],
                    "detachment_id": det_id,
                    "url": data["url"],
                    "rules": data["rules"],
                    "enhancements": data["enhancements"],
                    "stratagems": data["stratagems"],
                }
                results.append(record_data)

                processed += 1
                remaining = total - processed
                print(
                    f"[{processed}/{total}] Scraped {record_data['detachment_name']} ({det_id}) — remaining: {remaining}"
                )

            except Exception as e:
                processed += 1
                remaining = total - processed
                print(
                    f"[{processed}/{total}] ERROR {det['detachment_name']} ({det_id}) — {e} — remaining: {remaining}"
                )

    except Exception as e:
        print(f"Fatal error: {e}")
        raise

    finally:
        driver.quit()

    print(f"\nSuccessfully scraped {len(results)} detachments")
    return results
