import React from 'react';
import { ArrowLeft, History, PlusCircle } from 'lucide-react';
import { ViewMode, WorkoutSession, ExercisePlan } from '../types';
import ExerciseNameBuilder from '../components/ExerciseNameBuilder';

interface PlannerViewProps {
  setView: (view: ViewMode) => void;
  currentSession: WorkoutSession | null;
  setCurrentSession: (session: WorkoutSession) => void;
  handleSaveProgress: () => void;
  handleStartLogger: () => void;
  handleUpdateExercise: (updatedExercise: ExercisePlan) => void;
  handleAddExerciseToSession: () => void;
  savedPRs: Record<string, number>;
}

const PlannerView: React.FC<PlannerViewProps> = ({
  setView,
  currentSession,
  setCurrentSession,
  handleSaveProgress,
  handleStartLogger,
  handleUpdateExercise,
  handleAddExerciseToSession,
  savedPRs
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
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-white">編輯本次計畫</h2>
        <button onClick={handleStartLogger} className="text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-lg">
          開始訓練
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="bg-card p-4 rounded-xl border border-slate-700">
          <label className="text-xs text-gray-400 mb-1 block">日期</label>
          <input 
            type="date"
            value={currentSession.date}
            onChange={(e) => setCurrentSession({...currentSession, date: e.target.value})}
            className="bg-transparent text-white text-sm font-bold focus:outline-none mb-2 block w-full"
          />
          <label className="text-xs text-gray-400 mb-1 block">訓練標題</label>
          <input 
            value={currentSession.title}
            onChange={(e) => setCurrentSession({...currentSession, title: e.target.value})}
            className="w-full bg-transparent text-white text-xl font-bold focus:outline-none border-b border-slate-600 pb-1"
          />
        </div>

        {currentSession.exercises.map((ex, idx) => {
          const storedPR = savedPRs[ex.name];
          return (
            <div key={ex.id} className="bg-card p-4 rounded-xl border border-slate-700 relative">
              <div className="absolute top-4 right-4 text-xs text-slate-500">#{idx + 1}</div>
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">動作名稱</label>
                <ExerciseNameBuilder 
                  initialName={ex.name}
                  onChange={(newName) => handleUpdateExercise({...ex, name: newName})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <label className="text-[10px] text-primary uppercase font-bold tracking-wider mb-2 block">目標設定</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">目標重量 (kg)</label>
                      <input 
                        type="number"
                        value={ex.targetWeight}
                        onChange={(e) => handleUpdateExercise({...ex, targetWeight: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 rounded px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">次數</label>
                        <input 
                          type="number"
                          value={ex.targetReps}
                          onChange={(e) => handleUpdateExercise({...ex, targetReps: parseFloat(e.target.value) || 0})}
                          className="w-full bg-slate-900 rounded px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">組數</label>
                        <input 
                          type="number"
                          value={ex.targetSets}
                          onChange={(e) => handleUpdateExercise({...ex, targetSets: parseFloat(e.target.value) || 0})}
                          className="w-full bg-slate-900 rounded px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex flex-col justify-between">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2 block flex items-center gap-1">
                      <History className="w-3 h-3" /> 歷史紀錄
                    </label>
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 mb-1 block">目前紀錄 1RM</label>
                      <div className={`text-lg font-mono font-medium ${storedPR ? 'text-white' : 'text-gray-600'}`}>
                        {storedPR ? `${storedPR} kg` : '無紀錄'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">本次計算用 1RM</label>
                    <input 
                      type="number"
                      value={ex.currentPR}
                      onChange={(e) => handleUpdateExercise({...ex, currentPR: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-900 rounded px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="mt-2 text-right">
                      <span className="text-[10px] text-slate-400">
                        預計強度: {ex.currentPR > 0 ? Math.round((ex.targetWeight / ex.currentPR) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={() => {
                    const newExercises = currentSession.exercises.filter(e => e.id !== ex.id);
                    setCurrentSession({...currentSession, exercises: newExercises});
                  }}
                  className="text-xs text-red-400 hover:text-red-300 py-2"
                >
                  移除此動作
                </button>
              </div>
            </div>
          );
        })}

        <button 
          onClick={handleAddExerciseToSession}
          className="w-full py-4 border-2 border-dashed border-slate-700 text-slate-400 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> 新增動作
        </button>
      </div>
    </div>
  );
};

export default PlannerView;
