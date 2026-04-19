
export enum SetType {
  WARMUP = 'WARMUP',
  WORKING = 'WORKING',
  DROP = 'DROP',
  FAILURE = 'FAILURE'
}

export interface SetRecord {
  id: string;
  type: SetType;
  weight: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion
  completed: boolean;
}

export interface ExercisePlan {
  id: string;
  name: string;
  targetWeight: number;
  currentPR: number; // The user's current 1RM (One Rep Max)
  targetReps: number;
  targetSets: number;
  notes?: string;
  sets: SetRecord[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  title: string;
  exercises: ExercisePlan[];
  isCompleted: boolean;
  completedAt?: string;
}

// New Types for Templates
export interface ExerciseTemplate {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string; // e.g., "Push Day", "Hypertrophy A"
  exercises: ExerciseTemplate[];
}

export type ViewMode = 'dashboard' | 'planner' | 'logger' | 'templates' | 'template-editor' | 'history' | 'history-detail' | 'settings' | 'sleep-sealer' | 'water' | 'completed-workouts' | 'archive-gallery' | 'backup' | 'ritual-settings' | 'energy-detail';

export interface WaterSettings {
  weight: number;
  proteinMode: boolean;
  primaryContainerMl: number;
  presets: { ml: number; label: string; type: 'cup' | 'bottle' | 'glass' }[];
}

export interface WaterLogEntry {
  id: string;
  time: string;
  ml: number;
  type: 'cup' | 'bottle' | 'glass';
}

export interface WaterData {
  settings: WaterSettings;
  dailyLogs: Record<string, WaterLogEntry[]>;
}

export interface SleepSettings {
  targetDurationHours: number;
  targetSealTime: string; // "HH:mm"
}

export interface SleepLog {
  desire: string;
  tomorrowFirstThing: string;
  achievements: string[];
  physicalCheck: boolean;
}

export interface SleepHistoryEntry {
  date: string; // YYYY-MM-DD
  sealTimestamp: number;
  wakeTimestamp?: number;
  logs: SleepLog;
  energyScore: number;
  isSealed: boolean;
}

export interface ArchiveEntry {
  id: string;
  date: string;
  sleep_data: {
    start: number;
    end: number | null;
    initial_energy: number;
  };
  ritual_logs: SleepLog;
  crystal_style: {
    hue: number;
    opacity: number;
  };
}

export interface EnergyState {
  current: number;
  max: number;
  initial: number;
}
