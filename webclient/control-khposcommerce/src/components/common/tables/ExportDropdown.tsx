import React, { useState, useRef, useEffect } from 'react'
import {
  Download,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sound } from '@/utils/sound'

export type ExportDateRange = '1_day' | '7_days' | '1_month' | 'all'

export interface ExportDropdownOption {
  key: ExportDateRange | string
  label: string
  description?: string
}

export type ExportDropdownVariant = 'outline' | 'emerald' | 'secondary'
export type ExportDropdownSize = 'sm' | 'md' | 'lg'

export interface ExportDropdownProps {
  onExport: (range: ExportDateRange | string) => void | Promise<void>
  label?: string
  loading?: boolean
  disabled?: boolean
  className?: string
  align?: 'left' | 'right'
  options?: ExportDropdownOption[]
  title?: string
  variant?: ExportDropdownVariant
  size?: ExportDropdownSize
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExport,
  label,
  loading = false,
  disabled = false,
  className = '',
  align = 'right',
  options,
  title,
  variant = 'outline',
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const defaultOptions: ExportDropdownOption[] = [
    {
      key: '1_day',
      label: t('common.exportRangeToday'),
      description: t('common.exportRangeTodayDesc'),
    },
    {
      key: '7_days',
      label: t('common.exportRange7Days'),
      description: t('common.exportRange7DaysDesc'),
    },
    {
      key: '1_month',
      label: t('common.exportRange1Month'),
      description: t('common.exportRange1MonthDesc'),
    },
    {
      key: 'all',
      label: t('common.exportRangeAll'),
      description: t('common.exportRangeAllDesc'),
    },
  ]

  const exportOptions = options || defaultOptions

  const handleSelect = (key: ExportDateRange | string) => {
    sound.playClick()
    setOpen(false)
    onExport(key)
  }

  const displayLabel = label || t('common.exportCsv')

  const sizeClasses: Record<ExportDropdownSize, { button: string; icon: number; chevron: number }> = {
    sm: { button: 'h-8 sm:h-9 px-3 text-xs rounded-lg sm:rounded-xl gap-1.5', icon: 14, chevron: 12 },
    md: { button: 'h-10 px-3.5 sm:px-4 text-xs sm:text-[13px] rounded-xl gap-2', icon: 15, chevron: 13 },
    lg: { button: 'h-12 px-5 text-sm rounded-xl gap-2.5', icon: 16, chevron: 14 },
  }

  const variantStyles: Record<ExportDropdownVariant, { button: string; iconClass: string }> = {
    outline: {
      button:
        'border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 hover:bg-muted/80 dark:hover:bg-slate-700 text-foreground dark:text-slate-200 shadow-2xs hover:shadow-xs',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    },
    emerald: {
      button:
        'border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-2xs hover:shadow-xs',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    },
    secondary: {
      button:
        'border border-border/70 bg-muted/70 hover:bg-muted text-foreground shadow-2xs hover:shadow-xs',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    },
  }

  const currentSize = sizeClasses[size] || sizeClasses.md
  const currentVariant = variantStyles[variant] || variantStyles.outline

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button - Perfectly sized and styled to match sibling buttons */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          sound.playClick()
          setOpen((prev) => !prev)
        }}
        title={title || displayLabel}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.98] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${currentSize.button} ${currentVariant.button} ${className}`}
      >
        {loading ? (
          <Loader2 size={currentSize.icon} className="animate-spin" />
        ) : (
          <Download size={currentSize.icon} className={currentVariant.iconClass} />
        )}
        <span>{loading ? t('common.exportingRange') : displayLabel}</span>
        <ChevronDown
          size={currentSize.chevron}
          className={`transition-transform duration-200 text-muted-foreground/80 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu Popup - Clean typography without icon box */}
      {open && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } top-full mt-1.5 w-56 rounded-2xl bg-card text-foreground border border-border shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95`}
        >
          {exportOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSelect(opt.key)}
              className="w-full flex flex-col items-start px-3 py-2 text-xs rounded-xl hover:bg-muted text-foreground transition-colors cursor-pointer text-left group"
            >
              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {opt.label}
              </div>
              {opt.description && (
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {opt.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExportDropdown
