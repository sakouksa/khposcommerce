import React from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2 } from 'lucide-react'

export interface ModalFooterProps {
  /** Label for Cancel button. Defaults to t('common.cancel', 'Cancel') */
  cancelLabel?: string
  /** Click handler for Cancel button */
  onCancel?: () => void
  /** Whether to show the Cancel button (default: true) */
  showCancel?: boolean
  /** Label for Submit button. Defaults to Save / Save Changes */
  submitLabel?: string
  /** Custom icon for Submit button (defaults to Check) */
  submitIcon?: React.ReactNode
  /** Click handler for submit button if not form-submitting */
  onSubmit?: (e?: React.FormEvent) => void
  /** Submit button HTML type ('submit' | 'button'). Defaults to 'submit' */
  submitButtonType?: 'submit' | 'button'
  /** Whether to show the Submit button (default: true) */
  showSubmit?: boolean
  /** Whether submission is in progress */
  isSubmitting?: boolean
  /** Whether the submit button is disabled */
  disabled?: boolean
  /** Whether modal is in Edit mode (adjusts default label to 'Save Changes') */
  isEdit?: boolean
  /** Contextual info or helper notes displayed on the left */
  infoSummary?: React.ReactNode
  /** Color variant for submit button ('primary' | 'emerald' | 'danger'). Defaults to 'primary' */
  submitVariant?: 'primary' | 'emerald' | 'danger'
  /** Extra custom action buttons (rendered before Cancel/Submit) */
  extraActions?: React.ReactNode
  /** Custom wrapper CSS class */
  className?: string
  /** Custom children elements (replaces default button layout if provided) */
  children?: React.ReactNode
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  cancelLabel,
  onCancel,
  showCancel = true,
  submitLabel,
  submitIcon,
  onSubmit,
  submitButtonType = 'submit',
  showSubmit = true,
  isSubmitting = false,
  disabled = false,
  isEdit = false,
  infoSummary,
  submitVariant = 'primary',
  extraActions,
  className = '',
  children,
}) => {
  const { t } = useTranslation(['common'])

  const getSubmitVariantStyles = () => {
    switch (submitVariant) {
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
      case 'danger':
        return 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs'
      case 'primary':
      default:
        return 'bg-primary hover:bg-primary/90 text-white shadow-xs'
    }
  }

  if (children) {
    return (
      <div
        className={`flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 shrink-0 ${className}`}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 shrink-0 ${className}`}
    >
      {/* Left: Info Summary slot */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-slate-400 min-w-0">
        {infoSummary}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center justify-end gap-3 shrink-0">
        {extraActions}

        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 text-xs sm:text-[13px] font-bold text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-slate-700 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {cancelLabel || t('common.cancel', 'Cancel')}
          </button>
        )}

        {showSubmit && (
          <button
            type={submitButtonType}
            onClick={onSubmit}
            disabled={isSubmitting || disabled}
            className={`h-10 inline-flex items-center justify-center gap-2 px-6 rounded-xl text-xs sm:text-[13px] font-bold hover:shadow transition-all disabled:opacity-50 cursor-pointer active:scale-95 ${getSubmitVariantStyles()}`}
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              submitIcon || <Check size={14} strokeWidth={2.5} />
            )}
            <span>
              {submitLabel ||
                (isEdit
                  ? t('common.saveChanges', 'Save Changes')
                  : t('common.save', 'Save'))}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export default ModalFooter
