import { useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEYS } from '../common/constants';

interface Settings {
  callingGroup: string;
}

export function useSettings() {
  const [callingGroup, setCallingGroup] = useState('');
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (stored) {
      const settings: Settings = JSON.parse(stored);
      setCallingGroup(settings.callingGroup);
    }
  }, []);

  useEffect(() => {
    setIsSaved(false);
  }, [callingGroup]);

  const saveSettings = () => {
    const settings: Settings = {
      callingGroup
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    setIsSaved(true);
  };

  return {
    callingGroup,
    setCallingGroup,
    saveSettings,
    isSaved
  };
}
