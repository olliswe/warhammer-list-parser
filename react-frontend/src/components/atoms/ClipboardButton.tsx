import React from "react";

interface ClipboardButtonProps {
  onPaste: (text: string) => void;
}

const ClipboardButton: React.FC<ClipboardButtonProps> = ({ onPaste }) => {
  const handleClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onPaste(text);
    } catch (err) {
      alert(
        "Failed to read from clipboard. Please paste manually or check browser permissions."
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
    >
      📋 Insert from Clipboard
    </button>
  );
};

export default ClipboardButton;