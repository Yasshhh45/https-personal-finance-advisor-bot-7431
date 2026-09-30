export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: CurrencyCode;
  currencySymbol: string;
  monthlyIncomeTarget: number;
  savingsRateTarget: number; // percentage, e.g. 25
  occupation: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export type ExpenseCategory =
  | 'Housing'
  | 'Food & Groceries'
  | 'Dining & Coffee'
  | 'Transportation'
  | 'Utilities'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Shopping'
  | 'Subscriptions'
  | 'Education'
  | 'Debt & Loans'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Freelancing'
  | 'Investments'
  | 'Business'
  | 'Rental Income'
  | 'Bonus'
  | 'Other';

export interface IncomeItem {
  id: string;
  userId: string;
  source: string;
  amount: number;
  category: IncomeCategory;
  frequency: 'monthly' | 'bi-weekly' | 'one-time';
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'UPI/Online';
  recurring: boolean;
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  userId: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  alertThreshold: number; // e.g. 85 for 85%
  month: string; // YYYY-MM
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: 'Emergency Fund' | 'Retirement' | 'Vacation' | 'Home' | 'Gadget' | 'Investment' | 'General';
  icon: string;
  contributions: SavingsContribution[];
}

export interface CategorySummary {
  category: ExpenseCategory;
  totalSpent: number;
  budgetLimit: number;
  percentageUsed: number;
  status: 'safe' | 'warning' | 'exceeded';
  transactionCount: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage
  healthScore: number; // 0 - 100
  healthStatus: 'Excellent' | 'Healthy' | 'Moderate' | 'Critical';
  budgetTotalLimit: number;
  totalBudgetSpentPercentage: number;
  rule50_30_20: {
    needs: { amount: number; percentage: number; targetPercentage: 50 };
    wants: { amount: number; percentage: number; targetPercentage: 30 };
    savings: { amount: number; percentage: number; targetPercentage: 20 };
  };
  categories: CategorySummary[];
  monthlyTrends: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
  topSpendingCategory: string;
  recurringExpensesTotal: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  metricsHighlight?: {
    label: string;
    value: string;
    type?: 'positive' | 'warning' | 'neutral';
  }[];
}

export interface AIBudgetSuggestion {
  category: ExpenseCategory;
  recommendedLimit: number;
  currentSpend: number;
  type: 'Needs' | 'Wants' | 'Savings';
  rationale: string;
}

export interface AISpendingAnalysis {
  healthScore: number;
  executiveSummary: string;
  keyFindings: {
    type: 'alert' | 'positive' | 'insight';
    title: string;
    description: string;
    potentialMonthlySavings?: number;
  }[];
  actionPlan: string[];
  optimizedMonthlySavings: number;
}

export interface AIMonthlyReport {
  period: string;
  advisorName: string;
  netWorthDelta: number;
  summaryHighlights: string[];
  budgetPerformanceReview: string;
  savingsVelocityReview: string;
  riskAssessment: string;
  nextMonthDirectives: string[];
}
