import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ViewMode, WorkoutSession } from '../types';

interface CompletedWorkoutsViewProps {
  setView: (view: ViewMode) => void;
  sessions: WorkoutSession[];
}

const CompletedWorkoutsView: React.FC<CompletedWorkoutsViewProps> = ({ setView, sessions }) => {
  const completedSessions = sessions.filter(s => s.isCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">已完成的訓練</h1>
      </div>

      <div className="space-y-4">
        {completedSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>尚無已完成的訓練</p>
          </div>
        ) : (
          completedSessions.map(session => (
            <div key={session.id} className="bg-card p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs text-primary font-bold mb-1">{session.date}</div>
                  <h3 className="font-bold text-white text-lg">{session.title}</h3>
                </div>
                <CheckCircle2 className="w-5 h-5 text-primary" />
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

export default CompletedWorkoutsView;
