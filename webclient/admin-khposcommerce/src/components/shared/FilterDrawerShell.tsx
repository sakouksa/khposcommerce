import React from 'react'
import { useTranslation } from 'react-i18next'
import { CloseButton, ResetButton, ActionButton } from '@/components/common'
import { ListFilter } from 'lucide-react'
import {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetContent,
} from '@/components/ui/sheet'

export interface FilterDrawerShellProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  title: string
  subtitle?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  activeCount?: number
  activeFilterCount?: number
  children: React.ReactNode
  applyLabel?: string
  resetLabel?: string
  className?: string
  onApply?: () => void
}

/**
 * Global Standard Filter Section Divider with Title & Optional Icon
 */
export const FilterSection: React.FC<{
  title: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}> = ({ title, icon, children, className = '' }) => (
  <div className={`space-y-3 pt-3.5 first:pt-0 border-t border-border/60 first:border-0 ${className}`}>
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
      {icon && <span className="text-primary/70">{icon}</span>}
      <span>{title}</span>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
)

/**
 * Global Standard Filter Field Container with Label
 */
export const FilterField: React.FC<{
  label: React.ReactNode
  children: React.ReactNode
  className?: string
}> = ({ label, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
)

export const FilterDrawerShell: React.FC<FilterDrawerShellProps> = ({
  isOpen,
  onClose,
  onReset,
  title,
  subtitle,
  description,
  icon,
  activeCount = 0,
  activeFilterCount,
  children,
  applyLabel,
  resetLabel,
  onApply,
}) => {
  const { t } = useTranslation(['common', 'buttons', 'forms'])

  const resolvedSubtitle = subtitle ?? description
  const resolvedActiveCount = activeCount || (activeFilterCount ?? 0)
  const resolvedApplyLabel = applyLabel ?? t('common.applyFilters', t('buttons.apply', 'Apply Filters'))
  const resolvedResetLabel = resetLabel ?? t('common.reset', t('buttons.reset', 'Reset'))
  const handleApply = onApply ?? onClose

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetPortal>
        <SheetOverlay className="cursor-pointer" />
        <SheetContent
          side="right"
          showClose={false}
          className="p-0 w-full max-w-sm sm:max-w-sm md:max-w-sm bg-card border-l border-border/80 shadow-2xl flex flex-col h-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-[14px] border-b border-border/60 shrink-0 bg-background/60">
            <div className="min-w-0 flex-1 pr-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                {icon ?? <ListFilter size={16} strokeWidth={1.8} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground leading-tight truncate">{title}</h3>
                  {resolvedActiveCount > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 tabular-nums">
                      {resolvedActiveCount}
                    </span>
                  )}
                </div>
                {resolvedSubtitle ? (
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {resolvedSubtitle}
                  </p>
                ) : resolvedActiveCount > 0 ? (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t('common.filters_active_count', {
                      count: resolvedActiveCount,
                      defaultValue: `${resolvedActiveCount} filter${resolvedActiveCount !== 1 ? 's' : ''} active`,
                    })}
                  </p>
                ) : null}
              </div>
            </div>
            <CloseButton onClose={onClose} size="md" color="slate" />
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-card custom-scrollbar">
            {children}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border/80 shrink-0 flex items-center justify-between gap-2.5 bg-card/95 backdrop-blur-xs">
            <ResetButton onClick={onReset} label={resolvedResetLabel} />
            <ActionButton
              variant="primary"
              onClick={handleApply}
              className="flex-1 font-semibold"
            >
              {resolvedApplyLabel}
            </ActionButton>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  )
}

export default FilterDrawerShell
