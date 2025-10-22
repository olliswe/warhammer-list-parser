import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import EntryItem from "@/components/EntryItem";
import { saveList, getListById } from "@/lib/storage";
import {
  ParsedData,
  Faction,
  Detachment,
  Datasheet,
  DatasheetDetails,
  FactionDetails,
  DetachmentDetails,
} from "@/types";
import { useMediaQuery } from "react-responsive";

interface EntityDetails {
  type: "faction" | "detachment" | "datasheet";
  name: string;
  faction_id?: string;
  detachment_id?: string;
  datasheet_id?: string;
  url?: string;
  entry_text?: string;
}

interface DetailsContent {
  type: "datasheet" | "faction" | "detachment" | "error";
  data?: DatasheetDetails | FactionDetails | DetachmentDetails;
  url?: string;
  message?: string;
}

export default function Parse() {
  const [searchParams] = useSearchParams();
  const { sharedSlug } = useParams();
  const [armyList, setArmyList] = useState("");
  const [listName, setListName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [detailsContent, setDetailsContent] = useState<DetailsContent | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharedListInfo, setSharedListInfo] = useState<{
    viewCount: number;
    createdAt: string;
  } | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const handleParse = useCallback(
    async (textToParse?: string, nameOverride?: string) => {
      const text = textToParse || armyList;
      if (!text.trim()) return;

      setLoading(true);
      setError("");
      setParsedData(null);

      try {
        const response = await fetch("/api/detect-entities/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ army_list: text }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "An error occurred");
        }

        setParsedData(data);
        setIsCollapsed(true);

        // Auto-save - use nameOverride if provided (from loading existing list)
        const autoName = nameOverride || listName || generateAutoName(data);
        setListName(autoName);
        saveList(autoName, text, data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [armyList, listName],
  );

  useEffect(() => {
    const loadSharedList = async (slug: string) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/shared/${slug}/`);
        const data = await response.json();

        if (response.ok) {
          const sharedName = data.name + " (Shared)";
          setArmyList(data.raw_text);
          setListName(sharedName);
          setSharedListInfo({
            viewCount: data.view_count,
            createdAt: data.created_at,
          });
          handleParse(data.raw_text, sharedName);
        } else {
          setError(data.error || "Failed to load shared list");
        }
      } catch (err) {
        setError("Failed to load shared list");
      } finally {
        setLoading(false);
      }
    };

    if (sharedSlug) {
      loadSharedList(sharedSlug);
    } else {
      const listId = searchParams.get("listId");
      if (listId) {
        const savedList = getListById(listId);

        if (savedList) {
          setArmyList(savedList.rawText);
          setListName(savedList.name);
          handleParse(savedList.rawText, savedList.name);
        }
      }
    }
  }, []);

  const generateAutoName = (data: ParsedData) => {
    if (data.factions && data.factions.length > 0) {
      const mainFaction = data.factions[0].faction_name;
      const now = new Date();
      return `${mainFaction} - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }
    return "Unknown Army List";
  };

  const handleShare = async () => {
    if (!parsedData || !listName || !armyList) return;

    setShareLoading(true);

    try {
      const response = await fetch("/api/share/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: listName,
          raw_text: armyList,
          parsed_data: parsedData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await navigator.clipboard.writeText(data.share_url);
        alert("Share link copied to clipboard!");
      } else {
        throw new Error(data.error || "Failed to create share link");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to share list";
      alert(`Error sharing list: ${errorMessage}`);
    } finally {
      setShareLoading(false);
    }
  };

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
          </div>

          {sharedListInfo && (
            <div className="mb-6 bg-blue-50 border border-blue-300 rounded p-3 text-center text-blue-900">
              📤 <strong>Shared Army List</strong> • {sharedListInfo.viewCount}{" "}
              views • Created{" "}
              {new Date(sharedListInfo.createdAt).toLocaleDateString()}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleParse();
            }}
            className="space-y-4"
          >
            <div
              className={`transition-all ${isCollapsed ? "max-h-20 overflow-hidden" : ""}`}
            >
              <label
                htmlFor="armyList"
                className="block mb-2 font-bold text-gray-700"
              >
                Army List Text:
              </label>
              <textarea
                id="armyList"
                value={armyList}
                onChange={(e) => setArmyList(e.target.value)}
                placeholder="Paste your army list here..."
                required
                className={`w-full p-3 border-2 border-gray-300 rounded font-mono text-sm resize-vertical ${
                  isCollapsed ? "min-h-[40px]" : "min-h-[200px]"
                }`}
              />
            </div>

            {isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-4 rounded text-sm border border-gray-300"
              >
                Show Full Text
              </button>
            )}

            <div>
              <label
                htmlFor="listName"
                className="block mb-2 font-bold text-gray-700"
              >
                List Name (optional):
              </label>
              <input
                type="text"
                id="listName"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Enter a name for this list..."
                className="w-full p-3 border-2 border-gray-300 rounded text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Parsing..."
                  : isMobile
                    ? "Parse"
                    : "Parse Army List"}
              </Button>
              {parsedData && (
                <Button
                  type="button"
                  variant="success"
                  onClick={handleShare}
                  disabled={shareLoading}
                >
                  {shareLoading
                    ? "Sharing..."
                    : isMobile
                      ? "📤 Share"
                      : "📤 Share List"}
                </Button>
              )}
            </div>
          </form>

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
                    <EntryItem
                      key={idx}
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
                  ))}
                </div>

                <div className="mb-8 pb-6 border-b">
                  <h3 className="text-xl font-bold mb-4">Detachment</h3>
                  {parsedData.detachment.map((det: Detachment, idx: number) => (
                    <EntryItem
                      key={idx}
                      onClick={() =>
                        showDetails({
                          type: "detachment",
                          name: det.detachment_name,
                          detachment_id: det.detachment_id,
                          url: det.url,
                        })
                      }
                    >
                      {det.detachment_name}
                    </EntryItem>
                  ))}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Units</h3>
                  {parsedData.datasheets.map(
                    (datasheet: Datasheet, idx: number) => (
                      <EntryItem
                        key={idx}
                        onClick={() =>
                          showDetails({
                            type: "datasheet",
                            name: datasheet.datasheet_name,
                            datasheet_id: datasheet.datasheet_id,
                            url: datasheet.url,
                            entry_text: datasheet.entry_text,
                          })
                        }
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: datasheet.entry_text.replace(
                              /\((\d+)\s*Points?\)/gi,
                              '<span class="text-green-600 font-bold">($1 Points)</span>',
                            ),
                          }}
                        />
                      </EntryItem>
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
                  <DetailsPanel content={detailsContent} />
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
        {detailsContent && <DetailsPanel content={detailsContent} />}
      </Modal>
    </div>
  );
}

function DetailsPanel({ content }: { content: DetailsContent }) {
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

function DatasheetDetailsView({ datasheet }: { datasheet: DatasheetDetails }) {
  return (
    <div>
      {datasheet.url && (
        <div className="mb-5 pb-4 border-b">
          <a
            href={datasheet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
          >
            View on 39K Pro →
          </a>
        </div>
      )}

      <div className="mb-5">
        <h4 className="text-lg font-bold mb-2">{datasheet.datasheet_name}</h4>
        <p>
          <strong>Faction:</strong> {datasheet.faction}
        </p>
      </div>

      {datasheet.miniatures && datasheet.miniatures.length > 0 && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Characteristics</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Model</th>
                  <th className="border border-gray-300 p-2">M</th>
                  <th className="border border-gray-300 p-2">T</th>
                  <th className="border border-gray-300 p-2">SV</th>
                  <th className="border border-gray-300 p-2">W</th>
                  <th className="border border-gray-300 p-2">LD</th>
                  <th className="border border-gray-300 p-2">OC</th>
                </tr>
              </thead>
              <tbody>
                {datasheet.miniatures.map((mini, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 p-2 text-left font-medium">
                      {mini.name}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {mini.characteristics.M}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {mini.characteristics.T}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {mini.characteristics.SV}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {mini.characteristics.W}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {mini.characteristics.LD}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {mini.characteristics.OC}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {datasheet.invulnerable_save && (
            <p className="mt-2 font-medium">{datasheet.invulnerable_save}</p>
          )}
        </div>
      )}

      {(datasheet.ranged_weapons?.length > 0 ||
        datasheet.melee_weapons?.length > 0) && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Weapons</h4>

          {datasheet.ranged_weapons?.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-600 mb-2">
                Ranged Weapons
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-1">Weapon</th>
                      <th className="border border-gray-300 p-1">Range</th>
                      <th className="border border-gray-300 p-1">A</th>
                      <th className="border border-gray-300 p-1">BS</th>
                      <th className="border border-gray-300 p-1">S</th>
                      <th className="border border-gray-300 p-1">AP</th>
                      <th className="border border-gray-300 p-1">D</th>
                      <th className="border border-gray-300 p-1">Abilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasheet.ranged_weapons.map((weapon, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 p-1">
                          {weapon.name?.replace("🠶", "•")}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.range}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.attacks}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.ballistic_skill}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.strength}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.armour_penetration}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.damage}
                        </td>
                        <td className="border border-gray-300 p-1 text-[10px]">
                          {weapon.abilities?.join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {datasheet.melee_weapons?.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-600 mb-2">
                Melee Weapons
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-1">Weapon</th>
                      <th className="border border-gray-300 p-1">Range</th>
                      <th className="border border-gray-300 p-1">A</th>
                      <th className="border border-gray-300 p-1">WS</th>
                      <th className="border border-gray-300 p-1">S</th>
                      <th className="border border-gray-300 p-1">AP</th>
                      <th className="border border-gray-300 p-1">D</th>
                      <th className="border border-gray-300 p-1">Abilities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasheet.melee_weapons.map((weapon, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 p-1">
                          {weapon.name?.replace("🠶", "•")}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.range}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.attacks}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.weapon_skill}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.strength}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.armour_penetration}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {weapon.stats.damage}
                        </td>
                        <td className="border border-gray-300 p-1 text-[10px]">
                          {weapon.abilities?.join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {datasheet.abilities?.length > 0 && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Abilities</h4>
          {datasheet.abilities.map((ability, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-3 rounded mb-2 font-mono text-xs"
            >
              <strong>{ability.name}</strong> {ability.rule}
            </div>
          ))}
        </div>
      )}

      {datasheet.keywords && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Keywords</h4>
          {datasheet.keywords.faction_keywords?.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-600 mb-1">
                Faction Keywords
              </h5>
              <div className="flex flex-wrap gap-1">
                {datasheet.keywords.faction_keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="faction">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {datasheet.keywords.keywords?.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-600 mb-1">
                Keywords
              </h5>
              <div className="flex flex-wrap gap-1">
                {datasheet.keywords.keywords.map((keyword, idx) => (
                  <Badge key={idx}>{keyword}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FactionDetailsView({
  faction,
  url,
}: {
  faction: FactionDetails;
  url: string;
}) {
  return (
    <div>
      {url && (
        <div className="mb-5 pb-4 border-b">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
          >
            View on 39K Pro →
          </a>
        </div>
      )}

      <h4 className="text-lg font-bold mb-4">{faction.faction}</h4>

      {faction.rules?.length > 0 && (
        <div>
          <h4 className="text-base font-bold mb-2">Faction Rules</h4>
          {faction.rules.map((rule, idx) => (
            <div key={idx} className="mb-4">
              <h5 className="text-sm font-semibold text-gray-600 mb-2">
                {rule.rules_name}
              </h5>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs whitespace-pre-line">
                {rule.rules_content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetachmentDetailsView({
  detachment,
  url,
}: {
  detachment: DetachmentDetails;
  url: string;
}) {
  return (
    <div>
      {url && (
        <div className="mb-5 pb-4 border-b">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
          >
            View on 39K Pro →
          </a>
        </div>
      )}

      <div className="mb-5">
        <h4 className="text-lg font-bold mb-2">{detachment.detachment_name}</h4>
        <p>
          <strong>Faction:</strong> {detachment.faction_name}
        </p>
      </div>

      {detachment.rules?.length > 0 && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Detachment Rules</h4>
          {detachment.rules.map((rule, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-3 rounded mb-2 font-mono text-xs"
            >
              {rule.text}
            </div>
          ))}
        </div>
      )}

      {detachment.enhancements?.length > 0 && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Enhancements</h4>
          {detachment.enhancements.map((enhancement, idx) => (
            <div key={idx} className="mb-3">
              <h5 className="text-sm font-semibold text-gray-600 mb-1">
                {enhancement.name}
              </h5>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs whitespace-pre-line">
                {enhancement.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {detachment.stratagems?.length > 0 && (
        <div>
          <h4 className="text-base font-bold mb-2">Stratagems</h4>
          {detachment.stratagems.map((stratagem, idx) => (
            <div key={idx} className="mb-3">
              <h5 className="text-sm font-semibold text-gray-600 mb-1">
                {stratagem.name}
              </h5>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs whitespace-pre-line">
                {stratagem.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
