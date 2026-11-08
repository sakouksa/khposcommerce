import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ModalHeader, { type ModalHeaderIconVariant } from './ModalHeader'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Modal header title (used when default header is rendered) */
  title?: React.ReactNode
  /** Modal header subtitle (used when default header is rendered) */
  subtitle?: React.ReactNode
  /** Modal header icon (used when default header is rendered) */
  icon?: React.ReactNode
  /** Modal header icon variant */
  iconVariant?: ModalHeaderIconVariant
  /** Modal header status badge or tag */
  badge?: React.ReactNode
  /** Custom header component (replaces default ModalHeader) */
  header?: React.ReactNode
  /** Custom footer component */
  footer?: React.ReactNode
  /** Max-width size preset of the modal dialog */
  size?: ModalSize
  /** Modal body content */
  children: React.ReactNode
  /** Whether to show the close button in default header (default: true) */
  showCloseButton?: boolean
  /** Whether pressing Escape closes the modal (default: true) */
  closeOnEsc?: boolean
  /** Whether clicking the backdrop closes the modal (default: true) */
  closeOnBackdropClick?: boolean
  /** Whether to render via React Portal (default: true) */
  usePortal?: boolean
  /** Custom CSS class for the modal dialog panel */
  className?: string
  /** Custom CSS class for the inner scrollable body area */
  bodyClassName?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] sm:max-w-6xl',
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconVariant = 'emerald',
  badge,
  header,
  footer,
  size = '2xl',
  children,
  showCloseButton = true,
  closeOnEsc = true,
  closeOnBackdropClick = true,
  usePortal = true,
  className = '',
  bodyClassName = '',
}) => {
  // Handle Escape key listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEsc, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${sizeClasses[size]} bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] z-10 ${className}`}
          >
            {/* Header Slot */}
            {header !== undefined ? (
              header
            ) : title ? (
              <ModalHeader
                title={title}
                subtitle={subtitle}
                icon={icon}
                iconVariant={iconVariant}
                badge={badge}
                onClose={onClose}
                showClose={showCloseButton}
              />
            ) : null}

            {/* Scrollable Body Slot */}
            <div className={`overflow-y-auto flex-1 ${bodyClassName}`}>
              {children}
            </div>

            {/* Footer Slot */}
            {footer}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  if (usePortal && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}

// ─── Backward Compatibility Aliases ───────────────────────────────────────────
export type EnterpriseModalProps = ModalProps
export const EnterpriseModal = Modal
export const AppModal = Modal

export default Modal
