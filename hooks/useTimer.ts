
import { useState, useEffect } from 'react';

export const useTimer = () => {
  const [restTimer, setRestTimer] = useState<{ seconds: number; isActive: boolean; total: number } | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (restTimer && restTimer.isActive && restTimer.seconds > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (!prev) return null;
          if (prev.seconds <= 1) return null;
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    } else if (restTimer && restTimer.seconds <= 0) {
      setRestTimer(null);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const handleStartTimer = (seconds: number) => setRestTimer({ seconds, isActive: true, total: seconds });
  const handleStopTimer = () => setRestTimer(null);
  const handleAddTimerSeconds = (amount: number) => setRestTimer(prev => prev ? { ...prev, seconds: prev.seconds + amount, total: prev.total + amount } : null);

  return {
    restTimer,
    handleStartTimer,
    handleStopTimer,
    handleAddTimerSeconds
  };
};
