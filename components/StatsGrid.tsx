
import React from 'react';
import StatCard from './StatCard';
import type { Expense } from '../types';
import { useMemo } from 'react';

interface StatsGridProps {
    expenses: Expense[];
}

function StatsGrid({ expenses }: StatsGridProps): React.ReactNode {
    const { totalExpenses, oneTimeExpenses, regularExpenses } = useMemo(() => {
        const oneTimeNet = expenses
            .filter(e => e.level1 === 'One-Time')
            .reduce((sum, e) => sum + e.amount, 0);

        const regularNet = expenses
            .filter(e => e.level1 === 'Regular')
            .reduce((sum, e) => sum + e.amount, 0);
        
        const oneTimeAbs = Math.abs(oneTimeNet);
        const regularAbs = Math.abs(regularNet);

        // Ensure the total is the sum of the other cards for consistency.
        const total = oneTimeAbs + regularAbs;

        return {
            totalExpenses: total,
            oneTimeExpenses: oneTimeAbs,
            regularExpenses: regularAbs,
        };
    }, [expenses]);
    
    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard 
              title="Regular Expenses" 
              value={formatCurrency(regularExpenses)} 
              description="Common day-to-day recurring spends" 
            />
            <StatCard 
              title="One-Time Expenses" 
              value={formatCurrency(oneTimeExpenses)} 
              description="One-off Spends that are not recurring" 
            />
            <StatCard 
              title="Total Expenses" 
              value={formatCurrency(totalExpenses)} 
              description="" 
            />
        </div>
    );
}

export default StatsGrid;