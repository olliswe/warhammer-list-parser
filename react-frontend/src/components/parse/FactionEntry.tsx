import EntryItem from "@/components/atoms/EntryItem.tsx";
import Badge from "@/components/atoms/Badge.tsx";
import { Faction } from "@/types";
import useShowDetails from "@/hooks/use-show-details.ts";

interface FactionEntryProps {
  faction: Faction;
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function FactionEntry({
  faction,
  setIsModalOpen,
}: FactionEntryProps) {
  const { showDetails } = useShowDetails({ setIsModalOpen });

  return (
    <EntryItem
      onClick={() =>
        showDetails({
          type: "faction",
          name: faction.faction_name,
          faction_id: faction.faction_id,
          url: faction.url,
        })
      }
    >
      {faction.faction_name}
      {faction.is_supplement && (
        <>
          {" "}
          <Badge variant="supplement">Supplement</Badge>
        </>
      )}
    </EntryItem>
  );
}