import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'supplement' | 'warlord' | 'count' | 'faction' | 'keyword';
  children: ReactNode;
}

export default function Badge({ variant = 'keyword', children }: BadgeProps) {
  const variantStyles = {
    supplement: 'bg-yellow-400 text-gray-900',
    warlord: 'bg-red-600 text-white',
    count: 'bg-gray-600 text-white rounded-full',
    faction: 'bg-blue-600 text-white',
    keyword: 'bg-gray-200 text-gray-700',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}