import React from 'react'
import { MoreVertical, Edit2, Trash2, Eye, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type TableActionVariant =
  | 'default'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'print'
  | 'primary'
  | 'edit'

export interface TableActionItem {
  label: string
  icon?: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode
  onClick: () => void
  variant?: TableActionVariant
  disabled?: boolean
  hidden?: boolean
}

export interface TableActionMenuProps {
  items?: TableActionItem[]
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onPrint?: () => void
  editLabel?: string
  deleteLabel?: string
  viewLabel?: string
  printLabel?: string
  align?: 'right' | 'left'
  className?: string
  triggerSize?: number
  /**
   * Presentation variant:
   * - 'dropdown': 3-dots popup menu (default, best for 4+ actions like Products)
   * - 'inline': Direct square icon buttons side-by-side (best for 1-3 actions like Sales/Orders)
   * - 'hybrid': Shows top N actions inline, remaining actions in a 3-dots dropdown
   */
  variant?: 'dropdown' | 'inline' | 'hybrid'
  /** Max items shown inline when using 'hybrid' variant (default: 2) */
  maxInline?: number
  /** Button sizing for inline mode (default: 'md') */
  buttonSize?: 'sm' | 'md'
}

export const TableActionMenu: React.FC<TableActionMenuProps> = ({
  items,
  onEdit,
  onDelete,
  onView,
  onPrint,
  editLabel,
  deleteLabel,
  viewLabel,
  printLabel,
  align = 'right',
  className = '',
  triggerSize = 16,
  variant = 'dropdown',
  maxInline = 2,
  buttonSize = 'md',
}) => {
  const { t } = useTranslation(['common', 'buttons', 'inventory', 'purchases'])

  const getViewText = () => {
    if (viewLabel) return viewLabel
    const val = t('view', '')
    if (val && val !== 'view' && val !== 'common.view') return val
    const valCommon = t('common.view', '')
    if (valCommon && valCommon !== 'common.view' && valCommon !== 'view') return valCommon
    return 'View'
  }

  const getPrintText = () => {
    if (printLabel) return printLabel
    const val = t('print', '')
    if (val && val !== 'print' && val !== 'common.print') return val
    const valCommon = t('common.print', '')
    if (valCommon && valCommon !== 'common.print' && valCommon !== 'print') return valCommon
    return 'Print'
  }

  const getEditText = () => {
    if (editLabel) return editLabel
    const val = t('edit', '')
    if (val && val !== 'edit' && val !== 'common.edit') return val
    const valCommon = t('common.edit', '')
    if (valCommon && valCommon !== 'common.edit' && valCommon !== 'edit') return valCommon
    return 'Edit'
  }

  const getDeleteText = () => {
    if (deleteLabel) return deleteLabel
    const val = t('delete', '')
    if (val && val !== 'delete' && val !== 'common.delete') return val
    const valCommon = t('common.delete', '')
    if (valCommon && valCommon !== 'common.delete' && valCommon !== 'delete') return valCommon
    return 'Delete'
  }

  const resolvedEditLabel = getEditText()
  const resolvedDeleteLabel = getDeleteText()
  const resolvedViewLabel = getViewText()
  const resolvedPrintLabel = getPrintText()

  // Build items array if custom list not passed directly or merge quick props
  const finalItems: TableActionItem[] = [...(items || [])]

  if (onView && !finalItems.some((i) => i.label === resolvedViewLabel)) {
    finalItems.unshift({
      label: resolvedViewLabel,
      icon: Eye,
      onClick: onView,
      variant: 'default',
    })
  }

  if (onPrint && !finalItems.some((i) => i.label === resolvedPrintLabel)) {
    const viewIdx = finalItems.findIndex((i) => i.label === resolvedViewLabel)
    const insertIdx = viewIdx >= 0 ? viewIdx + 1 : 0
    finalItems.splice(insertIdx, 0, {
      label: resolvedPrintLabel,
      icon: Printer,
      onClick: onPrint,
      variant: 'default',
    })
  }

  if (onEdit && !finalItems.some((i) => i.label === resolvedEditLabel)) {
    const lastNonDangerIdx = finalItems.findLastIndex((i) => i.variant !== 'danger')
    const insertIdx = lastNonDangerIdx >= 0 ? lastNonDangerIdx + 1 : 0
    finalItems.splice(insertIdx, 0, {
      label: resolvedEditLabel,
      icon: Edit2,
      onClick: onEdit,
      variant: 'default',
    })
  }

  if (onDelete && !finalItems.some((i) => i.label === resolvedDeleteLabel)) {
    finalItems.push({
      label: resolvedDeleteLabel,
      icon: Trash2,
      onClick: onDelete,
      variant: 'danger',
    })
  }

  const resolveItemVariant = (item: TableActionItem): TableActionVariant => {
    if (item.variant && item.variant !== 'default') {
      return item.variant
    }
    // Auto-detect only dangerous/delete actions
    if (item.icon === Trash2 || /delete|remove|លុប/i.test(item.label)) return 'danger'
    return 'default'
  }

  const visibleItems = finalItems.filter((item) => !item.hidden)

  if (visibleItems.length === 0) return null

  // Render an individual inline icon button
  const renderInlineButton = (item: TableActionItem, idx: number) => {
    const Icon = item.icon as any
    const itemVariant = resolveItemVariant(item)
    const isDanger = itemVariant === 'danger'
    const isWarning = itemVariant === 'warning'
    const isSuccess = itemVariant === 'success'

    // Modern clean enterprise styling
    let colorClasses =
      'border-border/80 bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground'

    if (isDanger) {
      colorClasses =
        'border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/50'
    } else if (isWarning) {
      colorClasses =
        'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50'
    } else if (isSuccess) {
      colorClasses =
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50'
    } else if (itemVariant === 'primary' || itemVariant === 'info') {
      colorClasses =
        'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50'
    }

    const sizeClasses =
      buttonSize === 'sm' ? 'h-7 w-7 rounded-lg' : 'h-8 w-8 rounded-lg'
    const iconDimension = buttonSize === 'sm' ? 13 : 14

    return (
      <button
        key={idx}
        type="button"
        disabled={item.disabled}
        title={item.label}
        aria-label={item.label}
        onClick={(e) => {
          e.stopPropagation()
          item.onClick()
        }}
        className={cn(
          'inline-flex items-center justify-center border transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          sizeClasses,
          colorClasses
        )}
      >
        {React.isValidElement(item.icon) ? (
          item.icon
        ) : Icon ? (
          <Icon size={iconDimension} className="shrink-0" />
        ) : null}
      </button>
    )
  }

  // MODE 1: INLINE (Clean icon buttons in a row)
  if (variant === 'inline') {
    return (
      <div
        className={cn('inline-flex items-center justify-end gap-1.5', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {visibleItems.map((item, idx) => renderInlineButton(item, idx))}
      </div>
    )
  }

  // MODE 2 & 3: DROPDOWN OR HYBRID
  const inlineItems = variant === 'hybrid' ? visibleItems.slice(0, maxInline) : []
  const dropdownItems = variant === 'hybrid' ? visibleItems.slice(maxInline) : visibleItems

  return (
    <div
      className={cn('inline-flex items-center justify-end gap-1.5 text-left', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* If hybrid, render the primary items directly inline */}
      {inlineItems.map((item, idx) => renderInlineButton(item, idx))}

      {/* Render 3-dots trigger button via shadcn DropdownMenu */}
      {dropdownItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-border/80 bg-background hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/40 active:scale-95"
              aria-label="Actions menu"
              title={t('common.actions', 'More Actions')}
            >
              <MoreVertical size={triggerSize} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={align === 'left' ? 'start' : 'end'}
            className="w-48 p-1.5 space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {dropdownItems.map((item, idx) => {
              const Icon = item.icon as any
              const itemVariant = resolveItemVariant(item)
              const isDanger = itemVariant === 'danger'

              return (
                <DropdownMenuItem
                  key={idx}
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    item.onClick()
                  }}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-semibold cursor-pointer rounded-lg',
                    isDanger && 'text-destructive focus:bg-destructive/10 focus:text-destructive',
                    itemVariant === 'success' && 'text-emerald-600 dark:text-emerald-400 focus:bg-emerald-500/10',
                    itemVariant === 'warning' && 'text-amber-600 dark:text-amber-400 focus:bg-amber-500/10',
                    (itemVariant === 'primary' || itemVariant === 'info') && 'text-primary focus:bg-primary/10'
                  )}
                >
                  {React.isValidElement(item.icon) ? (
                    item.icon
                  ) : Icon ? (
                    <Icon size={14} className="shrink-0" />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export default TableActionMenu
