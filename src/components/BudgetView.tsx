import React, { useState } from 'react';
import {
  Sparkles,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Edit2,
  Save,
  X,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  BudgetCategory,
  CategorySummary,
  ExpenseCategory,
  FinancialSummary,
  UserProfile,
  AIBudgetSuggestion,
} from '../types/finance.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { api } from '../services/api.ts';

interface BudgetViewProps {
  budgets: BudgetCategory[];
  summary: FinancialSummary;
  user: UserProfile;
  onSaveBudget: (budget: Partial<BudgetCategory>) => Promise<void>;
  onApplyBatchBudgets: (items: { category: string; monthlyLimit: number }[]) => Promise<void>;
  onOpenAdvisorWithMessage: (msg: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  summary,
  user,
  onSaveBudget,
  onApplyBatchBudgets,
  onOpenAdvisorWithMessage,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState<number>(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIBudgetSuggestion[] | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const currency = user.currency;

  const handleStartEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setEditLimit(currentLimit);
  };

  const handleSaveEdit = async (category: ExpenseCategory) => {
    await onSaveBudget({
      category,
      monthlyLimit: editLimit,
    });
    setEditingCategory(null);
  };

  const handleGenerateAIBudget = async () => {
    setIsGeneratingAI(true);
    try {
      const suggestions = await api.generateAIBudget();
      setAiSuggestions(suggestions);
      setShowAIModal(true);
    } catch (err) {
      console.error('Failed to generate AI budget:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAISuggestions = async () => {
    if (!aiSuggestions) return;
    const batch = aiSuggestions.map((s) => ({
      category: s.category,
      monthlyLimit: s.recommendedLimit,
    }));
    await onApplyBatchBudgets(batch);
    setShowAIModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Budget Planning Engine
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-slate-400">Target Envelope System</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Monthly Expense Caps & Category Controls
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Total active budget cap:{' '}
            <strong className="text-white font-mono">
              {formatCurrency(summary.budgetTotalLimit, currency)}
            </strong>{' '}
            ({summary.totalBudgetSpentPercentage}% utilized so far).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAIBudget}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingAI ? 'Architecting Plan...' : 'Generate AI Budget with Yashraj'}</span>
          </button>
        </div>
      </div>

      {/* 50/30/20 Rule Targets Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Needs (50% Standard)</span>
            <span className="text-sky-400 font-mono font-semibold">
              {summary.rule50_30_20.needs.percentage}% actual
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatCurrency(summary.rule50_30_20.needs.amount, currency)}
          </div>
          <div className="text-[11px] text-slate-500">
            Suggested benchmark: {formatCurrency(summary.totalIncome * 0.5, currency)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Wants (30% Standard)</span>
            <span className="text-amber-400 font-mono font-semibold">
              {summary.rule50_30_20.wants.percentage}% actual
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatCurrency(summary.rule50_30_20.wants.amount, currency)}
          </div>
          <div className="text-[11px] text-slate-500">
            Suggested benchmark: {formatCurrency(summary.totalIncome * 0.3, currency)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Savings (20% Target)</span>
            <span className="text-emerald-400 font-mono font-semibold">
              {summary.rule50_30_20.savings.percentage}% actual
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatCurrency(summary.rule50_30_20.savings.amount, currency)}
          </div>
          <div className="text-[11px] text-slate-500">
            Target savings benchmark: {formatCurrency(summary.totalIncome * 0.2, currency)}
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.categories.map((cat) => {
          const isEditing = editingCategory === cat.category;
          const remaining = cat.budgetLimit - cat.totalSpent;

          return (
            <div
              key={cat.category}
              className={`p-4 rounded-xl border bg-slate-900/80 transition-all space-y-3 ${
                cat.status === 'exceeded'
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : cat.status === 'warning'
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    {cat.category}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {cat.transactionCount} transaction{cat.transactionCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSaveEdit(cat.category)}
                      className="p-1 rounded text-emerald-400 hover:bg-slate-800"
                      title="Save limit"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1 rounded text-slate-400 hover:bg-slate-800"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(cat.category, cat.budgetLimit)}
                    className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                    title="Edit category budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress and Numbers */}
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Spent:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(cat.totalSpent, currency)}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400">Limit:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-mono">{user.currencySymbol}</span>
                      <input
                        type="number"
                        value={editLimit}
                        onChange={(e) => setEditLimit(parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-950 border border-slate-700 text-xs text-white rounded px-1.5 py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    <span className="font-mono text-slate-300">
                      {formatCurrency(cat.budgetLimit, currency)}
                    </span>
                  )}
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
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

                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <span
                    className={
                      cat.status === 'exceeded'
                        ? 'text-rose-400 font-semibold'
                        : cat.status === 'warning'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }
                  >
                    {cat.percentageUsed}% used
                  </span>
                  <span className={remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {remaining >= 0
                      ? `${formatCurrency(remaining, currency)} remaining`
                      : `${formatCurrency(Math.abs(remaining), currency)} over budget`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Budget Generator Modal */}
      {showAIModal && aiSuggestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Yashraj Patil's Recommended Budget Architecture
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formulated based on your monthly income of {formatCurrency(summary.totalIncome, currency)}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {aiSuggestions.map((item) => (
                <div key={item.category} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{item.category}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                        ({item.type})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-md">{item.rationale}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(item.recommendedLimit, currency)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Current spend: {formatCurrency(item.currentSpend, currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
              <button
                onClick={handleApplyAISuggestions}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
              >
                Apply AI Budget Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
