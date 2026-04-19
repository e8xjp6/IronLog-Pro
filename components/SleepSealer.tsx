
import React, { useState } from 'react';
import { ArrowLeft, Smartphone, Anchor, Trophy, ClipboardCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SleepLog } from '../types';

interface SleepSealerProps {
  onSeal: (log: SleepLog) => void;
  onBack: () => void;
}

const SleepSealer: React.FC<SleepSealerProps> = ({ onSeal, onBack }) => {
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<SleepLog>({
    desire: '',
    tomorrowFirstThing: '',
    achievements: ['', '', ''],
    physicalCheck: false
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const steps = [
    {
      title: "物理檢核",
      icon: <ClipboardCheck className="w-6 h-6" />,
      desc: "明日裝備（衣物/背包/教材）是否已就緒？",
      content: (
        <div className="flex items-center gap-4 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <input 
            type="checkbox" 
            checked={log.physicalCheck}
            onChange={(e) => setLog({...log, physicalCheck: e.target.checked})}
            className="w-8 h-8 rounded-lg accent-blue-500"
          />
          <span className="text-lg font-bold text-white">裝備已就緒</span>
        </div>
      )
    },
    {
      title: "慾望標籤",
      icon: <Smartphone className="w-6 h-6" />,
      desc: "現在妨礙你睡覺的慾望是什麼",
      content: (
        <textarea 
          value={log.desire}
          onChange={(e) => setLog({...log, desire: e.target.value})}
          placeholder="命名後即瓦解其驅動力..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white min-h-[150px] outline-none focus:border-blue-500"
        />
      )
    },
    {
      title: "明日首務",
      icon: <Anchor className="w-6 h-6" />,
      desc: "明天醒來後的第一件小事",
      content: (
        <input 
          type="text"
          value={log.tomorrowFirstThing}
          onChange={(e) => setLog({...log, tomorrowFirstThing: e.target.value})}
          placeholder="如：喝水、穿鞋、翻開書..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
        />
      )
    },
    {
      title: "今日結案",
      icon: <Trophy className="w-6 h-6" />,
      desc: "今日已完成的成就",
      content: (
        <div className="space-y-3">
          {log.achievements.map((a, i) => (
            <input 
              key={i}
              type="text"
              value={a}
              onChange={(e) => {
                const newA = [...log.achievements];
                newA[i] = e.target.value;
                setLog({...log, achievements: newA});
              }}
              placeholder={`成就 ${i + 1}`}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-blue-500"
            />
          ))}
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-dark text-slate-200 p-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            MEMORY<span className="text-blue-500">SEALER</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">記憶封印儀式</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 max-w-md mx-auto w-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step {step + 1} / 4</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 flex-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
                {currentStep.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white italic tracking-tight">{currentStep.title}</h3>
                <p className="text-sm text-slate-400">{currentStep.desc}</p>
              </div>
            </div>
            
            <div className="pt-4">
              {currentStep.content}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-8 pb-12 flex gap-4">
          {step > 0 && (
            <button 
              onClick={handleBack}
              className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold hover:text-white transition-all"
            >
              返回
            </button>
          )}
          <button 
            onClick={isLastStep ? () => onSeal(log) : handleNext}
            disabled={step === 0 && !log.physicalCheck}
            className="flex-[2] bg-blue-500 hover:bg-blue-600 disabled:opacity-30 text-white font-black italic py-4 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isLastStep ? '開始封印儀式 (START RITUAL)' : '下一步'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SleepSealer;
