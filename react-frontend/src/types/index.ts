export interface Faction {
  faction_id: string;
  faction_name: string;
  url: string;
  is_supplement: boolean;
}

export interface Detachment {
  detachment_id: string;
  detachment_name: string;
  url: string;
}

export interface Datasheet {
  datasheet_id: string;
  datasheet_name: string;
  entry_text: string;
  url: string;
}

export interface ParsedData {
  factions: Faction[];
  detachment: Detachment[];
  datasheets: Datasheet[];
}

export interface SavedList {
  id: string;
  name: string;
  rawText: string;
  parsedData: ParsedData;
  savedAt: string;
}

export interface DatasheetDetails {
  datasheet_name: string;
  faction: string;
  url: string;
  miniatures: Array<{
    name: string;
    characteristics: {
      M: string;
      T: string;
      SV: string;
      W: string;
      LD: string;
      OC: string;
    };
  }>;
  invulnerable_save?: string;
  ranged_weapons: Array<{
    name: string;
    stats: {
      range: string;
      attacks: string;
      ballistic_skill: string;
      strength: string;
      armour_penetration: string;
      damage: string;
    };
    abilities: string[];
  }>;
  melee_weapons: Array<{
    name: string;
    stats: {
      range: string;
      attacks: string;
      weapon_skill: string;
      strength: string;
      armour_penetration: string;
      damage: string;
    };
    abilities: string[];
  }>;
  abilities: Array<{
    name: string;
    rule: string;
  }>;
  custom_rules: Array<{
    title: string;
    text: string;
  }>;
  keywords: {
    faction_keywords: string[];
    keywords: string[];
  };
  leader: Array<{ name: string }>;
  led_by: Array<{ name: string }>;
  unit_composition_table: Array<{
    model: string;
    count: string;
    points: string;
  }>;
}

export interface FactionDetails {
  faction: string;
  rules: Array<{
    rules_name: string;
    rules_content: string;
  }>;
}

export interface DetachmentDetails {
  detachment_name: string;
  faction_name: string;
  rules: Array<{
    text: string;
  }>;
  enhancements: Array<{
    name: string;
    text: string;
  }>;
  stratagems: Array<{
    name: string;
    text: string;
  }>;
}