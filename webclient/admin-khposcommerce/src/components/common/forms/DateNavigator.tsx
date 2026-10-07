import React, { useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { sound } from '@/utils/sound'

export interface DateNavigatorProps {
  /** Selected date in YYYY-MM-DD format */
  value: string
  /** Handler when date changes */
  onChange: (dateStr: string) => void
  /** Custom root className */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md'
  /** Whether to show a Quick "Today" button when not on today */
  showTodayButton?: boolean
  /** Whether to allow navigating to future dates */
  allowFuture?: boolean
  /** Minimum selectable date in YYYY-MM-DD format */
  minDate?: string
  /** Maximum selectable date in YYYY-MM-DD format */
  maxDate?: string
}

const KM_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
]
const KM_DAYS = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍']

/**
 * Global DateNavigator Component.
 * Provides intuitive Day-by-Day Stepper (< Previous, Next >), Quick Today Jump,
 * and a Native/Calendar DatePicker popover.
 * Designed to fit seamlessly into TableToolbar, HeaderActions, or Filter panels.
 */
export const DateNavigator: React.FC<DateNavigatorProps> = ({
  value,
  onChange,
  className = '',
  size = 'md',
  showTodayButton = true,
  allowFuture = true,
  minDate,
  maxDate,
}) => {
  const { t, i18n } = useTranslation(['common', 'employees'])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')
  const dateInputRef = useRef<HTMLInputElement>(null)

  const todayStr = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const isToday = value === todayStr

  // Format localized display text
  const formattedDate = useMemo(() => {
    if (!value) return ''
    try {
      const d = dayjs(value)
      if (!d.isValid()) return value
      if (isKm) {
        const dayName = KM_DAYS[d.day()] || ''
        const monthName = KM_MONTHS[d.month()] || ''
        return `${dayName}, ${d.date()} ${monthName} ${d.year()}`
      }
      return d.format('ddd, DD MMM YYYY')
    } catch {
      return value
    }
  }, [value, isKm])

  const handlePrevDay = (e: React.MouseEvent) => {
    e.stopPropagation()
    sound.playClick()
    const prev = dayjs(value).subtract(1, 'day').format('YYYY-MM-DD')
    if (minDate && prev < minDate) return
    onChange(prev)
  }

  const handleNextDay = (e: React.MouseEvent) => {
    e.stopPropagation()
    sound.playClick()
    const next = dayjs(value).add(1, 'day').format('YYYY-MM-DD')
    if (!allowFuture && next > todayStr) return
    if (maxDate && next > maxDate) return
    onChange(next)
  }

  const handleJumpToday = (e: React.MouseEvent) => {
    e.stopPropagation()
    sound.playClick()
    onChange(todayStr)
  }

  const handleOpenPicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker()
      } else {
        dateInputRef.current.click()
      }
    }
  }

  const isNextDisabled = (!allowFuture && isToday) || Boolean(maxDate && value >= maxDate)
  const isPrevDisabled = Boolean(minDate && value <= minDate)

  const heightClass = size === 'sm' ? 'h-8 text-xs' : 'h-10 text-xs sm:text-[13px]'
  const btnPadding = size === 'sm' ? 'w-7' : 'w-8'

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Stepper Pill Container */}
      <div className={`inline-flex items-center rounded-xl bg-card border border-border shadow-2xs transition-colors overflow-hidden ${heightClass}`}>
        {/* Previous Day Button */}
        <button
          type="button"
          onClick={handlePrevDay}
          disabled={isPrevDisabled}
          aria-label={t('common.previousDay', 'Previous day')}
          className={`h-full ${btnPadding} flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer`}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Center Display / Clickable Picker Trigger */}
        <div
          onClick={handleOpenPicker}
          className="h-full px-2.5 sm:px-3 flex items-center gap-2 font-medium text-foreground cursor-pointer hover:bg-muted/40 transition-colors border-x border-border/50 select-none relative"
          title={t('common.selectDate', 'Click to select date')}
        >
          <CalendarIcon size={14} className="text-primary shrink-0" />
          <span className="font-semibold tracking-tight whitespace-nowrap">
            {formattedDate}
          </span>

          {isToday && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('common.today', 'ថ្ងៃនេះ')}</span>
            </span>
          )}

          {/* Hidden native date input for robust cross-platform picking */}
          <input
            ref={dateInputRef}
            type="date"
            value={value}
            min={minDate}
            max={!allowFuture ? todayStr : maxDate}
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value)
              }
            }}
            className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Next Day Button */}
        <button
          type="button"
          onClick={handleNextDay}
          disabled={isNextDisabled}
          aria-label={t('common.nextDay', 'Next day')}
          className={`h-full ${btnPadding} flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer`}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Quick Jump Today Button (Shown only when viewing a past/future day) */}
      {showTodayButton && !isToday && (
        <button
          type="button"
          onClick={handleJumpToday}
          className={`px-2.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0 ${heightClass}`}
          title={t('common.jumpToToday', 'Go to today')}
        >
          <RotateCcw size={12} />
          <span>{t('common.today', 'ថ្ងៃនេះ')}</span>
        </button>
      )}
    </div>
  )
}

export default DateNavigator
