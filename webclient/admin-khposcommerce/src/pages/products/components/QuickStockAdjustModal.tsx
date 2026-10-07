import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Warehouse } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { companyService } from '@/services/companyService'
import { inventoryService } from '@/services/inventoryService'
import { useToast } from '@/hooks/useToast'
import { EnterpriseModal, ModalFooter } from '@/components/common'
import type { Product } from '../types/productsPage.types'

interface QuickStockAdjustModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  formatCurrency?: (val: number) => string
}

type AdjustType = 'addition' | 'subtraction' | 'set'

export const QuickStockAdjustModal: React.FC<QuickStockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { t } = useTranslation(['products', 'inventory', 'common'])
  const qc = useQueryClient()
  const toast = useToast()

  // Retain product reference during modal close animation
  const [cachedProduct, setCachedProduct] = useState<Product | null>(product)
  useEffect(() => {
    if (product) {
      setCachedProduct(product)
    }
  }, [product])
  const targetProduct = product || cachedProduct

  const [adjustType, setAdjustType] = useState<AdjustType>('addition')
  const [quantity, setQuantity] = useState<number>(1)
  const [warehouseId, setWarehouseId] = useState<string>('1')
  const [reason, setReason] = useState<string>('')

  // Set default localized reason when opened
  useEffect(() => {
    if (isOpen) {
      setReason(t('reasonRestock', 'Restock Inventory'))
      setQuantity(1)
      setAdjustType('addition')
    }
  }, [isOpen, t])

  // Fetch warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-select'],
    queryFn: () => companyService.getWarehouses({ per_page: 100 }).then(r => r.data ?? []),
    enabled: isOpen,
  })
  const warehouses = Array.isArray(warehousesData) ? warehousesData : (warehousesData?.data ?? [])

  const currentStock = Number(targetProduct?.stock ?? (targetProduct as any)?.total_stock ?? 0)
  const unitName = targetProduct?.unit?.name || 'Piece'

  // Calculate new projected stock
  const projectedStock = adjustType === 'addition'
    ? currentStock + quantity
    : adjustType === 'subtraction'
    ? Math.max(0, currentStock - quantity)
    : Math.max(0, quantity)

  // Calculate delta display
  const deltaText = adjustType === 'addition'
    ? `+${quantity}`
    : adjustType === 'subtraction'
    ? `-${quantity}`
    : `=${quantity}`

  // Quick reason presets
  const reasonPresets = [
    { key: 'reasonRestock', fallback: 'Restock Inventory' },
    { key: 'reasonCorrection', fallback: 'Audit Correction' },
    { key: 'reasonDamaged', fallback: 'Damaged Goods' },
    { key: 'reasonLoss', fallback: 'Inventory Loss / Shrinkage' },
    { key: 'reasonReturn', fallback: 'Customer Return' },
  ]

  // Submit Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (!targetProduct) return
      return inventoryService.createAdjustment({
        warehouse_id: warehouseId || '1',
        type: adjustType === 'addition' ? 'addition' : adjustType === 'subtraction' ? 'subtraction' : 'set',
        reason: reason.trim() || t('stockAdjustmentDefaultReason', 'Quick Stock Adjustment'),
        product_id: targetProduct.id,
        quantity: quantity,
        auto_approve: true,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['products-dashboard-statistics'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      toast.success(t('stockAdjustSuccess', 'Stock level adjusted successfully!'))
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('stockAdjustFailed', 'Failed to adjust stock level'))
    }
  })

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t('quickStockAdjust', 'Quick Stock Adjustment')}
      subtitle={
        targetProduct ? (
          <span>
            {targetProduct.name} • <span className="font-mono text-muted-foreground dark:text-slate-400">SKU: {targetProduct.sku}</span>
          </span>
        ) : undefined
      }
      icon={<Warehouse size={18} />}
      iconVariant="emerald"
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          onSubmit={() => mutation.mutate()}
          isSubmitting={mutation.isPending}
          submitLabel={t('confirmAdjustment', 'Confirm Adjustment')}
        />
      }
    >
      <div className="p-5 sm:p-6 space-y-5 text-xs">
        {/* Clean Elevated Stock Comparison Card */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              {t('currentStock', 'Current Stock')}
            </span>
            <p className="text-xl font-black text-foreground tracking-tight">
              {currentStock} <span className="text-xs font-semibold text-muted-foreground">{unitName}</span>
            </p>
          </div>

          {/* Delta Badge Indicator */}
          <div className="flex flex-col items-center justify-center">
            <div className={`px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${
              adjustType === 'addition'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : adjustType === 'subtraction'
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                : 'bg-primary/10 text-primary border-primary/30'
            }`}>
              {deltaText}
            </div>
          </div>

          <div className="space-y-1 text-right">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
              {t('projectedStock', 'New Stock Level')}
            </span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {projectedStock} <span className="text-xs font-semibold text-muted-foreground">{unitName}</span>
            </p>
          </div>
        </div>

        {/* Warehouse Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">
            {t('selectWarehouse', 'Select Warehouse')}
          </label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all"
          >
            {warehouses.length > 0 ? (
              warehouses.map((w: any) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code || `WH-${w.id}`})
                </option>
              ))
            ) : (
              <option value="1">{t('mainWarehouseDefault', 'Main Warehouse')}</option>
            )}
          </select>
        </div>

        {/* Segmented Adjust Action Switcher */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">
            {t('adjustAction', 'Adjustment Action')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAdjustType('addition')}
              className={`py-2.5 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                adjustType === 'addition'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                  : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              {t('addStock', '+ Add Stock')}
            </button>

            <button
              type="button"
              onClick={() => setAdjustType('subtraction')}
              className={`py-2.5 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                adjustType === 'subtraction'
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500 ring-2 ring-rose-500/20 shadow-2xs'
                  : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              {t('deductStock', '- Deduct Stock')}
            </button>

            <button
              type="button"
              onClick={() => setAdjustType('set')}
              className={`py-2.5 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                adjustType === 'set'
                  ? 'bg-primary/10 text-primary border-primary ring-2 ring-primary/20 shadow-2xs'
                  : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
            >
              {t('setStock', '= Set Count')}
            </button>
          </div>
        </div>

        {/* Stepper Input & Quick Quantity Pills */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">
            {t('quantity', 'Quantity')} ({unitName})
          </label>
          <div className="flex items-center gap-2.5">
            {/* Stepper */}
            <div className="flex items-center rounded-xl bg-card border border-border overflow-hidden shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-2 hover:bg-muted text-foreground font-bold text-sm cursor-pointer transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 text-center text-xs font-black bg-transparent text-foreground outline-none py-2"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-2 hover:bg-muted text-foreground font-bold text-sm cursor-pointer transition-colors"
              >
                +
              </button>
            </div>

            {/* Quick Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[1, 5, 10, 50, 100].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setQuantity(inc)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                    quantity === inc
                      ? 'bg-primary text-white border-primary shadow-2xs'
                      : 'bg-card border-border hover:bg-muted text-foreground'
                  }`}
                >
                  {inc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reason Input with Localized Preset Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground block">
            {t('reason', 'Adjustment Reason')}
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('reasonPlaceholder', 'e.g., Restock, Damaged, Count correction...')}
            className="w-full h-10 px-3.5 rounded-xl bg-card border border-border font-medium text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {reasonPresets.map((preset) => {
              const localizedText = t(preset.key, preset.fallback)
              const isSelected = reason === localizedText
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setReason(localizedText)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/40 font-bold shadow-2xs'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                  }`}
                >
                  {localizedText}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </EnterpriseModal>
  )
}

export default QuickStockAdjustModal
