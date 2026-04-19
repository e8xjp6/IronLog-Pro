import React from 'react';
import { ArrowLeft, Trash2, PlusCircle } from 'lucide-react';
import { ViewMode, WorkoutTemplate } from '../types';

interface TemplatesViewProps {
  setView: (view: ViewMode) => void;
  templates: WorkoutTemplate[];
  setEditingTemplateId: (id: string) => void;
  handleDeleteTemplate: (id: string) => void;
  handleCreateTemplate: () => void;
}

const TemplatesView: React.FC<TemplatesViewProps> = ({ 
  setView, 
  templates, 
  setEditingTemplateId, 
  handleDeleteTemplate, 
  handleCreateTemplate 
}) => {
  return (
    <div className="p-6 max-w-md mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">週期計畫管理</h1>
      </div>
      
      <div className="space-y-3 mb-6">
        {templates.map(template => (
          <div key={template.id} className="bg-card border border-slate-700 p-4 rounded-xl flex justify-between items-center group">
            <div 
              onClick={() => { setEditingTemplateId(template.id); setView('template-editor'); }}
              className="flex-1 cursor-pointer"
            >
              <h3 className="font-bold text-white text-lg">{template.name}</h3>
              <p className="text-xs text-gray-500">{template.exercises.length} 個預設動作</p>
            </div>
            <button 
              onClick={() => handleDeleteTemplate(template.id)}
              className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={handleCreateTemplate}
        className="w-full py-4 border-2 border-dashed border-slate-700 text-slate-400 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <PlusCircle className="w-5 h-5" /> 建立新訓練日
      </button>
    </div>
  );
};

export default TemplatesView;
