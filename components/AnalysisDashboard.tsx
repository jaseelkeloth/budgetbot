
import React from 'react';
import type { AnalysisResult } from '../types';
import Loader from './Loader';
import CategoryChart from './CategoryChart';
import InsightsCard from './InsightsCard';

interface AnalysisDashboardProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  hasExpenses: boolean;
}

function AnalysisDashboard({ analysis, isLoading, error, hasExpenses }: AnalysisDashboardProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96">
        <Loader />
        <p className="mt-4 text-slate-300">AI is analyzing your spending...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-96 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (!hasExpenses) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-96 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5l4 4v10a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-300">Ready for Analysis</h3>
            <p className="text-slate-400 mt-2">Add some expenses to see your financial breakdown and get personalized AI insights.</p>
        </div>
    );
  }

  if (!analysis) {
    return null; // Should be covered by other states, but as a fallback.
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-cyan-300">Spending by Category</h3>
        <div className="h-80 w-full">
            <CategoryChart data={analysis.categoryTotals} />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4 text-cyan-300">AI Insights</h3>
        <InsightsCard summary={analysis.summary} tips={analysis.tips} />
      </div>
    </div>
  );
}

export default AnalysisDashboard;
