import { useState, useEffect } from 'react';
import { WorkoutSession, WorkoutTemplate } from '../types';
import { PR_STORAGE_KEY, SESSIONS_STORAGE_KEY, TEMPLATES_STORAGE_KEY, DEFAULT_WORKOUT_TEMPLATES } from '../constants';

export function useWorkoutData() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [savedPRs, setSavedPRs] = useState<Record<string, number>>({});
  const [isWorkoutDataLoaded, setIsWorkoutDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const loadedPRs = localStorage.getItem(PR_STORAGE_KEY);
      if (loadedPRs) setSavedPRs(JSON.parse(loadedPRs));

      const loadedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (loadedSessions) {
        setSessions(JSON.parse(loadedSessions));
      }

      const loadedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (loadedTemplates) {
        const parsedTemplates = JSON.parse(loadedTemplates);
        setTemplates(parsedTemplates);
      } else {
        setTemplates(DEFAULT_WORKOUT_TEMPLATES);
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(DEFAULT_WORKOUT_TEMPLATES));
      }
    } catch (e) {
      console.error("Failed to load workout data", e);
    } finally {
      setIsWorkoutDataLoaded(true);
    }
  }, []);

  // Sync to local storage when state changes
  useEffect(() => {
    if (isWorkoutDataLoaded) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isWorkoutDataLoaded]);

  useEffect(() => {
    if (isWorkoutDataLoaded) {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    }
  }, [templates, isWorkoutDataLoaded]);

  useEffect(() => {
    if (isWorkoutDataLoaded) {
      localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(savedPRs));
    }
  }, [savedPRs, isWorkoutDataLoaded]);

  return {
    sessions,
    setSessions,
    templates,
    setTemplates,
    savedPRs,
    setSavedPRs,
    isWorkoutDataLoaded
  };
}
