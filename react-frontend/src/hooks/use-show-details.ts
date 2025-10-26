import useDetailsContentStore from "@/hooks/use-details-content-store.ts";
import { EntityDetails } from "@/types";

const useShowDetails = ({
  setIsModalOpen,
}: {
  setIsModalOpen: (input: boolean) => void;
}) => {
  const setDetailsContent = useDetailsContentStore(
    (state) => state.setDetailsContent,
  );

  const showDetails = async (entity: EntityDetails) => {
    if (entity.type === "datasheet" && entity.datasheet_id) {
      try {
        const response = await fetch(`/api/datasheet/${entity.datasheet_id}/`);
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
    } else if (entity.type === "faction" && entity.faction_id) {
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
    } else if (entity.type === "detachment" && entity.detachment_id) {
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
    }

    // Open modal on mobile
    if (window.innerWidth <= 768) {
      setIsModalOpen(true);
    }
  };
  return { showDetails };
};

export default useShowDetails;
