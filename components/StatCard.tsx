
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon: Icon, iconColor = 'text-primary' }) => {
  return (
    <div className="bg-card p-4 rounded-xl border border-slate-700 shadow-sm">
      <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold mb-2 tracking-wider">
        <Icon className={`w-4 h-4 ${iconColor}`} /> {label}
      </div>
      <div className="text-2xl font-mono text-white font-bold">
        {value} {unit && <span className="text-xs text-gray-500 font-normal ml-1">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;
