import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  BarChart3,
  Bot,
  Settings,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { FinancialSummary, UserProfile } from '../types/finance.ts';
import { formatCurrency } from '../utils/formatters.ts';

export type TabId =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'savings'
  | 'analytics'
  | 'advisor'
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  summary: FinancialSummary | null;
  user: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  summary,
  user,
}) => {
  const navItems = [
    { id: 'dashboard' as TabId, label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions' as TabId, label: 'Income & Expenses', icon: Receipt },
    { id: 'budgets' as TabId, label: 'Budget Planner', icon: PiggyBank },
    { id: 'savings' as TabId, label: 'Savings Goals', icon: Target },
    { id: 'analytics' as TabId, label: 'Analytics & Audit', icon: BarChart3 },
    { id: 'advisor' as TabId, label: 'Yashraj Patil (AI)', icon: Bot, highlight: true },
    { id: 'settings' as TabId, label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <p className="text-[11px] font-medium tracking-wider text-slate-500 uppercase px-3 mb-2">
            Finance Management
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-slate-900 text-emerald-400 font-semibold border border-slate-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-emerald-400'
                          : item.highlight
                          ? 'text-emerald-500'
                          : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 50/30/20 Mini Snapshot */}
        {summary && (
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/70 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">50/30/20 Rule Status</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {summary.savingsRate}% saved
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800/50">
                <span className="block text-[10px] text-slate-500 uppercase">Needs</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {summary.rule50_30_20.needs.percentage}%
                </span>
              </div>
              <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800/50">
                <span className="block text-[10px] text-slate-500 uppercase">Wants</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {summary.rule50_30_20.wants.percentage}%
                </span>
              </div>
              <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800/50">
                <span className="block text-[10px] text-slate-500 uppercase">Savings</span>
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  {summary.rule50_30_20.savings.percentage}%
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, summary.rule50_30_20.needs.percentage)}%` }}
                className="bg-sky-500 h-full"
                title={`Needs: ${summary.rule50_30_20.needs.percentage}%`}
              ></div>
              <div
                style={{ width: `${Math.min(100, summary.rule50_30_20.wants.percentage)}%` }}
                className="bg-amber-500 h-full"
                title={`Wants: ${summary.rule50_30_20.wants.percentage}%`}
              ></div>
              <div
                style={{ width: `${Math.min(100, summary.rule50_30_20.savings.percentage)}%` }}
                className="bg-emerald-500 h-full"
                title={`Savings: ${summary.rule50_30_20.savings.percentage}%`}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Advisor Profile Footnote */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
            YP
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Yashraj Patil
            </div>
            <div className="text-[11px] text-slate-500">
              Personal Finance Advisor
            </div>
          </div>
        </div>

        {summary && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <span>Financial Health:</span>
            <span
              className={`font-semibold ${
                summary.healthScore >= 75
                  ? 'text-emerald-400'
                  : summary.healthScore >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {summary.healthScore}/100 ({summary.healthStatus})
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
