import React from 'react';
import { ArrowLeft, CalendarDays, Activity, BarChart3 } from 'lucide-react';
import { ViewMode, WorkoutSession } from '../types';
import StatCard from '../components/StatCard';

interface HistoryViewProps {
  setView: (view: ViewMode) => void;
  sessions: WorkoutSession[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ setView, sessions }) => {
  const completedSessions = sessions.filter(s => s.isCompleted);
  const totalWorkouts = completedSessions.length;
  const totalVolume = completedSessions.reduce((sum, s) => {
    return sum + s.exercises.reduce((exSum, ex) => {
      return exSum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0);
    }, 0);
  }, 0);

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">訓練歷史</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard 
          label="總訓練次數"
          value={totalWorkouts}
          icon={CalendarDays}
          iconColor="text-primary"
        />
        <StatCard 
          label="總訓練容量"
          value={(totalVolume / 1000).toFixed(1)}
          unit="k"
          icon={Activity}
          iconColor="text-accent"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">最近訓練</h2>
        {completedSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>尚無訓練紀錄</p>
          </div>
        ) : (
          completedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(session => (
            <div key={session.id} className="bg-card p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs text-primary font-bold mb-1">{session.date}</div>
                  <h3 className="font-bold text-white text-lg">{session.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">總容量</div>
                  <div className="font-mono text-white font-bold">
                    {session.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0)} kg
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {session.exercises.map(ex => (
                  <div key={ex.id} className="text-xs text-gray-400 flex justify-between">
                    <span>{ex.name}</span>
                    <span>{ex.sets.length} 組</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
