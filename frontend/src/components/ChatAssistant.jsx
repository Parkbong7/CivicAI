import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function ChatAssistant({ 
  messages, 
  onSendMessage, 
  loading, 
  applicantProfile, 
  missingFields = [], 
  onStartAutomation,
  readyForAutomation 
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "I am a college student. I want to find and apply for a scholarship.",
    "My family income is 1.8 Lakhs per year, CGPA is 8.6, studying B.Tech at DTU.",
    "Check my eligibility for the Post-Matric Scholarship Scheme.",
    "Start autonomous application form filling."
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handlePromptClick = (p) => {
    if (loading) return;
    onSendMessage(p);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              CivicPilot AI Assistant
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800">Gemini Powered</span>
            </h3>
            <p className="text-[11px] text-slate-500">Natural language understanding & citizen guidance</p>
          </div>
        </div>

        {readyForAutomation && (
          <button
            onClick={onStartAutomation}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs animate-pulse"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Ready to Auto-Fill</span>
          </button>
        )}
      </div>

      {/* Extracted Profile Ribbon */}
      {applicantProfile?.name && (
        <div className="px-4 py-2 bg-blue-50/80 border-b border-blue-100 text-[11px] flex items-center justify-between text-blue-900 overflow-x-auto">
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              {applicantProfile.name}
            </span>
            {applicantProfile.college_name && (
              <span className="text-blue-700/80 truncate max-w-[140px]">
                {applicantProfile.college_name}
              </span>
            )}
            {applicantProfile.annual_income && (
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                ₹{Number(applicantProfile.annual_income).toLocaleString()} / yr
              </span>
            )}
            {applicantProfile.gpa_percentage && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                {applicantProfile.gpa_percentage} Score
              </span>
            )}
          </div>
          {missingFields.length > 0 && (
            <span className="text-[10px] text-amber-700 font-medium shrink-0 ml-2">
              Missing: {missingFields.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-100/90 text-slate-800 rounded-tl-xs border border-slate-200/60'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                {m.time && (
                  <div className={`text-[9px] mt-1.5 ${isUser ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                    {m.time}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-500 border border-slate-200 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>CivicPilot is analyzing request & checking official schemes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Try:
        </span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handlePromptClick(p)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition shrink-0 whitespace-nowrap shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your needs or citizen details (e.g., college, marks, family income)..."
          disabled={loading}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className={`p-2 rounded-xl text-white transition shadow-xs ${
            !input.trim() || loading
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
