import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings2,
  Check,
  RotateCcw,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ColumnOption {
  key: string
  label: string
}

export interface ColumnSettingsPopoverProps {
  columns: ColumnOption[]
  visibleColumns: Record<string, boolean>
  onChange: (updated: Record<string, boolean>) => void
  defaultVisibleColumns?: Record<string, boolean>
  title?: string
  label?: string
  variant?: 'button' | 'icon'
  className?: string
  buttonClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ColumnSettingsPopover: React.FC<ColumnSettingsPopoverProps> = ({
  columns,
  visibleColumns,
  onChange,
  defaultVisibleColumns,
  title,
  label,
  variant = 'button',
  className = '',
  buttonClassName = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation(['common'])

  const buttonText = label || title || t('common.manageTable', 'Manage Table')

  const visibleCount = useMemo(
    () => columns.filter((col) => visibleColumns[col.key] !== false).length,
    [columns, visibleColumns]
  )
  const hiddenCount = columns.length - visibleCount

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = (key: string) => {
    onChange({
      ...visibleColumns,
      [key]: visibleColumns[key] === false ? true : false,
    })
  }

  const handleReset = () => {
    if (defaultVisibleColumns) {
      onChange({ ...defaultVisibleColumns })
    } else {
      const next: Record<string, boolean> = {}
      columns.forEach((col) => {
        next[col.key] = true
      })
      onChange(next)
    }
  }

  // Exact Shadcn standard: h-10 (40px), rounded-lg, text-sm, border-input
  const sizeClasses = {
    sm: variant === 'button' ? 'h-8 min-h-[32px] max-h-[32px] px-2.5 text-xs rounded-md gap-1.5' : 'h-8 w-8 min-h-[32px] max-h-[32px] rounded-md',
    md: variant === 'button' ? 'h-10 min-h-[40px] max-h-[40px] px-3.5 text-sm font-medium rounded-lg gap-2' : 'h-10 w-10 min-h-[40px] max-h-[40px] rounded-lg',
    lg: variant === 'button' ? 'h-12 min-h-[48px] max-h-[48px] px-4.5 text-base font-medium rounded-xl gap-2.5' : 'h-12 w-12 min-h-[48px] max-h-[48px] rounded-xl',
  }

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.md
  const currentIconSize = iconSizes[size] || iconSizes.md

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`} ref={popoverRef}>
      {/* Trigger Button: Manage Table (Shadcn pattern) or Icon */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center font-medium border border-border/80 dark:border-slate-700/80 bg-card dark:bg-slate-800/80 hover:bg-muted/80 dark:hover:bg-slate-700 text-foreground dark:text-slate-200 dark:hover:text-white transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer select-none shrink-0 box-border leading-normal ${currentSizeClass} ${
          isOpen ? 'bg-accent dark:bg-slate-700 text-accent-foreground dark:text-white ring-1 ring-ring/30' : ''
        } ${buttonClassName}`}
        title={buttonText}
        aria-expanded={isOpen}
      >
        <Settings2
          size={currentIconSize}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
        />
        {variant === 'button' && (
          <span className="whitespace-nowrap">{buttonText}</span>
        )}
        {hiddenCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-xs">
            {hiddenCount}
          </span>
        )}
      </button>

      {/* Solid Opaque Popover Dropdown (Pixel-accurate to Shadcn Product List 1) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1.5 min-w-[210px] sm:min-w-[230px] w-auto bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border border-border/90 shadow-2xl rounded-xl p-1.5 z-50 select-none flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* List of Column Checkmarks with clean spacing */}
            <div className="flex flex-col py-0.5 space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
              {columns.map((col) => {
                const isChecked = visibleColumns[col.key] !== false
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => handleToggle(col.key)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
                  >
                    {isChecked ? (
                      <Check size={16} className="text-foreground shrink-0" strokeWidth={2.5} />
                    ) : (
                      <span className="w-4 h-4 shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{col.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Subtle Reset Footer if columns were toggled */}
            {hiddenCount > 0 && (
              <div className="border-t border-border/60 mt-1 pt-1 px-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>{t('common.reset', 'Reset')}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ColumnSettingsPopover
