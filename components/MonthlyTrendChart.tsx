import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Expense } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface ActiveDisplay {
  level: 'level1' | 'level2' | 'level3';
  categories: string[];
  parentCategory: string | null; // L2 parent for L3s
}

interface MonthlyTrendChartProps {
  expenses: Expense[];
  level1Filter: string | null;
  activeDisplay: ActiveDisplay;
  setLevel1Filter: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveDisplay: React.Dispatch<React.SetStateAction<ActiveDisplay>>;
}


const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#a4de6c', '#d0ed57', '#ffc658', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/');
  return new Date(Number(`20${year}`), Number(month) - 1, Number(day));
};

const getMonthYear = (date: Date): string => {
  return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
};

// Simplified and corrected data processing function
function processDataForChart(expenses: Expense[]) {
  if (expenses.length === 0) return { data: [], allCategories: new Set<string>() };

  const monthlyNetTotals: Map<string, Record<string, number>> = new Map();
  const allCategories = new Set<string>();

  // Use a map to get a sorted list of unique months, which is robust for multiple years
  const monthMap = new Map<string, number>();
  expenses.forEach(expense => {
    const date = parseDate(expense.date);
    const monthYear = getMonthYear(date);
    if (!monthMap.has(monthYear)) {
      // Use the first day of the month for consistent timestamp-based sorting
      monthMap.set(monthYear, new Date(date.getFullYear(), date.getMonth(), 1).getTime());
    }
  });
  const allMonths = Array.from(monthMap.keys()).sort((a, b) => monthMap.get(a)! - monthMap.get(b)!);

  // Step 1: Aggregate net totals per month for each category
  allMonths.forEach(month => monthlyNetTotals.set(month, {})); // Initialize all months to ensure they exist

  expenses.forEach(expense => {
    const date = parseDate(expense.date);
    const monthYear = getMonthYear(date);

    const categories = [expense.level1, expense.level2, expense.level3].filter(Boolean) as string[];
    categories.forEach(cat => allCategories.add(cat));

    const monthData = monthlyNetTotals.get(monthYear)!;

    categories.forEach(cat => {
      // Net sum (positive and negative amounts)
      monthData[cat] = (monthData[cat] || 0) + expense.amount;
    });
  });

  // Create initial chart data with monthly totals
  const chartDataWithTotals = allMonths.map(month => {
    const data: Record<string, any> = { name: month };
    const monthTotals = monthlyNetTotals.get(month) || {};
    allCategories.forEach(cat => {
      data[cat] = monthTotals[cat] || 0;
    });
    return data;
  });

  // Add breakdown data for tooltips
  expenses.forEach(expense => {
    const date = parseDate(expense.date);
    const monthYear = getMonthYear(date);
    const { level2, level3, amount } = expense;

    const monthDataObject = chartDataWithTotals.find(d => d.name === monthYear);
    if (monthDataObject && level2 && level3) {
      const breakdownKey = `${level2}_breakdown`;
      if (!monthDataObject[breakdownKey]) {
        monthDataObject[breakdownKey] = {};
      }
      monthDataObject[breakdownKey][level3] = (monthDataObject[breakdownKey][level3] || 0) + expense.amount;
    }
  });

  // Step 2: Calculate 3-month moving average for each category
  const finalChartData = chartDataWithTotals.map((monthData, i) => {
    const newMonthData = { ...monthData };
    allCategories.forEach(cat => {
      const maKey = `${cat}_MA`;
      const window: number[] = [];
      // Look back up to 2 previous months (for a total of 3 months)
      for (let j = 0; j < 3; j++) {
        if (i - j >= 0) {
          window.push(chartDataWithTotals[i - j][cat] || 0);
        }
      }
      // The average is sum / window.length. This handles the first few months correctly (avg of 1, avg of 2, then avg of 3).
      const sum = window.reduce((a, b) => a + b, 0);
      newMonthData[maKey] = window.length > 0 ? sum / window.length : 0;
    });
    return newMonthData;
  });

  return { data: finalChartData, allCategories };
}


const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function MonthlyTrendChart({ expenses, level1Filter, activeDisplay, setLevel1Filter, setActiveDisplay }: MonthlyTrendChartProps): React.ReactNode {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // Memoize all possible categories and mappings
  const { level1Categories, level2Categories, level2ToLevel3Map, allPossibleCategories } = useMemo(() => {
    const l1 = new Set<string>();
    const l2 = new Set<string>();
    const map = new Map<string, Set<string>>();
    const all = new Set<string>();

    expenses.forEach(e => {
      if (e.level1) { l1.add(e.level1); all.add(e.level1); }
      if (e.level2) { l2.add(e.level2); all.add(e.level2); }
      if (e.level2 && e.level3) {
        if (!map.has(e.level2)) map.set(e.level2, new Set());
        map.get(e.level2)!.add(e.level3);
        all.add(e.level3);
      }
    });

    return {
      level1Categories: [...l1].sort(),
      level2Categories: [...l2].sort(),
      level2ToLevel3Map: map,
      allPossibleCategories: [...all].sort(),
    };
  }, [expenses]);

  // Set initial display to top L1 categories based on net transaction amount
  useEffect(() => {
    if (expenses.length > 0 && activeDisplay.categories.length === 0 && !level1Filter) {
      const categoryTotals: Record<string, number> = {};
      expenses.forEach(e => {
        // Calculate net sum for each category
        if (e.level1) { 
          categoryTotals[e.level1] = (categoryTotals[e.level1] || 0) + e.amount;
        }
      });
      const topCategories = Object.entries(categoryTotals)
        // Sort by the absolute value of the net total to find the most significant categories
        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a)) 
        .slice(0, 5)
        .map(([name]) => name);
      setActiveDisplay({ level: 'level1', categories: topCategories, parentCategory: null });
    }
  }, [expenses, activeDisplay.categories.length, level1Filter, setActiveDisplay]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter expenses based on the L1 context
  const contextualExpenses = useMemo(() => {
    if (!level1Filter) return expenses;
    return expenses.filter(e => e.level1 === level1Filter);
  }, [expenses, level1Filter]);
  
  // Process chart data for all levels
  const { data: chartData } = useMemo(() => processDataForChart(contextualExpenses), [contextualExpenses]);

  const handleLevel1Click = (category: string) => {
    if (level1Filter === category) { // Toggling off
      setLevel1Filter(null);
      // Reset to default L1 view
      const categoryTotals: Record<string, number> = {};
       expenses.forEach(e => {
        if (e.level1) categoryTotals[e.level1] = (categoryTotals[e.level1] || 0) + e.amount;
      });
      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
        .slice(0, 5)
        .map(([name]) => name);
      setActiveDisplay({ level: 'level1', categories: topCategories, parentCategory: null });
    } else { // Setting a new filter
      setLevel1Filter(category);
      // Show only that L1 category initially
      setActiveDisplay({ level: 'level1', categories: [category], parentCategory: null });
    }
  };

  const handleLevel2Click = (level2Category: string) => {
    setActiveDisplay({
      level: 'level2',
      categories: [level2Category],
      parentCategory: null,
    });
  };

  const handleLevel3Toggle = (level3Category: string, parentLevel2: string) => {
    setActiveDisplay(prev => {
      const isNewContext = prev.parentCategory !== parentLevel2 || prev.level !== 'level3';
      const currentLevel3s = isNewContext ? [] : prev.categories;
      
      const newLevel3s = currentLevel3s.includes(level3Category)
        ? currentLevel3s.filter(c => c !== level3Category)
        : [...currentLevel3s, level3Category];

      if (newLevel3s.length === 0) {
        return { level: 'level2', categories: [parentLevel2], parentCategory: null };
      }

      return { level: 'level3', categories: newLevel3s, parentCategory: parentLevel2 };
    });
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      // Remove _MA suffix if it exists to get the base category name
      const categoryName = (dataPoint.dataKey as string).replace('_MA', '');
      const monthData = dataPoint.payload;
      const breakdownData = monthData[`${categoryName}_breakdown`];
  
      // This tooltip is specifically for the L2 drill-down view
      if (activeDisplay.level === 'level2' && breakdownData) {
        const sortedBreakdown = Object.entries(breakdownData)
                                      .filter(([, value]) => Math.abs(value as number) > 0)
                                      .sort(([, a], [, b]) => Math.abs(b as number) - Math.abs(a as number));

        return (
          <div className="bg-slate-700/90 p-3 rounded-lg border border-slate-600 shadow-xl text-sm backdrop-blur-sm">
            <p className="font-bold text-slate-200 mb-2">{`${label}`}</p>
            <p className="text-cyan-400 font-semibold mb-2 flex justify-between">
              <span>{`${categoryName} (Total):`}</span>
              <span>{formatCurrency(monthData[categoryName] as number)}</span>
            </p>
            <div className="border-t border-slate-600 pt-2 space-y-1">
              {sortedBreakdown.map(([l3Cat, l3Value]) => (
                  <div key={l3Cat} className="flex justify-between text-xs">
                    <span className="text-slate-300 truncate pr-2">{l3Cat}:</span>
                    <span className="text-slate-100 font-medium whitespace-nowrap">{formatCurrency(l3Value as number)}</span>
                  </div>
                ))}
            </div>
          </div>
        );
      }
      
      // Fallback to a simpler tooltip for other views
      return (
        <div className="bg-slate-700/90 p-2 rounded-lg border border-slate-600 shadow-xl text-sm">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          {payload.map((pld: any) => (
             <div key={pld.dataKey} style={{ color: pld.color }} className="flex justify-between">
                <span className="truncate pr-2">{`${pld.name}:`}</span>
                <span className="font-medium ml-2 whitespace-nowrap">{formatCurrency(pld.value as number)}</span>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Monthly Spending Trends</h3>
      
      <div className="mb-4 border-t border-slate-700 pt-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Expense Type:</h4>
        <div className="flex flex-wrap gap-2">
          {level1Categories.map(category => (
            <button
              key={category}
              onClick={() => handleLevel1Click(category)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 border ${
                level1Filter === category
                  ? 'bg-indigo-500 border-indigo-500 text-white font-semibold shadow-md'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 border-t border-slate-700 pt-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Expense Category (Sub-Category in Dropdown):</h4>
        <div className="flex flex-wrap gap-2" ref={dropdownContainerRef}>
          {level2Categories.map(level2Category => {
              const level3Options = Array.from(level2ToLevel3Map.get(level2Category) || []);
              if (level3Options.length === 0) return null;
              
              const isL2Active = activeDisplay.level === 'level2' && activeDisplay.categories.includes(level2Category);
              const areL3ChildrenActive = activeDisplay.level === 'level3' && activeDisplay.parentCategory === level2Category;
              const selectedL3Count = areL3ChildrenActive ? activeDisplay.categories.length : 0;
              const isOpen = openDropdown === level2Category;
              
              return (
                  <div key={level2Category} className="relative inline-flex rounded-full shadow-sm">
                      <button
                          type="button"
                          onClick={() => handleLevel2Click(level2Category)}
                          className={`relative inline-flex items-center px-3 py-1 rounded-l-full border border-slate-600 text-xs font-medium transition-colors duration-200 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                              isL2Active || areL3ChildrenActive
                                  ? 'bg-cyan-500 text-slate-900 font-semibold'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                      >
                          {level2Category} {selectedL3Count > 0 && `(${selectedL3Count})`}
                      </button>
                      <button
                          type="button"
                          onClick={() => setOpenDropdown(isOpen ? null : level2Category)}
                          aria-haspopup="true"
                          aria-expanded={isOpen}
                          className={`relative -ml-px inline-flex items-center px-2 py-1 rounded-r-full border border-slate-600 text-xs font-medium transition-colors duration-200 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                              isOpen || isL2Active || areL3ChildrenActive
                                  ? 'bg-cyan-500 text-slate-900'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                      >
                         <svg className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      {isOpen && (
                          <div className="absolute top-full left-0 z-20 mt-2 w-48 max-h-60 overflow-y-auto bg-slate-700 border border-slate-600 rounded-md shadow-lg p-2 space-y-1">
                              {level3Options.map(level3Category => (
                                  <label key={level3Category} className="flex items-center space-x-2 p-1 rounded-md hover:bg-slate-600 cursor-pointer">
                                      <input
                                          type="checkbox"
                                          checked={areL3ChildrenActive && activeDisplay.categories.includes(level3Category)}
                                          onChange={() => handleLevel3Toggle(level3Category, level2Category)}
                                          className="form-checkbox h-4 w-4 bg-slate-800 border-slate-500 text-cyan-500 rounded focus:ring-cyan-400 focus:ring-offset-slate-700"
                                      />
                                      <span className="text-slate-200 text-xs font-medium truncate">{level3Category}</span>
                                  </label>
                              ))}
                          </div>
                      )}
                  </div>
              )
          })}
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `₹${Number(value)/1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "12px"}} />
            {activeDisplay.categories.map((category) => {
              const categoryColor = COLORS[allPossibleCategories.indexOf(category) % COLORS.length];
              const maKey = `${category}_MA`;
              const categoryName = level1Filter && activeDisplay.level !== 'level1' ? `${category} (${level1Filter})` : category;
              const maName = `${categoryName} (3M MA)`;
              return (
                  <React.Fragment key={category}>
                    <Line
                      type="monotone"
                      dataKey={category}
                      name={categoryName}
                      stroke={categoryColor}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey={maKey}
                      name={maName}
                      stroke={categoryColor}
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={false}
                    />
                  </React.Fragment>
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MonthlyTrendChart;
