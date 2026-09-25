import React from 'react'
import { X, Activity, AlertCircle, RefreshCw, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { inventoryService } from '@/services/inventoryService'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatShortDate } from '@/utils/formatters'
import { ProductThumbnail } from '@/pages/products/components/ProductThumbnail'

interface StockMovementDetailPageProps {
  movementId: number
  onClose: () => void
  onOpenProductDetail?: (inventoryId: number) => void
}

export const StockMovementDetailPage: React.FC<StockMovementDetailPageProps> = ({
  movementId,
  onClose,
  onOpenProductDetail
}) => {
  const { t } = useTranslation(['inventory', 'buttons', 'common', 'products'])

  const { data: detail, isLoading, isError, refetch } = useQuery({
    queryKey: ['stock-movement-detail', movementId],
    queryFn: () => inventoryService.getMovement(movementId),
    enabled: !!movementId
  })

  const qty = Number(detail?.quantity ?? 0)
  const isPlus = qty > 0 || detail?.type === 'in' || detail?.type === 'transfer_in' || detail?.type === 'adjustment'
  const beforeQty = Number(detail?.quantity_before ?? 0)
  const afterQty = Number(detail?.quantity_after ?? 0)

  const formatMovementTypeLabel = (type: string | undefined) => {
    if (!type) return '—'
    const lower = type.toLowerCase()
    if (lower === 'opname') return t('opname', t('inventory.opname', t('inventory.tabOpname', 'Stock Opname')))
    if (lower === 'in' || lower === 'stock_in') return t('stockIn', t('inventory.stockIn', 'Stock In'))
    if (lower === 'out' || lower === 'stock_out') return t('stockOut', t('inventory.stockOut', 'Stock Out'))
    if (lower.includes('transfer')) return t('transfer', t('inventory.transfer', 'Stock Transfer'))
    if (lower === 'adjustment') return t('adjustment', t('inventory.adjustment', 'Stock Adjustment'))
    return type
  }

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
        className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col h-full overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t('inventory.movement_card', 'Movement Card')}
              </h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                REF: #{detail?.reference_number || `MOV-${movementId}`}
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
            <p className="text-xs text-muted-foreground font-medium">Loading movement record...</p>
          </div>
        ) : isError || !detail ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Failed to load movement</h3>
              <p className="text-xs text-muted-foreground">The requested stock movement log could not be retrieved.</p>
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
                <ProductThumbnail
                  name={detail.product?.name || 'Product'}
                  primaryImage={detail.product?.primary_image || (detail.product as any)?.image}
                  categoryName={detail.product?.category?.name}
                  size="xl"
                  className="w-16 h-16 rounded-2xl shadow-xs shrink-0 border-border/80"
                  preview={true}
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground truncate">{detail.product?.name || 'Product'}</h3>
                  <p className="text-xs font-mono text-muted-foreground truncate">{detail.product?.sku || `SKU-${detail.product_id}`}</p>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      isPlus ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {formatMovementTypeLabel(detail.type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* MOVEMENT QUANTITY SUMMARY */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('movementQuantityImpact', t('inventory.movementQuantityImpact', 'MOVEMENT QUANTITY & IMPACT'))}
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">{t('before', t('inventory.before', 'Before'))}</span>
                    <span className="font-bold text-foreground text-sm">{beforeQty}</span>
                  </div>
                  <div className={`p-3 rounded-xl border text-center ${
                    isPlus ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}>
                    <span className="text-[10px] block font-bold uppercase tracking-wider mb-1">{t('qtyChange', t('inventory.qtyChange', 'Quantity Change'))}</span>
                    <span className="font-extrabold text-base">{isPlus ? `+${Math.abs(qty)}` : `-${Math.abs(qty)}`}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">{t('after', t('inventory.after', 'After'))}</span>
                    <span className="font-bold text-foreground text-sm">{afterQty}</span>
                  </div>
                </div>
              </div>

              {/* GENERAL MOVEMENT DETAILS */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('generalInfo', t('common.generalInfo', 'GENERAL INFORMATION'))}
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('colWarehouse', t('inventory.colWarehouse', 'Warehouse Hub'))}</span>
                    <span className="font-bold text-foreground">{detail.warehouse?.name || 'Main Warehouse'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('movementType', t('inventory.movementType', 'Movement Type'))}</span>
                    <span className="font-bold text-foreground uppercase">{formatMovementTypeLabel(detail.type)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('referenceDocument', t('inventory.referenceDocument', 'Reference Document'))}</span>
                    <span className="font-mono font-bold text-foreground">{detail.reference_type ? `${detail.reference_type} #${detail.reference_id || ''}` : '—'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('operatorUser', t('inventory.operatorUser', 'Operator / User'))}</span>
                    <span className="font-bold text-foreground">{detail.user?.name || t('systemAuto', t('inventory.systemAuto', 'System Auto'))}</span>
                  </div>
                  {detail.unit_cost && (
                    <div>
                      <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('unitCostPrice', t('inventory.unitCostPrice', 'Unit Cost Price'))}</span>
                      <span className="font-bold text-foreground">${Number(detail.unit_cost).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* REASON / NOTES */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('reasonRemarks', t('inventory.reasonRemarks', 'REASON & REMARKS'))}
                </h4>
                <p className="text-xs text-foreground bg-muted/30 border border-border/60 rounded-xl p-3.5 italic">
                  "{detail.notes || detail.reason || 'No specific notes recorded for this movement.'}"
                </p>
              </div>

              {/* TIMESTAMPS */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                  {t('systemMetadata', t('common.systemMetadata', 'SYSTEM METADATA'))}
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('loggedDateTime', t('inventory.loggedDateTime', 'Logged Date & Time'))}</span>
                    <span className="font-semibold text-foreground">{formatShortDate(detail.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('lastUpdated', t('common.lastUpdated', 'Record Updated'))}</span>
                    <span className="font-semibold text-foreground">{formatShortDate(detail.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              {detail.inventory_id && onOpenProductDetail ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenProductDetail(detail.inventory_id)
                  }}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Package size={14} />
                  {/* priview image  */}
                  
                  {t('viewInventoryCard', t('inventory.viewInventoryCard', 'View Inventory Card'))}
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
export default StockMovementDetailPage
