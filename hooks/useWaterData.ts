import { useState, useEffect } from 'react';
import { WaterData } from '../types';
import { WATER_DATA_KEY, DEFAULT_WATER_SETTINGS } from '../constants';

export function useWaterData() {
  const [waterData, setWaterData] = useState<WaterData>({
    settings: DEFAULT_WATER_SETTINGS,
    dailyLogs: {}
  });
  const [isWaterDataLoaded, setIsWaterDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const loadedWater = localStorage.getItem(WATER_DATA_KEY);
      if (loadedWater) setWaterData(JSON.parse(loadedWater));
    } catch (e) {
      console.error("Failed to load water data", e);
    } finally {
      setIsWaterDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isWaterDataLoaded) {
      localStorage.setItem(WATER_DATA_KEY, JSON.stringify(waterData));
    }
  }, [waterData, isWaterDataLoaded]);

  return {
    waterData,
    setWaterData,
    isWaterDataLoaded
  };
}
