
import React, { useMemo } from 'react';
import type { Expense } from '../types';

interface CategoryBreakdownProps {
  expenses: Expense[];
}

const ProgressBar = ({ value, max }: { value: number; max: number }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

function CategoryBreakdown({ expenses }: CategoryBreakdownProps): React.ReactNode {
    const { topCategories } = useMemo(() => {
        const spends = expenses.filter(e => e.amount > 0);

        const categorySpends = spends.reduce((acc, expense) => {
            const category = expense.level2 || 'Uncategorized';
            if (category.trim() === '') return acc;
            acc[category] = (acc[category] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);
        
        const topCategories = Object.entries(categorySpends)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Top 5

        return { topCategories };
    }, [expenses]);

    const maxAmount = topCategories.length > 0 ? topCategories[0][1] : 0;

    return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Top 5 Spending Categories (Level 2)</h3>
            <ul className="space-y-4">
                {topCategories.map(([category, amount]) => (
                    <li key={category}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-slate-300">{category}</span>
                            <span className="font-semibold text-slate-200">
                                ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        <ProgressBar value={amount} max={maxAmount} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default CategoryBreakdown;
