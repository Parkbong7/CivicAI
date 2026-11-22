import React from 'react';
import { 
  GraduationCap, 
  CreditCard, 
  Coins, 
  FileText, 
  ArrowRight 
} from 'lucide-react';

export default function AvailableServices({ onSelectService, onBrowseAll, t }) {
  const services = [
    {
      id: 'scholarship',
      title: t?.services?.scholarship || 'Scholarship Application',
      icon: GraduationCap,
      bg: 'bg-[#e8f1fd]',
      border: 'border-blue-100',
      iconColor: 'text-[#1e5ce0]',
      hover: 'hover:border-blue-300'
    },
    {
      id: 'licence',
      title: t?.services?.licence || 'Licence Renewal',
      icon: CreditCard,
      bg: 'bg-[#eaf8f1]',
      border: 'border-emerald-100',
      iconColor: 'text-[#10b981]',
      hover: 'hover:border-emerald-300'
    },
    {
      id: 'subsidy',
      title: t?.services?.subsidy || 'Subsidy Claim',
      icon: Coins,
      bg: 'bg-[#fef6e9]',
      border: 'border-amber-100',
      iconColor: 'text-[#f59e0b]',
      hover: 'hover:border-amber-300'
    },
    {
      id: 'other',
      title: t?.services?.other || 'Other Services',
      icon: FileText,
      bg: 'bg-[#f4edf9]',
      border: 'border-purple-100',
      iconColor: 'text-[#a855f7]',
      hover: 'hover:border-purple-300'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="font-bold text-slate-900 text-sm">
          {t?.services?.title || 'Available Services'}
        </h3>
        <button
          onClick={onBrowseAll}
          className="text-xs font-semibold text-[#1e5ce0] hover:text-blue-800 flex items-center gap-1 transition"
        >
          <span>{t?.services?.browseAll || 'Browse All'}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      {/* 4 Rounded Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => onSelectService(s.id)}
              className={`${s.bg} border ${s.border} ${s.hover} rounded-2xl p-3 flex flex-col items-center text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs group cursor-pointer`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconColor} mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
