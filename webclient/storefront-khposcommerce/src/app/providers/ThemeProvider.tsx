import React, { useEffect } from 'react'
import { useSettingsStore } from '@/stores'

export interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useSettingsStore()

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  return <>{children}</>
}

export default ThemeProvider
