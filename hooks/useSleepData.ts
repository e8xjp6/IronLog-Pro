import { useState, useEffect } from 'react';
import { SleepSettings, SleepHistoryEntry, ArchiveEntry } from '../types';
import { SLEEP_SETTINGS_KEY, SLEEP_HISTORY_KEY, ARCHIVE_GALLERY_KEY, DEFAULT_SLEEP_SETTINGS } from '../constants';

export function useSleepData() {
  const [sleepSettings, setSleepSettings] = useState<SleepSettings>(DEFAULT_SLEEP_SETTINGS);
  const [sleepHistory, setSleepHistory] = useState<SleepHistoryEntry[]>([]);
  const [archiveGallery, setArchiveGallery] = useState<ArchiveEntry[]>([]);
  const [sealingCrystal, setSealingCrystal] = useState<ArchiveEntry | null>(null);
  const [isSleepDataLoaded, setIsSleepDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const loadedSleepSettings = localStorage.getItem(SLEEP_SETTINGS_KEY);
      if (loadedSleepSettings) setSleepSettings(JSON.parse(loadedSleepSettings));

      const loadedSleepHistory = localStorage.getItem(SLEEP_HISTORY_KEY);
      if (loadedSleepHistory) setSleepHistory(JSON.parse(loadedSleepHistory));

      const loadedArchive = localStorage.getItem(ARCHIVE_GALLERY_KEY);
      if (loadedArchive) {
        const parsedArchive = JSON.parse(loadedArchive);
        // Migration: Ensure all entries have an ID
        const migratedArchive = parsedArchive.map((entry: any) => ({
          ...entry,
          id: entry.id || `crystal_${entry.sleep_data.start}`
        }));
        setArchiveGallery(migratedArchive);
      }
    } catch (e) {
      console.error("Failed to load sleep data", e);
    } finally {
      setIsSleepDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isSleepDataLoaded) {
      localStorage.setItem(SLEEP_SETTINGS_KEY, JSON.stringify(sleepSettings));
    }
  }, [sleepSettings, isSleepDataLoaded]);

  useEffect(() => {
    if (isSleepDataLoaded) {
      localStorage.setItem(SLEEP_HISTORY_KEY, JSON.stringify(sleepHistory));
    }
  }, [sleepHistory, isSleepDataLoaded]);

  useEffect(() => {
    if (isSleepDataLoaded) {
      localStorage.setItem(ARCHIVE_GALLERY_KEY, JSON.stringify(archiveGallery));
    }
  }, [archiveGallery, isSleepDataLoaded]);

  return {
    sleepSettings,
    setSleepSettings,
    sleepHistory,
    setSleepHistory,
    archiveGallery,
    setArchiveGallery,
    sealingCrystal,
    setSealingCrystal,
    isSleepDataLoaded
  };
}
