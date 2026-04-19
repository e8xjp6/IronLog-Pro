import React from 'react';
import { ArrowLeft, Save, CheckCircle2, Timer, Plus, X, SkipForward } from 'lucide-react';
import { ViewMode, WorkoutSession, ExercisePlan } from '../types';
import ExerciseCard from '../components/ExerciseCard';
import { TIMER_DURATIONS } from '../constants';
import { formatTime } from '../lib/utils';

interface LoggerViewProps {
  setView: (view: ViewMode) => void;
  currentSession: WorkoutSession | null;
  handleSaveProgress: () => void;
  handleUpdateExercise: (updatedExercise: ExercisePlan) => void;
  handleGenerateWarmup: (exerciseId: string) => void;
  handleStartTimer: (seconds: number) => void;
  isGenerating: string | null;
  handleFinishWorkout: () => void;
  restTimer: { seconds: number; isActive: boolean; total: number } | null;
  handleAddTimerSeconds: (seconds: number) => void;
  handleStopTimer: () => void;
}

const LoggerView: React.FC<LoggerViewProps> = ({
  setView,
  currentSession,
  handleSaveProgress,
  handleUpdateExercise,
  handleGenerateWarmup,
  handleStartTimer,
  isGenerating,
  handleFinishWorkout,
  restTimer,
  handleAddTimerSeconds,
  handleStopTimer
}) => {
  if (!currentSession) return null;

  return (
    <div className="min-h-screen bg-dark pb-20">
      <div className="sticky top-0 z-10 bg-dark/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
        <button 
          onClick={() => {
            handleSaveProgress();
            setView('dashboard');
          }} 
          className="text-white p-2 hover:bg-slate-800 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{currentSession.date}</div>
          <div className="font-bold text-white">{currentSession.title}</div>
        </div>
        <button 
          onClick={handleSaveProgress}
          className="p-2 text-gray-400 hover:text-white"
          title="儲存進度"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto pb-32">
        {currentSession.exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdate={handleUpdateExercise}
            onGenerateWarmup={handleGenerateWarmup}
            onStartTimer={handleStartTimer}
            isGenerating={isGenerating === exercise.id}
          />
        ))}

        <div className="mt-8 mb-8 p-4 bg-green-900/20 border border-green-900/50 rounded-xl text-center">
          <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
          <h3 className="text-white font-bold">完成所有訓練了嗎？</h3>
          <p className="text-gray-400 text-sm mb-4">確認儲存紀錄並結束本次訓練</p>
          <button 
            onClick={handleFinishWorkout}
            className="bg-accent hover:bg-emerald-600 text-dark font-bold py-2 px-6 rounded-full w-full max-w-xs transition-colors"
          >
            完成訓練並儲存
          </button>
        </div>
      </div>
      
      {/* Rest Timer Overlay */}
      {restTimer && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-bottom duration-300">
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1">
            <div 
              className="bg-primary h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(restTimer.seconds / restTimer.total) * 100}%` }}
            />
          </div>
          
          <div className="p-4 flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">組間休息</p>
                <p className="text-3xl font-mono font-bold text-white leading-none">
                  {formatTime(restTimer.seconds)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleAddTimerSeconds(TIMER_DURATIONS.ADD_TIME_STEP)}
                className="p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button 
                onClick={handleStopTimer}
                className="p-3 rounded-full bg-slate-800 text-red-400 hover:bg-red-900/20 border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleStopTimer}
                className="px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4 fill-current" />
                略過
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggerView;
