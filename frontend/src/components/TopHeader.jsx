import React, { useState } from 'react';
import { 
  User, 
  Globe, 
  ChevronDown, 
  LogOut
} from 'lucide-react';

export default function TopHeader({ 
  onToggleBrowser, 
  browserStatus, 
  studentName = "Student",
  currentLang = 'en',
  onChangeLang,
  t,
  onLogout
}) {
  const [langOpen, setLangOpen] = useState(false);

  const languageOptions = [
    { code: 'en', label: 'English', short: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)', short: 'हिंदी' },
    { code: 'mr', label: 'मराठी (Marathi)', short: 'मराठी' },
    { code: 'ta', label: 'தமிழ் (Tamil)', short: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు (Telugu)', short: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা (Bengali)', short: 'বাংলা' }
  ];

  const currentOption = languageOptions.find(l => l.code === currentLang) || languageOptions[0];

  return (
    <header className="px-8 py-4 bg-transparent flex items-center justify-between shrink-0">
      
      {/* Left: User Welcome */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-full bg-[#1e5ce0] text-white flex items-center justify-center font-bold text-base shadow-sm ring-4 ring-blue-50">
          <User className="w-6 h-6 text-white stroke-[2]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
            {t?.header?.hello || 'Hello'}, {studentName}!
          </h2>
          <p className="text-xs text-slate-500 font-normal flex items-center gap-1">
            <span>{t?.header?.workDone || "Let's get your government work done."}</span>
            <span className="text-amber-500">✨</span>
          </p>
        </div>
      </div>

      {/* Right: Actions (Language & Browser Trigger) - Bell removed */}
      <div className="flex items-center gap-3">
        


        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:border-blue-400 hover:bg-slate-50 transition shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentOption.short}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs text-slate-700 animate-in fade-in duration-100">
              {languageOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    if (onChangeLang) onChangeLang(opt.code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 transition font-medium flex items-center justify-between ${
                    currentLang === opt.code ? 'bg-blue-50/80 text-blue-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {currentLang === opt.code && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out Action */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-200 transition shadow-2xs cursor-pointer"
            title="Sign Out of Citizen Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        )}

      </div>

    </header>
  );
}
