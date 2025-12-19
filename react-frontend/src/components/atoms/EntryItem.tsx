'use client';

import { ReactNode } from 'react';

interface EntryItemProps {
  onClick: () => void;
  children: ReactNode;
  isSelected?: boolean;
}

export default function EntryItem({ onClick, children, isSelected = false }: EntryItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Remove focus from the clicked element before executing onClick
    (e.currentTarget as HTMLElement).blur();
    // Also blur any active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`outline outline-1 outline-gray-300 bg-gray-100 p-4 my-3 rounded cursor-pointer transition-all border-l-4 font-mono text-sm leading-relaxed whitespace-pre-line
        ${isSelected
          ? 'bg-blue-50 border-blue-600 shadow-md'
          : 'border-transparent hover:bg-gray-100 hover:border-blue-600'
        }`}
    >
      {children}
    </div>
  );
}