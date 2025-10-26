import React from "react";
import useSharedListStore from "@/hooks/use-shared-list-store.ts";

const SharedListInfo = () => {
  const sharedListInfo = useSharedListStore((s) => s.sharedListInfo);

  if (!sharedListInfo) return null;

  return (
    <div className="mb-6 bg-blue-50 border border-blue-300 rounded p-3 text-center text-blue-900">
      📤 <strong>Shared Army List</strong> • {sharedListInfo.viewCount} views •
      Created {new Date(sharedListInfo.createdAt).toLocaleDateString()}
    </div>
  );
};

export default SharedListInfo;
