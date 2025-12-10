import EntryItem from "@/components/atoms/EntryItem.tsx";
import { Detachment } from "@/types";
import useShowDetails from "@/hooks/use-show-details.ts";

interface DetachmentEntryProps {
  detachment: Detachment;
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function DetachmentEntry({
  detachment,
  setIsModalOpen,
}: DetachmentEntryProps) {
  const { showDetails } = useShowDetails({ setIsModalOpen });

  return (
    <EntryItem
      onClick={() =>
        showDetails({
          type: "detachment",
          name: detachment.detachment_name,
          detachment_id: detachment.detachment_id,
          url: detachment.url,
        })
      }
    >
      {detachment.detachment_name}
    </EntryItem>
  );
}