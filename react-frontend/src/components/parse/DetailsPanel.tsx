import React from "react";
import { useAtomValue } from "jotai";
import { DatasheetDetails, DetachmentDetails, FactionDetails } from "@/types";
import DetachmentDetailsView from "@/components/parse/DetachmentDetailsView.tsx";
import FactionDetailsView from "@/components/parse/FactionDetailsView.tsx";
import DatasheetDetailsView from "@/components/parse/DatasheetDetailsView.tsx";
import DetailsViewSkeleton from "@/components/parse/DetailsViewSkeleton.tsx";
import { detailsContentAtom, detailsLoadingAtom } from "@/atoms/parse-atoms";

function DetailsPanel() {
  const content = useAtomValue(detailsContentAtom);
  const isLoading = useAtomValue(detailsLoadingAtom);

  if (isLoading) {
    return <DetailsViewSkeleton />;
  }

  if (!content) {
    return null;
  }

  if (content.type === "error") {
    return (
      <div className="text-red-600 text-center mt-12">{content.message}</div>
    );
  }

  if (content.type === "datasheet" && content.data) {
    return (
      <DatasheetDetailsView datasheet={content.data as DatasheetDetails} />
    );
  }

  if (content.type === "faction" && content.data) {
    return (
      <FactionDetailsView
        faction={content.data as FactionDetails}
        url={content.url || ""}
      />
    );
  }

  if (content.type === "detachment" && content.data) {
    return (
      <DetachmentDetailsView
        detachment={content.data as DetachmentDetails}
        url={content.url || ""}
      />
    );
  }

  return null;
}

export default DetailsPanel;
