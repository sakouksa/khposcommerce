import React, { useState, useEffect, useMemo } from 'react'
import {
  Loader2,
  Plus,
  Minus,
  Search,
  CheckCheck,
  ClipboardList
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventoryService'
import { companyService } from '@/services/companyService'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { FormLayout, FormContent, FormCard, FormHeader, FormFooter } from '@/components/common'

interface StockOpnameFormProps {
  opnameId?: number | null
  onClose?: () => void
}

type FilterTab = 'all' | 'discrepancy' | 'matched' | 'surplus' | 'deficit'

export const StockOpnameForm: React.FC<StockOpnameFormProps> = ({ opnameId, onClose }) => {
  const { t } = useTranslation(['inventory', 'buttons', 'common', 'products'])
  const toast = useToast()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  
  const initialId = opnameId ?? (params.id ? Number(params.id) : null)
  const [currentOpnameId, setCurrentOpnameId] = useState<number | null>(initialId)
  const isEdit = !!currentOpnameId

  useEffect(() => {
    if (params.id && Number(params.id) !== currentOpnameId) {
      setCurrentOpnameId(Number(params.id))
    }
  }, [params.id])

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate('/inventory?tab=opnames')
    }
  }

  // Form States
  const [warehouseId, setWarehouseId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<Array<{ id: number; product: any; system_quantity: number; physical_quantity: number; notes: string }>>([])
  
  // Search & Filter state for counting matrix
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('all')

  // Queries
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['stock-opname-detail', currentOpnameId],
    queryFn: () => inventoryService.getOpname(currentOpnameId!),
    enabled: isEdit,
  })

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => companyService.getWarehouses().then(r => r.data),
  })

  // Auto fill form if editing
  useEffect(() => {
    if (detail) {
      setWarehouseId(detail.warehouse_id?.toString() || '')
      setNotes(detail.notes || '')
      if (detail.items) {
        setItems(detail.items.map((it: any) => ({
          id: it.id,
          product: it.product,
          system_quantity: parseFloat(it.system_quantity) || 0,
          physical_quantity: it.physical_quantity !== null ? parseFloat(it.physical_quantity) : parseFloat(it.system_quantity),
          notes: it.notes || '',
        })))
      }
    }
  }, [detail])

  // Computed Values
  const selectedWarehouseObj = useMemo(
    () => warehouses?.find((w: any) => w.id.toString() === warehouseId),
    [warehouses, warehouseId]
  )

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => inventoryService.createOpname(payload),
    onSuccess: (res: any) => {
      const created = res?.data?.data || res?.data
      if (created?.id) {
        setCurrentOpnameId(created.id)
        navigate(`/inventory/opnames/${created.id}/edit`, { replace: true })
        qc.invalidateQueries({ queryKey: ['stock-opnames'] })
        qc.invalidateQueries({ queryKey: ['inventory-opnames'] })
        qc.invalidateQueries({ queryKey: ['stock-opname-detail', created.id] })
        toast.success(t('draftCreatedSuccess', 'Stock opname created and inventory snapshot taken successfully!'))
      } else {
        qc.invalidateQueries({ queryKey: ['stock-opnames'] })
        qc.invalidateQueries({ queryKey: ['inventory-opnames'] })
        handleClose()
      }
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || 'Unexpected server error.'
      toast.error(`${t('opnameStartError', 'Failed to start stock opname')}: ${errMsg}`)
    }
  })

  const updateItemsMutation = useMutation({
    mutationFn: (updatedItems: any[]) => inventoryService.updateOpnameItems(currentOpnameId!, updatedItems),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-opname-detail', currentOpnameId] })
      qc.invalidateQueries({ queryKey: ['inventory-opnames'] })
      toast.success(t('countsSavedSuccess', 'Physical counts saved successfully.'))
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || 'Server error.'
      toast.error(`${t('countsSaveError', 'Failed to save physical counts')}: ${errMsg}`)
    }
  })

  const completeMutation = useMutation({
    mutationFn: () => inventoryService.completeOpname(currentOpnameId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-opnames'] })
      qc.invalidateQueries({ queryKey: ['inventory-opnames'] })
      qc.invalidateQueries({ queryKey: ['inventory-levels'] })
      qc.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
      toast.success(t('reconcileSuccess', 'Stock opname count completed and discrepancies reconciled!'))
      handleClose()
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || 'Unexpected server error.'
      toast.error(`${t('opnameCompleteError', 'Failed to complete stock opname')}: ${errMsg}`)
    }
  })

  const handleStartOpname = (e: React.FormEvent) => {
    e.preventDefault()
    if (!warehouseId) {
      toast.error(t('selectWarehouseHint', 'Please select a warehouse location to start audit count'))
      return
    }
    createMutation.mutate({
      warehouse_id: parseInt(warehouseId),
      notes: notes || 'Periodic Stock Audit',
    })
  }

  const handleItemChange = (index: number, field: 'physical_quantity' | 'notes', value: any) => {
    setItems(prev => {
      const next = [...prev]
      if (next[index]) {
        next[index] = { ...next[index], [field]: value }
      }
      return next
    })
  }

  const handleStepPhysicalQuantity = (index: number, delta: number) => {
    setItems(prev => {
      const next = [...prev]
      if (next[index]) {
        const currentQty = Number(next[index].physical_quantity) || 0
        next[index] = { ...next[index], physical_quantity: Math.max(0, currentQty + delta) }
      }
      return next
    })
  }

  const handleSetAllToMatch = () => {
    setItems(prev => prev.map(it => ({
      ...it,
      physical_quantity: it.system_quantity,
    })))
  }

  const handleSaveProgress = () => {
    if (!currentOpnameId) return
    const payload = items.map(it => ({
      id: it.id,
      physical_quantity: it.physical_quantity,
      notes: it.notes || '',
    }))
    updateItemsMutation.mutate(payload)
  }

  const handleCompleteOpname = () => {
    if (!currentOpnameId) return
    const payload = items.map(it => ({
      id: it.id,
      physical_quantity: it.physical_quantity,
      notes: it.notes || '',
    }))
    updateItemsMutation.mutate(payload, {
      onSuccess: () => {
        completeMutation.mutate()
      }
    })
  }

  // Matrix Filtered and Computed stats
  const stats = useMemo(() => {
    let totalItems = items.length
    let matchedCount = 0
    let discrepancyCount = 0
    let surplusCount = 0
    let deficitCount = 0
    let totalSystemQty = 0
    let totalPhysicalQty = 0

    items.forEach(it => {
      totalSystemQty += it.system_quantity
      totalPhysicalQty += it.physical_quantity
      const diff = it.physical_quantity - it.system_quantity
      if (diff === 0) {
        matchedCount++
      } else {
        discrepancyCount++
        if (diff > 0) surplusCount++
        else deficitCount++
      }
    })

    const netVariance = totalPhysicalQty - totalSystemQty
    const accuracy = totalItems > 0 ? ((matchedCount / totalItems) * 100).toFixed(1) : '100'

    return {
      totalItems,
      matchedCount,
      discrepancyCount,
      surplusCount,
      deficitCount,
      totalSystemQty,
      totalPhysicalQty,
      netVariance,
      accuracy,
    }
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const matchSearch = searchQuery === '' || 
        it.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.product?.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.product?.barcode?.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false

      const diff = it.physical_quantity - it.system_quantity
      if (activeFilterTab === 'discrepancy') return diff !== 0
      if (activeFilterTab === 'matched') return diff === 0
      if (activeFilterTab === 'surplus') return diff > 0
      if (activeFilterTab === 'deficit') return diff < 0
      return true
    })
  }, [items, searchQuery, activeFilterTab])

  const formatNoteText = (noteText: string) => {
    if (!noteText) return ''
    if (noteText === 'Initial snapshot') return t('initialSnapshot', 'Initial snapshot')
    if (noteText.includes('Initial snapshot (0 stock)')) return t('initialSnapshotZero', 'Initial snapshot (0 stock)')
    return noteText
  }

  if (isEdit && loadingDetail) {
    return (
      <div className="p-16 text-center bg-card rounded-2xl border border-border shadow-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm font-bold text-foreground">{t('loadingOpnameData', 'Loading Stock Opname Data...')}</p>
        <p className="text-xs text-muted-foreground">{t('fetchingSnapshotDetails', 'Retrieving warehouse snapshot matrix...')}</p>
      </div>
    )
  }

  const status = detail?.status || (isEdit ? 'loading' : 'draft')
  const isDraft = status === 'draft'
  const isDone = status === 'done' || status === 'completed'

  return (
    <FormLayout
      onSubmit={isEdit ? (e) => e.preventDefault() : handleStartOpname}
      noValidate
      isSubmitting={createMutation.isPending || completeMutation.isPending || updateItemsMutation.isPending}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? t('opnameDetails', 'Stock Opname Audit')
              : t('create_opname', 'New Stock Opname')
          }
          subtitle={t('opname_desc', 'Snap system stock level snapshot and verify physical quantities.')}
          breadcrumbs={[
            { label: t('inventory', 'Inventory'), path: '/inventory' },
            { label: t('opnames', 'Stock Opnames'), path: '/inventory?tab=opnames' },
            { label: isEdit ? (detail?.reference_number || `OPN-${currentOpnameId}`) : t('create_opname', 'New Stock Opname') },
          ]}
          statusBadge={
            isEdit ? (
              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono shadow-2xs ${
                isDone
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {isDone ? t('statusDone', 'Completed') : t('statusDraft', 'In Progress')}
              </span>
            ) : undefined
          }
          onBack={handleClose}
          backLabel={t('common.back', 'Back')}
        />
      }
      footer={
        !isEdit ? (
          <FormFooter
            onCancel={handleClose}
            cancelLabel={t('common.cancel', 'Cancel')}
            isSubmitting={createMutation.isPending}
            submitLabel={t('startAuditSnapshot', 'Start Stock Audit Snapshot')}
            submitDisabled={!warehouseId}
          />
        ) : (
          <FormFooter
            onCancel={handleClose}
            cancelLabel={t('common.cancel', 'Cancel')}
            isEdit={isEdit}
            isSubmitting={completeMutation.isPending || updateItemsMutation.isPending}
            showSubmit={isDraft}
            submitLabel={t('reconcileStock', 'Reconcile & Complete Audit')}
            onSubmit={handleCompleteOpname}
            showShortcutHint={false}
            extraActions={
              isDraft ? (
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  disabled={updateItemsMutation.isPending}
                  className="h-10 px-4 text-xs font-bold border border-border/80 bg-card hover:bg-muted text-foreground rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {updateItemsMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                  <span>{t('saveProgress', 'Save Progress')}</span>
                </button>
              ) : undefined
            }
          />
        )
      }
    >
      {/* ─── INITIAL CREATION SCREEN (Before Snapshot) ────────────────────── */}
      {!isEdit && (
        <FormContent maxWidth="3xl" layout="two-column">
          {/* Left Column: Warehouse Selection & Setup (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <FormCard
              title={t('generalInfoCard', 'General Information')}
              subtitle={t('auditScopeAndWarehouse', 'Audit Scope & Target Warehouse')}
              contentClassName="space-y-4"
            >
              {/* Warehouse selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                  <span>{t('warehouse', 'Target Warehouse')} <span className="text-rose-500">*</span></span>
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
                  <option value="" className="dark:bg-slate-900">{t('selectWarehousePlaceholder', 'Choose warehouse hub...')}</option>
                  {(warehouses ?? []).map((w: any) => (
                    <option key={w.id} value={w.id.toString()} className="dark:bg-slate-900">
                      {w.name} {w.code ? `(${w.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Audit Notes */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-foreground">
                  {t('notes', 'Audit Notes / Purpose')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={t('auditDescPlaceholder', 'e.g., Monthly Cycle Count, Mid-Year Audit, End-of-Week Reconciliation...')}
                  className="w-full p-3 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-medium placeholder:text-muted-foreground/60"
                />
              </div>
            </FormCard>
          </div>

          {/* Right Column: Interactive Feature Card (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <FormCard
              title={t('howOpnameWorks', 'How Stock Audit Works')}
              subtitle={t('smartCycleCounting', 'Enterprise Stock Audit Workflow')}
              badge={
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  Standard SOP
                </span>
              }
              contentClassName="space-y-4"
            >
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('opnameWorkflowExplanation', 'Stock Audit allows warehouse managers to record a frozen snapshot of book inventory, record actual physical items counted on the shelves, calculate discrepancy variances, and automatically reconcile stock levels upon completion.')}
              </p>

              {/* 3 Step Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-primary uppercase block">Step 01</span>
                  <h4 className="text-xs font-bold text-foreground">{t('snapStock', '1. Snap Stock')}</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">{t('snapStockDesc', 'Captures live quantities across all catalog SKUs in selected warehouse.')}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Step 02</span>
                  <h4 className="text-xs font-bold text-foreground">{t('countAndVerify', '2. Count & Verify')}</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">{t('countAndVerifyDesc', 'Count real stock in bins & aisles, enter counts with discrepancy alerts.')}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase block">Step 03</span>
                  <h4 className="text-xs font-bold text-foreground">{t('autoReconcile', '3. Auto Reconcile')}</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">{t('autoReconcileDesc', 'Applies adjustment ledger movements and brings balance to 100%.')}</p>
                </div>
              </div>

              {/* Pre-flight Warehouse Status */}
              {selectedWarehouseObj ? (
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground truncate">{selectedWarehouseObj.name}</p>
                      {selectedWarehouseObj.code && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                          {selectedWarehouseObj.code}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {selectedWarehouseObj.address || t('activeWarehouseHub', 'Active Warehouse Hub')}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white text-center shrink-0 shadow-2xs">
                    {t('readyToSnap', 'Ready to Snapshot')}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-dashed border-border/70 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    {t('selectWarehouseHint', 'Please select a warehouse location on the left to initialize audit scope.')}
                  </p>
                </div>
              )}
            </FormCard>
          </div>
        </FormContent>
      )}

      {/* ─── ACTIVE COUNTING MATRIX SCREEN (Editing / In Progress) ────────── */}
      {isEdit && (
        <FormContent maxWidth="3xl" layout="single">
          <div className="space-y-6">
            {/* Header Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('auditedSKUs', 'Total SKUs Audited')}</span>
                <p className="text-xl font-black text-foreground font-mono">{items.length}</p>
              </div>

              <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('system_qty', 'System Book Units')}</span>
                <p className="text-xl font-black text-foreground font-mono">{stats.totalSystemQty}</p>
              </div>

              <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('physical_qty', 'Physical Counted')}</span>
                <p className="text-xl font-black text-foreground font-mono">{stats.totalPhysicalQty}</p>
              </div>

              <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('variance', 'Net Discrepancy')}</span>
                <p className={`text-xl font-black font-mono ${stats.netVariance > 0 ? 'text-emerald-600 dark:text-emerald-400' : stats.netVariance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                  {stats.netVariance > 0 ? `+${stats.netVariance}` : stats.netVariance}
                </p>
              </div>
            </div>

            {/* Main Matrix Card */}
            <FormCard
              title={t('opnameMatrixTitle', 'Inventory Count Matrix')}
              subtitle={t('opnameMatrixSubtitle', 'Verify physical inventory against frozen system book quantities')}
              badge={
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {filteredItems.length} / {items.length} {t('linesCount', 'Items')}
                </span>
              }
              contentClassName="p-0 space-y-0"
            >
              {/* Search & Filter Tabs Toolbar */}
              <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilterTab === 'all'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('all', 'All')} ({items.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('discrepancy')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilterTab === 'discrepancy'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('discrepancies', 'Discrepancies')} ({stats.discrepancyCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('matched')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilterTab === 'matched'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('matched', 'Matched')} ({stats.matchedCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('surplus')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilterTab === 'surplus'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('surplus', 'Surplus (+)')} ({stats.surplusCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('deficit')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeFilterTab === 'deficit'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('shortage', 'Shortage (-)')} ({stats.deficitCount})
                  </button>
                </div>

                {/* Search & Quick Action Buttons */}
                <div className="flex items-center gap-2.5">
                  <div className="relative min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchProductOrSku', 'Search product or SKU...')}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all font-medium"
                    />
                  </div>

                  {isDraft && (
                    <button
                      type="button"
                      onClick={handleSetAllToMatch}
                      title={t('setAllToMatchTooltip', 'Fill all physical quantities with system quantities')}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
                    >
                      <CheckCheck size={14} className="text-emerald-500" />
                      <span className="hidden sm:inline">{t('matchAll', 'Match All')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Items Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted/30">
                      <th className="py-3.5 px-4">{t('colProduct', 'Product / SKU')}</th>
                      <th className="py-3.5 px-4 w-36 text-center">{t('system_qty', 'System Book Qty')}</th>
                      <th className="py-3.5 px-4 w-52 text-center">{t('physical_qty', 'Physical Counted')}</th>
                      <th className="py-3.5 px-4 w-36 text-center">{t('variance', 'Variance Diff')}</th>
                      <th className="py-3.5 px-4">{t('itemNotes', 'Discrepancy Reason / Notes')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-semibold">
                    {filteredItems.map((item) => {
                      const originalIndex = items.findIndex(it => it.id === item.id)
                      const variance = item.physical_quantity - item.system_quantity
                      
                      return (
                        <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                          {/* Product info */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-xs text-foreground block">
                                {item.product?.name || 'Unknown Product'}
                              </span>
                              {item.product?.sku && (
                                <span className="font-mono text-[11px] text-muted-foreground block">
                                  {item.product.sku}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* System Qty */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold text-xs bg-muted/60 px-3 py-1.5 rounded-lg text-foreground border border-border/70 inline-block">
                              {item.system_quantity}
                            </span>
                          </td>

                          {/* Physical Qty Stepper */}
                          <td className="py-3.5 px-4">
                            {isDone ? (
                              <div className="text-center font-mono font-black text-sm text-foreground">
                                {item.physical_quantity}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStepPhysicalQuantity(originalIndex, -1)}
                                  className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                                >
                                  <Minus size={13} />
                                </button>
                                <input
                                  type="number"
                                  value={item.physical_quantity}
                                  onChange={(e) => handleItemChange(originalIndex, 'physical_quantity', parseInt(e.target.value, 10) || 0)}
                                  min="0"
                                  step="1"
                                  className="w-20 h-8 px-2 bg-background border border-border rounded-lg font-mono font-bold text-center text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleStepPhysicalQuantity(originalIndex, 1)}
                                  className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Variance badge */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold ${
                              variance > 0
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : variance < 0
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  : 'bg-muted/40 text-muted-foreground border border-border/40'
                            }`}>
                              {variance > 0 ? `+${variance}` : variance}
                            </span>
                          </td>

                          {/* Note input */}
                          <td className="py-3.5 px-4">
                            {isDone ? (
                              <span className="text-muted-foreground font-normal italic text-[11px]">
                                {formatNoteText(item.notes) || '—'}
                              </span>
                            ) : (
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => handleItemChange(originalIndex, 'notes', e.target.value)}
                                placeholder={t('reasonDiffPlaceholder', 'Reason for diff...')}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs focus:outline-none focus:border-primary transition-all font-medium placeholder:text-muted-foreground/50"
                              />
                            )}
                          </td>
                        </tr>
                      )
                    })}

                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-muted-foreground text-xs">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <p className="font-bold text-foreground">
                              {t('noMatchingItems', 'No items match your filter criteria.')}
                            </p>
                            <p className="text-[11px]">
                              {t('tryAdjustingSearchOrTab', 'Try adjusting your search query or switching tabs.')}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </FormCard>
          </div>
        </FormContent>
      )}
    </FormLayout>
  )
}

export default StockOpnameForm
