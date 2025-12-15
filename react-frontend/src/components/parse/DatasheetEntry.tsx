import EntryItem from "@/components/atoms/EntryItem.tsx";
import {Datasheet} from "@/types";
import useShowDetails from "@/hooks/use-show-details.ts";
import {useAtomValue} from "jotai";
import {parsedDataAtom} from "@/atoms/parse-atoms.ts";
import {useMemo} from "react";

interface DatasheetEntryProps {
  datasheet: Datasheet;
  setIsModalOpen: (isOpen: boolean) => void;
}

const highLightPoints = (text: string) =>  {
    return text.replace(
        /\((\d+)\s*(?:Points?|Pts?)\)/gi,
        '<span class="text-green-600 font-bold">($1 Points)</span>',
    );
}

const findEnhancement = (datasheetEntryText: string, enhancementNames:string[]) => {
    return enhancementNames.find(name => {
        const regex = new RegExp(`\\b${name}\\b`, 'i');
        return regex.test(datasheetEntryText);
    });
}

export default function DatasheetEntry({
  datasheet,
  setIsModalOpen,
}: DatasheetEntryProps) {
  const { showDetails } = useShowDetails({ setIsModalOpen });
  const {detachment} = useAtomValue(parsedDataAtom);
  const htmlString = useMemo(()=>{
    const enhancementNames = detachment[0]?.enhancement_names ?? []
    if (enhancementNames.length > 0) {
        let modifiedEntryText = datasheet.entry_text;
        enhancementNames.forEach((name) => {
            const regex = new RegExp(`\\b${name}\\b`, 'gi');
            modifiedEntryText = modifiedEntryText.replace(
            regex,
            `<span class="text-blue-600 font-bold">${name}</span>`,
            );
        });
        return highLightPoints(modifiedEntryText);
        }
    return highLightPoints(datasheet.entry_text);
  },[detachment, datasheet])



  return (
    <EntryItem
      onClick={() =>
        showDetails({
          type: "datasheet",
          name: datasheet.datasheet_name,
          datasheet_id: datasheet.datasheet_id,
          url: datasheet.url,
          entry_text: datasheet.entry_text,
          enhancement: findEnhancement(datasheet.entry_text, detachment[0]?.enhancement_names || [] )
        })
      }
    >
      <div
        dangerouslySetInnerHTML={{
          __html: htmlString
      }}
      />
    </EntryItem>
  );
}