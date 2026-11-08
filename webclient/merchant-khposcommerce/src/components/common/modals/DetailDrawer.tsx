import React from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Copy, Check } from 'lucide-react'
import CloseButton from '../buttons/CloseButton'
import { CancelButton } from '../buttons/GlobalActionButtons'
import {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetContent,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type DetailDrawerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'

export type DetailDrawerIconVariant =
  | 'primary'
  | 'emerald'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'slate'

export interface DetailDrawerProps {
  /** Controls open/close state */
  isOpen?: boolean
  open?: boolean
  /** Close callback */
  onClose: () => void
  /** Size preset */
  size?: DetailDrawerSize
  /** Drawer contents (Header, Tabs, Body, Footer) */
  children: React.ReactNode
  /** Custom wrapper class */
  className?: string
  /** Whether to render via React Portal (default: true) */
  usePortal?: boolean
  /** Close on Escape key (default: true) */
  closeOnEsc?: boolean
  /** Close on backdrop click (default: true) */
  closeOnBackdropClick?: boolean
}

export interface DetailDrawerHeaderProps {
  /** Main title */
  title: React.ReactNode
  /** Subtitle or breadcrumb metadata */
  subtitle?: React.ReactNode
  /** Leading icon */
  icon?: React.ReactNode
  /** Icon badge background variant */
  iconVariant?: DetailDrawerIconVariant
  /** Optional ID badge, status tag, or pill */
  badge?: React.ReactNode
  /** Top action buttons (e.g. Print, Export, Copy) placed before close */
  actions?: React.ReactNode
  /** Close callback — renders standard CloseButton if provided */
  onClose?: () => void
  /** Custom class for header */
  className?: string
}

export interface DetailDrawerTabItem {
  key: string
  label: React.ReactNode
  icon?: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode
  badge?: number | string
  disabled?: boolean
}

export interface DetailDrawerTabNavProps {
  tabs: DetailDrawerTabItem[]
  activeTab: string
  onChange?: (key: any) => void
  onTabChange?: (key: any) => void
  className?: string
}

export interface DetailDrawerBodyProps {
  children: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  className?: string
}

export interface DetailDrawerFooterProps {
  /** Optional Close button handler (renders standard CancelButton on left) */
  onClose?: () => void
  /** Custom label for close button */
  closeLabel?: string
  /** Left-aligned actions (e.g. Delete, Print, Copy Link) */
  leftActions?: React.ReactNode
  /** Right-aligned actions (e.g. Edit, Duplicate, Save) */
  rightActions?: React.ReactNode
  /** Custom full footer content */
  children?: React.ReactNode
  /** Custom class for footer */
  className?: string
}

export interface DetailDrawerCardProps {
  title?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

export interface DetailDrawerRowProps {
  label: React.ReactNode
  value: React.ReactNode
  icon?: React.ReactNode
  copyable?: boolean
  copyText?: string
  className?: string
}

// ─── STYLES & CONSTANTS ──────────────────────────────────────────────────────

const sizeStyles: Record<DetailDrawerSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  full: 'sm:max-w-5xl',
}

export const iconVariantStyles: Record<DetailDrawerIconVariant, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  slate: 'bg-muted text-muted-foreground border-border/80',
}

// ─── 1. ROOT DETAIL DRAWER CONTAINER (SHADCN SHEET COMPATIBLE) ───────────────

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  open,
  onClose,
  size = 'xl',
  children,
  className = '',
  closeOnEsc = true,
  closeOnBackdropClick = true,
}) => {
  const isVisible = isOpen ?? open ?? false

  return (
    <Sheet
      open={isVisible}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <SheetPortal>
        <SheetOverlay className={closeOnBackdropClick ? 'cursor-pointer' : ''} />
        <SheetContent
          side="right"
          showClose={false}
          className={cn(
            'p-0 w-full overflow-hidden flex flex-col h-full bg-card border-l border-border/80 shadow-2xl',
            sizeStyles[size] || sizeStyles.xl,
            className
          )}
          onEscapeKeyDown={(e) => {
            if (!closeOnEsc) e.preventDefault()
          }}
          onPointerDownOutside={(e) => {
            if (!closeOnBackdropClick) e.preventDefault()
          }}
        >
          {children}
        </SheetContent>
      </SheetPortal>
    </Sheet>
  )
}

// ─── 2. DETAIL DRAWER HEADER ─────────────────────────────────────────────────

export const DetailDrawerHeader: React.FC<DetailDrawerHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconVariant = 'primary',
  badge,
  actions,
  onClose,
  className = '',
}) => {
  return (
    <div className={cn("px-5 sm:px-6 py-4 border-b border-border/80 bg-card/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20 print:hidden", className)}>
      {/* Left: Icon & Title & Badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        {icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs", iconVariantStyles[iconVariant] || iconVariantStyles.primary)}>
            {React.isValidElement(icon) ? icon : React.createElement(icon as any, { size: 18 })}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate leading-tight">
              {title}
            </h3>
            {badge && (
              <div className="shrink-0">
                {badge}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions & Close Button */}
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {onClose && (
          <CloseButton onClose={onClose} size="md" color="rose" />
        )}
      </div>
    </div>
  )
}

// ─── 3. DETAIL DRAWER TAB NAVIGATION ─────────────────────────────────────────

export const DetailDrawerTabNav: React.FC<DetailDrawerTabNavProps> = ({
  tabs,
  activeTab,
  onChange,
  onTabChange,
  className = '',
}) => {
  const handleSelect = (key: any) => {
    if (onChange) onChange(key)
    else if (onTabChange) onTabChange(key)
  }

  return (
    <div className={cn("flex items-center gap-2 px-6 border-b border-border/80 bg-muted/20 overflow-x-auto no-scrollbar shrink-0 z-10 print:hidden", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        const IconComponent = tab.icon

        return (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => handleSelect(tab.key)}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isActive
                ? 'border-primary text-primary dark:text-primary-foreground dark:border-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {IconComponent && (
              React.isValidElement(IconComponent) ? (
                IconComponent
              ) : (
                React.createElement(IconComponent as any, { size: 15 })
              )
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── 4. DETAIL DRAWER BODY ───────────────────────────────────────────────────

export const DetailDrawerBody: React.FC<DetailDrawerBodyProps> = ({
  children,
  isLoading = false,
  loadingText,
  className = '',
}) => {
  const { t } = useTranslation(['common'])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">
          {loadingText || t('common.loading', 'Loading details...')}
        </p>
      </div>
    )
  }

  return (
    <div className={cn("flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar", className)}>
      {children}
    </div>
  )
}

// ─── 5. DETAIL DRAWER FOOTER ─────────────────────────────────────────────────

export const DetailDrawerFooter: React.FC<DetailDrawerFooterProps> = ({
  onClose,
  closeLabel,
  leftActions,
  rightActions,
  children,
  className = '',
}) => {
  const { t } = useTranslation(['common'])

  if (children) {
    return (
      <div className={cn("px-6 py-4 border-t border-border/80 bg-card/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20 print:hidden", className)}>
        {children}
      </div>
    )
  }

  const hasLeft = Boolean(onClose || leftActions)

  return (
    <div className={cn("px-6 py-4 border-t border-border/80 bg-card/95 backdrop-blur-md flex items-center gap-3 shrink-0 z-20 print:hidden", hasLeft ? 'justify-between' : 'justify-end', className)}>
      {/* Left Area: Close Button and/or Left Actions */}
      {hasLeft && (
        <div className="flex items-center gap-2">
          {onClose && (
            <CancelButton onClick={onClose} label={closeLabel || t('common.close', 'Close')} />
          )}
          {leftActions}
        </div>
      )}

      {/* Right Area: Primary/Secondary Action Buttons */}
      {rightActions && (
        <div className="flex items-center gap-2">
          {rightActions}
        </div>
      )}
    </div>
  )
}

// ─── 6. DETAIL DRAWER CARD (ERP SECTION CARD) ────────────────────────────────

export const DetailDrawerCard: React.FC<DetailDrawerCardProps> = ({
  title,
  icon,
  badge,
  action,
  children,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={cn("p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/70 shadow-2xs space-y-3.5", className)}>
      {(title || icon || action || badge) && (
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            {title && (
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {title}
              </h4>
            )}
            {badge}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  )
}

// ─── 7. DETAIL DRAWER ROW (METADATA KEY-VALUE) ───────────────────────────────

export const DetailDrawerRow: React.FC<DetailDrawerRowProps> = ({
  label,
  value,
  icon,
  copyable = false,
  copyText,
  className = '',
}) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    const textToCopy = copyText || (typeof value === 'string' ? value : '')
    if (!textToCopy) return
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("flex items-center justify-between py-2 border-b border-border/40 last:border-0 text-xs gap-3", className)}>
      <span className="text-muted-foreground font-medium flex items-center gap-1.5 shrink-0">
        {icon && <span className="text-muted-foreground/70">{icon}</span>}
        <span>{label}</span>
      </span>
      <div className="flex items-center gap-1.5 text-right font-semibold text-foreground truncate">
        <span className="truncate">{value ?? '—'}</span>
        {copyable && value && (
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            title="Copy"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default DetailDrawer
