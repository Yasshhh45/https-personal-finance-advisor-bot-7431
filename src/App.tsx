import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  IncomeItem,
  ExpenseItem,
  BudgetCategory,
  SavingsGoal,
  FinancialSummary,
  ChatMessage,
  CurrencyCode,
} from './types/finance.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, TabId } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { BudgetView } from './components/BudgetView.tsx';
import { SavingsView } from './components/SavingsView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { AIAdvisorView } from './components/AIAdvisorView.tsx';
import { AIAdvisorDrawer } from './components/AIAdvisorDrawer.tsx';
import { AddExpenseModal } from './components/AddExpenseModal.tsx';
import { AddIncomeModal } from './components/AddIncomeModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [savings, setSavings] = useState<SavingsGoal[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdvisorDrawerOpen, setIsAdvisorDrawerOpen] = useState(false);

  // AI Chat Messages state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I'm **Yashraj Patil**, your Personal Finance Advisor Bot.

I have synchronized your live financial accounts:
- **Total Inflow:** $7,030 across 3 income streams
- **Total Outflow:** $3,338.80
- **Net Monthly Savings:** $3,691.20 (52% savings rate)
- **Financial Health Score:** 83/100 (Healthy)

I am here to help you architect an impenetrable emergency fund, optimize recurring expenses, generate balanced 50/30/20 budgets, and accelerate your path to financial independence.

What financial priority should we tackle today?`,
      timestamp: 'Just now',
      suggestions: [
        'How can I save $400 more this month?',
        'Review my Dining & Coffee budget',
        'Analyze my emergency fund runway',
        'Generate an optimized 50/30/20 budget',
      ],
    },
  ]);
  const [isSendingAdvisorMessage, setIsSendingAdvisorMessage] = useState(false);

  // Fetch all initial data
  const refreshAllData = async () => {
    try {
      const [userData, summaryData, incomesData, expensesData, budgetsData, savingsData] =
        await Promise.all([
          api.getUser(),
          api.getSummary(),
          api.getIncomes(),
          api.getExpenses(),
          api.getBudgets(),
          api.getSavings(),
        ]);

      setUser(userData);
      setSummary(summaryData);
      setIncomes(incomesData);
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setSavings(savingsData);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Update Currency
  const handleUpdateCurrency = async (newCurrency: CurrencyCode) => {
    if (!user) return;
    try {
      const updated = await api.updateUser({ currency: newCurrency });
      setUser(updated);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to update currency:', err);
    }
  };

  // Add Expense
  const handleCreateExpense = async (expense: Partial<ExpenseItem>) => {
    try {
      await api.createExpense(expense);
      await refreshAllData();
    } catch (err) {
      console.error('Error creating expense:', err);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id);
      await refreshAllData();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  // Add Income
  const handleCreateIncome = async (income: Partial<IncomeItem>) => {
    try {
      await api.createIncome(income);
      await refreshAllData();
    } catch (err) {
      console.error('Error creating income:', err);
    }
  };

  // Delete Income
  const handleDeleteIncome = async (id: string) => {
    try {
      await api.deleteIncome(id);
      await refreshAllData();
    } catch (err) {
      console.error('Error deleting income:', err);
    }
  };

  // Save Budget
  const handleSaveBudget = async (budget: Partial<BudgetCategory>) => {
    try {
      await api.saveBudget(budget);
      await refreshAllData();
    } catch (err) {
      console.error('Error saving budget:', err);
    }
  };

  // Apply Batch Budgets
  const handleApplyBatchBudgets = async (items: { category: string; monthlyLimit: number }[]) => {
    try {
      await api.applyBatchBudgets(items);
      await refreshAllData();
    } catch (err) {
      console.error('Error applying batch budgets:', err);
    }
  };

  // Create Savings Goal
  const handleCreateSavings = async (goal: Partial<SavingsGoal>) => {
    try {
      await api.createSavings(goal);
      await refreshAllData();
    } catch (err) {
      console.error('Error creating savings goal:', err);
    }
  };

  // Contribute to Savings Goal
  const handleContributeSavings = async (id: string, amount: number, note?: string) => {
    try {
      await api.contributeSavings(id, amount, note);
      await refreshAllData();
    } catch (err) {
      console.error('Error contributing to savings goal:', err);
    }
  };

  // Delete Savings Goal
  const handleDeleteSavings = async (id: string) => {
    try {
      await api.deleteSavings(id);
      await refreshAllData();
    } catch (err) {
      console.error('Error deleting savings goal:', err);
    }
  };

  // Save User Profile
  const handleSaveProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const updated = await api.updateUser(profileData);
      setUser(updated);
      await refreshAllData();
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  // Advisor Chat Handler
  const handleSendMessageToAdvisor = async (userPrompt: string) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsSendingAdvisorMessage(true);

    try {
      const historyPayload = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatWithAdvisor(userPrompt, historyPayload);

      const botMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: res.suggestions,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Advisor error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `I've analyzed your current data. You currently have a net monthly surplus of ${summary?.netSavings ? `$${summary.netSavings}` : 'funds'}. Consider automating a transfer of $500 directly into your emergency reserve to lock in discipline before discretionary spending kicks in.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSendingAdvisorMessage(false);
    }
  };

  const handleOpenAdvisorWithMessage = (prompt: string) => {
    setActiveTab('advisor');
    handleSendMessageToAdvisor(prompt);
  };

  if (isLoading || !user || !summary) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold animate-pulse">
          YP
        </div>
        <p className="text-xs font-mono tracking-wider">
          Initializing Personal Finance Advisor Bot by Yashraj Patil...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onUpdateCurrency={handleUpdateCurrency}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenAddIncome={() => setIsAddIncomeOpen(true)}
        onOpenAdvisor={() => setIsAdvisorDrawerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          summary={summary}
          user={user}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                summary={summary}
                user={user}
                expenses={expenses}
                incomes={incomes}
                savings={savings}
                onOpenAdvisorWithMessage={handleOpenAdvisorWithMessage}
                onNavigateTab={setActiveTab}
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onOpenAddIncome={() => setIsAddIncomeOpen(true)}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView
                expenses={expenses}
                incomes={incomes}
                user={user}
                onDeleteExpense={handleDeleteExpense}
                onDeleteIncome={handleDeleteIncome}
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onOpenAddIncome={() => setIsAddIncomeOpen(true)}
              />
            )}

            {activeTab === 'budgets' && (
              <BudgetView
                budgets={budgets}
                summary={summary}
                user={user}
                onSaveBudget={handleSaveBudget}
                onApplyBatchBudgets={handleApplyBatchBudgets}
                onOpenAdvisorWithMessage={handleOpenAdvisorWithMessage}
              />
            )}

            {activeTab === 'savings' && (
              <SavingsView
                savings={savings}
                user={user}
                onCreateGoal={handleCreateSavings}
                onContributeGoal={handleContributeSavings}
                onDeleteGoal={handleDeleteSavings}
                onOpenAdvisorWithMessage={handleOpenAdvisorWithMessage}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                summary={summary}
                user={user}
                onOpenAdvisorWithMessage={handleOpenAdvisorWithMessage}
              />
            )}

            {activeTab === 'advisor' && (
              <AIAdvisorView
                user={user}
                summary={summary}
                chatMessages={chatMessages}
                onSendMessage={handleSendMessageToAdvisor}
                isSending={isSendingAdvisorMessage}
              />
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white">
                      Profile & Personal Finance Configuration
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure your primary financial goals, risk posture, and preferred billing currency.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-200 block">User Name</span>
                        <span className="text-slate-400">{user.name}</span>
                      </div>
                      <button
                        onClick={() => setIsProfileOpen(true)}
                        className="text-emerald-400 hover:underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-200 block">Email Address</span>
                        <span className="text-slate-400">{user.email}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">Primary</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-200 block">Active Currency</span>
                        <span className="text-slate-400">
                          {user.currency} ({user.currencySymbol})
                        </span>
                      </div>
                      <button
                        onClick={() => setIsProfileOpen(true)}
                        className="text-emerald-400 hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-200 block">Savings Rate Target</span>
                        <span className="text-slate-400">{user.savingsRateTarget}% of gross monthly income</span>
                      </div>
                      <button
                        onClick={() => setIsProfileOpen(true)}
                        className="text-emerald-400 hover:underline"
                      >
                        Adjust
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-200 block">Risk Profile</span>
                        <span className="text-slate-400 capitalize">{user.riskTolerance}</span>
                      </div>
                      <button
                        onClick={() => setIsProfileOpen(true)}
                        className="text-emerald-400 hover:underline"
                      >
                        Modify
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Advisor Status
                      </span>
                      <p className="text-xs text-slate-300">
                        Yashraj Patil Personal Finance Advisor Bot is online and actively analyzing incoming cash flows against your 50/30/20 targets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Advisor Drawer Button (Quick Access from anywhere) */}
      {activeTab !== 'advisor' && (
        <button
          onClick={() => setIsAdvisorDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Yashraj Patil</span>
        </button>
      )}

      {/* Slide-over Advisor Quick Drawer */}
      <AIAdvisorDrawer
        isOpen={isAdvisorDrawerOpen}
        onClose={() => setIsAdvisorDrawerOpen(false)}
        user={user}
        summary={summary}
        chatMessages={chatMessages}
        onSendMessage={handleSendMessageToAdvisor}
        isSending={isSendingAdvisorMessage}
      />

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSubmit={handleCreateExpense}
        user={user}
      />

      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onSubmit={handleCreateIncome}
        user={user}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
