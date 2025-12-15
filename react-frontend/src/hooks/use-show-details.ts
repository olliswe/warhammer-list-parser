import {useAtomValue, useSetAtom} from "jotai";
import {EntityDetails} from "@/types";
import {detailsContentAtom, detailsLoadingAtom, parsedDataAtom} from "@/atoms/parse-atoms";

const fetchDataSheet =  ({datasheetId, params, hasEnhancements}: {datasheetId: string, params: URLSearchParams, hasEnhancements: boolean}) => {
    if (hasEnhancements) {
      return  fetch(
          `/api/datasheet-with-enhancement/${datasheetId}/?${params}`,
      );
    }
    return fetch(
        `/api/datasheet/${datasheetId}/`,
    );
}

const useShowDetails = ({
  setIsModalOpen,
}: {
  setIsModalOpen: (input: boolean) => void;
}) => {
  const setDetailsContent = useSetAtom(detailsContentAtom);
  const setDetailsLoading = useSetAtom(detailsLoadingAtom);
  const parsedData = useAtomValue(parsedDataAtom);
  const detachmentId = parsedData?.detachment[0]?.detachment_id || "";

  const showDetails = async (entity: EntityDetails) => {
    setDetailsLoading(true);
    // Open modal on mobile
    if (window.innerWidth <= 768) {
      setIsModalOpen(true);
    }

    switch (entity.type) {
      case "datasheet":
        if (!entity.datasheet_id) {
          return;
        }
        try {
          const params = new URLSearchParams({
            enhancement: entity.enhancement || "",
            detachment_id: detachmentId,
          });
          const response = await fetchDataSheet({datasheetId: entity.datasheet_id, params, hasEnhancements: !!entity.enhancement});
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

    setDetailsLoading(false);
  };
  return { showDetails };
};

export default useShowDetails;
