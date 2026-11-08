import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PromotionFormPage from '../../PromotionFormPage'

export { PromotionFormPage }
export { PromotionFormPage as PromotionForm }

export interface PromotionFormModalProps {
  isOpen: boolean
  onClose?: () => void
  editingPromo?: any
  [key: string]: any
}

/**
 * Legacy modal wrapper - redirects to the dedicated PromotionFormPage
 * adhering to the global FormLayout architecture.
 */
export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({
  isOpen,
  onClose,
  editingPromo,
}) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      if (editingPromo?.id) {
        navigate(`/marketing/promotions/${editingPromo.id}/edit`)
      } else {
        navigate('/marketing/promotions/create')
      }
      onClose?.()
    }
  }, [isOpen, editingPromo, navigate, onClose])

  if (!isOpen) return null

  return null
}

export default PromotionFormPage
