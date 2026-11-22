import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Building, 
  FileText, 
  ArrowRight,
  Filter
} from 'lucide-react';

export default function ServicesCatalog({ services = [], onSelectScheme, onStartWithScheme }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Scholarship', 'Transport & Mobility', 'Civil Certificates', 'Agriculture & Subsidies', 'Food Security & Welfare', 'Merit-Based Scholarship', 'Women in Tech', 'Professional Courses'];

  const filteredServices = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Official Government Schemes Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">Verified public scholarship programs with official eligibility rules & deadlines</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scheme, ministry, course..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`text-[11px] px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                  selectedCategory === c
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredServices.map(scheme => {
          const rules = scheme.eligibility_rules || {};
          const docs = scheme.required_documents || [];

          return (
            <div 
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Top Badge & Department */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {scheme.category || 'Scholarship'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Closes: {scheme.deadline || '31 Dec 2026'}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-sm leading-snug hover:text-blue-600 transition">
                  {scheme.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{scheme.department}</span>
                </p>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                  {scheme.description}
                </p>

                {/* Key Eligibility Rules */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Income Ceiling:</span>
                    <span className="font-semibold text-slate-800">
                      {rules.max_annual_income ? `≤ ₹${Number(rules.max_annual_income).toLocaleString()} / year` : 'No Limit'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Min Academic Score:</span>
                    <span className="font-semibold text-slate-800">
                      {rules.min_gpa ? `${rules.min_gpa} CGPA / ${rules.min_percentage}%` : '50%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Financial Aid:</span>
                    <span className="font-bold text-emerald-700">
                      {scheme.award_amount || 'Tuition Assistance'}
                    </span>
                  </div>
                </div>

                {/* Required Documents Summary */}
                {docs.length > 0 && (
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-600">
                    <span className="font-bold text-slate-700 block mb-1">Mandatory Documents:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                      {docs.slice(0, 3).map((d, i) => (
                        <li key={i} className="truncate">{d}</li>
                      ))}
                      {docs.length > 3 && (
                        <li className="text-blue-600 font-medium">+{docs.length - 3} more certificates</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <a
                  href={scheme.portal_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => onStartWithScheme(scheme)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs"
                >
                  <span>Apply with CivicPilot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
