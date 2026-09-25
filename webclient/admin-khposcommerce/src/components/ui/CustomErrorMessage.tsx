import React from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  RefreshCw,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'critical'
export type ErrorVariant = 'banner' | 'card' | 'inline' | 'glass' | 'minimal'

export interface CustomErrorMessageProps {
  title?: React.ReactNode
  message: React.ReactNode
  description?: React.ReactNode
  details?: any
  copyable?: boolean
  code?: string | number
  severity?: ErrorSeverity
  variant?: ErrorVariant
  onRetry?: () => void
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
  icon?: React.ReactNode
}

const SEVERITY_STYLES: Record<
  ErrorSeverity,
  {
    bg: string
    border: string
    text: string
    titleText: string
    badgeBg: string
    badgeText: string
    glow: string
    icon: React.ReactNode
  }
> = {
  critical: {
    bg: 'bg-rose-500/10 dark:bg-rose-950/40',
    border: 'border-rose-500/30 dark:border-rose-500/40',
    text: 'text-rose-700 dark:text-rose-300',
    titleText: 'text-rose-900 dark:text-rose-100',
    badgeBg: 'bg-rose-500/20 dark:bg-rose-500/30',
    badgeText: 'text-rose-700 dark:text-rose-300',
    glow: 'shadow-rose-500/10',
    icon: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
  },
  error: {
    bg: 'bg-rose-50/90 dark:bg-rose-950/30',
    border: 'border-rose-200/80 dark:border-rose-800/40',
    text: 'text-rose-700 dark:text-rose-300',
    titleText: 'text-rose-900 dark:text-rose-100',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
    badgeText: 'text-rose-700 dark:text-rose-300',
    glow: 'shadow-rose-500/5',
    icon: <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 flex-shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-50/90 dark:bg-amber-950/30',
    border: 'border-amber-200/80 dark:border-amber-800/40',
    text: 'text-amber-800 dark:text-amber-300',
    titleText: 'text-amber-900 dark:text-amber-100',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
    badgeText: 'text-amber-800 dark:text-amber-300',
    glow: 'shadow-amber-500/5',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />,
  },
  info: {
    bg: 'bg-blue-50/90 dark:bg-blue-950/30',
    border: 'border-blue-200/80 dark:border-blue-800/40',
    text: 'text-blue-700 dark:text-blue-300',
    titleText: 'text-blue-900 dark:text-blue-100',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
    badgeText: 'text-blue-700 dark:text-blue-300',
    glow: 'shadow-blue-500/5',
    icon: <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />,
  },
}

export const CustomErrorMessage: React.FC<CustomErrorMessageProps> = ({
  title,
  message,
  description,
  code,
  severity = 'error',
  variant = 'card',
  onRetry,
  onDismiss,
  action,
  className = '',
  icon,
}) => {
  const { t } = useTranslation()
  const theme = SEVERITY_STYLES[severity] || SEVERITY_STYLES.error

  // ─── Minimal / Inline Variant ──────────────────────────────────────────
  if (variant === 'minimal' || variant === 'inline') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${theme.text} ${className}`}
      >
        {icon || <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
        <span>{message}</span>
      </div>
    )
  }

  // ─── Banner / Card / Glass Variants ────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`rounded-2xl border p-4 sm:p-5 relative overflow-hidden backdrop-blur-md shadow-lg ${theme.bg} ${theme.border} ${theme.glow} ${className}`}
    >
      {/* Top Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-0.5 p-2 rounded-xl bg-white/80 dark:bg-slate-900/60 shadow-sm border border-black/5 dark:border-white/10 flex-shrink-0">
            {icon || theme.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {title && (
                <h4 className={`text-sm font-bold tracking-tight ${theme.titleText}`}>
                  {title}
                </h4>
              )}
              {code && (
                <span
                  className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full border border-black/5 dark:border-white/10 ${theme.badgeBg} ${theme.badgeText}`}
                >
                  {typeof code === 'number' ? `HTTP ${code}` : code}
                </span>
              )}
            </div>

            <div className={`text-xs sm:text-sm font-medium leading-relaxed ${theme.text}`}>
              {message}
            </div>

            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors -mr-1 -mt-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Action Footer (Retry or Custom Buttons) */}
      {(onRetry || action) && (
        <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-2 flex-wrap">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>{t('retry', 'Retry')}</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default CustomErrorMessage
