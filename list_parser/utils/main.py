from list_parser.utils.detect_factions import detect_factions
from list_parser.utils.detect_detachment import find_detachment_for_list
from list_parser.utils.detect_datasheets import detect_datasheets

def detect_entities(army_list: str):
    """
    Detect entities from the army list text.
    Returns a list of detected entities with their details.
    """
    possible_faction = detect_factions(army_list)
    possible_detachments = []
    for f in possible_faction:
        det = find_detachment_for_list(army_list, f["faction_id"])
        possible_detachments.append(det)
    best_det = max(possible_detachments, key=lambda d: d["score"]) if possible_detachments else None
    datasheets = detect_datasheets(army_list, [f["faction_id"] for f in possible_faction])
    detected_entities = {
        "factions": possible_faction,
        "detachment": best_det,
        "datasheets": datasheets
    }

    return detected_entities
