import React, { useState, useEffect } from 'react'
import {
  Boxes,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  RefreshCw,
  History,
  Building2,
  Sliders,
  ShieldAlert,
  Loader2,
  Package,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Select } from '@/components/common'

interface WarehouseItem {
  id: number | string
  name: string
}

interface StockMovementItem {
  id: number | string
  created_at: string
  type: string
  quantity: number | string
  reason?: string
  warehouse?: { name: string }
  user?: { name: string }
}

interface FlexibleInventorySectionProps {
  trackInventory: boolean
  lowStockThreshold: string
  onTrackInventoryChange: (track: boolean) => void
  onLowStockThresholdChange: (val: string) => void
  hasVariants?: boolean
  onHasVariantsChange?: (val: boolean) => void
  onSaveSettings?: () => void
  isSavingSettings?: boolean
  warehouses?: WarehouseItem[]
  movements?: StockMovementItem[]
  isLoadingMovements?: boolean
  currentStock?: number
  costPrice?: string
  sellingPrice?: string
  variants?: any[]
  onAddAdjustment?: (data: {
    warehouse_id: string
    variant_id?: string
    type: string
    quantity: string
    reason: string
  }) => void
  isAddingAdjustment?: boolean
}

export const FlexibleInventorySection: React.FC<FlexibleInventorySectionProps> = ({
  trackInventory,
  lowStockThreshold,
  onTrackInventoryChange,
  onLowStockThresholdChange,
  onSaveSettings,
  isSavingSettings = false,
  warehouses = [],
  movements = [],
  isLoadingMovements = false,
  currentStock = 0,
  costPrice = '0',
  sellingPrice = '0',
  variants = [],
  onAddAdjustment,
  isAddingAdjustment = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  // Local Adjustment Form State
  const [warehouseId, setWarehouseId] = useState<string>(
    warehouses.length > 0 ? String(warehouses[0].id) : ''
  )
  const [variantId, setVariantId] = useState<string>('')
  const [adjustmentType, setAdjustmentType] = useState<string>('addition')
  const [quantity, setQuantity] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [historyFilter, setHistoryFilter] = useState<string>('all')

  // Auto-select first warehouse when warehouses list is loaded
  useEffect(() => {
    if (!warehouseId && warehouses && warehouses.length > 0) {
      setWarehouseId(String(warehouses[0].id))
    }
  }, [warehouses, warehouseId])

  const threshold = parseInt(lowStockThreshold) || 5
  const cost = parseFloat(costPrice) || 0
  const selling = parseFloat(sellingPrice) || 0
  const totalCostValue = currentStock * cost
  const totalSellingValue = currentStock * selling

  // Quick Quantity Presets
  const handleQuickQty = (num: number) => {
    const curr = parseInt(quantity) || 0
    setQuantity(String(Math.max(1, curr + num)))
  }

  // Quick Reasons
  const quickReasons = [
    { label: t('reasonRestock', 'Restock'), val: 'Restock inventory purchase' },
    { label: t('reasonDamaged', 'Damaged'), val: 'Damaged or defective stock' },
    { label: t('reasonLost', 'Lost'), val: 'Inventory count mismatch' },
    { label: t('reasonAudit', 'Audit'), val: 'Physical stock audit alignment' },
  ]

  // Submit Adjustment
  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!warehouseId || !quantity || parseFloat(quantity) <= 0) return
    onAddAdjustment?.({
      warehouse_id: warehouseId,
      variant_id: variantId || undefined,
      type: adjustmentType,
      quantity,
      reason: reason.trim() || (adjustmentType === 'addition' ? 'Manual Restock' : 'Manual Deduction'),
    })
    setQuantity('')
    setReason('')
  }

  // Calculated Preview Stock After Adjustment
  const parsedQty = parseFloat(quantity) || 0
  const newStockPreview =
    adjustmentType === 'addition'
      ? currentStock + parsedQty
      : adjustmentType === 'subtraction'
      ? Math.max(0, currentStock - parsedQty)
      : parsedQty // audit count

  // Safely extract movements list whether passed as an array, paginated response, or nested data
  const safeMovements: any[] = React.useMemo(() => {
    if (Array.isArray(movements)) return movements
    if (Array.isArray((movements as any)?.data)) return (movements as any).data
    if (Array.isArray((movements as any)?.data?.data)) return (movements as any).data.data
    return []
  }, [movements])

  // Helper to determine movement direction
  const isAdditionType = (m: any) => {
    const t = (m.type || '').toLowerCase()
    const q = typeof m.quantity === 'number' ? m.quantity : parseFloat(String(m.quantity || 0))
    return t === 'addition' || t === 'in' || t === 'purchase' || t === 'transfer_in' || (t !== 'subtraction' && t !== 'out' && t !== 'sale' && q > 0)
  }

  const isSubtractionType = (m: any) => {
    const t = (m.type || '').toLowerCase()
    const q = typeof m.quantity === 'number' ? m.quantity : parseFloat(String(m.quantity || 0))
    return t === 'subtraction' || t === 'out' || t === 'sale' || t === 'transfer_out' || t === 'purchase_return' || (t !== 'addition' && t !== 'in' && q < 0)
  }

  // Filtered Movements for Table
  const filteredMovements = React.useMemo(() => {
    return safeMovements.filter((m) => {
      if (historyFilter === 'all') return true
      if (historyFilter === 'addition') return isAdditionType(m)
      if (historyFilter === 'subtraction') return isSubtractionType(m)
      return true
    })
  }, [safeMovements, historyFilter])

  return (
    <div className="space-y-5">
      {/* ─── Top 4 Sleek KPI Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1: Total Stock */}
        <div className="bg-card/90 dark:bg-card/60 border border-border/80 p-3.5 rounded-2xl shadow-2xs hover:border-indigo-500/40 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('totalStockInSystem', 'Total Stock')}
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
              <Boxes size={15} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl font-black font-mono tracking-tight text-foreground">
                {currentStock.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">{t('unitsUnit', 'Units')}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground text-[10px]">{t('stockStatusLabel', 'Status:')}</span>
              {currentStock <= 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <AlertTriangle size={10} /> {t('outOfStock', 'Out of Stock')}
                </span>
              ) : currentStock <= threshold ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <ShieldAlert size={10} /> {t('lowStock', 'Low Stock')}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 size={10} /> {t('inStock', 'In Stock')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Cost Value */}
        <div className="bg-card/90 dark:bg-card/60 border border-border/80 p-3.5 rounded-2xl shadow-2xs hover:border-purple-500/40 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('totalCostValue', 'Total Cost Value')}
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              <Package size={15} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400">
              ${totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="pt-2 mt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
              {t('costValueFormula', '(Total Stock × Cost Price)')}
            </div>
          </div>
        </div>

        {/* Card 3: Selling Value */}
        <div className="bg-card/90 dark:bg-card/60 border border-border/80 p-3.5 rounded-2xl shadow-2xs hover:border-emerald-500/40 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('totalSellingValue', 'Total Selling Value')}
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              ${totalSellingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="pt-2 mt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
              {t('sellingValueFormula', '(Total Stock × Selling Price)')}
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Threshold */}
        <div className="bg-card/90 dark:bg-card/60 border border-border/80 p-3.5 rounded-2xl shadow-2xs hover:border-amber-500/40 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('lowStockThresholdLabel', 'Low Stock Alert Threshold')}
            </span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <Sliders size={15} />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {threshold}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">{t('unitsUnit', 'Units')}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium truncate">
              {trackInventory ? t('trackingEnabled', 'Tracking stock levels') : t('trackingDisabled', 'Stock tracking disabled')}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Compact Settings & Control Banner (Clean, Modern & Balanced) ─── */}
      <div className="bg-card/90 dark:bg-card/70 border border-border/80 p-3.5 sm:p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-[13px] font-bold text-foreground leading-tight">
            {t('stockTrackingSettings', 'Stock Tracking Settings')}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {t('stockTrackingDesc', 'Track inventory count automatically upon sales and set reorder alerts')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 self-start sm:self-auto">
          {/* Toggle Track Inventory */}
          <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all select-none shadow-2xs ${
            trackInventory
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-muted/40 border-border/80 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
          }`}>
            <input
              type="checkbox"
              checked={trackInventory}
              onChange={(e) => onTrackInventoryChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer accent-primary"
            />
            <span>{t('trackStockLevel', 'Track Stock Level')}</span>
          </label>

          {/* Clean Stepper Threshold Input */}
          <div className={`flex items-center gap-2 ${!trackInventory ? 'opacity-40 pointer-events-none' : ''}`}>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {t('products.lowStockThreshold', 'Alert Threshold:')}
            </span>
            <div className="inline-flex items-center h-8 bg-background border border-border/80 rounded-lg p-0.5 shadow-2xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(0, (parseInt(lowStockThreshold) || 0) - 1)
                  onLowStockThresholdChange(String(val))
                }}
                disabled={!trackInventory || (parseInt(lowStockThreshold) || 0) <= 0}
                className="w-6 h-6 flex items-center justify-center rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer transition-colors"
                title="Decrease"
              >
                <Minus size={11} />
              </button>
              <input
                type="number"
                min="0"
                value={lowStockThreshold ?? ''}
                onChange={(e) => onLowStockThresholdChange(e.target.value)}
                className="w-12 text-center text-xs font-bold font-mono bg-transparent border-0 outline-none p-0 text-foreground"
                disabled={!trackInventory}
                placeholder="5"
              />
              <button
                type="button"
                onClick={() => {
                  const val = (parseInt(lowStockThreshold) || 0) + 1
                  onLowStockThresholdChange(String(val))
                }}
                disabled={!trackInventory}
                className="w-6 h-6 flex items-center justify-center rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer transition-colors"
                title="Increase"
              >
                <Plus size={11} />
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
              {t('unitsUnit', 'Units')}
            </span>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={onSaveSettings}
            disabled={isSavingSettings}
            className="h-8 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            {isSavingSettings ? <Loader2 className="animate-spin" size={13} /> : <CheckCircle2 size={13} />}
            <span>{t('products.saveBtn', 'Save')}</span>
          </button>
        </div>
      </div>

      {/* ─── Flexible Workspace Layout: 2-Column Desktop Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Adjustment Form (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-card border border-border/80 p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-foreground">
                {t('products.warehouseStockLedger', 'Stock Adjustment')}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {t('products.stockAdjustmentDesc', 'Add stock, write-off damaged goods, or adjust physical audit counts')}
              </p>
            </div>

            {/* Live Preview Badge */}
            {parsedQty > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold font-mono">
                <span>Stock: {currentStock}</span>
                <ArrowRight size={12} />
                <span className="text-primary">New: {newStockPreview}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitAdjustment} className="space-y-3.5">
            <div className={`grid grid-cols-1 ${variants && variants.length > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3.5`}>
              {/* Warehouse Location */}
              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                  {t('products.warehouseLocationLabel', 'Warehouse Location')} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={warehouseId}
                  onChange={(val) => setWarehouseId(val ? String(val) : '')}
                  options={warehouses.map((w) => ({
                    value: String(w.id),
                    label: w.name,
                  }))}
                  placeholder={t('products.selectWarehousePlaceholder', 'Select warehouse...')}
                />
              </div>

              {/* Variant Selector (If Product Has Variants) */}
              {variants && variants.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                    {t('products.variantOptionLabel', 'Product Variant')}
                  </label>
                  <Select
                    value={variantId}
                    onChange={(val) => setVariantId(val ? String(val) : '')}
                    options={[
                      { value: '', label: t('products.allMainStockPlaceholder', 'All / Main Stock') },
                      ...variants.map((v) => ({
                        value: String(v.id),
                        label: v.name,
                      }))
                    ]}
                    placeholder={t('products.variantOptionLabel', 'Product Variant')}
                  />
                </div>
              )}

              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1">
                  {t('products.quantityLabel', 'Adjustment Quantity')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder={t('products.enterQtyPlaceholder', 'Enter quantity...')}
                    value={quantity ?? ''}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="form-input w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono rounded-lg border border-border/80 bg-background text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Adjustment Type Segmented Tab */}
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1">
                {t('products.actionLabel', 'Adjustment Action')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/30 dark:bg-slate-900/50 rounded-lg border border-border/70">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('addition')}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    adjustmentType === 'addition'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Plus size={13} />
                  <span>{t('products.actionAdd', '+ Add Stock')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentType('subtraction')}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    adjustmentType === 'subtraction'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Minus size={13} />
                  <span>{t('products.actionDeduct', '- Deduct Stock')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentType('audit')}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    adjustmentType === 'audit'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <RefreshCw size={12} />
                  <span>{t('products.actionAudit', '= Stock Audit')}</span>
                </button>
              </div>
            </div>

            {/* Quick Quantity Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-bold text-muted-foreground mr-1 flex items-center gap-1">
                <Zap size={12} className="text-amber-500" />
                {t('products.quickQty', 'Quick:')}
              </span>
              {[1, 5, 10, 25, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleQuickQty(num)}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-muted/30 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/60 transition-all cursor-pointer active:scale-95"
                >
                  +{num}
                </button>
              ))}
            </div>

            {/* Reason Description & Presets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('products.reasonLabel', 'Adjustment Reason')}
              </label>
              <input
                type="text"
                placeholder={t('products.reasonPlaceholder', 'e.g. Supplier restock, damaged goods, physical count alignment...')}
                value={reason ?? ''}
                onChange={(e) => setReason(e.target.value)}
                className="form-input w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
              />

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground">{t('products.quickSelect', 'Presets:')}</span>
                {quickReasons.map((qr) => (
                  <button
                    key={qr.label}
                    type="button"
                    onClick={() => setReason(qr.val)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/30 hover:bg-muted/70 text-muted-foreground border border-border/50 transition-all cursor-pointer"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isAddingAdjustment || !quantity}
                className="h-10 min-h-[40px] flex items-center gap-1.5 px-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs sm:text-[13px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isAddingAdjustment ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                <span>{t('logAdjustment', 'Save Stock Adjustment')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Movement History Ledger Table (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-card border border-border/80 p-5 rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">
                  {t('stockMovementHistory', 'Stock Movement History')}
                </h4>
                <p className="text-[10px] text-muted-foreground">{t('stockMovementHistorySub', 'Track stock adjustments and transactions')}</p>
              </div>

              {/* Table Action Filter */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    historyFilter === 'all'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('filterAll', 'All')}
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('addition')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    historyFilter === 'addition'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('filterAdd', '+ Add')}
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('subtraction')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    historyFilter === 'subtraction'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('filterDeduct', '- Deduct')}
                </button>
              </div>
            </div>

            {/* History Table Container */}
            <div className="border border-border/70 rounded-xl overflow-hidden shadow-2xs max-h-[360px] overflow-y-auto">
              <table className="w-full data-table text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground sticky top-0 bg-card">
                    <th className="text-left py-2.5 px-3 font-bold text-[10px] uppercase">{t('tableType', 'Type')}</th>
                    <th className="text-left py-2.5 px-3 font-bold text-[10px] uppercase">{t('tableQty', 'Qty')}</th>
                    <th className="text-left py-2.5 px-3 font-bold text-[10px] uppercase">{t('tableReason', 'Reason')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {isLoadingMovements ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                        <Loader2 className="animate-spin mx-auto mb-2 text-primary" size={20} />
                        <span className="font-semibold text-[11px] text-foreground/80">{t('products.loadingMovements', 'Loading stock history...')}</span>
                      </td>
                    </tr>
                  ) : filteredMovements && filteredMovements.length > 0 ? (
                    filteredMovements.map((m) => {
                      const isAdd = isAdditionType(m)
                      const isSub = isSubtractionType(m)
                      const qtyVal = typeof m.quantity === 'number' ? m.quantity : parseFloat(String(m.quantity || 0))
                      const absQty = Math.abs(qtyVal)

                      return (
                        <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                isAdd
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : isSub
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  : 'bg-primary/15 text-primary border border-primary/20'
                              }`}
                            >
                              {isAdd && t('products.filterAdd', '+ Add')}
                              {isSub && t('products.filterDeduct', '- Deduct')}
                              {!isAdd && !isSub && t('products.actionAudit', '= Audit')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-extrabold font-mono text-foreground text-xs">
                            {isSub ? `-${absQty}` : `+${absQty}`}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground text-[11px]" title={m.reason || m.notes || ''}>
                            <div className="truncate max-w-[140px] font-medium text-foreground/90">
                              {m.reason || m.notes || 'Manual adjustment'}
                            </div>
                            {m.created_at && (
                              <div className="text-[9px] text-muted-foreground/70">
                                {new Date(m.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-muted-foreground italic text-xs">
                        <History className="mx-auto mb-1.5 opacity-40" size={22} />
                        {t('products.noMovementsFound', 'No stock movement history recorded yet.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground text-center">
            {t('products.automaticLogFooter', 'Automated real-time stock ledger journal')}
          </div>
        </div>
      </div>
    </div>
  )
}
