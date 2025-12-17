
import React, { useState, useEffect, useRef } from 'react';
import { WorkoutSession, ExercisePlan, ViewMode, SetType, SetRecord, WorkoutTemplate, ExerciseTemplate } from './types';
import ExerciseCard from './components/ExerciseCard';
import ExerciseNameBuilder from './components/ExerciseNameBuilder';
import { generateWarmupSets } from './services/geminiService';
import { Calendar, PlusCircle, Save, ArrowLeft, CheckCircle2, Timer, X, SkipForward, Plus, History, Library, ChevronRight, Trash2, CalendarDays, Trophy, Activity, BarChart3, Settings, Database, Download, Upload, FileJson, Dumbbell } from 'lucide-react';

const PR_STORAGE_KEY = 'ironlog_prs';
const SESSIONS_STORAGE_KEY = 'ironlog_sessions';
const TEMPLATES_STORAGE_KEY = 'ironlog_templates';

const App: React.FC = () => {
  // Global Data
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [savedPRs, setSavedPRs] = useState<Record<string, number>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Navigation & Selection
  const [view, setView] = useState<ViewMode>('dashboard');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Active Session State (The one currently being logged/planned)
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);

  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  
  // Timer State
  const [restTimer, setRestTimer] = useState<{ seconds: number; isActive: boolean; total: number } | null>(null);

  // Dashboard & Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization ---

  useEffect(() => {
    try {
      // 1. Load Local Data
      const loadedPRs = localStorage.getItem(PR_STORAGE_KEY);
      if (loadedPRs) setSavedPRs(JSON.parse(loadedPRs));

      const loadedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (loadedSessions) {
        setSessions(JSON.parse(loadedSessions));
      } else {
        setSessions([]); 
      }

      const loadedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (loadedTemplates) {
          const parsedTemplates = JSON.parse(loadedTemplates);
          setTemplates(parsedTemplates);
          if (parsedTemplates.length > 0) {
            setSelectedTemplateId(parsedTemplates[0].id);
          }
      } else {
          // Default Templates for new users
          const defaultTemplates: WorkoutTemplate[] = [
              {
                  id: 'tpl-1',
                  name: '上肢推 (Push)',
                  exercises: [
                      { id: 'te-1', name: '槓鈴臥推', defaultSets: 5, defaultReps: 5 },
                      { id: 'te-2', name: '啞鈴肩推', defaultSets: 4, defaultReps: 8 },
                      { id: 'te-3', name: '鋼索三頭下壓', defaultSets: 3, defaultReps: 12 },
                  ]
              },
              {
                  id: 'tpl-2',
                  name: '上肢拉 (Pull)',
                  exercises: [
                      { id: 'te-4', name: '徒手引體向上', defaultSets: 4, defaultReps: 8 },
                      { id: 'te-5', name: '槓鈴划船', defaultSets: 4, defaultReps: 8 },
                      { id: 'te-6', name: '啞鈴二頭彎舉', defaultSets: 3, defaultReps: 12 },
                  ]
              }
          ];
          setTemplates(defaultTemplates);
          if (defaultTemplates.length > 0) {
             setSelectedTemplateId(defaultTemplates[0].id);
          }
          localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(defaultTemplates));
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  // Sync selectedTemplateId if templates change and selection is invalid
  useEffect(() => {
    if (templates.length > 0) {
        if (!selectedTemplateId || !templates.find(t => t.id === selectedTemplateId)) {
            setSelectedTemplateId(templates[0].id);
        }
    } else {
        setSelectedTemplateId('');
    }
  }, [templates, selectedTemplateId]);

  // Save Sessions whenever they change
  useEffect(() => {
    if (isDataLoaded) {
         localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isDataLoaded]);

  // Save Templates whenever they change
  useEffect(() => {
      if (templates.length > 0) {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
      }
  }, [templates]);

  // Save PRs whenever they change
  useEffect(() => {
      if (isDataLoaded) {
        localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(savedPRs));
      }
  }, [savedPRs, isDataLoaded]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (restTimer && restTimer.isActive && restTimer.seconds > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (!prev) return null;
          if (prev.seconds <= 1) return null; // Finished
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    } else if (restTimer && restTimer.seconds <= 0) {
        setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  // --- Timer Actions ---
  const handleStartTimer = (seconds: number) => setRestTimer({ seconds, isActive: true, total: seconds });
  const handleStopTimer = () => setRestTimer(null);
  const handleAddTimerSeconds = (amount: number) => setRestTimer(prev => prev ? { ...prev, seconds: prev.seconds + amount, total: prev.total + amount } : null);

  // --- Backup & Restore Logic ---

  const handleExportData = () => {
    const data = {
      sessions,
      templates,
      savedPRs,
      exportDate: new Date().toISOString(),
      appVersion: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ironlog_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.sessions && !data.templates) {
            throw new Error("Invalid format");
        }

        if (confirm(`準備匯入備份資料：\n日期：${data.exportDate || '未知'}\n\n這將會覆蓋您目前的紀錄，確定要繼續嗎？`)) {
            if (data.sessions) setSessions(data.sessions);
            if (data.templates) setTemplates(data.templates);
            if (data.savedPRs) setSavedPRs(data.savedPRs);
            alert('匯入成功！');
        }
      } catch (err) {
        console.error(err);
        alert('匯入失敗：檔案格式錯誤或損毀。');
      } finally {
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- Session Management ---

  const handleCreateSession = (date: string, templateId: string) => {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      const newSession: WorkoutSession = {
          id: Math.random().toString(36).substr(2, 9),
          date: date,
          title: template.name,
          isCompleted: false,
          exercises: template.exercises.map(ex => ({
              id: Math.random().toString(36).substr(2, 9),
              name: ex.name,
              targetWeight: 0, // Default to 0, user sets in planner
              currentPR: savedPRs[ex.name] || 0,
              targetReps: ex.defaultReps,
              targetSets: ex.defaultSets,
              sets: []
          }))
      };

      setSessions(prev => [...prev, newSession].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      // Auto open the new session
      setCurrentSession(newSession);
      setActiveSessionId(newSession.id);
      setView('planner');
  };

  const handleEnterSession = (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
          setCurrentSession(session);
          setActiveSessionId(sessionId);
          
          if (session.isCompleted) {
              setView('history');
          } else {
              // Refresh PRs in case they updated
              const updatedSession = {
                  ...session,
                  exercises: session.exercises.map(ex => ({
                      ...ex,
                      currentPR: ex.currentPR || savedPRs[ex.name] || 0
                  }))
              };
              setCurrentSession(updatedSession);
              setView('planner');
          }
      }
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      const confirmDelete = window.confirm('確定要刪除此訓練計畫嗎？此動作無法復原。');
      if (confirmDelete) {
          const updatedSessions = sessions.filter(s => s.id !== sessionId);
          setSessions(updatedSessions);
      }
  };

  // Just Save (Do not exit)
  const handleSaveProgress = () => {
      if (!currentSession) return;
      setSessions(prev => prev.map(s => s.id === currentSession.id ? currentSession : s));
      alert('進度已儲存');
  };

  const handleStartLogger = () => {
    if (!currentSession) return;
    
    // Auto populate sets logic
    const updatedExercises = currentSession.exercises.map(ex => {
        const hasWorkingSets = ex.sets.some(s => s.type === SetType.WORKING);
        if (!hasWorkingSets && ex.targetSets > 0) {
          const newSets: SetRecord[] = Array.from({ length: ex.targetSets }).map(() => ({
            id: Math.random().toString(36).substr(2, 9),
            type: SetType.WORKING,
            weight: ex.targetWeight,
            reps: ex.targetReps,
            completed: false
          }));
          return { ...ex, sets: [...ex.sets, ...newSets] };
        }
        return ex;
    });

    const updatedSession = { ...currentSession, exercises: updatedExercises };
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setView('logger');
  };

  const handleFinishWorkout = () => {
    if (!currentSession) return;
    // Removed confirm() to prevent UI blocking issues. The big button is confirmation enough.
    
    try {
        const newPRs = { ...savedPRs };
        let prsUpdatedCount = 0;

        // Calculate PRs
        currentSession.exercises.forEach(ex => {
            let maxEst1RM = 0;
            ex.sets.forEach(set => {
                if (set.type === SetType.WORKING && set.completed && set.weight > 0 && set.reps > 0) {
                    const est1RM = set.reps === 1 ? set.weight : set.weight * (1 + set.reps / 30);
                    if (est1RM > maxEst1RM) maxEst1RM = est1RM;
                }
            });
            const roundedMax = Math.round(maxEst1RM);
            if (roundedMax > (newPRs[ex.name] || 0)) {
                newPRs[ex.name] = roundedMax;
                prsUpdatedCount++;
            }
        });

        // Update PRs
        setSavedPRs(newPRs);
        localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(newPRs));

        // Mark as completed
        const completedSession = { 
            ...currentSession, 
            isCompleted: true,
            completedAt: new Date().toISOString()
        };

        // Update Sessions State
        setSessions(prev => prev.map(s => s.id === completedSession.id ? completedSession : s));
        
        // Navigation - Clear current session and go to dashboard
        setCurrentSession(null);
        setActiveSessionId(null);
        setView('dashboard');

    } catch (error) {
        console.error("Error finishing workout", error);
        // Force exit even if calculation failed
        setCurrentSession(null);
        setActiveSessionId(null);
        setView('dashboard');
    }
  };

  // --- Exercise Logic (within Session) ---

  const handleUpdateExercise = (updatedExercise: ExercisePlan) => {
      if (!currentSession) return;
      const isNameChanged = currentSession.exercises.find(e => e.id === updatedExercise.id)?.name !== updatedExercise.name;
      let exerciseToSave = updatedExercise;
      
      if (isNameChanged) {
          const storedPR = savedPRs[updatedExercise.name] || 0;
          exerciseToSave = { ...updatedExercise, currentPR: storedPR };
      }

      setCurrentSession(prev => prev ? ({
          ...prev,
          exercises: prev.exercises.map(ex => ex.id === exerciseToSave.id ? exerciseToSave : ex)
      }) : null);
  };

  const handleAddExerciseToSession = () => {
      if (!currentSession) return;
      const newExercise: ExercisePlan = {
          id: Math.random().toString(36).substr(2, 9),
          name: '新動作',
          targetWeight: 20,
          currentPR: 0,
          targetReps: 10,
          targetSets: 3,
          sets: []
      };
      setCurrentSession(prev => prev ? ({ ...prev, exercises: [...prev.exercises, newExercise] }) : null);
  };

  const handleGenerateWarmup = async (exerciseId: string) => {
    if (!currentSession) return;
    const exercise = currentSession.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    setIsGenerating(exerciseId);
    const warmupSets = await generateWarmupSets(exercise.name, exercise.targetWeight, exercise.currentPR);

    setCurrentSession(prev => prev ? ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const existingWorkingSets = ex.sets.filter(s => s.type !== SetType.WARMUP);
          return { ...ex, sets: [...warmupSets, ...existingWorkingSets] };
        }
        return ex;
      })
    }) : null);
    setIsGenerating(null);
  };

  // --- Template Management Logic ---

  const handleCreateTemplate = () => {
      const newTemplate: WorkoutTemplate = {
          id: Math.random().toString(36).substr(2, 9),
          name: '新訓練週期',
          exercises: []
      };
      setTemplates(prev => [...prev, newTemplate]);
      setEditingTemplateId(newTemplate.id);
      setView('template-editor');
  };

  const handleUpdateTemplate = (updatedTemplate: WorkoutTemplate) => {
      setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const handleDeleteTemplate = (id: string) => {
      if (confirm('確定要刪除此週期範本嗎？')) {
          const newTemplates = templates.filter(t => t.id !== id);
          setTemplates(newTemplates);
          // If the deleted template was selected, reset selection
          if (selectedTemplateId === id) {
              setSelectedTemplateId(newTemplates.length > 0 ? newTemplates[0].id : '');
          }
      }
  };

  // --- Views ---

  // 1. Dashboard
  const renderDashboard = () => {
      const upcomingSessions = sessions.filter(s => !s.isCompleted).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const pastSessions = sessions.filter(s => s.isCompleted).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const calculateSessionVolume = (session: WorkoutSession) => {
        return session.exercises.reduce((acc, ex) => 
            acc + ex.sets.reduce((sAcc, s) => (s.completed && s.type === SetType.WORKING) ? sAcc + (s.weight * s.reps) : sAcc, 0), 0);
      };

      return (
        <div className="p-6 max-w-md mx-auto min-h-screen flex flex-col">
            <div className="flex justify-between items-start mb-6 mt-2">
                <button 
                  onClick={() => setView('settings')}
                  className="p-2 text-gray-400 hover:text-white bg-slate-800/50 rounded-full"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-3xl font-black text-white italic tracking-tighter mb-1">
                    IRON<span className="text-primary">LOG</span>
                    </h1>
                    <p className="text-xs text-secondary tracking-widest uppercase">Mobile Tracker</p>
                </div>
                <div className="w-9" />
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
            </div>

            {/* Upcoming List */}
            <div className="mb-8">
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

            {/* History List - ENHANCED */}
            <div className="flex-1">
                 <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                     <History className="w-5 h-5 text-accent" /> 已完成訓練
                 </h2>
                 {pastSessions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 text-sm">尚未有完成的訓練紀錄</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                        {pastSessions.map(session => {
                            const volume = calculateSessionVolume(session);
                            return (
                                <div 
                                    key={session.id} 
                                    onClick={() => handleEnterSession(session.id)}
                                    className="bg-slate-900/50 hover:bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-800 cursor-pointer transition-colors group relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50"></div>
                                    <div className="pl-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="text-xs text-gray-400">{session.date}</div>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded border border-accent/20">Completed</span>
                                        </div>
                                        <div className="text-base font-bold text-gray-200 mb-1">{session.title}</div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Activity className="w-3 h-3" /> {Math.round(volume/1000)}k kg
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Trophy className="w-3 h-3" /> PRs Checked
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => handleDeleteSession(e, session.id)}
                                            className="text-gray-600 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-full transition-all relative z-20 opacity-0 group-hover:opacity-100"
                                            title="刪除紀錄"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                    </div>
                                </div>
                            );
                        })}
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

  const renderSettings = () => (
      <div className="p-6 max-w-md mx-auto min-h-screen">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">資料管理 & 設定</h1>
        </div>

        <div className="bg-card p-6 rounded-xl border border-slate-700 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-primary" /> 本機資料備份
            </h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                您的訓練資料目前儲存在此裝置的瀏覽器中。為了防止資料遺失（如清除快取或更換手機），建議您定期下載備份檔案。
            </p>

            <div className="grid gap-4">
                <button 
                    onClick={handleExportData}
                    className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors group"
                >
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-primary/20 rounded-lg text-primary">
                             <Download className="w-5 h-5" />
                         </div>
                         <div className="text-left">
                             <div className="text-sm font-bold text-white">匯出備份檔</div>
                             <div className="text-[10px] text-gray-500">下載 .json 檔案至裝置</div>
                         </div>
                     </div>
                </button>

                <div className="relative">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/20 rounded-lg text-accent">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">還原備份檔</div>
                                <div className="text-[10px] text-gray-500">從 .json 檔案恢復紀錄</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
                <h3 className="text-xs font-bold text-yellow-500 mb-1 flex items-center gap-1">
                    <FileJson className="w-3 h-3" /> 注意事項
                </h3>
                <p className="text-[10px] text-yellow-500/80">
                    還原備份檔將會<span className="font-bold underline">完全覆蓋</span>您目前的現有資料。請確認備份檔案是最新的版本。
                </p>
            </div>
        </div>
      </div>
  );

  // 2. Template List View
  const renderTemplates = () => (
      <div className="p-6 max-w-md mx-auto min-h-screen">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">週期計畫管理</h1>
        </div>
        
        <div className="space-y-3 mb-6">
            {templates.map(template => (
                <div key={template.id} className="bg-card border border-slate-700 p-4 rounded-xl flex justify-between items-center group">
                    <div 
                        onClick={() => { setEditingTemplateId(template.id); setView('template-editor'); }}
                        className="flex-1 cursor-pointer"
                    >
                        <h3 className="font-bold text-white text-lg">{template.name}</h3>
                        <p className="text-xs text-gray-500">{template.exercises.length} 個預設動作</p>
                    </div>
                    <button 
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>

        <button 
            onClick={handleCreateTemplate}
            className="w-full py-4 border-2 border-dashed border-slate-700 text-slate-400 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-colors"
        >
            <PlusCircle className="w-5 h-5" /> 建立新訓練日
        </button>
      </div>
  );

  // 3. Template Editor View
  const renderTemplateEditor = () => {
      const template = templates.find(t => t.id === editingTemplateId);
      if (!template) return <div>Error: Template not found</div>;

      const addExercise = () => {
          const newEx: ExerciseTemplate = {
              id: Math.random().toString(36).substr(2, 9),
              name: '',
              defaultSets: 3,
              defaultReps: 10
          };
          const updated = { ...template, exercises: [...template.exercises, newEx] };
          handleUpdateTemplate(updated);
      };

      const updateEx = (id: string, field: keyof ExerciseTemplate, value: any) => {
          const updatedExs = template.exercises.map(ex => 
             ex.id === id ? { ...ex, [field]: value } : ex
          );
          handleUpdateTemplate({ ...template, exercises: updatedExs });
      };

      const removeEx = (id: string) => {
          handleUpdateTemplate({ ...template, exercises: template.exercises.filter(ex => ex.id !== id)});
      };

      return (
        <div className="p-6 max-w-md mx-auto min-h-screen bg-dark pb-20">
             <div className="sticky top-0 bg-dark/95 backdrop-blur z-10 py-4 flex items-center justify-between border-b border-slate-800 mb-6">
                <button onClick={() => setView('templates')} className="text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <span className="font-bold text-gray-400 text-xs uppercase">編輯範本</span>
                <div className="w-6" /> 
            </div>

            <div className="mb-8">
                <label className="text-xs text-primary font-bold mb-2 block uppercase tracking-wider">訓練日名稱</label>
                <input 
                    value={template.name}
                    onChange={(e) => handleUpdateTemplate({...template, name: e.target.value})}
                    placeholder="例如：腿部訓練 (Leg Day)"
                    className="w-full bg-transparent text-2xl font-bold text-white border-b border-slate-700 pb-2 focus:outline-none focus:border-primary"
                />
            </div>

            <div className="space-y-4">
                {template.exercises.map((ex, idx) => (
                    <div key={ex.id} className="bg-card p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between mb-3">
                            <span className="text-xs text-gray-500">#{idx + 1}</span>
                            <button onClick={() => removeEx(ex.id)} className="text-gray-600 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mb-3">
                             <ExerciseNameBuilder 
                                initialName={ex.name}
                                onChange={(newName) => updateEx(ex.id, 'name', newName)}
                             />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">預設組數</label>
                                <input 
                                    type="number"
                                    value={ex.defaultSets}
                                    onChange={(e) => updateEx(ex.id, 'defaultSets', parseInt(e.target.value))}
                                    className="w-full bg-slate-900 rounded px-2 py-2 text-white text-center"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">預設次數</label>
                                <input 
                                    type="number"
                                    value={ex.defaultReps}
                                    onChange={(e) => updateEx(ex.id, 'defaultReps', parseInt(e.target.value))}
                                    className="w-full bg-slate-900 rounded px-2 py-2 text-white text-center"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={addExercise}
                    className="w-full py-4 bg-slate-800 text-primary rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                >
                    <Plus className="w-5 h-5" /> 加入動作
                </button>
            </div>
        </div>
      );
  };

  // 4. Planner (Adapted for Current Session)
  const renderPlanner = () => {
    if (!currentSession) return null;
    return (
    <div className="min-h-screen bg-dark pb-20">
      <div className="sticky top-0 z-10 bg-dark/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
        <button 
            onClick={() => {
                handleSaveProgress(); // Just save
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
        )})}

        <button 
            onClick={handleAddExerciseToSession}
            className="w-full py-4 border-2 border-dashed border-slate-700 text-slate-400 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-colors"
        >
            <PlusCircle className="w-5 h-5" /> 新增動作
        </button>
      </div>
    </div>
  )};

  // 5. Logger (Adapted)
  const renderLogger = () => {
    if (!currentSession) return null;
    return (
    <div className="min-h-screen bg-dark pb-20 relative">
      <div className="sticky top-0 z-20 bg-dark/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <button onClick={() => setView('dashboard')} className="text-white p-2 hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{currentSession.date}</h2>
            <h1 className="text-base font-bold text-white">{currentSession.title}</h1>
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
                       {/* Formatting inside App component for simplicity */}
                       {Math.floor(restTimer.seconds / 60)}:{Math.floor(restTimer.seconds % 60).toString().padStart(2, '0')}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => handleAddTimerSeconds(30)}
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
  )};

  // 6. History Detail View
  const renderHistory = () => {
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
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold mb-2">
                            <Activity className="w-4 h-4 text-accent" /> 總訓練量
                        </div>
                        <div className="text-2xl font-mono text-white">{totalVolume.toLocaleString()} <span className="text-sm text-gray-500">kg</span></div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold mb-2">
                            <BarChart3 className="w-4 h-4 text-primary" /> 正式組數
                        </div>
                        <div className="text-2xl font-mono text-white">{totalSets} <span className="text-sm text-gray-500">sets</span></div>
                    </div>
                </div>

                {/* Exercises Detail */}
                <div className="space-y-4">
                    {currentSession.exercises.map((ex, idx) => {
                        // Find best set (Highest 1RM estimation)
                        let bestSet = null;
                        let max1RM = 0;
                        ex.sets.forEach(s => {
                            if (s.completed && s.type === SetType.WORKING) {
                                const est1RM = s.weight * (1 + s.reps/30);
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
                                                const est1RM = Math.round(s.weight * (1 + s.reps/30));
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

  return (
    <div className="bg-dark min-h-screen text-gray-100 font-sans selection:bg-primary selection:text-white">
      {view === 'dashboard' && renderDashboard()}
      {view === 'templates' && renderTemplates()}
      {view === 'template-editor' && renderTemplateEditor()}
      {view === 'planner' && renderPlanner()}
      {view === 'logger' && renderLogger()}
      {view === 'history' && renderHistory()}
      {view === 'settings' && renderSettings()}
    </div>
  );
};

export default App;
