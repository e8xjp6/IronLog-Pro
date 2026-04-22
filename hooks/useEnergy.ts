
import { useState, useEffect } from 'react';

export const useEnergy = () => {
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('user_energy');
    return saved ? JSON.parse(saved) : { current: 100, max: 100, lastUpdate: Date.now() };
  });

  useEffect(() => {
    localStorage.setItem('user_energy', JSON.stringify(energy));
  }, [energy]);

  return {
    energy,
    setEnergy
  };
};
