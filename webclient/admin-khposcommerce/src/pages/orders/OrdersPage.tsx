import React, { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ShoppingBag,
  Clock,
  Truck,
  DollarSign,
} from 'lucide-react'
import { orderService } from '@/services/orderService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { useServerPagination } from '@/hooks/useServerPagination'
import { useThemeStore } from '@/stores/themeStore'
import {
  Breadcrumb,
  TableToolbar,
  ExportButton,
  AddButton,
  SecondaryButton,
  HeaderActionsGroup,
  UpdateOrderStatusModal,
  EnterpriseStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import { usePageTab } from '@/hooks/usePageTab'
import Pagination from '@/components/shared/Pagination'
import { OrdersTableSection, type Order } from './components/OrdersTableSection'
import { OrdersFilterDrawer } from './components/OrdersFilterDrawer'
import { OrdersDetailDrawer } from './components/OrdersDetailDrawer'
import { ShippingWaybillModal } from './components/ShippingWaybillModal'
import { SalesReceiptModal } from '@/pages/sales/components/SalesReceiptModal'
import { downloadCsv, getDateRangeBounds } from '@/utils/export'

const KHR_RATE = 4100

const OrdersPage: React.FC = () => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])
  const toast = useToast()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
  } = useServerPagination({ storageKey: 'orders' })

  // Active Tab synchronized with URL search params and persistent across revisits
  const [activeTab, setActiveTab] = usePageTab<string>({
    paramKey: 'status',
    storageKey: 'orders_active_status',
    defaultTab: 'all',
    validTabs: ['all', 'pending', 'processing', 'completed', 'cancelled'],
    deleteDefaultFromUrl: true,
    onChange: () => setPage(1),
  })

  // Drawer & Filter States
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | undefined>(undefined)
  const [fulfillmentStatusFilter, setFulfillmentStatusFilter] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minTotal, setMinTotal] = useState('')
  const [maxTotal, setMaxTotal] = useState('')

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // UI Selection & Modals
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null)
  const [waybillOrder, setWaybillOrder] = useState<Order | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [targetOrder, setTargetOrder] = useState<Order | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    image: true,
    items: true,
    order_number: true,
    customer: true,
    courier: true,
    payment_method: true,
    grand_total: true,
    fulfillment: true,
    status: true,
    created_at: true,
  })

  const activeFiltersCount = [
    activeTab !== 'all' ? activeTab : undefined,
    paymentStatusFilter,
    fulfillmentStatusFilter,
    dateFrom || undefined,
    dateTo || undefined,
    minTotal || undefined,
    maxTotal || undefined,
  ].filter(Boolean).length

  const handleResetAllFilters = () => {
    reset()
    setActiveTab('all')
    setPaymentStatusFilter(undefined)
    setFulfillmentStatusFilter(undefined)
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

  const { data: ordersResponse, isLoading, isFetching } = useQuery({
    queryKey: [
      'orders',
      page,
      debouncedSearch,
      perPage,
      effectiveStatus,
      paymentStatusFilter,
      fulfillmentStatusFilter,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      orderService.list({
        page,
        search,
        per_page: perPage || 15,
        status: effectiveStatus,
        payment_status: paymentStatusFilter || undefined,
        fulfillment_status: fulfillmentStatusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        min_total: minTotal || undefined,
        max_total: maxTotal || undefined,
        sort: sortBy,
        order: sortOrder,
      }),
    placeholderData: (prev) => prev,
  })

  const { data: orderDetail, isLoading: detailLoading } = useQuery<Order | null>({
    queryKey: ['order-detail', selectedOrderId],
    queryFn: () => (selectedOrderId ? orderService.show(selectedOrderId) : Promise.resolve(null)),
    enabled: selectedOrderId !== null,
  })

  const ordersList: Order[] = ordersResponse?.data || []
  const pagination = {
    total: ordersResponse?.total || ordersList.length,
    currentPage: ordersResponse?.current_page || page,
    lastPage: ordersResponse?.last_page || 1,
    perPage: ordersResponse?.per_page || perPage,
  }

  const rawStats = (ordersResponse as any)?.stats
  const ordersStats = {
    total_orders: rawStats?.total_orders ?? pagination.total,
    total_revenue: Number(rawStats?.total_revenue || 0),
    pending_count: rawStats?.pending_count || 0,
    processing_count: rawStats?.processing_count || 0,
    shipped_count: rawStats?.shipped_count || 0,
    completed_count: rawStats?.completed_count || 0,
    cancelled_count: rawStats?.cancelled_count || 0,
    unpaid_count: rawStats?.unpaid_count || 0,
    unpaid_total: Number(rawStats?.unpaid_total || 0),
  }
  const activeFulfillmentCount = ordersStats.processing_count + ordersStats.shipped_count

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: () => {
      sound.playSuccess()
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success(t('orderStatusUpdated', 'Order status updated successfully.'))
      setStatusDialogOpen(false)
      setTargetOrder(null)
    },
    onError: (error: any) => {
      sound.playError()
      toast.error(error?.response?.data?.message || t('failedToUpdateStatus', 'Failed to update order status.'))
    },
  })

  const handleOpenStatusDialog = (order: Order) => {
    setTargetOrder(order)
    setStatusDialogOpen(true)
  }

  const handleQuickStatusTransition = (order: Order, newStatus: string) => {
    sound.playClick()
    statusMutation.mutate({ orderId: order.id, status: newStatus })
  }

  // Export CSV Handler with Date Range
  const handleExport = async (range: string = 'all') => {
    sound.playClick()
    let exportItems = ordersList

    if (range && range !== 'all') {
      const bounds = getDateRangeBounds(range)
      try {
        setIsExporting(true)
        const res = await orderService.list({
          per_page: 500,
          date_from: bounds.startDate,
          date_to: bounds.endDate,
          status: effectiveStatus,
          payment_status: paymentStatusFilter || undefined,
          fulfillment_status: fulfillmentStatusFilter || undefined,
        })
        exportItems = res?.data || []
      } catch (err) {
        console.error('Failed to fetch range orders for export', err)
      } finally {
        setIsExporting(false)
      }
    }

    if (!exportItems || exportItems.length === 0) {
      toast.error(t('export.noData', 'No web orders available to export.'))
      return
    }

    const headers = [
      t('export.headers.orderNumber', 'Order #'),
      t('export.headers.customer', 'Customer'),
      t('export.headers.phone', 'Phone'),
      t('export.headers.shippingAddress', 'Shipping Address'),
      t('export.headers.carrier', 'Carrier / Logistics'),
      t('export.headers.paymentMethod', 'Payment Method'),
      t('export.headers.paymentStatus', 'Payment Status'),
      t('export.headers.fulfillmentStatus', 'Fulfillment Status'),
      t('export.headers.itemsCount', 'Items Count'),
      t('export.headers.grandTotalUSD', 'Grand Total ($)'),
      t('export.headers.grandTotalKHR', 'Grand Total (KHR)'),
      t('export.headers.orderStatus', 'Order Status'),
      t('export.headers.dateTime', 'Date & Time'),
    ]

    const translatePaymentMethod = (method?: string) => {
      if (!method) return t('export.paymentMethods.online', 'Online Store')
      const m = method.toLowerCase()
      if (m.includes('khqr') || m.includes('bakong')) return t('export.paymentMethods.khqr', 'Bakong KHQR')
      if (m.includes('cod') || m.includes('delivery')) return t('export.paymentMethods.cod', 'Cash on Delivery (COD)')
      if (m.includes('bank') || m.includes('transfer') || m.includes('acleda') || m.includes('wing')) {
        return t('export.paymentMethods.bankTransfer', 'Bank Transfer')
      }
      if (m.includes('cash')) return t('export.paymentMethods.cash', 'Cash')
      if (m.includes('card')) return t('export.paymentMethods.card', 'Card')
      return method.toUpperCase()
    }

    const translatePaymentStatus = (status?: string) => {
      const s = (status || 'pending').toLowerCase()
      if (s === 'paid') return t('export.paymentStatuses.paid', 'Paid')
      if (s === 'pending') return t('export.paymentStatuses.pending', 'Pending')
      if (s === 'failed') return t('export.paymentStatuses.failed', 'Failed')
      if (s === 'refunded') return t('export.paymentStatuses.refunded', 'Refunded')
      return status || t('export.paymentStatuses.pending', 'Pending')
    }

    const translateFulfillmentStatus = (status?: string) => {
      const s = (status || 'unfulfilled').toLowerCase()
      if (s === 'fulfilled') return t('export.fulfillmentStatuses.fulfilled', 'Fulfilled')
      if (s === 'unfulfilled') return t('export.fulfillmentStatuses.unfulfilled', 'Unfulfilled')
      if (s === 'partial') return t('export.fulfillmentStatuses.partial', 'Partially Fulfilled')
      return status || t('export.fulfillmentStatuses.unfulfilled', 'Unfulfilled')
    }

    const translateOrderStatus = (status?: string) => {
      const s = (status || 'pending').toLowerCase()
      if (s === 'pending') return t('export.statuses.pending', 'Pending')
      if (s === 'confirmed') return t('export.statuses.confirmed', 'Confirmed')
      if (s === 'processing') return t('export.statuses.processing', 'Processing')
      if (s === 'shipped') return t('export.statuses.shipped', 'Shipped')
      if (s === 'delivered') return t('export.statuses.delivered', 'Delivered')
      if (s === 'completed') return t('export.statuses.completed', 'Completed')
      if (s === 'cancelled') return t('export.statuses.cancelled', 'Cancelled')
      if (s === 'refunded') return t('export.statuses.refunded', 'Refunded')
      return status || t('export.statuses.pending', 'Pending')
    }

    const rows = exportItems.map((order) => {
      const items = order.items || (order as any)?.details || (order as any)?.order_items || []
      const itemCount = Math.round(
        items.reduce((totalQuantity: number, item: any) => totalQuantity + Number(item.quantity || 1), 0) || 1
      )
      const totalUSD = Number(order.grand_total ?? order.total_amount ?? 0)
      const totalKHR = Math.round(totalUSD * KHR_RATE)
      const dateStr = order.created_at ? new Date(order.created_at).toLocaleString(language === 'km' ? 'km-KH' : 'en-US') : ''
      const carrierName =
        order.shipping_method?.name ||
        order.shippingMethod?.name ||
        order.shipment?.carrier ||
        t('export.defaultCarrier', 'Standard Delivery')

      return [
        order.order_number || `ORD-${order.id}`,
        order.customer?.name || order.shipping_name || t('export.defaultCustomer', 'Online Customer'),
        order.customer?.phone || order.customer_phone || order.shipping_phone || '',
        order.shipping_address || '',
        carrierName,
        translatePaymentMethod(order.payment_method),
        translatePaymentStatus(order.payment_status),
        translateFulfillmentStatus(order.fulfillment_status),
        itemCount,
        totalUSD.toFixed(2),
        totalKHR,
        translateOrderStatus(order.status),
        dateStr,
      ]
    })

    const filename = t('export.filename', 'web_orders')
    downloadCsv(filename, headers, rows)
    toast.success(t('export.successToast', 'Orders exported to CSV successfully.'))
  }

  const statusCounts: Record<string, number> = (ordersResponse as any)?.status_counts || {}

  // Workspace Status Tabs Configuration (Clean Text + Count Badge)
  const tabs: WorkspaceTabItem[] = useMemo(() => [
    {
      id: 'all',
      label: t('all', 'All'),
      count: statusCounts.all ?? pagination.total,
    },
    {
      id: 'pending',
      label: t('pending', 'Pending'),
      count: statusCounts.pending,
    },
    {
      id: 'processing',
      label: t('processing', 'Processing'),
      count: statusCounts.processing,
    },
    {
      id: 'completed',
      label: t('completed', 'Completed'),
      count: statusCounts.completed,
    },
    {
      id: 'cancelled',
      label: t('cancelled', 'Cancelled'),
      count: statusCounts.cancelled,
    },
  ], [statusCounts, pagination.total, t])

  const columnOptions = useMemo(() => [
    { key: 'image', label: t('colPhoto', 'Photo') },
    { key: 'items', label: t('itemsAndSummary', 'Product / Items') },
    { key: 'order_number', label: t('orderNumber', 'Order #') },
    { key: 'customer', label: t('customer', 'Customer') },
    { key: 'courier', label: t('courier', 'Courier & Destination') },
    { key: 'payment_method', label: t('paymentMethod', 'Payment') },
    { key: 'grand_total', label: t('grandTotal', 'Total') },
    { key: 'fulfillment', label: t('fulfillment', 'Fulfillment') },
    { key: 'status', label: t('status', 'Status') },
    { key: 'created_at', label: t('date', 'Date') },
  ], [t])

  // Map order to receipt structure for SalesReceiptModal
  const receiptSalePayload = useMemo(() => {
    if (!receiptModalOrder) return null
    return {
      ...receiptModalOrder,
      invoice_number: receiptModalOrder.order_number || `ORD-${receiptModalOrder.id}`,
      date: receiptModalOrder.created_at,
      items: receiptModalOrder.items || (receiptModalOrder as any)?.details || (receiptModalOrder as any)?.order_items || [],
    }
  }, [receiptModalOrder])

  return (
    <div className="space-y-6 print:p-0">
      {/* ── 1. BREADCRUMB & HERO HEADER ───────────────────────────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('salesOperations', 'Sales Operations'), path: '/orders' },
            { label: t('webOrdersTitle', 'Web Orders') },
          ]}
        />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 sm:gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('webOrdersTitle', 'Web Orders')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('description', 'Manage online store orders, customer delivery addresses, and shipment fulfillments')}
          </p>
        </div>

        <HeaderActionsGroup className="w-full sm:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Shipping & Delivery Quick Management */}
          <SecondaryButton
            onClick={() => navigate('/shipping')}
            icon={<Truck size={15} />}
            label={t('shippingLink', 'Shipping')}
            title={t('shippingLinkTitle', 'Manage Shipping & Deliveries')}
            className="flex-1 sm:flex-none justify-center"
          />

          {/* Export CSV Button with Date Range */}
          <ExportButton
            onExportRange={(range) => handleExport(range)}
            loading={isExporting}
            label={t('common.exportCsv')}
            className="flex-1 sm:flex-none justify-center"
          />

          {/* Add Order / POS Button */}
          <AddButton
            onClick={() => navigate('/pos')}
            label={t('createOrder', 'Create Order')}
            title={t('createOrderTitle', 'Open POS to create new order')}
            className="flex-1 sm:flex-none justify-center"
          />
        </HeaderActionsGroup>
      </div>

      {/* ── 2. EXECUTIVE KPI SUMMARY METRICS (GLOBAL ENTERPRISE CARDS) ──────── */}
      <EnterpriseStatsGrid columns={4} className="print:hidden">
        {/* Card 1: Total Web Orders */}
        <EnterpriseStatsCard
          title={t('totalWebOrders', 'Total Web Orders')}
          value={ordersStats.total_orders}
          useCounter={true}
          icon={ShoppingBag}
          variant="blue"
          delay={0.05}
          subtitle={
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground mt-0.5">
              <span>{t('revenue', 'Revenue:')}</span>
              <span className="font-bold text-foreground">
                ${ordersStats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-muted-foreground/80">
                (៛{Math.round(ordersStats.total_revenue * KHR_RATE).toLocaleString()})
              </span>
            </div>
          }
        />

        {/* Card 2: Needs Action / Urgent Fulfillment */}
        <EnterpriseStatsCard
          title={t('needsAction', 'Needs Action')}
          value={ordersStats.pending_count}
          useCounter={true}
          icon={Clock}
          variant="amber"
          delay={0.1}
          subtitle={
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>{t('awaitingPacking', 'Awaiting confirmation & packing')}</span>
            </div>
          }
        />

        {/* Card 3: In Transit & Logistics */}
        <EnterpriseStatsCard
          title={t('inTransitLogistics', 'In Transit / Logistics')}
          value={activeFulfillmentCount}
          useCounter={true}
          icon={Truck}
          variant="purple"
          delay={0.15}
          subtitle={
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span>{t('couriers', 'Couriers:')}</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                VET • J&T • Grab
              </span>
            </div>
          }
          trend={{
            value: `${ordersStats.completed_count} ${t('completed', 'completed')}`,
            isPositive: true,
          }}
        />

        {/* Card 4: Pending COD / Unpaid Collections */}
        <EnterpriseStatsCard
          title={t('pendingCodUnpaid', 'Pending COD / Unpaid')}
          value={ordersStats.unpaid_total}
          prefix="$"
          decimals={2}
          useCounter={true}
          icon={DollarSign}
          variant="emerald"
          delay={0.2}
          subtitle={
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground mt-0.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {ordersStats.unpaid_count} {t('unpaidParcels', 'unpaid parcels')}
              </span>
              <span>•</span>
              <span>៛{Math.round(ordersStats.unpaid_total * KHR_RATE).toLocaleString()}</span>
            </div>
          }
          trend={{
            value: `${ordersStats.unpaid_count} ${t('toCollect', 'to collect')}`,
            isPositive: false,
          }}
        />
      </EnterpriseStatsGrid>

      {/* ── 3. WORKSPACE TABS NAVIGATION ──────────────────────────────────────── */}
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
        searchPlaceholder={t('searchByOrderNumber', 'Search by order number or customer...')}
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={activeFiltersCount > 0}
        filterActiveCount={activeFiltersCount}
        onReset={handleResetAllFilters}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
        refreshLoading={isFetching}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* ── 5. ORDERS TABLE VIEW ────────────────────────────────────────────── */}
      <OrdersTableSection
        orders={ordersList}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onView={(order) => navigate(`/orders/${order.id}`)}
        onPrintReceipt={(order) => setReceiptModalOrder(order)}
        onPrintWaybill={(order) => setWaybillOrder(order)}
        onUpdateStatus={(order) => handleOpenStatusDialog(order)}
        onQuickStatusChange={handleQuickStatusTransition}
      />

      {/* ── 5. PAGINATION ────────────────────────────────────────────────────── */}
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

      {/* ── 6. SLIDE-OUT WEB ORDERS ADVANCED FILTER DRAWER ────────────────────── */}
      <OrdersFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        statusFilter={effectiveStatus || ''}
        setStatusFilter={(val) => {
          if (val) setActiveTab(val)
          else setActiveTab('all')
        }}
        paymentStatusFilter={paymentStatusFilter || ''}
        setPaymentStatusFilter={(val) => setPaymentStatusFilter(val || undefined)}
        fulfillmentStatusFilter={fulfillmentStatusFilter || ''}
        setFulfillmentStatusFilter={(val) => setFulfillmentStatusFilter(val || undefined)}
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

      {/* ── 7. ORDER DETAIL DRAWER ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOrderId !== null && (
          <OrdersDetailDrawer
            order={(orderDetail || ordersList.find((order) => order.id === selectedOrderId)) as any}
            isLoading={detailLoading && !ordersList.find((order) => order.id === selectedOrderId)}
            onClose={() => setSelectedOrderId(null)}
            onPrintReceipt={(order) => setReceiptModalOrder(order as Order)}
            onPrintWaybill={(order) => setWaybillOrder(order as any)}
          />
        )}
      </AnimatePresence>

      {/* ── 8. POS 80MM / 58MM ORDER RECEIPT MODAL ───────────────────────────── */}
      <AnimatePresence>
        {receiptModalOrder !== null && (
          <SalesReceiptModal
            isOpen={receiptModalOrder !== null}
            onClose={() => setReceiptModalOrder(null)}
            sale={receiptSalePayload as any}
          />
        )}
      </AnimatePresence>

      {/* ── 8.1 COURIER SHIPPING WAYBILL MODAL (ស្លាកបញ្ញើដឹកជញ្ជូន) ───────────── */}
      <ShippingWaybillModal
        isOpen={waybillOrder !== null}
        onClose={() => setWaybillOrder(null)}
        order={waybillOrder}
      />

      {/* ── 9. GLOBAL STATUS UPDATE MODAL ─────────────────────────────────────── */}
      <UpdateOrderStatusModal
        isOpen={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false)
          setTargetOrder(null)
        }}
        orderId={targetOrder?.id}
        orderNumber={targetOrder ? targetOrder.order_number || `ORD-${targetOrder.id}` : undefined}
        currentStatus={targetOrder?.status}
      />
    </div>
  )
}

export default OrdersPage
