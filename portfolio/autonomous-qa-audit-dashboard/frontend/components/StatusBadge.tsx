import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalizedStatus = status?.toUpperCase() as 'PASS' | 'WARNING' | 'FAIL';
  
  const colors: Record<string, string> = {
    PASS: 'bg-brand-pass/10 text-brand-pass border-brand-pass/20',
    WARNING: 'bg-brand-warning/10 text-brand-warning border-brand-warning/20',
    FAIL: 'bg-brand-fail/10 text-brand-fail border-brand-fail/20',
  };

  const colorClass = colors[normalizedStatus] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border ${colorClass} ${className}`}>
      {normalizedStatus || 'UNKNOWN'}
    </span>
  );
};
