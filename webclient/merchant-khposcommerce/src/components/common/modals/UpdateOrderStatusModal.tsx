import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { EnterpriseModal } from './Modal'
import { ModalFooter } from './ModalFooter'
import { orderService } from '@/services/orderService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'

export interface UpdateOrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  orderId?: number | string | null
  orderNumber?: string | null
  currentStatus?: string
  onSuccess?: (newStatus: string) => void
  onSubmit?: (newStatus: string) => Promise<any> | void
  isSubmitting?: boolean
}

interface StatusOptionConfig {
  id: string
  key: string
  descKey: string
  dotColor: string
  ringColor: string
}

const STATUS_OPTIONS: StatusOptionConfig[] = [
  {
    id: 'pending',
    key: 'statusPending',
    descKey: 'statusPendingDesc',
    dotColor: 'bg-amber-500',
    ringColor: 'ring-amber-500/20',
  },
  {
    id: 'processing',
    key: 'statusProcessing',
    descKey: 'statusProcessingDesc',
    dotColor: 'bg-blue-500',
    ringColor: 'ring-blue-500/20',
  },
  {
    id: 'shipped',
    key: 'statusShipped',
    descKey: 'statusShippedDesc',
    dotColor: 'bg-purple-500',
    ringColor: 'ring-purple-500/20',
  },
  {
    id: 'completed',
    key: 'statusCompleted',
    descKey: 'statusCompletedDesc',
    dotColor: 'bg-emerald-500',
    ringColor: 'ring-emerald-500/20',
  },
  {
    id: 'cancelled',
    key: 'statusCancelled',
    descKey: 'statusCancelledDesc',
    dotColor: 'bg-rose-500',
    ringColor: 'ring-rose-500/20',
  },
]

export const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  currentStatus = 'pending',
  onSuccess,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslation(['orders', 'common'])
  const toast = useToast()
  const queryClient = useQueryClient()

  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus)

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus || 'pending')
    }
  }, [isOpen, currentStatus])

  // Internal mutation if parent does not provide custom onSubmit
  const internalMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!orderId) throw new Error('Order ID is required')
      return orderService.updateStatus(orderId, newStatus)
    },
    onSuccess: (_, newStatus) => {
      sound.playSuccess()
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] })
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['order-detail', String(orderId)] })
        queryClient.invalidateQueries({ queryKey: ['order', String(orderId)] })
      }
      toast.success(t('orders.orderStatusUpdated', 'Order status updated successfully'))
      onSuccess?.(newStatus)
      onClose()
    },
    onError: (error: any) => {
      sound.playError()
      toast.error(
        error?.response?.data?.message ||
          t('orders.failedToUpdateStatus', 'Failed to update order status')
      )
    },
  })

  const isPending = isSubmitting || internalMutation.isPending

  const handleConfirm = async () => {
    if (onSubmit) {
      try {
        await onSubmit(selectedStatus)
        onSuccess?.(selectedStatus)
        onClose()
      } catch {
        // error handled by caller
      }
    } else {
      internalMutation.mutate(selectedStatus)
    }
  }

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending) {
          onClose()
        }
      }}
      title={t('orders.updateOrderStatus', 'Update Order Status')}
      subtitle={orderNumber ? `#${orderNumber}` : undefined}
      icon={<Package size={20} />}
      iconVariant="blue"
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleConfirm}
          cancelLabel={t('common.cancel', 'Cancel')}
          submitLabel={t('common.saveChanges', 'Save Changes')}
          isSubmitting={isPending}
          submitVariant="primary"
        />
      }
    >
      <div className="p-5 sm:p-6 space-y-4">
        <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
          {t(
            'orders.updateStatusDescription',
            'Choose the new processing or fulfillment state for this order:'
          )}
        </p>

        <div className="space-y-2.5" role="radiogroup">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selectedStatus === option.id
            const isCurrent = currentStatus === option.id

            const label = t(`orders.${option.key}`)
            const desc = t(`orders.${option.descKey}`)

            return (
              <div
                key={option.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setSelectedStatus(option.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedStatus(option.id)
                  }
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? 'border-primary/60 bg-primary/[0.04] dark:bg-primary/[0.08] ring-1 ring-primary/20 shadow-xs'
                    : 'border-border/70 bg-card hover:bg-muted/40 hover:border-border text-foreground'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${option.dotColor} ring-4 ${option.ringColor}`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[13px] sm:text-sm font-bold ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                          {t('orders.current', 'Current')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 sm:mt-1">
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-2 border-primary bg-transparent'
                      : 'border border-border/80 bg-background'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </EnterpriseModal>
  )
}

export default UpdateOrderStatusModal
