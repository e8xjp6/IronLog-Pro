import React, { useState, useEffect } from 'react';
import { ExercisePlan, SetRecord, SetType } from '../types';
import { Plus, Check, Trash2, Calculator, Dumbbell, Percent } from 'lucide-react';

interface ExerciseCardProps {
  exercise: ExercisePlan;
  onUpdate: (updatedExercise: ExercisePlan) => void;
  onGenerateWarmup: (exerciseId: string) => void;
  onStartTimer: (seconds: number) => void;
  isGenerating: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onUpdate, onGenerateWarmup, onStartTimer, isGenerating }) => {
  // Initialize input state with target values, or defaults
  const [newSetWeight, setNewSetWeight] = useState<string>(exercise.targetWeight.toString());
  const [newSetReps, setNewSetReps] = useState<string>('10'); // Default warmup reps often higher
  const [newSetType, setNewSetType] = useState<SetType>(SetType.WARMUP); // Default to Warmup since working sets are auto-filled

  const calculatePercentage = (weight: number, pr: number) => {
    if (!pr || pr === 0) return 0;
    return Math.round((weight / pr) * 100);
  };

  const percentage = calculatePercentage(Number(newSetWeight), exercise.currentPR);

  const handleAddSet = () => {
    const weight = parseFloat(newSetWeight);
    const reps = parseInt(newSetReps);
    
    if (isNaN(weight) || isNaN(reps)) return;

    const newSet: SetRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: newSetType,
      weight,
      reps,
      completed: false
    };

    let updatedSets = [...exercise.sets];

    // Smart Sorting: If adding a Warmup set, try to place it before the first Working set
    if (newSetType === SetType.WARMUP) {
      const firstWorkingIndex = updatedSets.findIndex(s => s.type === SetType.WORKING);
      if (firstWorkingIndex !== -1) {
        updatedSets.splice(firstWorkingIndex, 0, newSet);
      } else {
        updatedSets.push(newSet);
      }
    } else {
      // For working sets or others, just append
      updatedSets.push(newSet);
    }

    onUpdate({
      ...exercise,
      sets: updatedSets
    });
  };

  const handleUpdateSet = (setId: string, field: 'weight' | 'reps', value: string) => {
    const numValue = parseFloat(value);
    // Allow empty string for typing, but don't save NaN unless it's transitional
    // For simplicity, we keep it as number in data model, so we might need to handle empty input visually if strictly typed
    // Here we just update if it's a valid number or 0
    if (isNaN(numValue) && value !== '') return;

    const updatedSets = exercise.sets.map(s => 
      s.id === setId ? { ...s, [field]: value === '' ? 0 : numValue } : s
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const toggleSetCompletion = (setId: string) => {
    const targetSet = exercise.sets.find(s => s.id === setId);
    if (!targetSet) return;

    // Check if we are marking it as completed (was false, now true)
    const isNowCompleted = !targetSet.completed;

    if (isNowCompleted) {
      let duration = 0;
      if (targetSet.type === SetType.WARMUP) {
        duration = 60;
      } else if (targetSet.type === SetType.WORKING) {
        if (targetSet.reps <= 5) {
          duration = 180;
        } else {
          duration = 90;
        }
      }
      
      if (duration > 0) {
        onStartTimer(duration);
      }
    }

    const updatedSets = exercise.sets.map(s => 
      s.id === setId ? { ...s, completed: !s.completed } : s
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const removeSet = (setId: string) => {
    onUpdate({
      ...exercise,
      sets: exercise.sets.filter(s => s.id !== setId)
    });
  };

  const getSetTypeLabel = (type: SetType) => {
    switch (type) {
      case SetType.WARMUP: return '熱身';
      case SetType.WORKING: return '訓練';
      case SetType.DROP: return '遞減';
      case SetType.FAILURE: return '力竭';
      default: return '一般';
    }
  };

  const getSetTypeColor = (type: SetType) => {
    switch (type) {
      case SetType.WARMUP: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case SetType.WORKING: return 'text-accent bg-accent/10 border-accent/20';
      case SetType.DROP: return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-secondary bg-secondary/10';
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 mb-4 shadow-lg border border-slate-700/50">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            {exercise.name}
          </h3>
          <div className="text-sm text-secondary mt-1 flex gap-4">
            <span>PR: <span className="text-white font-mono">{exercise.currentPR}kg</span></span>
            <span>目標: <span className="text-primary font-mono">{exercise.targetWeight}kg x {exercise.targetReps} ({exercise.targetSets}組)</span></span>
            <span>強度: <span className="text-white font-mono">{calculatePercentage(exercise.targetWeight, exercise.currentPR)}% PR</span></span>
          </div>
        </div>
        <button
          onClick={() => onGenerateWarmup(exercise.id)}
          disabled={isGenerating}
          className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 border border-slate-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Calculator className="w-3 h-3" />
          {isGenerating ? '計算中...' : '自動熱身'}
        </button>
      </div>

      {/* Sets List */}
      <div className="space-y-2 mb-6">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 text-xs text-secondary px-2 uppercase tracking-wider font-semibold">
          <div className="col-span-2">類型</div>
          <div className="col-span-3 text-right">重量 (kg)</div>
          <div className="col-span-2 text-right text-gray-500">%PR</div>
          <div className="col-span-2 text-right">次數</div>
          <div className="col-span-3 text-right">狀態</div>
        </div>

        {exercise.sets.length === 0 && (
          <div className="text-center py-6 text-gray-600 text-sm border border-dashed border-gray-700 rounded-lg">
            尚未記錄組數
          </div>
        )}

        {exercise.sets.map((set, index) => {
          const setPct = calculatePercentage(set.weight, exercise.currentPR);
          // Calculate set number relative to its type
          const setNumber = exercise.sets.filter(s => s.type === set.type).indexOf(set) + 1;
          
          return (
            <div 
              key={set.id} 
              className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-all ${
                set.completed ? 'bg-green-900/10 border border-green-900/20' : 'bg-slate-800/50 border border-slate-700/50'
              }`}
            >
              <div className="col-span-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getSetTypeColor(set.type)} whitespace-nowrap`}>
                  {getSetTypeLabel(set.type)} {setNumber}
                </span>
              </div>
              <div className="col-span-3">
                <input 
                    type="number" 
                    value={set.weight}
                    onChange={(e) => handleUpdateSet(set.id, 'weight', e.target.value)}
                    className="w-full text-right bg-transparent text-white font-mono text-lg font-medium focus:outline-none focus:bg-slate-700/50 rounded px-1"
                />
              </div>
              <div className="col-span-2 text-right font-mono text-xs text-gray-500 mt-1">{setPct}%</div>
              <div className="col-span-2">
                 <input 
                    type="number" 
                    value={set.reps}
                    onChange={(e) => handleUpdateSet(set.id, 'reps', e.target.value)}
                    className="w-full text-right bg-transparent text-white font-mono text-lg focus:outline-none focus:bg-slate-700/50 rounded px-1"
                />
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <button 
                  onClick={() => toggleSetCompletion(set.id)}
                  className={`p-1.5 rounded-full transition-colors ${
                    set.completed ? 'bg-accent text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => removeSet(set.id)}
                  className="p-1.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
          {[SetType.WARMUP, SetType.WORKING].map(t => (
            <button
              key={t}
              onClick={() => {
                  setNewSetType(t);
                  // Auto-suggest values based on type
                  if (t === SetType.WARMUP) {
                      setNewSetWeight((exercise.targetWeight * 0.5).toString());
                      setNewSetReps('10');
                  } else {
                      setNewSetWeight(exercise.targetWeight.toString());
                      setNewSetReps(exercise.targetReps.toString());
                  }
              }}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                newSetType === t 
                  ? 'bg-primary text-white font-medium shadow-sm shadow-blue-900/50' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {getSetTypeLabel(t)}組
            </button>
          ))}
          <span className="text-[10px] text-gray-500 ml-auto">
             {newSetType === SetType.WARMUP ? '自動插入至訓練組前' : '新增至最後'}
          </span>
        </div>
        
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-4">
            <label className="text-[10px] text-gray-400 block mb-1">重量 (kg)</label>
            <input
              type="number"
              value={newSetWeight}
              onChange={(e) => setNewSetWeight(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="col-span-3">
             {/* Dynamic %PR Indicator */}
             <div className="flex flex-col justify-end h-full pb-3">
               <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                  <Percent className="w-3 h-3" />
                  PR
               </div>
               <div className={`text-right font-mono font-bold ${percentage > 90 ? 'text-red-400' : 'text-primary'}`}>
                 {percentage}%
               </div>
             </div>
          </div>
          <div className="col-span-3">
            <label className="text-[10px] text-gray-400 block mb-1">次數</label>
            <input
              type="number"
              value={newSetReps}
              onChange={(e) => setNewSetReps(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="col-span-2">
            <button
              onClick={handleAddSet}
              className="w-full h-[42px] bg-primary hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors shadow-lg shadow-blue-900/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;