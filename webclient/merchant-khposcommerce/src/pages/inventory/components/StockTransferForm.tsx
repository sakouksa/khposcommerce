import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Boxes,
  Search,
  X,
  Check,
  ArrowRight,
  Truck,
  CheckCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { inventoryService } from '@/services/inventoryService'
import { companyService } from '@/services/companyService'
import { productService } from '@/services/productService'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { FormLayout, FormContent, FormCard, FormHeader, FormFooter } from '@/components/common'

interface StockTransferFormProps {
  transferId?: number | null
  onClose?: () => void
}

export const StockTransferForm: React.FC<StockTransferFormProps> = ({ transferId, onClose }) => {
  const { t } = useTranslation(['inventory', 'buttons', 'common', 'products'])
  const toast = useToast()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const effectiveId = transferId ?? (params.id ? Number(params.id) : null)
  const isEdit = !!effectiveId

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/inventory?tab=transfers')
    }
  }

  // Form States
  const [fromWarehouseId, setFromWarehouseId] = useState('')
  const [toWarehouseId, setToWarehouseId] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [items, setItems] = useState<Array<{
    id?: number
    product_id: string
    variant_id: string
    quantity: number
    quantity_received?: number
    product?: any
  }>>([])

  // Queries
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['stock-transfer-detail', effectiveId],
    queryFn: () => inventoryService.getTransfer(effectiveId!),
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

  const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data ?? [])

  // Auto fill form if editing
  useEffect(() => {
    if (detail) {
      setFromWarehouseId(detail.from_warehouse?.id?.toString() || detail.from_warehouse_id?.toString() || '')
      setToWarehouseId(detail.to_warehouse?.id?.toString() || detail.to_warehouse_id?.toString() || '')
      setNotes(detail.notes || '')
      if (detail.items && detail.items.length > 0) {
        setItems(detail.items.map((it: any) => ({
          id: it.id,
          product_id: it.product_id?.toString() || '',
          variant_id: it.product_variant_id?.toString() || '',
          quantity: parseFloat(it.quantity_transferred) || 1,
          quantity_received: parseFloat(it.quantity_received) || parseFloat(it.quantity_transferred) || 1,
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
  const isSameWarehouse = !!(fromWarehouseId && toWarehouseId && fromWarehouseId === toWarehouseId)

  const fromWarehouseObj = useMemo(
    () => warehouses?.find((w: any) => String(w.id) === String(fromWarehouseId)),
    [warehouses, fromWarehouseId]
  )

  const toWarehouseObj = useMemo(
    () => warehouses?.find((w: any) => String(w.id) === String(toWarehouseId)),
    [warehouses, toWarehouseId]
  )

  const totalTransferredUnits = useMemo(
    () => items.filter(curr => !!curr.product_id).reduce((acc, curr) => acc + (parseFloat(String(curr.quantity)) || 0), 0),
    [items]
  )

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

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEdit) {
        return inventoryService.updateTransfer(effectiveId, payload)
      }
      return inventoryService.createTransfer(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-transfers'] })
      qc.invalidateQueries({ queryKey: ['inventory-levels'] })
      qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
      toast.success(
        isEdit
          ? t('transferUpdatedSuccess', 'Stock transfer updated successfully')
          : t('transferCreatedSuccess', 'Stock transfer created successfully')
      )
      handleClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.saveFailed', 'Failed to save transfer'))
    }
  })

  const shipMutation = useMutation({
    mutationFn: () => inventoryService.shipTransfer(effectiveId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-transfer-detail', effectiveId] })
      qc.invalidateQueries({ queryKey: ['inventory-transfers'] })
      qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
      toast.success(t('transferShippedSuccess', 'Transfer status marked as in transit.'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.actionFailed', 'Shipping update failed'))
    }
  })

  const receiveMutation = useMutation({
    mutationFn: (itemsPayload: any[]) => inventoryService.receiveTransfer(effectiveId!, { items: itemsPayload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-transfer-detail', effectiveId] })
      qc.invalidateQueries({ queryKey: ['inventory-transfers'] })
      qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
      toast.success(t('transferReceivedSuccess', 'Stock transfer completed and goods received!'))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.actionFailed', 'Receiving update failed'))
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

    if (!fromWarehouseId || !toWarehouseId) {
      toast.error(t('selectBothWarehouses', 'Please select both source and destination warehouses.'))
      return
    }

    if (isSameWarehouse) {
      toast.error(t('sameWarehouseWarning', 'Source and destination warehouses must be different!'))
      return
    }

    const validItems = items.filter(it => !!it.product_id && (parseFloat(String(it.quantity)) || 0) > 0)
    if (validItems.length === 0) {
      toast.error(t('addAtLeastOneItemHint', 'Please add at least 1 item to proceed'))
      return
    }

    const payload = {
      from_warehouse_id: parseInt(fromWarehouseId),
      to_warehouse_id: parseInt(toWarehouseId),
      notes,
      items: validItems.map(it => ({
        product_id: parseInt(it.product_id),
        variant_id: it.variant_id ? parseInt(it.variant_id) : null,
        quantity: parseFloat(String(it.quantity)),
      }))
    }

    saveMutation.mutate(payload)
  }

  const handleReceiveSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const receivedPayload = items.map(it => ({
      id: it.id,
      received_quantity: it.quantity_received ?? it.quantity
    }))
    receiveMutation.mutate(receivedPayload)
  }

  if (isEdit && loadingDetail) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border/80 shadow-xs">
        <Loader2 className="animate-spin mx-auto mb-3 text-primary" size={28} />
        <p className="text-xs font-semibold text-muted-foreground">{t('common.loading', 'Loading...')}</p>
      </div>
    )
  }

  const status = detail?.status || 'draft'
  const isDraft = status === 'draft'
  const isInTransit = status === 'in_transit'
  const isReceived = status === 'received'

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isSubmitting={saveMutation.isPending || receiveMutation.isPending || shipMutation.isPending}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? t('edit_trf', 'Edit Stock Transfer')
              : t('create_trf', 'New Stock Transfer')
          }
          subtitle={t('trf_desc', 'Transfer products securely between warehouse locations with real-time tracking.')}
          breadcrumbs={[
            { label: t('inventory', 'Inventory'), href: '/inventory' },
            { label: t('transfers', 'Stock Transfers'), href: '/inventory?tab=transfers' },
            { label: isEdit ? (detail?.reference_number || `TRF-${effectiveId}`) : t('create_trf', 'New Stock Transfer') },
          ]}
          statusBadge={
            isEdit ? (
              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono shadow-2xs ${
                isReceived
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : isInTransit
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {isReceived ? t('statusReceived', 'Received') : isInTransit ? t('statusInTransit', 'In Transit') : (detail?.reference_number || `TRF-${effectiveId}`)}
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
          isSubmitting={saveMutation.isPending || receiveMutation.isPending || shipMutation.isPending}
          showSubmit={isDraft}
          submitLabel={isEdit ? t('common.saveChanges', 'Save Changes') : t('common.save', 'Save Transfer')}
          onSubmit={handleSubmit}
          showShortcutHint={false}
          extraActions={
            <>
              {isEdit && isDraft && (
                <button
                  type="button"
                  onClick={() => shipMutation.mutate()}
                  disabled={shipMutation.isPending}
                  className="h-10 min-h-[40px] px-5 text-xs sm:text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {shipMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                  <span>{t('ship', 'Mark as In Transit')}</span>
                </button>
              )}

              {isEdit && isInTransit && (
                <button
                  type="button"
                  onClick={handleReceiveSubmit}
                  disabled={receiveMutation.isPending}
                  className="h-10 min-h-[40px] px-5 text-xs sm:text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {receiveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  <span>{t('receive', 'Receive Items')}</span>
                </button>
              )}
            </>
          }
        />
      }
    >
      <FormContent maxWidth="3xl" layout="two-column">
        {/* ─── Left Column: Route Configuration & Settings (4 Cols) ─── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Warehouse Route Card */}
          <FormCard
            title={t('generalInfoCard', 'General Information')}
            subtitle={t('transferRouteDesc', 'Set origin warehouse, destination warehouse and route options')}
            contentClassName="space-y-4"
          >
            {!isDraft ? (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-muted/30 rounded-2xl border border-border/60">
                  <span className="text-[11px] text-muted-foreground block font-bold mb-0.5">
                    {t('from_warehouse', 'Source Warehouse (Ship From)')}
                  </span>
                  <span className="font-bold text-foreground block text-sm">
                    {fromWarehouseObj?.name || 'Unknown Warehouse'}
                  </span>
                </div>

                <div className="flex justify-center -my-1 text-primary">
                  <ArrowRight className="rotate-90 sm:rotate-0" size={16} />
                </div>

                <div className="p-3 bg-muted/30 rounded-2xl border border-border/60">
                  <span className="text-[11px] text-muted-foreground block font-bold mb-0.5">
                    {t('to_warehouse', 'Destination Warehouse (Receive At)')}
                  </span>
                  <span className="font-bold text-foreground block text-sm">
                    {toWarehouseObj?.name || 'Unknown Warehouse'}
                  </span>
                </div>

                {notes && (
                  <div className="p-3 bg-muted/30 rounded-2xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-bold mb-0.5">
                      {t('notes', 'Notes')}
                    </span>
                    <span className="font-medium text-foreground block italic">
                      "{notes}"
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Source Warehouse Select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                    <span>{t('from_warehouse', 'Source Warehouse (Ship From)')} <span className="text-rose-500">*</span></span>
                    {fromWarehouseObj && (
                      <span className="text-[10px] text-primary font-mono font-semibold">
                        Code: {fromWarehouseObj.code || `WH-${fromWarehouseObj.id}`}
                      </span>
                    )}
                  </label>
                  <select
                    value={fromWarehouseId}
                    onChange={(e) => setFromWarehouseId(e.target.value)}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer dark:[color-scheme:dark]"
                  >
                    <option value="" className="dark:bg-slate-900">{t('selectSourceWarehouse', 'Select source warehouse...')}</option>
                    {(warehouses ?? []).map((w: any) => (
                      <option key={w.id} value={String(w.id)} className="dark:bg-slate-900">
                        {w.name} {w.code ? `(${w.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Route Visual Connector */}
                <div className="flex items-center justify-center gap-2 py-0.5 text-muted-foreground/60">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="px-2.5 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <span>{t('transferRoute', 'Transfer Route')}</span>
                  </span>
                  <div className="h-px bg-border flex-1"></div>
                </div>

                {/* Destination Warehouse Select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                    <span>{t('to_warehouse', 'Destination Warehouse (Receive At)')} <span className="text-rose-500">*</span></span>
                    {toWarehouseObj && (
                      <span className="text-[10px] text-primary font-mono font-semibold">
                        Code: {toWarehouseObj.code || `WH-${toWarehouseObj.id}`}
                      </span>
                    )}
                  </label>
                  <select
                    value={toWarehouseId}
                    onChange={(e) => setToWarehouseId(e.target.value)}
                    className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 font-medium focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer dark:[color-scheme:dark]"
                  >
                    <option value="" className="dark:bg-slate-900">{t('selectDestinationWarehouse', 'Select destination warehouse...')}</option>
                    {(warehouses ?? []).map((w: any) => (
                      <option key={w.id} value={String(w.id)} className="dark:bg-slate-900">
                        {w.name} {w.code ? `(${w.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {isSameWarehouse && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{t('sameWarehouseWarning', 'Source and destination warehouses must be different!')}</span>
                  </div>
                )}

                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    {t('priority', 'Priority')}
                  </label>
                  <div className="grid grid-cols-3 p-1 bg-muted/60 dark:bg-slate-800/60 rounded-xl border border-border/70">
                    <button
                      type="button"
                      onClick={() => setPriority('normal')}
                      className={`h-9 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center text-center ${
                        priority === 'normal'
                          ? 'bg-card text-primary shadow-xs border border-border/80'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      {t('priorityNormal', 'Normal')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('high')}
                      className={`h-9 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center text-center ${
                        priority === 'high'
                          ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-border/80'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      {t('priorityHigh', 'High')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('urgent')}
                      className={`h-9 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center text-center ${
                        priority === 'urgent'
                          ? 'bg-card text-rose-600 dark:text-rose-400 shadow-xs border border-border/80'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      {t('priorityUrgent', 'Urgent')}
                    </button>
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-foreground">
                    {t('notes', 'Notes')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder={t('transferNotesPlaceholder', 'Detailed notes, delivery instructions, reference...')}
                    className="w-full p-3 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-medium placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            )}
          </FormCard>

          {/* Live Impact Summary Card */}
          <FormCard
            title={t('transferSummary', 'Transfer Summary')}
            badge={
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                priority === 'urgent'
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  : priority === 'high'
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                {priority}
              </span>
            }
            contentClassName="space-y-3 pt-1"
          >
            {/* Route visual info */}
            <div className="p-3 bg-muted/30 border border-border/60 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium">{t('from_warehouse', 'Source')}:</span>
                <span className="font-bold text-foreground truncate max-w-[170px]">
                  {fromWarehouseObj?.name || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                <span className="text-muted-foreground font-medium">{t('to_warehouse', 'Destination')}:</span>
                <span className="font-bold text-foreground truncate max-w-[170px]">
                  {toWarehouseObj?.name || '—'}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 border border-border/60 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
                  {t('totalTransferItems', 'Transfer SKUs')}
                </span>
                <p className="text-lg font-black text-foreground font-mono">
                  {items.filter(i => !!i.product_id).length} <span className="text-xs font-normal text-muted-foreground">SKUs</span>
                </p>
              </div>

              <div className="p-3 bg-muted/30 border border-border/60 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
                  {t('totalTransferUnits', 'Total Units')}
                </span>
                <p className="text-lg font-black text-primary font-mono flex items-center gap-1">
                  <span>{totalTransferredUnits}</span>
                  <span className="text-xs font-normal text-muted-foreground">{t('units', 'Units')}</span>
                </p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t('stockTransferNotice', 'Transferred goods will be deducted from source warehouse and credited to destination upon shipping and receiving.')}
            </p>
          </FormCard>
        </div>

        {/* ─── Right Column: Smart Item Manager & Matrix Table (8 Cols) ─── */}
        <div className="lg:col-span-8 space-y-6">
          <FormCard
            title={t('transferItems', 'Transfer Items')}
            subtitle={t('transferItemsInstruction', 'Search products by name or SKU to add to transfer')}
            badge={
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-bold border border-primary/20">
                {items.filter(i => !!i.product_id).length} {t('items', 'Items')}
              </span>
            }
            action={
              isDraft ? (
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
            {isDraft && (
              <div ref={searchContainerRef} className="relative z-30">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder={t('searchProductToTransferPlaceholder', 'Search product by name, SKU, or scan barcode to add to transfer...')}
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
                                        ? `${t('sourceStock', 'Source Stock')}: ${stockNum} ${unitSymbol}`
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
                      <th className="py-3 px-3 text-center w-28">{t('sourceStock', 'Source Stock')}</th>
                      <th className="py-3 px-3 text-center w-40">{t('qty_transferred', 'Transfer Qty')}</th>
                      {(isInTransit || isReceived) && <th className="py-3 px-3 text-center w-36">{t('qty_received', 'Received Qty')}</th>}
                      {isDraft && <th className="py-3 px-3 w-12 text-center"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs font-semibold bg-card">
                    {items.map((item, idx) => {
                      const productObj = products?.find((p: any) => String(p.id) === String(item.product_id)) || item.product
                      const hasProduct = !!productObj
                      const currentStockNum = productObj?.stock ?? productObj?.stock_quantity ?? productObj?.current_stock ?? 0
                      const unitSymbol = productObj?.unit?.symbol || productObj?.unit?.name || 'pcs'

                      return (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          {/* Product Info / Selector */}
                          <td className="py-3 px-4">
                            {!isDraft ? (
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

                          {/* Available Source Stock */}
                          <td className="py-3 px-3 text-center">
                            {hasProduct ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-muted/60 border border-border/80 text-xs font-mono font-bold text-foreground shadow-2xs">
                                {currentStockNum} <span className="text-[10px] text-muted-foreground ml-1 font-sans">{unitSymbol}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/60 font-mono">—</span>
                            )}
                          </td>

                          {/* Transfer Quantity Stepper Input */}
                          <td className="py-3 px-3">
                            {!isDraft ? (
                              <div className="text-center font-mono font-black text-xs sm:text-sm text-foreground">
                                {item.quantity} {unitSymbol}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <div className="inline-flex items-center rounded-xl bg-muted/40 border border-border/90 overflow-hidden shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleStepQuantity(idx, -1)}
                                    className="w-7 h-8 hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-sm cursor-pointer transition-colors flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, parseFloat(e.target.value) || 1))}
                                    required
                                    className="w-14 text-center text-xs font-black bg-transparent text-foreground outline-none py-1 font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleStepQuantity(idx, 1)}
                                    className="w-7 h-8 hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-sm cursor-pointer transition-colors flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Received Quantity Column (In Transit / Received status) */}
                          {isInTransit && (
                            <td className="py-3 px-3">
                              <input
                                type="number"
                                min="0"
                                value={item.quantity_received ?? item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity_received', Math.max(0, parseFloat(e.target.value) || 0))}
                                required
                                className="w-20 mx-auto block h-9 px-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl font-mono font-bold text-center text-emerald-600 dark:text-emerald-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </td>
                          )}

                          {isReceived && (
                            <td className="py-3 px-3 text-center text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {item.quantity_received} {unitSymbol}
                            </td>
                          )}

                          {/* Delete Item Action */}
                          {isDraft && (
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
                        <td colSpan={isDraft ? 4 : 3} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                            <p className="font-bold text-sm text-foreground">
                              {t('noTransferItemsYet', 'No items added to this transfer yet')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('useSearchOrAddHint', 'Use the search bar above or click below to add items')}
                            </p>
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
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">
                  {t('totalLines', 'Total Line Items')}:
                </span>
                <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg">
                  {items.filter(i => !!i.product_id).length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">
                  {t('totalTransferUnits', 'Total Units')}:
                </span>
                <span className="font-mono text-sm font-black px-3 py-1 rounded-xl border shadow-2xs bg-primary/10 text-primary border-primary/20">
                  {totalTransferredUnits} {t('units', 'Units')}
                </span>
              </div>
            </div>
          </FormCard>
        </div>
      </FormContent>
    </FormLayout>
  )
}

export default StockTransferForm
