import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight 
} from 'lucide-react';

export default function YourApplicationsSection({ 
  applications = [], 
  onViewAll, 
  onSelectApplication,
  t
}) {
  // Localization helpers
  const getLocalizedTitle = (rawTitle) => {
    if (rawTitle.includes('Scholarship') || rawTitle.includes('छात्रवृत्ति') || rawTitle.includes('शिष्यवृत्ती')) {
      return t?.services?.scholarship || rawTitle;
    }
    if (rawTitle.includes('Licence') || rawTitle.includes('लाइसेंस') || rawTitle.includes('परवाना')) {
      return t?.services?.licence || rawTitle;
    }
    if (rawTitle.includes('Subsidy') || rawTitle.includes('सब्सिडी') || rawTitle.includes('अनुदान')) {
      return t?.services?.subsidy || rawTitle;
    }
    return rawTitle;
  };

  const getLocalizedStatus = (status) => {
    if (status === 'Completed' || status === 'submitted') return t?.yourApps?.completed || 'Completed';
    if (status === 'In Progress' || status === 'in_progress') return t?.yourApps?.inProgress || 'In Progress';
    if (status === 'Draft' || status === 'draft') return t?.yourApps?.draft || 'Draft';
    return status;
  };

  // Demo applications matching the exact reference image
  const defaultApps = [
    {
      id: 'app-1',
      reference: 'SCH-2026-1047',
      title: 'Scholarship Application',
      status: 'Completed',
      statusColor: 'bg-[#eaf8f1] text-[#10b981] border border-emerald-200',
      icon: CheckCircle2,
      iconBg: 'bg-[#eaf8f1] text-[#10b981]',
      date: 'Oct 28, 2026'
    },
    {
      id: 'app-2',
      reference: 'LIC-2026-0213',
      title: 'Licence Renewal',
      status: 'In Progress',
      statusColor: 'bg-[#e8f1fd] text-[#1e5ce0] border border-blue-200',
      icon: Clock,
      iconBg: 'bg-[#e8f1fd] text-[#1e5ce0]',
      date: 'Oct 27, 2026'
    },
    {
      id: 'app-3',
      reference: 'SUB-2026-0089',
      title: 'Subsidy Claim',
      status: 'Draft',
      statusColor: 'bg-[#f1f5f9] text-[#475569] border border-slate-200',
      icon: FileText,
      iconBg: 'bg-[#f3edfc] text-[#8b5cf6]',
      date: 'Oct 26, 2026'
    }
  ];

  // If real submitted applications exist in DB, prepend them to the list
  const displayApps = applications.length > 0
    ? [
        ...applications.slice(0, 2).map((a, i) => ({
          id: a.id || `real-${i}`,
          reference: a.reference_number || 'SCH-2026-LIVE',
          title: a.scheme_title || 'Scholarship Application',
          status: a.status === 'submitted' ? 'Completed' : 'In Progress',
          statusColor: a.status === 'submitted' 
            ? 'bg-[#eaf8f1] text-[#10b981] border border-emerald-200' 
            : 'bg-[#e8f1fd] text-[#1e5ce0] border border-blue-200',
          icon: a.status === 'submitted' ? CheckCircle2 : Clock,
          iconBg: a.status === 'submitted' ? 'bg-[#eaf8f1] text-[#10b981]' : 'bg-[#e8f1fd] text-[#1e5ce0]',
          date: 'Nov 20, 2026',
          receiptData: a.receipt_data
        })),
        defaultApps[1]
      ].slice(0, 3)
    : defaultApps;

  return (
    <div className="mx-8 mt-6 mb-8 space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm">
          {t?.yourApps?.title || 'Your Applications'}
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#1e5ce0] hover:text-blue-800 flex items-center gap-1 transition"
        >
          <span>{t?.yourApps?.viewAll || 'View All'}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      {/* 3 Cards Horizontal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayApps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onSelectApplication && onSelectApplication(item)}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-sm hover:border-slate-300 transition cursor-pointer group"
            >
              {/* Left icon and details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 tracking-tight truncate">
                    {item.reference}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {getLocalizedTitle(item.title)}
                  </p>
                </div>
              </div>

              {/* Right status and date */}
              <div className="text-right shrink-0">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.statusColor}`}>
                  {getLocalizedStatus(item.status)}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {item.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
