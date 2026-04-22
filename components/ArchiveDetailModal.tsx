
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Zap, CheckCircle2, Moon, Sun, Timer, Trash2 } from 'lucide-react';
import { ArchiveEntry } from '../types';

interface ArchiveDetailModalProps {
  entry: ArchiveEntry | null;
  onClose: () => void;
  onUpdate?: (entry: ArchiveEntry) => void;
  onDelete?: (id: string) => void;
}

const ArchiveDetailModal: React.FC<ArchiveDetailModalProps> = ({ entry, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  // Sync edit state when entry changes
  React.useEffect(() => {
    if (entry) {
      setEditDate(entry.date);
      setEditStart(toInputTime(entry.sleep_data.start));
      setEditEnd(toInputTime(entry.sleep_data.end));
    }
    setIsEditing(false);
  }, [entry]);

  if (!entry) return null;

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (ts: number | null) => {
    if (!ts) return '--:--';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const toInputTime = (ts: number | null) => {
    if (!ts) return '';
    const date = new Date(ts);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSaveEdit = () => {
    if (!entry || !onUpdate) return;

    const createTimestamp = (dateStr: string, timeStr: string, dayOffset = 0) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      // Use YYYY-MM-DD for constructor to avoid timezone issues with local time
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d, hours, minutes, 0, 0);
      if (dayOffset !== 0) {
        date.setDate(date.getDate() + dayOffset);
      }
      return date.getTime();
    };

    const newStart = createTimestamp(editDate, editStart);
    let newEnd = entry.sleep_data.end ? createTimestamp(editDate, editEnd) : null;

    // Span midnight logic: if end time is numerically less than start time, it likely moved to next day
    if (newEnd && newEnd < newStart) {
      newEnd = createTimestamp(editDate, editEnd, 1);
    }

    const updatedEntry: ArchiveEntry = {
      ...entry,
      date: editDate,
      sleep_data: {
        ...entry.sleep_data,
        start: newStart,
        end: newEnd
      }
    };

    onUpdate(updatedEntry);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!entry || !onDelete) return;
    if (confirm('確定要永久刪除這份記憶碎片嗎？此操作無法復原。')) {
      onDelete(entry.id);
      onClose();
    }
  };

  const calculateDuration = (start: number, end: number | null) => {
    if (!end) return '進行中...';
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小時 ${minutes}分`;
  };

  const currentDuration = calculateDuration(
    isEditing ? new Date(entry.sleep_data.start).setHours(...editStart.split(':').map(Number) as [number, number]) : entry.sleep_data.start, 
    isEditing && entry.sleep_data.end ? new Date(entry.sleep_data.end).setHours(...editEnd.split(':').map(Number) as [number, number]) : entry.sleep_data.end
  );

  return (
    <AnimatePresence>
      {entry && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">日期修正</span>
                      <input 
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  ) : (
                    formatDisplayDate(entry.date)
                  )}
                </h3>
              </div>
              <div className="flex gap-2">
                {onUpdate && !isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-500 border border-orange-500/30 rounded-full hover:bg-orange-500/10 transition-colors"
                  >
                    編輯紀錄
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              {/* Time Data */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Moon className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">封印開始</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="time" 
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg focus:outline-none focus:border-orange-500"
                    />
                  ) : (
                    <div className="text-lg font-mono font-bold text-white">
                      {formatTime(entry.sleep_data.start)}
                    </div>
                  )}
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Sun className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">封印完成</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="time" 
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg focus:outline-none focus:border-orange-500"
                    />
                  ) : (
                    <div className="text-lg font-mono font-bold text-white">
                      {formatTime(entry.sleep_data.end)}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSaveEdit}
                      className="flex-1 py-3 bg-orange-500 text-white font-black italic rounded-2xl hover:bg-orange-400 transition-colors"
                    >
                      儲存變更
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-slate-800 text-slate-300 font-black italic rounded-2xl hover:bg-slate-700 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                  {onDelete && (
                    <button 
                      onClick={handleDelete}
                      className="w-full py-3 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-500/10 rounded-2xl transition-colors border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" /> 刪除這份記憶
                    </button>
                  )}
                </div>
              )}

              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-bold text-orange-100">封印儀式時長</span>
                </div>
                <div className="text-lg font-black text-orange-500 italic">
                  {currentDuration}
                </div>
              </div>

              {/* Ritual Logs */}
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">今日成就</div>
                  <div className="space-y-2">
                    {entry.ritual_logs.achievements.map((ach, i) => (
                      <div key={i} className="flex gap-3 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">明日首務</div>
                    <div className="text-sm text-white font-medium">{entry.ritual_logs.tomorrowFirstThing}</div>
                  </div>
                  <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">慾望標籤</div>
                    <div className="text-sm text-white font-medium italic">「{entry.ritual_logs.desire}」</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-slate-400">初始能量: {entry.sleep_data.initial_energy}%</span>
              </div>
                <div className="flex gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-500">{entry.date}</span>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ArchiveDetailModal;
