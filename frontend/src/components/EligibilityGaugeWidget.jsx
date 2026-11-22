import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Coins, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function EligibilityGaugeWidget({ 
  applicantProfile, 
  selectedScheme, 
  t 
}) {
  const st = t?.statutory || {};

  const hasIncome = Boolean(applicantProfile?.annual_income);
  const incomeVal = Number(applicantProfile?.annual_income || 0);
  const incomeEligible = hasIncome && incomeVal <= 250000;

  const hasScore = Boolean(applicantProfile?.gpa_percentage);
  const scoreVal = Number(applicantProfile?.gpa_percentage || 0);
  const scoreEligible = hasScore && (scoreVal >= 6.0 || scoreVal >= 50);

  const hasCollege = Boolean(applicantProfile?.college_name && applicantProfile.college_name.trim());
  const hasCategory = Boolean(applicantProfile?.category && applicantProfile.category.trim());

  // Compute calculated match percentage
  const computeScore = () => {
    let pts = 0;
    if (incomeEligible) pts += 35;
    else if (hasIncome) pts += 10;

    if (scoreEligible) pts += 30;
    else if (hasScore) pts += 10;

    if (hasCollege) pts += 20;
    if (hasCategory) pts += 15;
    return pts;
  };

  const matchScore = computeScore();

  const getScoreColor = () => {
    if (matchScore >= 85) return 'text-emerald-600 stroke-emerald-500';
    if (matchScore >= 50) return 'text-blue-600 stroke-blue-500';
    if (matchScore > 0) return 'text-amber-500 stroke-amber-500';
    return 'text-slate-300 stroke-slate-300';
  };

  const getBadgeStatus = () => {
    if (matchScore >= 85) return { label: st.eligible || 'Statutorily Eligible', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (matchScore >= 50) return { label: st.partially || 'Partially Qualified', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (matchScore > 0) return { label: st.evaluating || 'Evaluating Profile', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: st.awaiting || 'Awaiting Details', bg: 'bg-slate-100 text-slate-500 border-slate-200' };
  };

  const badge = getBadgeStatus();
  const pendingLabel = st.pending || 'Pending';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-700 stroke-[2]" />
          <h3 className="font-bold text-slate-900 text-sm">
            {st.title || 'Statutory Eligibility Gauge'}
          </h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
          {badge.label}
        </span>
      </div>

      {/* Main Gauge & Circular Score */}
      <div className="pt-3.5 flex items-center gap-4">
        
        {/* Circular Progress Ring */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {/* Background path */}
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress path */}
            <path
              className={`transition-all duration-700 ease-out ${getScoreColor()}`}
              strokeDasharray={`${matchScore}, 100`}
              strokeLinecap="round"
              strokeWidth="3.5"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-sm font-black text-slate-900 leading-none">
              {matchScore}%
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
              {st.match || 'Match'}
            </span>
          </div>
        </div>

        {/* Scheme & Direct Benefit Summary */}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold text-[#0d1e4c] truncate">
            {selectedScheme?.title || st.defaultScheme || "Post-Matric Scholarship Scheme 2026"}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{st.benefit || 'Benefit'}: {selectedScheme?.award_amount || 'Direct Benefit Transfer / Official Statutory Service'}</span>
          </p>
        </div>

      </div>

      {/* 4 Deterministic Statutory Rules Checklist */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
        
        {/* 1. Income Ceiling */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {incomeEligible ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
            ) : hasIncome ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-500 stroke-[2.5]" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span className="text-[11px] font-medium text-slate-700">
              {st.incomeLimit || 'Income Limit (≤ ₹2.5L)'}
            </span>
          </div>
          <span className={`text-[10px] font-bold ${incomeEligible ? 'text-emerald-700' : hasIncome ? 'text-red-600' : 'text-slate-400'}`}>
            {hasIncome ? `₹${(incomeVal / 100000).toFixed(1)}L` : pendingLabel}
          </span>
        </div>

        {/* 2. Merit Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {scoreEligible ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
            ) : hasScore ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span className="text-[11px] font-medium text-slate-700">
              {st.academicScore || 'Academic Score (≥ 6.0 CGPA)'}
            </span>
          </div>
          <span className={`text-[10px] font-bold ${scoreEligible ? 'text-emerald-700' : hasScore ? 'text-amber-600' : 'text-slate-400'}`}>
            {hasScore ? `${scoreVal} CGPA` : pendingLabel}
          </span>
        </div>

        {/* 3. Institution */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasCollege ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span className="text-[11px] font-medium text-slate-700">
              {st.institution || 'Institution Accreditation'}
            </span>
          </div>
          <span className={`text-[10px] font-bold truncate max-w-[120px] ${hasCollege ? 'text-emerald-700' : 'text-slate-400'}`}>
            {hasCollege ? applicantProfile.college_name : pendingLabel}
          </span>
        </div>

        {/* 4. Social Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasCategory ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span className="text-[11px] font-medium text-slate-700">
              {st.category || 'Category Reservation'}
            </span>
          </div>
          <span className={`text-[10px] font-bold ${hasCategory ? 'text-emerald-700' : 'text-slate-400'}`}>
            {hasCategory ? applicantProfile.category : pendingLabel}
          </span>
        </div>

      </div>

    </div>
  );
}
