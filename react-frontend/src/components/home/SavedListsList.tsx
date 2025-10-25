import React, { useMemo } from "react";
import { SavedList } from "@/types";
import { Link } from "react-router-dom";
import Button from "@/components/atoms/Button.tsx";

const SavedListsList: React.FC<{
  savedLists: SavedList[];
  handleDelete: (name: string) => void;
  handleRename: (oldName: string) => void;
}> = ({ savedLists, handleDelete, handleRename }) => {
  const savedListsWithPreview = useMemo(
    () =>
      savedLists.map((list) => {
        const lines = list.rawText
          .split("\n")
          .filter((line) => line.trim() !== "");
        const previewLines = lines.slice(0, 6).join("\n");
        const truncatedPreview =
          previewLines.length > 200
            ? previewLines.substring(0, 200) + "..."
            : previewLines;
        return { ...list, preview: truncatedPreview, lines };
      }),
    [],
  );
  return savedListsWithPreview.map((list) => (
    <div
      key={list.id}
      className="bg-gray-50 border border-gray-200 rounded-lg p-5 transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div className="text-lg font-bold text-gray-900 mb-3">{list.name}</div>

      <div className="bg-white p-3 rounded border-l-4 border-blue-600 mb-4 font-mono text-xs text-gray-600 max-h-32 overflow-hidden relative">
        {list.preview}
        <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-600 mb-4">
        <span>Saved: {new Date(list.savedAt).toLocaleDateString()}</span>
        <span>{list.lines.length} lines</span>
      </div>

      <div className="flex flex-col gap-2">
        <Link to={`/parse?listId=${list.id}`}>
          <Button size="small" className="w-full">
            Open & Parse
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            size="small"
            variant="secondary"
            className="flex-1"
            onClick={() => handleRename(list.name)}
          >
            Rename
          </Button>
          <Button
            size="small"
            variant="danger"
            className="flex-1"
            onClick={() => handleDelete(list.name)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  ));
};

export default SavedListsList;
