import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ViewMode, ArchiveEntry } from '../types';
import MemoryGallery from '../components/MemoryGallery';

interface ArchiveGalleryViewProps {
  setView: (view: ViewMode) => void;
  archiveGallery: ArchiveEntry[];
  onEntryClick: (entry: ArchiveEntry) => void;
}

const ArchiveGalleryView: React.FC<ArchiveGalleryViewProps> = ({ setView, archiveGallery, onEntryClick }) => {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <div className="p-6 border-b border-slate-800 flex items-center gap-4">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black italic text-white tracking-tighter">MEMORY GALLERY</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MemoryGallery 
          gallery={archiveGallery} 
          variant="grid" 
          onEntryClick={onEntryClick}
        />
      </div>
    </div>
  );
};

export default ArchiveGalleryView;
