import React from 'react';
import {
  Sparkles,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  MessageSquare,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { UserProfile, CurrencyCode } from '../types/finance.ts';
import { CURRENCY_SYMBOLS } from '../utils/formatters.ts';

interface NavbarProps {
  user: UserProfile;
  onUpdateCurrency: (currency: CurrencyCode) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenAdvisor: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onUpdateCurrency,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenAdvisor,
  onOpenProfile,
}) => {
  const currencies: CurrencyCode[] = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Advisor Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold tracking-tight">
          YP
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 text-sm tracking-tight">
              FinanceAdvisor
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Yashraj Patil AI Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Intelligent Budgeting, Expense Tracking & Financial Advisory
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher */}
        <div className="relative group">
          <select
            value={user.currency}
            onChange={(e) => onUpdateCurrency(e.target.value as CurrencyCode)}
            className="appearance-none bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 rounded-lg pl-2.5 pr-7 py-1.5 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c} ({CURRENCY_SYMBOLS[c]})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
        </div>

        {/* Quick Add Buttons */}
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">Record</span> Expense
        </button>

        <button
          onClick={onOpenAddIncome}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Record</span> Income
        </button>

        {/* Chat with Advisor Trigger */}
        <button
          onClick={onOpenAdvisor}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ask Yashraj</span>
        </button>

        {/* User Profile */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors ml-1"
          title="Account & Financial Settings"
        >
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
            {user.name.charAt(0)}
          </div>
        </button>
      </div>
    </header>
  );
};
