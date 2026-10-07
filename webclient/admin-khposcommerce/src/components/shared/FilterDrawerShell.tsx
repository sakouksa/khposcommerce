/**
 * FilterDrawerShell — Global reusable shell for all filter drawers.
 * Provides consistent animated backdrop + drawer panel + header + footer.
 * Each filter drawer wraps its content in <FilterDrawerShell>.
 */
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CloseButton, ResetButton, ActionButton } from '@/components/common'

interface FilterDrawerShellProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  title: string
  activeCount?: number
  children: React.ReactNode
  applyLabel?: string
  resetLabel?: string
}

export const FilterDrawerShell: React.FC<FilterDrawerShellProps> = ({
  isOpen,
  onClose,
  onReset,
  title,
  activeCount = 0,
  children,
  applyLabel,
  resetLabel,
}) => {
  const { t } = useTranslation(['common', 'buttons', 'forms'])

  const resolvedApplyLabel = applyLabel ?? t('common.applyFilters', t('buttons.apply', 'Apply Filters'))
  const resolvedResetLabel = resetLabel ?? t('common.reset', t('buttons.reset', 'Reset'))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs z-40"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card dark:bg-slate-900 border-l border-border dark:border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header (Clean Minimal Text) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-slate-800 shrink-0 bg-card dark:bg-slate-900">
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground dark:text-slate-100 leading-tight">{title}</h3>
                  {activeCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {activeCount}
                    </span>
                  )}
                </div>
                {activeCount > 0 && (
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                    {t('common.filters_active_count', { count: activeCount, defaultValue: t('common.filters_active', { count: activeCount, defaultValue: `${activeCount} filter${activeCount !== 1 ? 's' : ''} active` }) })}
                  </p>
                )}
              </div>
              <CloseButton onClose={onClose} size="md" color="rose" />
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-card dark:bg-slate-900 custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border dark:border-slate-800 shrink-0 flex items-center justify-between gap-2.5 bg-card dark:bg-slate-900">
              <ResetButton onClick={onReset} label={resolvedResetLabel} />
              <ActionButton
                variant="primary"
                onClick={onClose}
                className="flex-1"
              >
                {resolvedApplyLabel}
              </ActionButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FilterDrawerShell

