import json
from typing import Dict, List
from list_parser.utils.shared_utils import _norm, FACTIONS_JSON, load_factions_json

from rapidfuzz import fuzz


def get_detachments_for_faction(faction_id: str) -> List[Dict]:
    factions = load_factions_json()
    fac = next((f for f in factions if f.get("faction_id") == faction_id), None)
    if not fac:
        raise ValueError(f"Faction id '{faction_id}' not found in factions json")
    return fac.get("detachments", [])

# ---------- candidate line builder (no filtering) ----------
def _candidate_lines(army_text: str, max_lines: int = 20) -> List[str]:
    """
    Use ALL non-empty normalized lines from the first `max_lines`,
    plus adjacent bigrams (line i + line i+1).
    """
    lines = [_norm(ln) for ln in army_text.splitlines()[:max_lines]]
    cands = [ln for ln in lines if ln]  # keep non-empty
    bigrams = [f"{a} {b}" for a, b in zip(cands, cands[1:])]
    return cands + bigrams

# ---------- main finder ----------
def find_detachment_for_list(
        army_text: str,
        faction_id: str,
        lo: int = 70,
        max_lines: int = 20,
) -> Dict:
    """
    Returns the single best detachment found in the first `max_lines` lines:
    {
      'detachment_id': str|None,
      'detachment_name': str|None,
      'score': int|None,
      'method': 'fuzzy'|'none'
    }
    """
    detachments = get_detachments_for_faction(faction_id)
    if not detachments:
        return {"detachment_id": None, "detachment_name": None, "score": None, "method": "none"}

    names = [_norm(d["detachment_name"]) for d in detachments]
    cands = _candidate_lines(army_text, max_lines=max_lines)
    if not cands:
        return {"detachment_id": None, "detachment_name": None, "score": None, "method": "none"}

    best_idx, best_score = None, -1
    for cand in cands:
        cl = cand.lower()
        for i, det_name in enumerate(names):
            dn = det_name.lower()
            score = max(
                int(fuzz.WRatio(dn, cl)),
                int(fuzz.token_set_ratio(dn, cl)),
                int(fuzz.partial_ratio(dn, cl)),
            )
            if score > best_score:
                best_score = score
                best_idx = i

    if best_idx is not None and best_score >= lo:
        d = detachments[best_idx]
        return {
            "detachment_id": d["detachment_id"],
            "detachment_name": d["detachment_name"],
            "score": int(best_score),
            "method": "fuzzy",
        }

    return {"detachment_id": None, "detachment_name": None, "score": None, "method": "none"}