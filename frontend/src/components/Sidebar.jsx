import React from 'react';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  LayoutGrid, 
  HelpCircle, 
  ShieldCheck,
  Landmark
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, t }) {
  const menuItems = [
    { id: 'dashboard', label: t?.nav?.dashboard || 'Dashboard', icon: Home },
    { id: 'chat', label: t?.nav?.aiAssistant || 'AI Assistant', icon: MessageSquare },
    { id: 'applications', label: t?.nav?.myApplications || 'My Applications', icon: FileText },
    { id: 'services', label: t?.nav?.govServices || 'Government Services', icon: LayoutGrid },
    { id: 'help', label: t?.nav?.helpSupport || 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#0a1226] text-white flex flex-col justify-between shrink-0 select-none border-r border-slate-800/80 min-h-screen">
      
      {/* Top Brand & Menu */}
      <div>
        {/* Brand Header */}
        <div className="pt-7 pb-6 px-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-sky-400 mb-3 shadow-lg shadow-sky-500/10">
            <Landmark className="w-8 h-8 text-sky-400 stroke-[1.8]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            CivicPilot <span className="text-sky-400 font-extrabold">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">
            Smart. Simple. Autonomous.
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1e5ce0] text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 stroke-[2] ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Middle Monument Silhouette + Bottom Security Badge */}
      <div className="px-5 pb-6 pt-4 flex flex-col items-center space-y-5">
        
        {/* Digital India Monument Silhouette */}
        <div className="w-full flex flex-col items-center text-center opacity-85">
          <svg viewBox="0 0 160 50" className="w-36 h-12 text-slate-600/70 fill-current">
            <path d="M 10 45 L 10 38 L 18 38 L 18 30 L 22 30 L 22 25 L 30 25 L 30 20 L 38 20 L 38 15 L 42 12 L 46 15 L 46 20 L 54 20 L 54 25 L 62 25 L 62 30 L 66 30 L 66 38 L 74 38 L 74 45 Z" fill="#334155" opacity="0.6"/>
            <path d="M 68 45 L 68 25 L 75 25 L 75 10 L 80 5 L 85 10 L 85 25 L 92 25 L 92 45 Z" fill="#475569" opacity="0.8"/>
            <path d="M 86 45 L 86 38 L 94 38 L 94 30 L 98 30 L 98 25 L 106 25 L 106 20 L 114 20 L 114 15 L 118 12 L 122 15 L 122 20 L 130 20 L 130 25 L 138 25 L 138 30 L 142 30 L 142 38 L 150 38 L 150 45 Z" fill="#334155" opacity="0.6"/>
            <rect x="73" y="28" width="14" height="17" rx="7" fill="#0a1226"/>
            <line x1="5" y1="46" x2="155" y2="46" stroke="#475569" strokeWidth="1.5"/>
          </svg>

          {/* Indian Tricolor Wave Line */}
          <div className="w-24 h-1 flex rounded-full overflow-hidden my-2">
            <div className="flex-1 bg-[#ff9933]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-[#138808]"></div>
          </div>

          <p className="text-[11px] font-bold text-slate-300 leading-tight">
            Digital India.
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            Empowered Citizens.
          </p>
        </div>

        {/* Secure & Trusted Card */}
        <div className="w-full bg-[#111c38]/90 border border-slate-700/60 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white leading-snug">Secure & Trusted</div>
            <div className="text-[9px] text-slate-400 leading-tight truncate">Government-Grade Security.</div>
          </div>
        </div>

      </div>

    </aside>
  );
}
