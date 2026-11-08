import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import Breadcrumb, { type BreadcrumbItem } from '../navigation/Breadcrumb'

export type FormHeaderIconVariant = 'primary' | 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'neutral'

export interface FormHeaderProps {
  /** Title of the form (e.g. "បន្ថែមអតិថិជនថ្មី", "កែសម្រួលអ្នកផ្គត់ផ្គង់") */
  title: React.ReactNode
  /** Subtitle or explanatory description */
  subtitle?: React.ReactNode
  /** Whether the form is in edit mode */
  isEdit?: boolean
  /** Leading Icon (optional) */
  icon?: React.ReactNode
  /** Color theme variant for icon container (legacy support) */
  iconBg?: string
  /** Optional Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[]
  /** Optional Status Badge on right of title */
  statusBadge?: React.ReactNode
  /** Path for Back button. If not provided, calls onBack or navigate(-1) */
  backPath?: string
  /** Label for Back button. Defaults to t('common.back', 'Back') */
  backLabel?: string
  /** Whether to show the back button (defaults to true) */
  showBack?: boolean
  /** Custom handler for back button */
  onBack?: () => void
  /** Is the form currently submitting / saving? (legacy) */
  isSubmitting?: boolean
  /** Handler for submit button (deprecated: global forms place submit in footer only) */
  onSubmit?: (e: React.FormEvent) => void
  /** Custom label for submit button (deprecated) */
  submitLabel?: string
  /** Whether to render submit button directly inside header (strictly disabled: global forms use footer only) */
  showSubmit?: boolean
  /** Custom icon for submit button (deprecated) */
  submitIcon?: React.ReactNode
  /** Additional action buttons rendered beside Back button */
  extraActions?: React.ReactNode
  /** Additional classes for container */
  className?: string
  /** Frameless clean mode without card background, border, or shadow */
  frameless?: boolean
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconBg = 'bg-primary/10 text-primary border-primary/20',
  breadcrumbs,
  statusBadge,
  backPath,
  backLabel,
  showBack = true,
  onBack,
  isSubmitting: _isSubmitting = false,
  onSubmit: _onSubmit,
  submitLabel: _submitLabel,
  showSubmit: _showSubmit,
  isEdit: _isEdit = false,
  submitIcon: _submitIcon,
  extraActions,
  className = '',
  frameless = false,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation(['common'])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backPath) {
      navigate(backPath)
    } else {
      navigate(-1)
    }
  }

  return (
    <div
      className={`transition-all ${
        frameless
          ? 'bg-transparent border-0 shadow-none p-0 space-y-3'
          : 'p-4 sm:p-5 md:p-6 bg-card border-b border-border/80 dark:border-slate-800 space-y-3.5 shadow-2xs'
      } ${className}`}
    >
      {/* Top: Breadcrumb Bar */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="text-xs" />
      )}

      {/* Main Header Content: Title, Subtitle, and Right Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Title + Subtitle + Status Badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {typeof title === 'string' ? (
              <h1 className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight truncate">
                {title}
              </h1>
            ) : (
              <div className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight min-w-0">
                {title}
              </div>
            )}
            {statusBadge && (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {statusBadge}
              </div>
            )}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1.5 flex-wrap">
              {subtitle}
            </div>
          )}
        </div>

        {/* Right / Bottom: Modern Action Controls Group */}
        {(showBack || extraActions) && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full xl:w-auto xl:justify-end shrink-0 pt-0.5 xl:pt-0">
            {/* Back Button */}
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="h-8.5 sm:h-9 min-h-[34px] sm:min-h-[36px] px-3 sm:px-4 rounded-xl border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-900/90 text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-slate-800 text-xs sm:text-[13px] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <ArrowLeft size={14} />
                <span>{backLabel || t('common.back', 'Back')}</span>
              </button>
            )}

            {/* Extra Custom Action Buttons */}
            {extraActions}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Standard FormHeader action button component.
 * Ensures 100% consistent height (h-8.5 / h-9), responsive font-size (text-xs sm:text-[13px]),
 * padding (px-3 sm:px-4), border-radius (rounded-xl), and icon alignment matching the Back button.
 */
export interface FormHeaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'default' | 'danger' | 'primary' | 'emerald' | 'secondary'
  icon?: React.ReactNode
}

export const FormHeaderButton: React.FC<FormHeaderButtonProps> = ({
  children,
  variant = 'outline',
  icon,
  className = '',
  type = 'button',
  disabled,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    outline:
      'border-border/80 dark:border-slate-700 bg-card dark:bg-slate-900/90 text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted dark:hover:bg-slate-800',
    default:
      'border-border/80 dark:border-slate-700 bg-card dark:bg-slate-900/90 text-foreground dark:text-slate-100 hover:text-primary dark:hover:text-white hover:bg-muted dark:hover:bg-slate-800',
    secondary:
      'border-border/80 dark:border-slate-700 bg-muted dark:bg-slate-800 text-foreground dark:text-slate-100 hover:bg-muted/80',
    danger:
      'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40',
    primary:
      'border-primary bg-primary text-white hover:bg-primary/90 shadow-xs',
    emerald:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`h-8.5 sm:h-9 min-h-[34px] sm:min-h-[36px] px-3 sm:px-4 rounded-xl border text-xs sm:text-[13px] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant] || variantStyles.outline} ${className}`}
      {...props}
    >
      {icon}
      {children && <span>{children}</span>}
    </button>
  )
}

const FormHeaderComponent = Object.assign(FormHeader, {
  Button: FormHeaderButton,
})

export default FormHeaderComponent

