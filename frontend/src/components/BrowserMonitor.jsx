import React from 'react';
import { 
  Globe, 
  Lock, 
  ExternalLink, 
  Terminal, 
  Maximize2, 
  RefreshCw, 
  ShieldCheck, 
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function BrowserMonitor({ 
  screenshotUrl, 
  currentUrl, 
  activeField, 
  logs = [], 
  status,
  portalUrl = 'http://127.0.0.1:8000/demo-portal',
  onTriggerApproval,
  waitingApproval 
}) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md flex flex-col h-full overflow-hidden text-slate-200">
      
      {/* Browser Chrome Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Mac-style window dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            Playwright Browser Agent
          </span>
        </div>

        {/* URL Address Bar */}
        <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate text-[11px] text-slate-300">{currentUrl || portalUrl}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href={portalUrl}
            target="_blank"
            rel="noreferrer"
            title="Open real demo portal in external tab"
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <span>Live Tab</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Active Action / Banner Indicator */}
      <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="text-slate-400 text-[11px]">Agent Action:</span>
          <span className="font-semibold text-sky-300 text-[11px]">
            {activeField ? `Entering ${activeField}...` : status === 'waiting_approval' ? 'PAUSED: Waiting for Citizen Approval' : status === 'running' ? 'Navigating & Filling form...' : status === 'completed' ? 'Workflow Submitted & Receipt Issued' : 'Standby / Ready'}
          </span>
        </div>

        {waitingApproval && (
          <button
            onClick={onTriggerApproval}
            className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 transition animate-pulse"
          >
            Review & Approve Now
          </button>
        )}
      </div>

      {/* Browser Viewport View */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[220px]">
        {screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt="Playwright Realtime Screen"
            className="w-full h-full object-contain select-none"
          />
        ) : (
          <div className="text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-sky-400 shadow-inner">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Playwright Live Viewport</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                Real-time browser screenshots stream directly as the agent interacts with form fields.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Execution Terminal / Logs */}
      <div className="h-32 bg-slate-950 border-t border-slate-800 p-2.5 flex flex-col font-mono text-[10px]">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80 text-slate-400 text-[9px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 font-bold">
            <Terminal className="w-3 h-3 text-emerald-400" />
            Autonomous Execution Logs
          </span>
          <span className="text-emerald-400">Headless Engine Active</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-1">
          {logs.slice(-8).map((log, i) => (
            <div key={i} className="leading-tight flex items-start gap-1.5">
              <span className="text-sky-500 shrink-0">›</span>
              <span className="text-slate-300">{log}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-400 italic">No execution events yet. Start the agent to inspect live Playwright activity.</div>
          )}
        </div>
      </div>

    </div>
  );
}
