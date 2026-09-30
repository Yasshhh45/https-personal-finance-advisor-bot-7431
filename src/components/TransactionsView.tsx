import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Repeat,
  CreditCard,
  Building,
} from 'lucide-react';
import {
  ExpenseItem,
  IncomeItem,
  ExpenseCategory,
  IncomeCategory,
  UserProfile,
} from '../types/finance.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';

interface TransactionsViewProps {
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  user: UserProfile;
  onDeleteExpense: (id: string) => void;
  onDeleteIncome: (id: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  expenses,
  incomes,
  user,
  onDeleteExpense,
  onDeleteIncome,
  onOpenAddExpense,
  onOpenAddIncome,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const currency = user.currency;

  // Combine and sort
  const combinedList = useMemo(() => {
    const list: Array<
      | (ExpenseItem & { itemType: 'expense' })
      | (IncomeItem & { itemType: 'income' })
    > = [];

    if (filterType === 'all' || filterType === 'expense') {
      expenses.forEach((e) => list.push({ ...e, itemType: 'expense' }));
    }
    if (filterType === 'all' || filterType === 'income') {
      incomes.forEach((i) => list.push({ ...i, itemType: 'income' }));
    }

    return list
      .filter((item) => {
        const title = item.itemType === 'expense' ? item.description : item.source;
        const matchesSearch =
          title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat =
          categoryFilter === 'all' || item.category === categoryFilter;

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, incomes, filterType, searchQuery, categoryFilter]);

  // Total sums of currently filtered items
  const filteredExpenseTotal = combinedList
    .filter((i) => i.itemType === 'expense')
    .reduce((s, i) => s + i.amount, 0);

  const filteredIncomeTotal = combinedList
    .filter((i) => i.itemType === 'income')
    .reduce((s, i) => s + i.amount, 0);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = ['Type', 'Description/Source', 'Category', 'Amount', 'Date', 'PaymentMethod/Frequency', 'Recurring'];
    const rows = combinedList.map((item) => {
      if (item.itemType === 'expense') {
        return [
          'Expense',
          `"${item.description.replace(/"/g, '""')}"`,
          item.category,
          item.amount,
          item.date,
          item.paymentMethod,
          item.recurring ? 'Yes' : 'No',
        ];
      } else {
        return [
          'Income',
          `"${item.source.replace(/"/g, '""')}"`,
          item.category,
          item.amount,
          item.date,
          item.frequency,
          'N/A',
        ];
      }
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FinanceAdvisor_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Transaction Ledger & Financial Activity
          </h2>
          <p className="text-xs text-slate-400">
            Track, filter, and audit every incoming dollar and expense transaction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
            <span>+ Expense</span>
          </button>
          <button
            onClick={onOpenAddIncome}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ Income</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Segmented Type Filter */}
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800/80 self-start">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({expenses.length + incomes.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'expense'
                  ? 'bg-slate-800 text-rose-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'income'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Incomes ({incomes.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by description or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Ledger Balance Highlights */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
          <div>
            Showing <strong className="text-slate-200">{combinedList.length}</strong> record{combinedList.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-4">
            <span>
              Inflow:{' '}
              <strong className="text-emerald-400">
                +{formatCurrency(filteredIncomeTotal, currency)}
              </strong>
            </span>
            <span>
              Outflow:{' '}
              <strong className="text-rose-400">
                -{formatCurrency(filteredExpenseTotal, currency)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 overflow-hidden">
        {combinedList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <p>No transactions match your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setFilterType('all');
              }}
              className="text-emerald-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction / Source</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {combinedList.map((item) => {
                  const isExpense = item.itemType === 'expense';
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-md ${
                              isExpense
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {isExpense ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100">
                              {isExpense ? item.description : item.source}
                            </span>
                            {item.notes && (
                              <p className="text-[11px] text-slate-500">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {formatDate(item.date)}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {isExpense ? (
                          <div className="flex items-center gap-1.5">
                            <span>{item.paymentMethod}</span>
                            {item.recurring && (
                              <span className="text-sky-400 flex items-center gap-0.5">
                                <Repeat className="w-3 h-3" />
                                <span>Recurring</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="capitalize">{item.frequency} deposit</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        <span className={isExpense ? 'text-rose-400' : 'text-emerald-400'}>
                          {isExpense ? '-' : '+'}
                          {formatCurrency(item.amount, currency)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete this ${item.itemType} entry?`)) {
                              if (isExpense) {
                                onDeleteExpense(item.id);
                              } else {
                                onDeleteIncome(item.id);
                              }
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
