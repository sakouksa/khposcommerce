import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useTranslation } from 'react-i18next'

interface Language {
  code: 'km' | 'en'
  name: string
  nativeName: string
  flagUrl: string
}

const LANGUAGES: Language[] = [
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flagUrl: 'https://flagcdn.com/w40/kh.png' },
  { code: 'en', name: 'English', nativeName: 'English', flagUrl: 'https://flagcdn.com/w40/us.png' },
]

interface LanguageDropdownProps {
  className?: string
  isInNavbar?: boolean
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ className = '', isInNavbar = false }) => {
  const { language, setLanguage, navbar } = useThemeStore()
  const { t } = useTranslation()
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

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  const handleSelect = (code: Language['code']) => {
    setLanguage(code)
    setIsOpen(false)
  }

  const customTextColor = isInNavbar ? navbar?.textColor : undefined

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        style={{ color: customTextColor || undefined }}
        className={`h-8 sm:h-9 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 xl:px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex-shrink-0 ${
          isInNavbar
            ? 'hover:bg-black/10 dark:hover:bg-white/10 border border-transparent hover:border-black/10 dark:hover:border-white/10'
            : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs'
        } ${className}`}
      >
        <img
          src={currentLang.flagUrl}
          alt={currentLang.name}
          className="w-5 h-3.5 object-cover rounded-sm shadow-xs border border-foreground/10 flex-shrink-0"
        />
        <span
          style={{ color: customTextColor || undefined }}
          className="text-xs font-semibold hidden md:inline-block"
        >
          {currentLang.nativeName}
        </span>
        <ChevronDown
          style={{ color: customTextColor || undefined }}
          className={`w-3.5 h-3.5 opacity-80 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
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
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === language
              return (
                <button
                  type="button"
                  key={lang.code}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSelect(lang.code)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer
                    ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={lang.flagUrl}
                      alt={lang.name}
                      className="w-5 h-3.5 object-cover rounded-sm shadow-xs border border-foreground/10 shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-xs leading-tight">{lang.nativeName}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageDropdown
