import React from 'react';
import { ArrowLeft, Activity, BarChart3, Trophy } from 'lucide-react';
import { ViewMode, WorkoutSession, SetType, SetRecord } from '../types';
import { WORKOUT_FORMULAS } from '../constants';
import StatCard from '../components/StatCard';

interface HistoryDetailViewProps {
  setView: (view: ViewMode) => void;
  currentSession: WorkoutSession | null;
}

const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({ setView, currentSession }) => {
  if (!currentSession) return null;

  const totalSets = currentSession.exercises.reduce((acc, ex) => 
    acc + ex.sets.filter(s => s.completed && s.type === SetType.WORKING).length, 0);
  
  const totalVolume = currentSession.exercises.reduce((acc, ex) => 
    acc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weight * s.reps) : sAcc, 0), 0);

  return (
    <div className="min-h-screen bg-dark pb-20">
      <div className="sticky top-0 z-10 bg-dark/95 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
        <button onClick={() => setView('dashboard')} className="text-white p-2 hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider">{currentSession.date}</div>
          <div className="font-bold text-white">訓練紀錄詳情</div>
        </div>
        <div className="w-9"></div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        
        {/* Summary Card */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="總訓練量"
            value={totalVolume.toLocaleString()}
            unit="kg"
            icon={Activity}
            iconColor="text-accent"
          />
          <StatCard 
            label="正式組數"
            value={totalSets}
            unit="sets"
            icon={BarChart3}
            iconColor="text-primary"
          />
        </div>

        {/* Exercises Detail */}
        <div className="space-y-4">
          {currentSession.exercises.map((ex) => {
            // Find best set (Highest 1RM estimation)
            let bestSet: SetRecord | null = null;
            let max1RM = 0;
            ex.sets.forEach(s => {
              if (s.completed && s.type === SetType.WORKING) {
                const est1RM = s.weight * (1 + s.reps / WORKOUT_FORMULAS.ONE_RM_DIVISOR);
                if (est1RM > max1RM) {
                  max1RM = est1RM;
                  bestSet = s;
                }
              }
            });

            return (
              <div key={ex.id} className="bg-card rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
                  <h3 className="font-bold text-white">{ex.name}</h3>
                  {bestSet && (
                    <div className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-500/20">
                      <Trophy className="w-3 h-3" />
                      <span>e1RM: {Math.round(max1RM)}kg</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500 border-b border-slate-700/50">
                      <tr>
                        <th className="text-left py-2 pl-2 font-normal">組別</th>
                        <th className="text-right py-2 font-normal">重量</th>
                        <th className="text-right py-2 font-normal">次數</th>
                        <th className="text-right py-2 pr-2 font-normal">1RM預估</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {ex.sets.filter(s => s.completed).map((s, i) => {
                        const isBest = bestSet && s.id === bestSet.id;
                        const est1RM = Math.round(s.weight * (1 + s.reps / WORKOUT_FORMULAS.ONE_RM_DIVISOR));
                        return (
                          <tr key={s.id} className={`border-b border-slate-800/50 last:border-0 ${isBest ? 'bg-yellow-500/5' : ''}`}>
                            <td className="py-2 pl-2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                s.type === SetType.WARMUP ? 'border-yellow-900/30 text-yellow-600' : 'border-slate-600 text-slate-400'
                              }`}>
                                {s.type === SetType.WARMUP ? 'W' : (i + 1)}
                              </span>
                            </td>
                            <td className="text-right py-2 font-mono">{s.weight}</td>
                            <td className="text-right py-2 font-mono">{s.reps}</td>
                            <td className={`text-right py-2 pr-2 font-mono ${isBest ? 'text-yellow-500 font-bold' : 'text-gray-600'}`}>
                              {s.type === SetType.WORKING ? est1RM : '-'}
                            </td>
                          </tr>
                        );
                      })}
                      {ex.sets.filter(s => s.completed).length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-gray-600 text-xs">無完成紀錄</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailView;
