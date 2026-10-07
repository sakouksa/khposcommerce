import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Plus,
  Trash2,
  Loader2,
  Minus,
  RotateCcw,
  Boxes,
  Search,
  X,
  Check
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventoryService'
import { companyService } from '@/services/companyService'
import { productService } from '@/services/productService'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { FormLayout, FormContent, FormCard, FormHeader, FormFooter } from '@/components/common'
import { motion, AnimatePresence } from 'framer-motion'

interface StockAdjustmentFormProps {
  adjustmentId?: number | null
  onClose?: () => void
}

export const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({ adjustmentId, onClose }) => {
  const { t } = useTranslation(['inventory', 'buttons', 'common', 'products'])
  const toast = useToast()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()

  const effectiveId = adjustmentId ?? (params.id ? Number(params.id) : null)
  const isEdit = !!effectiveId

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/inventory?tab=adjustments')
    }
  }

  // Form States
  const [warehouseId, setWarehouseId] = useState('')
  const [type, setType] = useState<'addition' | 'subtraction' | 'recount'>('addition')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<Array<{ product_id: string; variant_id: string; quantity: number; product?: any }>>([])
  
  // Search & Filter state for adding items
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Queries
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['stock-adjustment-detail', effectiveId],
    queryFn: () => inventoryService.getAdjustment(effectiveId!),
    enabled: isEdit,
  })

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => companyService.getWarehouses().then(r => r.data),
  })

  const { data: rawProducts } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => productService.list({ per_page: 1000 }).then(r => r.data),
  })

  const products = useMemo(() => {
    return Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data ?? [])
  }, [rawProducts])

  // Set default warehouse if none selected
  useEffect(() => {
    if (!warehouseId && warehouses && warehouses.length > 0 && !isEdit) {
      setWarehouseId(String(warehouses[0].id))
    }
  }, [warehouses, warehouseId, isEdit])

  // Auto fill form if editing
  useEffect(() => {
    if (detail) {
      setWarehouseId(detail.warehouse?.id?.toString() || detail.warehouse_id?.toString() || '')
      setType((detail.type as any) || 'addition')
      setReason(detail.reason || '')
      setNotes(detail.notes || '')
      if (detail.items && detail.items.length > 0) {
        setItems(detail.items.map((it: any) => ({
          product_id: it.product_id?.toString() || '',
          variant_id: it.product_variant_id?.toString() || '',
          quantity: Math.abs(parseFloat(it.quantity_adjusted)) || 1,
          product: it.product,
        })))
      }
    }
  }, [detail])

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Computed Values
  const selectedWarehouseObj = useMemo(
    () => warehouses?.find((w: any) => w.id?.toString() === warehouseId?.toString()),
    [warehouses, warehouseId]
  )

  const totalAdjustedUnits = useMemo(
    () => items.filter(it => !!it.product_id).reduce((acc, it) => acc + (parseFloat(String(it.quantity)) || 0), 0),
    [items]
  )

  const totalEstimatedValue = useMemo(() => {
    return items.reduce((acc, it) => {
      const prod = products.find((p: any) => String(p.id) === String(it.product_id)) || it.product
      const price = parseFloat(prod?.cost_price || prod?.price || 0)
      const qty = parseFloat(String(it.quantity)) || 0
      return acc + (price * qty)
    }, 0)
  }, [items, products])

  // Search filtered products for quick adder
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase().trim()
    return products
      .filter((p: any) => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.barcode && p.barcode.toLowerCase().includes(query))
      )
      .slice(0, 8)
  }, [searchQuery, products])

  // Reason suggestions with 5-language i18n
  const reasonSuggestions = useMemo(() => [
    { key: 'damaged', label: t('reasonDamaged', 'Damaged Goods') },
    { key: 'expired', label: t('reasonExpired', 'Expired Stock') },
    { key: 'discrepancy', label: t('reasonDiscrepancy', 'Audit Discrepancy') },
    { key: 'lost', label: t('reasonLost', 'Lost / Stolen') },
    { key: 'correction', label: t('reasonCorrection', 'Inbound Correction') },
  ], [t])

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEdit) {
        return inventoryService.updateAdjustment(effectiveId, payload)
      }
      return inventoryService.createAdjustment(payload)
    },
    onSuccess: () => {
      toast.success(
        isEdit
          ? t('adjustmentUpdatedSuccess', 'Stock adjustment updated successfully')
          : t('adjustmentCreatedSuccess', 'Stock adjustment created successfully')
      )
      qc.invalidateQueries({ queryKey: ['inventory-adjustments'] })
      qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
      handleClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.saveFailed', 'Failed to save adjustment'))
    }
  })

  const approveMutation = useMutation({
    mutationFn: () => inventoryService.approveAdjustment(effectiveId!),
    onSuccess: () => {
      toast.success(t('adjustmentApprovedSuccess', 'Stock adjustment approved successfully!'))
      qc.invalidateQueries({ queryKey: ['stock-adjustment-detail', effectiveId] })
      qc.invalidateQueries({ queryKey: ['inventory-adjustments'] })
      qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.actionFailed', 'Approval failed'))
    }
  })

  // Handlers
  const handleAddProductToItems = (prod: any) => {
    const existingIndex = items.findIndex(it => String(it.product_id) === String(prod.id))
    if (existingIndex >= 0) {
      setItems(prev => {
        const next = [...prev]
        next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + 1 }
        return next
      })
      toast.info(`${prod.name}: +1 ${t('quantity', 'Quantity')}`)
    } else {
      setItems(prev => [...prev, { product_id: String(prod.id), variant_id: '', quantity: 1, product: prod }])
    }
    setSearchQuery('')
    setSearchFocused(false)
  }

  const handleAddItem = () => {
    setItems(prev => [...prev, { product_id: '', variant_id: '', quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems(prev => {
      const next = [...prev]
      const current = { ...next[index], [field]: value }

      if (field === 'product_id') {
        const prod = products.find((p: any) => String(p.id) === String(value))
        current.product = prod
        current.variant_id = ''
      }

      next[index] = current
      return next
    })
  }

  const handleStepQuantity = (index: number, delta: number) => {
    setItems(prev => {
      const next = [...prev]
      const currentQty = Math.max(1, (parseFloat(String(next[index].quantity)) || 0) + delta)
      next[index] = { ...next[index], quantity: currentQty }
      return next
    })
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!warehouseId) {
      toast.error(t('selectWarehouseAlert', 'Please select a warehouse.'))
      return
    }

    const validItems = items.filter(it => !!it.product_id && (parseFloat(String(it.quantity)) || 0) > 0)
    if (validItems.length === 0) {
      toast.error(t('addAtLeastOneItemHint', 'Please add at least 1 product item to proceed'))
      return
    }

    const payload = {
      warehouse_id: parseInt(warehouseId),
      type,
      reason: reason.trim() || t('reasonDiscrepancy', 'Audit Discrepancy'),
      notes,
      items: validItems.map(it => ({
        product_id: parseInt(it.product_id),
        variant_id: it.variant_id ? parseInt(it.variant_id) : null,
        quantity: parseFloat(String(it.quantity)),
      }))
    }

    saveMutation.mutate(payload)
  }

  if (isEdit && loadingDetail) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border/80 shadow-xs">
        <Loader2 className="animate-spin mx-auto mb-3 text-primary" size={28} />
        <p className="text-xs font-semibold text-muted-foreground">{t('common.loading', 'Loading...')}</p>
      </div>
    )
  }

  const isApproved = detail?.status === 'approved'

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isSubmitting={saveMutation.isPending}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? t('view_adj', 'Edit Stock Adjustment')
              : t('create_adj', 'New Stock Adjustment')
          }
          subtitle={t('adj_desc', 'Adjust warehouse stock quantities with approval logs.')}
          breadcrumbs={[
            { label: t('inventory', 'Inventory'), href: '/inventory' },
            { label: t('adjustments', 'Stock Adjustments'), href: '/inventory?tab=adjustments' },
            { label: isEdit ? (detail?.reference_number || `ADJ-${effectiveId}`) : t('create_adj', 'New Stock Adjustment') },
          ]}
          statusBadge={
            isEdit ? (
              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono shadow-2xs ${
                isApproved
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {isApproved ? t('statusApproved', 'Approved') : (detail?.reference_number || `ADJ-${effectiveId}`)}
              </span>
            ) : undefined
          }
          onBack={handleClose}
          backLabel={t('common.back', 'Back')}
        />
      }
      footer={
        <FormFooter
          onCancel={handleClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          isEdit={isEdit}
          isSubmitting={saveMutation.isPending}
          showSubmit={!isApproved}
          submitLabel={isEdit ? t('common.saveChanges', 'Save Changes') : t('common.save', 'Save Adjustment')}
          onSubmit={handleSubmit}
          extraActions={
            isEdit && !isApproved ? (
              <button
                type="button"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="h-10 min-h-[40px] px-5 text-xs sm:text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {approveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>{t('approve', 'Approve')}</span>
              </button>
            ) : undefined
          }
        />
      }
    >
      <FormContent maxWidth="3xl" layout="two-column">
        {/* ─── Left Column: General Configuration (4 Cols) ─── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Config Card */}
          <FormCard
            title={t('generalInfoCard', 'General Information')}
            subtitle={t('stockAdjustConfigDesc', 'Set target warehouse and adjustment mode')}
            contentClassName="space-y-4"
          >

              {isApproved ? (
                <div className="space-y-3.5 text-xs">
                  <div className="p-3 bg-muted/30 rounded-2xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-bold mb-0.5">
                      {t('warehouse', 'Warehouse')}
                    </span>
                    <span className="font-bold text-foreground block text-sm">
                      {selectedWarehouseObj?.name || 'Unknown Warehouse'}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-2xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-bold mb-0.5">
                      {t('type', 'Adjustment Type')}
                    </span>
                    <span className="font-bold text-foreground block capitalize">
                      {type === 'addition' && t('typeAddition', 'Addition (+)')}
                      {type === 'subtraction' && t('typeSubtraction', 'Subtraction (-)')}
                      {type === 'recount' && t('typeRecount', 'Recount (Set Qty)')}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-2xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-bold mb-0.5">
                      {t('reason', 'Reason')}
                    </span>
                    <span className="font-semibold text-foreground block">
                      {reason || '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Warehouse Select */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                      <span>{t('warehouse', 'Warehouse')} <span className="text-rose-500">*</span></span>
                      {selectedWarehouseObj && (
                        <span className="text-[10px] text-primary font-mono font-semibold">
                          Code: {selectedWarehouseObj.code || `WH-${selectedWarehouseObj.id}`}
                        </span>
                      )}
                    </label>
                    <select
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                      className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer dark:[color-scheme:dark]"
                    >
                      <option value="" className="dark:bg-slate-900">{t('selectWarehouse', 'Select Warehouse...')}</option>
                      {(warehouses ?? []).map((w: any) => (
                        <option key={w.id} value={String(w.id)} className="dark:bg-slate-900">
                          {w.name} {w.code ? `(${w.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Adjustment Type Segmented Tab */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      {t('type', 'Adjustment Type')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 p-1 bg-muted/60 dark:bg-slate-800/60 rounded-xl border border-border/70">
                      {/* Addition */}
                      <button
                        type="button"
                        onClick={() => setType('addition')}
                        className={`h-9 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                          type === 'addition'
                            ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <span className="text-sm font-black leading-none">+</span>
                        <span className="truncate">{t('typeAddition', 'Addition (+)')}</span>
                      </button>

                      {/* Subtraction */}
                      <button
                        type="button"
                        onClick={() => setType('subtraction')}
                        className={`h-9 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                          type === 'subtraction'
                            ? 'bg-card text-rose-600 dark:text-rose-400 shadow-xs border border-border/80'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <span className="text-sm font-black leading-none">-</span>
                        <span className="truncate">{t('typeSubtraction', 'Subtraction (-)')}</span>
                      </button>

                      {/* Recount */}
                      <button
                        type="button"
                        onClick={() => setType('recount')}
                        className={`h-9 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                          type === 'recount'
                            ? 'bg-card text-primary shadow-xs border border-border/80'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                      >
                        <span className="text-xs font-black leading-none">↺</span>
                        <span className="truncate">{t('typeRecount', 'Recount')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Reason Input with Quick Suggestions */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      {t('reason', 'Reason')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      placeholder={t('reasonPlaceholder', 'e.g. Broken stock, discrepancy...')}
                      className="w-full h-10 px-3.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-muted-foreground/60"
                    />

                    {/* Reason quick click chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium mr-1">
                        {t('quickSuggestions', 'Quick Suggestions')}:
                      </span>
                      {reasonSuggestions.map(s => {
                        const isActive = reason === s.label
                        return (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => setReason(s.label)}
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                              isActive
                                ? 'bg-primary/10 text-primary border-primary/30 font-bold'
                                : 'bg-muted/40 text-muted-foreground border-border/70 hover:border-border hover:text-foreground hover:bg-muted/70'
                            }`}
                          >
                            {s.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Notes Textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      {t('notes', 'Notes')}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder={t('notesPlaceholder', 'Detailed explanation...')}
                      className="w-full p-3 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-medium placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              )}
          </FormCard>

          {/* Live Impact Summary Card */}
          <FormCard
            title={t('adjustmentSummary', 'Adjustment Summary')}
            badge={
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                type === 'addition'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : type === 'subtraction'
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                {type}
              </span>
            }
            contentClassName="space-y-3 pt-1"
          >
            {/* Target Warehouse info row */}
            <div className="p-3 bg-muted/30 border border-border/60 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  {t('warehouse', 'Warehouse')}
                </span>
                <span className="font-bold text-foreground block truncate">
                  {selectedWarehouseObj?.name || t('selectWarehouse', 'Select Warehouse...')}
                </span>
              </div>
              {selectedWarehouseObj?.code && (
                <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono font-bold text-muted-foreground border border-border/60">
                  {selectedWarehouseObj.code}
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 border border-border/60 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
                  {t('totalSKUsLabel', 'Total Items')}
                </span>
                <p className="text-lg font-black text-foreground font-mono">
                  {items.filter(i => !!i.product_id).length} <span className="text-xs font-normal text-muted-foreground">SKUs</span>
                </p>
              </div>

              <div className="p-3 bg-muted/30 border border-border/60 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
                  {t('totalUnitsLabel', 'Total Units')}
                </span>
                <p className="text-lg font-black font-mono flex items-center gap-1">
                  <span className={type === 'addition' ? 'text-emerald-600 dark:text-emerald-400' : type === 'subtraction' ? 'text-rose-500' : 'text-primary'}>
                    {type === 'addition' ? `+${totalAdjustedUnits}` : type === 'subtraction' ? `-${totalAdjustedUnits}` : totalAdjustedUnits}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{t('units', 'Units')}</span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t('stockAdjustNotice', 'Stock adjustments update warehouse inventory immediately upon approval with full audit logs.')}
            </p>
          </FormCard>
        </div>

        {/* ─── Right Column: Smart Item Manager & Matrix Table (8 Cols) ─── */}
        <div className="lg:col-span-8 space-y-6">
          <FormCard
            title={t('adjustmentItems', 'Adjustment Items')}
            subtitle={t('adjustItemsInstruction', 'Search products by name or SKU to add to adjustment')}
            badge={
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-bold border border-primary/20">
                {items.filter(i => !!i.product_id).length} {t('items', 'Items')}
              </span>
            }
            action={
              !isApproved ? (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="h-8 px-3 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Plus size={13} />
                  <span>{t('addItem', 'Add Empty Row')}</span>
                </button>
              ) : undefined
            }
            contentClassName="space-y-4"
          >

                {/* Fast Product Search & Auto-Add Bar */}
                {!isApproved && (
                  <div ref={searchContainerRef} className="relative z-30">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        placeholder={t('searchProductToAddPlaceholder', 'Search product by name, SKU, or scan barcode to add quickly...')}
                        className="w-full h-10 pl-9 pr-9 rounded-xl bg-muted/30 border border-border/80 text-xs font-medium text-foreground focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60 shadow-2xs"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Instant Search Results Dropdown */}
                    <AnimatePresence>
                      {searchFocused && searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.99 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.99 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-1.5 bg-card/95 dark:bg-slate-900/95 backdrop-blur-md border border-border/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5 dark:ring-white/10"
                        >
                          {/* Top Results Header Bar */}
                          <div className="px-3.5 py-2 bg-muted/40 dark:bg-slate-800/50 border-b border-border/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                            <span>{t('searchResultsCount', { count: searchResults.length, defaultValue: `Found ${searchResults.length} products` })}</span>
                            <span className="text-[10px] text-muted-foreground/80">{t('clickToAddHint', 'Click item to add')}</span>
                          </div>

                          {/* Results List */}
                          <div className="max-h-72 overflow-y-auto divide-y divide-border/50 dark:divide-slate-800">
                            {searchResults.map((prod: any) => {
                              const addedItem = items.find(it => String(it.product_id) === String(prod.id))
                              const isAlreadyAdded = !!addedItem
                              const stockNum = prod.stock ?? prod.stock_quantity ?? 0
                              const unitSymbol = prod.unit?.symbol || 'pcs'
                              const priceFormatted = prod.price || prod.cost_price ? `$${parseFloat(prod.price || prod.cost_price || 0).toFixed(2)}` : null

                              return (
                                <button
                                  key={prod.id}
                                  type="button"
                                  onClick={() => handleAddProductToItems(prod)}
                                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-muted/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-xl bg-muted/70 dark:bg-slate-800 border border-border/80 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                      {prod.image ? (
                                        <img src={prod.image} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <Boxes size={15} className="text-muted-foreground/60" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                          {prod.name}
                                        </p>
                                        {priceFormatted && (
                                          <span className="text-[11px] font-mono font-bold text-muted-foreground shrink-0">
                                            {priceFormatted}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {prod.sku && (
                                          <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-border/60">
                                            {prod.sku}
                                          </span>
                                        )}
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                                          stockNum > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                                        }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${stockNum > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                          {stockNum > 0
                                            ? `${t('inStock', 'In Stock')}: ${stockNum} ${unitSymbol}`
                                            : t('outOfStock', 'Out of Stock')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 pl-3">
                                    {isAlreadyAdded ? (
                                      <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-1 shadow-2xs">
                                        <Check size={12} />
                                        <span>{t('addedWithCount', { count: addedItem.quantity, defaultValue: `+${addedItem.quantity} Added` })}</span>
                                      </span>
                                    ) : (
                                      <span className="h-7 px-3 text-xs font-bold text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white border border-primary/20 rounded-xl shadow-2xs flex items-center gap-1 transition-all">
                                        <Plus size={12} />
                                        <span>{t('add', 'Add')}</span>
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}

                      {/* No Results Empty State */}
                      {searchFocused && searchQuery.trim() && searchResults.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.99 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.99 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-1.5 p-6 bg-card/95 dark:bg-slate-900/95 backdrop-blur-md border border-border/80 dark:border-slate-800 rounded-2xl shadow-2xl text-center z-50 ring-1 ring-black/5"
                        >
                          <Boxes size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                          <p className="text-xs font-bold text-foreground">
                            {t('noProductsFoundFor', { query: searchQuery, defaultValue: `No products matching "${searchQuery}"` })}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {t('searchHintVerify', 'Please verify product name, SKU, or barcode')}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Items Matrix Table */}
                <div className="overflow-hidden rounded-2xl border border-border/80 shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/80 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted/30">
                          <th className="py-3 px-4">{t('colProductManagement', 'Product Management')}</th>
                          <th className="py-3 px-3 text-center w-28">{t('currentStock', 'Current Stock')}</th>
                          <th className="py-3 px-3 text-center w-44">{t('qty_adjusted', 'Adjust Qty')}</th>
                          <th className="py-3 px-3 text-center w-32">{t('projectedStock', 'New Stock')}</th>
                          {!isApproved && <th className="py-3 px-3 w-12 text-center"></th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-xs font-semibold bg-card">
                        {items.map((item, idx) => {
                          const productObj = products?.find((p: any) => String(p.id) === String(item.product_id)) || item.product
                          const hasProduct = !!productObj
                          const currentStockNum = productObj?.stock ?? productObj?.stock_quantity ?? productObj?.current_stock ?? 0
                          const unitSymbol = productObj?.unit?.symbol || productObj?.unit?.name || 'pcs'
                          
                          // Calculate projected stock
                          const qtyNum = parseFloat(String(item.quantity)) || 0
                          let projectedStockNum = currentStockNum
                          if (type === 'addition') {
                            projectedStockNum = currentStockNum + qtyNum
                          } else if (type === 'subtraction') {
                            projectedStockNum = Math.max(0, currentStockNum - qtyNum)
                          } else {
                            projectedStockNum = qtyNum
                          }

                          return (
                            <tr key={idx} className="hover:bg-muted/20 transition-colors">
                              {/* Product Info / Selector */}
                              <td className="py-3 px-4">
                                {isApproved ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                      {productObj?.image ? (
                                        <img src={productObj.image} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <Boxes size={16} className="text-muted-foreground/60" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-bold text-xs text-foreground block truncate">
                                        {productObj?.name || 'Unknown Product'}
                                      </span>
                                      {productObj?.sku && (
                                        <span className="text-[10px] text-muted-foreground font-mono block">
                                          {productObj.sku}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="min-w-[200px]">
                                    <select
                                      value={item.product_id}
                                      onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                                      className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer dark:[color-scheme:dark]"
                                    >
                                      <option value="" className="dark:bg-slate-900">{t('selectProduct', 'Select Product...')}</option>
                                      {item.product && !(products ?? []).some((p: any) => String(p.id) === String(item.product_id)) && (
                                        <option value={String(item.product.id)} className="dark:bg-slate-900">
                                          {item.product.name} {item.product.sku ? `(${item.product.sku})` : ''}
                                        </option>
                                      )}
                                      {(products ?? []).map((p: any) => (
                                        <option key={p.id} value={String(p.id)} className="dark:bg-slate-900">
                                          {p.name} {p.sku ? `(${p.sku})` : ''}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </td>

                              {/* Current Stock */}
                              <td className="py-3 px-3 text-center">
                                {hasProduct ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-muted/60 border border-border/80 text-xs font-mono font-bold text-foreground shadow-2xs">
                                    {currentStockNum} <span className="text-[10px] text-muted-foreground ml-1 font-sans">{unitSymbol}</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground/60 font-mono">—</span>
                                )}
                              </td>

                              {/* Adjustment Stepper Input */}
                              <td className="py-3 px-3 text-center">
                                {isApproved ? (
                                  <div className="text-center font-mono font-black text-xs sm:text-sm text-foreground">
                                    {type === 'addition' ? `+${item.quantity}` : type === 'subtraction' ? `-${item.quantity}` : item.quantity} {unitSymbol}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <div className="inline-flex items-center rounded-xl bg-background border border-border/80 overflow-hidden shadow-2xs">
                                      <button
                                        type="button"
                                        onClick={() => handleStepQuantity(idx, -1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-sm cursor-pointer transition-colors"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, parseFloat(e.target.value) || 1))}
                                        required
                                        className="w-12 text-center text-xs font-bold bg-transparent text-foreground outline-none py-1 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleStepQuantity(idx, 1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-sm cursor-pointer transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Projected Resulting Stock */}
                              <td className="py-3 px-3 text-center">
                                {hasProduct ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border shadow-2xs ${
                                      type === 'addition'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                        : type === 'subtraction'
                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                                        : 'bg-primary/10 text-primary border-primary/30'
                                    }`}>
                                      {projectedStockNum} <span className="text-[10px] font-normal">{unitSymbol}</span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground/60 font-mono">—</span>
                                )}
                              </td>

                              {/* Delete Item Action */}
                              {!isApproved && (
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                                    title={t('common.delete', 'Delete')}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          )
                        })}

                        {items.length === 0 && (
                          <tr>
                            <td colSpan={isApproved ? 4 : 5} className="text-center py-12 text-muted-foreground">
                              <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                <div className="space-y-1">
                                  <p className="font-bold text-sm text-foreground">
                                    {t('noAdjustmentItemsYet', 'No items added to this adjustment yet')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {t('useSearchOrAddHint', 'Use the search bar above or click below to add items')}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddItem}
                                  className="mt-2 px-4 py-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 cursor-pointer shadow-2xs active:scale-95 transition-all"
                                >
                                  + {t('addItem', 'Add Item')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Summary Bar */}
                <div className="pt-3.5 border-t border-border/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">
                      {t('totalLines', 'Total Line Items')}:
                    </span>
                    <span className="font-mono font-bold text-foreground bg-muted/60 px-2.5 py-0.5 rounded-lg border border-border/60">
                      {items.filter(i => !!i.product_id).length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">
                      {t('totalUnitsAdjusted', 'Total Units Adjusted')}:
                    </span>
                    <span className={`font-mono text-xs font-bold px-3 py-1 rounded-xl border shadow-2xs ${
                      type === 'addition'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : type === 'subtraction'
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {type === 'addition' ? `+${totalAdjustedUnits}` : type === 'subtraction' ? `-${totalAdjustedUnits}` : totalAdjustedUnits} {t('units', 'Units')}
                    </span>
                  </div>
                </div>
            </FormCard>
          </div>
        </FormContent>
    </FormLayout>
  )
}

export default StockAdjustmentForm
