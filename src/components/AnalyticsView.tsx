import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  FinancialSummary,
  UserProfile,
  AIMonthlyReport,
  AISpendingAnalysis,
} from '../types/finance.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { api } from '../services/api.ts';

interface AnalyticsViewProps {
  summary: FinancialSummary;
  user: UserProfile;
  onOpenAdvisorWithMessage: (msg: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  summary,
  user,
  onOpenAdvisorWithMessage,
}) => {
  const [report, setReport] = useState<AIMonthlyReport | null>(null);
  const [analysis, setAnalysis] = useState<AISpendingAnalysis | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const currency = user.currency;

  const handleGenerateReport = async () => {
    setIsLoadingReport(true);
    try {
      const data = await api.getAIMonthlyReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleRunSpendingAudit = async () => {
    setIsLoadingAnalysis(true);
    try {
      const data = await api.getAISpendingAnalysis();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to run spending audit:', err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Find max amount in monthly trends for scaling
  const maxTrendAmount = Math.max(
    ...summary.monthlyTrends.map((t) => Math.max(t.income, t.expenses))
  );

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Financial Intelligence & Analytics
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-slate-400">Comprehensive Reporting Engine</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Cash Flow Analytics & Advisor Reports
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Evaluate multi-month cash flow dynamics, category burn rates, and receive verified financial audits signed by Yashraj Patil.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSpendingAudit}
            disabled={isLoadingAnalysis}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isLoadingAnalysis ? 'Auditing Trends...' : 'AI Spending Audit'}</span>
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isLoadingReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isLoadingReport ? 'Compiling Audit...' : 'Generate Monthly Audit Report'}</span>
          </button>
        </div>
      </div>

      {/* Monthly Cash Flow Trend Visualization */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Multi-Month Cash Flow Momentum
            </h3>
            <p className="text-xs text-slate-400">
              Inflow vs Outflow comparison across recent billing cycles.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
              Inflow (Income)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-400"></span>
              Outflow (Expenses)
            </span>
          </div>
        </div>

        {/* Custom Bar Comparison Chart */}
        <div className="h-56 pt-6 flex items-end justify-between gap-4 border-b border-slate-800 pb-2">
          {summary.monthlyTrends.map((trend) => {
            const incomeHeight = Math.max(10, Math.round((trend.income / maxTrendAmount) * 160));
            const expenseHeight = Math.max(10, Math.round((trend.expenses / maxTrendAmount) * 160));

            return (
              <div key={trend.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-2 h-44">
                  {/* Income Bar */}
                  <div
                    style={{ height: `${incomeHeight}px` }}
                    className="w-5 sm:w-8 bg-emerald-500/80 hover:bg-emerald-400 rounded-t transition-all group relative"
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-emerald-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap z-10">
                      +{formatCurrency(trend.income, currency)}
                    </div>
                  </div>

                  {/* Expense Bar */}
                  <div
                    style={{ height: `${expenseHeight}px` }}
                    className="w-5 sm:w-8 bg-rose-500/80 hover:bg-rose-400 rounded-t transition-all group relative"
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-rose-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-800 whitespace-nowrap z-10">
                      -{formatCurrency(trend.expenses, currency)}
                    </div>
                  </div>
                </div>

                <div className="text-center font-mono">
                  <span className="text-xs font-semibold text-slate-300 block">{trend.month}</span>
                  <span className="text-[10px] text-emerald-400 block">
                    Net: {formatCurrency(trend.savings, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending Analysis Panel */}
      {analysis && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Yashraj Patil's Deep Spending Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Potential monthly cost optimization: <strong className="text-emerald-400 font-mono">+{formatCurrency(analysis.optimizedMonthlySavings, currency)}/month</strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
              Health: {analysis.healthScore}/100
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            {analysis.executiveSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.keyFindings.map((finding, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold ${
                      finding.type === 'alert'
                        ? 'text-rose-400'
                        : finding.type === 'positive'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {finding.title}
                  </span>
                  {finding.potentialMonthlySavings && (
                    <span className="text-[11px] font-mono text-emerald-400">
                      Save +{formatCurrency(finding.potentialMonthlySavings, currency)}/mo
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{finding.description}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-1.5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Target Execution Steps:
            </span>
            <ul className="space-y-1 text-xs text-slate-300">
              {analysis.actionPlan.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Full Monthly Audit Report View */}
      {report && (
        <div id="monthly-report-print" className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5 print:bg-white print:text-black print:border-none">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Certified Financial Audit
                </span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs text-slate-400">{report.period}</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Executive Financial Review for {user.name}
              </h3>
              <p className="text-xs text-slate-400">
                Prepared by Advisor: <strong className="text-slate-200">{report.advisorName}</strong>
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          {/* Key Audit Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Net Monthly Surplus</span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                +{formatCurrency(report.netWorthDelta, currency)}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Monthly Savings Rate</span>
              <div className="text-lg font-bold font-mono text-white">
                {summary.savingsRate}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Financial Health Rating</span>
              <div className="text-lg font-bold font-mono text-amber-400">
                {summary.healthScore}/100 ({summary.healthStatus})
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Key Audit Highlights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {report.summaryHighlights.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded bg-slate-950/60 border border-slate-800/60">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span className="text-slate-300">{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Narrative */}
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
              <h5 className="font-semibold text-slate-200">Budget Performance & Variance</h5>
              <p className="text-slate-400">{report.budgetPerformanceReview}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
              <h5 className="font-semibold text-slate-200">Savings Velocity & Goal Trajectory</h5>
              <p className="text-slate-400">{report.savingsVelocityReview}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
              <h5 className="font-semibold text-slate-200">Risk Assessment & Vulnerability Scan</h5>
              <p className="text-slate-400">{report.riskAssessment}</p>
            </div>
          </div>

          {/* Next Month Directives */}
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Yashraj Patil's Directives for Next Billing Cycle:
            </h5>
            <ol className="space-y-1 text-xs text-slate-300 list-decimal list-inside">
              {report.nextMonthDirectives.map((d, idx) => (
                <li key={idx} className="leading-relaxed">{d}</li>
              ))}
            </ol>
          </div>

          {/* Signoff */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Advisor: Yashraj Patil, Lead FinTech Planning Architect</span>
            <span>Generated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
