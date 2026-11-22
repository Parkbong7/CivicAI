import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  FileCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import api from '../api';

export default function DocumentScannerModal({ 
  isOpen, 
  onClose, 
  onApplyExtractedData, 
  applicantName = "Priya Sharma" 
}) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleScanSample = async (docType) => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await api.ocrSampleDocument({
        doc_type: docType,
        applicant_name: applicantName
      });
      // simulate realistic scanning delay for great UX
      setTimeout(() => {
        setScanResult(res.data);
        setScanning(false);
      }, 1200);
    } catch (err) {
      console.error("OCR Error:", err);
      setScanning(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setScanning(true);
    setScanResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.ocrUploadDocument(formData);
      setTimeout(() => {
        setScanResult(res.data);
        setScanning(false);
      }, 1400);
    } catch (err) {
      console.error("OCR upload error:", err);
      setScanning(false);
    }
  };

  const handleApply = () => {
    if (scanResult?.profile_updates) {
      onApplyExtractedData(scanResult.profile_updates, scanResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#0a1226] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-sky-400 shadow-sm">
              <FileCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">AI Document Scanner & OCR</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  Government e-KYC
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Instantly extract verified income certificate & marksheet attributes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Quick Test Sample Documents (Hackathon 1-click test chips) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>1-Click Test Official Documents:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">No real PDF needed</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleScanSample('income_certificate')}
                disabled={scanning}
                className="p-3 text-left bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200 hover:border-emerald-400 rounded-2xl transition shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700">Income Certificate</span>
                </div>
                <div className="text-[10px] text-emerald-700/80 leading-tight">
                  Revenue Dept SDM • Annual: ₹1,50,000
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleScanSample('marksheet')}
                disabled={scanning}
                className="p-3 text-left bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 hover:border-blue-400 rounded-2xl transition shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-700 flex items-center justify-center">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-blue-900 group-hover:text-blue-700">College Marksheet</span>
                </div>
                <div className="text-[10px] text-blue-700/80 leading-tight">
                  DTU Grade Sheet • 8.6 CGPA (86%)
                </div>
              </button>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
              dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              id="fileInputModal"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              className="hidden"
            />
            <label htmlFor="fileInputModal" className="cursor-pointer block">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <UploadCloud className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                Upload your Income Certificate or Marksheet
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Drag and drop your file here, or <span className="text-blue-600 font-semibold underline">browse</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Supports PDF, JPG, PNG (Max 10MB)
              </div>
            </label>
          </div>

          {/* Scanning Animation State */}
          {scanning && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 animate-in fade-in">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <div>
                <div className="text-xs font-bold text-blue-900">Scanning Document with Computer Vision OCR...</div>
                <div className="text-[11px] text-blue-700">Validating official stamps, income brackets, and seal signatures.</div>
              </div>
            </div>
          )}

          {/* OCR Extracted Result Card */}
          {scanResult && !scanning && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">
                    {scanResult.document_type} Extracted Successfully
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800">
                  {scanResult.confidence_score}% Confidence
                </span>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {scanResult.extracted_data?.annual_income && (
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">Annual Family Income</span>
                    <span className="font-bold text-slate-900 text-xs">
                      ₹{Number(scanResult.extracted_data.annual_income).toLocaleString()} / year
                    </span>
                  </div>
                )}
                {scanResult.extracted_data?.cgpa && (
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">Academic Merit Score</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {scanResult.extracted_data.cgpa} CGPA ({scanResult.extracted_data.percentage})
                    </span>
                  </div>
                )}
                {scanResult.extracted_data?.college_name && (
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">Institution</span>
                    <span className="font-bold text-slate-900 text-xs truncate block">
                      {scanResult.extracted_data.college_name}
                    </span>
                  </div>
                )}
                {scanResult.issuing_authority && (
                  <div className="p-2 bg-white rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 block">Issuing Authority</span>
                    <span className="font-bold text-slate-900 text-[11px] truncate block">
                      {scanResult.issuing_authority}
                    </span>
                  </div>
                )}
              </div>

              {/* Audit Note */}
              {scanResult.audit_note && (
                <p className="text-[11px] text-emerald-800 font-medium">
                  ✓ {scanResult.audit_note}
                </p>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 cursor-pointer"
              >
                <span>Apply Extracted Details to Citizen Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
