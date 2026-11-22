import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ListOrdered,
  Sparkles
} from 'lucide-react';

export default function ExecutionTimeline({ stages = [], currentStage = 1 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
            <ListOrdered className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Agent Execution Timeline</h4>
            <p className="text-[10px] text-slate-500">Autonomous 12-Stage Lifecycle Progress</p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
          Stage {currentStage} / 12
        </span>
      </div>

      {/* Timeline Steps List */}
      <div className="flex-1 overflow-y-auto pt-3 pr-1 space-y-2.5">
        {stages.map((stage) => {
          const isCompleted = stage.status === 'completed';
          const isRunning = stage.status === 'running';
          const isFailed = stage.status === 'failed';
          const isPending = stage.status === 'pending';

          return (
            <div 
              key={stage.stage_id} 
              className={`flex items-start gap-3 p-2 rounded-xl transition ${
                isRunning 
                  ? 'bg-blue-50/70 border border-blue-200 shadow-2xs' 
                  : isCompleted 
                    ? 'bg-slate-50/50' 
                    : 'opacity-70'
              }`}
            >
              {/* Icon Status */}
              <div className="mt-0.5 shrink-0">
                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {isRunning && (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                )}
                {isFailed && (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                {isPending && (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400">#{stage.stage_id}</span>
                    <span className={`text-xs font-semibold truncate ${isRunning ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                      {stage.title}
                    </span>
                  </div>
                  {stage.timestamp && (
                    <span className="text-[9px] text-slate-400 font-mono shrink-0">
                      {stage.timestamp}
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {stage.details || stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
