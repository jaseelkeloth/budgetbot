
import React from 'react';
import type { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps): React.ReactNode {
  if (expenses.length === 0) {
    return <p className="text-slate-400 text-center py-4">No expenses added yet. Start by adding one above!</p>;
  }

  // Sort expenses by date, most recent first
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
      {sortedExpenses.map((expense) => (
        <div key={expense.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
          <div>
            <p className="font-medium text-slate-200">{expense.description}</p>
            <div className="flex items-center gap-2 mt-1">
              {expense.category && (
                <span className="text-xs bg-indigo-900 text-indigo-300 font-medium px-2 py-0.5 rounded-full">
                  {expense.category}
                </span>
              )}
              <p className="text-sm text-slate-400">{expense.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-cyan-400">₹{expense.amount.toFixed(2)}</span>
            <button 
              onClick={() => onDeleteExpense(expense.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
              aria-label={`Delete expense: ${expense.description}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExpenseList;
