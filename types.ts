
export interface Expense {
  id: string;
  date: string;
  year: number;
  week: number;
  description: string;
  amount: number;
  level1: string;
  level2: string;
  level3: string;
  transactionType: string;
  paymentMode: string;
  category?: string;
}

export interface AnalysisResult {
  categoryTotals: {
    category: string;
    total: number;
  }[];
  summary: string;
  tips: string[];
}
