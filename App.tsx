
import React, { useState, useEffect, useRef } from 'react';
import { ExercisePlan, ViewMode, SetType, SetRecord, WorkoutTemplate } from './types';
import { generateWarmupSets } from './services/geminiService';
import { CheckCircle2 } from 'lucide-react';
import EnergyBar from './components/EnergyBar';
import WaterModule from './components/WaterModule';
import SleepSealer from './components/SleepSealer';
import { motion, AnimatePresence } from 'motion/react';
import { SleepLog, ArchiveEntry, WaterData, WaterLogEntry } from './types';
import { ENERGY_CALCULATION, CRYSTAL_SETTINGS, ANIMATION_DURATIONS, WORKOUT_FORMULAS } from './constants';
import { generateId } from './lib/utils';

import { useWorkout } from './hooks/useWorkout';
import { useSleep } from './hooks/useSleep';
import { useWater } from './hooks/useWater';
import { useArchive } from './hooks/useArchive';
import { useEnergy } from './hooks/useEnergy';
import { useTimer } from './hooks/useTimer';

import BackupView from './views/BackupView';
import RitualSettingsView from './views/RitualSettingsView';
import DashboardView from './views/DashboardView';
import EnergyDetailView from './views/EnergyDetailView';
import ArchiveGalleryView from './views/ArchiveGalleryView';
import ArchiveDetailModal from './components/ArchiveDetailModal';
import TemplatesView from './views/TemplatesView';
import TemplateEditorView from './views/TemplateEditorView';
import HistoryView from './views/HistoryView';
import CompletedWorkoutsView from './views/CompletedWorkoutsView';
import PlannerView from './views/PlannerView';
import LoggerView from './views/LoggerView';
import HistoryDetailView from './views/HistoryDetailView';

const App: React.FC = () => {
  // Global Data via Hooks
  const { 
    sessions, setSessions, templates, setTemplates, savedPRs, setSavedPRs,
    currentSession, setCurrentSession,
    handleCreateSession: handleCreateSessionHook, 
    handleDeleteSession: handleDeleteSessionHook, 
    handleUpdateExercise: handleUpdateExerciseHook, 
    handleAddExerciseToSession: handleAddExerciseToSessionHook,
    handleUpdateTemplate: handleUpdateTemplateHook, 
    handleCreateTemplate: handleCreateTemplateHook, 
    handleDeleteTemplate: handleDeleteTemplateHook
  } = useWorkout();
  
  const { 
    sleepSettings, setSleepSettings, sleepHistory, setSleepHistory,
    handleSealMemory: handleSealMemoryHook, 
    handleWakeUp: handleWakeUpHook, 
    isSealed, lastCompletedSleep
  } = useSleep();

  const {
    waterData, setWaterData, todayHydration,
    handleUpdateWaterSettings: handleUpdateWaterSettingsHook, 
    handleAddWaterLog: handleAddWaterLogHook, 
    handleUndoWaterLog: handleUndoWaterLogHook, 
    handleDeleteWaterLog: handleDeleteWaterLogHook
  } = useWater();

  const { archiveGallery, setArchiveGallery, handleAddArchive, handleUpdateArchive } = useArchive();
  const { energy, setEnergy } = useEnergy();
  const { restTimer, handleStartTimer, handleStopTimer, handleAddTimerSeconds } = useTimer();

  const [sealingCrystal, setSealingCrystal] = useState<ArchiveEntry | null>(null);
  const [showWakeFeedback, setShowWakeFeedback] = useState(false);
  const [selectedArchiveEntry, setSelectedArchiveEntry] = useState<ArchiveEntry | null>(null);
  // Navigation & Selection
  const [view, setView] = useState<ViewMode>('dashboard');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  
  // Dashboard & Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const upcomingSessions = sessions
    .filter(s => !s.isCompleted)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // --- Backup & Restore Logic ---

  const handleExportData = () => {
    const data = {
      sessions,
      templates,
      savedPRs,
      waterData,
      sleepSettings,
      sleepHistory,
      archiveGallery,
      energy,
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
        
        // Basic validation
        if (!data.sessions && !data.templates && !data.waterData) {
            throw new Error("Invalid format");
        }

        if (confirm(`準備匯入備份資料：\n日期：${data.exportDate || '未知'}\n\n這將會覆蓋您目前的紀錄，確定要繼續嗎？`)) {
            if (data.sessions) setSessions(data.sessions);
            if (data.templates) setTemplates(data.templates);
            if (data.savedPRs) setSavedPRs(data.savedPRs);
            if (data.waterData) setWaterData(data.waterData);
            if (data.sleepSettings) setSleepSettings(data.sleepSettings);
            if (data.sleepHistory) setSleepHistory(data.sleepHistory);
            if (data.archiveGallery) setArchiveGallery(data.archiveGallery);
            if (data.energy) setEnergy(data.energy);
            alert('匯入成功！');
        }
      } catch (err) {
        console.error(err);
        alert('匯入失敗：檔案格式錯誤或損毀。');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- Sleep Sealer Logic ---

  const handleSeal = (log: SleepLog) => {
    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];

    handleSealMemoryHook(todayStr, log);

    // Generate Memory Crystal for the Gallery
    const crystalHue = energy.max > 100 ? CRYSTAL_SETTINGS.HUE_OVERCLOCKED : CRYSTAL_SETTINGS.HUE_NORMAL; // Warmer if overclocked
    const crystalOpacity = Math.min(CRYSTAL_SETTINGS.OPACITY_MAX, CRYSTAL_SETTINGS.OPACITY_BASE + (todayHydration / CRYSTAL_SETTINGS.HYDRATION_DIVISOR) * 0.5); // Clearer if hydrated

    const archiveEntry: ArchiveEntry = {
      id: `crystal_${now}`,
      date: todayStr,
      sleep_data: {
        start: now, // This is the seal start
        end: null,  // Will be wake time
        initial_energy: energy.current
      },
      ritual_logs: log,
      crystal_style: {
        hue: crystalHue,
        opacity: crystalOpacity
      }
    };

    // Trigger Animation
    setSealingCrystal(archiveEntry);
    setView('dashboard');

    // Finalize after animation
    setTimeout(() => {
      handleAddArchive(archiveEntry);
      setSealingCrystal(null);
    }, ANIMATION_DURATIONS.SEALING_CRYSTAL);
  };

  const handleWakeUp = () => {
    const now = Date.now();
    const lastEntry = [...sleepHistory].sort((a, b) => b.sealTimestamp - a.sealTimestamp)[0];
    
    if (lastEntry && lastEntry.isSealed && !lastEntry.wakeTimestamp) {
      handleWakeUpHook();
      
      // Update archive gallery as well
      setArchiveGallery((prev: any) => prev.map((entry: any) => {
        if (entry.sleep_data.start === lastEntry.sealTimestamp && entry.sleep_data.end === null) {
          return {
            ...entry,
            sleep_data: {
              ...entry.sleep_data,
              end: now
            }
          };
        }
        return entry;
      }));

      // Calculate energy recovery based on sleep duration and hydration
      const durationMs = now - lastEntry.sealTimestamp;
      const hours = durationMs / (1000 * 60 * 60);
      
      // 1. Sleep Ratio (capped at 100%)
      const sleepRatio = Math.min(100, (hours / sleepSettings.targetDurationHours) * 100);
      
      // 2. Water Bonus (based on the day the ritual started)
      const ritualStartDate = lastEntry.date;
      const ritualStartHydration = (waterData.dailyLogs[ritualStartDate] || []).reduce((sum, log) => sum + log.ml, 0);
      
      const hadWorkoutThatDay = sessions.some(s => s.date === ritualStartDate && s.isCompleted);
      const waterTarget = waterData.settings.weight * ENERGY_CALCULATION.WATER_MULTIPLIER + (waterData.settings.proteinMode ? ENERGY_CALCULATION.PROTEIN_BONUS : 0) + (hadWorkoutThatDay ? ENERGY_CALCULATION.WORKOUT_BONUS : 0);
      
      const waterRatio = waterTarget > 0 ? Math.min(1, ritualStartHydration / waterTarget) : 0;
      const waterBonus = waterRatio * ENERGY_CALCULATION.MAX_WATER_BONUS_SCORE;
      
      const totalEnergy = Math.round(sleepRatio + waterBonus);
      
      setEnergy((prev: any) => {
        const newState = {
          ...prev,
          current: totalEnergy,
          initial: totalEnergy
        };
        return newState;
      });

      setShowWakeFeedback(true);
      setTimeout(() => setShowWakeFeedback(false), 3000);
    }
  };

  const handleUpdateWaterSettings = (settings: WaterData['settings']) => {
    handleUpdateWaterSettingsHook(settings);
  };

  const handleAddWaterLog = (entry: WaterLogEntry) => {
    handleAddWaterLogHook(entry);
    
    // Also update energy calculation
    setEnergy((prev: any) => ({
      ...prev,
      current: Math.min(prev.max, prev.current + (entry.ml / 500) * 10)
    }));
  };

  const handleUndoWater = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = waterData.dailyLogs[todayStr] || [];
    if (todayLogs.length === 0) return;

    const lastLog = todayLogs[todayLogs.length - 1];
    handleUndoWaterLogHook();

    setEnergy((prev: any) => ({
      ...prev,
      current: Math.max(0, prev.current - (lastLog.ml / 500) * 10)
    }));
  };

  const handleDeleteWaterLog = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = waterData.dailyLogs[todayStr] || [];
    const logToDelete = todayLogs.find(l => l.id === id);
    if (!logToDelete) return;

    handleDeleteWaterLogHook(id);

    setEnergy((prev: any) => ({
      ...prev,
      current: Math.max(0, prev.current - (logToDelete.ml / 500) * 10)
    }));
  };

  // --- Session Management ---

  const handleCreateSession = (date: string, templateId: string) => {
      const newSession = handleCreateSessionHook(date, templateId);
      if (newSession) {
        setCurrentSession(newSession);
        setView('planner');
      }
  };

  const handleEnterSession = (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
          setCurrentSession(session);
          
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
      handleDeleteSessionHook(sessionId);
  };

  // Just Save (Do not exit)
  const handleSaveProgress = () => {
      if (!currentSession) return;
      setSessions((prev: any) => prev.map((s: any) => s.id === currentSession.id ? currentSession : s));
      alert('進度已儲存');
  };

  const handleStartLogger = () => {
    if (!currentSession) return;
    
    // Auto populate sets logic
    const updatedExercises = currentSession.exercises.map(ex => {
        const hasWorkingSets = ex.sets.some(s => s.type === SetType.WORKING);
        if (!hasWorkingSets && ex.targetSets > 0) {
          const newSets: SetRecord[] = Array.from({ length: ex.targetSets }).map(() => ({
            id: generateId(),
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
    setSessions((prev: any) => prev.map((s: any) => s.id === updatedSession.id ? updatedSession : s));
    setView('logger');
  };

  const handleFinishWorkout = () => {
    if (!currentSession) return;
    
    try {
        const newPRs = { ...savedPRs };

        // Calculate PRs and Training Bonus
        let totalCompletedSets = 0;
        currentSession.exercises.forEach(ex => {
            let maxEst1RM = 0;
            ex.sets.forEach(set => {
                if (set.type === SetType.WORKING && set.completed && set.weight > 0 && set.reps > 0) {
                    totalCompletedSets++;
                    const est1RM = set.reps === 1 ? set.weight : set.weight * (1 + set.reps / WORKOUT_FORMULAS.ONE_RM_DIVISOR);
                    if (est1RM > maxEst1RM) maxEst1RM = est1RM;
                }
            });
            const roundedMax = Math.round(maxEst1RM);
            if (roundedMax > (newPRs[ex.name] || 0)) {
                newPRs[ex.name] = roundedMax;
            }
        });

        // Update Energy
        const trainingBonus = totalCompletedSets * WORKOUT_FORMULAS.ENERGY_BONUS_PER_SET;
        setEnergy((prev: any) => ({
            ...prev,
            current: Math.min(prev.max, prev.current + trainingBonus)
        }));

        // Update PRs
        setSavedPRs(newPRs);

        // Mark as completed
        const completedSession = { 
            ...currentSession, 
            isCompleted: true,
            completedAt: new Date().toISOString()
        };

        // Update Sessions State
        setSessions((prev: any) => prev.map((s: any) => s.id === completedSession.id ? completedSession : s));
        
        // Navigation - Clear current session and go to dashboard
        setCurrentSession(null);
        setView('dashboard');

    } catch (error) {
        console.error("Error finishing workout", error);
        setCurrentSession(null);
        setView('dashboard');
    }
  };

  const handleUpdateExercise = (updatedExercise: ExercisePlan) => {
    handleUpdateExerciseHook(updatedExercise);
  };

  const handleAddExerciseToSession = () => {
    handleAddExerciseToSessionHook();
  };

  const handleGenerateWarmup = async (exerciseId: string) => {
    if (!currentSession) return;
    const exercise = currentSession.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    setIsGenerating(exerciseId);
    const warmupSets = await generateWarmupSets(exercise.name, exercise.targetWeight, exercise.currentPR);

    const updatedSession = {
      ...currentSession,
      exercises: currentSession.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const existingWorkingSets = ex.sets.filter(s => s.type !== SetType.WARMUP);
          return { ...ex, sets: [...warmupSets, ...existingWorkingSets] };
        }
        return ex;
      })
    };
    setCurrentSession(updatedSession);
    setSessions((prev: any) => prev.map((s: any) => s.id === updatedSession.id ? updatedSession : s));
    setIsGenerating(null);
  };

  const handleCreateTemplate = () => {
      const newTemplate = handleCreateTemplateHook();
      setEditingTemplateId(newTemplate.id);
      setView('template-editor');
  };

  const handleUpdateTemplate = (updatedTemplate: WorkoutTemplate) => {
      handleUpdateTemplateHook(updatedTemplate);
  };

  const handleDeleteTemplate = (id: string) => {
      handleDeleteTemplateHook(id);
  };

  // --- Views ---

  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <EnergyBar current={energy.current} max={energy.max} onOpenSleepSealer={() => setView('energy-detail')} />
            <DashboardView 
              setView={setView}
              todayHydration={todayHydration}
              waterData={waterData}
              sessions={sessions}
              isSealed={isSealed}
              handleWakeUp={handleWakeUp}
              lastCompletedSleep={lastCompletedSleep}
              formatDuration={formatDuration}
              setShowCreateModal={setShowCreateModal}
              upcomingSessions={upcomingSessions}
              handleEnterSession={handleEnterSession}
              handleDeleteSession={handleDeleteSession}
              showCreateModal={showCreateModal}
              newSessionDate={newSessionDate}
              setNewSessionDate={setNewSessionDate}
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={setSelectedTemplateId}
              handleCreateSession={handleCreateSession}
              archiveGallery={archiveGallery}
              onEntryClick={setSelectedArchiveEntry}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'planner' && <PlannerView setView={setView} currentSession={currentSession} setCurrentSession={setCurrentSession} handleSaveProgress={handleSaveProgress} handleStartLogger={handleStartLogger} handleUpdateExercise={handleUpdateExercise} handleAddExerciseToSession={handleAddExerciseToSession} savedPRs={savedPRs} />}
      {view === 'logger' && <LoggerView setView={setView} currentSession={currentSession} handleSaveProgress={handleSaveProgress} handleUpdateExercise={handleUpdateExercise} handleGenerateWarmup={handleGenerateWarmup} handleStartTimer={handleStartTimer} isGenerating={isGenerating} handleFinishWorkout={handleFinishWorkout} restTimer={restTimer} handleAddTimerSeconds={handleAddTimerSeconds} handleStopTimer={handleStopTimer} />}
      {view === 'templates' && <TemplatesView setView={setView} templates={templates} setEditingTemplateId={setEditingTemplateId} handleDeleteTemplate={handleDeleteTemplate} handleCreateTemplate={handleCreateTemplate} />}
      {view === 'template-editor' && <TemplateEditorView setView={setView} templates={templates} editingTemplateId={editingTemplateId} handleUpdateTemplate={handleUpdateTemplate} />}
      {view === 'history' && <HistoryView setView={setView} sessions={sessions} />}
      {view === 'history-detail' && <HistoryDetailView setView={setView} currentSession={currentSession} />}
      {view === 'completed-workouts' && <CompletedWorkoutsView setView={setView} sessions={sessions} />}
      {view === 'backup' && <BackupView setView={setView} handleExportData={handleExportData} handleImportData={handleImportData} fileInputRef={fileInputRef} />}
      {view === 'ritual-settings' && <RitualSettingsView setView={setView} sleepSettings={sleepSettings} setSleepSettings={setSleepSettings} />}
      {view === 'energy-detail' && <EnergyDetailView setView={setView} sleepHistory={sleepHistory} sleepSettings={sleepSettings} waterData={waterData} sessions={sessions} energy={energy} />}
      {view === 'water' && (
        <WaterModule 
          data={waterData}
          onUpdateSettings={handleUpdateWaterSettings}
          onAddLog={handleAddWaterLog}
          onUndo={handleUndoWater}
          onDeleteLog={handleDeleteWaterLog}
          onBack={() => setView('dashboard')}
          hasWorkoutToday={sessions.some(s => s.date === new Date().toISOString().split('T')[0] && s.isCompleted)}
        />
      )}
      {view === 'sleep-sealer' && (
        <SleepSealer 
          onSeal={handleSeal}
          onBack={() => setView('dashboard')}
        />
      )}
        {view === 'archive-gallery' && (
          <ArchiveGalleryView 
            setView={setView} 
            archiveGallery={archiveGallery} 
            onEntryClick={setSelectedArchiveEntry}
          />
        )}

      {/* Global Archive Detail Modal */}
      <ArchiveDetailModal 
        entry={selectedArchiveEntry}
        onClose={() => setSelectedArchiveEntry(null)}
        onUpdate={handleUpdateArchive}
      />

      {/* Sealing Animation Overlay */}
      <AnimatePresence>
        {sealingCrystal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none"
          >
            <motion.div
              initial={{ scale: 2, y: -100, opacity: 0 }}
              animate={{ 
                scale: [2, 1, 0.5], 
                y: [-100, 0, 400], 
                opacity: [0, 1, 1, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: ANIMATION_DURATIONS.SEALING_CRYSTAL / 1000, 
                times: [0, 0.2, 0.8, 1],
                ease: "easeInOut" 
              }}
              className="relative"
            >
               <div 
                className="w-32 h-40 relative"
                style={{ filter: `hue-rotate(${sealingCrystal.crystal_style.hue}deg)` }}
              >
                <div 
                  className="absolute inset-0 bg-orange-500/80 shadow-[0_0_50px_rgba(249,115,22,0.5)]"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-black italic text-xs text-center px-4 leading-none">
                  MEMORY<br/>FRAGMENT
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <h3 className="text-2xl font-black text-orange-400 italic tracking-tighter mb-2">GENERATING FRAGMENT</h3>
              <p className="text-slate-400 text-sm">封印儀式開始：正在產生記憶碎片...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wake Feedback Overlay */}
      <AnimatePresence>
        {showWakeFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-24 left-6 right-6 z-[100] bg-orange-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="p-2 bg-white/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black italic text-sm">RITUAL COMPLETE</div>
              <div className="text-xs text-orange-100">記憶碎片已穩定保存至畫廊</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
