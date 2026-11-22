import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import api from '../api';

export default function LiveDiscoveryPanel({ onApplyDiscoveredScheme }) {
  const [portalUrl, setPortalUrl] = useState('https://scholarships.gov.in');
  const [loading, setLoading] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const handleRunDiscovery = async () => {
    setLoading(true);
    setLogs([
      `[${new Date().toLocaleTimeString()}] Mode 1 Initiated: Connecting to official public portal ${portalUrl}...`,
      `[${new Date().toLocaleTimeString()}] Spawning Playwright browser instance in sandbox...`
    ]);

    try {
      const res = await api.discoverPortal(portalUrl);
      setDiscoveryResult(res.data);
      if (res.data.logs) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error("Discovery error:", err);
      setLogs(prev => [...prev, `[Error] ${err.message || 'Discovery connection failed.'}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Explanation */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl p-6 border border-teal-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
            <Globe className="w-3.5 h-3.5" />
            Mode 1: Live Government Website Intelligence
          </div>
          <h2 className="text-xl font-bold">Autonomous Public Portal Discovery</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            CivicPilot navigates publicly accessible government portals, identifies official scholarship announcements, parses statutory criteria, and summarizes required certificates with zero manual scraping.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-1.5 text-teal-300 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            Public Source Verification
          </div>
          <p className="text-[11px] text-slate-300">Compliant with public access rules & guidelines.</p>
        </div>
      </div>

      {/* Target URL Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="url"
            value={portalUrl}
            onChange={(e) => setPortalUrl(e.target.value)}
            placeholder="Official government portal URL (e.g. https://scholarships.gov.in)"
            className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-mono"
          />
        </div>

        <button
          onClick={handleRunDiscovery}
          disabled={loading}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm shrink-0 ${
            loading 
              ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
              : 'bg-teal-700 hover:bg-teal-800'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanning Portal with Playwright...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Live Discovery</span>
            </>
          )}
        </button>
      </div>

      {/* Execution Terminal */}
      {logs.length > 0 && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 shadow-inner space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-bold text-teal-400">
              <Terminal className="w-3.5 h-3.5" />
              Playwright Live Crawler Activity
            </span>
            <span>Target: {portalUrl}</span>
          </div>
          <div className="space-y-1 text-[11px] max-h-36 overflow-y-auto pr-1">
            {logs.map((l, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-teal-400 shrink-0">›</span>
                <span className="text-slate-300">{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discovered Schemes Cards */}
      {discoveryResult?.extracted_schemes && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Extracted Government Schemes & Announcements
            </h3>
            <span className="text-xs text-slate-500">
              Found {discoveryResult.extracted_schemes.length} verified programs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveryResult.extracted_schemes.map((s, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    Live Verified
                  </span>
                  {s.deadline && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Deadline: {s.deadline}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{s.eligibility_summary || s.authority}</p>

                {s.required_documents && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-1">Required Documents:</span>
                    <span className="text-slate-500">{s.required_documents.join(', ')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={s.link || s.official_portal || portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-semibold transition"
                  >
                    <span>View Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onApplyDiscoveredScheme(s)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition"
                  >
                    Apply with CivicPilot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
