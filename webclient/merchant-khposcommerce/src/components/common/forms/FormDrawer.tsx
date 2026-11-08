import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import CloseButton from '../buttons/CloseButton'
import { CancelButton, SaveButton } from '../buttons/GlobalActionButtons'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormDrawerProps {
  open: boolean
  title: string
  subtitle?: string
  width?: string          // Tailwind max-w class, e.g. 'max-w-lg'
  onClose: () => void
  onSubmit?: (e?: any) => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  isSubmitting?: boolean
  children: React.ReactNode
  footer?: React.ReactNode   // override default footer
}

// ─── Component ───────────────────────────────────────────────────────────────

const FormDrawer: React.FC<FormDrawerProps> = ({
  open,
  title,
  subtitle,
  width = 'max-w-xl',
  onClose,
  onSubmit,
  submitLabel,
  cancelLabel,
  loading = false,
  isSubmitting,
  children,
  footer,
}) => {
  const { t } = useTranslation(['common'])
  const isBusy = loading || isSubmitting
  const effectiveSubmitLabel = submitLabel || t('save', 'Save Changes')
  const effectiveCancelLabel = cancelLabel || t('cancel', 'Cancel')
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-card border-l border-border/80 shadow-2xl w-full ${width}`}
          >
            {/* Top Accent Line */}
            <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-purple-500 w-full" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/80 bg-card/80 backdrop-blur-md flex-shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                  <span>{title}</span>
                </h2>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              </div>
              <CloseButton onClose={onClose} size="md" variant="default" className="ml-4" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {children}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-border/80 bg-muted/20 px-6 py-4 backdrop-blur-md">
              {footer ?? (
                <div className="flex items-center justify-end gap-3">
                  <CancelButton
                    onClick={onClose}
                    disabled={isBusy}
                    label={effectiveCancelLabel}
                  />
                  {onSubmit && (
                    <SaveButton
                      onClick={onSubmit}
                      loading={isBusy}
                      label={effectiveSubmitLabel}
                    />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FormDrawer
