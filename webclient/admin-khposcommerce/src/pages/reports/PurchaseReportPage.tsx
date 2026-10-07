import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Download,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  ChevronDown,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { reportService } from '@/services/reportService'
import { useToast } from '@/hooks/useToast'
import Breadcrumb from '@/components/common/Breadcrumb'
import { downloadBlob } from '@/utils/export'

import PurchaseFilters, { type PurchaseFilterState } from './components/purchase/PurchaseFilters'
import PurchaseSummaryCards from './components/purchase/PurchaseSummaryCards'
import PurchaseTrendChart from './components/purchase/PurchaseTrendChart'
import SupplierChart from './components/purchase/SupplierChart'
import CategoryChart from './components/purchase/CategoryChart'
import BrandChart from './components/purchase/BrandChart'
import WarehouseChart from './components/purchase/WarehouseChart'
import PaymentStatusChart from './components/purchase/PaymentStatusChart'
import PurchaseReturnChart from './components/purchase/PurchaseReturnChart'
import TopSuppliersTable from './components/purchase/TopSuppliersTable'
import TopProductsTable from './components/purchase/TopProductsTable'
import PurchaseReportTable from './components/purchase/PurchaseReportTable'
import PurchaseReturnTable from './components/purchase/PurchaseReturnTable'

export const PurchaseReportPage: React.FC = () => {
  const { t } = useTranslation('reports')
  const toast = useToast()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]

  // Filter State
  const [filters, setFilters] = useState<PurchaseFilterState>({
    date_from: thirtyDaysAgo,
    date_to: todayStr,
    supplier_id: '',
    branch_id: '',
    warehouse_id: '',
    status: '',
    payment_status: '',
    currency_code: 'USD',
    quick_range: ''
  })

  const [trendGroupBy, setTrendGroupBy] = useState<string>('daily')
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')
  const [exporting, setExporting] = useState<boolean>(false)
  const [showExcelMenu, setShowExcelMenu] = useState<boolean>(false)
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

  // 1 Single Consolidated React Query for Overview (<50ms performance)
  const {
    data: overviewData,
    isLoading: overviewLoading,
    refetch: refetchOverview
  } = useQuery({
    queryKey: ['reports-purchase-overview', filters, trendGroupBy],
    queryFn: async () => {
      return reportService.purchaseOverview({ ...filters, group_by: trendGroupBy })
    },
    staleTime: 15000,
    refetchOnWindowFocus: false
  })

  // Table Query for Paginated Transaction Log
  const {
    data: tableData,
    isLoading: tableLoading,
    refetch: refetchTable
  } = useQuery({
    queryKey: ['reports-purchase-table', filters, page, search],
    queryFn: async () => {
      const res = await reportService.purchaseTable({ ...filters, page, per_page: 10, search })
      return res?.data ?? res ?? { data: [], pagination: {} }
    },
    staleTime: 10000,
    refetchOnWindowFocus: false
  })

  // Table Query for Paginated Returns Log
  const {
    data: returnsTableData,
    isLoading: returnsTableLoading
  } = useQuery({
    queryKey: ['reports-purchase-returns-table', filters],
    queryFn: async () => {
      const res = await reportService.purchaseReturnsTable({ ...filters, page: 1, per_page: 10 })
      return res?.data?.data ?? res?.data ?? res ?? []
    },
    staleTime: 10000,
    refetchOnWindowFocus: false
  })

  // Handle Export Excel
  const handleExport = async (presetRange?: string) => {
    try {
      setExporting(true)
      setShowExcelMenu(false)
      toast.info(t('purchase.toast.exportingExcel', 'Exporting Excel purchase report, please wait...'))

      let exportFilters = { ...filters }
      if (presetRange) {
        const today = new Date()
        let from = ''
        let to = today.toISOString().split('T')[0]

        if (presetRange === 'today') {
          from = to
        } else if (presetRange === 'yesterday') {
          const y = new Date(today)
          y.setDate(y.getDate() - 1)
          from = y.toISOString().split('T')[0]
          to = from
        } else if (presetRange === 'last_7_days') {
          const d = new Date(today)
          d.setDate(d.getDate() - 7)
          from = d.toISOString().split('T')[0]
        } else if (presetRange === 'last_30_days') {
          const d = new Date(today)
          d.setDate(d.getDate() - 30)
          from = d.toISOString().split('T')[0]
        } else if (presetRange === 'this_month') {
          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
          from = firstDay.toISOString().split('T')[0]
        } else if (presetRange === 'this_year') {
          const firstDay = new Date(today.getFullYear(), 0, 1)
          from = firstDay.toISOString().split('T')[0]
        }
        exportFilters.date_from = from
        exportFilters.date_to = to
      }

      const response = await reportService.exportPurchase({ ...exportFilters, format: 'excel' })

      const blob = new Blob([response.data])
      const dateStamp = new Date().toISOString().split('T')[0]
      downloadBlob(blob, `Purchase_Report_${dateStamp}.csv`)

      toast.success(t('purchase.toast.exportExcelSuccess', 'Purchase report exported to Excel successfully!'))
    } catch (err) {
      console.error('Export failed', err)
      toast.error(t('purchase.toast.exportError', 'Failed to export purchase report. Please try again.'))
    } finally {
      setExporting(false)
    }
  }

  const handleRefreshAll = () => {
    refetchOverview()
    refetchTable()
  }

  // Extract metrics from Overview
  const summary = overviewData?.summary ?? {}
  const trend = overviewData?.trend ?? []
  const suppliers = overviewData?.suppliers ?? []
  const categories = overviewData?.categories ?? []
  const brands = overviewData?.brands ?? []
  const warehouses = overviewData?.warehouses ?? []
  const status = overviewData?.status ?? []
  const paymentStatus = overviewData?.payment_status ?? []
  const returnTrend = overviewData?.return_trend ?? []
  const topSuppliers = overviewData?.top_suppliers ?? []
  const topProducts = overviewData?.top_products ?? []

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* ── 1. BREADCRUMB ────────────────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: t('title', 'Reports'), path: '/reports' },
          { label: t('purchase.purchaseReportTitle', 'Purchase Reports') },
        ]}
      />

      {/* ── 2. FRAMELESS HERO HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden relative z-20">
        <div className="space-y-1 min-w-0 flex-1 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('purchase.purchaseReportTitle', 'Purchase Reports')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-3xl leading-relaxed">
            {t('purchase.subtitle', 'Analyze purchasing activities, suppliers, inventory costs, purchase trends, returns, and financial performance.')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto xl:justify-end shrink-0 z-10">
          <div ref={excelMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowExcelMenu(!showExcelMenu)}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              <span>{t('purchase.exportExcel', 'Export Excel')}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showExcelMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExcelMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border/80 rounded-2xl shadow-2xl z-[120] p-1.5 space-y-1 animate-in fade-in zoom-in-95 ring-1 ring-black/5 dark:ring-white/10">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  {t('purchase.exportRange', 'Export Date Range')}
                </div>
                <button
                  type="button"
                  onClick={() => handleExport('current')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    <span>{t('purchase.currentRange', 'Current Filter Range')}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('today')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>{t('purchase.today', 'Today')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('yesterday')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>{t('purchase.yesterday', 'Yesterday')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('this_week')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>{t('purchase.thisWeek', 'This Week')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('this_month')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>{t('purchase.thisMonth', 'This Month')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <PurchaseFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1)
        }}
        onExport={handleExport}
        onRefresh={handleRefreshAll}
        isExporting={exporting}
      />

      {/* Top 8 Statistics Cards */}
      <PurchaseSummaryCards data={summary} isLoading={overviewLoading} />

      {/* Main Charts Grid 1: Trend & Supplier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <PurchaseTrendChart
          data={trend}
          isLoading={overviewLoading}
          groupBy={trendGroupBy}
          onGroupByChange={(grp) => setTrendGroupBy(grp)}
        />
        <SupplierChart data={suppliers} isLoading={overviewLoading} />
      </div>

      {/* Main Charts Grid 2: Category, Brand, Warehouse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <CategoryChart data={categories} isLoading={overviewLoading} />
        <BrandChart data={brands} isLoading={overviewLoading} />
        <WarehouseChart data={warehouses} isLoading={overviewLoading} />
      </div>

      {/* Main Charts Grid 3: Payment Status & Returns Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <PaymentStatusChart data={paymentStatus} isLoading={overviewLoading} />
        <PurchaseReturnChart data={returnTrend} isLoading={overviewLoading} />
      </div>

      {/* Top Suppliers & Top Purchased Products Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <TopSuppliersTable data={topSuppliers} isLoading={overviewLoading} />
        <TopProductsTable data={topProducts} isLoading={overviewLoading} />
      </div>

      {/* Main Detailed Purchase Transactions Log Table */}
      <PurchaseReportTable
        data={tableData?.data ?? []}
        pagination={tableData?.pagination}
        isLoading={tableLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        onPageChange={(p) => setPage(p)}
      />

      {/* Purchase Returns Transactions Table */}
      <PurchaseReturnTable
        data={returnsTableData}
        isLoading={returnsTableLoading}
      />
    </div>
  )
}

export default PurchaseReportPage
