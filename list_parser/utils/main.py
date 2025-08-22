from list_parser.utils.detect_factions import detect_factions
from list_parser.utils.detect_detachment import find_detachment_for_list
from list_parser.utils.detect_datasheets import detect_datasheets

def detect_entities(army_list: str):
    """
    Detect entities from the army list text.
    Returns a list of detected entities with their details.
    """
    possible_faction = detect_factions(army_list)
    possible_detachment = find_detachment_for_list(army_list, possible_faction[0]["faction_id"])
    datasheets = detect_datasheets(army_list, [f["faction_id"] for f in possible_faction])
    detected_entities = {
        "factions": possible_faction,
        "detachment": possible_detachment,
        "datasheets": datasheets
    }

    return detected_entities
