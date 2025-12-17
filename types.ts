
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

export type ViewMode = 'dashboard' | 'planner' | 'logger' | 'templates' | 'template-editor' | 'history' | 'settings';
