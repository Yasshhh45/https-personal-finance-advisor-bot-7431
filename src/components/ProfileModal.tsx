import React, { useState } from 'react';
import { X, User, Settings, ShieldCheck } from 'lucide-react';
import { UserProfile, CurrencyCode } from '../types/finance.ts';
import { CURRENCY_SYMBOLS } from '../utils/formatters.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [occupation, setOccupation] = useState(user.occupation);
  const [currency, setCurrency] = useState<CurrencyCode>(user.currency);
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(user.monthlyIncomeTarget);
  const [savingsRateTarget, setSavingsRateTarget] = useState(user.savingsRateTarget);
  const [riskTolerance, setRiskTolerance] = useState(user.riskTolerance);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currencies: CurrencyCode[] = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProfile({
        name,
        email,
        occupation,
        currency,
        currencySymbol: CURRENCY_SYMBOLS[currency],
        monthlyIncomeTarget,
        savingsRateTarget,
        riskTolerance,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Financial Profile & Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Occupation / Profession</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Active Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c} ({CURRENCY_SYMBOLS[c]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Risk Profile</label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="conservative">Conservative (Capital Preservation)</option>
                <option value="moderate">Moderate (Balanced Growth)</option>
                <option value="aggressive">Aggressive (Wealth Maximization)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">
                Target Monthly Inflow ({CURRENCY_SYMBOLS[currency]})
              </label>
              <input
                type="number"
                min={0}
                value={monthlyIncomeTarget}
                onChange={(e) => setMonthlyIncomeTarget(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Target Savings Rate (%)</label>
              <input
                type="number"
                min={1}
                max={90}
                value={savingsRateTarget}
                onChange={(e) => setSavingsRateTarget(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
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
              disabled={isSaving}
              className="px-4 py-1.5 font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
