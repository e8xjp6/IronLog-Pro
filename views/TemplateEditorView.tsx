import React from 'react';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { ViewMode, WorkoutTemplate, ExerciseTemplate } from '../types';
import ExerciseNameBuilder from '../components/ExerciseNameBuilder';
import { DEFAULT_EXERCISE_TEMPLATE_VALUES } from '../constants';
import { generateId } from '../lib/utils';

interface TemplateEditorViewProps {
  setView: (view: ViewMode) => void;
  templates: WorkoutTemplate[];
  editingTemplateId: string | null;
  handleUpdateTemplate: (updatedTemplate: WorkoutTemplate) => void;
}

const TemplateEditorView: React.FC<TemplateEditorViewProps> = ({ 
  setView, 
  templates, 
  editingTemplateId, 
  handleUpdateTemplate 
}) => {
  const template = templates.find(t => t.id === editingTemplateId);
  if (!template) return <div>Error: Template not found</div>;

  const addExercise = () => {
    const newEx: ExerciseTemplate = {
      id: generateId(),
      name: '',
      defaultSets: DEFAULT_EXERCISE_TEMPLATE_VALUES.SETS,
      defaultReps: DEFAULT_EXERCISE_TEMPLATE_VALUES.REPS
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

export default TemplateEditorView;
