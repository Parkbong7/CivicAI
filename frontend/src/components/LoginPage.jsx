import React, { useState } from 'react';
import { 
  Landmark, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  ChevronDown,
  School
} from 'lucide-react';
import api from '../api';

export default function LoginPage({ 
  onLoginSuccess, 
  onContinueGuest, 
  currentLang = 'en', 
  onChangeLang, 
  t 
}) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    identifier: '',
    name: '',
    email: '',
    phone: '',
    college: '',
    password: '',
    confirmPassword: ''
  });

  // Touched state for validation on blur
  const [touched, setTouched] = useState({});

  const languageOptions = [
    { code: 'en', label: 'English', short: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)', short: 'हिंदी' },
    { code: 'mr', label: 'मराठी (Marathi)', short: 'मराठी' },
    { code: 'ta', label: 'தமிழ் (Tamil)', short: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు (Telugu)', short: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা (Bengali)', short: 'বাংলা' }
  ];

  const currentOption = languageOptions.find(l => l.code === currentLang) || languageOptions[0];

  // Validation Rules
  const validate = () => {
    const errors = {};

    if (mode === 'signin') {
      if (!formData.identifier.trim()) {
        errors.identifier = 'Email or mobile number is required.';
      } else {
        const val = formData.identifier.trim();
        const isEmail = val.includes('@');
        const isPhone = /^\d+$/.test(val);

        if (isEmail) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            errors.identifier = 'Please enter a valid email address (e.g. citizen@example.com).';
          }
        } else if (isPhone) {
          if (!/^[6-9]\d{9}$/.test(val)) {
            errors.identifier = 'Please enter a valid 10-digit Indian mobile number starting with 6-9.';
          }
        } else {
          errors.identifier = 'Enter a valid email address or 10-digit mobile number.';
        }
      }

      if (!formData.password) {
        errors.password = 'Password is required.';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long.';
      }
    } else {
      // Register Mode
      if (!formData.name.trim()) {
        errors.name = 'Full legal name is required.';
      } else if (formData.name.trim().length < 3) {
        errors.name = 'Name must be at least 3 characters.';
      }

      if (!formData.email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }

      if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
        errors.phone = 'Mobile number must be a valid 10-digit number.';
      }

      if (!formData.college.trim()) {
        errors.college = 'College or University name is required.';
      }

      if (!formData.password) {
        errors.password = 'Password is required.';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Confirm your password.';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    return errors;
  };

  const errors = validate();

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError('');
  };

  // 1-Click Demo Login
  const handleQuickDemoLogin = async (persona) => {
    setServerError('');
    setLoading(true);

    const creds = persona === 'priya' 
      ? { identifier: 'priya.sharma@example.com', password: 'password123' }
      : { identifier: 'rahul.verma@example.com', password: 'password123' };

    setFormData(prev => ({
      ...prev,
      identifier: creds.identifier,
      password: creds.password
    }));

    try {
      const res = await api.login(creds);
      if (res.data?.user) {
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // DigiLocker SSO Login
  const handleDigiLockerSSO = async () => {
    setServerError('');
    setLoading(true);
    try {
      const res = await api.ssoDigilocker();
      if (res.data?.user) {
        setServerSuccess('Verified via DigiLocker / MeriPehchaan!');
        setTimeout(() => {
          onLoginSuccess(res.data.user);
        }, 600);
      }
    } catch (err) {
      setServerError('DigiLocker SSO authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');

    // Mark all relevant fields as touched
    if (mode === 'signin') {
      setTouched({ identifier: true, password: true });
    } else {
      setTouched({ name: true, email: true, phone: true, college: true, password: true, confirmPassword: true });
    }

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await api.login({
          identifier: formData.identifier.trim(),
          password: formData.password
        });
        if (res.data?.user) {
          onLoginSuccess(res.data.user);
        }
      } else {
        const res = await api.register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          college_name: formData.college.trim(),
          password: formData.password
        });
        if (res.data?.user) {
          setServerSuccess('Account created successfully! Logging you in...');
          setTimeout(() => {
            onLoginSuccess(res.data.user);
          }, 800);
        }
      }
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#070d1e] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Main Glassmorphic Split Auth Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-100">
        
        {/* Left Side: Brand Authority & Gov-Tech Aesthetics (5 cols) */}
        <div className="lg:col-span-5 bg-[#0a1226] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
                <Landmark className="w-6 h-6 text-sky-400 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                  CivicPilot <span className="text-sky-400 font-extrabold">AI</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  Smart. Simple. Autonomous.
                </p>
              </div>
            </div>

            {/* Indian Tricolor Accent Line */}
            <div className="w-24 h-1 flex rounded-full overflow-hidden my-6">
              <div className="flex-1 bg-[#ff9933]"></div>
              <div className="flex-1 bg-white"></div>
              <div className="flex-1 bg-[#138808]"></div>
            </div>

            {/* Headline */}
            <div className="space-y-2 mt-4">
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                Autonomous Public Service Portal
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sign in to discover eligible scholarships, verify statutory prerequisites, and let the Autonomous Agent navigate official government portals on your behalf.
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="space-y-3.5 mt-8 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-bold text-white text-[12px]">Verified Citizen Identity</div>
                  <div className="text-[11px] text-slate-400 leading-tight">DigiLocker & MeriPehchaan SSO standard compliant.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-bold text-white text-[12px]">Zero Manual Form Hassle</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Autonomous AI Agent maps & fills forms automatically.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-bold text-white text-[12px]">Verifiable Digital Receipts</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Instant SHA256 hashed PDF receipts with QR validation.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="pt-8 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <div>Digital India Initiative</div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              256-Bit SSL Encrypted
            </div>
          </div>

        </div>

        {/* Right Side: Clean Form with Real-time Validation (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          
          {/* Top Bar: Mode Tabs + Language Dropdown */}
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              {/* Sign In / Register Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setServerError(''); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signin'
                      ? 'bg-white text-[#1e5ce0] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setServerError(''); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-white text-[#1e5ce0] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New Citizen Registration
                </button>
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:border-blue-400 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>{currentOption.short}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {langOpen && (
                  <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs text-slate-700">
                    {languageOptions.map((opt) => (
                      <button
                        key={opt.code}
                        type="button"
                        onClick={() => {
                          if (onChangeLang) onChangeLang(opt.code);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-1.5 hover:bg-blue-50 transition font-medium flex items-center justify-between ${
                          currentLang === opt.code ? 'bg-blue-50 text-blue-700 font-bold' : ''
                        }`}
                      >
                        <span>{opt.label}</span>
                        {currentLang === opt.code && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Headline */}
            <div className="my-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {mode === 'signin' ? 'Welcome back, Citizen' : 'Create your Citizen Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'signin'
                  ? 'Access your scholarships, track ongoing filings, and automate submissions.'
                  : 'Register with your verified email to begin autonomous scholarship applications.'}
              </p>
            </div>

            {/* Error / Success Notifications */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {serverSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{serverSuccess}</span>
              </div>
            )}



            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {mode === 'signin' ? (
                <>
                  {/* Identifier Input (Email or Phone) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address or Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleChange}
                        onBlur={() => handleBlur('identifier')}
                        placeholder="e.g. citizen@example.com or 9876543210"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          touched.identifier && errors.identifier
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/30'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {touched.identifier && errors.identifier && (
                      <p className="mt-1.5 text-[11px] text-red-600 flex items-center gap-1 font-medium animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.identifier}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => alert("Please enter your registered email address or mobile number to receive password reset instructions.")}
                        className="text-[11px] font-semibold text-[#1e5ce0] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        placeholder="Enter your password (min 6 chars)"
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          touched.password && errors.password
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/30'
                            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="mt-1.5 text-[11px] text-red-600 flex items-center gap-1 font-medium animate-in fade-in">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 font-medium cursor-pointer">
                      Keep me signed in on this secure device
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* Register Mode Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Full Legal Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Legal Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={() => handleBlur('name')}
                          placeholder="e.g. Amit Kumar"
                          className={`w-full pl-10 pr-3 py-2 bg-slate-50/50 border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                            touched.name && errors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      {touched.name && errors.name && (
                        <p className="mt-1 text-[10px] text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => handleBlur('email')}
                          placeholder="amit.kumar@example.com"
                          className={`w-full pl-10 pr-3 py-2 bg-slate-50/50 border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                            touched.email && errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      {touched.email && errors.email && (
                        <p className="mt-1 text-[10px] text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* College / Institution */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      College / University Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <School className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        onBlur={() => handleBlur('college')}
                        placeholder="e.g. Delhi Technological University"
                        className={`w-full pl-10 pr-3 py-2 bg-slate-50/50 border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          touched.college && errors.college ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {touched.college && errors.college && (
                      <p className="mt-1 text-[10px] text-red-600">{errors.college}</p>
                    )}
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Create Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        placeholder="Min 6 characters"
                        className={`w-full px-3 py-2 bg-slate-50/50 border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          touched.password && errors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-blue-500'
                        }`}
                      />
                      {touched.password && errors.password && (
                        <p className="mt-1 text-[10px] text-red-600">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        placeholder="Re-enter password"
                        className={`w-full px-3 py-2 bg-slate-50/50 border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${
                          touched.confirmPassword && errors.confirmPassword ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-blue-500'
                        }`}
                      />
                      {touched.confirmPassword && errors.confirmPassword && (
                        <p className="mt-1 text-[10px] text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#1e5ce0] hover:bg-blue-700 active:scale-[0.99] transition shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating with CivicPilot...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Portal' : 'Complete Registration'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400">
                <span className="bg-white px-3 font-semibold">Or National Single Sign-On</span>
              </div>
            </div>

            {/* DigiLocker / MeriPehchaan SSO Button */}
            <button
              type="button"
              onClick={handleDigiLockerSSO}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-800 transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
            >
              <div className="w-5 h-5 rounded-md bg-[#0a1226] flex items-center justify-center text-sky-400 font-extrabold text-[10px]">
                DL
              </div>
              <span>Sign In with DigiLocker / MeriPehchaan</span>
              <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Aadhaar e-KYC
              </span>
            </button>

          </div>

          {/* Bottom Guest Citizen Bypass Link */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Need immediate access?</span>
            <button
              type="button"
              onClick={onContinueGuest}
              className="font-bold text-[#1e5ce0] hover:text-blue-800 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Continue as Guest Citizen</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
