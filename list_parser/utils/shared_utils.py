import re, unicodedata, json
import os
import json


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("’","'").replace("–","-").replace("—","-")
    s = re.sub(r"\s+", " ", s).strip()
    return s


# directory of this file (likely .../list_parser/utils/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# go up one level to .../list_parser/
APP_DIR = os.path.dirname(BASE_DIR)

# build path into fixtures/
FACTIONS_JSON = os.path.join(APP_DIR, "fixtures", "factions.json")

def load_factions_json(path: str = FACTIONS_JSON):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


BASE_39K_URL = "https://39k.pro/"

def faction_id_to_url(faction_id: str) -> str:
    """
    Convert a faction ID to its URL on 39k.pro.
    """
    return f"{BASE_39K_URL}faction/{faction_id}/"

def datasheet_id_to_url(datasheet_id: str) -> str:
    """
    Convert a datasheet ID to its URL on 39k.pro.
    """
    return f"{BASE_39K_URL}datasheet/{datasheet_id}/"

def detachment_id_to_url(detachment_id: str) -> str:
    """
    Convert a detachment ID to its URL on 39k.pro.
    """
    return f"{BASE_39K_URL}detachment/{detachment_id}/"