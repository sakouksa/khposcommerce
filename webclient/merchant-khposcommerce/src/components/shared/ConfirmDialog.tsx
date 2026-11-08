import React from 'react'
import ConfirmModal from '@/components/common/modals/ConfirmModal'
import type { ConfirmVariant } from '@/components/common/modals/ConfirmModal'

export interface ConfirmDialogProps {
  open?: boolean
  isOpen?: boolean
  title?: string
  subtitle?: string
  message?: React.ReactNode
  itemName?: string
  warningText?: string
  confirmText?: string
  confirmLabel?: string
  cancelText?: string
  cancelLabel?: string
  loading?: boolean
  isPending?: boolean
  variant?: ConfirmVariant
  icon?: React.ComponentType<{ size?: number; className?: string }>
  onConfirm: () => void
  onCancel?: () => void
  onClose?: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  isOpen,
  title,
  subtitle,
  message,
  itemName,
  warningText,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  loading = false,
  isPending = false,
  variant = 'danger',
  icon,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const isModalOpen = open !== undefined ? open : Boolean(isOpen)
  const handleCancel = onCancel || onClose || (() => {})

  return (
    <ConfirmModal
      isOpen={isModalOpen}
      variant={variant}
      title={title}
      subtitle={subtitle}
      message={message}
      itemName={itemName}
      warningText={warningText}
      confirmText={confirmText || confirmLabel}
      cancelText={cancelText || cancelLabel}
      isPending={loading || isPending}
      icon={icon}
      onConfirm={onConfirm}
      onCancel={handleCancel}
      onClose={handleCancel}
    />
  )
}

export default ConfirmDialog
