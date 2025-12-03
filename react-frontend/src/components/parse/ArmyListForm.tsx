import React, { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import Button from "@/components/atoms/Button.tsx";
import { useMediaQuery } from "react-responsive";
import useParseArmyList from "@/hooks/use-parse-army-list.ts";
import { trackEvent } from "@/lib/umami.ts";
import {
  parsedDataAtom,
  listNameAtom,
  armyListAtom,
  loadingAtom,
} from "@/atoms/parse-atoms";

const ArmyListForm = ({}) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [shareLoading, setShareLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const parsedData = useAtomValue(parsedDataAtom);
  const [listName, setListName] = useAtom(listNameAtom);
  const [armyList, setArmyList] = useAtom(armyListAtom);
  const loading = useAtomValue(loadingAtom);

  const { handleParse } = useParseArmyList(() => setIsCollapsed(true));

  const handleShare = async () => {
    if (!parsedData || !listName || !armyList) return;

    setShareLoading(true);

    try {
      const response = await fetch("/api/share/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: listName,
          raw_text: armyList,
          parsed_data: parsedData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await navigator.clipboard.writeText(data.share_url);
        alert("Share link copied to clipboard!");

        // Track successful share
        trackEvent("list_shared", {
          faction: parsedData.factions?.[0]?.faction_name || "unknown",
          unit_count: parsedData.datasheets?.length || 0,
          share_url: data.share_url,
        });
      } else {
        throw new Error(data.error || "Failed to create share link");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to share list";
      alert(`Error sharing list: ${errorMessage}`);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleParse();
      }}
      className="space-y-4"
    >
      <div
        className={`transition-all ${isCollapsed ? "max-h-20 overflow-hidden" : ""}`}
      >
        <label
          htmlFor="armyList"
          className="block mb-2 font-bold text-gray-700"
        >
          Army List Text:
        </label>
        <textarea
          id="armyList"
          value={armyList}
          onChange={(e) => setArmyList(e.target.value)}
          placeholder="Paste your army list here..."
          required
          className={`w-full p-3 border-2 border-gray-300 rounded font-mono text-sm resize-vertical ${
            isCollapsed ? "min-h-[40px]" : "min-h-[200px]"
          }`}
        />
      </div>

      {isCollapsed && (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-4 rounded text-sm border border-gray-300"
        >
          Show Full Text
        </button>
      )}

      <div>
        <label
          htmlFor="listName"
          className="block mb-2 font-bold text-gray-700"
        >
          List Name (optional):
        </label>
        <input
          type="text"
          id="listName"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="Enter a name for this list..."
          className="w-full p-3 border-2 border-gray-300 rounded text-sm"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Parsing..." : isMobile ? "Parse" : "Parse Army List"}
        </Button>
        {parsedData && (
          <Button
            type="button"
            variant="success"
            onClick={handleShare}
            disabled={shareLoading}
          >
            {shareLoading
              ? "Sharing..."
              : isMobile
                ? "📤 Share"
                : "📤 Share List"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default ArmyListForm;
