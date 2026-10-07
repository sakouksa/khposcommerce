import React, { useState, useMemo } from 'react'
import { X, Activity, Info, Package, Warehouse, Clock, AlertTriangle, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { inventoryService } from '@/services/inventoryService'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatShortDate } from '@/utils/formatters'
import { ProductThumbnail } from '@/pages/products/components/ProductThumbnail'
import { getAbsoluteImageUrl } from '@/utils/image'

interface InventoryDetailPageProps {
  itemId?: number
  inventoryId?: number
  initialData?: any
  onClose: () => void
}

export const InventoryDetailPage: React.FC<InventoryDetailPageProps> = ({ itemId, inventoryId, initialData, onClose }) => {
  const { t } = useTranslation(['inventory', 'buttons', 'common', 'products'])
  const effectiveId = itemId ?? inventoryId
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'movements'>('info')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)

  const { data: serverDetail, isLoading: isQueryLoading, isError, refetch } = useQuery({
    queryKey: ['inventory-detail', effectiveId],
    queryFn: () => inventoryService.show(effectiveId!),
    enabled: !!effectiveId
  })

  // Merge server data over initialData
  const detail = serverDetail || initialData
  const isLoading = isQueryLoading && !detail

  const { data: movements, isLoading: loadingMovements } = useQuery({
    queryKey: ['inventory-item-movements', detail?.product_id, detail?.warehouse_id],
    queryFn: () => inventoryService.getMovements({
      product_id: detail?.product_id,
      warehouse_id: detail?.warehouse_id,
      per_page: 50
    }).then(r => r.data),
    enabled: !!detail?.product_id && !!detail?.warehouse_id
  })

  // Collect all valid images for product
  const allImages = useMemo(() => {
    if (!detail?.product) return []
    const list: string[] = []

    if (detail.product.images && Array.isArray(detail.product.images) && detail.product.images.length > 0) {
      detail.product.images.forEach((img: any) => {
        const url = typeof img === 'string' ? img : (img.url || img.image)
        if (url) {
          const resolved = getAbsoluteImageUrl(url) || url
          if (resolved && !list.includes(resolved)) list.push(resolved)
        }
      })
    }

    const pImg = detail.product.primary_image || (detail.product as any)?.image || (detail as any)?.image
    if (pImg) {
      const resolved = getAbsoluteImageUrl(pImg) || pImg
      if (resolved && !list.includes(resolved)) {
        list.unshift(resolved)
      }
    }

    return list
  }, [detail])

  const availableQty = Number(detail?.available_quantity ?? detail?.quantity ?? 0)
  const totalQty = Number(detail?.quantity ?? 0)
  const reservedQty = Number(detail?.reserved_quantity ?? 0)
  const reorderPoint = Number(detail?.reorder_point ?? 5)
  const reorderQty = Number(detail?.reorder_qty ?? 0)
  const isOutOfStock = totalQty <= 0
  const isLowStock = !isOutOfStock && availableQty <= reorderPoint

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

      {/* Slide-over Panel */}
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
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t('inventory.item_card', 'Item Card')}
              </h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                {t('common.id', 'ID')}: #{effectiveId || '—'}
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
            <p className="text-xs text-muted-foreground font-medium">Loading inventory details...</p>
          </div>
        ) : (isError && !detail) || !detail ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Failed to load item</h3>
              <p className="text-xs text-muted-foreground">The requested inventory record could not be retrieved.</p>
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
            {/* Navigation Sub-Tabs */}
            <div className="flex border-b border-border bg-muted/20 px-6 gap-6">
              <button
                onClick={() => setActiveSubTab('info')}
                className={`flex items-center gap-1.5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
                           ${activeSubTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <Info size={14} />
                {t('products.general', 'General Info')}
              </button>
              <button
                onClick={() => setActiveSubTab('movements')}
                className={`flex items-center gap-1.5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer
                           ${activeSubTab === 'movements' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <Activity size={14} />
                {t('inventory.movements', 'Stock History')}
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card Banner */}
              <div className="bg-muted/30 border border-border/70 rounded-2xl p-5 flex flex-col gap-3 shadow-2xs">
                <div className="flex items-center gap-4">
                  <ProductThumbnail
                    name={detail.product?.name || 'Inventory Item'}
                    primaryImage={allImages[selectedImageIndex] || detail.product?.primary_image || (detail.product as any)?.image || (detail as any)?.image}
                    images={detail.product?.images}
                    image={(detail.product as any)?.image}
                    categoryName={detail.product?.category?.name}
                    size="xl"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xs shrink-0 border-border/80"
                    preview={true}
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground truncate">{detail.product?.name || 'Inventory Item'}</h3>
                    <p className="text-xs font-mono text-muted-foreground truncate">{detail.product?.sku || 'SKU-0000'}</p>
                    <div>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          <AlertTriangle size={11} />
                          {t('inventory.out_of_stock', 'Out of Stock')}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <AlertTriangle size={11} />
                          {t('inventory.lowStockAlert', 'Low Stock Alert')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle size={11} />
                          {t('inventory.inStockHealthy', 'In Stock & Healthy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {allImages.length > 1 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40 overflow-x-auto">
                    {allImages.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                          selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border/70 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {activeSubTab === 'info' ? (
                <div className="space-y-6">
                  {/* GENERAL INFORMATION */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                      {t('common.generalInfo', 'GENERAL INFORMATION')}
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('inventory.colSku', 'Product SKU')}</span>
                        <span className="font-mono font-bold text-foreground">{detail.product?.sku || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('inventory.colWarehouse', 'Warehouse Location')}</span>
                        <span className="font-bold text-foreground">{detail.warehouse?.name || 'Main Warehouse'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('inventory.category', t('products.colCategory', 'Category'))}</span>
                        <span className="font-bold text-foreground">{detail.product?.category?.name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('inventory.brand', t('products.colBrand', 'Brand'))}</span>
                        <span className="font-bold text-foreground">{detail.product?.brand?.name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('inventory.unit', t('products.colUnitName', 'Unit of Measure'))}</span>
                        <span className="font-bold text-foreground">{detail.product?.unit?.name || 'Pcs'}</span>
                      </div>
                    </div>
                  </div>

                  {/* STOCK BALANCES & AVAILABILITY */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                      {t('inventory.stockBalances', 'STOCK BALANCES & AVAILABILITY')}
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">{t('inventory.onHandQuantity', 'On Hand Quantity')}</span>
                        <span className="font-extrabold text-foreground text-base">{totalQty}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold uppercase tracking-wider mb-1">{t('inventory.reserved_qty', 'Reserved Quantity')}</span>
                        <span className="font-extrabold text-amber-600 dark:text-amber-400 text-base">{reservedQty}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold uppercase tracking-wider mb-1">{t('inventory.availableForSale', 'Available For Sale')}</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{availableQty}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider mb-1">{t('inventory.reorderPointQty', 'Reorder Point / Qty')}</span>
                        <span className="font-bold text-foreground text-sm">{reorderPoint} / {reorderQty}</span>
                      </div>
                    </div>
                  </div>

                  {/* SYSTEM METADATA */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                      {t('common.systemMetadata', 'SYSTEM METADATA')}
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('common.recordCreated', 'Record Created')}</span>
                        <span className="font-semibold text-foreground">{formatShortDate(detail.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block font-medium mb-0.5">{t('common.lastUpdated', 'Last Updated')}</span>
                        <span className="font-semibold text-foreground">{formatShortDate(detail.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5">
                    {t('inventory.stockLedger', 'STOCK HISTORY LEDGER')}
                  </h4>
                  {loadingMovements ? (
                    <div className="flex justify-center py-8"><LoadingSpinner /></div>
                  ) : (
                    <div className="relative border-l border-border pl-6 ml-3 space-y-5">
                      {(movements ?? []).map((m: any) => {
                        const qtyNum = Number(m.quantity ?? 0)
                        const isPlus = qtyNum > 0 || m.type === 'in' || m.type === 'transfer_in' || m.type === 'adjustment'
                        const rawType = String(m.type || 'Movement')
                        const typeLabel = t(`inventory.type_${rawType.toLowerCase()}`, t(`inventory.${rawType.toLowerCase()}`, rawType))
                        return (
                          <div key={m.id} className="relative">
                            <span className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 border-card
                                             ${isPlus ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <div className="space-y-1 bg-muted/20 border border-border/50 rounded-xl p-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold uppercase tracking-wider text-primary text-[10px]">{typeLabel}</span>
                                <span className="text-muted-foreground font-mono text-[10px]">{formatShortDate(m.created_at)}</span>
                              </div>
                              <p className="text-xs text-foreground font-semibold">
                                {qtyNum > 0 ? `+${qtyNum}` : `${qtyNum}`}
                                <span className="text-muted-foreground font-normal ml-2 text-[11px]">
                                  ({t('inventory.before', 'Before')}: {m.quantity_before ?? 0} → {t('inventory.after', 'After')}: {m.quantity_after ?? 0})
                                </span>
                              </p>
                              {m.notes && <p className="text-xs text-muted-foreground italic">"{String(t(m.notes, m.notes))}"</p>}
                            </div>
                          </div>
                        )
                      })}
                      {(movements ?? []).length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-8">
                          {t('inventory.no_movements', 'No stock movement logs found for this item.')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {t('buttons.close', 'Close')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
export default InventoryDetailPage

