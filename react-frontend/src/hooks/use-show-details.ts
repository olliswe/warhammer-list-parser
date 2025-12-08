import { useAtomValue, useSetAtom } from "jotai";
import { EntityDetails } from "@/types";
import { parsedDataAtom, detailsContentAtom } from "@/atoms/parse-atoms";

const useShowDetails = ({
  setIsModalOpen,
}: {
  setIsModalOpen: (input: boolean) => void;
}) => {
  const setDetailsContent = useSetAtom(detailsContentAtom);
  const parsedData = useAtomValue(parsedDataAtom);
  const detachmentId = parsedData?.detachment[0]?.detachment_id || "";

  const showDetails = async (entity: EntityDetails) => {
    switch (entity.type) {
      case "datasheet":
        if (!entity.datasheet_id) {
          return;
        }
        try {
          const params = new URLSearchParams({
            detachment_id: detachmentId,
            text: entity.entry_text,
          });
          const response = await fetch(
            `/api/datasheet/${entity.datasheet_id}/?${params}`,
          );
          const data = await response.json();
          if (response.ok) {
            setDetailsContent({ type: "datasheet", data });
          }
        } catch {
          setDetailsContent({
            type: "error",
            message: "Error loading datasheet details",
          });
        }
        break;

      case "faction":
        if (!entity.faction_id) {
          return;
        }
        try {
          const response = await fetch(`/api/faction/${entity.faction_id}/`);
          const data = await response.json();
          if (response.ok) {
            setDetailsContent({ type: "faction", data, url: entity.url });
          }
        } catch {
          setDetailsContent({
            type: "error",
            message: "Error loading faction details",
          });
        }
        break;

      case "detachment":
        if (!entity.detachment_id) {
          return;
        }
        try {
          const response = await fetch(
            `/api/detachment/${entity.detachment_id}/`,
          );
          const data = await response.json();
          if (response.ok) {
            setDetailsContent({ type: "detachment", data, url: entity.url });
          }
        } catch {
          setDetailsContent({
            type: "error",
            message: "Error loading detachment details",
          });
        }
        break;
    }

    // Open modal on mobile
    if (window.innerWidth <= 768) {
      setIsModalOpen(true);
    }
  };
  return { showDetails };
};

export default useShowDetails;
