import React from 'react'
import ConfirmModal from './ConfirmModal'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  title?: string
  itemName?: string
  warningText?: string
  isPending?: boolean
  onCancel: () => void
  onSoftDelete: () => void
  onArchive?: () => void
  confirmText?: string
  cancelText?: string
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  itemName,
  warningText,
  isPending = false,
  onCancel,
  onSoftDelete,
  confirmText,
  cancelText,
}) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      variant="danger"
      title={title}
      itemName={itemName}
      warningText={warningText}
      isPending={isPending}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onSoftDelete}
      onCancel={onCancel}
    />
  )
}

export default DeleteConfirmDialog
