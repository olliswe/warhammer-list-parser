import React, { useState, useEffect } from "react";
import Button from "./Button";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    setCopyError(false);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback: select the text for manual copy
        const input = document.getElementById(
          "share-url-input"
        ) as HTMLInputElement;
        if (input) {
          input.select();
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          setCopyError(true);
        }
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Share Your List</h2>

          <p className="text-gray-600">
            Your army list has been saved! Share this link with others:
          </p>

          <div className="flex gap-2 items-center">
            <input
              id="share-url-input"
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-3 border-2 border-gray-300 rounded text-sm font-mono bg-gray-50"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title={copied ? "Copied!" : "Copy to clipboard"}
            >
              {copied ? (
                <CheckIcon className="w-5 h-5 text-green-600" />
              ) : (
                <ClipboardDocumentIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {copyError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              Failed to copy automatically. Please select and copy the URL manually.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onClose} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;