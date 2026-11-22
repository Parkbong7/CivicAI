import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  User, 
  Bot, 
  Paperclip, 
  Send, 
  Rocket, 
  Check, 
  Circle, 
  Loader2, 
  Sparkles, 
  Mic, 
  Square, 
  Volume2, 
  VolumeX, 
  FileText,
  Radio
} from 'lucide-react';
import api from '../api';

export default function ChatSection({ 
  messages, 
  setMessages,
  onSendMessage, 
  onClearChat, 
  loading, 
  automationRunning, 
  currentStage = 1,
  automationStatus = 'idle',
  onStartWorkflow,
  hasProfile = false,
  t,
  currentLang = 'en',
  onChangeLang,
  applicantProfile,
  setApplicantProfile,
  onOpenDocScanner
}) {
  const [inputText, setInputText] = useState('');
  const [chatLang, setChatLang] = useState(currentLang || 'en');
  const chatEndRef = useRef(null);

  // Multimodal Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, automationRunning, currentStage, voiceProcessing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading || voiceProcessing) return;
    const text = inputText.trim();
    const lower = text.toLowerCase();
    if (/[\u0b80-\u0bff]/.test(text) || ["enakku", "pannanum", "vendum", "solunga", "eppadi", "pannunga", "venum", "vanakkam"].some(w => lower.includes(w))) {
      setChatLang('ta');
    } else if (/[\u0900-\u097f]/.test(text) || ["mujhe", "chahiye", "karna hai", "batao", "kaise", "mera", "namaste"].some(w => lower.includes(w))) {
      setChatLang('hi');
    } else if (/[\u0c00-\u0c7f]/.test(text) || ["naku", "kavali", "cheyali", "namaskaram"].some(w => lower.includes(w))) {
      setChatLang('te');
    }
    onSendMessage(text);
    setInputText('');
  };

  // Mini Stepper Stages
  const stepperStages = [
    { id: 1, label: t?.chat?.step1 || 'Understanding Request' },
    { id: 2, label: t?.chat?.step2 || 'Checking Eligibility' },
    { id: 3, label: t?.chat?.step3 || 'Navigating Portal' },
    { id: 4, label: t?.chat?.step4 || 'Filling Form' },
    { id: 5, label: t?.chat?.step5 || 'Awaiting Approval' },
    { id: 6, label: t?.chat?.step6 || 'Submitting' },
  ];

  // Map 12 backend stages to the 6 stepper nodes
  const getActiveStepperIndex = () => {
    if (currentStage <= 2) return 1;
    if (currentStage <= 5) return 2;
    if (currentStage <= 7) return 3;
    if (currentStage <= 9) return 4;
    if (currentStage === 10) return 5;
    return 6;
  };

  const activeStepperIndex = getActiveStepperIndex();

  // Text-to-Speech Read Aloud
  const handleSpeak = (text, idx, overrideLang) => {
    if (!window.speechSynthesis) return;

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/•/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    let autoLang = overrideLang || chatLang || currentLang;
    if (!autoLang || autoLang === 'en') {
      if (/[\u0b80-\u0bff]/.test(cleanText)) autoLang = 'ta';
      else if (/[\u0900-\u097f]/.test(cleanText)) autoLang = 'hi';
      else if (/[\u0c00-\u0c7f]/.test(cleanText)) autoLang = 'te';
      else if (/[\u0980-\u09ff]/.test(cleanText)) autoLang = 'bn';
    }
    const langMap = { hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', en: 'en-IN' };
    utterance.lang = langMap[autoLang] || 'en-IN';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  // Start Real MediaRecorder Audio Capture
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone access is required for Voice Assistant. Please allow microphone permission in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSendAudio = async (blob) => {
    setVoiceProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'citizen_voice.webm');
      if (applicantProfile) {
        formData.append('current_profile', JSON.stringify(applicantProfile));
      }

      const res = await api.sendVoiceAudio(formData);
      const data = res.data;

      if (data && data.transcript) {
        const transcript = data.transcript;
        const reply = data.reply;
        const detectedLang = data.detected_language || "Tamil";
        const langCode = data.language_code || "ta";

        // Update ONLY local conversation language for the chat (never forces the entire dashboard to change)
        setChatLang(langCode);

        const currentMsgCount = messages.length;
        if (setMessages) {
          setMessages(prev => [
            ...prev,
            { role: 'user', content: `🎙️ ${transcript}`, lang: langCode },
            { role: 'assistant', content: reply, lang: langCode }
          ]);
        } else if (onSendMessage) {
          onSendMessage(transcript);
        }

        // Update profile if extracted
        if (data.updated_profile && setApplicantProfile) {
          setApplicantProfile(prev => ({ ...prev, ...data.updated_profile }));
        }

        // Auto speak assistant response in the detected language!
        setTimeout(() => {
          handleSpeak(reply, currentMsgCount + 1, langCode);
        }, 300);
      }
    } catch (err) {
      console.error("Voice processing error:", err);
      if (setMessages) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "I had trouble processing the audio recording. Please ensure your microphone is working and try again."
          }
        ]);
      }
    } finally {
      setVoiceProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[520px] overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">{t?.chat?.title || 'Chat with CivicPilot'}</h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t?.chat?.online || 'Online'}
            </span>
            {chatLang && chatLang !== 'en' && (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                🗣️ {chatLang === 'ta' ? 'தமிழ்' : chatLang === 'hi' ? 'हिंदी' : chatLang === 'te' ? 'తెలుగు' : chatLang === 'mr' ? 'मराठी' : chatLang === 'bn' ? 'বাংলা' : chatLang}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          <span>{t?.chat?.clearChat || 'Clear Chat'}</span>
        </button>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                  isUser
                    ? 'bg-[#1e5ce0] text-white'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4 stroke-[2]" /> : <Bot className="w-4 h-4 stroke-[2]" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed relative group ${
                  isUser
                    ? 'bg-[#e0e7ff]/80 text-[#1e1b4b] font-medium rounded-tr-xs'
                    : 'bg-[#edf4fe]/90 text-slate-800 rounded-tl-xs border border-blue-100/60'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                {!isUser && (
                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleSpeak(m.content, idx)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 transition cursor-pointer"
                      title={speakingIdx === idx ? "Stop Audio" : "Listen in your language"}
                    >
                      {speakingIdx === idx ? (
                        <>
                          <VolumeX className="w-3 h-3 text-blue-600 animate-pulse" />
                          <span className="text-blue-600 font-bold">Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Embedded "Agent is working..." Status Card with Horizontal Stepper */}
        {(automationRunning || automationStatus === 'waiting_approval' || automationStatus === 'completed') && (
          <div className="mx-2 my-2 p-4 bg-[#e8f1fd] border border-blue-200/70 rounded-2xl shadow-2xs space-y-3.5 animate-in fade-in duration-200">
            
            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Rocket className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#0d1e4c]">
                  {automationStatus === 'waiting_approval' 
                    ? (t?.chat?.agentPaused || 'Agent Paused for Approval...') 
                    : automationStatus === 'completed' 
                    ? (t?.chat?.agentSuccess || 'Application Completed Successfully!') 
                    : (t?.chat?.agentWorking || 'Agent is working...')}
                </h4>
                <p className="text-[11px] text-slate-600">
                  {automationStatus === 'waiting_approval'
                    ? 'Form filled. Waiting for your final review and submission confirmation.'
                    : automationStatus === 'completed'
                    ? 'Application submitted to official government portal. Official receipt issued.'
                    : 'Opening official scholarship portal and collecting information.'}
                </p>
              </div>
            </div>

            {/* Stepper Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between relative px-2">
                {/* Connecting background line */}
                <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-slate-300 z-0"></div>
                {/* Active progress line */}
                <div 
                  className="absolute top-2.5 left-4 h-0.5 bg-blue-600 z-0 transition-all duration-300"
                  style={{ width: `${Math.min(100, ((activeStepperIndex - 1) / 5) * 100)}%` }}
                ></div>

                {stepperStages.map((step) => {
                  const isDone = activeStepperIndex > step.id;
                  const isActive = activeStepperIndex === step.id;

                  return (
                    <div key={step.id} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isDone
                            ? 'bg-blue-600 text-white'
                            : isActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-200 animate-pulse'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                      </div>
                      <span className={`text-[9px] mt-1.5 font-medium text-center max-w-[60px] leading-tight ${
                        isActive ? 'text-blue-900 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#edf4fe] rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-600 border border-blue-100/60 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>{t?.chat?.analyzing || 'CivicPilot is analyzing your request...'}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="px-4 py-2 bg-[#f8fafc] border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-medium shrink-0">{t?.chat?.quickActions || 'Quick Options:'}</span>
        {onOpenDocScanner && (
          <button
            type="button"
            onClick={onOpenDocScanner}
            className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <FileText className="w-3 h-3 text-indigo-600" />
            <span>📄 AI Document Scanner (OCR)</span>
          </button>
        )}
        
        {hasProfile && !automationRunning && (
          <button
            type="button"
            onClick={onStartWorkflow}
            className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-300 transition shrink-0 flex items-center gap-1 shadow-2xs animate-pulse cursor-pointer"
          >
            <Rocket className="w-3 h-3 text-emerald-600" />
            <span>{t?.chat?.startBrowser || '🚀 Submit Official Application'}</span>
          </button>
        )}
      </div>

      {/* Real-time Voice Recording Status Bar */}
      {isRecording && (
        <div className="px-4 py-2.5 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs text-red-700 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="font-bold">
              Recording Citizen Voice ({Math.floor(recordSeconds / 60)}:{(recordSeconds % 60).toString().padStart(2, '0')})
            </span>
            <span className="text-[11px] text-red-600 hidden sm:inline">— Speak in Hindi, Tamil, English, etc.</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop & Send</span>
          </button>
        </div>
      )}

      {/* Voice Processing Status Bar */}
      {voiceProcessing && (
        <div className="px-4 py-2.5 bg-blue-50 border-t border-blue-200 flex items-center gap-2.5 text-xs text-blue-800 animate-in fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="font-bold">AI Whisper Multimodal Voice:</span>
          <span>Detecting spoken language & preparing response in your language...</span>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 bg-[#f8fafc] border border-slate-200 rounded-full px-4 py-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition shadow-2xs">
          
          {/* Document Attachment Button (Opens AI Scanner) */}
          <button
            type="button"
            onClick={onOpenDocScanner ? onOpenDocScanner : () => onSendMessage("I want to scan my income certificate and marksheet.")}
            className="p-1.5 text-slate-400 hover:text-blue-600 transition cursor-pointer"
            title="Upload / Scan Documents (Income Certificate & Marksheet)"
          >
            <Paperclip className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Voice Microphone Input Button (Whisper / Multimodal Audio) */}
          <button
            type="button"
            onClick={handleToggleVoice}
            disabled={voiceProcessing}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200 shadow-md'
                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title={isRecording ? "Recording... Click to stop and send" : "Record voice (Whisper Multimodal AI - Auto-detects language)"}
          >
            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4 stroke-[2]" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording ? "Listening to your voice..." :
              chatLang === 'ta' ? "உங்கள் கேள்வியை தட்டச்சு செய்யவும்... (எ.கா. 'டிரைவிங் லைசென்ஸ்', 'ஸ்காலர்ஷிப்')" :
              chatLang === 'hi' ? "यहाँ अपना सवाल लिखें या बोलें... (उदा. 'ड्राइविंग लाइसेंस', 'छात्रवृत्ति')" :
              chatLang === 'te' ? "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి..." :
              (t?.chat?.placeholder || "Type or speak your name, college, income...")
            }
            disabled={loading || isRecording || voiceProcessing}
            className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none font-normal py-1"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading || isRecording || voiceProcessing}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition shrink-0 ${
              !inputText.trim() || loading || isRecording || voiceProcessing
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-[#1e5ce0] hover:bg-blue-700 shadow-sm cursor-pointer'
            }`}
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

        </div>
      </form>

    </div>
  );
}
