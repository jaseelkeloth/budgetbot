
import React, { useState, useMemo } from 'react';
import type { Expense } from '../types';

type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: keyof Expense;
  direction: SortDirection;
}

const SortIcon = ({ direction }: { direction: SortDirection | null }) => {
  if (direction === null) {
    return <span className="ml-1 text-slate-500 opacity-50">↕</span>;
  }
  return direction === 'ascending' ? <span className="ml-1">🔼</span> : <span className="ml-1">🔽</span>;
};

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/');
  // Handles both 'yy' and 'yyyy' format, though our data is 'yy'
  const fullYear = year.length === 2 ? `20${year}` : year;
  return new Date(Number(fullYear), Number(month) - 1, Number(day));
};

function AllExpensesTable({ expenses }: { expenses: Expense[] }): React.ReactNode {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
  
  const initialFilters: Record<keyof Expense, string> = {
    id: '', date: '', year: '', week: '', description: '', amount: '', level1: '', level2: '', level3: '', transactionType: '', paymentMode: '', category: ''
  };
  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = (key: keyof Expense, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const requestSort = (key: keyof Expense) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const filteredAndSortedExpenses = useMemo(() => {
    let sortableItems = [...expenses];
    
    // Filtering
    sortableItems = sortableItems.filter(item => {
      return (Object.keys(filters) as Array<keyof Expense>).every(key => {
        const filterValue = filters[key].toLowerCase();
        if (!filterValue) return true;
        const itemValue = String(item[key]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });

    // Sorting
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      let comparison = 0;
      if (sortConfig.key === 'date') {
        comparison = parseDate(a.date).getTime() - parseDate(b.date).getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    });

    return sortableItems;
  }, [expenses, filters, sortConfig]);

  const columns: { key: keyof Expense; label: string }[] = [
    { key: 'date', label: 'Date' },
    { key: 'year', label: 'Year' },
    { key: 'week', label: 'Week' },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount' },
    { key: 'level1', label: 'Level 1' },
    { key: 'level2', label: 'Level 2' },
    { key: 'level3', label: 'Level 3' },
    { key: 'transactionType', label: 'Transaction Type' },
    { key: 'paymentMode', label: 'Payment Mode' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800 sticky top-0">
          <tr>
            {columns.map(({ key, label }) => (
              <th key={key} scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider align-top">
                <div 
                  onClick={() => requestSort(key)} 
                  className="cursor-pointer flex items-center mb-1"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && requestSort(key)}
                  aria-label={`Sort by ${label}`}
                >
                  {label}
                  <SortIcon direction={sortConfig.key === key ? sortConfig.direction : null} />
                </div>
                <input
                  type="text"
                  placeholder={`Filter...`}
                  value={filters[key]}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onClick={(e) => e.stopPropagation()} // Prevent sort when clicking input
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-slate-800/50 divide-y divide-slate-700">
          {filteredAndSortedExpenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-slate-700/50 transition-colors">
              {columns.map(({ key }) => (
                <td key={key} className={`px-4 py-3 whitespace-nowrap text-sm ${expense.amount < 0 ? 'text-green-400' : 'text-slate-200'}`}>
                  {key === 'amount' ? `₹${expense.amount.toFixed(2)}` : String(expense[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllExpensesTable;
