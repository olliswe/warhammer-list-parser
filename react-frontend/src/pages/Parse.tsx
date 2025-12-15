import { useState } from "react";
import { Link } from "react-router-dom";
import { Provider, useAtomValue } from "jotai";
import Card from "@/components/atoms/Card.tsx";
import Modal from "@/components/atoms/Modal.tsx";
import { Datasheet, Detachment, Faction } from "@/types";
import DetailsPanel from "@/components/parse/DetailsPanel.tsx";
import SharedListInfo from "@/components/parse/SharedListInfo.tsx";
import ArmyListForm from "@/components/parse/ArmyListForm.tsx";
import FactionEntry from "@/components/parse/FactionEntry.tsx";
import DetachmentEntry from "@/components/parse/DetachmentEntry.tsx";
import DatasheetEntry from "@/components/parse/DatasheetEntry.tsx";
import useLoadArmyList from "@/hooks/use-load-army-list.ts";
import {
  detailsContentAtom,
  errorAtom,
  parsedDataAtom,
} from "@/atoms/parse-atoms";

export default function Parse() {
  return (
    <Provider>
      <ParseContent />
    </Provider>
  );
}

function ParseContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useLoadArmyList();

  const parsedData = useAtomValue(parsedDataAtom);
  const error = useAtomValue(errorAtom);
  const detailsContent = useAtomValue(detailsContentAtom);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Warhammer Army List Parser
          </h1>

          <div className="text-center mb-6">
            <Link to="/" className="text-blue-600 hover:underline text-sm">
              ← Back to Saved Lists
            </Link>
            {parsedData && (
              <>
                <span className="mx-4" />
                <a
                  href="/parse"
                  className="text-blue-600 hover:underline text-sm"
                >
                  + Parse another list
                </a>
              </>
            )}
          </div>

          <SharedListInfo />
          <ArmyListForm />

          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </Card>

        {parsedData && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-8">
            <div>
              <Card>
                <h2 className="text-2xl font-bold mb-6">Army List</h2>

                <div className="mb-8 pb-6 border-b">
                  <h3 className="text-xl font-bold mb-4">Factions</h3>
                  {parsedData.factions.map((faction: Faction, idx: number) => (
                    <FactionEntry
                      key={idx}
                      faction={faction}
                      setIsModalOpen={setIsModalOpen}
                    />
                  ))}
                </div>

                <div className="mb-8 pb-6 border-b">
                  <h3 className="text-xl font-bold mb-4">Detachment</h3>
                  {parsedData.detachment.map((det: Detachment, idx: number) => (
                    <DetachmentEntry
                      key={idx}
                      detachment={det}
                      setIsModalOpen={setIsModalOpen}
                    />
                  ))}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Units</h3>
                  {parsedData.datasheets.map(
                    (datasheet: Datasheet, idx: number) => (
                      <DatasheetEntry
                        key={idx}
                        datasheet={datasheet}
                        setIsModalOpen={setIsModalOpen}
                      />
                    ),
                  )}
                </div>
              </Card>
            </div>

            <div className="hidden lg:block">
              <Card className="sticky top-8 max-h-[93vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 pb-3 border-b-2 border-blue-600">
                  Details
                </h3>
                {detailsContent ? (
                  <DetailsPanel />
                ) : (
                  <div className="text-center text-gray-600 italic mt-12">
                    Click on an item to view details
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {detailsContent && <DetailsPanel />}
      </Modal>
    </div>
  );
}
