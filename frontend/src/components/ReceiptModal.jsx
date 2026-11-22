import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  Printer, 
  Download, 
  FileText,
  FileCheck,
  QrCode, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import api from '../api';

export default function ReceiptModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState(false);

  const refNo = receipt.reference_number || 'NSP-2026-LIVE';
  const name = receipt.applicant_name || 'Student Applicant';
  const college = receipt.college_name || 'Recognized Institution';
  const date = receipt.submitted_at || new Date().toLocaleString();
  const status = receipt.status || 'PROVISIONALLY_SUBMITTED';
  const scheme = receipt.scheme_title || 'Post-Matric Scholarship Scheme for College Students 2026';
  const digitalHash = receipt.digital_signature_hash || 'SHA256-5d746dc24933ef91';

  // 1. Native Window Print
  const handlePrint = () => {
    window.print();
  };

  // 2. Download Official PDF (via Backend Playwright A4 Vector Engine)
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await api.exportPdf({
        reference_number: refNo,
        applicant_name: name,
        college_name: college,
        submitted_at: date,
        status: status,
        scheme_title: scheme,
        digital_signature_hash: digitalHash
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${refNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export error:", err);
      // Fallback to print dialog
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 3. Download Official Microsoft Word Document (.doc)
  const handleDownloadWord = () => {
    setDownloadingDoc(true);
    try {
      const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Official Acknowledgment Receipt - ${refNo}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      margin: 40px;
      color: #0f172a;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0d9488;
      padding-bottom: 12px;
      margin-bottom: 25px;
    }
    .gov-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .badge {
      background: #10b981;
      color: white;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      display: inline-block;
      margin-top: 8px;
    }
    .ref-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .ref-label {
      font-size: 11px;
      font-weight: bold;
      color: #64748b;
      text-transform: uppercase;
    }
    .ref-val {
      font-family: Consolas, monospace;
      font-size: 20px;
      font-weight: bold;
      color: #1e3a8a;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 13px;
    }
    th, td {
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 600;
      width: 35%;
    }
    .notice {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 14px;
      margin-top: 25px;
      font-size: 12px;
      color: #1e40af;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="gov-title">National Scholarship Portal &bull; Government of India</div>
    <div class="sub">CivicPilot AI Autonomous Public Service Agent &bull; Official Submission Receipt</div>
    <div class="badge">PROVISIONALLY SUBMITTED &amp; VERIFIED</div>
  </div>

  <div class="ref-box">
    <div class="ref-label">Application Reference Number</div>
    <div class="ref-val">${refNo}</div>
  </div>

  <table>
    <tr><th>Applicant Name</th><td><b>${name}</b></td></tr>
    <tr><th>Enrolled Institution</th><td><b>${college}</b></td></tr>
    <tr><th>Applied Scheme</th><td>${scheme}</td></tr>
    <tr><th>Submission Date &amp; Time</th><td>${date}</td></tr>
    <tr><th>Application Status</th><td><span style="color: #059669; font-weight: bold;">&bull; ${status}</span></td></tr>
    <tr><th>Verification Security Hash</th><td style="font-family: monospace;">${digitalHash}</td></tr>
  </table>

  <div class="notice">
    <b>Next Steps &amp; Verification Workflow:</b><br />
    &bull; Your application has been logged on the National Scholarship Portal.<br />
    &bull; The form is forwarded to the Institutional Nodal Officer (INO) for document and enrollment verification.<br />
    &bull; Direct Benefit Transfer (DBT) scholarship funds will be credited directly to your Aadhaar-linked bank account upon state verification.
  </div>

  <div class="footer">
    Generated automatically by CivicPilot AI &bull; Autonomous Public Service Agent &bull; Powered by Google Gemini &amp; Playwright
  </div>
</body>
</html>`;

      const blob = new Blob(['\ufeff' + wordHtml], {
        type: 'application/msword;charset=utf-8'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${refNo}.doc`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word export error:", err);
    } finally {
      setDownloadingDoc(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Receipt Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-emerald-100">
                Official Acknowledgment Receipt
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">Application Submitted Successfully</h3>
              <p className="text-xs text-emerald-100">National Scholarship Portal (Official Citizen Verification Portal)</p>
            </div>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          
          {/* Reference Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Application Reference Number</div>
              <div className="text-lg font-mono font-black text-blue-950 mt-0.5">
                {refNo}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <QrCode className="w-8 h-8" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Applicant Name</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Enrolled College</span>
              <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{college}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Submission Date &amp; Time</span>
              <span className="font-medium text-slate-700 mt-0.5 block">{date}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Application Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {status}
              </span>
            </div>
          </div>

          {/* Scheme Summary */}
          <div className="space-y-1.5 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
            <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Applied Scheme</div>
            <div className="font-bold text-blue-950 text-xs">
              {scheme}
            </div>
            <p className="text-[11px] text-blue-800/80 leading-relaxed pt-1">
              &bull; Form forwarded to Institutional Nodal Officer (INO) for online verification.<br />
              &bull; Direct Benefit Transfer (DBT) will be credited to linked Aadhaar bank account upon approval.
            </p>
          </div>

          {/* Digital Signature */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>CivicPilot Digital Hash:</span>
            <span className="truncate max-w-[200px]">{digitalHash}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Verified Autonomous Workflow</span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition shadow-2xs"
              title="Download official A4 PDF Receipt"
            >
              {downloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{downloadingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>

            {/* Download Word Document Button */}
            <button
              onClick={handleDownloadWord}
              disabled={downloadingDoc}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl transition shadow-2xs"
              title="Download official Word Document (.doc)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Word</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition border border-slate-300"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Done Button */}
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
