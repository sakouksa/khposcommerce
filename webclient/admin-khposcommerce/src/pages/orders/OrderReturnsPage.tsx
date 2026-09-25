import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Eye,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Plus,
  Check,
} from 'lucide-react'
import { orderReturnService } from '@/services/orderReturnService'
import type { OrderReturn, ReturnStatus, ReturnFault, ConditionGrade, InventoryAction } from '@/types/orderReturn.types'
import { useToast } from '@/hooks/useToast'
import {
  Breadcrumb,
  RibbonStatsCard,
  RibbonStatsGrid,
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  TableToolbar,
  TableWrapper,
  TableEmptyState,
  EnterpriseModal,
  ModalFooter,
  TableActionMenu,
  FormField,
  ProductThumbnail,
} from '@/components/common'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import { usePageTab } from '@/hooks/usePageTab'
import Pagination from '@/components/shared/Pagination'
import { downloadCsv } from '@/utils/export'
import { GlobalFormat } from '@/utils/formatters'
import { OrderReturnPrintModal } from './components/OrderReturnPrintModal'
import { CreateOrderReturnModal } from './components/CreateOrderReturnModal'

const KHR_RATE = 4100

const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:[color-scheme:dark]'

const labelCls =
  'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'

const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

const textareaCls =
  'w-full min-h-[70px] px-3.5 py-2.5 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'

export const OrderReturnsPage: React.FC = () => {
  const { t } = useTranslation(['returns', 'nav', 'sales', 'orders', 'common'])
  const toast = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Pagination & Filters State
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = usePageTab<string>({
    paramKey: 'status',
    storageKey: 'order_returns_active_status',
    defaultTab: 'all',
    validTabs: ['all', 'requested', 'approved', 'in_transit', 'inspecting', 'completed', 'rejected'],
    deleteDefaultFromUrl: true,
    onChange: () => setPage(1),
  })
  const [faultFilter, setFaultFilter] = useState<string>('all')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<OrderReturn | null>(null)
  const [printModalReturn, setPrintModalReturn] = useState<OrderReturn | null>(null)
  const [isInspectionOpen, setIsInspectionOpen] = useState(false)
  const [isRefundOpen, setIsRefundOpen] = useState(false)
  const [isExchangeOpen, setIsExchangeOpen] = useState(false)

  // Inspection Form State
  const [inspectionVerdict, setInspectionVerdict] = useState<'pass' | 'partial_pass' | 'reject' | 'fraud_suspected'>('pass')
  const [serialMatched, setSerialMatched] = useState(true)
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade>('resellable_new')
  const [inventoryAction, setInventoryAction] = useState<InventoryAction>('restock_available')
  const [deductionAmount, setDeductionAmount] = useState(0)
  const [checklist, setChecklist] = useState({
    box: true,
    charger: true,
    cable: true,
    manual: true,
  })
  const [qcNotes, setQcNotes] = useState('')

  // Refund Settlement State
  const [refundMethod, setRefundMethod] = useState('original_payment')
  const [refundAmount, setRefundAmount] = useState<number>(0)

  // Exchange State
  const [newProductPrice, setNewProductPrice] = useState<number>(0)
  const [exchangeFee, setExchangeFee] = useState<number>(0)
  const [replacementShipping, setReplacementShipping] = useState<number>(0)

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    image: true,
    return_number: true,
    order: true,
    customer: true,
    fault: true,
    refund_amount: true,
    status: true,
    created_at: true,
  })

  const columnOptions = useMemo(() => [
    { key: 'image', label: t('columns.photo', 'Photo') },
    { key: 'return_number', label: t('columns.returnNumber', 'RMA Number') },
    { key: 'order', label: t('columns.order', 'Order / Invoice #') },
    { key: 'customer', label: t('columns.customer', 'Customer') },
    { key: 'fault', label: t('columns.fault', 'Fault Allocation') },
    { key: 'refund_amount', label: t('columns.refundAmount', 'Net Refund') },
    { key: 'status', label: t('columns.status', 'Status') },
    { key: 'created_at', label: t('columns.createdAt', 'Date') },
  ], [t])

  // Query Returns
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['order-returns', page, perPage, search, statusFilter, faultFilter],
    queryFn: () =>
      orderReturnService.list({
        page,
        per_page: perPage,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        fault: faultFilter !== 'all' ? faultFilter : undefined,
      }),
  })

  const returns: OrderReturn[] = data?.data || []
  const paginationMeta = data?.meta || { current_page: page, last_page: 1, total: returns.length }

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: number) => orderReturnService.approve(id),
    onSuccess: () => {
      toast.success(t('approveSuccess', 'Return request approved successfully.'))
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => orderReturnService.reject(id, reason),
    onSuccess: () => {
      toast.success(t('rejectSuccess', 'Return request rejected.'))
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message),
  })

  const receiveMutation = useMutation({
    mutationFn: ({ id, warehouseId }: { id: number; warehouseId: number }) =>
      orderReturnService.receive(id, warehouseId),
    onSuccess: () => {
      toast.success(t('receiveSuccess', 'Items received at warehouse. Ready for QC.'))
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message),
  })

  const inspectionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      orderReturnService.completeInspection(id, payload),
    onSuccess: () => {
      toast.success(t('inspectionSuccess', 'QC Inspection completed and inventory updated.'))
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      setIsInspectionOpen(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message),
  })

  const settleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      orderReturnService.settleRefund(id, payload),
    onSuccess: () => {
      toast.success(t('settleSuccess', 'Refund settled and credited successfully.'))
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      setIsRefundOpen(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message),
  })

  const exchangeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, any> }) =>
      orderReturnService.processExchange(id, payload),
    onSuccess: () => {
      toast.success(t('exchangeSuccess', 'Exchange order generated successfully.'))
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      setIsExchangeOpen(false)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message),
  })

  // Summary Metrics
  const stats = useMemo(() => ({
    total: returns.length,
    pending: returns.filter((r) => r.status === 'requested').length,
    inspecting: returns.filter((r) => ['received', 'inspecting'].includes(r.status)).length,
    refundValue: returns.reduce((acc, curr) => acc + (Number(curr.total_refund_amount) || 0), 0),
  }), [returns])

  // Workspace Tabs (Clean Text + Count Badge)
  const tabs: WorkspaceTabItem[] = useMemo(() => [
    { id: 'all', label: t('tabs.all', 'All'), count: stats.total },
    { id: 'requested', label: t('tabs.requested', 'Pending Review'), count: stats.pending },
    { id: 'approved', label: t('tabs.approved', 'Approved') },
    { id: 'in_transit', label: t('tabs.in_transit', 'In Transit') },
    { id: 'inspecting', label: t('tabs.inspecting', 'QC Inspecting'), count: stats.inspecting },
    { id: 'completed', label: t('tabs.completed', 'Completed') },
    { id: 'rejected', label: t('tabs.rejected', 'Rejected') },
  ], [stats, t])

  const handleTabChange = (tabId: string) => {
    setStatusFilter(tabId)
    setPage(1)
  }

  const handleResetAllFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setFaultFilter('all')
    setPage(1)
  }

  // Export CSV Handler
  const handleExport = () => {
    if (returns.length === 0) {
      toast.error(t('noReturnsFound', 'No return records to export'))
      return
    }
    const headers = [
      'RMA Number',
      'Order/Sale Number',
      'Customer',
      'Phone',
      'Channel',
      'Fault Allocation',
      'Reason',
      'Subtotal ($)',
      'Allocated Discount ($)',
      'Restocking Fee ($)',
      'Net Refund ($)',
      'Refund Method',
      'Status',
      'Created Date',
    ]
    const rows = returns.map((r) => [
      r.return_number,
      r.order?.order_number || (r.sale_id ? `POS #${r.sale_id}` : ''),
      r.customer?.name || '',
      r.customer?.phone || '',
      r.channel,
      r.fault,
      r.reason_code,
      GlobalFormat.number(r.subtotal_amount || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      GlobalFormat.number(r.allocated_discount_amount || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      GlobalFormat.number(r.restocking_fee || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      GlobalFormat.number(r.total_refund_amount || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      r.refund_method,
      r.status,
      GlobalFormat.date(r.created_at),
    ])
    downloadCsv('order_returns_rma', headers, rows)
    toast.success(t('exportSuccess', 'CSV exported successfully'))
  }

  const handleOpenQC = (ret: OrderReturn) => {
    setSelectedReturn(ret)
    setInspectionVerdict('pass')
    setSerialMatched(true)
    setConditionGrade('resellable_new')
    setInventoryAction('restock_available')
    setDeductionAmount(0)
    setQcNotes('')
    setIsInspectionOpen(true)
  }

  const handleOpenRefund = (ret: OrderReturn) => {
    setSelectedReturn(ret)
    setRefundMethod(ret.refund_method || 'original_payment')
    setRefundAmount(Number(ret.total_refund_amount) || 0)
    setIsRefundOpen(true)
  }

  const handleOpenExchange = (ret: OrderReturn) => {
    setSelectedReturn(ret)
    setNewProductPrice(Number(ret.subtotal_amount) || 0)
    setExchangeFee(0)
    setReplacementShipping(0)
    setIsExchangeOpen(true)
  }

  const getStatusBadge = (status: ReturnStatus) => {
    const config: Record<ReturnStatus, { label: string; bg: string; text: string; border: string }> = {
      requested: { label: t('statuses.requested', 'Requested'), bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
      approved: { label: t('statuses.approved', 'Approved'), bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
      rejected: { label: t('statuses.rejected', 'Rejected'), bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
      in_transit: { label: t('statuses.in_transit', 'In Transit'), bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
      received: { label: t('statuses.received', 'Received at WH'), bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
      inspecting: { label: t('statuses.inspecting', 'QC Inspecting'), bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
      inspected: { label: t('statuses.inspected', 'Inspected'), bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/20' },
      completed: { label: t('statuses.completed', 'Completed'), bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
      cancelled: { label: t('statuses.cancelled', 'Cancelled'), bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
      expired: { label: t('statuses.expired', 'Expired'), bg: 'bg-zinc-500/10', text: 'text-zinc-500', border: 'border-zinc-500/20' },
    }
    const item = config[status] || { label: status, bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.bg} ${item.text} ${item.border}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {item.label}
      </span>
    )
  }

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* ── 1. STANDARD BREADCRUMB & HERO HEADER ──────────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('nav:salesManagement', 'Sales Management'), path: '/sales' },
            { label: t('title', 'Returns & Exchanges (RMA)') },
          ]}
        />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('title', 'Returns & Exchanges (RMA)')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('subtitle', 'Enterprise reverse logistics, warehouse QC inspection, replacements & refund audit trail')}
          </p>
        </div>

        <HeaderActionsGroup className="w-full sm:w-auto flex items-center gap-2">
          <ExportButton
            onClick={handleExport}
            label={t('exportCSV', 'Export CSV')}
            className="flex-1 sm:flex-none justify-center"
          />
          <AddButton
            onClick={() => setIsCreateModalOpen(true)}
            label={t('createReturn', 'Create Return')}
            className="flex-1 sm:flex-none justify-center"
          />
        </HeaderActionsGroup>
      </div>

      {/* ── 2. EXECUTIVE KPI SUMMARY METRICS ──────────────────────────── */}
      <RibbonStatsGrid columns={4} className="print:hidden">
        <RibbonStatsCard
          title={t('totalReturns', 'សំណើសរុប')}
          value={stats.total}
          useCounter={true}
          icon={RotateCcw}
          variant="purple"
          delay={0.05}
        />
        <RibbonStatsCard
          title={t('pendingReview', 'រង់ចាំពិនិត្យ')}
          value={stats.pending}
          useCounter={true}
          icon={Clock}
          variant="amber"
          delay={0.1}
        />
        <RibbonStatsCard
          title={t('awaitingQC', 'រង់ចាំត្រួតពិនិត្យ QC')}
          value={stats.inspecting}
          useCounter={true}
          icon={ShieldCheck}
          variant="cyan"
          delay={0.15}
        />
        <RibbonStatsCard
          title={t('refundValue', 'ទឹកប្រាក់សងត្រឡប់')}
          value={stats.refundValue}
          prefix="$"
          decimals={2}
          useCounter={true}
          icon={DollarSign}
          variant="emerald"
          delay={0.2}
        />
      </RibbonStatsGrid>

      {/* ── 3. WORKSPACE TABS NAVIGATION ──────────────────────────────── */}
      <WorkspaceTabs
        tabs={tabs}
        activeTab={statusFilter}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* ── 4. GLOBAL TABLE TOOLBAR ───────────────────────────────────── */}
      <TableToolbar
        search={search}
        onSearchChange={(searchQuery) => {
          setSearch(searchQuery)
          setPage(1)
        }}
        searchPlaceholder={t('searchPlaceholder', 'Search by RMA number, customer name, phone, or order #...')}
        onReset={handleResetAllFilters}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['order-returns'] })}
        refreshLoading={isFetching}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        rightActions={
          <div className="flex items-center gap-2">
            <select
              value={faultFilter}
              onChange={(e) => {
                setFaultFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 px-3 rounded-xl border border-border/80 bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            >
              <option value="all">{t('allFaults', 'All Faults')}</option>
              <option value="customer">{t('customerFault', 'Customer Fault (Fee applies)')}</option>
              <option value="store">{t('storeFault', 'Store Fault (Free return)')}</option>
              <option value="courier">{t('courierFault', 'Courier Fault')}</option>
            </select>
          </div>
        }
      />

      {/* ── 5. MAIN RMA DATA TABLE ────────────────────────────────────── */}
      <TableWrapper isFetching={isLoading}>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {visibleColumns.image && <th className="py-3 px-3 w-[64px] text-center">{t('columns.photo', 'Photo')}</th>}
              {visibleColumns.return_number && <th className="py-3 px-4">{t('columns.returnNumber', 'RMA Number')}</th>}
              {visibleColumns.order && <th className="py-3 px-4">{t('columns.order', 'Order / Sale')}</th>}
              {visibleColumns.customer && <th className="py-3 px-4">{t('columns.customer', 'Customer')}</th>}
              {visibleColumns.fault && <th className="py-3 px-4">{t('columns.fault', 'Fault Allocation')}</th>}
              {visibleColumns.refund_amount && <th className="py-3 px-4">{t('columns.refundAmount', 'Net Refund')}</th>}
              {visibleColumns.status && <th className="py-3 px-4">{t('columns.status', 'Status')}</th>}
              {visibleColumns.created_at && <th className="py-3 px-4">{t('columns.createdAt', 'Date')}</th>}
              <th className="py-3 px-4 text-right whitespace-nowrap">{t('actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
            {returns.length === 0 ? (
              <TableEmptyState
                cols={Object.values(visibleColumns).filter(Boolean).length + 1}
                title={t('noReturnsFound', 'No return records found')}
                description={t('noReturnsFoundDesc', 'Try adjusting your search query, status tab, or fault filter.')}
                icon={RotateCcw}
              />
            ) : (
              returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-muted/30 transition-colors">
                  {/* Photo / Product Thumbnail */}
                  {visibleColumns.image && (
                    <td className="py-3 px-3 text-center w-[64px]">
                      {(() => {
                        const firstItem = ret.items?.[0]
                        const product = firstItem?.product
                        const firstItemName =
                          product?.name ||
                          firstItem?.product_name ||
                          t('items', 'Return Items')
                        const firstItemImage =
                          product?.primary_image ||
                          product?.image ||
                          product?.primaryImage ||
                          firstItem?.product_image
                        return (
                          <div
                            className="flex justify-center cursor-pointer"
                            onClick={() => navigate(`/returns/${ret.id}`)}
                          >
                            <ProductThumbnail
                              name={firstItemName}
                              primaryImage={product?.primary_image || product?.primaryImage}
                              images={product?.images}
                              image={firstItemImage}
                              categoryName={product?.category?.name}
                              size="sm"
                              className="rounded-xl shadow-2xs border border-border/70 hover:scale-105 transition-transform"
                            />
                          </div>
                        )
                      })()}
                    </td>
                  )}

                  {/* Return Number & Channel */}
                  {visibleColumns.return_number && (
                    <td className="py-3 px-4">
                      <div
                        className="font-semibold text-primary hover:underline cursor-pointer font-mono"
                        onClick={() => navigate(`/returns/${ret.id}`)}
                      >
                        {ret.return_number}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium uppercase text-muted-foreground border border-border/50 font-mono">
                          {ret.channel}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {ret.type === 'exchange' ? t('exchanges', 'Exchange') : t('returns', 'Return')}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Order Number */}
                  {visibleColumns.order && (
                    <td className="py-3 px-4 font-mono text-xs">
                      {ret.order ? (
                        <span className="font-semibold text-foreground">
                          {ret.order.order_number}
                        </span>
                      ) : ret.sale ? (
                        <span className="font-semibold text-foreground font-mono">
                          {ret.sale.invoice_number || `POS #${ret.sale_id}`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  )}

                  {/* Customer */}
                  {visibleColumns.customer && (
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">
                        {ret.customer?.name || t('guestCustomer', 'Guest / Walk-in')}
                      </div>
                      {ret.customer?.phone && (
                        <div className="text-xs text-muted-foreground font-mono">{GlobalFormat.phone(ret.customer.phone)}</div>
                      )}
                    </td>
                  )}

                  {/* Fault Allocation */}
                  {visibleColumns.fault && (
                    <td className="py-3 px-4">
                      {ret.fault === 'store' ? (
                        <span className="inline-flex items-center text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {t('storeFault', 'Store Fault')}
                        </span>
                      ) : ret.fault === 'courier' ? (
                        <span className="inline-flex items-center text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                          {t('courierFault', 'Courier Fault')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {t('customerFault', 'Customer Fault')}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Net Refund Amount */}
                  {visibleColumns.refund_amount && (
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {GlobalFormat.currency(ret.total_refund_amount)}
                      <div className="text-[10px] font-normal text-muted-foreground">
                        {GlobalFormat.currency(Number(ret.total_refund_amount || 0) * KHR_RATE, 'KHR')}
                      </div>
                    </td>
                  )}

                  {/* Status */}
                  {visibleColumns.status && (
                    <td className="py-3 px-4">
                      {getStatusBadge(ret.status)}
                    </td>
                  )}

                  {/* Date */}
                  {visibleColumns.created_at && (
                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                      {GlobalFormat.displayDate(ret.created_at)}
                    </td>
                  )}

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <TableActionMenu
                      variant="inline"
                      buttonSize="sm"
                      align="right"
                      onView={() => navigate(`/returns/${ret.id}`)}
                      viewLabel={t('viewDetail', 'View Details')}
                      onPrint={() => setPrintModalReturn(ret)}
                      items={[
                        ...(ret.status === 'requested'
                          ? [
                              {
                                label: t('approve', 'Approve Request'),
                                icon: CheckCircle2,
                                onClick: () => approveMutation.mutate(ret.id),
                                variant: 'success' as const,
                              },
                              {
                                label: t('reject', 'Reject Request'),
                                icon: XCircle,
                                onClick: () => {
                                  const reason = prompt(t('rejectPrompt', 'Please enter rejection reason:'))
                                  if (reason) rejectMutation.mutate({ id: ret.id, reason })
                                },
                                variant: 'danger' as const,
                              },
                            ]
                          : []),
                        ...(['approved', 'in_transit'].includes(ret.status)
                          ? [
                              {
                                label: t('receiveAtWarehouse', 'Receive at Warehouse'),
                                icon: Package,
                                onClick: () => receiveMutation.mutate({ id: ret.id, warehouseId: 1 }),
                                variant: 'info' as const,
                              },
                            ]
                          : []),
                        ...(['received', 'inspecting'].includes(ret.status)
                          ? [
                              {
                                label: t('qcInspection', 'QC Inspection'),
                                icon: ShieldCheck,
                                onClick: () => handleOpenQC(ret),
                                variant: 'primary' as const,
                              },
                            ]
                          : []),
                        ...(ret.status === 'inspected' && ret.refund_status === 'pending'
                          ? [
                              {
                                label: t('settleRefund', 'Settle Refund'),
                                icon: DollarSign,
                                onClick: () => handleOpenRefund(ret),
                                variant: 'success' as const,
                              },
                              {
                                label: t('processExchange', 'Process Exchange'),
                                icon: ArrowRightLeft,
                                onClick: () => handleOpenExchange(ret),
                                variant: 'primary' as const,
                              },
                            ]
                          : []),
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>

      {/* Pagination Footer */}
      {paginationMeta.total > 0 && (
        <Pagination
          currentPage={page}
          lastPage={paginationMeta.last_page}
          total={paginationMeta.total}
          perPage={perPage}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage)
            setPage(1)
          }}
          isLoading={isFetching}
        />
      )}

      {/* ─── MODAL: Create Return Request ───────────────────────────── */}
      <CreateOrderReturnModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* ─── MODAL: Warehouse QC Inspection ──────────────────────────── */}
      <EnterpriseModal
        isOpen={isInspectionOpen && Boolean(selectedReturn)}
        onClose={() => setIsInspectionOpen(false)}
        title={`${t('inspection.title', 'Warehouse QC Inspection')} — ${selectedReturn?.return_number || ''}`}
        subtitle={t('inspection.subtitle', 'Verify device condition, accessories, and serial authenticity')}
        icon={<ShieldCheck size={18} />}
        iconVariant="emerald"
        size="2xl"
        footer={
          <ModalFooter
            onCancel={() => setIsInspectionOpen(false)}
            onSubmit={() => {
              if (!selectedReturn) return
              inspectionMutation.mutate({
                id: selectedReturn.id,
                payload: {
                  verdict: inspectionVerdict,
                  summary_notes: qcNotes,
                  items: [
                    {
                      order_return_item_id: selectedReturn.items?.[0]?.id || 1,
                      serial_matched: serialMatched,
                      accessories_checklist: checklist,
                      condition_grade: conditionGrade,
                      inventory_action: inventoryAction,
                      deduction_amount: deductionAmount,
                      inspector_notes: qcNotes,
                    },
                  ],
                },
              })
            }}
            cancelLabel={t('cancel', 'បោះបង់')}
            submitLabel={t('inspection.submitButton', 'Submit QC & Update Stock')}
            isSubmitting={inspectionMutation.isPending}
            submitVariant="primary"
            submitIcon={<Check size={14} strokeWidth={2.5} />}
          />
        }
      >
        <div className="p-5 sm:p-6 space-y-4">
          {/* Serial Number & Anti-Fraud Verification Card */}
          <div className="p-4 rounded-xl bg-muted/20 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                {t('inspection.serialVerification', 'Serial / IMEI Verification')}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-background dark:bg-slate-800 border border-border/80 text-primary">
                {selectedReturn?.items?.[0]?.sold_serial_number || 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              <div>
                <p className="text-xs font-semibold text-foreground dark:text-slate-100">
                  {t('inspection.soldSerial', 'Sold Serial / IMEI')}: <span className="font-mono font-bold text-primary">{selectedReturn?.items?.[0]?.sold_serial_number || 'N/A'}</span>
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('inspection.soldSerialHelp', 'Ensure returned device physically matches original IMEI sold.')}
                </p>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none px-3 py-1.5 rounded-lg border border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900 hover:bg-muted/40 transition-all self-start sm:self-auto">
                <input
                  type="checkbox"
                  checked={serialMatched}
                  onChange={(e) => setSerialMatched(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                />
                <span className={`text-xs font-semibold ${serialMatched ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 font-bold'}`}>
                  {serialMatched ? t('inspection.serialMatched', 'Serial matches sold record') : t('inspection.serialMismatch', 'MISMATCH (Fraud)')}
                </span>
              </label>
            </div>
          </div>

          {/* Accessories Checklist */}
          <div className="space-y-1.5">
            <label className={labelCls}>
              {t('inspection.accessoriesChecklist', 'Accessories Checklist')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(checklist).map(([key, val]) => {
                const labelKey = `inspection.${key}Present`
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none ${
                      val
                        ? 'border-primary/40 bg-primary/5 dark:bg-primary/10 text-foreground dark:text-slate-100 font-semibold ring-1 ring-primary/20 shadow-2xs'
                        : 'border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900/90 text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                      className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                    />
                    <span className="truncate">{t(labelKey, `${key} Present`)}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Condition Grading & Inventory Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                {t('inspection.conditionGrading', 'Condition Grading')}
              </label>
              <select
                value={conditionGrade}
                onChange={(e) => setConditionGrade(e.target.value as ConditionGrade)}
                className={selectCls}
              >
                <option value="resellable_new">{t('conditionGrades.resellable_new', 'Resellable New')}</option>
                <option value="open_box">{t('conditionGrades.open_box', 'Open Box')}</option>
                <option value="refurbished">{t('conditionGrades.refurbished', 'Refurbished')}</option>
                <option value="damaged_repairable">{t('conditionGrades.damaged_repairable', 'Damaged (Repairable)')}</option>
                <option value="scrap">{t('conditionGrades.scrap', 'Scrap (Loss)')}</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>
                {t('inspection.inventoryAction', 'Inventory Routing Action')}
              </label>
              <select
                value={inventoryAction}
                onChange={(e) => setInventoryAction(e.target.value as InventoryAction)}
                className={selectCls}
              >
                <option value="restock_available">{t('inventoryActions.restock_available', 'Restock Available Stock')}</option>
                <option value="move_to_refurbished">{t('inventoryActions.move_to_refurbished', 'Route to Refurbished')}</option>
                <option value="move_to_damaged_quarantine">{t('inventoryActions.move_to_damaged_quarantine', 'Damaged Quarantine')}</option>
                <option value="scrap_write_off">{t('inventoryActions.scrap_write_off', 'Scrap Write-Off')}</option>
              </select>
            </div>
          </div>

          {/* Deductions & Verdict */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                {t('inspection.deductionAmount', 'Missing / Damage Deduction ($)')}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(parseFloat(e.target.value) || 0)}
                className={`${inputCls} font-mono`}
              />
            </div>

            <div>
              <label className={labelCls}>
                {t('inspection.verdict', 'Overall Verdict')}
              </label>
              <select
                value={inspectionVerdict}
                onChange={(e) => setInspectionVerdict(e.target.value as any)}
                className={`${selectCls} font-semibold`}
              >
                <option value="pass">{t('inspection.verdictPass', 'Pass (Full Restock)')}</option>
                <option value="partial_pass">{t('inspection.verdictPartial', 'Partial Pass (Fee Deduction)')}</option>
                <option value="reject">{t('inspection.verdictReject', 'Reject (Violates Policy)')}</option>
                <option value="fraud_suspected">{t('inspection.verdictFraud', 'Fraud Suspected')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              {t('inspection.notes', 'QC Inspector Notes')}
            </label>
            <textarea
              rows={2}
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder={t('inspection.notesPlaceholder', 'Add condition remarks, package defects or serial inspection notes...')}
              className={textareaCls}
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* ─── MODAL: Settle Refund ────────────────────────────────────── */}
      <EnterpriseModal
        isOpen={isRefundOpen && Boolean(selectedReturn)}
        onClose={() => setIsRefundOpen(false)}
        title={t('financials.settleRefundTitle', 'Settle Refund')}
        subtitle={t('financials.settleRefundSubtitle', 'Select payout channel or credit to customer wallet')}
        icon={<DollarSign size={18} />}
        iconVariant="emerald"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setIsRefundOpen(false)}
            onSubmit={() => {
              if (!selectedReturn) return
              settleMutation.mutate({
                id: selectedReturn.id,
                payload: { refund_method: refundMethod, refund_amount: refundAmount },
              })
            }}
            cancelLabel={t('cancel', 'បោះបង់')}
            submitLabel={t('financials.confirmRefundButton', 'Process & Release Refund')}
            isSubmitting={settleMutation.isPending}
            submitVariant="emerald"
            submitIcon={<Check size={14} strokeWidth={2.5} />}
          />
        }
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-muted/20 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 space-y-2.5">
            <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-400">
              <span>{t('returnNumber', 'RMA Number')}:</span>
              <span className="font-mono text-foreground dark:text-slate-100 font-semibold">{selectedReturn?.return_number}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-400">
              <span>{t('customer', 'Customer')}:</span>
              <span className="font-semibold text-foreground dark:text-slate-100">{selectedReturn?.customer?.name || t('guestCustomer', 'Guest / Walk-in')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground dark:text-slate-100 pt-2 border-t border-border/70 dark:border-slate-800">
              <span>{t('financials.netRefund', 'Net Refund Amount')}:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base font-bold">
                {GlobalFormat.currency(refundAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>
              {t('financials.refundMethodLabel', 'Refund Method Destination')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'store_credit', label: t('financials.storeCredit', 'Store Credit Wallet (Instant)') },
                { id: 'bakong_khqr', label: t('financials.bakongKhqr', 'Bakong / KHQR Payout') },
                { id: 'original_payment', label: t('financials.originalPayment', 'Original Payment Method') },
                { id: 'cash', label: t('financials.cash', 'Cash (Register Drawer)') },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none ${
                    refundMethod === m.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-bold ring-1 ring-primary/20 shadow-2xs'
                      : 'border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900/90 text-foreground/80 hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="refund_method"
                    value={m.id}
                    checked={refundMethod === m.id}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="form-radio h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </EnterpriseModal>

      {/* ─── MODAL: Exchange Settlement ──────────────────────────────── */}
      <EnterpriseModal
        isOpen={isExchangeOpen && Boolean(selectedReturn)}
        onClose={() => setIsExchangeOpen(false)}
        title={t('financials.processExchangeTitle', 'Process Exchange Settlement')}
        subtitle={t('financials.processExchangeSubtitle', 'Calculate price difference and create replacement order')}
        icon={<ArrowRightLeft size={18} />}
        iconVariant="blue"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setIsExchangeOpen(false)}
            onSubmit={() => {
              if (!selectedReturn) return
              exchangeMutation.mutate({
                id: selectedReturn.id,
                payload: {
                  new_items_cost: newProductPrice,
                  exchange_fee: exchangeFee,
                  shipping_difference: replacementShipping,
                },
              })
            }}
            cancelLabel={t('cancel', 'បោះបង់')}
            submitLabel={t('financials.createExchangeButton', 'Create Replacement Order')}
            isSubmitting={exchangeMutation.isPending}
            submitVariant="primary"
            submitIcon={<Check size={14} strokeWidth={2.5} />}
          />
        }
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-4 rounded-xl bg-muted/20 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground dark:text-slate-400">
              <span>{t('financials.oldItemCredit', 'Old Item Credit (Original Paid)')}:</span>
              <span className="font-mono text-foreground dark:text-slate-100 font-semibold">{GlobalFormat.currency(selectedReturn?.subtotal_amount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground dark:text-slate-400">
              <span>{t('financials.newReplacementCost', 'New Replacement Cost')}:</span>
              <span className="font-mono text-foreground dark:text-slate-100 font-semibold">{GlobalFormat.currency(newProductPrice)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border/70 dark:border-slate-800 text-sm">
              <span className="text-foreground dark:text-slate-100">{t('financials.customerDifferenceDue', 'Customer Difference Due')}:</span>
              <span className="font-mono text-primary font-bold">
                {GlobalFormat.currency(Math.max(0, newProductPrice - Number(selectedReturn?.subtotal_amount || 0) + exchangeFee))}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelCls}>
                {t('financials.newProductPriceLabel', 'New Product Value ($)')}
              </label>
              <input
                type="number"
                step="0.5"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(parseFloat(e.target.value) || 0)}
                className={`${inputCls} font-mono`}
              />
            </div>

            <div>
              <label className={labelCls}>
                {t('financials.exchangeFeeLabel', 'Exchange Processing Fee ($)')}
              </label>
              <input
                type="number"
                step="0.5"
                value={exchangeFee}
                onChange={(e) => setExchangeFee(parseFloat(e.target.value) || 0)}
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>
        </div>
      </EnterpriseModal>

      {/* ── Print RMA Voucher Modal (Global Print) ─────────────────────────── */}
      {printModalReturn && (
        <OrderReturnPrintModal
          isOpen={!!printModalReturn}
          onClose={() => setPrintModalReturn(null)}
          orderReturn={printModalReturn}
        />
      )}

    </div>
  )
}

export default OrderReturnsPage
