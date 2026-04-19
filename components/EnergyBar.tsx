
import React from 'react';
import { Battery, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface EnergyBarProps {
  current: number;
  max: number;
  onOpenSleepSealer: () => void;
}

const EnergyBar: React.FC<EnergyBarProps> = ({ current, max, onOpenSleepSealer }) => {
  const percentage = Math.min((current / max) * 100, 120);
  const isOverclocked = percentage > 100;

  return (
    <div 
      onClick={onOpenSleepSealer}
      className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-3 flex items-center gap-4 cursor-pointer hover:bg-slate-800/80 transition-colors sticky top-0 z-40"
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <Battery className={`w-6 h-6 ${isOverclocked ? 'text-yellow-400' : 'text-primary'}`} />
          {isOverclocked && (
            <Zap className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Energy Level</span>
          <span className={`text-sm font-black italic ${isOverclocked ? 'text-yellow-400' : 'text-white'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          className={`h-full rounded-full ${isOverclocked ? 'bg-yellow-500' : 'bg-primary'}`}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />
        {isOverclocked && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage - 100}%` }}
            className="h-full bg-yellow-300 absolute top-0 left-0 opacity-50"
            style={{ left: '100%', transform: 'translateX(-100%)' }}
          />
        )}
      </div>
      
      <div className="text-[10px] font-mono text-gray-500">
        {Math.round(current)} / {max}
      </div>
    </div>
  );
};

export default EnergyBar;
