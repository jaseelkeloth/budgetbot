
import React from 'react';

interface InsightsCardProps {
  summary: string;
  tips: string[];
}

function InsightsCard({ summary, tips }: InsightsCardProps): React.ReactNode {
  return (
    <div className="bg-slate-700/50 p-6 rounded-lg space-y-6">
      <div>
        <h4 className="font-semibold text-lg mb-2 text-slate-200">Spending Summary</h4>
        <p className="text-slate-300">{summary}</p>
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-2 text-slate-200">Actionable Tips</h4>
        <ul className="space-y-2 list-disc list-inside">
          {tips.map((tip, index) => (
            <li key={index} className="text-slate-300">
                <span className="ml-2">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InsightsCard;
