import { DatasheetDetails } from "@/types";
import Badge from "@/components/atoms/Badge.tsx";
import Markdown from "react-markdown";

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

      {datasheet.enhancement && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Enhancement</h4>
          <div className="bg-gray-50 p-3 rounded mb-2 font-mono text-xs">
            <Markdown>
              {`**${datasheet.enhancement.name}:** ${datasheet.enhancement.text}`}
            </Markdown>
          </div>
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
              <Markdown>{`**${ability.name}** ${ability.rule}`}</Markdown>
            </div>
          ))}
        </div>
      )}

      {datasheet.custom_rules?.length > 0 && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Other Rules</h4>
          {datasheet.custom_rules.map((rule, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-3 rounded mb-2 font-mono text-xs"
            >
              <Markdown>{`**${rule.title}:** ${rule.text}`}</Markdown>
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

      {(datasheet.unit_composition ||
        datasheet.unit_composition_table?.length > 0) && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Unit Composition</h4>
          {datasheet.unit_composition && (
            <div className="bg-gray-50 p-3 rounded mb-3 text-xs">
              <Markdown>
                {datasheet.unit_composition.split("Model Name")?.[0]}
              </Markdown>
            </div>
          )}
          {datasheet.unit_composition_table?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Model</th>
                    <th className="border border-gray-300 p-2">Count</th>
                    <th className="border border-gray-300 p-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {[...datasheet.unit_composition_table]
                    .sort((a, b) => parseInt(a.points) - parseInt(b.points))
                    .map((composition, idx) => {
                      const models = composition.model.split("\n");
                      const counts = composition.count.split("\n");
                      const bgColor = idx % 2 === 0 ? "bg-white" : "bg-gray-50";

                      return models.map((model, i) => (
                        <tr key={`${idx}-${i}`} className={bgColor}>
                          <td className="border border-gray-300 p-2">
                            {model}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {counts[i] || ""}
                          </td>
                          {i === 0 && (
                            <td
                              className="border border-gray-300 p-2 text-center font-bold"
                              rowSpan={models.length}
                            >
                              {composition.points}
                            </td>
                          )}
                        </tr>
                      ));
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {datasheet.wargear_options?.length > 0 && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Wargear Options</h4>
          <div className="bg-gray-50 p-3 rounded">
            {datasheet.wargear_options.map((option, idx) => (
              <div key={idx} className="mb-2 font-mono text-xs">
                {option}
              </div>
            ))}
          </div>
        </div>
      )}

      {(datasheet.leader?.length > 0 || datasheet.led_by?.length > 0) && (
        <div className="mb-5">
          <h4 className="text-base font-bold mb-2">Leader Info</h4>
          {datasheet.leader?.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-600 mb-1">
                This unit can lead:
              </h5>
              <ul className="list-disc list-inside text-sm">
                {datasheet.leader.map((unit, idx) => (
                  <li key={idx}>{unit.name}</li>
                ))}
              </ul>
            </div>
          )}
          {datasheet.led_by?.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-600 mb-1">
                This unit can be led by:
              </h5>
              <ul className="list-disc list-inside text-sm">
                {datasheet.led_by.map((unit, idx) => (
                  <li key={idx}>{unit.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DatasheetDetailsView;
