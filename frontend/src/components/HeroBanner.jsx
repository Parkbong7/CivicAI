import React from 'react';

export default function HeroBanner({ t }) {
  const title = t?.hero?.title || 'Your AI-Powered Government Service Assistant';
  const subtitle = t?.hero?.subtitle || 'Discover. Understand. Apply — effortlessly.';

  return (
    <div className="mx-8 mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#dcebff] via-[#eaf2fd] to-[#dcebff] border border-[#cbe1fb] shadow-xs">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>

      <div className="px-8 py-5 flex items-center justify-between relative z-10">
        
        {/* Left: Laptop & Checklist Graphic */}
        <div className="shrink-0 hidden md:flex items-center gap-2">
          <svg viewBox="0 0 140 100" className="w-28 h-20 drop-shadow-md">
            {/* Plant leaf behind laptop */}
            <path d="M 15 75 C 5 50, 20 30, 28 20 C 35 35, 30 55, 18 75 Z" fill="#34d399" opacity="0.8"/>
            <path d="M 28 75 C 22 55, 38 40, 48 35 C 50 50, 42 65, 30 75 Z" fill="#10b981" opacity="0.9"/>
            
            {/* Laptop Base */}
            <path d="M 15 88 L 125 88 C 128 88, 130 90, 128 92 L 120 95 L 20 95 L 12 92 C 10 90, 12 88, 15 88 Z" fill="#94a3b8"/>
            <path d="M 55 89 L 85 89 C 86 89, 87 90, 85 91 L 83 92 L 57 92 L 55 91 C 54 90, 54 89, 55 89 Z" fill="#cbd5e1"/>

            {/* Laptop Screen Bezel */}
            <rect x="25" y="15" width="90" height="73" rx="4" fill="#1e293b"/>
            {/* Screen Inner Display */}
            <rect x="28" y="18" width="84" height="67" rx="2" fill="#ffffff"/>

            {/* Document Checklist Graphic on Screen */}
            <rect x="36" y="24" width="46" height="55" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
            
            {/* Checklist lines with checkmarks */}
            <circle cx="43" cy="34" r="3.5" fill="#10b981"/>
            <path d="M 41.5 34 L 42.5 35.5 L 44.5 32.5" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <rect x="50" y="32.5" width="24" height="3" rx="1.5" fill="#94a3b8"/>

            <circle cx="43" cy="44" r="3.5" fill="#10b981"/>
            <path d="M 41.5 44 L 42.5 45.5 L 44.5 42.5" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <rect x="50" y="42.5" width="26" height="3" rx="1.5" fill="#94a3b8"/>

            <circle cx="43" cy="54" r="3.5" fill="#10b981"/>
            <path d="M 41.5 54 L 42.5 55.5 L 44.5 52.5" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <rect x="50" y="52.5" width="20" height="3" rx="1.5" fill="#94a3b8"/>

            <circle cx="43" cy="64" r="3.5" fill="#3b82f6"/>
            <rect x="50" y="62.5" width="22" height="3" rx="1.5" fill="#cbd5e1"/>
          </svg>
        </div>

        {/* Center: Headline & Subtitle */}
        <div className="text-center md:text-left flex-1 md:ml-4">
          <h2 className="text-lg md:text-xl font-extrabold text-[#0d1e4c] tracking-tight">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            {subtitle}
          </p>
        </div>

        {/* Right: Architectural Government Dome Silhouette */}
        <div className="shrink-0 hidden lg:block opacity-75">
          <svg viewBox="0 0 170 85" className="w-40 h-20 fill-current text-slate-400/80">
            <path d="M 85 8 C 76 8, 70 20, 68 28 L 102 28 C 100 20, 94 8, 85 8 Z" fill="#94a3b8"/>
            <rect x="83.5" y="2" width="3" height="6" fill="#64748b"/>
            <circle cx="85" cy="2" r="2" fill="#64748b"/>
            <rect x="65" y="28" width="40" height="10" rx="1" fill="#cbd5e1"/>
            <line x1="70" y1="28" x2="70" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="76" y1="28" x2="76" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="85" y1="28" x2="85" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="94" y1="28" x2="94" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1="100" y1="28" x2="100" y2="38" stroke="#94a3b8" strokeWidth="1.5"/>
            <polygon points="85,38 55,47 115,47" fill="#94a3b8"/>
            <rect x="52" y="47" width="66" height="3" fill="#64748b"/>
            <rect x="54" y="50" width="62" height="25" fill="#f1f5f9" opacity="0.6"/>
            <line x1="58" y1="50" x2="58" y2="75" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="66" y1="50" x2="66" y2="75" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="74" y1="50" x2="74" y2="75" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="82" y1="50" x2="82" y2="75" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="88" y1="50" x2="88" y2="75" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="96" y1="50" x2="96" y2="75" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="104" y1="50" x2="104" y2="75" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="112" y1="50" x2="112" y2="75" stroke="#94a3b8" strokeWidth="2"/>
            <rect x="15" y="55" width="39" height="20" fill="#cbd5e1" opacity="0.7"/>
            <rect x="116" y="55" width="39" height="20" fill="#cbd5e1" opacity="0.7"/>
            <circle cx="25" cy="65" r="2.5" fill="#64748b"/>
            <circle cx="35" cy="65" r="2.5" fill="#64748b"/>
            <circle cx="45" cy="65" r="2.5" fill="#64748b"/>
            <circle cx="125" cy="65" r="2.5" fill="#64748b"/>
            <circle cx="135" cy="65" r="2.5" fill="#64748b"/>
            <circle cx="145" cy="65" r="2.5" fill="#64748b"/>
            <rect x="5" y="75" width="160" height="3" fill="#64748b"/>
            <rect x="0" y="78" width="170" height="4" fill="#94a3b8"/>
          </svg>
        </div>

      </div>

    </div>
  );
}
