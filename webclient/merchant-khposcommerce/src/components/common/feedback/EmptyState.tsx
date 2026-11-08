import React from 'react'
import { Inbox, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>
}

export interface EmptyStateProps {
  /**
   * Number of columns when rendered inside a <tbody> (generates <tr><td colSpan={cols}>).
   * If omitted or undefined, renders as a standard <div> block container.
   */
  cols?: number

  /** Primary title. Supports string or custom ReactNode. */
  title?: React.ReactNode

  /** Legacy / alternate prop for title (for backward compatibility with existing usages). */
  message?: React.ReactNode

  /**
   * Secondary guidance or descriptive text (e.g. "Create a new record or adjust filter criteria").
   * Supports string or custom ReactNode.
   */
  description?: React.ReactNode

  /**
   * Custom icon element or Lucide component. Defaults to a clean, subtle stroke-1 icon matching the
   * Leave Requests (ច្បាប់ឈប់សម្រាក) visual format.
   */
  icon?: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>

  /** Optional action button or custom action node */
  action?: EmptyStateAction | React.ReactNode

  /** Convenience prop for action button label */
  actionLabel?: string

  /** Convenience prop for action button click handler */
  onAction?: () => void

  /** Optional icon for action button */
  actionIcon?: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>

  /** Optional extra container class name */
  className?: string

  /** Vertical padding class (default: 'py-12') */
  py?: string

  /** Optional extra child content */
  children?: React.ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

export const EmptyState: React.FC<EmptyStateProps> = ({
  cols,
  title,
  message,
  description,
  icon,
  action,
  actionLabel,
  onAction,
  actionIcon,
  className,
  py = 'py-12',
  children,
}) => {
  const { t } = useTranslation(['empty', 'common'])

  // Resolve title
  const resolvedTitle =
    title ??
    message ??
    t('empty.noData', t('common.noData', 'No data found'))

  // Resolve description
  const resolvedDesc =
    description !== undefined
      ? description
      : title === undefined && message === undefined
        ? t('empty.noDataDesc', t('common.noDataDesc', 'There are no records to display, or adjust your search and filters.'))
        : t('empty.noRecordDesc', t('common.noRecordsDesc', 'Create a new record or adjust filter criteria to get started.'))

  // Resolve icon safely (handling React elements, forwardRef components, functions, strings)
  let renderedIcon: React.ReactNode = null
  if (React.isValidElement(icon)) {
    renderedIcon = icon
  } else if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && ('$$typeof' in icon || 'render' in icon))
  ) {
    const IconComp = icon as React.ComponentType<{ size?: number; className?: string }>
    renderedIcon = <IconComp size={32} className="text-muted-foreground/50 stroke-1" />
  } else if (typeof icon === 'string') {
    renderedIcon = <span className="text-2xl">{icon}</span>
  } else if (icon) {
    renderedIcon = icon as React.ReactNode
  } else {
    renderedIcon = <Inbox size={32} className="text-muted-foreground/50 stroke-1" />
  }

  // Resolve action button
  const resolvedAction = action ?? (
    actionLabel && onAction
      ? {
          label: actionLabel,
          onClick: onAction,
          icon: actionIcon,
        }
      : undefined
  )

  const content = (
    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
      {renderedIcon}

      {resolvedTitle && (
        <p className="text-sm font-medium text-foreground/85">
          {resolvedTitle}
        </p>
      )}

      {resolvedDesc && (
        <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-sm">
          {resolvedDesc}
        </p>
      )}

      {/* Action Button */}
      {resolvedAction && (
        <div className="mt-1 pt-1">
          {React.isValidElement(resolvedAction) ? (
            resolvedAction
          ) : typeof resolvedAction === 'object' && 'label' in resolvedAction && 'onClick' in resolvedAction ? (
            <button
              type="button"
              onClick={(resolvedAction as EmptyStateAction).onClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted text-xs font-medium text-foreground shadow-2xs transition-colors"
            >
              {(() => {
                const actIcon = (resolvedAction as EmptyStateAction).icon
                if (React.isValidElement(actIcon)) return actIcon
                if (typeof actIcon === 'function' || (typeof actIcon === 'object' && actIcon !== null && ('$$typeof' in actIcon || 'render' in actIcon))) {
                  const ActIconComp = actIcon as React.ComponentType<{ size?: number; className?: string }>
                  return <ActIconComp size={14} />
                }
                return <Plus size={14} />
              })()}
              {(resolvedAction as EmptyStateAction).label}
            </button>
          ) : null}
        </div>
      )}

      {children}
    </div>
  )

  // If cols is specified, render as a <tr><td colSpan={cols}> for table bodies
  if (cols !== undefined) {
    return (
      <tr>
        <td
          colSpan={cols}
          className={clsx(py, 'px-4 text-center text-muted-foreground w-full', className)}
        >
          {content}
        </td>
      </tr>
    )
  }

  // Standalone container mode for cards, lists, grids, or non-table pages
  return (
    <div
      className={clsx(py, 'px-4 text-center text-muted-foreground w-full', className)}
    >
      {content}
    </div>
  )
}

export const TableEmptyState = EmptyState

export default EmptyState
