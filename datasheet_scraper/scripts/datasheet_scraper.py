import time, traceback, contextlib
from typing import List, Dict, Optional, Tuple, Any

from selenium.common.exceptions import (
    NoSuchElementException,
    TimeoutException,
    StaleElementReferenceException,
    WebDriverException,
    ElementClickInterceptedException,
    ElementNotInteractableException,
)
from tqdm import tqdm  # type: ignore

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datasheet_scraper.utils import chrome_driver

BASE = "https://39k.pro/datasheet/"


EXPECTED_TITLES = [
    "Ranged Weapons",
    "Melee Weapons",
    "Abilities",
    "Leader",
    "Unit Composition",
    "Keywords",
    "Led By",
]


def wait_for(driver, selector, timeout=20):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
    )


# ---------- safe selenium wrappers ----------
def safe_text(el) -> str:
    try:
        t = el.text
        if t:
            return t.strip()
    except Exception:
        pass
    try:
        t = el.get_attribute("innerText") or ""
        return t.strip()
    except Exception:
        return ""


def find_one(parent, by, selector) -> Optional[object]:
    with contextlib.suppress(Exception):
        return parent.find_element(by, selector)
    return None


def find_all(parent, by, selector) -> List[object]:
    with contextlib.suppress(Exception):
        return parent.find_elements(by, selector)
    return []


def js_click(driver, el) -> bool:
    try:
        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
        time.sleep(0.05)
        el.click()
        return True
    except (
        ElementClickInterceptedException,
        ElementNotInteractableException,
        WebDriverException,
    ):
        with contextlib.suppress(Exception):
            driver.execute_script("arguments[0].click();", el)
            return True
    except Exception:
        return False
    return False


def expand_all_collapsibles(driver, card):
    """Aggressively expand all collapsible sections in the datacard"""
    # get all child divs of the class datacard
    child_divs = card.find_elements(By.XPATH, "./div")
    for div in child_divs:
        js_click(driver, div)


def parse_weapons(card, section_class: str):
    parsed = []
    sec = find_one(card, By.CSS_SELECTOR, section_class)
    if not sec:
        return parsed
    for w in find_all(sec, By.CSS_SELECTOR, ".weapon"):
        blocks = find_all(
            w,
            By.XPATH,
            "./div[contains(@class,'weapon_name') or contains(@class,'weapon_characteristics') or contains(@class,'weapon_abilities')]",
        )
        current = None
        for b in blocks:
            cls = b.get_attribute("class") or ""
            if "weapon_name" in cls:
                if current:
                    parsed.append(current)
                current = {"name": safe_text(b), "stats": {}, "abilities": []}
            elif "weapon_characteristics" in cls:
                if current is None:
                    current = {"name": "", "stats": {}, "abilities": []}
                for dv in find_all(b, By.CSS_SELECTOR, "div"):
                    key = (dv.get_attribute("class") or "").strip()
                    val = safe_text(dv)
                    if key:
                        current["stats"][key] = val
            elif "weapon_abilities" in cls:
                if current is None:
                    current = {"name": "", "stats": {}, "abilities": []}
                for a in find_all(b, By.CSS_SELECTOR, ".weapon_ability"):
                    t = safe_text(a)
                    if t:
                        current["abilities"].append(t)
        if current:
            parsed.append(current)
    return parsed


def parse_datasheet_name(card) -> str:
    name_el = find_one(card, By.CSS_SELECTOR, ".name")
    return safe_text(name_el)


def parse_invulnerable_save(card) -> str:
    invuln_el = find_one(card, By.CSS_SELECTOR, ".invulnerable_save")
    return safe_text(invuln_el) if invuln_el else ""


def parse_miniatures(card) -> List[Dict]:
    minis = []
    miniatures = find_one(card, By.CSS_SELECTOR, ".miniature")
    if not miniatures:
        name = parse_datasheet_name(card)
        headers = [
            safe_text(h)
            for h in find_all(card, By.CSS_SELECTOR, ".characteristics_header > div")
        ]
        values = [
            safe_text(v)
            for v in find_all(card, By.CSS_SELECTOR, ".characteristics > div > div")
        ]
        characteristics = dict(zip(headers, values))
        minis.append({"name": name or None, "characteristics": characteristics or None})
    for mini in find_all(card, By.CSS_SELECTOR, ".miniature"):
        mini_name_el = find_one(mini, By.CSS_SELECTOR, ".header")
        mini_name = safe_text(mini_name_el) if mini_name_el else ""
        headers = [
            safe_text(h)
            for h in find_all(mini, By.CSS_SELECTOR, ".characteristics_header > div")
        ]
        values = [
            safe_text(v)
            for v in find_all(mini, By.CSS_SELECTOR, ".characteristics > div > div")
        ]
        characteristics = dict(zip(headers, values))
        minis.append(
            {"name": mini_name or None, "characteristics": characteristics or None}
        )
    return minis


def parse_abilities(card) -> Dict[str, List[Dict]]:
    abilities = []
    sec = find_one(card, By.CSS_SELECTOR, ".abilities")
    if not sec:
        return abilities
    for ab in find_all(sec, By.CSS_SELECTOR, ".ability"):
        ab_name_el = find_one(ab, By.CSS_SELECTOR, ".ability_name")
        ab_rule_el = find_one(ab, By.CSS_SELECTOR, ".ability_rule")
        abilities.append({"name": safe_text(ab_name_el), "rule": safe_text(ab_rule_el)})
    return abilities


def parse_wargear_options(card) -> List[str]:
    options = []
    sec = find_one(card, By.CSS_SELECTOR, ".wargear_rules")
    if not sec:
        return options
    for li in find_all(sec, By.CSS_SELECTOR, "li.wargear_rule"):
        t = safe_text(li)
        if t:
            options.append(t)
    return options


def parse_unit_composition(card) -> Tuple[str, List[Dict]]:
    unit_composition = ""
    composition_table = []
    comp_div = find_one(card, By.CSS_SELECTOR, ".unit_composition .composition")
    if comp_div:
        unit_composition = safe_text(comp_div)
        for row in find_all(comp_div, By.CSS_SELECTOR, "table tbody tr"):
            cols = find_all(row, By.TAG_NAME, "td")
            if len(cols) >= 3:
                composition_table.append(
                    {
                        "model": safe_text(cols[0]),
                        "count": safe_text(cols[1]),
                        "points": safe_text(cols[2]),
                    }
                )
    return unit_composition, composition_table


def parse_led_by(card) -> List[Dict]:
    led_by = []
    led_div = find_one(
        card, By.XPATH, ".//div[.//div[text()='Led By']]/following-sibling::div"
    )
    if led_div:
        for li in find_all(led_div, By.CSS_SELECTOR, "li a"):
            led_by.append(
                {
                    "name": safe_text(li),
                    "id": (li.get_attribute("href") or "").split("/")[-1],
                }
            )
    return led_by


def parse_leader(card):
    leader = []
    leader_div = find_one(
        card,
        By.XPATH,
        ".//div[.//div[contains(@class,'header') and text()='Leader']]/following-sibling::div",
    )

    if leader_div:
        for li in find_all(leader_div, By.CSS_SELECTOR, "li a"):
            leader.append(
                {
                    "name": safe_text(li),
                    "id": (li.get_attribute("href") or "").split("/")[-1],
                }
            )
    return leader


def parse_keywords(card) -> Dict[str, List[str]]:
    keywords = {}
    fk = find_one(card, By.CSS_SELECTOR, ".faction_keywords")
    kw = find_one(card, By.CSS_SELECTOR, ".keywords")
    if fk:
        keywords["faction_keywords"] = [
            k.strip() for k in (safe_text(fk) or "").split(",") if k.strip()
        ]
    if kw:
        keywords["keywords"] = [
            k.strip() for k in (safe_text(kw) or "").split(",") if k.strip()
        ]
    return keywords


def parse_custom_rules(card):
    custom_rules = []
    # get all child divs of the class datacard, that dont have a classname OR have class="rule"
    child_divs = card.find_elements(By.XPATH, "./div[not(@class) or contains(@class, 'rule')]")
    # filter out divs that contain any of the EXPECTED_TITLES
    for div in child_divs:
        title_el = find_one(div, By.CSS_SELECTOR, ".collapsible_header .header")
        title = safe_text(title_el) if title_el else ""
        if title in EXPECTED_TITLES:
            continue
        # get the content from the rule_text div if it exists, otherwise from last child div
        try:
            rule_text_el = find_one(div, By.CSS_SELECTOR, ".rule_text")
            if rule_text_el:
                content = safe_text(rule_text_el)
            else:
                last_child = find_one(div, By.XPATH, "./div[last()]")
                content = safe_text(last_child) if last_child else ""
        except Exception:
            content = ""
        if title:
            custom_rules.append(
                {
                    "title": title,
                    "text": content or None,
                }
            )

    return custom_rules


# ---------- core parsing ----------
def scrape_datasheet_once(driver, url, faction_name, faction_id, datasheet_id) -> Dict:
    driver.get(url)
    wait_for(driver, ".datacard")
    card = driver.find_element(By.CSS_SELECTOR, ".datacard")
    expand_all_collapsibles(driver, card)

    datasheet_name = parse_datasheet_name(card)
    miniatures = parse_miniatures(card)
    invulnerable_save = parse_invulnerable_save(card)
    ranged_weapons = parse_weapons(card, ".weapons_ranged")
    melee_weapons = parse_weapons(card, ".weapons_melee")
    abilities = parse_abilities(card)
    wargear_options = parse_wargear_options(card)
    unit_composition, unit_composition_table = parse_unit_composition(card)
    leader = parse_leader(card)
    led_by = parse_led_by(card)
    keywords = parse_keywords(card)
    custom_rules = parse_custom_rules(card)

    return {
        "faction": faction_name,
        "faction_id": faction_id,
        "datasheet_id": datasheet_id,
        "datasheet_name": datasheet_name,
        "url": url,
        "miniatures": miniatures,
        "invulnerable_save": invulnerable_save,
        "ranged_weapons": ranged_weapons,
        "melee_weapons": melee_weapons,
        "abilities": abilities,
        "wargear_options": wargear_options,
        "unit_composition": unit_composition,
        "unit_composition_table": unit_composition_table,
        "leader": leader,
        "led_by": led_by,
        "keywords": keywords,
        "custom_rules": custom_rules,
    }


def scrape_datasheet_with_retries(
    driver, url, faction_name, faction_id, datasheet_id, retries=3, delay=0.6
):
    last_exc = None
    for attempt in range(1, retries + 1):
        try:
            return scrape_datasheet_once(
                driver, url, faction_name, faction_id, datasheet_id
            )
        except (
            TimeoutException,
            StaleElementReferenceException,
            WebDriverException,
            NoSuchElementException,
        ) as e:
            last_exc = e
            print(
                f"[WARN] Attempt {attempt}/{retries} failed for {datasheet_id}: {e.__class__.__name__}"
            )
            time.sleep(delay)
    if last_exc:
        raise last_exc
    raise RuntimeError("Unknown failure without exception")


# ---------- main fn ----------
def scrape_datasheets(faction_results: List[Dict[str, Any]], headless: bool = True):
    """
    Scrapes all datasheets for the given faction data and returns a list of dicts.
    Does NOT save to database - that's handled by the caller.

    Args:
        faction_results: List of faction dicts from scrape_factions()
        headless: Whether to run browser in headless mode

    Returns:
        List of datasheet dicts
    """
    # Build list of all datasheets with faction context
    all_datasheets = []
    for faction_data in faction_results:
        faction_name = faction_data.get("faction", "")
        faction_id = faction_data.get("faction_id", "")
        datasheets = faction_data.get("datasheets", [])

        for ds in datasheets:
            ds_id = ds.get("datasheet_id")
            ds_name = ds.get("datasheet_name")
            all_datasheets.append({
                "faction_name": faction_name,
                "faction_id": faction_id,
                "datasheet_name": ds_name,
                "datasheet_id": ds_id,
            })

    total = len(all_datasheets)
    if total == 0:
        print("No datasheets found!")
        return []

    processed = 0
    results = []
    bar = tqdm(total=total, desc="Datasheets")
    driver = chrome_driver(headless=headless)

    try:
        for ds_info in all_datasheets:
            ds_name = ds_info["datasheet_name"]
            ds_id = ds_info["datasheet_id"]
            faction_name = ds_info["faction_name"]
            faction_id = ds_info["faction_id"]
            url = BASE + ds_id

            try:
                data = scrape_datasheet_with_retries(
                    driver, url, faction_name, faction_id, ds_id, retries=3
                )
                # Ensure minimum fields are present
                data = data or {}
                data.setdefault("url", url)
                data.setdefault("faction", faction_name)
                data.setdefault("faction_id", faction_id)
                data.setdefault("datasheet_id", ds_id)
                data.setdefault("datasheet_name", ds_name)

                results.append(data)
                print(f"[NEW] Scraped datasheet: {ds_name} ({ds_id})")

            except Exception as e:
                tb = traceback.format_exc(limit=8)
                print(f"[ERROR] {ds_name} ({ds_id}) failed: {e}\n{tb}")

            finally:
                processed += 1
                remaining = total - processed
                print(f"[{processed}/{total}] {ds_name} | Left: {remaining}")
                bar.update(1)

            time.sleep(0.20)  # throttle a bit

    except Exception as e:
        print(f"Fatal error: {e}")
        raise

    finally:
        with contextlib.suppress(Exception):
            driver.quit()
        bar.close()

    print(f"\n=== Successfully scraped {len(results)}/{total} datasheets ===")
    return results
