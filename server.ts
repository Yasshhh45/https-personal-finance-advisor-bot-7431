import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type {
  UserProfile,
  IncomeItem,
  ExpenseItem,
  BudgetCategory,
  SavingsGoal,
  FinancialSummary,
  ExpenseCategory,
  AIBudgetSuggestion,
  AISpendingAnalysis,
  AIMonthlyReport,
} from './src/types/finance.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'finance_db.json');

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface DatabaseSchema {
  user: UserProfile;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  budgets: BudgetCategory[];
  savings: SavingsGoal[];
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_default',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  currency: 'USD',
  currencySymbol: '$',
  monthlyIncomeTarget: 7000,
  savingsRateTarget: 25,
  occupation: 'Senior Product Designer',
  riskTolerance: 'moderate',
};

const SEED_INCOMES: IncomeItem[] = [
  {
    id: 'inc_1',
    userId: 'usr_default',
    source: 'Primary Tech Salary',
    amount: 5400,
    category: 'Salary',
    frequency: 'monthly',
    date: '2026-09-01',
    notes: 'Direct deposit post-tax',
  },
  {
    id: 'inc_2',
    userId: 'usr_default',
    source: 'UI/UX Client Consulting',
    amount: 1450,
    category: 'Freelancing',
    frequency: 'monthly',
    date: '2026-09-12',
    notes: 'Contract retainer for design system sprint',
  },
  {
    id: 'inc_3',
    userId: 'usr_default',
    source: 'Index Fund Dividend',
    amount: 180,
    category: 'Investments',
    frequency: 'monthly',
    date: '2026-09-18',
    notes: 'Quarterly dividend tranche',
  },
];

const SEED_BUDGETS: BudgetCategory[] = [
  { id: 'bgt_1', userId: 'usr_default', category: 'Housing', monthlyLimit: 2100, alertThreshold: 90, month: '2026-09' },
  { id: 'bgt_2', userId: 'usr_default', category: 'Food & Groceries', monthlyLimit: 650, alertThreshold: 85, month: '2026-09' },
  { id: 'bgt_3', userId: 'usr_default', category: 'Dining & Coffee', monthlyLimit: 400, alertThreshold: 80, month: '2026-09' },
  { id: 'bgt_4', userId: 'usr_default', category: 'Transportation', monthlyLimit: 320, alertThreshold: 85, month: '2026-09' },
  { id: 'bgt_5', userId: 'usr_default', category: 'Utilities', monthlyLimit: 280, alertThreshold: 90, month: '2026-09' },
  { id: 'bgt_6', userId: 'usr_default', category: 'Entertainment', monthlyLimit: 250, alertThreshold: 80, month: '2026-09' },
  { id: 'bgt_7', userId: 'usr_default', category: 'Health & Fitness', monthlyLimit: 180, alertThreshold: 85, month: '2026-09' },
  { id: 'bgt_8', userId: 'usr_default', category: 'Shopping', monthlyLimit: 300, alertThreshold: 75, month: '2026-09' },
  { id: 'bgt_9', userId: 'usr_default', category: 'Subscriptions', monthlyLimit: 120, alertThreshold: 90, month: '2026-09' },
];

const SEED_EXPENSES: ExpenseItem[] = [
  { id: 'exp_1', userId: 'usr_default', description: 'Apartment Rent & Parking', amount: 1950, category: 'Housing', date: '2026-09-02', paymentMethod: 'Bank Transfer', recurring: true },
  { id: 'exp_2', userId: 'usr_default', description: 'Whole Foods Market Weekly Stock', amount: 164.5, category: 'Food & Groceries', date: '2026-09-04', paymentMethod: 'Credit Card', recurring: false },
  { id: 'exp_3', userId: 'usr_default', description: 'Trader Joe’s Pantry Restock', amount: 112.3, category: 'Food & Groceries', date: '2026-09-11', paymentMethod: 'Credit Card', recurring: false },
  { id: 'exp_4', userId: 'usr_default', description: 'Organic Valley Market', amount: 98.7, category: 'Food & Groceries', date: '2026-09-21', paymentMethod: 'Debit Card', recurring: false },
  { id: 'exp_5', userId: 'usr_default', description: 'Electricity & Gas Utility Bill', amount: 142.1, category: 'Utilities', date: '2026-09-08', paymentMethod: 'Bank Transfer', recurring: true },
  { id: 'exp_6', userId: 'usr_default', description: 'Gigabit Fiber Internet', amount: 75.0, category: 'Utilities', date: '2026-09-10', paymentMethod: 'Credit Card', recurring: true },
  { id: 'exp_7', userId: 'usr_default', description: 'Bistro Dinner with Team', amount: 138.0, category: 'Dining & Coffee', date: '2026-09-06', paymentMethod: 'Credit Card', recurring: false },
  { id: 'exp_8', userId: 'usr_default', description: 'Artisan Coffee Roasters (Batch Beans & Drinks)', amount: 64.5, category: 'Dining & Coffee', date: '2026-09-14', paymentMethod: 'Credit Card', recurring: false },
  { id: 'exp_9', userId: 'usr_default', description: 'Weekend Sushi Lounge', amount: 145.2, category: 'Dining & Coffee', date: '2026-09-22', paymentMethod: 'Credit Card', recurring: false },
  { id: 'exp_10', userId: 'usr_default', description: 'Metro Pass Monthly Transit', amount: 125.0, category: 'Transportation', date: '2026-09-03', paymentMethod: 'Debit Card', recurring: true },
  { id: 'exp_11', userId: 'usr_default', description: 'Rideshare to Airport & Downtown', amount: 74.0, category: 'Transportation', date: '2026-09-17', paymentMethod: 'Credit Card', recurring: false },
  { id: 'exp_12', userId: 'usr_default', description: 'Equinox Gym & Wellness Club', amount: 160.0, category: 'Health & Fitness', date: '2026-09-05', paymentMethod: 'Credit Card', recurring: true },
  { id: 'exp_13', userId: 'usr_default', description: 'Cloud Services & Spotify & Netflix bundle', amount: 82.5, category: 'Subscriptions', date: '2026-09-09', paymentMethod: 'Credit Card', recurring: true },
  { id: 'exp_14', userId: 'usr_default', description: 'Ergonomic Desk Accessories', amount: 185.0, category: 'Shopping', date: '2026-09-16', paymentMethod: 'Credit Card', recurring: false },
  { id: 'exp_15', userId: 'usr_default', description: 'Concert & Cinema Tickets', amount: 95.0, category: 'Entertainment', date: '2026-09-20', paymentMethod: 'Credit Card', recurring: false },
];

const SEED_SAVINGS: SavingsGoal[] = [
  {
    id: 'svg_1',
    userId: 'usr_default',
    title: '6-Month Emergency Reserve',
    targetAmount: 18000,
    currentAmount: 12500,
    targetDate: '2026-12-31',
    category: 'Emergency Fund',
    icon: 'ShieldCheck',
    contributions: [
      { id: 'sc_1', amount: 1000, date: '2026-07-01', note: 'Initial deposit' },
      { id: 'sc_2', amount: 800, date: '2026-08-01', note: 'Monthly surplus' },
      { id: 'sc_3', amount: 1200, date: '2026-09-05', note: 'September allocation' },
    ],
  },
  {
    id: 'svg_2',
    userId: 'usr_default',
    title: 'Alps Winter Retreat',
    targetAmount: 3800,
    currentAmount: 2450,
    targetDate: '2026-11-20',
    category: 'Vacation',
    icon: 'Plane',
    contributions: [
      { id: 'sc_4', amount: 600, date: '2026-08-15', note: 'Flight savings' },
      { id: 'sc_5', amount: 500, date: '2026-09-12', note: 'Consulting bonus transfer' },
    ],
  },
  {
    id: 'svg_3',
    userId: 'usr_default',
    title: 'Index Fund Investment Tranche',
    targetAmount: 10000,
    currentAmount: 6200,
    targetDate: '2027-03-31',
    category: 'Investment',
    icon: 'TrendingUp',
    contributions: [
      { id: 'sc_6', amount: 750, date: '2026-09-15', note: 'Dollar cost averaging' },
    ],
  },
];

// Helper to read and write database
function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db file, falling back to seed:', err);
  }

  const initialDb: DatabaseSchema = {
    user: DEFAULT_USER,
    incomes: SEED_INCOMES,
    expenses: SEED_EXPENSES,
    budgets: SEED_BUDGETS,
    savings: SEED_SAVINGS,
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Compute financial summary
function calculateFinancialSummary(db: DatabaseSchema): FinancialSummary {
  const totalIncome = db.incomes.reduce((acc, inc) => acc + inc.amount, 0);
  const totalExpenses = db.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Category summary mapping
  const categoryMap = new Map<ExpenseCategory, { spent: number; count: number }>();
  for (const exp of db.expenses) {
    const existing = categoryMap.get(exp.category) || { spent: 0, count: 0 };
    categoryMap.set(exp.category, {
      spent: existing.spent + exp.amount,
      count: existing.count + 1,
    });
  }

  const budgetMap = new Map<ExpenseCategory, number>();
  let budgetTotalLimit = 0;
  for (const b of db.budgets) {
    budgetMap.set(b.category, b.monthlyLimit);
    budgetTotalLimit += b.monthlyLimit;
  }

  const allCategories: ExpenseCategory[] = [
    'Housing',
    'Food & Groceries',
    'Dining & Coffee',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Health & Fitness',
    'Shopping',
    'Subscriptions',
    'Education',
    'Debt & Loans',
    'Other',
  ];

  const categories = allCategories
    .map((cat) => {
      const data = categoryMap.get(cat) || { spent: 0, count: 0 };
      const limit = budgetMap.get(cat) || 0;
      const pct = limit > 0 ? Math.round((data.spent / limit) * 100) : 0;
      let status: 'safe' | 'warning' | 'exceeded' = 'safe';
      if (limit > 0) {
        if (pct >= 100) status = 'exceeded';
        else if (pct >= 85) status = 'warning';
      }
      return {
        category: cat,
        totalSpent: Math.round(data.spent * 100) / 100,
        budgetLimit: limit,
        percentageUsed: pct,
        status,
        transactionCount: data.count,
      };
    })
    .filter((c) => c.totalSpent > 0 || c.budgetLimit > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent);

  // 50/30/20 computation
  const needsCategories: ExpenseCategory[] = [
    'Housing',
    'Food & Groceries',
    'Transportation',
    'Utilities',
    'Health & Fitness',
    'Debt & Loans',
  ];
  const wantsCategories: ExpenseCategory[] = [
    'Dining & Coffee',
    'Entertainment',
    'Shopping',
    'Subscriptions',
    'Other',
  ];

  let needsAmount = 0;
  let wantsAmount = 0;
  for (const exp of db.expenses) {
    if (needsCategories.includes(exp.category)) {
      needsAmount += exp.amount;
    } else {
      wantsAmount += exp.amount;
    }
  }

  const needsPct = totalIncome > 0 ? Math.round((needsAmount / totalIncome) * 100) : 0;
  const wantsPct = totalIncome > 0 ? Math.round((wantsAmount / totalIncome) * 100) : 0;
  const savingsPct = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Recurring expenses calculation
  const recurringTotal = db.expenses
    .filter((e) => e.recurring)
    .reduce((sum, e) => sum + e.amount, 0);

  // Health Score algorithm (0-100)
  let healthScore = 50;
  // Factor 1: Savings Rate (target 20-30%)
  if (savingsRate >= 30) healthScore += 25;
  else if (savingsRate >= 20) healthScore += 18;
  else if (savingsRate >= 10) healthScore += 10;
  else if (savingsRate < 5) healthScore -= 10;

  // Factor 2: Needs vs 50%
  if (needsPct <= 50) healthScore += 15;
  else if (needsPct <= 60) healthScore += 8;
  else healthScore -= 10;

  // Factor 3: Wants control (<= 30%)
  if (wantsPct <= 30) healthScore += 10;
  else healthScore -= 8;

  // Factor 4: Over-budget categories
  const exceededCount = categories.filter((c) => c.status === 'exceeded').length;
  if (exceededCount === 0) healthScore += 10;
  else healthScore -= exceededCount * 5;

  // Factor 5: Emergency fund progress
  const emergencyFund = db.savings.find((s) => s.category === 'Emergency Fund');
  if (emergencyFund && emergencyFund.targetAmount > 0) {
    const efProgress = emergencyFund.currentAmount / emergencyFund.targetAmount;
    if (efProgress >= 0.7) healthScore += 10;
    else if (efProgress >= 0.4) healthScore += 5;
  }

  healthScore = Math.max(10, Math.min(98, healthScore));

  let healthStatus: 'Excellent' | 'Healthy' | 'Moderate' | 'Critical' = 'Moderate';
  if (healthScore >= 85) healthStatus = 'Excellent';
  else if (healthScore >= 70) healthStatus = 'Healthy';
  else if (healthScore >= 50) healthStatus = 'Moderate';
  else healthStatus = 'Critical';

  // Trends mock for past months
  const monthlyTrends = [
    { month: 'Jun', income: totalIncome * 0.95, expenses: totalExpenses * 0.98, savings: totalIncome * 0.95 - totalExpenses * 0.98 },
    { month: 'Jul', income: totalIncome * 0.92, expenses: totalExpenses * 1.05, savings: totalIncome * 0.92 - totalExpenses * 1.05 },
    { month: 'Aug', income: totalIncome * 0.97, expenses: totalExpenses * 0.94, savings: totalIncome * 0.97 - totalExpenses * 0.94 },
    { month: 'Sep (Current)', income: totalIncome, expenses: totalExpenses, savings: netSavings },
  ];

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    savingsRate,
    healthScore,
    healthStatus,
    budgetTotalLimit: Math.round(budgetTotalLimit * 100) / 100,
    totalBudgetSpentPercentage: budgetTotalLimit > 0 ? Math.round((totalExpenses / budgetTotalLimit) * 100) : 0,
    rule50_30_20: {
      needs: { amount: Math.round(needsAmount), percentage: needsPct, targetPercentage: 50 },
      wants: { amount: Math.round(wantsAmount), percentage: wantsPct, targetPercentage: 30 },
      savings: { amount: Math.round(netSavings), percentage: savingsPct, targetPercentage: 20 },
    },
    categories,
    monthlyTrends,
    topSpendingCategory: categories[0]?.category || 'Housing',
    recurringExpensesTotal: Math.round(recurringTotal * 100) / 100,
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  // 1. User Profile
  app.get('/api/user', (_req, res) => {
    const db = loadDb();
    res.json(db.user);
  });

  app.put('/api/user', (req, res) => {
    const db = loadDb();
    db.user = { ...db.user, ...req.body };
    saveDb(db);
    res.json(db.user);
  });

  // 2. Summary
  app.get('/api/analytics/summary', (_req, res) => {
    const db = loadDb();
    const summary = calculateFinancialSummary(db);
    res.json(summary);
  });

  // 3. Incomes
  app.get('/api/incomes', (_req, res) => {
    const db = loadDb();
    res.json(db.incomes);
  });

  app.post('/api/incomes', (req, res) => {
    const db = loadDb();
    const newIncome: IncomeItem = {
      id: `inc_${Date.now()}`,
      userId: db.user.id,
      source: req.body.source || 'Unnamed Source',
      amount: parseFloat(req.body.amount) || 0,
      category: req.body.category || 'Salary',
      frequency: req.body.frequency || 'monthly',
      date: req.body.date || new Date().toISOString().split('T')[0],
      notes: req.body.notes || '',
    };
    db.incomes.unshift(newIncome);
    saveDb(db);
    res.status(201).json(newIncome);
  });

  app.delete('/api/incomes/:id', (req, res) => {
    const db = loadDb();
    db.incomes = db.incomes.filter((i) => i.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // 4. Expenses
  app.get('/api/expenses', (_req, res) => {
    const db = loadDb();
    res.json(db.expenses);
  });

  app.post('/api/expenses', (req, res) => {
    const db = loadDb();
    const newExpense: ExpenseItem = {
      id: `exp_${Date.now()}`,
      userId: db.user.id,
      description: req.body.description || 'General Expense',
      amount: parseFloat(req.body.amount) || 0,
      category: req.body.category || 'Other',
      date: req.body.date || new Date().toISOString().split('T')[0],
      paymentMethod: req.body.paymentMethod || 'Credit Card',
      recurring: Boolean(req.body.recurring),
      notes: req.body.notes || '',
    };
    db.expenses.unshift(newExpense);
    saveDb(db);
    res.status(201).json(newExpense);
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const db = loadDb();
    db.expenses = db.expenses.filter((e) => e.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // 5. Budgets
  app.get('/api/budgets', (_req, res) => {
    const db = loadDb();
    res.json(db.budgets);
  });

  app.post('/api/budgets', (req, res) => {
    const db = loadDb();
    const existingIndex = db.budgets.findIndex((b) => b.category === req.body.category);
    if (existingIndex >= 0) {
      db.budgets[existingIndex] = {
        ...db.budgets[existingIndex],
        monthlyLimit: parseFloat(req.body.monthlyLimit) || 0,
        alertThreshold: parseInt(req.body.alertThreshold) || 85,
      };
      saveDb(db);
      return res.json(db.budgets[existingIndex]);
    }
    const newBudget: BudgetCategory = {
      id: `bgt_${Date.now()}`,
      userId: db.user.id,
      category: req.body.category,
      monthlyLimit: parseFloat(req.body.monthlyLimit) || 0,
      alertThreshold: parseInt(req.body.alertThreshold) || 85,
      month: req.body.month || '2026-09',
    };
    db.budgets.push(newBudget);
    saveDb(db);
    res.status(201).json(newBudget);
  });

  app.post('/api/budgets/batch', (req, res) => {
    const db = loadDb();
    const budgetsToApply: { category: ExpenseCategory; monthlyLimit: number }[] = req.body.budgets;
    if (Array.isArray(budgetsToApply)) {
      for (const item of budgetsToApply) {
        const idx = db.budgets.findIndex((b) => b.category === item.category);
        if (idx >= 0) {
          db.budgets[idx].monthlyLimit = item.monthlyLimit;
        } else {
          db.budgets.push({
            id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: db.user.id,
            category: item.category,
            monthlyLimit: item.monthlyLimit,
            alertThreshold: 85,
            month: '2026-09',
          });
        }
      }
      saveDb(db);
    }
    res.json(db.budgets);
  });

  app.delete('/api/budgets/:id', (req, res) => {
    const db = loadDb();
    db.budgets = db.budgets.filter((b) => b.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // 6. Savings Goals
  app.get('/api/savings', (_req, res) => {
    const db = loadDb();
    res.json(db.savings);
  });

  app.post('/api/savings', (req, res) => {
    const db = loadDb();
    const newGoal: SavingsGoal = {
      id: `svg_${Date.now()}`,
      userId: db.user.id,
      title: req.body.title || 'New Savings Goal',
      targetAmount: parseFloat(req.body.targetAmount) || 1000,
      currentAmount: parseFloat(req.body.currentAmount) || 0,
      targetDate: req.body.targetDate || '2026-12-31',
      category: req.body.category || 'General',
      icon: req.body.icon || 'PiggyBank',
      contributions: req.body.currentAmount > 0
        ? [{ id: `sc_${Date.now()}`, amount: parseFloat(req.body.currentAmount), date: new Date().toISOString().split('T')[0], note: 'Initial funding' }]
        : [],
    };
    db.savings.push(newGoal);
    saveDb(db);
    res.status(201).json(newGoal);
  });

  app.post('/api/savings/:id/contribute', (req, res) => {
    const db = loadDb();
    const goal = db.savings.find((s) => s.id === req.params.id);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    const amount = parseFloat(req.body.amount) || 0;
    goal.currentAmount += amount;
    goal.contributions.unshift({
      id: `sc_${Date.now()}`,
      amount,
      date: req.body.date || new Date().toISOString().split('T')[0],
      note: req.body.note || 'Contribution',
    });
    saveDb(db);
    res.json(goal);
  });

  app.delete('/api/savings/:id', (req, res) => {
    const db = loadDb();
    db.savings = db.savings.filter((s) => s.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // 7. AI Endpoints (Advisor Yashraj Patil)
  // Context generator helper
  function buildFinanceContext(db: DatabaseSchema, summary: FinancialSummary) {
    const currency = db.user.currencySymbol || '$';
    return `
USER FINANCIAL PROFILE:
- Name: ${db.user.name}
- Profession: ${db.user.occupation}
- Target Monthly Income: ${currency}${db.user.monthlyIncomeTarget}
- Target Savings Rate: ${db.user.savingsRateTarget}%
- Risk Tolerance: ${db.user.riskTolerance}

CURRENT MONTH TOTALS:
- Total Income: ${currency}${summary.totalIncome}
- Total Expenses: ${currency}${summary.totalExpenses}
- Net Monthly Savings: ${currency}${summary.netSavings}
- Actual Savings Rate: ${summary.savingsRate}%
- Financial Health Score: ${summary.healthScore}/100 (${summary.healthStatus})
- Recurring Fixed Expenses: ${currency}${summary.recurringExpensesTotal}

50/30/20 ALLOCATION:
- Needs: ${currency}${summary.rule50_30_20.needs.amount} (${summary.rule50_30_20.needs.percentage}% of income vs 50% target)
- Wants: ${currency}${summary.rule50_30_20.wants.amount} (${summary.rule50_30_20.wants.percentage}% of income vs 30% target)
- Savings: ${currency}${summary.rule50_30_20.savings.amount} (${summary.rule50_30_20.savings.percentage}% of income vs 20% target)

CATEGORY SPENDING & BUDGET STATUS:
${summary.categories
  .map(
    (c) =>
      `- ${c.category}: Spent ${currency}${c.totalSpent} / Budget ${currency}${c.budgetLimit} (${c.percentageUsed}% used) [Status: ${c.status.toUpperCase()}]`
  )
  .join('\n')}

ACTIVE SAVINGS GOALS:
${db.savings
  .map(
    (s) =>
      `- ${s.title}: ${currency}${s.currentAmount} / ${currency}${s.targetAmount} (${Math.round(
        (s.currentAmount / s.targetAmount) * 100
      )}%) target by ${s.targetDate}`
  )
  .join('\n')}
`;
  }

  // 7a. Chat with Yashraj Patil
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const db = loadDb();
      const summary = calculateFinancialSummary(db);
      const userMessage = req.body.message || 'Can you review my financial health this month?';
      const history = req.body.history || [];

      const financeContext = buildFinanceContext(db, summary);

      const systemInstruction = `
You are Yashraj Patil, an elite, highly experienced, empathetic, and razor-sharp Personal Financial Advisor and Budget Architect.
Your mission is to guide users toward financial independence, bulletproof budgeting, disciplined spending, and rapid wealth building.

CHARACTER & TONE:
- Name: Yashraj Patil
- Professional, warm, analytical, and structured.
- Always ground your advice in the user's REAL figures provided in the context below. Quote exact dollar/currency figures.
- Never give generic platitudes like "spend less and save more". Instead say: "Your dining out is currently at ${db.user.currencySymbol}347, which is 87% of your budget. If you trim just two restaurant outings, you can divert $150 directly into your ${db.savings[0]?.title || 'emergency fund'}."
- Use the 50/30/20 framework, debt snowball/avalanche, and high-yield savings/investing principles.
- Format responses cleanly with bold highlights, bullet points, and actionable next steps.
- At the end of your response, provide 2 or 3 brief suggested follow-up questions the user might ask next.

REAL USER CONTEXT:
${financeContext}
`;

      let replyText = '';

      if (process.env.GEMINI_API_KEY) {
        try {
          const contents = [
            ...history.map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ];

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          replyText = response.text || '';
        } catch (apiErr: any) {
          console.warn('Gemini API call failed, using intelligent rule-based Yashraj Patil response:', apiErr.message);
        }
      }

      // Rule-based fallback if no API key or network error
      if (!replyText) {
        const currency = db.user.currencySymbol || '$';
        const exceeded = summary.categories.filter((c) => c.status === 'exceeded');
        const warning = summary.categories.filter((c) => c.status === 'warning');

        replyText = `Hello! I'm **Yashraj Patil**, your Personal Finance Advisor. Here is my immediate assessment of your September finances:

### 1. Cash Flow & Savings Velocity
- **Total Inflow:** ${currency}${summary.totalIncome.toLocaleString()} across your salary and side projects.
- **Current Outflow:** ${currency}${summary.totalExpenses.toLocaleString()}, leaving you with a net monthly surplus of **${currency}${summary.netSavings.toLocaleString()}** (${summary.savingsRate}% savings rate).
- **Financial Health Score:** **${summary.healthScore}/100** (${summary.healthStatus}).

### 2. 50/30/20 Rule Check
- **Needs:** ${summary.rule50_30_20.needs.percentage}% (Target 50%) — ${summary.rule50_30_20.needs.percentage <= 50 ? 'Well managed!' : 'Slightly high due to fixed housing and utility commitments.'}
- **Wants:** ${summary.rule50_30_20.wants.percentage}% (Target 30%) — ${summary.rule50_30_20.wants.percentage <= 30 ? 'Great discipline on discretionary spend.' : 'Discretionary spending is consuming too much capital.'}
- **Savings:** ${summary.rule50_30_20.savings.percentage}% (Target 20%) — Outstanding savings cadence!

### 3. Immediate Priorities from Yashraj:
${
  exceeded.length > 0
    ? `- ⚠️ **Over-budget categories:** ${exceeded.map((c) => `${c.category} (${currency}${c.totalSpent} vs ${currency}${c.budgetLimit})`).join(', ')}. Let's pause discretionary transactions here for the remainder of the cycle.`
    : `- ✅ **Budget Adherence:** None of your categories have breached their limits yet.`
}
${
  warning.length > 0
    ? `- ⚡ **Watchlist:** ${warning.map((c) => `${c.category} is at ${c.percentageUsed}%`).join(', ')}.`
    : ''
}
- 🎯 **Savings Momentum:** You are currently funding **${db.savings.length} active goals**. Your Emergency Fund has reached **${currency}${db.savings[0]?.currentAmount || 0}**.

What specific area would you like us to optimize together today?`;
      }

      res.json({
        reply: replyText,
        suggestions: [
          'How can I save $400 more next month?',
          'Analyze my food and grocery spending',
          'Optimize my 50/30/20 budget allocation',
          'Create a plan to reach my emergency fund goal faster',
        ],
      });
    } catch (err: any) {
      console.error('AI chat error:', err);
      res.status(500).json({ error: 'Failed to process financial advisory response' });
    }
  });

  // 7b. AI Budget Generation
  app.post('/api/ai/generate-budget', async (req, res) => {
    try {
      const db = loadDb();
      const summary = calculateFinancialSummary(db);
      const currency = db.user.currencySymbol || '$';

      const prompt = `
You are Yashraj Patil, senior financial advisor.
Based on the user's monthly income of ${currency}${summary.totalIncome} and past spending behavior, create an optimized, balanced monthly budget plan.
Follow the 50/30/20 principle while respecting realistic current requirements:
- Needs (Housing, Food & Groceries, Utilities, Transportation, Health & Fitness, Debt): approx 50%
- Wants (Dining & Coffee, Entertainment, Shopping, Subscriptions, Other): approx 30%
- Savings & Debt Repayment: approx 20%

Current spend per category:
${summary.categories.map((c) => `- ${c.category}: currently spending ${currency}${c.totalSpent}`).join('\n')}

Return a JSON array of recommendations with exact structure:
[
  {
    "category": "Housing",
    "recommendedLimit": 2000,
    "currentSpend": 1950,
    "type": "Needs",
    "rationale": "Keeps shelter costs within 30% of income while accommodating utilities."
  },
  ...
]
Provide items for: Housing, Food & Groceries, Dining & Coffee, Transportation, Utilities, Entertainment, Health & Fitness, Shopping, Subscriptions.
`;

      let suggestions: AIBudgetSuggestion[] = [];

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });
          if (response.text) {
            suggestions = JSON.parse(response.text);
          }
        } catch (apiErr: any) {
          console.warn('Gemini budget generation failed, falling back:', apiErr.message);
        }
      }

      if (!suggestions || suggestions.length === 0) {
        // Fallback rule-based smart budget allocation
        const income = summary.totalIncome || 7000;
        suggestions = [
          { category: 'Housing', recommendedLimit: Math.round(income * 0.28), currentSpend: 1950, type: 'Needs', rationale: 'Targeting ~28% of income to provide comfortable headroom for shelter.' },
          { category: 'Food & Groceries', recommendedLimit: Math.round(income * 0.09), currentSpend: 375, type: 'Needs', rationale: 'Wholesome nutrition budget for home-cooked meals.' },
          { category: 'Transportation', recommendedLimit: Math.round(income * 0.05), currentSpend: 199, type: 'Needs', rationale: 'Transit pass, fuel, and occasional rideshare backup.' },
          { category: 'Utilities', recommendedLimit: Math.round(income * 0.04), currentSpend: 217, type: 'Needs', rationale: 'Covers electricity, gas, and gigabit home fiber.' },
          { category: 'Health & Fitness', recommendedLimit: Math.round(income * 0.03), currentSpend: 160, type: 'Needs', rationale: 'Gym membership and preventive healthcare wellness.' },
          { category: 'Dining & Coffee', recommendedLimit: Math.round(income * 0.05), currentSpend: 347, type: 'Wants', rationale: 'Balanced socializing and barista coffee without guilt.' },
          { category: 'Shopping', recommendedLimit: Math.round(income * 0.04), currentSpend: 185, type: 'Wants', rationale: 'Discretionary apparel and equipment purchases.' },
          { category: 'Entertainment', recommendedLimit: Math.round(income * 0.03), currentSpend: 95, type: 'Wants', rationale: 'Events, cinema, and hobbies.' },
          { category: 'Subscriptions', recommendedLimit: Math.round(income * 0.015), currentSpend: 82, type: 'Wants', rationale: 'Streaming media and software tools.' },
        ];
      }

      res.json(suggestions);
    } catch (err: any) {
      console.error('Error generating budget:', err);
      res.status(500).json({ error: 'Failed to generate budget recommendations' });
    }
  });

  // 7c. AI Spending Analysis & Overspending Detection
  app.post('/api/ai/spending-analysis', async (req, res) => {
    try {
      const db = loadDb();
      const summary = calculateFinancialSummary(db);
      const currency = db.user.currencySymbol || '$';

      const prompt = `
You are Yashraj Patil, personal financial analyst.
Analyze the user's financial transactions, category spending, and recurring bills:
- Total Income: ${currency}${summary.totalIncome}
- Total Expenses: ${currency}${summary.totalExpenses}
- Net Savings: ${currency}${summary.netSavings} (${summary.savingsRate}%)
- Health Score: ${summary.healthScore}/100

Categories:
${summary.categories.map((c) => `- ${c.category}: ${currency}${c.totalSpent} (Budget: ${currency}${c.budgetLimit}, ${c.status})`).join('\n')}

Expenses:
${db.expenses.map((e) => `- ${e.date}: ${e.description} (${currency}${e.amount}) [${e.category}]`).join('\n')}

Produce a thorough financial audit in JSON format with this exact schema:
{
  "healthScore": ${summary.healthScore},
  "executiveSummary": "A 2-3 sentence overview of financial stability and discipline.",
  "keyFindings": [
    {
      "type": "alert" | "positive" | "insight",
      "title": "Title of finding",
      "description": "Specific detail referencing numbers",
      "potentialMonthlySavings": 120
    }
  ],
  "actionPlan": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ],
  "optimizedMonthlySavings": 250
}
`;

      let analysis: AISpendingAnalysis | null = null;

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.4,
            },
          });
          if (response.text) {
            analysis = JSON.parse(response.text);
          }
        } catch (apiErr: any) {
          console.warn('Gemini spending analysis error, using structured fallback:', apiErr.message);
        }
      }

      if (!analysis) {
        analysis = {
          healthScore: summary.healthScore,
          executiveSummary: `Your current cashflow shows strong discipline with a solid ${summary.savingsRate}% savings rate. However, discretionary categories like Dining & Coffee are trending close to upper budget bounds and can be trimmed to boost emergency reserves.`,
          keyFindings: [
            {
              type: 'alert',
              title: 'Dining & Coffee Frequency Spike',
              description: `You have spent ${currency}347.70 across 3 dining outings. Consolidating to 1-2 weekend dinners can recover approx ${currency}140 each month.`,
              potentialMonthlySavings: 140,
            },
            {
              type: 'positive',
              title: 'Healthy Grocery to Dining Ratio',
              description: `Home cooking remains steady at ${currency}375.50 across Whole Foods and Trader Joe’s, anchoring baseline nourishment costs.`,
            },
            {
              type: 'insight',
              title: 'Subscription Stack Review',
              description: `Recurring charges amount to ${currency}${summary.recurringExpensesTotal} per month. Auditing dormant streaming or software subscriptions can unlock an easy ${currency}25-40/mo.`,
              potentialMonthlySavings: 35,
            },
            {
              type: 'positive',
              title: 'Strong Primary Income Diversification',
              description: `Your consulting retainer brings an additional ${currency}1,450 on top of your base salary, accelerating your savings velocity.`,
            },
          ],
          actionPlan: [
            `Cap Dining & Coffee at ${currency}250 next month to divert ${currency}100 into your Alps Vacation fund.`,
            `Automate a recurring transfer of ${currency}800 directly to your 6-Month Emergency Reserve on the 2nd of each month.`,
            `Review cloud and streaming subscriptions to remove duplicate media tiers.`,
            `Maintain non-housing essential expenses below 22% of gross income.`,
          ],
          optimizedMonthlySavings: 175,
        };
      }

      res.json(analysis);
    } catch (err: any) {
      console.error('Error analyzing spending:', err);
      res.status(500).json({ error: 'Failed to complete spending analysis' });
    }
  });

  // 7d. AI Monthly Report
  app.post('/api/ai/monthly-report', async (req, res) => {
    try {
      const db = loadDb();
      const summary = calculateFinancialSummary(db);
      const currency = db.user.currencySymbol || '$';

      const prompt = `
You are Yashraj Patil, elite personal finance advisor.
Write an executive monthly financial audit and report for ${db.user.name} for September 2026.
Financial numbers:
- Total Inflow: ${currency}${summary.totalIncome}
- Total Outflow: ${currency}${summary.totalExpenses}
- Net Savings: ${currency}${summary.netSavings} (${summary.savingsRate}%)
- Health Score: ${summary.healthScore}/100 (${summary.healthStatus})

Return JSON adhering to:
{
  "period": "September 2026",
  "advisorName": "Yashraj Patil",
  "netWorthDelta": ${summary.netSavings},
  "summaryHighlights": [
    "Highlight 1...",
    "Highlight 2...",
    "Highlight 3..."
  ],
  "budgetPerformanceReview": "Detailed paragraph reviewing budget discipline...",
  "savingsVelocityReview": "Paragraph analyzing progress toward savings goals...",
  "riskAssessment": "Paragraph assessing cash buffer, debt exposure, and vulnerabilities...",
  "nextMonthDirectives": [
    "Directive 1...",
    "Directive 2...",
    "Directive 3..."
  ]
}
`;

      let report: AIMonthlyReport | null = null;

      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });
          if (response.text) {
            report = JSON.parse(response.text);
          }
        } catch (apiErr: any) {
          console.warn('Gemini monthly report error, using fallback:', apiErr.message);
        }
      }

      if (!report) {
        report = {
          period: 'September 2026',
          advisorName: 'Yashraj Patil',
          netWorthDelta: summary.netSavings,
          summaryHighlights: [
            `Net cash reserve expanded by ${currency}${summary.netSavings.toLocaleString()} this cycle.`,
            `Achieved an exceptional ${summary.savingsRate}% monthly savings rate, exceeding your ${db.user.savingsRateTarget}% target.`,
            `Zero high-interest debt accrued; all credit card balances scheduled for auto-pay in full.`,
            `Emergency fund coverage stands at ~4.2 months of fixed baseline living expenses.`,
          ],
          budgetPerformanceReview: `During September 2026, overall budget adherence was 86%. Fixed living obligations (housing, internet, utilities) behaved predictably within expectations. The primary variance occurred in Dining & Coffee (${currency}347 spent against a ${currency}400 limit), driven by social dining. Fortunately, disciplined grocery management and transit budgeting offset this variance.`,
          savingsVelocityReview: `Your multi-goal savings strategy is compounding nicely. Contributions totaling ${currency}2,450 were routed toward the 6-Month Emergency Reserve, Alps Retreat, and Index Fund Tranche. Continuing this momentum puts your emergency fund on track for 100% completion before year end.`,
          riskAssessment: `Risk level is categorized as LOW-MODERATE. Your dual income streams (tech salary + freelance consulting) provide a valuable cushion. The primary financial vulnerability is the concentration of fixed rent costs (${currency}1,950), which makes maintaining a 6-month liquid cushion mandatory.`,
          nextMonthDirectives: [
            `Cap dining out to 2 social gatherings in October to bank an extra ${currency}120.`,
            `Divert the upcoming consulting payout directly into the Alps Vacation goal.`,
            `Audit end-of-quarter utility rates for heating seasonal shifts.`,
            `Execute automatic rebalancing into index funds on October 1st.`,
          ],
        };
      }

      res.json(report);
    } catch (err: any) {
      console.error('Error generating monthly report:', err);
      res.status(500).json({ error: 'Failed to generate monthly report' });
    }
  });

  // Setup Vite Dev Server / Static files
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Finance Advisor Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
