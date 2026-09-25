import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Edit2, Trash2, Eye, Printer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

const TableActionMenu: React.FC<TableActionMenuProps> = ({
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
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({})

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

  const updatePosition = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const openUpward = spaceBelow < 180 && rect.top > spaceBelow

    if (openUpward) {
      setCoords({
        bottom: window.innerHeight - rect.top + 4,
        right: align === 'right' ? window.innerWidth - rect.right : undefined,
        left: align === 'left' ? rect.left : undefined,
      })
    } else {
      setCoords({
        top: rect.bottom + 4,
        right: align === 'right' ? window.innerWidth - rect.right : undefined,
        left: align === 'left' ? rect.left : undefined,
      })
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOpen) {
      updatePosition()
    }
    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => {
      setIsOpen(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen])

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

    // Flatten-inspired modern styling: Crisp borders, soft tinted hovers, shadow-2xs
    let colorClasses =
      'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-700 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50/70 dark:hover:bg-cyan-950/40'

    if (isDanger) {
      colorClasses =
        'border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:border-rose-300 dark:hover:border-rose-700'
    } else if (isWarning) {
      colorClasses =
        'border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700'
    } else if (isSuccess) {
      colorClasses =
        'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700'
    } else if (itemVariant === 'primary' || itemVariant === 'info') {
      colorClasses =
        'border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/80 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 hover:border-cyan-300 dark:hover:border-cyan-700'
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
        className={`inline-flex items-center justify-center border transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses} ${colorClasses}`}
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
        className={`inline-flex items-center justify-end gap-1.5 ${className}`}
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
      className={`inline-flex items-center justify-end gap-1.5 text-left ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* If hybrid, render the primary items directly inline */}
      {inlineItems.map((item, idx) => renderInlineButton(item, idx))}

      {/* Render 3-dots trigger button if there are items for the dropdown */}
      {dropdownItems.length > 0 && (
        <div className="relative inline-block">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20 active:scale-95"
            aria-label="Actions menu"
            title={t('common.actions', 'More Actions')}
          >
            <MoreVertical size={triggerSize} />
          </button>

          {isOpen &&
            createPortal(
              <AnimatePresence>
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  style={{
                    position: 'fixed',
                    top: coords.top !== undefined ? `${coords.top}px` : 'auto',
                    bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
                    left: coords.left !== undefined ? `${coords.left}px` : 'auto',
                    right: coords.right !== undefined ? `${coords.right}px` : 'auto',
                    zIndex: 99999,
                  }}
                  className="min-w-[160px] w-max max-w-[260px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xl p-1.5 space-y-0.5"
                >
                  {dropdownItems.map((item, idx) => {
                    const Icon = item.icon as any
                    const itemVariant = resolveItemVariant(item)
                    const isDanger = itemVariant === 'danger'

                    let colorClasses = 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    if (isDanger) {
                      colorClasses =
                        'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    } else if (itemVariant === 'success') {
                      colorClasses =
                        'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    } else if (itemVariant === 'warning') {
                      colorClasses =
                        'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    } else if (itemVariant === 'primary' || itemVariant === 'info') {
                      colorClasses =
                        'text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40'
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={item.disabled}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsOpen(false)
                          item.onClick()
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left disabled:opacity-40 disabled:cursor-not-allowed ${colorClasses}`}
                      >
                        {React.isValidElement(item.icon) ? (
                          item.icon
                        ) : Icon ? (
                          <Icon size={14} className="shrink-0" />
                        ) : null}
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
        </div>
      )}
    </div>
  )
}

export default TableActionMenu
