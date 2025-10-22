import { SavedList, ParsedData } from "@/types";

const STORAGE_KEY = "warhammer_saved_lists";

function generateId(): string {
  return crypto.randomUUID();
}

export function getSavedLists(): SavedList[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const lists = JSON.parse(saved);

    // Migration: add IDs to any lists that don't have them
    let needsMigration = false;
    const migratedLists = lists.map((list: any) => {
      if (!list.id) {
        needsMigration = true;
        return { ...list, id: generateId() };
      }
      return list;
    });

    if (needsMigration) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedLists));
      return migratedLists;
    }

    return lists;
  } catch (error) {
    console.error("Error loading saved lists:", error);
    return [];
  }
}

export function saveList(
  name: string,
  rawText: string,
  parsedData: ParsedData,
): SavedList {
  if (typeof window === "undefined") throw new Error("Not in browser");

  try {
    const savedLists = getSavedLists();

    const existingIndex = savedLists.findIndex((list) => list.name === name);
    let listToSave: SavedList;

    if (existingIndex !== -1) {
      // Update existing list, keep the same ID
      listToSave = {
        ...savedLists[existingIndex],
        name,
        rawText,
        parsedData,
        savedAt: new Date().toISOString(),
      };
      savedLists[existingIndex] = listToSave;
    } else {
      // Create new list with new ID
      listToSave = {
        id: generateId(),
        name,
        rawText,
        parsedData,
        savedAt: new Date().toISOString(),
      };
      savedLists.push(listToSave);

      // Maintain max 15 lists
      if (savedLists.length > 15) {
        savedLists.sort(
          (a, b) =>
            new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime(),
        );
        savedLists.shift();
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLists));
    return listToSave;
  } catch (error) {
    console.error("Error saving list:", error);
    throw error;
  }
}

export function deleteList(name: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const savedLists = getSavedLists();
    const filteredLists = savedLists.filter((list) => list.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLists));
    return true;
  } catch (error) {
    console.error("Error deleting list:", error);
    return false;
  }
}

export function getListByIndex(index: number): SavedList | null {
  const lists = getSavedLists();
  console.log(lists);
  return lists[index] || null;
}

export function getListById(id: string): SavedList | null {
  const lists = getSavedLists();
  return lists.find((list) => list.id === id) || null;
}
