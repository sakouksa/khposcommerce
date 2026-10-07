import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  onRetry,
  retryLabel,
  className,
}) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 border border-dashed border-rose-200 dark:border-rose-900/40 shadow-2xs',
        className
      )}
    >
      <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 font-display tracking-tight">
        {title || t('common.error_title', 'Something Went Wrong')}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
        {description ||
          t(
            'common.error_desc',
            'We encountered an unexpected error while loading this content. Please try again.'
          )}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 btn-primary text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 rounded-xl shadow-md cursor-pointer bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{retryLabel || t('common.retry', 'Retry Connection')}</span>
        </button>
      )}
    </div>
  )
}

export default ErrorState
