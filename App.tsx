

import React, { useState, useEffect } from 'react';
import type { Expense } from './types';
import Header from './components/Header';
import Tabs from './components/Tabs';
import AllExpensesTable from './components/AllExpensesTable';
import Dashboard from './components/Dashboard';

/**
 * Parses CSV data into an array of Expense objects.
 * This function now parses all columns and includes all transactions.
 */
function parseCSVData(data: string): Expense[] {
  const lines = data.trim().split('\n');
  const headerLine = lines.shift();
  if (!headerLine) return [];

  const header = headerLine.split(',').map(h => h.trim());
  const indices = {
    date: header.indexOf('Date'),
    year: header.indexOf('Year'),
    week: header.indexOf('Week'),
    description: header.indexOf('Description'),
    amount: header.indexOf('Amount'),
    level1: header.indexOf('Level 1'),
    level2: header.indexOf('Level 2'),
    level3: header.indexOf('Level 3'),
    transactionType: header.indexOf('Transaction Type'),
    paymentMode: header.indexOf('Payment Mode'),
  };

  return lines
    .map((line, index): Expense | null => {
      // Use regex to handle potential commas within quoted descriptions
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/"/g, '').trim()) ?? [];
      
      if (values.length < header.length) return null;

      const amount = parseFloat(values[indices.amount]);
      // Keep all transactions, including refunds/cashbacks (negative values)
      if (isNaN(amount)) return null;

      const dateStr = values[indices.date];
      // Simple validation for date format
      if (!/^\d{2}\/\d{2}\/\d{2}$/.test(dateStr)) return null;
      
      const [day, month, year] = dateStr.split('/');
      const dateObj = new Date(Number(`20${year}`), Number(month) - 1, Number(day));

      return {
        id: `${dateObj.getTime()}-${index}`,
        date: dateStr,
        year: parseInt(values[indices.year], 10) || 0,
        week: parseInt(values[indices.week], 10) || 0,
        description: values[indices.description] || '',
        amount,
        level1: values[indices.level1] || '',
        level2: values[indices.level2] || '',
        level3: values[indices.level3] || '',
        transactionType: values[indices.transactionType] || '',
        paymentMode: values[indices.paymentMode] || '',
        category: `${values[indices.level2]} - ${values[indices.level3]}`,
      };
    })
    .filter((e): e is Expense => e !== null);
}

function App(): React.ReactNode {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load and parse data on initial component mount from the external CSV file
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('./data.csv');
        if (!response.ok) {
          throw new Error(`Could not load expense data: ${response.statusText}`);
        }
        const csvText = await response.text();
        const initialExpenses = parseCSVData(csvText);
        setExpenses(initialExpenses);
      } catch (err) {
        console.error("Failed to load or parse CSV data:", err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      <Header />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {activeTab === 'dashboard' && (
           <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700">
             <Dashboard expenses={expenses} />
           </div>
        )}

        {activeTab === 'all-expenses' && (
           <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-700">
             <h2 className="text-2xl font-bold mb-4 text-indigo-400">All Expenses</h2>
             <AllExpensesTable expenses={expenses} />
           </div>
        )}
      </main>
       <footer className="text-center p-4 mt-8 text-slate-500 text-sm">
        <p>Powered by Gemini. For informational purposes only.</p>
      </footer>
    </div>
  );
}

export default App;