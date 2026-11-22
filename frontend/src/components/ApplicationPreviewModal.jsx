import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Edit3, 
  Check, 
  Send, 
  AlertTriangle,
  Building,
  GraduationCap,
  CreditCard,
  UserCheck
} from 'lucide-react';

export default function ApplicationPreviewModal({ 
  isOpen, 
  onClose, 
  previewData, 
  onApprove, 
  isSubmitting 
}) {
  if (!isOpen || !previewData) return null;

  const [formData, setFormData] = useState({ ...previewData });

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleConfirm = () => {
    onApprove(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">CivicPilot Safety Gate: Final Citizen Review</h3>
              <p className="text-xs text-blue-200 mt-0.5">Please verify all pre-filled information before authorizing submission.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Editable Preview Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          
          {/* Warning Banner */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Explicit User Approval Mandate:</strong> The Autonomous Agent has paused at Stage 10. No data will be submitted to the government portal without your explicit confirmation. You may edit any field below.
            </p>
          </div>

          {/* Section 1: Personal Details */}
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              1. Personal & Identity Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob || '2004-06-15'}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gender</label>
                <select
                  value={formData.gender || 'Female'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Social Category</label>
                <select
                  value={formData.category || 'OBC'}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Academic Details */}
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              2. Academic & Enrollment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">College / Institute</label>
                <input
                  type="text"
                  value={formData.college_name || ''}
                  onChange={(e) => handleChange('college_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Course / Program</label>
                <input
                  type="text"
                  value={formData.course || 'B.Tech Computer Science'}
                  onChange={(e) => handleChange('course', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Academic Score / CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.gpa_percentage || ''}
                  onChange={(e) => handleChange('gpa_percentage', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Year</label>
                <input
                  type="text"
                  value={formData.year_of_study || '2nd Year'}
                  onChange={(e) => handleChange('year_of_study', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  value={formData.annual_income || ''}
                  onChange={(e) => handleChange('annual_income', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: DBT Bank Account */}
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              3. Direct Benefit Transfer (DBT) Bank Account
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank_name || 'State Bank of India'}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.account_number || '38291049281'}
                  onChange={(e) => handleChange('account_number', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifsc_code || 'SBIN0001234'}
                  onChange={(e) => handleChange('ifsc_code', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer with Explicit Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Citizen identity verified. Ready for portal submission.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition border border-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-lg transition shadow-blue-700/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Approve & Submit Application</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
