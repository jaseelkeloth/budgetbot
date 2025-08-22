
import React from 'react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'all-expenses', name: 'All Expenses' },
];

function Tabs({ activeTab, onTabChange }: TabsProps): React.ReactNode {
  return (
    <div className="container mx-auto px-4 md:px-8">
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 rounded-t-sm`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Tabs;