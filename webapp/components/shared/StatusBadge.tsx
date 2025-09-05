import React from 'react';

type Status = 'Active' | 'Expired' | 'Removed';

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors: Record<Status, string> = {
    Active: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
    Expired: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30',
    Removed: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[status]}`}>
      {status}
    </span>
  );
};
