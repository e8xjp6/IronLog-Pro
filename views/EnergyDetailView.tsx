import React from 'react';
import { ArrowLeft, Timer, Droplets } from 'lucide-react';
import { ViewMode, SleepHistoryEntry, SleepSettings, WaterData, WorkoutSession, EnergyState } from '../types';
import { ENERGY_CALCULATION } from '../constants';

interface EnergyDetailViewProps {
  setView: (view: ViewMode) => void;
  sleepHistory: SleepHistoryEntry[];
  sleepSettings: SleepSettings;
  waterData: WaterData;
  sessions: WorkoutSession[];
  energy: EnergyState;
}

const EnergyDetailView: React.FC<EnergyDetailViewProps> = ({ setView, sleepHistory, sleepSettings, waterData, sessions, energy }) => {
  const lastCompletedSleep = [...sleepHistory]
    .filter(h => h.wakeTimestamp)
    .sort((a, b) => b.wakeTimestamp! - a.wakeTimestamp!)[0];

  let sleepAchievement = 0;
  let sleepDuration = 0;
  let waterAchievement = 0;
  let waterBonus = 0;
  let waterIntake = 0;
  let waterTarget = 0;

  if (lastCompletedSleep) {
    const durationMs = lastCompletedSleep.wakeTimestamp! - lastCompletedSleep.sealTimestamp;
    sleepDuration = durationMs / (1000 * 60 * 60);
    sleepAchievement = Math.min(100, (sleepDuration / sleepSettings.targetDurationHours) * 100);

    const ritualStartDate = lastCompletedSleep.date;
    waterIntake = (waterData.dailyLogs[ritualStartDate] || []).reduce((sum, log) => sum + log.ml, 0);
    const hadWorkoutThatDay = sessions.some(s => s.date === ritualStartDate && s.isCompleted);
    waterTarget = waterData.settings.weight * ENERGY_CALCULATION.WATER_MULTIPLIER + (waterData.settings.proteinMode ? ENERGY_CALCULATION.PROTEIN_BONUS : 0) + (hadWorkoutThatDay ? ENERGY_CALCULATION.WORKOUT_BONUS : 0);
    
    const waterRatio = waterTarget > 0 ? Math.min(1, waterIntake / waterTarget) : 0;
    waterAchievement = waterRatio * 100;
    waterBonus = waterRatio * ENERGY_CALCULATION.MAX_WATER_BONUS_SCORE;
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <div className="p-6 border-b border-slate-800 flex items-center gap-4">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black italic text-white tracking-tighter">ENERGY ANALYSIS</h1>
      </div>
      
      <div className="p-6 space-y-6 max-w-md mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">當前能量等級</div>
          <div className="text-6xl font-black italic text-white mb-2">{Math.round(energy.current)}%</div>
          <div className="text-xs text-orange-500 font-bold">初始值: {Math.round(energy.initial)}%</div>
        </div>

        <div className="space-y-4">
          {/* Sleep Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-white">封印儀式達成度</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">目標時長</div>
                <div className="text-lg font-mono font-bold text-white">{sleepSettings.targetDurationHours}h</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">實際時長</div>
                <div className="text-lg font-mono font-bold text-white">{sleepDuration.toFixed(1)}h</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">達成率</div>
                <div className="text-xl font-black italic text-orange-500">{Math.round(sleepAchievement)}%</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">能量貢獻</div>
                <div className="text-xl font-black italic text-white">{Math.round(sleepAchievement)}%</div>
              </div>
            </div>
          </div>

          {/* Water Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">生物修復 (喝水) 加分</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">目標水量</div>
                <div className="text-lg font-mono font-bold text-white">{waterTarget}ml</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">實際飲用</div>
                <div className="text-lg font-mono font-bold text-white">{waterIntake}ml</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">達成率</div>
                <div className="text-xl font-black italic text-blue-400">{Math.round(waterAchievement)}%</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">能量加分</div>
                <div className="text-xl font-black italic text-accent">+{Math.round(waterBonus)}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            能量初始值 = 封印達成率 (max 100%) + 喝水加分 (max 25%)<br/>
            計算結果將四捨五入至個位數。
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnergyDetailView;
