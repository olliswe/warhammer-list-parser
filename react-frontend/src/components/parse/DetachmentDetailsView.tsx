import React from "react";
import { DetachmentDetails } from "@/types";

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

export default DetachmentDetailsView;
