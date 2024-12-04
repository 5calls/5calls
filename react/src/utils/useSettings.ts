import { useState, useEffect } from 'react'

interface Settings {
  callingGroup: string
}

const STORAGE_KEY = 'app_settings'

export function useSettings() {
  const [callingGroup, setCallingGroup] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const settings: Settings = JSON.parse(stored)
      setCallingGroup(settings.callingGroup)
    }
  }, [])

  const saveSettings = () => {
    const settings: Settings = {
      callingGroup
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }

  return {
    callingGroup,
    setCallingGroup,
    saveSettings
  }
}