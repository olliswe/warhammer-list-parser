# %pip install rapidfuzz
import re
from typing import List, Dict, Iterable

from rapidfuzz import process, fuzz

from datasheet_scraper.models import FactionJson
from list_parser.utils.shared_utils import _norm


def _strip_count_prefix(name: str) -> str:
    """Remove count prefix like '2x' from unit names."""
    return re.sub(r"^\s*\d+\s*x\s+", "", name, flags=re.IGNORECASE).strip()


def _strip_points_suffix(name: str) -> str:
    """Remove points cost suffix like '(100 Points)' from unit names."""
    return re.sub(
        r"\(\s*\d+\s*(?:pts|points?)\s*\)$", "", name, flags=re.IGNORECASE
    ).strip()


def _header_to_query(header_line: str) -> str:
    """Convert a header line to a clean query string."""
    h = header_line.strip()
    h = _strip_count_prefix(h)
    h = _strip_points_suffix(h)
    return _norm(h)


# ---------- Common regex patterns ----------
POINTS_PAT = re.compile(r"\(\s*(\d+)\s*(pts|points?)\s*\)", re.IGNORECASE)


# ---------- Fuzzy matching utilities ----------
def _combined_best(query: str, choices: List[str], k=12):
    """Combine several scorers; keep the best score per choice index."""
    res = []
    for scorer in (
        fuzz.WRatio,
        fuzz.token_sort_ratio,
        fuzz.token_set_ratio,
        fuzz.partial_ratio,
    ):
        res.extend(process.extract(query, choices, scorer=scorer, limit=k))
    best = {}
    for name, score, idx in res:
        if idx not in best or score > best[idx]["score"]:
            best[idx] = {"name": name, "score": int(score), "idx": idx}
    return sorted(best.values(), key=lambda x: x["score"], reverse=True)[:k]


# ---------- block parsing (no blank-line requirement) ----------
def parse_datasheet_blocks(army_text: str) -> list[dict]:
    """
    Split the army text into blocks where a block starts at any line that contains '(N points|pts)'
    and ends at the next empty line (or next datasheet line).
    Skips lines with >= 1000 points (summary totals).
    Returns: [{"header": <first line>, "entry_text": <full block as-is>}]
    """
    lines = army_text.splitlines()
    blocks = []
    i, n = 0, len(lines)

    while i < n:
        line = lines[i]
        m = POINTS_PAT.search(line or "")
        if m:
            pts = int(m.group(1))
            if pts >= 1000:  # skip "TOTAL ARMY POINTS" and similar
                i += 1
                continue

            start = i
            j = i + 1
            while (
                j < n
                and not POINTS_PAT.search(lines[j] or "")
                and lines[j].strip() != ""
            ):
                j += 1

            block = "\n".join(lines[start:j])
            header = line
            blocks.append({"header": header, "entry_text": block})
            i = j
        else:
            i += 1

    return blocks


# ---------- prefer-your-faction resolver ----------
def resolve_blocks_to_datasheets_prefer(
    blocks: List[Dict],
    catalog_all: List[
        Dict
    ],  # each: {"datasheet_name","datasheet_id","faction_id", ...}
    preferred_faction_ids: Iterable[str],
    hi: int = 92,
    lo: int = 70,
    prefer_bonus: int = 8,  # bias toward preferred factions
    k: int = 12,
) -> List[Dict]:
    """
    For each block:
      - derive a query from the header line
      - fuzzy match against ALL datasheets (all factions)
      - break ties/ambiguity by adding `prefer_bonus` to candidates from preferred factions
      - accept only if RAW score >= lo (use adjusted score only for tie-breaking)
      - return {datasheet_id, datasheet_name, entry_text}
    """
    pref_set = set(preferred_faction_ids or [])
    names = [d["datasheet_name"] for d in catalog_all]
    out = []

    for b in blocks:
        header = b["header"]
        entry_text = b["entry_text"]
        query = _header_to_query(header)

        top = _combined_best(query, names, k=k)
        if not top:
            out.append(
                {
                    "datasheet_id": None,
                    "datasheet_name": query,
                    "entry_text": entry_text,
                }
            )
            continue

        # compute adjusted scores (bonus for preferred factions)
        ranked = []
        for cand in top:
            item = catalog_all[cand["idx"]]
            raw = cand["score"]
            bonus = prefer_bonus if item.get("faction_id") in pref_set else 0
            ranked.append(
                {
                    "raw_score": raw,
                    "adj_score": raw + bonus,
                    "idx": cand["idx"],
                    "item": item,
                }
            )

        # pick the candidate with highest adjusted score (tie-break by raw)
        ranked.sort(key=lambda r: (r["adj_score"], r["raw_score"]), reverse=True)
        best = ranked[0]

        # require a minimum RAW score (not adjusted) to accept
        if best["raw_score"] < lo:
            out.append(
                {
                    "datasheet_id": None,
                    "datasheet_name": query,
                    "entry_text": entry_text,
                }
            )
        else:
            ds = best["item"]
            out.append(
                {
                    "datasheet_id": ds["datasheet_id"],
                    "datasheet_name": ds["datasheet_name"],
                    "entry_text": entry_text,
                }
            )

    return out


# ---------- convenience wrapper ----------
def extract_datasheet_entries_prefer(
    army_text: str,
    catalog_all: List[Dict],  # ALL datasheets across factions
    preferred_faction_ids: Iterable[str],
    hi: int = 92,
    lo: int = 70,
    prefer_bonus: int = 8,
    k: int = 12,
) -> List[Dict]:
    blocks = parse_datasheet_blocks(army_text)
    return resolve_blocks_to_datasheets_prefer(
        blocks,
        catalog_all,
        preferred_faction_ids,
        hi=hi,
        lo=lo,
        prefer_bonus=prefer_bonus,
        k=k,
    )


# ---------- helper to build a master catalog from database ----------
def build_master_catalog() -> List[Dict]:
    """
    Returns a flat list:
      [{"datasheet_name","datasheet_id","faction_id","faction_name","is_supplement"}, ...]
    """
    factions = FactionJson.objects.all()
    master = []
    for faction in factions:
        faction_data = faction.data
        for ds in faction_data.get("datasheets", []):
            master.append(
                {
                    "datasheet_name": ds["datasheet_name"],
                    "datasheet_id": ds["datasheet_id"],
                    "faction_id": faction_data["faction_id"],
                }
            )
    return master


def detect_datasheets(army_list, faction_ids):
    catalog_all = build_master_catalog()

    entries = extract_datasheet_entries_prefer(
        army_text=army_list,
        catalog_all=catalog_all,
        preferred_faction_ids=faction_ids,
        hi=92,
        lo=70,
        prefer_bonus=8,
    )

    return entries
