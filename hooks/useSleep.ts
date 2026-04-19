
import { useState, useEffect } from 'react';
import { SleepSettings, SleepHistoryEntry } from '../types';

export const useSleep = () => {
  const [sleepSettings, setSleepSettings] = useState<SleepSettings>(() => {
    const saved = localStorage.getItem('sleep_settings');
    return saved ? JSON.parse(saved) : { targetSealTime: '23:00', targetDurationHours: 8 };
  });

  const [sleepHistory, setSleepHistory] = useState<SleepHistoryEntry[]>(() => {
    const saved = localStorage.getItem('sleep_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sleep_settings', JSON.stringify(sleepSettings));
  }, [sleepSettings]);

  useEffect(() => {
    localStorage.setItem('sleep_history', JSON.stringify(sleepHistory));
  }, [sleepHistory]);

  const handleSealMemory = (date: string, logs: any) => {
    const newEntry: SleepHistoryEntry = {
      date,
      sealTimestamp: Date.now(),
      wakeTimestamp: undefined,
      logs,
      energyScore: 0,
      isSealed: true
    };
    setSleepHistory([newEntry, ...sleepHistory]);
    return newEntry;
  };

  const handleWakeUp = () => {
    setSleepHistory(sleepHistory.map((h, i) => {
      if (i === 0 && h.isSealed && !h.wakeTimestamp) {
        return { ...h, wakeTimestamp: Date.now(), isSealed: false };
      }
      return h;
    }));
  };

  const lastEntry = [...sleepHistory].sort((a, b) => b.sealTimestamp - a.sealTimestamp)[0];
  const isSealed = lastEntry && lastEntry.isSealed && !lastEntry.wakeTimestamp;

  const lastCompletedSleep = [...sleepHistory]
    .filter(h => h.wakeTimestamp)
    .sort((a, b) => b.wakeTimestamp! - a.wakeTimestamp!)[0];

  return {
    sleepSettings,
    setSleepSettings,
    sleepHistory,
    setSleepHistory,
    handleSealMemory,
    handleWakeUp,
    isSealed,
    lastCompletedSleep
  };
};
