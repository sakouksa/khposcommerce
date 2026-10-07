import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  LogOut,
  ShieldAlert,
  RotateCcw,
  Archive,
  Loader2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { translateString } from '@/lib/i18n'
import CloseButton from '../buttons/CloseButton'

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success'
export type ConfirmActionType =
  | 'delete'
  | 'logout'
  | 'revoke'
  | 'warning'
  | 'restore'
  | 'archive'
  | 'info'
  | 'success'

export interface ConfirmModalProps {
  isOpen: boolean
  variant?: ConfirmVariant
  actionType?: ConfirmActionType
  title?: string
  subtitle?: string
  message?: React.ReactNode
  itemName?: string
  warningText?: string
  confirmText?: string
  confirmLabel?: string
  cancelText?: string
  cancelLabel?: string
  isPending?: boolean
  loading?: boolean
  icon?: React.ComponentType<{ size?: number; className?: string }>
  onConfirm: () => void
  onCancel?: () => void
  onClose?: () => void
}

interface ActionConfig {
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconColor: string
  badgeBg: string
  button: string
}

const getActionConfig = (actionType: ConfirmActionType, variant: ConfirmVariant): ActionConfig => {
  switch (actionType) {
    case 'logout':
      return {
        icon: LogOut,
        iconColor: 'text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400',
        button: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/20 focus:ring-rose-500/30',
      }
    case 'revoke':
      return {
        icon: ShieldAlert,
        iconColor: 'text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400',
        button: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/20 focus:ring-rose-500/30',
      }
    case 'delete':
      return {
        icon: Trash2,
        iconColor: 'text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400',
        button: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/20 focus:ring-rose-500/30',
      }
    case 'restore':
      return {
        icon: RotateCcw,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-600/20 focus:ring-emerald-500/30',
      }
    case 'archive':
      return {
        icon: Archive,
        iconColor: 'text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-sm shadow-purple-600/20 focus:ring-purple-500/30',
      }
    case 'warning':
      return {
        icon: AlertTriangle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400',
        button: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-sm shadow-amber-600/20 focus:ring-amber-500/30',
      }
    case 'success':
      return {
        icon: CheckCircle2,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-600/20 focus:ring-emerald-500/30',
      }
    case 'info':
    default:
      if (variant === 'danger') {
        return {
          icon: Trash2,
          iconColor: 'text-rose-600 dark:text-rose-400',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400',
          button: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-600/20 focus:ring-rose-500/30',
        }
      }
      if (variant === 'warning') {
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600 dark:text-amber-400',
          badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400',
          button: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-sm shadow-amber-600/20 focus:ring-amber-500/30',
        }
      }
      if (variant === 'success') {
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400',
          button: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-600/20 focus:ring-emerald-500/30',
        }
      }
      return {
        icon: Info,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400',
        button: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-600/20 focus:ring-indigo-500/30',
      }
  }
}

const resolveActionType = (
  explicitActionType?: ConfirmActionType,
  variant?: ConfirmVariant,
  title?: string,
  confirmText?: string
): ConfirmActionType => {
  if (explicitActionType) return explicitActionType
  if (variant === 'danger') return 'delete'
  if (variant === 'warning') return 'warning'
  if (variant === 'success') return 'success'

  const str = `${title || ''} ${confirmText || ''}`.toLowerCase()
  if (str.includes('logout') || str.includes('sign out')) {
    return 'logout'
  }
  if (str.includes('revoke')) {
    return 'revoke'
  }
  if (str.includes('restore')) {
    return 'restore'
  }
  if (str.includes('archive')) {
    return 'archive'
  }
  if (str.includes('delete') || str.includes('remove')) {
    return 'delete'
  }
  return 'info'
}

interface EntityPattern {
  key: string
  keywords: string[]
}

const ENTITY_PATTERNS: EntityPattern[] = [
  { key: 'category', keywords: ['categor'] },
  { key: 'brand', keywords: ['brand'] },
  { key: 'unit', keywords: ['unit'] },
  { key: 'attribute', keywords: ['attribute'] },
  { key: 'tax', keywords: ['tax'] },
  { key: 'group', keywords: ['group'] },
  { key: 'address', keywords: ['address'] },
  { key: 'customer', keywords: ['customer'] },
  { key: 'supplier', keywords: ['supplier'] },
  { key: 'product', keywords: ['product'] },
  { key: 'employee', keywords: ['employee'] },
  { key: 'department', keywords: ['department'] },
  { key: 'position', keywords: ['position'] },
  { key: 'attendance', keywords: ['attendance'] },
  { key: 'payroll', keywords: ['payroll'] },
  { key: 'banner', keywords: ['banner'] },
  { key: 'coupon', keywords: ['coupon'] },
]

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  variant = 'danger',
  actionType,
  title,
  subtitle,
  message,
  itemName,
  warningText,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  isPending = false,
  loading = false,
  icon: CustomIcon,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const { t, i18n } = useTranslation(['confirm', 'common', 'buttons', 'security'])

  const handleCancel = () => {
    if (onCancel) onCancel()
    else if (onClose) onClose()
  }

  const effectiveConfirmText = confirmText || confirmLabel
  const effectiveCancelText = cancelText || cancelLabel

  const isExecuting = isPending || loading
  const detectedActionType = resolveActionType(actionType, variant, title, effectiveConfirmText)
  const config = getActionConfig(detectedActionType, variant)
  const VariantIcon = CustomIcon || config.icon

  // Localized string resolvers utilizing locales/km/confirm.json and locales/en/confirm.json
  const getTitle = () => {
    if (title) {
      return translateString(t(title, { defaultValue: title }))
    }
    if (detectedActionType === 'logout') {
      return t('confirm.titles.logout', { defaultValue: 'Sign out?' })
    }
    if (detectedActionType === 'revoke') {
      return t('confirm.titles.revoke', { defaultValue: 'Revoke device session?' })
    }
    if (detectedActionType === 'delete' || variant === 'danger') {
      return t('confirm.titles.delete', { defaultValue: 'Delete this item?' })
    }
    return t('confirm.titles.confirm', { defaultValue: 'Confirm Action' })
  }

  const getSubtitleContent = () => {
    if (subtitle) {
      return translateString(t(subtitle, { defaultValue: subtitle }))
    }

    if (itemName && (detectedActionType === 'delete' || variant === 'danger')) {
      const titleLower = (title || '').toLowerCase()
      const match = ENTITY_PATTERNS.find((p) => {
        const localizedPrefix = t(`confirm.entities.${p.key}.prefix`, { defaultValue: '' }).toLowerCase()
        return (
          p.keywords.some((kw) => titleLower.includes(kw)) ||
          (Boolean(localizedPrefix) && titleLower.includes(localizedPrefix))
        )
      })

      if (match) {
        const prefix = t(`confirm.entities.${match.key}.prefix`, { defaultValue: '' })
        const suffix = t(`confirm.entities.${match.key}.suffix`, { defaultValue: '' })
        return (
          <>
            {prefix ? `${prefix} ` : ''}
            <span className="font-semibold text-slate-900 dark:text-white">"{itemName}"</span>{' '}
            {suffix}
          </>
        )
      }

      return (
        <>
          <span className="font-semibold text-slate-900 dark:text-white">"{itemName}"</span>{' '}
          {t('confirm.descriptions.itemDeleted', {
            defaultValue: 'will be deleted from the system. This action cannot be undone.',
          })}
        </>
      )
    }

    if (warningText) {
      return translateString(t(warningText, { defaultValue: warningText }))
    }

    if (detectedActionType === 'delete' || variant === 'danger') {
      return t('confirm.descriptions.delete', {
        defaultValue: 'This item will be deleted from the system. This action cannot be undone.',
      })
    }

    if (detectedActionType === 'logout') {
      return t('confirm.descriptions.logout', {
        defaultValue: 'Your current session will be terminated.',
      })
    }

    return null
  }

  const getCancel = () => {
    if (effectiveCancelText) {
      return translateString(t(effectiveCancelText, { defaultValue: effectiveCancelText }))
    }
    return t('confirm.buttons.cancel', { defaultValue: 'Cancel' })
  }

  const getConfirm = () => {
    if (effectiveConfirmText) {
      return translateString(t(effectiveConfirmText, { defaultValue: effectiveConfirmText }))
    }
    if (detectedActionType === 'logout') {
      return t('confirm.buttons.logout', { defaultValue: 'Sign Out' })
    }
    if (detectedActionType === 'revoke') {
      return t('confirm.buttons.revoke', { defaultValue: 'Revoke' })
    }
    if (detectedActionType === 'restore') {
      return t('confirm.buttons.restore', { defaultValue: 'Restore' })
    }
    if (detectedActionType === 'delete' || variant === 'danger') {
      return t('confirm.buttons.delete', { defaultValue: 'Delete' })
    }
    return t('confirm.buttons.confirm', { defaultValue: 'Confirm' })
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div key={i18n.language} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 min-h-screen">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isExecuting ? handleCancel : undefined}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container Card - Clean, Compact & Balanced */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${config.badgeBg}`}>
                  <VariantIcon size={19} className={config.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {getTitle()}
                  </h3>
                  {getSubtitleContent() && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {getSubtitleContent()}
                    </div>
                  )}
                </div>
              </div>
              <CloseButton
                onClose={handleCancel}
                disabled={isExecuting}
                size="sm"
                variant="ghost"
                className="shrink-0 -mt-1 -mr-1"
              />
            </div>

            {/* Optional Custom Message Body */}
            {message && (
              <div className="p-4 py-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                {typeof message === 'string'
                  ? translateString(t(message, { defaultValue: message }))
                  : message}
              </div>
            )}

            {/* Actions Footer - Clean inline buttons */}
            <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 pt-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isExecuting}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {getCancel()}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isExecuting}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 ${config.button}`}
              >
                {isExecuting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <VariantIcon size={14} />
                )}
                <span>{getConfirm()}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default ConfirmModal
