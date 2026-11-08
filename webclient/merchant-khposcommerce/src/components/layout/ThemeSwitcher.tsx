import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useTranslation } from 'react-i18next'

interface ThemeSwitcherProps {
  className?: string
  isInNavbar?: boolean
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '', isInNavbar = false }) => {
  const { themeMode, updateThemeMode, navbar } = useThemeStore()
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const modes = [
    { id: 'light', label: t('common.light', 'Light Mode'), icon: Sun },
    { id: 'dark', label: t('common.dark', 'Dark Mode'), icon: Moon },
    { id: 'system', label: t('common.system', 'System Default'), icon: Monitor },
  ] as const

  const activeMode = modes.find((m) => m.id === themeMode) ?? modes[0]
  const ActiveIcon = activeMode.icon
  const customTextColor = isInNavbar ? navbar?.textColor : undefined

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: customTextColor || undefined }}
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl inline-flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0 ${
          isInNavbar
            ? 'opacity-90 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent hover:border-black/10 dark:hover:border-white/10'
            : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs'
        } ${className}`}
        title={t('common.theme', 'Theme')}
      >
        <ActiveIcon className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 max-w-[calc(100vw-24px)] bg-card border border-border/80 rounded-2xl shadow-xl z-50 p-1.5 backdrop-blur-md flex flex-col space-y-0.5"
          >
            {modes.map((mode) => {
              const Icon = mode.icon
              const isSelected = themeMode === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    updateThemeMode(mode.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer
                    ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span>{mode.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThemeSwitcher
