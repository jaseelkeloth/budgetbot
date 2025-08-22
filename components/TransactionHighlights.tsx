
import React, { useMemo } from 'react';
import type { Expense } from '../types';

interface TransactionHighlightsProps {
  expenses: Expense[];
}

function TransactionHighlights({ expenses }: TransactionHighlightsProps): React.ReactNode {
  const highlights = useMemo(() => {
    const spends = expenses.filter(e => e.amount > 0);
    if (spends.length === 0) {
      return { largestSpend: null, mostFrequentCategory: null };
    }
    
    // Largest Spend
    const largestSpend = [...spends].sort((a, b) => b.amount - a.amount)[0];

    // Most Frequent Category
    const categoryCounts = spends.reduce((acc, expense) => {
      const category = expense.level3 || 'Uncategorized';
      if (category.trim() === '') return acc;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentCategoryEntry = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)[0];
      
    const mostFrequentCategory = mostFrequentCategoryEntry ? {
        name: mostFrequentCategoryEntry[0],
        count: mostFrequentCategoryEntry[1],
    } : null;

    return {
      largestSpend,
      mostFrequentCategory
    };
  }, [expenses]);

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Transaction Highlights</h3>
      <div className="space-y-4">
        {highlights.largestSpend && (
          <div>
            <p className="text-sm font-medium text-slate-400">Largest Single Expense</p>
            <div className="mt-1 flex justify-between items-baseline">
              <p className="text-base text-slate-200 truncate pr-4">{highlights.largestSpend.description}</p>
              <p className="text-xl font-bold text-red-400">₹{highlights.largestSpend.amount.toLocaleString('en-IN')}</p>
            </div>
             <p className="text-xs text-slate-500">{highlights.largestSpend.date}</p>
          </div>
        )}
        {highlights.mostFrequentCategory && (
          <div>
            <p className="text-sm font-medium text-slate-400">Most Frequent Category (Level 3)</p>
            <div className="mt-1 flex justify-between items-baseline">
              <p className="text-base text-slate-200">{highlights.mostFrequentCategory.name}</p>
              <p className="text-xl font-bold text-cyan-400">{highlights.mostFrequentCategory.count} times</p>
            </div>
             <p className="text-xs text-slate-500">Your most common transaction type.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHighlights;
