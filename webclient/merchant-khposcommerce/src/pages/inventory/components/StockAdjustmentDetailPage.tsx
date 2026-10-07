import React from 'react'
import { X, Sliders, AlertCircle, RefreshCw, Edit } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { inventoryService } from '@/services/inventoryService'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusBadge from '@/components/common/StatusBadge'
import { formatShortDate } from '@/utils/formatters'

interface StockAdjustmentDetailPageProps {
  adjustmentId: number
  onClose: () => void
  onEdit?: () => void
}

export const StockAdjustmentDetailPage: React.FC<StockAdjustmentDetailPageProps> = ({
  adjustmentId,
  onClose,
  onEdit
}) => {
  const { t } = useTranslation(['inventory', 'buttons', 'common', 'products'])

  const { data: detail, isLoading, isError, refetch } = useQuery({
    queryKey: ['stock-adjustment-detail', adjustmentId],
    queryFn: () => inventoryService.getAdjustment(adjustmentId),
    enabled: !!adjustmentId
  })

  const isApproved = detail?.status === 'approved' || detail?.status === 'completed' || detail?.status === 'done'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden print:hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl flex flex-col h-full overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t('inventory.adjustment_card', 'Adjustment Card')}
              </h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                REF: #{detail?.reference_number || `ADJ-${adjustmentId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
            <LoadingSpinner />
            <p className="text-xs text-muted-foreground font-medium">Loading adjustment record...</p>
          </div>
        ) : isError || !detail ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Failed to load adjustment</h3>
              <p className="text-xs text-muted-foreground">The requested stock adjustment record could not be retrieved.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card Banner */}
              <div className="bg-muted/30 border border-border/70 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-card border border-border/80 flex items-center justify-center text-primary shadow-2xs shrink-0">
                  <Sliders size={22} />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground truncate">{detail.reference_number || `ADJ-${adjustmentId}`}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {t('warehouse', t('inventory.warehouse', 'Warehouse Hub'))}: {detail.warehouse?.name || 'Main Warehouse'}
                  </p>
                  <div>
                    <StatusBadge status={isApproved ? 'approved' : 'draft'} />
                  </div>
                </div>
              </div>

              {/* GENERAL INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('generalInfo', t('common.generalInfo', 'GENERAL INFORMATION'))}
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('colWarehouse', t('inventory.colWarehouse', 'Warehouse Location'))}</span>
                    <span className="font-bold text-foreground">{detail.warehouse?.name || 'Main Warehouse'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('type', t('inventory.type', 'Adjustment Type'))}</span>
                    <StatusBadge status={detail.type || 'addition'} />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('reason', t('inventory.reason', 'Reason'))}</span>
                    <span className="font-bold text-foreground">{detail.reason || 'Routine correction'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('operatorUser', t('inventory.operatorUser', 'Approved By / Operator'))}</span>
                    <span className="font-bold text-foreground">{detail.user?.name || 'Super Admin'}</span>
                  </div>
                </div>
              </div>

              {/* ADJUSTED ITEMS BREAKDOWN */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('adjustedItemsLedger', t('inventory.adjustedItemsLedger', 'ADJUSTED ITEMS LEDGER'))}
                </h4>
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="p-3">{t('colProductName', t('inventory.colProductName', 'Product Item'))}</th>
                        <th className="p-3 text-right">{t('adjustedQty', t('inventory.adjustedQty', 'Adjusted Qty'))}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {(detail.items ?? []).map((item: any) => {
                        const adjQty = Number(item.quantity_adjusted ?? item.quantity ?? 0)
                        const isPlus = adjQty >= 0
                        return (
                          <tr key={item.id} className="hover:bg-muted/30">
                            <td className="p-3">
                              <div className="font-bold text-foreground">{item.product?.name || `Product #${item.product_id}`}</div>
                              <div className="font-mono text-[10px] text-muted-foreground">{item.product?.sku || 'SKU-0000'}</div>
                            </td>
                            <td className={`p-3 text-right font-extrabold ${isPlus ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isPlus ? `+${adjQty}` : `${adjQty}`}
                            </td>
                          </tr>
                        )
                      })}
                      {(detail.items ?? []).length === 0 && (
                        <tr>
                          <td colSpan={2} className="p-6 text-center text-muted-foreground">
                            No items listed in this adjustment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REASON / NOTES */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('reasonRemarks', t('inventory.reasonRemarks', 'REASON & REMARKS'))}
                </h4>
                <p className="text-xs text-foreground bg-muted/30 border border-border/60 rounded-xl p-3.5 italic">
                  "{detail.notes || detail.reason || 'No specific remarks recorded.'}"
                </p>
              </div>

              {/* TIMESTAMPS */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('systemMetadata', t('common.systemMetadata', 'SYSTEM METADATA'))}
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('recordCreated', t('common.recordCreated', 'Record Created'))}</span>
                    <span className="font-semibold text-foreground">{formatShortDate(detail.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('lastUpdated', t('common.lastUpdated', 'Last Updated'))}</span>
                    <span className="font-semibold text-foreground">{formatShortDate(detail.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              {!isApproved && onEdit ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onEdit()
                  }}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Edit size={14} />
                  {t('editAdjustment', t('inventory.editAdjustment', 'Edit Adjustment'))}
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {t('buttons.close', t('common.close', 'Close'))}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
export default StockAdjustmentDetailPage
