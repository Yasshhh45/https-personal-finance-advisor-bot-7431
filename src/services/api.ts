import {
  UserProfile,
  IncomeItem,
  ExpenseItem,
  BudgetCategory,
  SavingsGoal,
  FinancialSummary,
  AIBudgetSuggestion,
  AISpendingAnalysis,
  AIMonthlyReport,
} from '../types/finance.ts';

export const api = {
  // User
  async getUser(): Promise<UserProfile> {
    const res = await fetch('/api/user');
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async updateUser(user: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  // Summary
  async getSummary(): Promise<FinancialSummary> {
    const res = await fetch('/api/analytics/summary');
    if (!res.ok) throw new Error('Failed to fetch financial summary');
    return res.json();
  },

  // Incomes
  async getIncomes(): Promise<IncomeItem[]> {
    const res = await fetch('/api/incomes');
    if (!res.ok) throw new Error('Failed to fetch incomes');
    return res.json();
  },

  async createIncome(income: Partial<IncomeItem>): Promise<IncomeItem> {
    const res = await fetch('/api/incomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(income),
    });
    if (!res.ok) throw new Error('Failed to create income record');
    return res.json();
  },

  async deleteIncome(id: string): Promise<void> {
    const res = await fetch(`/api/incomes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete income record');
  },

  // Expenses
  async getExpenses(): Promise<ExpenseItem[]> {
    const res = await fetch('/api/expenses');
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async createExpense(expense: Partial<ExpenseItem>): Promise<ExpenseItem> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to create expense record');
    return res.json();
  },

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete expense record');
  },

  // Budgets
  async getBudgets(): Promise<BudgetCategory[]> {
    const res = await fetch('/api/budgets');
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  async saveBudget(budget: Partial<BudgetCategory>): Promise<BudgetCategory> {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
    if (!res.ok) throw new Error('Failed to save budget');
    return res.json();
  },

  async applyBatchBudgets(budgets: { category: string; monthlyLimit: number }[]): Promise<BudgetCategory[]> {
    const res = await fetch('/api/budgets/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budgets }),
    });
    if (!res.ok) throw new Error('Failed to batch save budgets');
    return res.json();
  },

  async deleteBudget(id: string): Promise<void> {
    const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete budget');
  },

  // Savings
  async getSavings(): Promise<SavingsGoal[]> {
    const res = await fetch('/api/savings');
    if (!res.ok) throw new Error('Failed to fetch savings');
    return res.json();
  },

  async createSavings(goal: Partial<SavingsGoal>): Promise<SavingsGoal> {
    const res = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error('Failed to create savings goal');
    return res.json();
  },

  async contributeSavings(id: string, amount: number, note?: string): Promise<SavingsGoal> {
    const res = await fetch(`/api/savings/${id}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, note }),
    });
    if (!res.ok) throw new Error('Failed to contribute to savings goal');
    return res.json();
  },

  async deleteSavings(id: string): Promise<void> {
    const res = await fetch(`/api/savings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete savings goal');
  },

  // AI Endpoints
  async chatWithAdvisor(message: string, history: { role: string; content: string }[] = []): Promise<{ reply: string; suggestions: string[] }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('Failed to chat with Yashraj Patil advisor');
    return res.json();
  },

  async generateAIBudget(): Promise<AIBudgetSuggestion[]> {
    const res = await fetch('/api/ai/generate-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to generate AI budget');
    return res.json();
  },

  async getAISpendingAnalysis(): Promise<AISpendingAnalysis> {
    const res = await fetch('/api/ai/spending-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to generate spending analysis');
    return res.json();
  },

  async getAIMonthlyReport(): Promise<AIMonthlyReport> {
    const res = await fetch('/api/ai/monthly-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to generate AI monthly report');
    return res.json();
  },
};
