import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ChatMessage, FinancialSummary, UserProfile } from '../types/finance.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { api } from '../services/api.ts';

interface AIAdvisorViewProps {
  user: UserProfile;
  summary: FinancialSummary;
  chatMessages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isSending: boolean;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({
  user,
  summary,
  chatMessages,
  onSendMessage,
  isSending,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currency = user.currency;

  const quickPrompts = [
    'How can I save $400 more this month without feeling deprived?',
    'Review my Dining & Coffee vs Grocery expenses',
    'Am I following the 50/30/20 rule properly?',
    'Calculate my emergency fund runway in months',
    'What should be my strategy to reach financial freedom faster?',
    'Identify duplicate or recurring subscription leakage',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;
    const msg = inputMessage;
    setInputMessage('');
    await onSendMessage(msg);
  };

  const handleQuickPromptClick = async (prompt: string) => {
    if (isSending) return;
    await onSendMessage(prompt);
  };

  // Helper to format text with simple markdown (bold, lists, headers)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-white mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header 2
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Bullet list item
      if (line.startsWith('- ')) {
        const itemText = line.replace('- ', '');
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 my-0.5 leading-relaxed">
            {formatBold(itemText)}
          </li>
        );
      }
      // Blank line
      if (!line.trim()) {
        return <div key={idx} className="h-2"></div>;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-slate-300 leading-relaxed my-1">
          {formatBold(line)}
        </p>
      );
    });
  };

  // Helper for bold formatting (**bold**)
  const formatBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden">
      {/* Advisor Header Profile Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-sm font-bold text-white shadow-md">
              YP
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Yashraj Patil
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Personal Finance Advisor Bot
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live context connected to your {formatCurrency(summary.totalIncome, currency)} income & {summary.categories.length} budget categories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Savings:</span>
          <span className="text-emerald-400 font-bold">{summary.savingsRate}%</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Health:</span>
          <span className="text-amber-400 font-bold">{summary.healthScore}/100</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
        {chatMessages.map((msg) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {isAssistant ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    YP
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-xl p-4 space-y-2 ${
                  isAssistant
                    ? 'bg-slate-950/80 border border-slate-800/80 text-slate-200'
                    : 'bg-emerald-600 text-white font-medium ml-12'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">
                    {isAssistant ? 'Yashraj Patil' : user.name}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="text-xs leading-relaxed">
                  {isAssistant ? renderFormattedContent(msg.content) : msg.content}
                </div>

                {/* Suggestions chips attached to message */}
                {isAssistant && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Follow-up Questions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickPromptClick(s)}
                          disabled={isSending}
                          className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-left"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              YP
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Yashraj is calculating numbers and drafting your advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-slate-800/70 bg-slate-950/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" /> Quick Ask:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleQuickPromptClick(prompt)}
            disabled={isSending}
            className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Yashraj about budgeting, debt paydown, 50/30/20 balance, or cutting expenses..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Consult</span>
          </button>
        </form>
      </div>
    </div>
  );
};
