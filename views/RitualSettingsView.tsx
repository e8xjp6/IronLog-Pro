import React from 'react';
import { ArrowLeft, Timer } from 'lucide-react';
import { ViewMode, SleepSettings } from '../types';
import { SLEEP_LIMITS } from '../constants';

interface RitualSettingsViewProps {
  setView: (view: ViewMode) => void;
  sleepSettings: SleepSettings;
  setSleepSettings: (settings: SleepSettings) => void;
}

const RitualSettingsView: React.FC<RitualSettingsViewProps> = ({ setView, sleepSettings, setSleepSettings }) => {
  return (
    <div className="p-6 max-w-md mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">封印儀式設定</h1>
      </div>

      <div className="bg-card p-6 rounded-xl border border-slate-700 mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-orange-500" /> 記憶封印設定
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">目標開始時間</label>
            <input 
              type="time" 
              value={sleepSettings.targetSealTime}
              onChange={(e) => {
                setSleepSettings({ ...sleepSettings, targetSealTime: e.target.value });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">目標封印時長 (小時)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min={SLEEP_LIMITS.MIN_HOURS} 
                max={SLEEP_LIMITS.MAX_HOURS} 
                step={SLEEP_LIMITS.STEP}
                value={sleepSettings.targetDurationHours}
                onChange={(e) => {
                  setSleepSettings({ ...sleepSettings, targetDurationHours: parseFloat(e.target.value) });
                }}
                className="flex-1 accent-orange-500"
              />
              <span className="text-lg font-mono font-bold text-white w-12 text-right">{sleepSettings.targetDurationHours}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RitualSettingsView;
