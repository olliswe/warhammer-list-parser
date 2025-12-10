import re, unicodedata
from django.http import JsonResponse



def _norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", s)
    s = s.replace("’", "'").replace("–", "-").replace("—", "-")
    s = re.sub(r"\s+", " ", s).strip()
    return s


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


def sanitized_response(entities):
    """
    Helper function to sanitize response and add URLs
    """
    factions_with_urls = [
        {
            "faction_id": faction["faction_id"],
            "faction_name": faction["faction_name"],
            "is_supplement": faction.get("is_supplement", False),
            "url": faction_id_to_url(faction["faction_id"]),
        }
        for faction in entities.get("factions", [])
    ]
    detachment_with_urls = [
        {
            "detachment_id": entities["detachment"].get("detachment_id"),
            "detachment_name": entities["detachment"].get("detachment_name"),
            "url": detachment_id_to_url(entities["detachment"].get("detachment_id")),
            "enhancement_names": entities["detachment"].get("enhancement_names", []),
        }
    ]
    datasheets_with_urls = [
        {
            "datasheet_id": ds["datasheet_id"],
            "datasheet_name": ds["datasheet_name"],
            "entry_text": ds.get("entry_text", ""),
            "url": datasheet_id_to_url(ds["datasheet_id"]),
        }
        for ds in entities.get("datasheets", [])
    ]
    return {
        "factions": factions_with_urls,
        "detachment": detachment_with_urls,
        "datasheets": datasheets_with_urls,
    }


def ratelimit_error(request, exception):
    """
    Custom error handler for rate limit exceeded errors
    """
    return JsonResponse(
        {"error": "Rate limit exceeded. Please try again later."}, status=429
    )
