
import React from 'react';
import { 
  Droplets, 
  CheckCircle2, 
  Database, 
  CalendarDays, 
  Library, 
  History, 
  Calendar, 
  Dumbbell, 
  Trash2, 
  ChevronRight 
} from 'lucide-react';
import { ViewMode, WorkoutSession, WorkoutTemplate, SleepHistoryEntry, WaterData, ArchiveEntry } from '../types';
import MemoryGallery from '../components/MemoryGallery';

interface DashboardViewProps {
  setView: (view: ViewMode) => void;
  todayHydration: number;
  waterData: WaterData;
  sessions: WorkoutSession[];
  isSealed: boolean;
  handleWakeUp: () => void;
  lastCompletedSleep: SleepHistoryEntry | null;
  formatDuration: (ms: number) => string;
  setShowCreateModal: (show: boolean) => void;
  upcomingSessions: WorkoutSession[];
  handleEnterSession: (id: string) => void;
  handleDeleteSession: (e: React.MouseEvent, id: string) => void;
  showCreateModal: boolean;
  newSessionDate: string;
  setNewSessionDate: (date: string) => void;
  templates: WorkoutTemplate[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  handleCreateSession: (date: string, templateId: string) => void;
  archiveGallery: ArchiveEntry[];
  onEntryClick: (entry: ArchiveEntry) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  setView,
  todayHydration,
  waterData,
  sessions,
  isSealed,
  handleWakeUp,
  lastCompletedSleep,
  formatDuration,
  setShowCreateModal,
  upcomingSessions,
  handleEnterSession,
  handleDeleteSession,
  showCreateModal,
  newSessionDate,
  setNewSessionDate,
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  handleCreateSession,
  archiveGallery,
  onEntryClick
}) => {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const waterGoal = waterData.settings.weight * 35 + 
    (waterData.settings.proteinMode ? 500 : 0) + 
    (sessions.some(s => s.date === todayStr && s.isCompleted) ? 800 : 0);

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Archive Preview */}
      <MemoryGallery 
        gallery={archiveGallery.slice(0, 3)} 
        onTitleClick={() => setView('archive-gallery')}
        onEntryClick={onEntryClick}
      />

      {/* Energy Restoration Section */}
      <div className="grid grid-cols-2 gap-3 mb-6">
          <div 
            className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2 cursor-pointer hover:bg-slate-800 transition-colors" 
            onClick={() => setView('water')}
          >
              <div className="flex items-center justify-between">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400">{todayHydration}ml</span>
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Bio-Repair</div>
              <div className="text-[10px] text-blue-400/60 font-bold italic">
                  {todayHydration >= waterGoal ? '修復已達成' : `目標: ${waterGoal}ml`}
              </div>
          </div>
          
          {isSealed ? (
            <div 
              onClick={handleWakeUp}
              className="bg-orange-500 border border-orange-400 p-4 rounded-2xl flex flex-col gap-2 cursor-pointer hover:bg-orange-600 transition-all active:scale-95 group shadow-lg shadow-orange-900/20"
            >
              <div className="flex items-center justify-between">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-black text-white italic">RITUAL COMPLETE</span>
              </div>
              <div className="text-[10px] text-orange-100 font-bold uppercase">完成封印儀式</div>
              <div className="text-[10px] text-white font-bold italic">儀式結束：保存記憶碎片</div>
            </div>
          ) : (
            <div 
              onClick={() => setView('sleep-sealer')}
              className="bg-slate-900/50 border border-orange-500/30 p-4 rounded-2xl flex flex-col gap-2 cursor-pointer hover:bg-orange-500/10 transition-colors group"
            >
              <div className="flex items-center justify-between">
                  <Database className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-orange-400 italic">
                    {lastCompletedSleep ? formatDuration(lastCompletedSleep.wakeTimestamp! - lastCompletedSleep.sealTimestamp) : 'READY TO SEAL'}
                  </span>
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Memory Sealer</div>
              <div className="text-[10px] text-orange-400/60 font-bold italic">
                {lastCompletedSleep ? '上次封印時長' : '進行記憶封印儀式'}
              </div>
            </div>
          )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
           <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-blue-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
           >
              <CalendarDays className="w-6 h-6" />
              <span className="font-bold text-sm">安排新訓練</span>
           </button>
           <button 
              onClick={() => setView('templates')}
              className="bg-slate-800 hover:bg-slate-700 text-gray-300 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
           >
              <Library className="w-6 h-6" />
              <span className="font-bold text-sm">管理週期計畫</span>
           </button>
           <button 
              onClick={() => setView('completed-workouts')}
              className="col-span-2 bg-slate-900/80 hover:bg-slate-800 text-accent p-4 rounded-2xl flex items-center justify-center gap-3 border border-accent/20 transition-all active:scale-95"
           >
              <History className="w-5 h-5" />
              <span className="font-bold text-sm">查看訓練紀錄詳情</span>
           </button>
      </div>

      {/* Upcoming List */}
      <div className="mb-8 flex-1">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" /> 接下來的訓練
          </h2>
          
          {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                  <p className="text-gray-500 text-sm mb-2">目前沒有安排訓練</p>
                  <button onClick={() => setShowCreateModal(true)} className="text-primary text-sm font-bold">立即安排</button>
              </div>
          ) : (
              <div className="space-y-3">
                  {upcomingSessions.map(session => (
                      <div 
                          key={session.id} 
                          onClick={() => handleEnterSession(session.id)}
                          className="bg-card hover:bg-slate-700/80 p-4 rounded-xl border border-slate-700 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                      >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                          <div className="pl-2">
                              <div className="text-xs text-primary font-bold mb-1 uppercase tracking-wider">{session.date}</div>
                              <div className="text-white font-bold text-lg">{session.title}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                  <Dumbbell className="w-3 h-3" />
                                  {session.exercises.length} 個動作預定
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <button 
                                  onClick={(e) => handleDeleteSession(e, session.id)}
                                  className="text-gray-500 hover:text-red-400 p-3 hover:bg-red-400/10 rounded-full transition-all relative z-20"
                                  title="刪除"
                              >
                                  <Trash2 className="w-5 h-5" />
                              </button>
                              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
              <div className="bg-card w-full max-w-sm rounded-2xl p-6 border border-slate-700 shadow-2xl animate-in slide-in-from-bottom">
                  <h3 className="text-xl font-bold text-white mb-4">安排訓練</h3>
                  
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="text-xs text-gray-400 mb-1 block">日期</label>
                          <input 
                              type="date" 
                              value={newSessionDate}
                              onChange={(e) => setNewSessionDate(e.target.value)}
                              className="w-full bg-slate-800 text-white rounded-lg px-3 py-3 outline-none focus:ring-1 focus:ring-primary"
                          />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 mb-1 block">選擇週期計畫</label>
                          {templates.length > 0 ? (
                              <select 
                                  value={selectedTemplateId}
                                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-3 outline-none focus:ring-1 focus:ring-primary appearance-none"
                              >
                                  {templates.map(t => (
                                      <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                              </select>
                          ) : (
                              <div className="text-red-400 text-xs p-2 bg-red-900/10 rounded">
                                  請先至「管理週期計畫」建立範本
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <button 
                          onClick={() => setShowCreateModal(false)}
                          className="py-3 text-gray-400 hover:text-white transition-colors"
                      >
                          取消
                      </button>
                      <button 
                          disabled={templates.length === 0}
                          onClick={() => {
                              handleCreateSession(newSessionDate, selectedTemplateId);
                              setShowCreateModal(false);
                          }}
                          className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 shadow-lg shadow-blue-900/20"
                      >
                          建立
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DashboardView;
