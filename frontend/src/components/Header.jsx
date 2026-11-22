import React from 'react';
import { 
  Shield, 
  Sparkles, 
  Globe, 
  Terminal, 
  UserCheck, 
  Layers,
  HelpCircle,
  Play
} from 'lucide-react';

export default function Header({ 
  mode, 
  setMode, 
  onLoadPersona, 
  backendStatus,
  onStartAutomation,
  automationRunning,
  waitingApproval
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
      
      {/* Left: Mode Badge & Quick Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Agent Online</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* Dual Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setMode('demo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              mode === 'demo'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Mode 2: Demo Portal Automation</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold ml-1">E2E Flow</span>
          </button>

          <button
            onClick={() => setMode('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              mode === 'live'
                ? 'bg-white text-teal-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Mode 1: Live Govt Discovery</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold ml-1">Live Web</span>
          </button>
        </div>
      </div>

      {/* Right: Quick Action Persona & Controls */}
      <div className="flex items-center gap-3">
        {/* Fill Demo Student Persona Button */}
        <button
          onClick={onLoadPersona}
          title="Autofill college student test persona (Priya Sharma, DTU, 8.6 CGPA, 1.8L Income)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Test Persona:</span> Priya Sharma
        </button>

        {/* Start / Review Button */}
        {waitingApproval ? (
          <button
            onClick={onStartAutomation}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow transition animate-bounce"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Review & Approve</span>
          </button>
        ) : (
          <button
            onClick={onStartAutomation}
            disabled={automationRunning}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition shadow ${
              automationRunning
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {automationRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Running Playwright...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Playwright Agent</span>
              </>
            )}
          </button>
        )}
      </div>

    </header>
  );
}
