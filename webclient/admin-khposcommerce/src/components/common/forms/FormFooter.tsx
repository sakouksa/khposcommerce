import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Loader2 } from 'lucide-react'

export interface FormFooterProps {
  /** Path for Cancel/Back button */
  cancelPath?: string
  /** Label for Cancel button. Defaults to t('common.cancel', 'Cancel') */
  cancelLabel?: string
  /** Optional custom icon for Cancel button (defaults to no icon) */
  cancelIcon?: React.ReactNode
  /** Custom handler for Cancel button */
  onCancel?: () => void
  /** Whether to display the cancel button (default: true) */
  showCancel?: boolean
  /** Is the form in edit mode? (optional) */
  isEdit?: boolean
  /** Is the form currently submitting / saving? */
  isSubmitting?: boolean
  /** Whether the submit button is disabled */
  disabled?: boolean
  /** Handler for submit button */
  onSubmit?: (e: React.FormEvent) => void
  /** Label for submit button */
  submitLabel?: string
  /** Custom icon for submit button */
  submitIcon?: React.ReactNode
  /** Whether to display the submit button (default: true) */
  showSubmit?: boolean
  /** Left-hand info summary or contextual indicator */
  infoSummary?: React.ReactNode
  /** Show keyboard shortcut badge (Cmd+S / Ctrl+S) on save button or summary */
  showShortcutHint?: boolean
  /** Extra custom action buttons (e.g. Reset, Delete, Draft save) */
  extraActions?: React.ReactNode
  /** Sticky to bottom of screen (defaults to false for natural in-flow scrolling) */
  sticky?: boolean
  /** Custom children rendered inside footer */
  children?: React.ReactNode
  /** Custom CSS classes */
  className?: string
}

export const FormFooter: React.FC<FormFooterProps> = ({
  cancelPath,
  cancelLabel,
  cancelIcon,
  onCancel,
  showCancel = true,
  isEdit = false,
  isSubmitting = false,
  disabled = false,
  onSubmit,
  submitLabel,
  submitIcon,
  showSubmit = true,
  infoSummary,
  showShortcutHint: _showShortcutHint = false,
  extraActions,
  sticky = false,
  children,
  className = '',
}) => {
  const { t } = useTranslation(['common', 'buttons'])
  const navigate = useNavigate()

  // Handle Cmd+S / Ctrl+S keyboard shortcut to save
  useEffect(() => {
    if (!onSubmit) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (!isSubmitting && !disabled) {
          onSubmit(e as any)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSubmit, isSubmitting, disabled])

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (cancelPath) {
      navigate(cancelPath)
    } else {
      navigate(-1)
    }
  }

  return (
    <div
      className={`${
        sticky
          ? 'sticky bottom-0 left-0 right-0 z-30 bg-background/85 dark:bg-slate-950/85 backdrop-blur-md border-t border-border/70 dark:border-slate-800 py-3.5 px-4 sm:px-6 shadow-sm'
          : 'pt-5 sm:pt-6 border-t border-border/70 dark:border-slate-800/80'
      } ${className}`}
    >
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left: Summary Context if provided */}
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground dark:text-slate-400 min-w-0 flex-1">
          {infoSummary && <div className="truncate max-w-md">{infoSummary}</div>}
        </div>

        {/* Custom children slot if provided */}
        {children && <div className="flex items-center gap-2">{children}</div>}

        {/* Right: Action Buttons Group */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto ml-auto flex-wrap shrink-0">
          {extraActions}

          {/* Cancel Button */}
          {showCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="h-9 min-h-[36px] px-3.5 sm:px-4 text-xs sm:text-[13px] font-bold border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-900 text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted/80 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
            >
              {cancelIcon}
              <span>{cancelLabel || t('common.cancel', 'Cancel')}</span>
            </button>
          )}

          {/* Submit Button */}
          {showSubmit && (
            <button
              type={onSubmit ? 'button' : 'submit'}
              onClick={onSubmit}
              disabled={isSubmitting || disabled}
              className="h-9 min-h-[36px] px-4 sm:px-5 text-xs sm:text-[13px] bg-primary text-white rounded-xl font-bold shadow-xs hover:bg-primary/90 hover:shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                submitIcon || <Check size={14} strokeWidth={2.5} />
              )}
              <span>{submitLabel || (isEdit ? t('common.saveChanges', 'Save Changes') : t('common.save', 'Save'))}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormFooter
