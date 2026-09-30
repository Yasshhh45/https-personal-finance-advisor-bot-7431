import React, { useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { IncomeCategory, IncomeItem, UserProfile } from '../types/finance.ts';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (income: Partial<IncomeItem>) => Promise<void>;
  user: UserProfile;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<IncomeCategory>('Salary');
  const [frequency, setFrequency] = useState<IncomeItem['frequency']>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories: IncomeCategory[] = [
    'Salary',
    'Freelancing',
    'Investments',
    'Business',
    'Rental Income',
    'Bonus',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !amount || Number(amount) <= 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        source,
        amount: Number(amount),
        category,
        frequency,
        date,
        notes,
      });
      setSource('');
      setAmount('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Record Income Stream</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Income Source / Payer</label>
            <input
              type="text"
              required
              placeholder="e.g. Primary Tech Job, UI Freelance Client, Dividend"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">
                Amount ({user.currencySymbol})
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncomeCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="one-time">One-Time / Lump Sum</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Date Received</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Optional Notes</label>
            <input
              type="text"
              placeholder="e.g. Net after tax withholding"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
