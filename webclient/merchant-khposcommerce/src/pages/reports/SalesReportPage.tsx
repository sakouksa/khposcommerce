import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart2, RefreshCw, AlertTriangle, WifiOff, ShieldAlert,
  Download, Loader2, ChevronDown, Calendar, FileSpreadsheet
} from 'lucide-react'
import { reportService } from '@/services/reportService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import Breadcrumb from '@/components/common/Breadcrumb'
import { downloadBlob } from '@/utils/export'

import { SalesFilters, type SalesFilterState } from './components/sales/SalesFilters'
import { SalesSummaryCards } from './components/sales/SalesSummaryCards'
import { RevenueTrendChart } from './components/sales/RevenueTrendChart'
import { CategorySalesChart } from './components/sales/CategorySalesChart'
import { BrandSalesChart } from './components/sales/BrandSalesChart'
import { PaymentChart } from './components/sales/PaymentChart'
import { TopProductsTable } from './components/sales/TopProductsTable'
import { TopCustomersTable } from './components/sales/TopCustomersTable'
import { SalesReportTable } from './components/sales/SalesReportTable'

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const today = new Date().toISOString().split('T')[0]

export const SalesReportPage: React.FC = () => {
  const { t } = useTranslation('reports')
  const toast = useToast()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const canView = hasPermission(['reports.sales.view', 'report.view'])
  const canExport = hasPermission(['reports.sales.export', 'report.export'])

  const [filters, setFilters] = useState<SalesFilterState>({
    date_from: thirtyDaysAgo,
    date_to: today,
    branch_id: '',
    warehouse_id: '',
    customer_id: '',
    payment_method_id: '',
    product_id: '',
  })

  const [trendGroupBy, setTrendGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [exporting, setExporting] = useState(false)
  const [showExcelMenu, setShowExcelMenu] = useState(false)
  const excelMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (excelMenuRef.current && !excelMenuRef.current.contains(e.target as Node)) {
        setShowExcelMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 1. Single Consolidated Overview Query (Fetches summary, trend, categories, brands, payments, top products, top customers in 1 single HTTP request)
  const {
    data: overviewData,
    isLoading: overviewLoading,
    isError: overviewError,
    error: summaryErrObj,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['sales-overview', filters, trendGroupBy],
    queryFn: () =>
      reportService.salesOverview({ ...filters, group_by: trendGroupBy }),
    enabled: canView,
    staleTime: 15000,
  })

  const summaryData         = overviewData?.summary
  const summaryLoading      = overviewLoading
  const summaryError        = overviewError

  const trendData           = overviewData?.trend ?? []
  const trendLoading        = overviewLoading

  const categoryData        = overviewData?.categories ?? []
  const categoryLoading     = overviewLoading

  const brandData           = overviewData?.brands ?? []
  const brandLoading        = overviewLoading

  const paymentData         = overviewData?.payment_methods ?? []
  const paymentLoading      = overviewLoading

  const topProductsData     = overviewData?.top_products ?? []
  const topProductsLoading  = overviewLoading

  const topCustomersData    = overviewData?.top_customers ?? []
  const topCustomersLoading = overviewLoading

  // 2. Sales detailed list query
  const {
    data: salesListData,
    isLoading: salesListLoading,
    refetch: refetchSalesList,
  } = useQuery({
    queryKey: ['sales-list', filters, page, search, sortBy, sortOrder],
    queryFn: () =>
      reportService.salesList({ ...filters, page, search, sort_by: sortBy, sort_order: sortOrder, per_page: 15 }),
    enabled: canView,
    staleTime: 15000,
  })

  const handleRefreshAll = () => {
    refetchOverview()
    refetchSalesList()
  }

  const getPresetDateRange = (preset: 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | '7days' | '30days' | 'lastMonth') => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    if (preset === 'today') {
      return { date_from: todayStr, date_to: todayStr }
    }
    if (preset === 'yesterday') {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      return { date_from: yesterday, date_to: yesterday }
    }
    if (preset === 'thisWeek') {
      const d = new Date()
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(d.setDate(diff)).toISOString().split('T')[0]
      return { date_from: monday, date_to: todayStr }
    }
    if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      return { date_from: firstDay, date_to: todayStr }
    }
    if (preset === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      return { date_from: sevenDaysAgo, date_to: todayStr }
    }
    if (preset === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      return { date_from: thirtyDaysAgo, date_to: todayStr }
    }
    return { date_from: filters.date_from, date_to: filters.date_to }
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf', overrideDates?: { date_from: string; date_to: string }) => {
    if (!canExport) {
      toast.error(t('sales.errors.permissionDenied'))
      return
    }

    setExporting(true)
    setShowExcelMenu(false)

    if (format === 'excel' || format === 'csv') {
      toast.info(t('sales.toast.exportingExcel', 'Exporting Excel sales report, please wait...'))
    } else {
      toast.info(t('sales.toast.exportingPdf', 'Exporting PDF sales report, please wait...'))
    }

    const exportFilters = overrideDates
      ? { ...filters, date_from: overrideDates.date_from, date_to: overrideDates.date_to }
      : filters

    try {
      const response = await reportService.exportSales({ ...exportFilters, format })

      const blob = new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' })
      downloadBlob(blob, `sales_report_${exportFilters.date_from}_${exportFilters.date_to}.${format === 'excel' ? 'csv' : format}`)

      toast.success(
        format === 'excel' || format === 'csv'
          ? t('sales.toast.exportExcelSuccess', 'Sales report exported to Excel successfully!')
          : t('sales.toast.exportPdfSuccess', 'Sales report exported to PDF successfully!')
      )
    } catch (err) {
      toast.error(t('sales.toast.exportError', 'Failed to export sales report. Please try again.'))
    } finally {
      setExporting(false)
    }
  }

  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  // Permission Guard
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="p-4 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-full">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {t('sales.errors.permissionDenied')}
        </p>
      </div>
    )
  }

  // Network or Server Error Guard
  if (summaryError) {
    const isNetworkErr = !navigator.onLine
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="p-4 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-full">
          {isNetworkErr ? <WifiOff size={48} /> : <AlertTriangle size={48} />}
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {isNetworkErr ? 'Network Disconnected' : 'Server Error'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {isNetworkErr ? t('sales.errors.networkDisconnected') : t('sales.errors.serverError')}
        </p>
        <button
          type="button"
          onClick={handleRefreshAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow"
        >
          <RefreshCw size={14} /> Retry Loading
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-12 print:p-0">
      {/* ── 1. BREADCRUMB ─────────────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: 'Reports', path: '/reports' },
          { label: 'Sales Reports' },
        ]}
      />

      {/* ── 2. FRAMELESS HERO HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden relative z-20">
        <div className="space-y-1 min-w-0 flex-1 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('sales.title', 'Sales Analytics & Revenue Performance')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-3xl leading-relaxed">
            {t('sales.subtitle', 'Analyze sales performance, revenue trends, total orders, top-selling products, customer buying patterns, and payment method breakdowns in real time across all branches.')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto xl:justify-end shrink-0 z-10">
          
          <div ref={excelMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowExcelMenu(!showExcelMenu)}
              disabled={exporting || !canExport}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:opacity-90 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {exporting ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
              <span>Export Excel</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showExcelMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExcelMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border/80 rounded-2xl shadow-2xl z-[120] p-1.5 space-y-1 animate-in fade-in zoom-in-95 ring-1 ring-black/5 dark:ring-white/10">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Export Excel Range
                </div>
                <button
                  type="button"
                  onClick={() => handleExport('excel')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    <span>Current Range</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('excel', getPresetDateRange('today'))}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>Today</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('excel', getPresetDateRange('yesterday'))}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>Yesterday</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('excel', getPresetDateRange('thisWeek'))}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>This Week</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('excel', getPresetDateRange('thisMonth'))}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>This Month</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <SalesFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1)
        }}
        onExport={handleExport}
        onRefresh={handleRefreshAll}
        isExporting={exporting}
      />

      {/* Top 6 Statistics Cards */}
      <SalesSummaryCards data={summaryData} isLoading={summaryLoading} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <RevenueTrendChart
          data={trendData}
          isLoading={trendLoading}
          groupBy={trendGroupBy}
          onGroupByChange={(grp) => setTrendGroupBy(grp)}
        />
        <CategorySalesChart data={categoryData} isLoading={categoryLoading} />
        <BrandSalesChart data={brandData} isLoading={brandLoading} />
        <PaymentChart data={paymentData} isLoading={paymentLoading} />
      </div>

      {/* Top Products & Top Customers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <TopProductsTable data={topProductsData} isLoading={topProductsLoading} />
        <TopCustomersTable data={topCustomersData} isLoading={topCustomersLoading} />
      </div>

      {/* Main Detailed Sales Report Table */}
      <SalesReportTable
        data={salesListData?.data ?? []}
        pagination={salesListData?.pagination ?? salesListData}
        isLoading={salesListLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        onPageChange={(p) => setPage(p)}
        onSortChange={handleSortChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onExport={handleExport}
      />
    </div>
  )
}

export default SalesReportPage
