import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import HeroBanner from './components/HeroBanner';
import ChatSection from './components/ChatSection';
import AvailableServices from './components/AvailableServices';
import ExecutionTimelineWidget from './components/ExecutionTimelineWidget';
import ApplicationPreviewWidget from './components/ApplicationPreviewWidget';

import ApplicationPreviewModal from './components/ApplicationPreviewModal';
import ReceiptModal from './components/ReceiptModal';
import BrowserStreamModal from './components/BrowserStreamModal';
import ServicesCatalog from './components/ServicesCatalog';
import ApplicationsTracking from './components/ApplicationsTracking';
import LoginPage from './components/LoginPage';
import EligibilityGaugeWidget from './components/EligibilityGaugeWidget';
import DocumentScannerModal from './components/DocumentScannerModal';
import api from './api';
import translations from './translations';

export default function App() {
  // Navigation & Localization
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mode, setMode] = useState('live');
  const [currentLang, setCurrentLang] = useState('en');

  const t = translations[currentLang] || translations.en;

  // Authenticated Citizen Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpilot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('civicpilot_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setApplicantProfile(prev => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      college_name: user.college_name || prev.college_name,
      course: user.course || prev.course,
      annual_income: user.annual_income || prev.annual_income,
      category: user.category || prev.category
    }));
    setMessages([
      {
        role: 'assistant',
        content: `Namaste ${user.name}! Welcome to CivicPilot AI.

I have authenticated your profile:
• **Applicant:** ${user.name}
• **Institution:** ${user.college_name || 'Delhi Technological University'} (${user.course || 'B.E. Computer Science'})
• **Annual Family Income:** ₹${Number(user.annual_income || 150000).toLocaleString()}
• **Category:** ${user.category || 'General'}

Your profile satisfies the requirements for the **Post-Matric Scholarship Scheme for College & University Students**.
You can now click **"🚀 Start Browser Automation"** below or ask any question!`
      }
    ]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('civicpilot_user');
    } catch (e) {
      console.error(e);
    }
    setApplicantProfile({
      name: '',
      email: '',
      phone: '',
      dob: '2004-06-15',
      gender: 'Female',
      category: '',
      annual_income: null,
      gpa_percentage: null,
      college_name: '',
      course: '',
      year_of_study: '2nd Year',
      state: 'Delhi',
      bank_name: 'State Bank of India',
      account_number: '38291049281',
      ifsc_code: 'SBIN0001234',
      aadhaar_number: 'XXXXXXXX9842'
    });
  };

  // Initial welcome message requesting citizen details
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaste! I am CivicPilot AI, your Autonomous Public Service Assistant.

I evaluate your eligibility for official government welfare schemes and scholarships, verify your documents, and submit your application directly to official government portals.

To evaluate your eligibility, please share your details or use the AI Document Scanner:
• Your **Full Legal Name**
• **College / University** and **Course**
• **Annual Family Income** (e.g. ₹1.8 Lakhs)
• **Social Category** (General / OBC / SC / ST / EWS)`
    }
  ]);

  const [chatLoading, setChatLoading] = useState(false);
  
  // Citizen Profile Data (dynamically loaded from authenticated citizen session or collected conversationally)
  const [applicantProfile, setApplicantProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpilot_user');
      const u = saved ? JSON.parse(saved) : null;
      if (u) {
        return {
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          dob: u.dob || '',
          gender: u.gender || '',
          category: u.category || '',
          annual_income: u.annual_income || null,
          gpa_percentage: u.gpa_percentage || null,
          college_name: u.college_name || '',
          course: u.course || '',
          year_of_study: u.year_of_study || '',
          state: u.state || 'Delhi',
          bank_name: u.bank_name || '',
          account_number: u.account_number || '',
          ifsc_code: u.ifsc_code || '',
          aadhaar_number: u.aadhaar_number || ''
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      name: '', email: '', phone: '', dob: '', gender: '', category: '',
      annual_income: null, gpa_percentage: null, college_name: '', course: '',
      year_of_study: '', state: '', bank_name: '', account_number: '',
      ifsc_code: '', aadhaar_number: ''
    };
  });


  // Services & Applications state
  const [services, setServices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Automation / Playwright State
  const [automationRunning, setAutomationRunning] = useState(false);
  const [automationStatus, setAutomationStatus] = useState('idle');
  const [currentStage, setCurrentStage] = useState(1);
  const [stages, setStages] = useState([]);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [automationLogs, setAutomationLogs] = useState([
    'CivicPilot autonomous engine ready.',
    'Awaiting citizen command to initiate Playwright form filling.'
  ]);
  const [currentUrl, setCurrentUrl] = useState('https://scholarships.gov.in');
  const [previewData, setPreviewData] = useState(null);
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isDocScannerOpen, setIsDocScannerOpen] = useState(false);

  const handleApplyExtractedDocData = (profileUpdates, scanResult) => {
    const updated = { ...applicantProfile, ...profileUpdates };
    setApplicantProfile(updated);

    const docName = scanResult.document_type || "Document";
    const authority = scanResult.issuing_authority || "Government Revenue Authority";
    const incomeTxt = updated.annual_income ? `• **Verified Annual Income:** ₹${Number(updated.annual_income).toLocaleString()} / year\n` : '';
    const scoreTxt = updated.gpa_percentage ? `• **Verified Academic Score:** ${updated.gpa_percentage} CGPA\n` : '';
    const collegeTxt = updated.college_name ? `• **Institution:** ${updated.college_name}\n` : '';

    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `📄 **Official ${docName} Processed & Verified!**\n\nI have extracted statutory attributes from your document issued by *${authority}*:\n${incomeTxt}${scoreTxt}${collegeTxt}• **Verification Status:** ${scanResult.verification_status || 'STATUTORILY VERIFIED'} (Confidence: ${scanResult.confidence_score || 99}%)\n\nYour **Statutory Eligibility Gauge** has been updated! You can now click **"🚀 Start Browser Automation"** to fill your application.`
      }
    ]);
  };
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  const pollIntervalRef = useRef(null);

  // Update initial welcome message when citizen switches language
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant' && t?.chat?.welcomeMsg) {
        return [{ role: 'assistant', content: t.chat.welcomeMsg }];
      }
      return prev;
    });
  }, [currentLang]);

  // Load Initial Data
  useEffect(() => {
    fetchServices();
    fetchApplications();
    fetchInitialStatus();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.getServices();
      if (res.data?.services) {
        setServices(res.data.services);
        if (res.data.services.length > 0) {
          setSelectedScheme(res.data.services[0]);
        }
      }
    } catch (err) {
      console.error("Error loading services:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.getApplications();
      if (res.data?.applications) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error("Error loading applications:", err);
    }
  };

  const fetchInitialStatus = async () => {
    try {
      const res = await api.getAutomationStatus('sess_demo');
      if (res.data) {
        if (res.data.stages) setStages(res.data.stages);
        if (res.data.screenshot_url) setScreenshotUrl(res.data.screenshot_url);
        if (res.data.status === 'waiting_approval') {
          setWaitingApproval(true);
          setCurrentStage(10);
        }
      }
    } catch (err) {
      console.error("Error fetching automation status:", err);
    }
  };

  // Polling during active Playwright automation
  useEffect(() => {
    if (automationRunning) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.getAutomationStatus('sess_demo');
          const data = res.data;
          if (!data) return;

          setAutomationStatus(data.status);
          setCurrentStage(data.current_stage || 1);
          if (data.stages) setStages(data.stages);
          if (data.logs) setAutomationLogs(data.logs);
          if (data.screenshot_url) setScreenshotUrl(data.screenshot_url);
          if (data.current_url) setCurrentUrl(data.current_url);
          setActiveField(data.active_field);

          if (data.status === 'waiting_approval') {
            setWaitingApproval(true);
            setAutomationRunning(false);
            setPreviewData(data.preview_data || applicantProfile);
            setIsPreviewOpen(true);
            clearInterval(pollIntervalRef.current);
          } else if (data.status === 'completed') {
            setAutomationRunning(false);
            setWaitingApproval(false);
            setIsSubmitted(true);
            if (data.receipt) {
              setActiveReceipt(data.receipt);
              setIsReceiptOpen(true);
            }
            fetchApplications();
            clearInterval(pollIntervalRef.current);
          } else if (data.status === 'failed') {
            setAutomationRunning(false);
            clearInterval(pollIntervalRef.current);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 700);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [automationRunning]);

  // Handle Send Chat Message
  const handleSendMessage = async (text) => {
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await api.sendMessage({
        message: text,
        session_id: 'sess_demo',
        current_profile: applicantProfile,
        selected_scheme_id: selectedScheme?.id || 'nsp-pms-2026',
        mode: mode
      });

      const data = res.data;
      const assistantMsg = { 
        role: 'assistant', 
        content: data.reply,
        lang: data.language_code || 'en'
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.updated_profile) {
        setApplicantProfile(prev => ({ ...prev, ...data.updated_profile }));
      }

      let updated = { ...applicantProfile };
      if (data.updated_profile) {
        updated = { ...updated, ...data.updated_profile };
        setApplicantProfile(updated);
      }

      // Check if user is explicitly triggering scholarship automation
      const lower = text.toLowerCase();
      const isExplicitScholarshipApply = 
        lower.includes('apply scholarship') || 
        lower === 'apply now' || 
        lower === 'start browser automation' || 
        lower === 'start automation' || 
        (lower === 'apply' && (selectedScheme || updated.name));

      if (isExplicitScholarshipApply && updated.name) {
        startAutomationWorkflow(updated);
      }

    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I am having trouble communicating with the CivicPilot AI service. Please ensure the backend is active at http://127.0.0.1:8000."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Clear Chat - Fully Resets Conversation, Profile, Match Gauge & Agent Timeline
  const handleClearChat = () => {
    // 1. Reset chat messages to clean welcome message
    setMessages([
      {
        role: 'assistant',
        content: "Hello, Citizen! How can I assist you today? You can ask me to evaluate eligibility, check welfare schemes, or submit your application."
      }
    ]);

    // 2. Reset Profile & Statutory Eligibility Match Gauge to 0% / Awaiting Details
    setApplicantProfile({
      name: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      category: '',
      annual_income: null,
      gpa_percentage: null,
      college_name: '',
      course: '',
      year_of_study: '',
      state: 'Delhi',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      aadhaar_number: ''
    });

    // 3. Reset Agent Execution Timeline & Automation state
    setCurrentStage(0);
    setAutomationRunning(false);
    setAutomationStatus('idle');
    setWaitingApproval(false);
    setIsSubmitted(false);
    setPreviewData(null);
    setActiveField(null);
    setScreenshotUrl(null);
    setActiveReceipt(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };

  // Trigger Playwright Automation
  const startAutomationWorkflow = async (overrideData) => {
    const dataToUse = overrideData || applicantProfile;
    if (!dataToUse.name) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Please tell me your **Name**, **College**, and **Annual Income** first so I can evaluate and fill your application, or use the AI Document Scanner to import your details."
        }
      ]);
      return;
    }

    setAutomationRunning(true);
    setAutomationStatus('running');
    setWaitingApproval(false);
    setCurrentStage(1);

    try {
      await api.startDemoAutomation({
        session_id: 'sess_demo',
        scheme_id: selectedScheme?.id || 'nsp-pms-2026',
        applicant_data: dataToUse,
        mode: mode,
        headless: true
      });
    } catch (err) {
      console.error("Error starting Playwright automation:", err);
      setAutomationRunning(false);
    }
  };

  // Citizen Explicit Approval & Submission
  const handleApproveSubmission = async (editedData) => {
    setIsSubmittingApproval(true);
    try {
      const res = await api.approveAndSubmit({
        session_id: 'sess_demo',
        approved: true,
        edited_data: editedData || applicantProfile
      });

      setIsPreviewOpen(false);
      setWaitingApproval(false);
      setIsSubmitted(true);
      setCurrentStage(12);
      setAutomationStatus('completed');

      if (res.data?.receipt) {
        setActiveReceipt(res.data.receipt);
        setIsReceiptOpen(true);
      }
      fetchApplications();
    } catch (err) {
      console.error("Approval submission error:", err);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Handle Available Services selection
  const handleSelectService = (serviceId) => {
    if (serviceId === 'scholarship') {
      const s = services.find(x => x.id === 'nsp-pms-2026') || services[0];
      if (s) setSelectedScheme(s);
      handleSendMessage("I want to apply for a student scholarship");
    } else if (serviceId === 'licence') {
      const s = services.find(x => x.id === 'morth-dl-renewal-2026');
      if (s) setSelectedScheme(s);
      handleSendMessage("I want to apply for driving licence renewal on Parivahan");
    } else if (serviceId === 'subsidy') {
      const s = services.find(x => x.id === 'pm-kisan-dbt-2026');
      if (s) setSelectedScheme(s);
      handleSendMessage("I want to apply for PM-KISAN agricultural direct benefit transfer subsidy");
    } else if (serviceId === 'other') {
      const s = services.find(x => x.id === 'edistrict-income-domicile-2026');
      if (s) setSelectedScheme(s);
      handleSendMessage("I want to apply for an official Income and Domicile Certificate on e-District");
    } else {
      setActiveTab('services');
    }
  };

  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        onContinueGuest={() => {
          const guest = {
            id: 'usr_guest',
            name: 'Guest Citizen',
            email: 'guest@civicpilot.gov.in',
            college_name: 'Delhi Technological University',
            course: 'B.E. Computer Science',
            annual_income: 150000,
            category: 'General'
          };
          handleLoginSuccess(guest);
        }}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
        t={t}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7fb] font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Exact Dark Navy Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        t={t}
      />

      {/* 2. Main Right Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        
        {/* Top Header */}
        <TopHeader 
          studentName={applicantProfile?.name?.split(' ')[0] || "Student"}
          onToggleBrowser={() => setIsBrowserOpen(true)}
          browserStatus={automationStatus}
          mode={mode}
          setMode={setMode}
          currentLang={currentLang}
          onChangeLang={setCurrentLang}
          t={t}
          onLogout={handleLogout}
        />

        {/* Dynamic Views depending on Sidebar selection */}
        {activeTab === 'dashboard' && (
          <div className="flex-1">
            
            {/* Hero Banner with Laptop, Headline, and Architectural Dome Graphic */}
            <HeroBanner t={t} />

            {/* Main Middle 2-Column Section */}
            <div className="mx-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (approx 62% width): Chat with CivicPilot & Available Services underneath */}
              <div className="lg:col-span-7 space-y-6">
                <ChatSection 
                  messages={messages}
                  setMessages={setMessages}
                  onSendMessage={handleSendMessage}
                  onClearChat={handleClearChat}
                  loading={chatLoading}
                  automationRunning={automationRunning}
                  currentStage={currentStage}
                  automationStatus={automationStatus}
                  onStartWorkflow={() => startAutomationWorkflow()}
                  
                  hasProfile={Boolean(applicantProfile?.name && applicantProfile.name.trim())}
                  t={t}
                  currentLang={currentLang}
                  onChangeLang={setCurrentLang}
                  applicantProfile={applicantProfile}
                  setApplicantProfile={setApplicantProfile}
                  onOpenDocScanner={() => setIsDocScannerOpen(true)}
                />

                {/* Available Services (4 colorful cards moved directly under chatbot) */}
                <AvailableServices 
                  onSelectService={handleSelectService}
                  onBrowseAll={() => setActiveTab('services')}
                  t={t}
                />
              </div>

              {/* Right Column (approx 38% width): Statutory Eligibility Gauge, Execution Timeline & Application Preview */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Statutory Eligibility Match Gauge Widget (Feature 3) */}
                <EligibilityGaugeWidget 
                  applicantProfile={applicantProfile}
                  selectedScheme={selectedScheme}
                  t={t}
                />

                {/* Agent Execution Timeline Widget with "Live" Badge */}
                <ExecutionTimelineWidget 
                  currentStage={currentStage}
                  automationRunning={automationRunning}
                  onOpenLiveMonitor={() => setIsBrowserOpen(true)}
                  t={t}
                />

                {/* Application Preview Widget with "Awaiting Your Approval" Badge */}
                <ApplicationPreviewWidget 
                  applicantProfile={applicantProfile}
                  waitingApproval={waitingApproval}
                  isSubmitted={isSubmitted}
                  onReviewDetails={() => setIsPreviewOpen(true)}
                  t={t}
                />

              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Full Government Services Catalog */}
        {activeTab === 'services' && (
          <div className="p-8">
            <ServicesCatalog 
              services={services}
              onSelectScheme={setSelectedScheme}
              onStartWithScheme={(scheme) => {
                setSelectedScheme(scheme);
                setActiveTab('dashboard');
                handleSendMessage(`I want to apply for ${scheme.title}`);
              }}
            />
          </div>
        )}

        {/* Tab 3: Full Applications Tracking */}
        {activeTab === 'applications' && (
          <div className="p-8">
            <ApplicationsTracking 
              applications={applications}
              onOpenReceipt={(r) => {
                setActiveReceipt(r);
                setIsReceiptOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 4: Direct AI Assistant View */}
        {activeTab === 'chat' && (
          <div className="p-8 max-w-4xl mx-auto h-[calc(100vh-100px)]">
            <ChatSection 
              messages={messages}
              setMessages={setMessages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              loading={chatLoading}
              automationRunning={automationRunning}
              currentStage={currentStage}
              automationStatus={automationStatus}
              onStartWorkflow={startAutomationWorkflow}
              t={t}
              currentLang={currentLang}
              onChangeLang={setCurrentLang}
              applicantProfile={applicantProfile}
              setApplicantProfile={setApplicantProfile}
              onOpenDocScanner={() => setIsDocScannerOpen(true)}
            />
          </div>
        )}



        {/* Tab 6: Help & Support */}
        {activeTab === 'help' && (
          <div className="p-8 max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">CivicPilot Help & Support</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                CivicPilot AI is your autonomous public service navigator. If you encounter any difficulties during your application or eligibility verification, consult the resources below.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800">Helpline (Toll-Free)</div>
                  <div className="text-slate-500 mt-1">1800-111-2026 (NSP Helpdesk)</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-800">Email Assistance</div>
                  <div className="text-slate-500 mt-1">helpdesk@civicpilot.gov.in</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Safety Gatekeeper Citizen Approval Modal (Review Details) */}
      <ApplicationPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewData={previewData || applicantProfile}
        onApprove={handleApproveSubmission}
        isSubmitting={isSubmittingApproval}
      />

      {/* Playwright Live Browser Viewport Modal */}
      <BrowserStreamModal 
        isOpen={isBrowserOpen}
        onClose={() => setIsBrowserOpen(false)}
        screenshotUrl={screenshotUrl}
        currentUrl={currentUrl}
        activeField={activeField}
        logs={automationLogs}
        status={automationStatus}
        onStartAutomation={startAutomationWorkflow}
      />

      {/* Verifiable Submission Receipt Modal */}
      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={activeReceipt}
      />

      {/* AI Document Scanner & OCR Modal (Feature 2) */}
      <DocumentScannerModal 
        isOpen={isDocScannerOpen}
        onClose={() => setIsDocScannerOpen(false)}
        onApplyExtractedData={handleApplyExtractedDocData}
        applicantName={applicantProfile?.name || currentUser?.name || "Citizen"}
      />

    </div>
  );
}
