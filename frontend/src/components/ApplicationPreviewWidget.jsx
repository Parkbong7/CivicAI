import React from 'react';
import { 
  FileText, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function ApplicationPreviewWidget({ 
  onReviewDetails, 
  applicantProfile, 
  waitingApproval, 
  isSubmitted,
  t
}) {
  const hasName = Boolean(applicantProfile?.name && applicantProfile.name.trim());
  const course = applicantProfile?.course || (hasName ? 'College Student' : (t?.services?.scholarship || 'Scholarship Scheme'));
  const income = applicantProfile?.annual_income 
    ? `₹${Number(applicantProfile.annual_income).toLocaleString()}/year` 
    : (hasName ? 'Income Verified' : (t?.preview?.awaitingDetails || 'Awaiting Details'));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-700 stroke-[2]" />
          <h3 className="font-bold text-slate-900 text-sm">
            {t?.preview?.title || 'Application Preview'}
          </h3>
        </div>

        <button
          onClick={onReviewDetails}
          className="text-xs font-semibold text-[#1e5ce0] hover:text-blue-800 flex items-center gap-1 transition"
        >
          <span>{t?.preview?.reviewDetails || 'Review Details'}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
        </button>
      </div>

      {/* Card Content */}
      <div 
        onClick={onReviewDetails}
        className="bg-[#f8fafc] border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 flex items-start gap-3 transition cursor-pointer group"
      >
        {/* Document Icon in Blue Badge */}
        <div className="w-9 h-9 rounded-xl bg-[#e8f1fd] text-[#1e5ce0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <FileText className="w-5 h-5 stroke-[1.8]" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="font-bold text-slate-900 text-xs truncate">
            {hasName ? `${applicantProfile.name}'s Scholarship` : (t?.services?.scholarship || 'Student Scholarship Application')}
          </h4>
          <p className="text-[11px] text-slate-500 truncate">
            {course} | {income}
          </p>

          <div className="pt-0.5">
            {isSubmitted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf8f1] text-[#10b981] border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{t?.preview?.submitted || 'Submitted & Approved'}</span>
              </span>
            ) : waitingApproval ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#92400e] border border-amber-200 animate-pulse">
                <Clock className="w-3 h-3 text-amber-700 stroke-[2.5]" />
                <span>{t?.preview?.awaitingApproval || 'Awaiting Your Approval'}</span>
              </span>
            ) : hasName ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f1fd] text-[#1e5ce0] border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>{t?.preview?.profileExtracted || 'Profile Extracted'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <span>💬 {t?.preview?.awaitingDetails || 'Awaiting details via chat'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
