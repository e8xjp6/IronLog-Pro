
import React from 'react';
import { motion } from 'motion/react';
import { ArchiveEntry } from '../types';

interface MemoryCrystalProps {
  entry: ArchiveEntry;
  onClick: () => void;
}

const MemoryCrystal: React.FC<MemoryCrystalProps> = ({ entry, onClick }) => {
  const { crystal_style, ritual_logs } = entry;
  
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      {/* Crystal Body */}
      <div 
        className="w-16 h-20 relative preserve-3d"
        style={{
          filter: `hue-rotate(${crystal_style.hue}deg)`,
        }}
      >
        <div 
          className="absolute inset-0 bg-orange-500/30 backdrop-blur-sm border border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            opacity: crystal_style.opacity
          }}
        />
        <div 
          className="absolute inset-2 bg-orange-400/20"
          style={{
            clipPath: 'polygon(50% 10%, 90% 30%, 90% 70%, 50% 90%, 10% 70%, 10% 30%)',
          }}
        />
        
        {/* Inner Text Fragments (Visual only) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 overflow-hidden pointer-events-none">
          {ritual_logs.achievements.slice(0, 1).map((ach, i) => (
            <div key={i} className="text-[6px] text-white/40 leading-tight truncate w-full text-center">
              {ach}
            </div>
          ))}
        </div>
      </div>

      {/* Hover Info (Simplified as we now have a modal) */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{entry.date}</div>
      </div>
    </motion.div>
  );
};

interface MemoryGalleryProps {
  gallery: ArchiveEntry[];
  onTitleClick?: () => void;
  onEntryClick?: (entry: ArchiveEntry) => void;
  variant?: 'horizontal' | 'grid';
}

const MemoryGallery: React.FC<MemoryGalleryProps> = ({ gallery, onTitleClick, onEntryClick, variant = 'horizontal' }) => {
  return (
    <div className="w-full py-8 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 px-6">
        <div className="h-px flex-1 bg-slate-800"></div>
        <h2 
          onClick={onTitleClick}
          className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${onTitleClick ? 'text-orange-500 cursor-pointer hover:text-orange-400' : 'text-slate-500'}`}
        >
          The Memory Gallery
        </h2>
        <div className="h-px flex-1 bg-slate-800"></div>
      </div>
      
      <div className="relative">
        {variant === 'horizontal' ? (
          <div className="flex gap-6 overflow-x-auto px-12 py-10 no-scrollbar snap-x">
            {gallery.length === 0 ? (
              <div className="w-full text-center py-10 border border-dashed border-slate-800 rounded-3xl">
                <p className="text-xs text-slate-600 italic">尚未生成記憶水晶...</p>
              </div>
            ) : (
              gallery.map((entry) => (
                <div key={entry.id} className="snap-center">
                  <MemoryCrystal entry={entry} onClick={() => onEntryClick?.(entry)} />
                </div>
              ))
            )}
            <div className="min-w-[40px]" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-y-12 gap-x-4 px-6 py-10">
            {gallery.length === 0 ? (
              <div className="col-span-3 text-center py-10 border border-dashed border-slate-800 rounded-3xl">
                <p className="text-xs text-slate-600 italic">尚未生成記憶水晶...</p>
              </div>
            ) : (
              gallery.map((entry) => (
                <div key={entry.id} className="flex justify-center">
                  <MemoryCrystal entry={entry} onClick={() => onEntryClick?.(entry)} />
                </div>
              ))
            )}
          </div>
        )}
        {variant === 'horizontal' && (
          <div className="absolute bottom-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default MemoryGallery;
