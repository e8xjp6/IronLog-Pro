
import { useState, useEffect } from 'react';
import { WaterData, WaterLogEntry } from '../types';

const DEFAULT_WATER_DATA: WaterData = {
  dailyLogs: {},
  settings: {
    weight: 70,
    proteinMode: false,
    primaryContainerMl: 500,
    presets: [
      { label: '一杯水', ml: 250, type: 'cup' },
      { label: '一瓶水', ml: 500, type: 'bottle' },
      { label: '大容量', ml: 800, type: 'glass' }
    ]
  }
};

export const useWater = () => {
  const [waterData, setWaterData] = useState<WaterData>(() => {
    const saved = localStorage.getItem('water_data');
    return saved ? JSON.parse(saved) : DEFAULT_WATER_DATA;
  });

  useEffect(() => {
    localStorage.setItem('water_data', JSON.stringify(waterData));
  }, [waterData]);

  const handleUpdateWaterSettings = (settings: WaterData['settings']) => {
    setWaterData({ ...waterData, settings });
  };

  const handleAddWaterLog = (entry: WaterLogEntry) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentLogs = waterData.dailyLogs[todayStr] || [];
    setWaterData({
      ...waterData,
      dailyLogs: {
        ...waterData.dailyLogs,
        [todayStr]: [...currentLogs, entry]
      }
    });
  };

  const handleUndoWaterLog = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentLogs = waterData.dailyLogs[todayStr] || [];
    if (currentLogs.length === 0) return;
    
    setWaterData({
      ...waterData,
      dailyLogs: {
        ...waterData.dailyLogs,
        [todayStr]: currentLogs.slice(0, -1)
      }
    });
  };

  const handleDeleteWaterLog = (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentLogs = waterData.dailyLogs[todayStr] || [];
    setWaterData({
      ...waterData,
      dailyLogs: {
        ...waterData.dailyLogs,
        [todayStr]: currentLogs.filter(log => log.id !== id)
      }
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = waterData.dailyLogs[todayStr] || [];
  const todayHydration = todayLogs.reduce((sum, log) => sum + log.ml, 0);

  return {
    waterData,
    setWaterData,
    todayHydration,
    handleUpdateWaterSettings,
    handleAddWaterLog,
    handleUndoWaterLog,
    handleDeleteWaterLog
  };
};
