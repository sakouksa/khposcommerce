import React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Download, Upload, QrCode, Check, Loader2, RefreshCw, Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  <div className={cn('flex items-center flex-wrap gap-2 sm:gap-2.5 w-full xl:w-auto xl:justify-end shrink-0', className)}>
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
  const stringTitle = typeof title === 'string' ? title : typeof content === 'string' ? content : undefined

  return (
    <Button
      type={type}
      variant="default"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled || loading}
      title={stringTitle}
      onClick={onClick}
      className={cn('font-semibold shadow-xs transition-all active:scale-[0.98] select-none', className)}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} />
      ) : (
        icon || <Plus className={cn(size === 'sm' ? 'size-3.5' : 'size-4')} strokeWidth={2.5} />
      )}
      {content && <span>{content}</span>}
    </Button>
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
  const stringTitle = typeof title === 'string' ? title : typeof content === 'string' ? content : undefined

  const variantMap: Record<string, any> = {
    outline: 'outline',
    secondary: 'secondary',
    soft: 'soft',
    primary: 'default',
    emerald: 'emerald',
    success: 'success',
    danger: 'destructive',
    warning: 'warning',
  }

  return (
    <Button
      type={type}
      variant={variantMap[variant] || 'outline'}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled || loading}
      title={stringTitle}
      onClick={onClick}
      className={cn(
        'font-semibold transition-all active:scale-[0.98] select-none',
        variant === 'outline' && 'border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 text-foreground dark:text-slate-100 hover:bg-muted/80 dark:hover:bg-slate-700',
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} />
      ) : (
        icon
      )}
      {content && <span>{content}</span>}
    </Button>
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

  const iconClass =
    variant === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-emerald-600 dark:text-emerald-400'

  return (
    <Button
      type="button"
      variant={variant === 'emerald' ? 'soft' : variant === 'secondary' ? 'secondary' : 'outline'}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled || loading}
      title={title || displayLabel}
      onClick={onClick}
      className={cn(
        'font-semibold transition-all active:scale-[0.98] shrink-0 select-none shadow-2xs hover:shadow-xs',
        'border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/90 text-foreground dark:text-slate-100 hover:bg-muted/80 dark:hover:bg-slate-700',
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} />
      ) : (
        icon || <Download className={cn(size === 'sm' ? 'size-3.5' : 'size-4', iconClass)} />
      )}
      <span>{displayLabel}</span>
    </Button>
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

  return (
    <Button
      type="button"
      variant="outline"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled || loading}
      title={title || displayLabel}
      onClick={onClick}
      className={cn(
        'font-semibold transition-all active:scale-[0.98] shrink-0 select-none shadow-2xs hover:shadow-xs',
        'border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/90 text-foreground dark:text-slate-100 hover:bg-muted/80 dark:hover:bg-slate-700',
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'size-3.5' : 'size-4')} />
      ) : (
        icon || <Upload className={cn(size === 'sm' ? 'size-3.5' : 'size-4', 'text-blue-600 dark:text-blue-400')} />
      )}
      <span>{displayLabel}</span>
    </Button>
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
    <Button
      type="button"
      variant="outline"
      size="md"
      disabled={disabled || loading}
      title={title || displayLabel}
      onClick={onClick}
      className={cn(
        'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border-purple-500/20 font-semibold active:scale-[0.98]',
        className
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon || <QrCode className="size-4" />}
      <span>{displayLabel}</span>
    </Button>
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
    <Button
      type={type}
      variant="default"
      size="md"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn('font-bold shadow-xs hover:shadow active:scale-95 transition-all', className)}
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : icon || <Check className="size-3.5" strokeWidth={2.5} />}
      <span>{displayLabel}</span>
    </Button>
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
    <Button
      type="button"
      variant="secondary"
      size="md"
      disabled={disabled}
      onClick={onClick}
      className={cn('font-semibold active:scale-95 text-muted-foreground hover:text-foreground', className)}
    >
      {icon}
      <span>{label || t('common.cancel', 'Cancel')}</span>
    </Button>
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

  return (
    <Button
      type="button"
      variant={hasActive ? 'soft' : 'outline'}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'font-medium transition-all active:scale-[0.98] select-none shrink-0 shadow-2xs',
        hasActive
          ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20 dark:border-primary/50 dark:text-primary-foreground'
          : 'border-border/80 dark:border-slate-700/80 bg-card dark:bg-slate-800/80 text-foreground dark:text-slate-200 hover:bg-muted/80 dark:hover:bg-slate-700 dark:hover:text-white',
        className
      )}
    >
      <Filter
        className={cn(
          size === 'sm' ? 'size-3' : size === 'lg' ? 'size-4' : 'size-3.5',
          hasActive ? 'text-primary dark:text-primary-foreground' : 'text-muted-foreground dark:text-slate-400'
        )}
      />
      <span>{displayLabel}</span>
      {activeCount !== undefined && activeCount > 0 ? (
        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs">
          {activeCount}
        </span>
      ) : hasActive ? (
        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      ) : null}
    </Button>
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

  return (
    <Button
      type="button"
      variant="outline"
      size={size === 'sm' ? 'icon-sm' : size === 'lg' ? 'lg' : 'icon'}
      disabled={disabled || loading}
      title={title || t('common.refresh', 'Refresh')}
      onClick={onClick}
      className={cn(
        'shrink-0 active:scale-[0.98] shadow-2xs',
        'border-border/80 dark:border-slate-700/80 bg-card dark:bg-slate-800/80 text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted/80 dark:hover:bg-slate-700',
        className
      )}
    >
      <RefreshCw
        className={cn(
          size === 'sm' ? 'size-3' : size === 'lg' ? 'size-4' : 'size-3.5',
          loading && 'animate-spin'
        )}
      />
    </Button>
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

  return (
    <Button
      type="button"
      variant="outline"
      size={iconOnly ? (size === 'sm' ? 'icon-sm' : 'icon') : size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      disabled={disabled}
      title={title || displayLabel}
      aria-label={displayLabel}
      onClick={onClick}
      className={cn(
        'group font-medium transition-all active:scale-[0.98] select-none shrink-0 shadow-2xs',
        'border-border/80 dark:border-slate-700/80 bg-card dark:bg-slate-800/80 text-foreground dark:text-slate-200 hover:bg-muted/80 dark:hover:bg-slate-700 dark:hover:text-white',
        className
      )}
    >
      <RotateCcw
        className={cn(
          'text-muted-foreground dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-white group-hover:-rotate-90 transition-transform duration-300 ease-out shrink-0',
          size === 'sm' ? 'size-3' : size === 'lg' ? 'size-4' : 'size-3.5'
        )}
      />
      {!iconOnly && <span>{displayLabel}</span>}
    </Button>
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
