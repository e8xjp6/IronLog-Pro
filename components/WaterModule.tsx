
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, History, Settings, Droplets } from 'lucide-react';
import { WaterData, WaterLogEntry } from '../types';
import BottleIcon from './BottleIcon';
import { ENERGY_CALCULATION } from '../constants';
import { generateId } from '../lib/utils';

interface WaterModuleProps {
  data: WaterData;
  onUpdateSettings: (settings: WaterData['settings']) => void;
  onAddLog: (entry: WaterLogEntry) => void;
  onUndo: () => void;
  onDeleteLog: (id: string) => void;
  onBack: () => void;
  hasWorkoutToday: boolean;
}

const WaterModule: React.FC<WaterModuleProps> = ({ 
  data, 
  onUpdateSettings, 
  onAddLog, 
  onUndo, 
  onDeleteLog,
  onBack,
  hasWorkoutToday 
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const logs = data.dailyLogs[todayStr] || [];

  // Calculation Logic
  const { totalMlGoal, totalSlots } = useMemo(() => {
    const gBase = data.settings.weight * ENERGY_CALCULATION.WATER_MULTIPLIER;
    const gProtein = data.settings.proteinMode ? ENERGY_CALCULATION.PROTEIN_BONUS : 0;
    const gWorkout = hasWorkoutToday ? ENERGY_CALCULATION.WORKOUT_BONUS : 0;
    const totalMl = gBase + gProtein + gWorkout;
    return {
      totalMlGoal: totalMl,
      totalSlots: Math.round(totalMl / data.settings.primaryContainerMl)
    };
  }, [data.settings, hasWorkoutToday]);

  const currentTotalMl = useMemo(() => logs.reduce((sum, log) => sum + log.ml, 0), [logs]);
  const isGoalMet = currentTotalMl >= totalMlGoal;
  const filledCount = Math.floor(currentTotalMl / data.settings.primaryContainerMl);

  const handleAdd = (preset: typeof data.settings.presets[0]) => {
    const newEntry: WaterLogEntry = {
      id: generateId(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ml: preset.ml,
      type: preset.type
    };
    onAddLog(newEntry);
  };

  return (
    <div className="min-h-screen bg-dark text-slate-200 p-6 flex flex-col pb-32">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            BIO<span className="text-blue-400">REPAIR</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">生化修復模組</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center mb-10">
        <motion.div 
          key={currentTotalMl}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-5xl font-black italic tracking-tighter mb-2 transition-colors duration-500 ${isGoalMet ? 'text-amber-400' : 'text-white'}`}
        >
          {currentTotalMl} <span className="text-xl text-slate-500 not-italic">ml</span>
        </motion.div>
        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Droplets className="w-3 h-3 text-blue-400" />
          {isGoalMet ? '生理修復已達標' : `目標: ${totalMlGoal}ml`}
        </div>
      </div>

      {/* Collection Wall */}
      <div className="flex-1 mb-12">
        <div className="grid grid-cols-4 gap-4 justify-items-center p-6 bg-slate-900/30 rounded-3xl border border-slate-800/50 content-start">
          {Array.from({ length: totalSlots }).map((_, i) => {
            const isFilled = i < filledCount;
            return (
              <div key={i} className="relative">
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isFilled ? 1 : 0.9,
                    opacity: isFilled ? 1 : 0.3
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <BottleIcon 
                    type="bottle" 
                    className="w-10 h-10" 
                    isGhost={!isFilled}
                    hasGlow={isFilled && isGoalMet}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
        
        {isGoalMet && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl"
          >
            <p className="text-amber-400 text-xs font-bold italic tracking-wider">
              生理修復達成：細胞已獲得充分滋養
            </p>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark via-dark to-transparent">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={onUndo}
              disabled={logs.length === 0}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-opacity"
            >
              <RotateCcw className="w-4 h-4" /> 一鍵撤回
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-opacity"
            >
              <History className="w-4 h-4" /> 時間軸
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {data.settings.presets.map((preset, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAdd(preset)}
                className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors group"
              >
                <BottleIcon type={preset.type} className="w-8 h-8 text-slate-400 group-hover:text-blue-400 transition-colors" />
                <div className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-tighter">
                  {preset.label}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* History Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-md p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic text-white">REPAIR LOGS</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400">
                <ArrowLeft className="w-6 h-6 rotate-90" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center py-20 text-slate-600 italic text-sm">今日尚無修復紀錄</div>
              ) : (
                [...logs].reverse().map((log) => (
                  <div key={log.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <BottleIcon type={log.type} className="w-8 h-8" />
                      <div>
                        <div className="text-sm font-bold text-white">{log.ml}ml</div>
                        <div className="text-[10px] text-slate-500 uppercase">{log.time}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteLog(log.id)}
                      className="text-slate-600 hover:text-red-400 text-xs font-bold"
                    >
                      刪除
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-md p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic text-white">BIO CONFIG</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-slate-400">
                <ArrowLeft className="w-6 h-6 rotate-90" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 block">體重 (kg)</label>
                <input 
                  type="number"
                  value={data.settings.weight}
                  onChange={(e) => onUpdateSettings({ ...data.settings, weight: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">高蛋白飲食模式</div>
                  <div className="text-[10px] text-slate-500 uppercase">額外增加 500ml 需求</div>
                </div>
                <button 
                  onClick={() => onUpdateSettings({ ...data.settings, proteinMode: !data.settings.proteinMode })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${data.settings.proteinMode ? 'bg-blue-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.settings.proteinMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 block">慣用容器容量 (ml)</label>
                <input 
                  type="number"
                  value={data.settings.primaryContainerMl}
                  onChange={(e) => onUpdateSettings({ ...data.settings, primaryContainerMl: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="mt-auto w-full bg-blue-500 text-white font-black italic py-4 rounded-2xl shadow-lg shadow-blue-900/20"
            >
              儲存配置
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterModule;
