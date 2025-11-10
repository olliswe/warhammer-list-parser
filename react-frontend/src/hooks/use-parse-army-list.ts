import { useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import { saveList } from "@/lib/storage.ts";
import { trackEvent } from "@/lib/umami.ts";
import { ParsedData } from "@/types";
import {
  armyListAtom,
  listNameAtom,
  loadingAtom,
  errorAtom,
  parsedDataAtom,
} from "@/atoms/parse-atoms";

const generateAutoName = (data: ParsedData) => {
  if (data.factions && data.factions.length > 0) {
    const mainFaction = data.factions[0].faction_name;
    const now = new Date();
    return `${mainFaction} - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }
  return "Unknown Army List";
};

const useParseArmyList = (onSuccess?: () => void) => {
  const armyList = useAtomValue(armyListAtom);
  const [listName, setListName] = useAtom(listNameAtom);
  const [, setLoading] = useAtom(loadingAtom);
  const [, setError] = useAtom(errorAtom);
  const [, setParsedData] = useAtom(parsedDataAtom);

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
        onSuccess?.();

        // Auto-save - use nameOverride if provided (from loading existing list)
        const autoName = nameOverride || listName || generateAutoName(data);
        setListName(autoName);
        saveList(autoName, text, data);

        // Track successful parse
        trackEvent("list_parsed", {
          faction: data.factions?.[0]?.faction_name || "unknown",
          detachment: data.detachment?.[0]?.detachment_name || "unknown",
          unit_count: data.datasheets?.length || 0,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      armyList,
      listName,
      onSuccess,
      setLoading,
      setError,
      setParsedData,
      setListName,
    ],
  );

  return {
    handleParse,
  };
};

export default useParseArmyList;
