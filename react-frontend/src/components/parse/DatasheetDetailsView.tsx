import { DatasheetDetails } from "@/types";
import Badge from "@/components/atoms/Badge.tsx";

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

export default DatasheetDetailsView;
