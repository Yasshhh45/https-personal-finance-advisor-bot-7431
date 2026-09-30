import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  FinancialSummary,
  UserProfile,
  ExpenseItem,
  IncomeItem,
  SavingsGoal,
} from '../types/finance.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface DashboardViewProps {
  summary: FinancialSummary;
  user: UserProfile;
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  savings: SavingsGoal[];
  onOpenAdvisorWithMessage: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  user,
  expenses,
  incomes,
  savings,
  onOpenAdvisorWithMessage,
  onNavigateTab,
  onOpenAddExpense,
  onOpenAddIncome,
}) => {
  const currency = user.currency;

  // Recent transactions sorted by date
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const exceededCategories = summary.categories.filter((c) => c.status === 'exceeded');
  const warningCategories = summary.categories.filter((c) => c.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Welcome & AI Advisor Quick Banner */}
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Advisor Yashraj Patil's Memo
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-xs text-slate-400">September 2026 Audit</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Welcome back, {user.name}. Your savings velocity is at {summary.savingsRate}%.
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {summary.savingsRate >= user.savingsRateTarget
                ? `You have exceeded your ${user.savingsRateTarget}% monthly savings target by ${summary.savingsRate - user.savingsRateTarget}%! Net savings of ${formatCurrency(summary.netSavings, currency)} can accelerate your active reserve goals.`
                : `You are currently saving ${summary.savingsRate}% against your ${user.savingsRateTarget}% goal. Trimming non-essential dining and shopping by ${formatCurrency(150, currency)} will close the gap.`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                onOpenAdvisorWithMessage(
                  'Yashraj, analyze my current spending habits and tell me where I can cut costs this month.'
                )
              }
              className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spending Audit</span>
            </button>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              Optimize Budget
            </button>
          </div>
        </div>
      </div>

      {/* 4 Hero Financial Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Monthly Inflow</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {formatCurrency(summary.totalIncome, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
            <span>{incomes.length} income stream{incomes.length > 1 ? 's' : ''}</span>
            <span className="text-emerald-400 font-medium">
              Target: {formatCurrency(user.monthlyIncomeTarget, currency)}
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Monthly Outflow</span>
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {formatCurrency(summary.totalExpenses, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
            <span>Fixed bills: {formatCurrency(summary.recurringExpensesTotal, currency)}</span>
            <span className="text-slate-400 font-medium font-mono">
              {summary.totalBudgetSpentPercentage}% of budget
            </span>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Monthly Surplus</span>
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {formatCurrency(summary.netSavings, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
            <span>Savings Rate: <strong className="text-slate-200">{summary.savingsRate}%</strong></span>
            <span className="text-slate-400">Goal: {user.savingsRateTarget}%</span>
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Financial Health Index</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {summary.healthScore}
              <span className="text-sm font-normal text-slate-500">/100</span>
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                summary.healthScore >= 75
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : summary.healthScore >= 50
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {summary.healthStatus}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
            <span>Emergency Runway:</span>
            <span className="text-slate-200 font-medium">4.2 Months</span>
          </div>
        </div>
      </div>

      {/* 50/30/20 Balanced Rule Deep Dive */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              50 / 30 / 20 Budget Distribution Framework
            </h3>
            <p className="text-xs text-slate-400">
              Personalized allocation of your {formatCurrency(summary.totalIncome, currency)} monthly income.
            </p>
          </div>
          <button
            onClick={() =>
              onOpenAdvisorWithMessage(
                'Yashraj, how does my current 50/30/20 breakdown compare with optimal personal finance benchmarks?'
              )
            }
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ask Yashraj for 50/30/20 advice</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Triple Progress Track */}
        <div className="space-y-3">
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${Math.min(100, summary.rule50_30_20.needs.percentage)}%` }}
              className="bg-sky-500 h-full transition-all"
            ></div>
            <div
              style={{ width: `${Math.min(100, summary.rule50_30_20.wants.percentage)}%` }}
              className="bg-amber-500 h-full transition-all"
            ></div>
            <div
              style={{ width: `${Math.min(100, summary.rule50_30_20.savings.percentage)}%` }}
              className="bg-emerald-500 h-full transition-all"
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Needs */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  Needs & Essentials
                </span>
                <span className="font-mono text-slate-400">
                  {summary.rule50_30_20.needs.percentage}% / 50%
                </span>
              </div>
              <div className="text-base font-bold font-mono text-white">
                {formatCurrency(summary.rule50_30_20.needs.amount, currency)}
              </div>
              <p className="text-[11px] text-slate-500">
                Housing, groceries, utilities, transit & health.
              </p>
            </div>

            {/* Wants */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Wants & Discretionary
                </span>
                <span className="font-mono text-slate-400">
                  {summary.rule50_30_20.wants.percentage}% / 30%
                </span>
              </div>
              <div className="text-base font-bold font-mono text-white">
                {formatCurrency(summary.rule50_30_20.wants.amount, currency)}
              </div>
              <p className="text-[11px] text-slate-500">
                Dining out, entertainment, shopping, media.
              </p>
            </div>

            {/* Savings */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Savings & Investments
                </span>
                <span className="font-mono text-emerald-400">
                  {summary.rule50_30_20.savings.percentage}% / 20%
                </span>
              </div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {formatCurrency(summary.rule50_30_20.savings.amount, currency)}
              </div>
              <p className="text-[11px] text-slate-500">
                Emergency reserve, investments, travel funds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Category Spending Alerts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Budget Tracker */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Category Spending & Budget Limits
            </h3>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Manage Budgets
            </button>
          </div>

          {exceededCategories.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Budget Exceeded Alert: </span>
                {exceededCategories.map((c) => `${c.category} (${formatCurrency(c.totalSpent, currency)})`).join(', ')}. Yashraj recommends holding off on further spend in these categories.
              </div>
            </div>
          )}

          <div className="space-y-3">
            {summary.categories.slice(0, 5).map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{cat.category}</span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-300">
                      {formatCurrency(cat.totalSpent, currency)}
                    </span>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-400">
                      {formatCurrency(cat.budgetLimit, currency)}
                    </span>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                        cat.status === 'exceeded'
                          ? 'bg-rose-500/20 text-rose-300'
                          : cat.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {cat.percentageUsed}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, cat.percentageUsed)}%` }}
                    className={`h-full rounded-full transition-all ${
                      cat.status === 'exceeded'
                        ? 'bg-rose-500'
                        : cat.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Recent Transactions
            </h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View All ({expenses.length})
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-medium text-slate-200">{tx.description}</div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span>{tx.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(tx.date)}</span>
                    {tx.recurring && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-sky-400">Recurring</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="font-mono font-semibold text-rose-400">
                  -{formatCurrency(tx.amount, currency)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={onOpenAddExpense}
              className="flex-1 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-center transition-colors"
            >
              + Add Expense
            </button>
            <button
              onClick={onOpenAddIncome}
              className="flex-1 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-center transition-colors"
            >
              + Add Income
            </button>
          </div>
        </div>
      </div>

      {/* Savings Goals Highlights */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Active Savings Objectives
            </h3>
            <p className="text-xs text-slate-400">
              Capital allocated across emergency safety nets and milestone targets.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('savings')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Manage Goals
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savings.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div
                key={goal.id}
                className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/70 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{goal.title}</h4>
                    <span className="text-[11px] text-slate-500">{goal.category}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400">{pct}%</span>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all"
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">
                    {formatCurrency(goal.currentAmount, currency)}
                  </span>
                  <span className="text-slate-500">
                    Target: {formatCurrency(goal.targetAmount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
