
import { useState, useEffect } from 'react';
import { WorkoutSession, WorkoutTemplate, ExercisePlan } from '../types';
import { generateId } from '../lib/utils';

export const useWorkout = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('workout_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    const saved = localStorage.getItem('workout_templates');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedPRs, setSavedPRs] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('workout_prs');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    localStorage.setItem('workout_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('workout_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('workout_prs', JSON.stringify(savedPRs));
  }, [savedPRs]);

  const handleCreateSession = (date: string, templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    const newSession: WorkoutSession = {
      id: generateId(),
      date: date,
      title: template.name,
      isCompleted: false,
      exercises: template.exercises.map(ex => ({
        id: generateId(),
        name: ex.name,
        targetWeight: 0,
        currentPR: savedPRs[ex.name] || 0,
        targetReps: ex.defaultReps,
        targetSets: ex.defaultSets,
        sets: []
      }))
    };
    setSessions([newSession, ...sessions]);
    return newSession;
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('確定要刪除此訓練計畫嗎？此動作無法復原。')) {
      setSessions(sessions.filter(s => s.id !== id));
      if (currentSession?.id === id) setCurrentSession(null);
    }
  };

  const handleUpdateExercise = (updatedExercise: ExercisePlan) => {
    if (currentSession) {
      const isNameChanged = currentSession.exercises.find(e => e.id === updatedExercise.id)?.name !== updatedExercise.name;
      let exerciseToSave = updatedExercise;
      
      if (isNameChanged) {
          const storedPR = savedPRs[updatedExercise.name] || 0;
          exerciseToSave = { ...updatedExercise, currentPR: storedPR };
      }

      const updatedSession = {
        ...currentSession,
        exercises: currentSession.exercises.map(ex => ex.id === exerciseToSave.id ? exerciseToSave : ex)
      };
      setCurrentSession(updatedSession);
      setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    }
  };

  const handleAddExerciseToSession = () => {
    if (currentSession) {
      const newExercise: ExercisePlan = {
        id: generateId(),
        name: '新動作',
        targetWeight: 20,
        currentPR: 0,
        targetReps: 10,
        targetSets: 3,
        sets: []
      };

      const updatedSession = {
        ...currentSession,
        exercises: [...currentSession.exercises, newExercise]
      };
      setCurrentSession(updatedSession);
      setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    }
  };

  const handleUpdateTemplate = (updatedTemplate: WorkoutTemplate) => {
    setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const handleCreateTemplate = () => {
    const newTemplate: WorkoutTemplate = {
      id: generateId(),
      name: '新訓練週期',
      exercises: []
    };
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('確定要刪除此訓練範本嗎？')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  return {
    sessions,
    setSessions,
    templates,
    setTemplates,
    savedPRs,
    setSavedPRs,
    currentSession,
    setCurrentSession,
    handleCreateSession,
    handleDeleteSession,
    handleUpdateExercise,
    handleAddExerciseToSession,
    handleUpdateTemplate,
    handleCreateTemplate,
    handleDeleteTemplate
  };
};
