import React, { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Receipt } from 'lucide-react'
import { salesService } from '@/services/salesService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import { usePageTab } from '@/hooks/usePageTab'
import {
  Breadcrumb,
  HeaderActionsGroup,
  ExportButton,
  AddButton,
  TableToolbar,
} from '@/components/common'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import { SalesFilterDrawer } from './components/SalesFilterDrawer'
import { SalesDetailDrawer } from './components/SalesDetailDrawer'
import { ProcessRefundModal } from './components/ProcessRefundModal'
import { SalesReceiptModal, type Sale } from './components/SalesReceiptModal'
import { SalesTableSection } from './components/SalesTableSection'
import { AnimatePresence } from 'framer-motion'
import { useThemeStore } from '@/stores/themeStore'
import { downloadCsv, getDateRangeBounds } from '@/utils/export'


const KHR_RATE = 4100


const SalesPage: React.FC = () => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['sales', 'common'])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
  } = useServerPagination({ storageKey: 'sales' })

  // Active status tab: 'all' | 'completed' | 'pending' | 'refunded' | 'cancelled'
  const [activeTab, setActiveTab] = usePageTab<string>({
    paramKey: 'status',
    storageKey: 'sales_active_status',
    defaultTab: 'all',
    validTabs: ['all', 'completed', 'pending', 'refunded', 'cancelled'],
    deleteDefaultFromUrl: true,
    onChange: () => setPage(1),
  })

  // Drawer & Filter States
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | undefined>(undefined)
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minTotal, setMinTotal] = useState('')
  const [maxTotal, setMaxTotal] = useState('')

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // UI Selection & Modals
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)
  const [receiptModalSale, setReceiptModalSale] = useState<Sale | null>(null)
  const [refundModalSale, setRefundModalSale] = useState<Sale | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    image: true,
    items: true,
    invoice_number: true,
    customer: true,
    payment_method: true,
    grand_total: true,
    status: true,
    created_at: true,
  })

  const activeFiltersCount = [
    activeTab !== 'all' ? activeTab : undefined,
    paymentStatusFilter,
    paymentMethodFilter,
    dateFrom || undefined,
    dateTo || undefined,
    minTotal || undefined,
    maxTotal || undefined,
  ].filter(Boolean).length

  const handleResetAllFilters = () => {
    reset()
    setActiveTab('all')
    setPaymentStatusFilter(undefined)
    setPaymentMethodFilter(undefined)
    setDateFrom('')
    setDateTo('')
    setMinTotal('')
    setMaxTotal('')
    setPage(1)
  }

  const handleTabChange = (tabId: string) => {
    sound.playClick()
    setActiveTab(tabId)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1)
  }

  // API Query
  const effectiveStatus = activeTab === 'all' ? undefined : activeTab

  const { data: salesResponse, isLoading, isFetching } = useQuery({
    queryKey: [
      'sales',
      page,
      debouncedSearch,
      perPage,
      dateFrom,
      dateTo,
      effectiveStatus,
      paymentStatusFilter,
      paymentMethodFilter,
      minTotal,
      maxTotal,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      salesService.list({
        page,
        search,
        per_page: perPage || 15,
        start_date: dateFrom || undefined,
        end_date: dateTo || undefined,
        status: effectiveStatus,
        payment_status: paymentStatusFilter || undefined,
        channel: paymentMethodFilter || undefined,
        sort: sortBy,
        order: sortOrder,
      }),
    placeholderData: (prev) => prev,
  })

  const { data: saleDetail, isLoading: detailLoading } = useQuery<Sale | null>({
    queryKey: ['sales', selectedSaleId],
    queryFn: () => (selectedSaleId ? salesService.show(selectedSaleId) : Promise.resolve(null)),
    enabled: selectedSaleId !== null,
  })

  // Refund Mutation
  const refundMutation = useMutation({
    mutationFn: (payload: { sale: Sale; reason: string; refund_method: string }) => {
      const saleObj = payload.sale
      const rawItems = saleObj?.items || (saleObj as any)?.sale_items || (saleObj as any)?.details || []
      const itemsPayload = rawItems.map((item: any) => ({
        sale_item_id: item.id,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id ?? null,
        quantity: Number(item.quantity || 1),
      }))

      return salesService.returnSale(saleObj.id, {
        reason: payload.reason,
        refund_method: payload.refund_method,
        items: itemsPayload.length > 0 ? itemsPayload : undefined,
      })
    },
    onSuccess: () => {
      sound.playSuccess()
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      toast.success(t('refundSuccess', 'Sale order refunded successfully.'))
      setRefundModalSale(null)
      setSelectedSaleId(null)
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err?.response?.data?.message || t('refundFailed', 'Failed to refund sale order.'))
    },
  })

  const salesList: Sale[] = salesResponse?.data || []
  const pagination = {
    total: salesResponse?.total || salesList.length,
    currentPage: salesResponse?.current_page || page,
    lastPage: salesResponse?.last_page || 1,
    perPage: salesResponse?.per_page || perPage,
  }


  // Export CSV Handler with Date Range
  const handleExport = async (range: string = 'all') => {
    sound.playClick()
    let exportItems = salesList

    if (range && range !== 'all') {
      const bounds = getDateRangeBounds(range)
      try {
        setIsExporting(true)
        const res = await salesService.list({
          per_page: 500,
          start_date: bounds.startDate,
          end_date: bounds.endDate,
          status: effectiveStatus,
          payment_status: paymentStatusFilter || undefined,
          channel: paymentMethodFilter || undefined,
        })
        exportItems = res?.data || []
      } catch (err) {
        console.error('Failed to fetch range sales for export', err)
      } finally {
        setIsExporting(false)
      }
    }

    if (!exportItems || exportItems.length === 0) {
      toast.error(t('export.noData', 'No sales order data available to export.'))
      return
    }

    const headers = [
      t('export.headers.invoiceNumber', 'Invoice / Order #'),
      t('export.headers.customer', 'Customer'),
      t('export.headers.phone', 'Phone'),
      t('export.headers.paymentMethod', 'Payment Method'),
      t('export.headers.itemsCount', 'Items Count'),
      t('export.headers.grandTotalUSD', 'Grand Total ($)'),
      t('export.headers.grandTotalKHR', 'Grand Total (KHR)'),
      t('export.headers.status', 'Status'),
      t('export.headers.dateTime', 'Date & Time'),
    ]

    const translatePaymentMethod = (method?: string) => {
      if (!method) return t('export.paymentMethods.pos', 'POS')
      const m = method.toLowerCase()
      if (m.includes('cash')) return t('export.paymentMethods.cash', 'Cash')
      if (m.includes('khqr') || m.includes('bakong')) return t('export.paymentMethods.khqr', 'Bakong KHQR')
      if (m.includes('bank') || m.includes('transfer') || m.includes('acleda') || m.includes('wing')) {
        return t('export.paymentMethods.bankTransfer', 'Bank Transfer')
      }
      if (m.includes('card')) return t('export.paymentMethods.card', 'Card')
      return method.toUpperCase()
    }

    const translateStatus = (status?: string) => {
      const s = (status || 'completed').toLowerCase()
      if (s === 'completed') return t('export.statuses.completed', 'Completed')
      if (s === 'pending') return t('export.statuses.pending', 'Pending')
      if (s === 'refunded') return t('export.statuses.refunded', 'Refunded')
      if (s === 'cancelled') return t('export.statuses.cancelled', 'Cancelled')
      return status || t('export.statuses.completed', 'Completed')
    }

    const rows = exportItems.map((sale) => {
      const itemCount = Math.round(
        sale.items?.reduce((totalQuantity, item) => totalQuantity + Number(item.quantity || 1), 0) || 1
      )
      const totalUSD = Number(sale.grand_total || 0)
      const totalKHR = Math.round(totalUSD * KHR_RATE)
      const dateStr = sale.created_at ? new Date(sale.created_at).toLocaleString(language === 'km' ? 'km-KH' : 'en-US') : sale.date || ''

      return [
        sale.invoice_number || '',
        sale.customer?.name || t('export.defaultCustomer', 'Walk-in Customer'),
        sale.customer?.phone || '',
        translatePaymentMethod(sale.payment_method),
        itemCount,
        totalUSD.toFixed(2),
        totalKHR,
        translateStatus(sale.status),
        dateStr,
      ]
    })

    const filename = t('export.filename', 'sales_orders')
    downloadCsv(filename, headers, rows)
    toast.success(t('export.successToast', 'Orders exported to CSV successfully.'))
  }

  // Workspace Status Tabs Configuration (Clean Text + Count Badge)
  const tabs: WorkspaceTabItem[] = useMemo(() => [
    { id: 'all', label: t('all', 'All'), count: activeTab === 'all' ? pagination.total : undefined },
    { id: 'completed', label: t('completed', 'Completed'), count: activeTab === 'completed' ? pagination.total : undefined },
    { id: 'pending', label: t('pending', 'Pending'), count: activeTab === 'pending' ? pagination.total : undefined },
    { id: 'refunded', label: t('refunded', 'Refunded'), count: activeTab === 'refunded' ? pagination.total : undefined },
    { id: 'cancelled', label: t('cancelled', 'Cancelled'), count: activeTab === 'cancelled' ? pagination.total : undefined },
  ], [activeTab, pagination.total, t])

  const columnOptions = useMemo(() => [
    { key: 'image', label: t('colPhoto', 'Photo') },
    { key: 'items', label: t('itemsAndSummary', 'Product / Items') },
    { key: 'invoice_number', label: t('invoiceNumber', 'Invoice #') },
    { key: 'customer', label: t('customer', 'Customer') },
    { key: 'payment_method', label: t('paymentMethod', 'Payment') },
    { key: 'grand_total', label: t('grandTotal', 'Total') },
    { key: 'status', label: t('status', 'Status') },
    { key: 'created_at', label: t('date', 'Date') },
  ], [t])

  return (
    <div className="space-y-6 print:p-0">
      {/* ── 1. PROJECT STANDARD BREADCRUMB & HERO HEADER ──────────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('nav.salesManagement', 'Sales Management'), path: '/sales' },
            { label: t('salesOrdersAndReceipts', 'Sales Orders & Receipts') },
          ]}
        />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('salesOrdersAndReceipts', 'Sales Orders & Receipts')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('salesOrdersAndReceiptsDesc', 'Enterprise POS transaction history, receipts, and order audit trail')}
          </p>
        </div>

        <HeaderActionsGroup className="w-full sm:w-auto flex items-center gap-2">
          <ExportButton
            onExportRange={(range) => handleExport(range)}
            loading={isExporting}
            label={t('common.exportCsv')}
            className="flex-1 sm:flex-none justify-center"
          />
          <AddButton
            onClick={() => navigate('/pos')}
            label={t('openPos', 'Open POS')}
            className="flex-1 sm:flex-none justify-center"
          />
        </HeaderActionsGroup>
      </div>

      {/* ── 2. WORKSPACE TABS NAVIGATION ──────────────────────────────────────── */}
      <WorkspaceTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* ── 4. GLOBAL TABLE TOOLBAR (SEARCH, FILTER, RESET, REFRESH, COLS) ────── */}
      <TableToolbar
        search={search}
        onSearchChange={(searchQuery) => {
          setSearch(searchQuery)
          setPage(1)
        }}
        searchPlaceholder={t('searchByInvoice', 'Search by invoice number or customer...')}
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={activeFiltersCount > 0}
        filterActiveCount={activeFiltersCount}
        onReset={handleResetAllFilters}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['sales'] })}
        refreshLoading={isFetching}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* ── 5. CLEAN GLOBAL SALES TABLE (MATCHING PRODUCTS TABLE STANDARD) ─────────── */}
      <SalesTableSection
        sales={salesList}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onView={(sale) => navigate(`/sales/${sale.id}`)}
        onPrintReceipt={(sale) => setReceiptModalSale(sale)}
        onRefund={(sale) => setRefundModalSale(sale)}
      />

      {/* ── 6. PAGINATION ────────────────────────────────────────────────────── */}
      <Pagination
        currentPage={pagination.currentPage}
        lastPage={pagination.lastPage}
        total={pagination.total}
        perPage={pagination.perPage}
        onPageChange={setPage}
        onPerPageChange={(newPerPage) => {
          setPerPage(newPerPage)
          setPage(1)
        }}
        isLoading={isLoading}
      />

      {/* ── 4. SLIDE-OUT ADVANCED FILTER DRAWER ──────────────────────────────── */}
      <SalesFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        statusFilter={effectiveStatus}
        setStatusFilter={(status) => {
          if (status) setActiveTab(status)
          else setActiveTab('all')
        }}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        startDate={dateFrom}
        setStartDate={setDateFrom}
        endDate={dateTo}
        setEndDate={setDateTo}
        minTotal={minTotal}
        setMinTotal={setMinTotal}
        maxTotal={maxTotal}
        setMaxTotal={setMaxTotal}
        onReset={handleResetAllFilters}
        onApply={() => setPage(1)}
        activeFiltersCount={activeFiltersCount}
        
      />

      {/* ── 5. ORDER DETAIL DRAWER ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSaleId !== null && (
          <SalesDetailDrawer
            sale={(saleDetail || salesList.find((sale) => sale.id === selectedSaleId)) as Sale | undefined}
            isLoading={detailLoading && !salesList.find((sale) => sale.id === selectedSaleId)}
            onClose={() => setSelectedSaleId(null)}
            onPrintReceipt={(sale) => setReceiptModalSale(sale)}
            onRefund={() => {
              const activeSale = (saleDetail ||
                salesList.find((sale) => sale.id === selectedSaleId)) as Sale | undefined
              if (activeSale) setRefundModalSale(activeSale)
            }}
            isRefunding={refundMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* ── 6. POS 80MM RECEIPT SLIP PREVIEW & PRINT MODAL ───────────────────── */}
      <AnimatePresence>
        {receiptModalSale !== null && (
          <SalesReceiptModal
            isOpen={receiptModalSale !== null}
            onClose={() => setReceiptModalSale(null)}
            sale={receiptModalSale}
          />
        )}
      </AnimatePresence>

      {/* ── 7. PROCESS RETURN REFUND MODAL ───────────────────────────────────── */}
      <ProcessRefundModal
        isOpen={refundModalSale !== null}
        onClose={() => setRefundModalSale(null)}
        sale={refundModalSale}
        isPending={refundMutation.isPending}
        onConfirm={(payload) => {
          if (refundModalSale) {
            refundMutation.mutate({
              sale: refundModalSale,
              reason: payload.reason,
              refund_method: payload.refund_method,
            })
          }
        }}
      />
    </div>
  )
}

export default SalesPage
