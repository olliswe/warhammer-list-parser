import React from "react";

interface ClearButtonProps {
  onClear: () => void;
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClear }) => {
  return (
    <button
      type="button"
      onClick={onClear}
      className="text-sm text-red-600 hover:text-red-800 hover:underline"
    >
      ✕ Clear
    </button>
  );
};

export default ClearButton;