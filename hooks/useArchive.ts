
import { useState, useEffect } from 'react';
import { ArchiveEntry } from '../types';

export const useArchive = () => {
  const [archiveGallery, setArchiveGallery] = useState<ArchiveEntry[]>(() => {
    const saved = localStorage.getItem('archive_gallery');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('archive_gallery', JSON.stringify(archiveGallery));
  }, [archiveGallery]);

  const handleAddArchive = (entry: ArchiveEntry) => {
    setArchiveGallery([entry, ...archiveGallery]);
  };

  const handleUpdateArchive = (updatedEntry: ArchiveEntry) => {
    setArchiveGallery(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
  };

  const handleDeleteArchive = (id: string) => {
    setArchiveGallery(prev => prev.filter(entry => entry.id !== id));
  };

  return {
    archiveGallery,
    setArchiveGallery,
    handleAddArchive,
    handleUpdateArchive,
    handleDeleteArchive
  };
};
