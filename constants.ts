import { WaterSettings } from './types';

export const PR_STORAGE_KEY = 'ironlog_prs';
export const SESSIONS_STORAGE_KEY = 'ironlog_sessions';
export const TEMPLATES_STORAGE_KEY = 'ironlog_templates';
export const SLEEP_SETTINGS_KEY = 'ironlog_sleep_settings';
export const SLEEP_HISTORY_KEY = 'ironlog_sleep_history';
export const ENERGY_STATE_KEY = 'ironlog_energy_state';
export const ARCHIVE_GALLERY_KEY = 'ironlog_archive_gallery';
export const WATER_DATA_KEY = 'ironlog_water_v1';

export const DEFAULT_SLEEP_SETTINGS = { targetDurationHours: 8, targetSealTime: '23:00' };

export const DEFAULT_WATER_SETTINGS: WaterSettings = {
  weight: 70,
  proteinMode: false,
  primaryContainerMl: 450,
  presets: [
    { ml: 200, label: '小份量', type: 'cup' },
    { ml: 450, label: '辦公水壺', type: 'bottle' },
    { ml: 500, label: '寶特瓶', type: 'glass' }
  ]
};

export const DEFAULT_ENERGY_STATE = { current: 100, max: 100, initial: 100 };

export const TIMER_DURATIONS = {
  WARMUP: 60,
  WORKING_HEAVY: 180, // <= 5 reps
  WORKING_NORMAL: 90, // > 5 reps
  ADD_TIME_STEP: 30,
};

export const ENERGY_CALCULATION = {
  WATER_MULTIPLIER: 35,
  PROTEIN_BONUS: 500,
  WORKOUT_BONUS: 800,
  MAX_WATER_BONUS_SCORE: 25,
};

export const CRYSTAL_SETTINGS = {
  HUE_OVERCLOCKED: 45,
  HUE_NORMAL: 30,
  OPACITY_BASE: 0.4,
  OPACITY_MAX: 0.9,
  HYDRATION_DIVISOR: 2000,
};

export const ANIMATION_DURATIONS = {
  SEALING_CRYSTAL: 2500,
};

export const SLEEP_LIMITS = {
  MIN_HOURS: 4,
  MAX_HOURS: 12,
  STEP: 0.5,
};

export const WORKOUT_FORMULAS = {
  ONE_RM_DIVISOR: 30,
  ENERGY_BONUS_PER_SET: 15,
};

export const DEFAULT_EXERCISE_TEMPLATE_VALUES = {
  SETS: 3,
  REPS: 10,
};

export const DEFAULT_WORKOUT_TEMPLATES = [
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
