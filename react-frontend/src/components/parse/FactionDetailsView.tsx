import { FactionDetails } from "@/types";
import Markdown from "react-markdown";

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


      {faction.rules?.length > 0 && (
        <div>
          <h4 className="text-base font-bold mb-2">Faction Rules</h4>
          {faction.rules.map((rule, idx) => (
            <div key={idx} className="mb-4">
              <h5 className="text-sm font-semibold text-gray-600 mb-2">
                {rule.rules_name}
              </h5>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs whitespace-pre-line">
                <Markdown>{rule.rules_content}</Markdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FactionDetailsView;
