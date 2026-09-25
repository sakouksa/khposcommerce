import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Check,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface ColumnOption {
  key: string
  label: string
}

interface ColumnSettingsPopoverProps {
  columns: ColumnOption[]
  visibleColumns: Record<string, boolean>
  onChange: (updated: Record<string, boolean>) => void
  defaultVisibleColumns?: Record<string, boolean>
  title?: string
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
  className = '',
  buttonClassName = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation(['common', 'products', 'employees'])

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

  const handleShowAll = () => {
    const next: Record<string, boolean> = {}
    columns.forEach((col) => {
      next[col.key] = true
    })
    onChange(next)
  }

  const handleHideAll = () => {
    const next: Record<string, boolean> = {}
    columns.forEach((col, index) => {
      // Keep at least the first column visible to prevent empty table layout collapse
      next[col.key] = index === 0
    })
    onChange(next)
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

  const sizeClasses =
    size === 'sm'
      ? 'h-8 w-8 min-h-[32px] min-w-[32px] rounded-lg'
      : size === 'lg'
      ? 'h-12 w-12 min-h-[48px] min-w-[48px] rounded-xl'
      : 'h-10 w-10 min-h-[40px] min-w-[40px] rounded-xl'
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses} border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 shadow-xs hover:shadow active:scale-[0.98] cursor-pointer flex items-center justify-center relative shrink-0 ${
          isOpen
            ? 'bg-primary/10 border-primary/40 text-primary dark:bg-primary/20 dark:border-primary/50'
            : hiddenCount > 0
            ? 'bg-primary/5 border-primary/30 text-primary hover:bg-primary/15'
            : ''
        } ${buttonClassName}`}
        title={title || t('common.columnsVisibility', 'Column Visibility')}
        aria-expanded={isOpen}
      >
        <Settings
          size={iconSize}
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-90 text-primary' : ''
          }`}
        />
        {hiddenCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-75">
            {hiddenCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Clean Header */}
            <div className="px-4 py-3 border-b border-border/60 dark:border-slate-800 flex items-center justify-between bg-muted/30 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-foreground dark:text-slate-100 truncate leading-tight">
                    {title || t('common.columnsVisibility', 'Column Visibility')}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20">
                  {visibleCount} / {columns.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-slate-200 hover:bg-muted/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t('common.close', 'Close')}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="px-4 py-2 border-b border-border/40 dark:border-slate-800/60 bg-muted/10 dark:bg-slate-900/30 flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground dark:text-slate-400">
                {t('common.toggleColumns', 'Toggle Columns')}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShowAll}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  {t('common.showAll', 'Show All')}
                </button>
                <span className="text-border dark:text-slate-700 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={handleHideAll}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  {t('common.hideAll', 'Hide All')}
                </button>
              </div>
            </div>

            {/* Column Items List */}
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {columns.map((col) => {
                const isChecked = visibleColumns[col.key] !== false
                return (
                  <div
                    key={col.key}
                    onClick={() => handleToggle(col.key)}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer select-none transition-all duration-150 ${
                      isChecked
                        ? 'bg-primary/[0.07] dark:bg-primary/[0.14] text-foreground dark:text-slate-100 hover:bg-primary/[0.12] dark:hover:bg-primary/20 border border-primary/15 dark:border-primary/20'
                        : 'text-muted-foreground dark:text-slate-400 hover:bg-muted/60 dark:hover:bg-slate-800/60 hover:text-foreground dark:hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                          isChecked
                            ? 'bg-primary border-primary text-primary-foreground shadow-2xs'
                            : 'border-border/80 dark:border-slate-700 bg-background dark:bg-slate-800 group-hover:border-primary/40'
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span className="truncate">{col.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Clean Footer */}
            <div className="px-4 py-2.5 border-t border-border/60 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={t('common.reset', 'Reset')}
              >
                <RotateCcw size={11} />
                <span>{t('common.reset', 'Reset')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1 text-[11px] font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ColumnSettingsPopover

