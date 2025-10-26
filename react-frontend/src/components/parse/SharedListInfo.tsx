import React from "react";
import { useAtomValue } from "jotai";
import { sharedListInfoAtom } from "@/atoms/parse-atoms";

const SharedListInfo = () => {
  const sharedListInfo = useAtomValue(sharedListInfoAtom);

  if (!sharedListInfo) return null;

  return (
    <div className="mb-6 bg-blue-50 border border-blue-300 rounded p-3 text-center text-blue-900">
      📤 <strong>Shared Army List</strong> • {sharedListInfo.viewCount} views •
      Created {new Date(sharedListInfo.createdAt).toLocaleDateString()}
    </div>
  );
};

export default SharedListInfo;
