import { SetRecord, SetType } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateWarmupSets = async (
  exerciseName: string,
  targetWeight: number,
  currentPR: number
): Promise<SetRecord[]> => {
  // Simulate a small delay for better UX (feeling of calculation)
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Default Standard Warmup Progression
  // 1. 50% of target x 10 reps (Get blood flowing)
  // 2. 70% of target x 5 reps (Acclimate to weight)
  // 3. 90% of target x 1 rep (Potentiation, nervous system priming)
  
  const sets: SetRecord[] = [];

  // If weight is very light (e.g., < 20kg), maybe just one warmup or none?
  // But let's keep it simple. If calculated weight is < 0, we clamp to empty bar or dumbbell minimum.

  const set1Weight = Math.round(targetWeight * 0.5);
  const set2Weight = Math.round(targetWeight * 0.7);
  const set3Weight = Math.round(targetWeight * 0.9);

  // Add Sets
  sets.push({
    id: generateId(),
    type: SetType.WARMUP,
    weight: set1Weight > 0 ? set1Weight : 0,
    reps: 10,
    completed: false,
  });

  sets.push({
    id: generateId(),
    type: SetType.WARMUP,
    weight: set2Weight > 0 ? set2Weight : 0,
    reps: 5,
    completed: false,
  });

  sets.push({
    id: generateId(),
    type: SetType.WARMUP,
    weight: set3Weight > 0 ? set3Weight : 0,
    reps: 1,
    completed: false,
  });

  return sets;
};
