import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  ShieldCheck, 
  FileCheck2,
  ChevronRight
} from 'lucide-react';

export default function EligibilityCard({ evaluation, schemeTitle }) {
  if (!evaluation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800">Statutory Eligibility Engine</h4>
        </div>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Share your academic score, annual family income, and college in chat to evaluate scheme eligibility against official rules.
        </p>
      </div>
    );
  }

  const isEligible = evaluation.is_eligible;
  const status = evaluation.overall_status;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      
      {/* Header with status badge */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800">Eligibility Verification</h4>
          </div>
          <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
            {schemeTitle || evaluation.scheme_title}
          </p>
        </div>

        {status === 'ELIGIBLE' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ELIGIBLE
          </span>
        )}
        {status === 'NEEDS_MORE_INFO' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            MORE INFO REQUIRED
          </span>
        )}
        {status === 'INELIGIBLE' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            NOT ELIGIBLE
          </span>
        )}
      </div>

      {/* Conditions Checklist */}
      <div className="space-y-2">
        {evaluation.conditions?.map((c, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">{c.rule_name}</span>
              {c.status === 'PASSED' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded">Passed</span>
              )}
              {c.status === 'FAILED' && (
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.2 rounded">Failed</span>
              )}
              {c.status === 'PENDING_INFO' && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded">Pending</span>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Required: {c.required_value}</span>
              <span className="font-medium text-slate-700">Actual: {c.actual_value}</span>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              {c.explanation}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Note */}
      <div className="text-[11px] p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 leading-relaxed">
        {evaluation.summary_explanation}
      </div>

    </div>
  );
}
