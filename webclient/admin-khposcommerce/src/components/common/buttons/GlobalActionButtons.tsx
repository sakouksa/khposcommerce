import React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Download, Upload, QrCode, Check, Loader2, X, RefreshCw, Filter, RotateCcw } from 'lucide-react'
import ExportDropdown, {
  type ExportDateRange,
  type ExportDropdownOption,
  type ExportDropdownVariant,
  type ExportDropdownSize,
} from '../tables/ExportDropdown'

/**
 * Standard Header Action Button Group container.
 * Keeps spacing, wrapping, and heights completely consistent across all enterprise pages.
 */
export interface HeaderActionsGroupProps {
  children: React.ReactNode
  className?: string
}

export const HeaderActionsGroup: React.FC<HeaderActionsGroupProps> = ({ children, className = '' }) => (
  <div className={`flex items-center flex-wrap gap-2 sm:gap-2.5 w-full xl:w-auto xl:justify-end shrink-0 ${className}`}>
    {children}
  </div>
)

/**
 * Standard Primary Action Button (e.g. "+ បន្ថែម...", "+ Add ...", "+ Create ...")
 */
export interface AddButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  type?: 'button' | 'submit'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
  type = 'button',
  size = 'md',
  children,
}) => {
  const content = children ?? label
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-4 text-xs sm:text-[13px] rounded-xl gap-2',
    lg: 'h-12 px-5 text-sm rounded-xl gap-2.5',
  }
  const stringTitle = typeof title === 'string' ? title : typeof content === 'string' ? content : undefined

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={stringTitle}
      className={`inline-flex items-center justify-center font-bold bg-primary hover:bg-primary/90 text-white shadow-xs hover:shadow active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
    >
      {loading ? <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" /> : icon || <Plus size={size === 'sm' ? 13 : 15} strokeWidth={2.5} />}
      {content && <span>{content}</span>}
    </button>
  )
}

/**
 * Standard Secondary / Action Button (e.g. outline button, audit, transfer, custom actions)
 */
export interface ActionButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  variant?: 'outline' | 'secondary' | 'soft' | 'primary' | 'emerald' | 'danger' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  children?: React.ReactNode
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
  variant = 'outline',
  size = 'md',
  type = 'button',
  children,
}) => {
  const content = children ?? label

  const variantStyles: Record<string, string> = {
    outline: 'border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 hover:bg-muted/80 dark:hover:bg-slate-700 text-foreground dark:text-slate-200 shadow-2xs hover:shadow-xs',
    secondary: 'bg-muted/70 hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground border border-border/60 dark:border-slate-700 shadow-2xs',
    soft: 'bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 shadow-2xs',
    primary: 'bg-primary hover:bg-primary/90 text-white shadow-xs hover:shadow border border-primary',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs hover:shadow border border-emerald-600',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs hover:shadow border border-emerald-600',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs hover:shadow border border-rose-600',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs hover:shadow border border-amber-500',
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-4 text-xs sm:text-[13px] rounded-xl gap-2',
    lg: 'h-12 px-5 text-sm rounded-xl gap-2.5',
  }

  const stringTitle = typeof title === 'string' ? title : typeof content === 'string' ? content : undefined

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={stringTitle}
      className={`inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.outline} ${sizeClasses[size]} ${className}`}
    >
      {loading ? <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" /> : icon}
      {content && <span>{content}</span>}
    </button>
  )
}

export const SecondaryButton = ActionButton

/**
 * Standard Export CSV / Excel Button (e.g. "នាំចេញ CSV")
 * Supports either direct onClick or rich date-range dropdown (1 day, 7 days, 1 month, all)
 */
export interface ExportButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  onExportRange?: (range: ExportDateRange | string) => void | Promise<void>
  label?: string
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  options?: ExportDropdownOption[]
  align?: 'left' | 'right'
  variant?: ExportDropdownVariant
  size?: ExportDropdownSize
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  onExportRange,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
  options,
  align = 'right',
  variant = 'outline',
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const displayLabel = label || t('common.exportCsv')

  if (onExportRange) {
    return (
      <ExportDropdown
        onExport={onExportRange}
        label={label}
        loading={loading}
        disabled={disabled}
        className={className}
        align={align}
        options={options}
        title={title}
        variant={variant}
        size={size}
      />
    )
  }

  const sizeClasses: Record<ExportDropdownSize, { button: string; icon: number }> = {
    sm: { button: 'h-8 sm:h-9 px-3 text-xs rounded-lg sm:rounded-xl gap-1.5', icon: 14 },
    md: { button: 'h-10 px-3.5 sm:px-4 text-xs sm:text-[13px] rounded-xl gap-2', icon: 15 },
    lg: { button: 'h-12 px-5 text-sm rounded-xl gap-2.5', icon: 16 },
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title || displayLabel}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.98] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${currentSize.button} ${currentVariant.button} ${className}`}
    >
      {loading ? (
        <Loader2 size={currentSize.icon} className="animate-spin" />
      ) : (
        icon || <Download size={currentSize.icon} className={currentVariant.iconClass} />
      )}
      <span>{displayLabel}</span>
    </button>
  )
}

/**
 * Standard Import CSV Button (e.g. "Import CSV")
 */
export interface ImportButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: string
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  size?: ExportDropdownSize
}

export const ImportButton: React.FC<ImportButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const displayLabel = label || t('common.importCsv')

  const sizeClasses: Record<ExportDropdownSize, { button: string; icon: number }> = {
    sm: { button: 'h-8 sm:h-9 px-3 text-xs rounded-lg sm:rounded-xl gap-1.5', icon: 14 },
    md: { button: 'h-10 px-3.5 sm:px-4 text-xs sm:text-[13px] rounded-xl gap-2', icon: 15 },
    lg: { button: 'h-12 px-5 text-sm rounded-xl gap-2.5', icon: 16 },
  }

  const currentSize = sizeClasses[size] || sizeClasses.md

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title || displayLabel}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.98] shrink-0 border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 hover:bg-muted/80 dark:hover:bg-slate-700 text-foreground dark:text-slate-200 shadow-2xs hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${currentSize.button} ${className}`}
    >
      {loading ? (
        <Loader2 size={currentSize.icon} className="animate-spin" />
      ) : (
        icon || <Upload size={currentSize.icon} className="text-blue-600 dark:text-blue-400" />
      )}
      <span>{displayLabel}</span>
    </button>
  )
}

/**
 * Standard QR Kiosk Button (e.g. "Launch QR Kiosk")
 */
export interface QrKioskButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: string
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
}

export const QrKioskButton: React.FC<QrKioskButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  loading = false,
  className = '',
  title,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const displayLabel = label || t('employees.launch_qr_kiosk', 'Company Entrance QR')
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title || displayLabel}
      className={`h-10 inline-flex items-center justify-center gap-2 px-3.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 text-xs sm:text-[13px] font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : icon || <QrCode size={15} />}
      <span>{displayLabel}</span>
    </button>
  )
}

/**
 * Standard Save / Update Form Action Button (e.g. "Save", "Save Changes")
 */
export interface SaveButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  type?: 'submit' | 'button'
  label?: string
  isEdit?: boolean
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  type = 'submit',
  label,
  isEdit = false,
  loading = false,
  disabled = false,
  icon,
  className = '',
}) => {
  const { t } = useTranslation(['common'])
  const displayLabel = label || (isEdit ? t('common.saveChanges', 'Save Changes') : t('common.save', 'Save'))
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`h-10 inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-[13px] font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer active:scale-95 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon || <Check size={14} strokeWidth={2.5} />}
      <span>{displayLabel}</span>
    </button>
  )
}

/**
 * Standard Cancel Form Action Button (e.g. "Cancel")
 */
export interface CancelButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: string
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

export const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  label,
  icon,
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation(['common'])
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-10 inline-flex items-center justify-center gap-1.5 px-4 rounded-xl border border-border/80 dark:border-slate-700 bg-muted/60 hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-[13px] font-bold text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer active:scale-95 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon}
      <span>{label || t('common.cancel', 'Cancel')}</span>
    </button>
  )
}

/**
 * Standard Filter Button (e.g. "Filter")
 */
export interface FilterButtonProps {
  onClick: (e?: React.MouseEvent) => void
  isActive?: boolean
  activeCount?: number
  label?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  isActive = false,
  activeCount,
  label,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const displayLabel = label || t('common.filter', 'Filter')
  const hasActive = isActive || (activeCount !== undefined && activeCount > 0)

  const heightClass =
    size === 'sm'
      ? 'h-8 min-h-[32px] px-2.5 text-xs'
      : size === 'lg'
      ? 'h-12 min-h-[48px] px-4 text-sm'
      : 'h-10 min-h-[40px] px-3.5 text-xs sm:text-[13px]'

  const radiusClass = size === 'sm' ? 'rounded-lg' : 'rounded-xl'
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 ${heightClass} ${radiusClass} font-medium border transition-all duration-200 shadow-xs hover:shadow active:scale-[0.98] cursor-pointer select-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
        hasActive
          ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
          : 'border-border/80 bg-background hover:bg-muted text-foreground'
      } ${className}`}
    >
      <Filter size={iconSize} className={hasActive ? 'text-primary' : 'text-muted-foreground'} />
      <span>{displayLabel}</span>
      {activeCount !== undefined && activeCount > 0 ? (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs">
          {activeCount}
        </span>
      ) : hasActive ? (
        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      ) : null}
    </button>
  )
}

/**
 * Standard Refresh Action Button (e.g. "Refresh")
 */
export interface RefreshButtonProps {
  onClick: (e?: React.MouseEvent) => void
  loading?: boolean
  disabled?: boolean
  title?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  title,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const sizeClasses =
    size === 'sm'
      ? 'h-8 w-8 min-h-[32px] min-w-[32px] rounded-lg'
      : size === 'lg'
      ? 'h-12 w-12 min-h-[48px] min-w-[48px] rounded-xl'
      : 'h-10 w-10 min-h-[40px] min-w-[40px] rounded-xl'
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title || t('common.refresh', 'Refresh')}
      className={`${sizeClasses} flex items-center justify-center text-muted-foreground hover:text-foreground border border-border/80 bg-background hover:bg-muted transition-all duration-200 shadow-xs hover:shadow active:scale-[0.98] cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <RefreshCw size={iconSize} className={loading ? 'animate-spin' : ''} />
    </button>
  )
}

/**
 * Standard Reset Action Button (e.g. "Reset", "កំណត់ឡើងវិញ")
 */
export interface ResetButtonProps {
  onClick?: (e?: React.MouseEvent) => void
  label?: string
  iconOnly?: boolean
  disabled?: boolean
  className?: string
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ResetButton: React.FC<ResetButtonProps> = ({
  onClick,
  label,
  iconOnly = false,
  disabled = false,
  className = '',
  title,
  size = 'md',
}) => {
  const { t } = useTranslation(['common', 'buttons'])
  const displayLabel = label
    ? label.includes('.')
      ? t(label, { defaultValue: label })
      : label
    : t('common.reset', 'Reset')

  const heightClass =
    size === 'sm'
      ? 'h-8 min-h-[32px] text-xs'
      : size === 'lg'
      ? 'h-12 min-h-[48px] text-sm'
      : 'h-10 min-h-[40px] text-xs sm:text-[13px]'

  const paddingClass = iconOnly
    ? size === 'sm'
      ? 'w-8 min-w-[32px] px-0'
      : size === 'lg'
      ? 'w-12 min-w-[48px] px-0'
      : 'w-10 min-w-[40px] px-0'
    : size === 'sm'
    ? 'px-2.5'
    : size === 'lg'
    ? 'px-4'
    : 'px-3.5'

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14
  const radiusClass = size === 'sm' ? 'rounded-lg' : 'rounded-xl'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title || displayLabel}
      aria-label={displayLabel}
      className={`group inline-flex items-center justify-center gap-1.5 ${heightClass} ${paddingClass} ${radiusClass} font-medium text-foreground border border-border/80 bg-background hover:bg-muted transition-all duration-200 shadow-xs hover:shadow active:scale-[0.98] cursor-pointer select-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <RotateCcw
        size={iconSize}
        className="text-muted-foreground group-hover:text-foreground group-hover:-rotate-90 transition-transform duration-300 ease-out shrink-0"
      />
      {!iconOnly && <span>{displayLabel}</span>}
    </button>
  )
}

export default {
  HeaderActionsGroup,
  AddButton,
  ActionButton,
  SecondaryButton,
  ExportButton,
  ImportButton,
  QrKioskButton,
  SaveButton,
  CancelButton,
  FilterButton,
  RefreshButton,
  ResetButton,
}

