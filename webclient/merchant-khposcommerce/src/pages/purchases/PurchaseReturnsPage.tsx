import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Eye, RefreshCw, X, ArrowLeftRight, Loader2,
  CheckCircle, Check, Trash2, Printer, Calendar, Tag, Info, Trash,
  ChevronUp, ChevronDown, RotateCcw, DollarSign, Wallet, Truck,
  Warehouse, Filter, Settings, Download, Sliders, AlertCircle,
  Hash, CreditCard, ExternalLink
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { purchaseService } from '@/services/purchaseService'
import { supplierService } from '@/services/supplierService'
import { companyService } from '@/services/companyService'
import { userService } from '@/services/userService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import TableActionMenu from '@/components/shared/TableActionMenu'
import Breadcrumb from '@/components/common/Breadcrumb'
import ColumnSettingsPopover from '@/components/shared/ColumnSettingsPopover'
import ModernSelect from '@/components/shared/ModernSelect'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  FilterButton,
  RefreshButton,
  ResetButton,
  EmptyState,
  TableToolbar,
  EnterpriseModal,
  ModalFooter,
  EnterpriseDatePicker,
} from '@/components/common'
import { downloadCsv } from '@/utils/export'

// Types & Sub-components
import { RETURN_STATUS_BADGE, REFUND_STATUS_BADGE, type PurchaseReturn } from './types/purchaseReturn.types'
import { PurchaseReturnsStatsCards } from './components/PurchaseReturnsStatsCards'
import { PurchaseReturnsFilterDrawer } from './components/PurchaseReturnsFilterDrawer'
import { PurchaseReturnPrintVoucher } from './components/PurchaseReturnPrintVoucher'
import { ShippingCarrierSelect } from './components/ShippingCarrierSelect'
import { formatCurrency } from './utils/purchaseCurrency'

const PurchaseReturnsPage: React.FC = () => {
  const { t } = useTranslation(['purchases', 'common', 'nav'])
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()

  const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null)
  const [printReturn, setPrintReturn] = useState<PurchaseReturn | null>(null)
  const [approveTarget, setApproveTarget] = useState<PurchaseReturn | null>(null)
  const [cancelTarget, setCancelTarget] = useState<PurchaseReturn | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PurchaseReturn | null>(null)

  // Enterprise Modals State
  const [shipTarget, setShipTarget] = useState<PurchaseReturn | null>(null)
  const [shippingCarrier, setShippingCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  const [settleTarget, setSettleTarget] = useState<PurchaseReturn | null>(null)
  const [refundStatus, setRefundStatus] = useState<'offset' | 'credited' | 'refunded'>('credited')
  const [refundMethod, setRefundMethod] = useState<'credit_note' | 'bank_transfer' | 'cash' | 'offset_invoice' | 'replacement'>('credit_note')
  const [refundAmount, setRefundAmount] = useState<number | string>('')
  const [refundDate, setRefundDate] = useState(new Date().toISOString().split('T')[0])
  const [settlementNotes, setSettlementNotes] = useState('')

  const handlePrint = (ret: PurchaseReturn) => {
    setPrintReturn(ret)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  // Column Customization State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    reference: true,
    poReference: true,
    rma: true,
    supplier: true,
    date: true,
    items: true,
    amount: true,
    status: true,
    refundStatus: true,
  })

  // Filters state
  const [statusFilter, setStatusFilter] = useState('')
  const [refundStatusFilter, setRefundStatusFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [purchaseRefFilter, setPurchaseRefFilter] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [minReturnAmountFilter, setMinReturnAmountFilter] = useState('')
  const [maxReturnAmountFilter, setMaxReturnAmountFilter] = useState('')
  const [returnDateStartFilter, setReturnDateStartFilter] = useState('')
  const [returnDateEndFilter, setReturnDateEndFilter] = useState('')
  const [createdByFilter, setCreatedByFilter] = useState('')

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset
  } = useServerPagination({ storageKey: 'purchase-returns' })

  const handleResetFilters = () => {
    setStatusFilter('')
    setRefundStatusFilter('')
    setSupplierFilter('')
    setPurchaseRefFilter('')
    setWarehouseFilter('')
    setMinReturnAmountFilter('')
    setMaxReturnAmountFilter('')
    setReturnDateStartFilter('')
    setReturnDateEndFilter('')
    setCreatedByFilter('')
    reset()
  }

  // Lookups
  const { data: filterSuppliers } = useQuery({
    queryKey: ['filter-suppliers-list'],
    queryFn: () => supplierService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: filterWarehouses } = useQuery({
    queryKey: ['filter-warehouses-list'],
    queryFn: () => companyService.getWarehouses().then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: filterUsers } = useQuery({
    queryKey: ['filter-users-list'],
    queryFn: () => userService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  // Returns Query
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'purchase-returns', page, debouncedSearch, perPage, sortBy, sortOrder,
      statusFilter, refundStatusFilter, supplierFilter, purchaseRefFilter,
      warehouseFilter, minReturnAmountFilter, maxReturnAmountFilter,
      returnDateStartFilter, returnDateEndFilter, createdByFilter
    ],
    queryFn: () => purchaseService.getReturns({
      page,
      search: debouncedSearch,
      per_page: perPage,
      sort_by: sortBy,
      sort_order: sortOrder,
      status: statusFilter || undefined,
      refund_status: refundStatusFilter || undefined,
      supplier_id: supplierFilter || undefined,
      purchase_reference: purchaseRefFilter || undefined,
      warehouse_id: warehouseFilter || undefined,
      min_amount: minReturnAmountFilter || undefined,
      max_amount: maxReturnAmountFilter || undefined,
      start_date: returnDateStartFilter || undefined,
      end_date: returnDateEndFilter || undefined,
      created_by: createdByFilter || undefined
    }),
    placeholderData: (prev) => prev,
  })

  const returns: PurchaseReturn[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: number) => purchaseService.approveReturn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.toast.returnApprovedSuccess', 'Purchase return approved. Inventory debited & AP offset.'))
      setApproveTarget(null)
      setSelectedReturn(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error')),
  })

  const shipMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => purchaseService.shipReturn(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.toast.returnShippedSuccess', 'Return marked as shipped.'))
      setShipTarget(null)
      setSelectedReturn(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error')),
  })

  const settleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => purchaseService.settleReturn(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.toast.returnSettledSuccess', 'Supplier refund / credit note recorded.'))
      setSettleTarget(null)
      setSelectedReturn(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error')),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => purchaseService.cancelReturn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(t('purchases.toast.returnCancelledSuccess', 'Purchase return cancelled.'))
      setCancelTarget(null)
      setSelectedReturn(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseService.deleteReturn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      toast.success(t('purchases.toast.returnDeletedSuccess', 'Purchase return deleted successfully.'))
      setDeleteTarget(null)
      setSelectedReturn(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error')),
  })

  const handleOpenShipModal = (ret: PurchaseReturn) => {
    setShipTarget(ret)
    setShippingCarrier(ret.shipping_carrier || '')
    setTrackingNumber(ret.tracking_number || '')
  }

  const handleOpenSettleModal = (ret: PurchaseReturn) => {
    setSettleTarget(ret)
    setRefundStatus(ret.refund_status === 'offset' ? 'offset' : 'credited')
    setRefundMethod((ret.refund_method as any) || 'credit_note')
    setRefundAmount(ret.refund_amount || ret.total_amount || 0)
    setRefundDate(ret.refund_date || new Date().toISOString().split('T')[0])
    setSettlementNotes(ret.settlement_notes || '')
  }

  const handleExportCSV = () => {
    const infoId = toast.info(t('purchases.toast.exportDownloading', 'Downloading purchase returns dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('purchases.returnReference', 'Return Ref #'),
          t('purchases.purchaseReference', 'PO Ref'),
          t('purchases.rmaNumber', 'RMA #'),
          t('purchases.supplier', 'Supplier'),
          t('common.date', 'Date'),
          t('purchases.items', 'Items Count'),
          t('purchases.totalAmount', 'Total Amount ($)'),
          t('purchases.status', 'Status'),
          t('purchases.refundStatus', 'Settlement Status'),
        ]
        const rows = (returns || []).map((r: PurchaseReturn) => [
          r.reference_number || '',
          r.purchase?.reference_number || '',
          r.rma_number || '',
          r.supplier?.name || '',
          r.date ? new Date(r.date).toLocaleDateString() : '',
          String(r.items?.length || 0),
          Number(r.total_amount || 0).toFixed(2),
          r.status,
          r.refund_status || 'pending',
        ])
        downloadCsv('purchase_returns_ledger', headers, rows)
        toast.dismiss(infoId)
        toast.success(t('purchases.toast.exportSuccess', 'Purchase returns exported successfully.'))
      } catch (e) {
        toast.dismiss(infoId)
        toast.error(t('toast.error', 'Export failed'))
      }
    }, 300)
  }

  const totalReturnValue = returns.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0)

  const columnOptions = [
    { key: 'reference', label: t('purchases.returnReference', 'Return Ref') },
    { key: 'poReference', label: t('purchases.purchaseReference', 'PO Ref') },
    { key: 'rma', label: t('purchases.rmaNumber', 'RMA #') },
    { key: 'supplier', label: t('purchases.supplier', 'Supplier') },
    { key: 'date', label: t('common.date', 'Date') },
    { key: 'items', label: t('purchases.items', 'Items') },
    { key: 'amount', label: t('purchases.totalAmount', 'Amount') },
    { key: 'status', label: t('purchases.status', 'Status') },
    { key: 'refundStatus', label: t('purchases.refundStatus', 'Settlement') },
  ]

  const activeFilterCount = [
    statusFilter,
    refundStatusFilter,
    supplierFilter,
    purchaseRefFilter,
    warehouseFilter,
    minReturnAmountFilter,
    maxReturnAmountFilter,
    returnDateStartFilter,
    returnDateEndFilter,
    createdByFilter,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* ─── Global Standard Page Header ─── */}
      <div className="print:hidden space-y-2">
        <Breadcrumb
          items={[
            { label: t('nav.purchases', t('purchases.purchases', 'Purchases')), path: '/purchases' },
            { label: t('purchases.purchaseReturns', 'Purchase Returns') }
          ]}
        />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-1">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {t('purchases.purchaseReturns', 'Purchase Returns (Debit Notes)')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {t('purchases.returnSubtitle', 'Return damaged or excess goods back to vendor, deduct stock, and sync Accounts Payable')}
            </p>
          </div>

          <HeaderActionsGroup>
            <ExportButton
              onClick={handleExportCSV}
              label={t('common.exportCsv', 'Export CSV')}
            />
            <AddButton
              onClick={() => navigate('/purchases/returns/create')}
              label={t('purchases.createReturn', 'Create Return')}
            />
          </HeaderActionsGroup>
        </div>
      </div>

      {/* ─── Global Standard KPI Stats Cards ─── */}
      <PurchaseReturnsStatsCards returns={returns} totalAmount={totalReturnValue} />

      {/* ─── Global Standard Table Toolbar ─── */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder={t('purchases.searchReturnsPlaceholder', 'Search Return Ref, RMA, PO Ref, Supplier...')}
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={activeFilterCount > 0}
        filterActiveCount={activeFilterCount}
        onReset={handleResetFilters}
        onRefresh={() => refetch()}
        refreshLoading={isFetching}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

        {/* Active Filter Chips */}
        {(Boolean(search) || activeFilterCount > 0) && (
          <div className="flex items-center gap-2 flex-wrap text-xs print:hidden px-1 animate-in fade-in duration-200">
            <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
              {t('common.activeFilters', 'Active Filters')}:
            </span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                <span className="text-[11px] text-muted-foreground">{t('common.search', 'Search')}:</span>
                <span className="font-semibold">{search}</span>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                <span className="text-[11px] text-muted-foreground">{t('purchases.status', 'Status')}:</span>
                <span className="font-semibold capitalize">{statusFilter}</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {refundStatusFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium">
                <span className="text-[11px] text-muted-foreground">{t('purchases.refundStatus', 'Settlement')}:</span>
                <span className="font-semibold capitalize">{refundStatusFilter}</span>
                <button
                  type="button"
                  onClick={() => setRefundStatusFilter('')}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors cursor-pointer"
                >
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        )}

      {/* ─── Global Standard Data Table (Clean, No Checkbox) ─── */}
      <div className="bg-card dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 shadow-xs overflow-hidden print:hidden">
        <TableWrapper isFetching={isFetching}>
          <table className="w-full data-table">
            <thead>
              <tr className="bg-muted/30 dark:bg-slate-800/40 border-b border-border dark:border-slate-800">
                {visibleColumns.reference !== false && (
                  <th onClick={() => handleSort('reference_number')} className="text-left cursor-pointer hover:bg-muted dark:hover:bg-slate-800/60 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('purchases.returnReference', 'Return Ref')} {renderSortIcon('reference_number')}
                  </th>
                )}
                {visibleColumns.poReference !== false && (
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('purchases.purchaseReference', 'PO Ref')}
                  </th>
                )}
                {visibleColumns.rma !== false && (
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('purchases.rmaNumber', 'RMA #')}
                  </th>
                )}
                {visibleColumns.supplier !== false && (
                  <th onClick={() => handleSort('supplier_id')} className="text-left cursor-pointer hover:bg-muted dark:hover:bg-slate-800/60 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('purchases.supplier', 'Supplier')} {renderSortIcon('supplier_id')}
                  </th>
                )}
                {visibleColumns.date !== false && (
                  <th onClick={() => handleSort('date')} className="text-left cursor-pointer hover:bg-muted dark:hover:bg-slate-800/60 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('common.date', 'Date')} {renderSortIcon('date')}
                  </th>
                )}
                {visibleColumns.items !== false && (
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('purchases.items', 'Items')}
                  </th>
                )}
                {visibleColumns.amount !== false && (
                  <th onClick={() => handleSort('total_amount')} className="text-left cursor-pointer hover:bg-muted dark:hover:bg-slate-800/60 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('purchases.totalAmount', 'Amount ($)')} {renderSortIcon('total_amount')}
                  </th>
                )}
                {visibleColumns.status !== false && (
                  <th onClick={() => handleSort('status')} className="text-left cursor-pointer hover:bg-muted dark:hover:bg-slate-800/60 py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('purchases.status', 'Status')} {renderSortIcon('status')}
                  </th>
                )}
                {visibleColumns.refundStatus !== false && (
                  <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {t('purchases.refundStatus', 'Settlement')}
                  </th>
                )}
                <th className="sticky right-0 z-20 bg-card dark:bg-slate-900 border-l border-border dark:border-slate-800 text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground dark:text-slate-400 whitespace-nowrap min-w-[96px]">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {visibleColumns.reference !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded" /></td>}
                    {visibleColumns.poReference !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                    {visibleColumns.rma !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                    {visibleColumns.supplier !== false && <td className="p-4"><div className="skeleton h-4 w-28 rounded" /></td>}
                    {visibleColumns.date !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                    {visibleColumns.items !== false && <td className="p-4"><div className="skeleton h-4 w-12 rounded" /></td>}
                    {visibleColumns.amount !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                    {visibleColumns.status !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                    {visibleColumns.refundStatus !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                    <td className="p-4"><div className="skeleton h-4 w-12 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12">
                    <EmptyState
                      icon={<RotateCcw size={26} />}
                      title={t('purchases.noReturnsFound', 'No purchase returns found')}
                      description={t('purchases.noReturnsDesc', 'Create a new purchase return to send damaged or excess stock back to suppliers.')}
                      action={{
                        label: t('purchases.createReturn', 'Create Return'),
                        onClick: () => navigate('/purchases/returns/create')
                      }}
                    />
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr
                    key={ret.id}
                    className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/purchases/returns/${ret.id}`)}
                  >
                    {visibleColumns.reference !== false && (
                      <td className="py-3 px-4 font-mono font-bold text-xs text-primary whitespace-nowrap">
                        {ret.reference_number}
                      </td>
                    )}
                    {visibleColumns.poReference !== false && (
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                        {ret.purchase?.reference_number ?? '—'}
                      </td>
                    )}
                    {visibleColumns.rma !== false && (
                      <td className="py-3 px-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {ret.rma_number || '—'}
                      </td>
                    )}
                    {visibleColumns.supplier !== false && (
                      <td className="py-3 px-4 text-xs font-semibold text-foreground dark:text-slate-100 whitespace-nowrap">
                        {ret.supplier?.name ?? '—'}
                      </td>
                    )}
                    {visibleColumns.date !== false && (
                      <td className="py-3 px-4 text-xs text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                        {ret.date ? new Date(ret.date).toLocaleDateString() : (ret.created_at ? new Date(ret.created_at).toLocaleDateString() : '—')}
                      </td>
                    )}
                    {visibleColumns.items !== false && (
                      <td className="py-3 px-4 text-xs text-foreground dark:text-slate-100 font-semibold font-mono whitespace-nowrap">
                        {ret.items?.length || 0}
                      </td>
                    )}
                    {visibleColumns.amount !== false && (
                      <td className="py-3 px-4 font-mono font-bold text-xs text-foreground dark:text-slate-100 whitespace-nowrap">
                        ${Number(ret.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    )}
                    {visibleColumns.status !== false && (
                      <td className="py-3 px-4 whitespace-nowrap text-xs font-bold">
                        <span className={RETURN_STATUS_BADGE[ret.status] || 'inline-flex items-center justify-center px-2 py-0.5 rounded text-xs bg-muted dark:bg-slate-800'}>
                          {ret.status === 'completed'
                            ? t('purchases.completed', 'Completed')
                            : ret.status === 'shipped'
                            ? t('purchases.shipped', 'Shipped')
                            : ret.status === 'approved'
                            ? t('purchases.approved', 'Approved')
                            : ret.status === 'cancelled'
                            ? t('purchases.cancelled', 'Cancelled')
                            : t('purchases.draft', 'Draft')}
                        </span>
                      </td>
                    )}
                    {visibleColumns.refundStatus !== false && (
                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <span className={REFUND_STATUS_BADGE[ret.refund_status || 'pending'] || 'px-2 py-0.5 rounded text-xs bg-muted dark:bg-slate-800'}>
                          {ret.refund_status === 'offset'
                            ? t('purchases.statusOffsetAP', 'Offset AP')
                            : ret.refund_status === 'credited'
                            ? t('purchases.statusCredited', 'Credited')
                            : ret.refund_status === 'refunded'
                            ? t('purchases.statusRefunded', 'Refunded')
                            : t('purchases.statusPendingRefund', 'Pending')}
                        </span>
                      </td>
                    )}
                    <td className="sticky right-0 z-10 bg-card dark:bg-slate-900 group-hover:bg-muted/40 dark:group-hover:bg-slate-800/60 transition-colors border-l border-border dark:border-slate-800 py-3 px-4 text-center whitespace-nowrap min-w-[96px]" onClick={(e) => e.stopPropagation()}>
                      <TableActionMenu
                        onView={() => navigate(`/purchases/returns/${ret.id}`)}
                        onEdit={ret.status === 'draft' ? () => navigate(`/purchases/returns/${ret.id}/edit`) : undefined}
                        onPrint={() => handlePrint(ret)}
                        onDelete={ret.status === 'draft' ? () => setDeleteTarget(ret) : undefined}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </div>

      {/* Filter Drawer */}
      <PurchaseReturnsFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        suppliers={filterSuppliers || []}
        warehouses={filterWarehouses || []}
        users={filterUsers || []}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        refundStatusFilter={refundStatusFilter}
        setRefundStatusFilter={setRefundStatusFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={setWarehouseFilter}
        minReturnAmountFilter={minReturnAmountFilter}
        setMinReturnAmountFilter={setMinReturnAmountFilter}
        maxReturnAmountFilter={maxReturnAmountFilter}
        setMaxReturnAmountFilter={setMaxReturnAmountFilter}
        returnDateStartFilter={returnDateStartFilter}
        setReturnDateStartFilter={setReturnDateStartFilter}
        returnDateEndFilter={returnDateEndFilter}
        setReturnDateEndFilter={setReturnDateEndFilter}
        createdByFilter={createdByFilter}
        setCreatedByFilter={setCreatedByFilter}
        onReset={handleResetFilters}
        setPage={setPage}
      />

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        open={!!approveTarget}
        onCancel={() => setApproveTarget(null)}
        onConfirm={() => {
          if (approveTarget) approveMutation.mutate(approveTarget.id)
        }}
        title={t('purchases.approveReturnTitle', 'Approve Purchase Return & Deduct Stock')}
        message={t('purchases.confirmApproveReturnMessage', {
          ref: approveTarget?.reference_number,
          defaultValue: `Are you sure you want to approve Return "${approveTarget?.reference_number}"? Inventory will be debited and outstanding PO due balance will be offset immediately.`
        })}
        confirmText={t('purchases.approve', 'Approve & Offset AP')}
        loading={approveMutation.isPending}
        variant="warning"
      />

      {/* Ship Return Modal Dialog */}
      <EnterpriseModal
        isOpen={!!shipTarget}
        onClose={() => setShipTarget(null)}
        title={t('purchases.shipToSupplier', 'Ship Items to Supplier')}
        subtitle={shipTarget ? `${shipTarget.reference_number || `#PRT-${shipTarget.id}`} • ${t('purchases.shipToSupplierSubtitle', 'Record shipping carrier and tracking waybill information')}` : undefined}
        icon={<Truck size={20} />}
        iconVariant="indigo"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setShipTarget(null)}
            onSubmit={() => {
              if (shipTarget) {
                shipMutation.mutate({
                  id: shipTarget.id,
                  payload: { shipping_carrier: shippingCarrier, tracking_number: trackingNumber }
                })
              }
            }}
            submitLabel={t('purchases.confirmShip', 'Confirm Shipment')}
            submitIcon={<Truck size={15} />}
            isSubmitting={shipMutation.isPending}
            submitButtonType="button"
            submitVariant="primary"
          />
        }
      >
        <div className="p-6 space-y-4">
          <ShippingCarrierSelect
            value={shippingCarrier}
            onChange={setShippingCarrier}
          />

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('purchases.trackingNumber', 'Tracking / Waybill #')}
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t('purchases.trackingNumberPlaceholder', 'e.g. TRK-8828192')}
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* Settle Refund / Credit Note Modal Dialog */}
      <EnterpriseModal
        isOpen={!!settleTarget}
        onClose={() => setSettleTarget(null)}
        title={t('purchases.settleRefund', 'Settle / Issue Credit Note')}
        subtitle={settleTarget ? `${settleTarget.reference_number || `#PRT-${settleTarget.id}`} • ${t('purchases.settleRefundSubtitle', 'Record supplier refund, debit note, or accounts payable offset')}` : undefined}
        icon={<Wallet size={20} />}
        iconVariant="purple"
        size="lg"
        footer={
          <ModalFooter
            onCancel={() => setSettleTarget(null)}
            onSubmit={() => {
              if (settleTarget) {
                settleMutation.mutate({
                  id: settleTarget.id,
                  payload: {
                    refund_status: refundStatus,
                    refund_method: refundMethod,
                    refund_amount: Number(refundAmount) || settleTarget.total_amount,
                    refund_date: refundDate,
                    settlement_notes: settlementNotes,
                  }
                })
              }
            }}
            submitLabel={t('purchases.confirmSettlement', 'Confirm Settlement')}
            submitIcon={<Check size={15} />}
            isSubmitting={settleMutation.isPending}
            submitButtonType="button"
            submitVariant="primary"
          />
        }
      >
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold mb-1 text-foreground">{t('purchases.refundStatus', 'Settlement Status')}</label>
              <ModernSelect
                value={refundStatus}
                onChange={(val) => setRefundStatus(val as any)}
                options={[
                  { value: 'credited', label: t('purchases.statusCreditedOption', 'Supplier Credited (Debit Note Active)') },
                  { value: 'refunded', label: t('purchases.statusRefundedOption', 'Cash / Bank Refund Received') },
                  { value: 'offset', label: t('purchases.statusOffsetAPOption', 'Offset Against AP Balance') },
                ]}
                placeholder={t('purchases.selectStatusPlaceholder', 'Select status')}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-foreground">{t('purchases.settlementMethod', 'Settlement Method')}</label>
              <ModernSelect
                value={refundMethod}
                onChange={(val) => setRefundMethod(val as any)}
                options={[
                  { value: 'credit_note', label: t('purchases.methodCreditNote', 'Credit Note / Debit Note') },
                  { value: 'bank_transfer', label: t('purchases.methodBankTransfer', 'Bank Transfer') },
                  { value: 'cash', label: t('purchases.methodCash', 'Cash') },
                  { value: 'offset_invoice', label: t('purchases.methodOffsetInvoice', 'Offset Future Invoices') },
                  { value: 'replacement', label: t('purchases.methodReplacement', 'Goods Replacement') },
                ]}
                placeholder={t('purchases.selectMethodPlaceholder', 'Select method')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold mb-1 text-foreground">{t('purchases.settlementAmount', 'Settlement Amount ($)')}</label>
              <input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-foreground font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <EnterpriseDatePicker
                label={t('purchases.settlementDate', 'Settlement Date')}
                value={refundDate}
                onChange={setRefundDate}
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-foreground">{t('purchases.settlementNotes', 'Settlement Notes')}</label>
            <textarea
              rows={3}
              value={settlementNotes}
              onChange={(e) => setSettlementNotes(e.target.value)}
              placeholder={t('purchases.settlementNotesPlaceholder', 'Optional audit notes...')}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        open={!!cancelTarget}
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) cancelMutation.mutate(cancelTarget.id)
        }}
        title={t('purchases.cancelReturnTitle', 'Cancel Purchase Return')}
        message={t('purchases.confirmCancelReturnMessage', {
          ref: cancelTarget?.reference_number,
          defaultValue: `Are you sure you want to cancel Return "${cancelTarget?.reference_number}"? If already approved, stock and due amounts will be rolled back.`
        })}
        confirmText={t('purchases.cancel', 'Cancel Return')}
        loading={cancelMutation.isPending}
        variant="danger"
      />

      {/* Single Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
        title={t('purchases.deletePurchaseReturn', 'Delete Purchase Return')}
        message={t('purchases.confirmDeleteReturnMessage', {
          ref: deleteTarget?.reference_number,
          defaultValue: `Are you sure you want to delete Return "${deleteTarget?.reference_number}"? This action cannot be undone.`
        })}
        confirmText={t('common.delete', 'Delete')}
        loading={deleteMutation.isPending}
        variant="danger"
      />

      {/* Hidden Print Voucher */}
      {printReturn && <PurchaseReturnPrintVoucher returnData={printReturn} />}
    </div>
  )
}

export default PurchaseReturnsPage
