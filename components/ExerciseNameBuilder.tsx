
import React, { useState, useEffect } from 'react';
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS, MOVEMENT_LIBRARY } from '../data/exerciseData';
import { Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';

interface ExerciseNameBuilderProps {
  initialName: string;
  onChange: (newName: string) => void;
}

const ExerciseNameBuilder: React.FC<ExerciseNameBuilderProps> = ({ initialName, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('chest');
  const [selectedMovement, setSelectedMovement] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');

  // Attempt to parse existing name on mount
  useEffect(() => {
    // Simple heuristic: check if name starts with any equipment prefix
    const eq = EQUIPMENT_OPTIONS.find(e => initialName.startsWith(e.prefix));
    if (eq) {
      setSelectedEquipment(eq.id);
      setSelectedMovement(initialName.replace(eq.prefix, '').trim());
    } else {
      // If no match, treat the whole string as movement or custom
      setSelectedEquipment('');
      setSelectedMovement(initialName);
    }
  }, [initialName]);

  const constructName = (equipId: string, movement: string) => {
    const equip = EQUIPMENT_OPTIONS.find(e => e.id === equipId);
    const prefix = equip ? equip.prefix : '';
    // Avoid double spacing or weird formatting
    return `${prefix}${movement}`;
  };

  const handleEquipmentSelect = (equipId: string) => {
    const newEq = selectedEquipment === equipId ? '' : equipId; // Toggle
    setSelectedEquipment(newEq);
    const newName = constructName(newEq, selectedMovement);
    onChange(newName);
  };

  const handleMovementSelect = (move: string) => {
    setSelectedMovement(move);
    const newName = constructName(selectedEquipment, move);
    onChange(newName);
  };

  return (
    <div className="w-full">
      {/* Main Input Area */}
      <div className="relative">
        <input 
          value={initialName}
          onChange={(e) => {
             // Allow manual override
             setSelectedMovement(e.target.value); 
             setSelectedEquipment(''); 
             onChange(e.target.value);
          }}
          placeholder="輸入動作名稱或使用下方選單..."
          className="w-full bg-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-600 pr-10"
        />
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary p-1"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Builder Panel */}
      {isOpen && (
        <div className="mt-2 bg-slate-800/50 border border-slate-700 rounded-lg p-3 animate-in slide-in-from-top-2">
          
          {/* 1. Equipment Chips */}
          <div className="mb-3 overflow-x-auto no-scrollbar pb-1">
             <div className="flex gap-2">
                {EQUIPMENT_OPTIONS.map(eq => (
                  <button
                    key={eq.id}
                    onClick={() => handleEquipmentSelect(eq.id)}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all ${
                      selectedEquipment === eq.id
                        ? 'bg-primary border-primary text-white shadow-lg shadow-blue-900/40'
                        : 'bg-slate-900 border-slate-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
             {/* 2. Muscle Groups (Vertical List) */}
             <div className="col-span-3 border-r border-slate-700 pr-2 space-y-1">
                {MUSCLE_GROUPS.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                       selectedGroup === group.id 
                       ? 'bg-slate-700 text-white font-bold' 
                       : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
             </div>

             {/* 3. Movements (Grid) */}
             <div className="col-span-9 h-32 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-2">
                  {MOVEMENT_LIBRARY[selectedGroup]?.map(move => (
                    <button
                      key={move}
                      onClick={() => handleMovementSelect(move)}
                      className={`text-left px-3 py-2 rounded text-xs border transition-all truncate ${
                         selectedMovement === move
                         ? 'bg-accent/10 border-accent text-accent'
                         : 'bg-slate-900 border-slate-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {move}
                    </button>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="mt-2 text-[10px] text-gray-500 text-right">
             * 點擊上方器材可快速切換前綴
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseNameBuilder;
