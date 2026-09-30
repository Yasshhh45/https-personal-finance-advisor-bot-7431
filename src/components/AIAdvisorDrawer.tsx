import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
} from 'lucide-react';
import { ChatMessage, FinancialSummary, UserProfile } from '../types/finance.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface AIAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  summary: FinancialSummary | null;
  chatMessages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isSending: boolean;
}

export const AIAdvisorDrawer: React.FC<AIAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  user,
  summary,
  chatMessages,
  onSendMessage,
  isSending,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, chatMessages, isSending]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;
    const msg = inputMessage;
    setInputMessage('');
    await onSendMessage(msg);
  };

  const quickPrompts = [
    'How can I save $300 more this month?',
    'Review my Dining & Coffee budget',
    'Evaluate my 50/30/20 balance',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
              YP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Yashraj Patil</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-[10px] text-slate-400">
                Personal Finance Advisor Bot
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {chatMessages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isAssistant ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                      YP
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div
                  className={`p-3 rounded-xl max-w-[85%] space-y-1.5 ${
                    isAssistant
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                  {isAssistant && msg.suggestions && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                      {msg.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSendMessage(s)}
                          disabled={isSending}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Yashraj is calculating numbers...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/60 flex items-center gap-1 overflow-x-auto text-[11px]">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(p)}
              disabled={isSending}
              className="px-2 py-1 rounded bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Yashraj for advice..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="p-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
