import React, { useState, useMemo } from 'react';
import type { Expense } from '../types';
import StatsGrid from './StatsGrid';
import MonthlyTrendChart, { type ActiveDisplay } from './MonthlyTrendChart';
import Chatbot from './Chatbot';
import { SparkIcon } from './SparkIcon';

function Dashboard({ expenses }: { expenses: Expense[] }): React.ReactNode {
  // --- State Management ---
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(2025);
  const [isChatVisible, setIsChatVisible] = useState(false);

  // State lifted up from MonthlyTrendChart
  const [level1Filter, setLevel1Filter] = useState<string | null>(null);
  const [activeDisplay, setActiveDisplay] = useState<ActiveDisplay>({
    level: 'level1',
    categories: [],
    parentCategory: null,
  });

  // --- Memoized Calculations ---
  // Filter expenses by selected year
  const yearFilteredExpenses = useMemo(() => {
    if (selectedYear === 'all') {
      return expenses;
    }
    return expenses.filter(expense => expense.year === selectedYear);
  }, [expenses, selectedYear]);
  
  // Further filter expenses based on the chart's active display for the chatbot
  const contextualExpensesForChatbot = useMemo(() => {
    if (activeDisplay.categories.length === 0) {
      return yearFilteredExpenses;
    }

    const { level, categories, parentCategory } = activeDisplay;

    return yearFilteredExpenses.filter(e => {
      // Always apply L1 filter if it exists
      if (level1Filter && e.level1 !== level1Filter) {
        return false;
      }
      
      if (level === 'level1') {
        return categories.includes(e.level1);
      }
      if (level === 'level2') {
        return categories.includes(e.level2);
      }
      if (level === 'level3') {
        return e.level2 === parentCategory && categories.includes(e.level3);
      }
      return false;
    });
  }, [yearFilteredExpenses, activeDisplay, level1Filter]);

  // Derive available years for filter buttons
  const availableYears = useMemo(() =>
    [...new Set(expenses.map(e => e.year))].filter(Boolean).sort(),
    [expenses]
  );
  const filterButtons: (number | 'all')[] = ['all', ...availableYears];

  // --- Render Logic ---
  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading expense data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
       <div className="flex justify-between items-start">
         <h2 className="text-2xl font-bold text-indigo-400">My Finances</h2>
         <button
            onClick={() => setIsChatVisible(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-300 bg-indigo-600/50 rounded-full border border-indigo-500 hover:bg-indigo-600/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
            aria-label="Open AI Analyst Chat"
          >
            <SparkIcon className="h-5 w-5" />
            <span>Ask BudgetBot</span>
          </button>
      </div>
     
      <div className="flex items-center justify-center gap-2">
        {filterButtons.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-6 py-2 text-sm font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${
              selectedYear === year
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {typeof year === 'string' ? year.charAt(0).toUpperCase() + year.slice(1) : year}
          </button>
        ))}
      </div>

      <StatsGrid expenses={yearFilteredExpenses} />
      
      <MonthlyTrendChart
        expenses={yearFilteredExpenses}
        // Pass state down
        level1Filter={level1Filter}
        activeDisplay={activeDisplay}
        // Pass setters down
        setLevel1Filter={setLevel1Filter}
        setActiveDisplay={setActiveDisplay}
      />
      
      {isChatVisible && (
        <Chatbot
          expenses={contextualExpensesForChatbot}
          onClose={() => setIsChatVisible(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
