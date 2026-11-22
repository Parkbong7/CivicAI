import React, { useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Receipt, 
  Search, 
  Filter, 
  QrCode,
  FileText,
  ShieldCheck
} from 'lucide-react';

export default function ApplicationsTracking({ applications = [], onOpenReceipt }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filtered = applications.filter(app => {
    const matchesSearch = (app.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (app.applicant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (app.scheme_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || app.status === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Application Tracking & Verifiable Receipts</h2>
          <p className="text-xs text-slate-500 mt-0.5">SQLite persistent audit ledger of all submitted and drafted applications</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference #, student name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filtered.map(app => {
          const isSubmitted = app.status === 'submitted';
          const refNo = app.reference_number || 'CP-PENDING';
          const isDemo = app.mode === 'demo' || refNo.includes('DEMO');

          return (
            <div 
              key={app.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  isSubmitted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isSubmitted ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {refNo}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSubmitted 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status || 'Draft'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                      Official Portal Submission
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{app.scheme_title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>Applicant: <strong>{app.applicant_name || 'Anonymous Student'}</strong></span>
                    {app.college_name && <span>• Institution: {app.college_name}</span>}
                    {app.submitted_at && <span>• Submitted: {app.submitted_at}</span>}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 shrink-0">
                {isSubmitted && (
                  <button
                    onClick={() => onOpenReceipt(app.receipt_data || {
                      reference_number: refNo,
                      applicant_name: app.applicant_name,
                      college_name: app.college_name,
                      scheme_title: app.scheme_title,
                      submitted_at: app.submitted_at || 'Recorded'
                    })}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition shadow-2xs"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View Official Receipt</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Application Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete the autonomous scholarship application workflow in the Agent Console to generate verified submission records and receipts.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
