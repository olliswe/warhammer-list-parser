import re
from typing import Dict, List
from rapidfuzz import process, fuzz

from datasheet_scraper.models import FactionJson
from list_parser.utils.shared_utils import _norm


# Faction name aliases: canonical_name -> list of aliases
FACTION_ALIASES: Dict[str, List[str]] = {
    # Add your aliases here, e.g.:
    "Space Marines": ["Adeptus Astartes"],
}


def _strip_faction_prefix(faction_name: str) -> tuple[str, bool]:
    """Remove codex prefixes and detect if it's a supplement."""
    is_supplement = faction_name.lower().startswith("codex supplement:")
    clean_name = re.sub(r"^codex supplement:\s*", "", faction_name, flags=re.I)
    clean_name = re.sub(r"^codex:\s*", "", clean_name, flags=re.I)
    clean_name = re.sub(r"^index:\s*", "", clean_name, flags=re.I)
    return _norm(clean_name), is_supplement


def load_factions():
    """Load factions from the database into a simplified list."""
    factions = FactionJson.objects.all()
    possible_factions = []
    for faction in factions:
        faction_data = faction.data
        name, is_supplement = _strip_faction_prefix(faction_data["faction"])
        possible_factions.append(
            {
                "faction_name": name,
                "faction_id": faction_data["faction_id"],
                "is_supplement": is_supplement,
            }
        )

    return possible_factions


def expand_factions_with_aliases(factions: list) -> list:
    """Expand faction list to include alias entries that point to canonical factions."""
    expanded = []
    for faction in factions:
        # Add the canonical faction
        expanded.append({**faction, "_search_name": faction["faction_name"]})

        # Add alias entries that point to the same canonical faction
        if faction["faction_name"] in FACTION_ALIASES:
            for alias in FACTION_ALIASES[faction["faction_name"]]:
                expanded.append({**faction, "_search_name": alias})

    return expanded


def detect_factions(army_text: str, threshold: int = 80) -> list:
    """
    Detect faction(s) from army list text.
    - Pass 1: exact phrase matches (word boundaries)
    - Suppress overlaps: if 'Space Marines' and 'Chaos Space Marines' both match, keep the longer name.
    - Pass 2: fuzzy fallback only for factions not already matched.
    Returns sorted list of {faction_name, faction_id, is_supplement, score}.
    """
    text_norm = _norm(army_text)
    text_lc = text_norm.lower()

    possible_factions = load_factions()
    expanded_factions = expand_factions_with_aliases(possible_factions)

    # ----- Pass 1: exact phrase matches with word boundaries
    exact_hits = []
    for faction in expanded_factions:
        fname = _norm(faction["_search_name"])
        fname_lc = re.escape(fname.lower())
        # \b ensures token boundaries; handles multi-word phrases
        if re.search(rf"\b{fname_lc}\b", text_lc):
            exact_hits.append({**faction, "score": 100, "_len": len(fname)})

    # Suppress overlaps: drop any faction whose name is a substring of a longer matched name
    def suppress_overlaps(hits):
        keep = []
        names = [h["faction_name"].lower() for h in hits]
        for h in hits:
            n = h["faction_name"].lower()
            # if any OTHER matched name contains this name (as substring), prefer the longer one
            if any((n != m and n in m) for m in names):
                # only drop if the longer container exists
                continue
            keep.append(h)
        return keep

    exact_hits = suppress_overlaps(exact_hits)

    # If we got any exact hits after suppression, we're done (most precise)
    if exact_hits:
        return sorted(
            exact_hits, key=lambda x: (-x["score"], -x["_len"], x["faction_name"])
        )

    # ----- Pass 2: fuzzy fallback (no exact phrases found)
    results = []
    full_text_list = [text_lc]  # RapidFuzz expects an iterable of choices
    for faction in expanded_factions:
        fname = _norm(faction["_search_name"]).lower()
        match = process.extractOne(fname, full_text_list, scorer=fuzz.partial_ratio)
        if match and match[1] >= threshold:
            results.append({**faction, "score": match[1], "_len": len(fname)})

    # Do the same overlap suppression among fuzzy results
    results = suppress_overlaps(results)
    return sorted(results, key=lambda x: (-x["score"], -x["_len"], x["faction_name"]))
