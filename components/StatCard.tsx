
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
}

function StatCard({ title, value, description }: StatCardProps): React.ReactNode {
  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
      <h3 className="text-sm font-medium text-slate-400 truncate">{title}</h3>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );
}

export default StatCard;