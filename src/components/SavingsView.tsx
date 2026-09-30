import React, { useState } from 'react';
import {
  Target,
  Plus,
  ShieldCheck,
  Plane,
  TrendingUp,
  Sparkles,
  Calendar,
  PiggyBank,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { SavingsGoal, UserProfile } from '../types/finance.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface SavingsViewProps {
  savings: SavingsGoal[];
  user: UserProfile;
  onCreateGoal: (goal: Partial<SavingsGoal>) => Promise<void>;
  onContributeGoal: (id: string, amount: number, note?: string) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onOpenAdvisorWithMessage: (msg: string) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  savings,
  user,
  onCreateGoal,
  onContributeGoal,
  onDeleteGoal,
  onOpenAdvisorWithMessage,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState<number>(100);
  const [contributeNote, setContributeNote] = useState<string>('Monthly allocation');

  // New goal state
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState(2500);
  const [newCurrent, setNewCurrent] = useState(0);
  const [newTargetDate, setNewTargetDate] = useState('2026-12-31');
  const [newCategory, setNewCategory] = useState<SavingsGoal['category']>('General');

  const currency = user.currency;

  const totalSavedAcrossGoals = savings.reduce((s, g) => s + g.currentAmount, 0);
  const totalTargetAcrossGoals = savings.reduce((s, g) => s + g.targetAmount, 0);
  const overallProgress =
    totalTargetAcrossGoals > 0
      ? Math.round((totalSavedAcrossGoals / totalTargetAcrossGoals) * 100)
      : 0;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onCreateGoal({
      title: newTitle,
      targetAmount: newTarget,
      currentAmount: newCurrent,
      targetDate: newTargetDate,
      category: newCategory,
    });
    setNewTitle('');
    setNewTarget(2500);
    setNewCurrent(0);
    setShowAddModal(false);
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId || contributeAmount <= 0) return;
    await onContributeGoal(contributeGoalId, contributeAmount, contributeNote);
    setContributeGoalId(null);
    setContributeAmount(100);
  };

  return (
    <div className="space-y-6">
      {/* Header and Aggregate Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Wealth Accumulation & Reserves
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-slate-400">{savings.length} Active Targets</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Savings Goals & Emergency Buffers
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Total capital saved:{' '}
            <strong className="text-white font-mono">
              {formatCurrency(totalSavedAcrossGoals, currency)}
            </strong>{' '}
            of {formatCurrency(totalTargetAcrossGoals, currency)} total milestone ({overallProgress}%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenAdvisorWithMessage(
                'Yashraj, how should I prioritize my savings between an emergency fund, short-term vacation goals, and long-term investments?'
              )
            }
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Savings Strategy</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Savings Target</span>
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savings.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                      {goal.category}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {goal.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete the "${goal.title}" savings goal?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Goal: {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all"
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                    <span>{pct}% funded</span>
                    <span>{formatCurrency(remaining, currency)} to go</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Target Deadline:</span>
                    <span className="text-slate-200 font-medium">{formatDate(goal.targetDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Contributions Logged:</span>
                    <span className="text-slate-200 font-mono">{goal.contributions.length} deposits</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                <button
                  onClick={() => {
                    setContributeGoalId(goal.id);
                    setContributeAmount(250);
                  }}
                  className="flex-1 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg text-center transition-colors"
                >
                  + Add Deposit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create New Savings Objective</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Emergency Fund"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Target Amount ({user.currencySymbol})</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTarget}
                    onChange={(e) => setNewTarget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Starting Balance ({user.currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Home">Home Purchase</option>
                    <option value="Gadget">Gadget / Tech</option>
                    <option value="Investment">Investment</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Record Savings Deposit</h3>
              <button onClick={() => setContributeGoalId(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleContributeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Deposit Amount ({user.currencySymbol})</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-base focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Deposit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Side project bonus transfer"
                  value={contributeNote}
                  onChange={(e) => setContributeNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
