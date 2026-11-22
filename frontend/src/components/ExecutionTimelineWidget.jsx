import React from 'react';
import { 
  Clock, 
  Check, 
  Circle, 
  Loader2 
} from 'lucide-react';

export default function ExecutionTimelineWidget({ 
  currentStage = 1, 
  automationRunning = false,
  onOpenLiveMonitor,
  t
}) {
  // Exact 7 stages matching the reference image mockup with localization
  const stages = [
    { id: 1, title: t?.timeline?.s1 || 'Understanding user request', stageMapping: 1 },
    { id: 2, title: t?.timeline?.s2 || 'Finding relevant government service', stageMapping: 2 },
    { id: 3, title: t?.timeline?.s3 || 'Checking eligibility', stageMapping: 5 },
    { id: 4, title: t?.timeline?.s4 || 'Opening scholarship portal', stageMapping: 6 },
    { id: 5, title: t?.timeline?.s5 || 'Filling application form', stageMapping: 8 },
    { id: 6, title: t?.timeline?.s6 || 'Verifying details', stageMapping: 9 },
    { id: 7, title: t?.timeline?.s7 || 'Waiting for approval', stageMapping: 10 },
  ];

  // Determine active item from backend stage (1 to 12)
  const getActiveItemIndex = () => {
    if (currentStage <= 0 || (!automationRunning && currentStage <= 1)) return 0;
    if (currentStage <= 1) return 1;
    if (currentStage <= 4) return 2;
    if (currentStage === 5) return 3;
    if (currentStage <= 7) return 4;
    if (currentStage === 8) return 5;
    if (currentStage === 9) return 6;
    return 7;
  };

  const activeIndex = getActiveItemIndex();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      
      {/* Widget Header with "Live" Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-700 stroke-[2]" />
          <h3 className="font-bold text-slate-900 text-sm">
            {t?.timeline?.title || 'Agent Execution Timeline'}
          </h3>
        </div>

        {/* Status Pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
          automationRunning 
            ? 'bg-[#eaf8f1] text-[#10b981] border border-emerald-200 shadow-2xs' 
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            automationRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
          }`}></span>
          <span>{automationRunning ? (t?.timeline?.live || 'Live') : (t?.timeline?.standby || 'Standby')}</span>
        </div>
      </div>

      {/* 7 Vertical Stages List matching the reference image layout */}
      <div className="pt-4 space-y-3.5 relative">
        
        {/* Subtle connecting vertical line */}
        <div className="absolute left-[9px] top-6 bottom-6 w-[2px] bg-slate-100 z-0"></div>

        {stages.map((stage) => {
          const isDone = activeIndex > stage.id;
          const isActive = activeIndex === stage.id;

          return (
            <div 
              key={stage.id}
              className="flex items-center gap-3 relative z-10 group"
            >
              {/* Circular Indicator Icon */}
              <div className="shrink-0 flex items-center justify-center">
                {isDone ? (
                  // Solid Emerald Green Checkmark Circle
                  <div className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isActive ? (
                  // Blue Ring with Active Pulse
                  <div className="w-5 h-5 rounded-full border-2 border-[#1e5ce0] bg-white flex items-center justify-center shadow-xs ring-4 ring-blue-50">
                    <div className="w-2 h-2 rounded-full bg-[#1e5ce0] animate-pulse"></div>
                  </div>
                ) : (
                  // Grey Hollow Circle
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white"></div>
                )}
              </div>

              {/* Stage Title Text */}
              <span
                className={`text-xs transition-colors ${
                  isActive
                    ? 'font-bold text-[#0d1e4c]'
                    : isDone
                    ? 'font-medium text-slate-700'
                    : 'font-normal text-slate-400'
                }`}
              >
                {stage.title}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}
