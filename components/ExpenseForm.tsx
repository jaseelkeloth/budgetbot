
import React, { useState } from 'react';

interface ExpenseFormProps {
  onAddExpense: (description: string, amount: number) => void;
}

function ExpenseForm({ onAddExpense }: ExpenseFormProps): React.ReactNode {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (description.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      onAddExpense(description, numericAmount);
      setDescription('');
      setAmount('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
          Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Coffee with friends"
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">
          Amount (₹)
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 150.50"
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          min="0.01"
          step="0.01"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors duration-200"
        >
          Add Expense
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;
