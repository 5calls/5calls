import { useState, useEffect } from 'react';

interface Settings {
  callingGroup: string;
}

const STORAGE_KEY = 'app_settings';

export function useSettings() {
  const [callingGroup, setCallingGroup] = useState('');
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setIsSaved(true);
  };

  return {
    callingGroup,
    setCallingGroup,
    saveSettings,
    isSaved
  };
}
