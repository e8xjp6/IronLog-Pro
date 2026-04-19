
import { useState, useEffect } from 'react';

export const useEnergy = () => {
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('user_energy');
    return saved ? JSON.parse(saved) : { current: 100, max: 100, lastUpdate: Date.now() };
  });

  useEffect(() => {
    localStorage.setItem('user_energy', JSON.stringify(energy));
  }, [energy]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev: any) => {
        const now = Date.now();
        const elapsedMinutes = (now - prev.lastUpdate) / (1000 * 60);
        if (elapsedMinutes >= 1) {
          const recovery = Math.floor(elapsedMinutes / 10);
          if (recovery > 0) {
            return {
              ...prev,
              current: Math.min(prev.max, prev.current + recovery),
              lastUpdate: now
            };
          }
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    energy,
    setEnergy
  };
};
