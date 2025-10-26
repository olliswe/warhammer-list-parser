import { useCallback } from "react";
import { saveList } from "@/lib/storage.ts";
import { ParsedData } from "@/types";
import useArmyListStore from "@/hooks/use-army-list-store.ts";
import useIsCollapsedStore from "@/hooks/use-is-collapsed-store.ts";

const generateAutoName = (data: ParsedData) => {
  if (data.factions && data.factions.length > 0) {
    const mainFaction = data.factions[0].faction_name;
    const now = new Date();
    return `${mainFaction} - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }
  return "Unknown Army List";
};

const useParseArmyList = () => {
  const {
    armyList,
    listName,
    setListName,
    setLoading,
    setError,
    setParsedData,
  } = useArmyListStore();
  const setIsCollapsed = useIsCollapsedStore((state) => state.setIsCollapsed);

  const handleParse = useCallback(
    async (textToParse?: string, nameOverride?: string) => {
      const text = textToParse || armyList;
      if (!text.trim()) return;

      setLoading(true);
      setError("");
      setParsedData(null);

      try {
        const response = await fetch("/api/detect-entities/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ army_list: text }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "An error occurred");
        }

        setParsedData(data);
        setIsCollapsed(true);

        // Auto-save - use nameOverride if provided (from loading existing list)
        const autoName = nameOverride || listName || generateAutoName(data);
        setListName(autoName);
        saveList(autoName, text, data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [armyList, listName],
  );

  return {
    handleParse,
  };
};

export default useParseArmyList;
