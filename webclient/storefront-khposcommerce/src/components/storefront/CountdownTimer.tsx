import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetDate?: string | Date
  className?: string
  variant?: 'dark' | 'light' | 'fire'
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  className,
  variant = 'fire',
}) => {
  const { t } = useTranslation()

  const calculateTimeLeft = () => {
    const end = targetDate ? new Date(targetDate).getTime() : Date.now() + 2 * 86400000
    const difference = end - Date.now()

    if (difference <= 0) {
      return { days: 0, hours: 0, mins: 0, secs: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      mins: Math.floor((difference / 1000 / 60) % 60),
      secs: Math.floor((difference / 1000) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const pad = (n: number) => String(n).padStart(2, '0')

  const isFire = variant === 'fire'

  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
      {timeLeft.days > 0 && (
        <>
          <div className={cn(
            'flex flex-col items-center justify-center rounded-xl min-w-[42px] sm:min-w-[48px] py-1.5 px-2 text-center shadow-inner',
            isFire ? 'bg-black/30 border border-white/10 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          )}>
            <span className="text-sm sm:text-base font-extrabold font-mono leading-none">
              {pad(timeLeft.days)}
            </span>
            <span className="text-[9px] uppercase tracking-wider opacity-75 font-semibold mt-0.5">
              {t('timer.days')}
            </span>
          </div>
          <span className={cn('font-bold text-sm', isFire ? 'text-white/60' : 'text-gray-400')}>:</span>
        </>
      )}

      {/* Hours */}
      <div className={cn(
        'flex flex-col items-center justify-center rounded-xl min-w-[42px] sm:min-w-[48px] py-1.5 px-2 text-center shadow-inner',
        isFire ? 'bg-black/30 border border-white/10 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
      )}>
        <span className="text-sm sm:text-base font-extrabold font-mono leading-none">
          {pad(timeLeft.hours)}
        </span>
        <span className="text-[9px] uppercase tracking-wider opacity-75 font-semibold mt-0.5">
          {t('timer.hours')}
        </span>
      </div>
      <span className={cn('font-bold text-sm', isFire ? 'text-white/60' : 'text-gray-400')}>:</span>

      {/* Minutes */}
      <div className={cn(
        'flex flex-col items-center justify-center rounded-xl min-w-[42px] sm:min-w-[48px] py-1.5 px-2 text-center shadow-inner',
        isFire ? 'bg-black/30 border border-white/10 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
      )}>
        <span className="text-sm sm:text-base font-extrabold font-mono leading-none">
          {pad(timeLeft.mins)}
        </span>
        <span className="text-[9px] uppercase tracking-wider opacity-75 font-semibold mt-0.5">
          {t('timer.mins')}
        </span>
      </div>
      <span className={cn('font-bold text-sm', isFire ? 'text-white/60' : 'text-gray-400')}>:</span>

      {/* Seconds */}
      <div className={cn(
        'flex flex-col items-center justify-center rounded-xl min-w-[42px] sm:min-w-[48px] py-1.5 px-2 text-center shadow-inner',
        isFire ? 'bg-red-500/30 border border-red-400/30 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
      )}>
        <span className="text-sm sm:text-base font-extrabold font-mono leading-none animate-pulse">
          {pad(timeLeft.secs)}
        </span>
        <span className="text-[9px] uppercase tracking-wider opacity-75 font-semibold mt-0.5">
          {t('timer.secs')}
        </span>
      </div>
    </div>
  )
}

export default CountdownTimer
