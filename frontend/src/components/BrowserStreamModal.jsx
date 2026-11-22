import React from 'react';
import { 
  X, 
  Globe, 
  Lock, 
  ExternalLink, 
  Terminal, 
  Laptop, 
  ShieldCheck, 
  Play,
  RotateCcw
} from 'lucide-react';

export default function BrowserStreamModal({ 
  isOpen, 
  onClose, 
  screenshotUrl, 
  currentUrl, 
  activeField, 
  logs = [], 
  status, 
  onStartAutomation,
  portalUrl = 'http://127.0.0.1:8000/demo-portal'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0f172a] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden text-slate-200">
        
        {/* Browser Chrome Header */}
        <div className="px-5 py-3 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" onClick={onClose} />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Laptop className="w-4 h-4 text-sky-400" />
              <span>Playwright Live Browser Monitor</span>
            </div>
          </div>

          {/* URL Address Bar */}
          <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate text-slate-300 text-[11px]">{currentUrl || portalUrl}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={portalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
            >
              <span>Open Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Status Bar */}
        <div className="px-5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="text-slate-400 text-[11px]">Action:</span>
            <span className="font-semibold text-sky-300 text-[11px]">
              {activeField ? `Typing ${activeField}...` : status === 'waiting_approval' ? 'PAUSED: Waiting for User Approval' : status === 'running' ? 'Navigating & Entering Data...' : status === 'completed' ? 'Submitted & Verified' : 'Standby / Ready'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onStartAutomation}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Restart Automation</span>
            </button>
          </div>
        </div>

        {/* Browser Viewport Screen */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[320px]">
          {screenshotUrl ? (
            <img
              src={screenshotUrl}
              alt="Playwright Realtime Screen"
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-sky-400 shadow-inner">
                <Globe className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-semibold text-slate-300">Playwright Headless Viewport</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Real-time browser screenshots stream directly as the Playwright agent navigates and fills form fields.
              </p>
            </div>
          )}
        </div>

        {/* Live Logs Terminal */}
        <div className="h-28 bg-[#0a0f1d] border-t border-slate-800 p-3 font-mono text-[10px] flex flex-col">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 text-[9px] text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Terminal className="w-3 h-3" />
              Playwright Action Logs
            </span>
            <span className="text-emerald-400">Port 8000 Connected</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-1">
            {logs.slice(-6).map((log, i) => (
              <div key={i} className="flex items-start gap-1.5 leading-tight">
                <span className="text-sky-400">›</span>
                <span>{log}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <span className="text-slate-500 italic">No logs recorded yet.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
