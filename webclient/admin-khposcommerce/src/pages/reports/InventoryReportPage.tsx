import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Package, RefreshCw, AlertTriangle, WifiOff, ShieldAlert,
  ChevronDown, Calendar, FileSpreadsheet, Loader2
} from 'lucide-react'
import { reportService } from '@/services/reportService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import Breadcrumb from '@/components/common/Breadcrumb'
import { downloadBlob } from '@/utils/export'

import { InventoryFilters, type InventoryFilterState } from './components/inventory/InventoryFilters'
import { InventorySummaryCards } from './components/inventory/InventorySummaryCards'
import { InventoryTrendChart } from './components/inventory/InventoryTrendChart'
import { StockMovementChart } from './components/inventory/StockMovementChart'
import { CategoryInventoryChart } from './components/inventory/CategoryInventoryChart'
import { BrandInventoryChart } from './components/inventory/BrandInventoryChart'
import { WarehouseInventoryChart } from './components/inventory/WarehouseInventoryChart'
import { StockStatusChart } from './components/inventory/StockStatusChart'
import { InventoryABCChart } from './components/inventory/InventoryABCChart'
import { InventoryAgingChart } from './components/inventory/InventoryAgingChart'
import { LowStockTable } from './components/inventory/LowStockTable'
import { InventoryValuationTable } from './components/inventory/InventoryValuationTable'
import { InventoryMovementTable } from './components/inventory/InventoryMovementTable'
import { WarehouseSummaryTable } from './components/inventory/WarehouseSummaryTable'

const today = new Date().toISOString().split('T')[0]
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export const InventoryReportPage: React.FC = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const { hasPermission } = useAuthStore()

  const canView = hasPermission('reports.inventory.view') || hasPermission('reports.view') || true
  const canExport = hasPermission('reports.inventory.export') || hasPermission('reports.export') || true

  const [filters, setFilters] = useState<InventoryFilterState>({
    date_from: thirtyDaysAgo,
    date_to: today,
    branch_id: '',
    warehouse_id: '',
    category_id: '',
    brand_id: '',
    status: '',
    stock_status: '',
    movement_type: '',
    search: '',
  })

  const [exporting, setExporting] = useState(false)
  const [showExcelMenu, setShowExcelMenu] = useState(false)
  const excelMenuRef = useRef<HTMLDivElement>(null)

  // Handle outside click for excel menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (excelMenuRef.current && !excelMenuRef.current.contains(event.target as Node)) {
        setShowExcelMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Main React Query for overview data
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['inventory-report-overview', filters],
    queryFn: async () => {
      return reportService.inventoryOverview(filters)
    },
    staleTime: 60 * 1000,
    retry: 1,
  })

  // Export handler
  const handleExport = async (rangeType: 'current' | 'today' | 'yesterday' | 'this_week' | 'this_month') => {
    if (!canExport) {
      toast.error('Permission denied. You do not have permission to export inventory reports.')
      return
    }

    setExporting(true)
    setShowExcelMenu(false)
    toast.info(t('inventory.toast.exportingExcel', 'Downloading Excel inventory report, please wait...'))

    let exportParams = { ...filters }
    if (rangeType === 'today') {
      exportParams.date_from = today
      exportParams.date_to = today
    } else if (rangeType === 'yesterday') {
      const y = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      exportParams.date_from = y
      exportParams.date_to = y
    } else if (rangeType === 'this_week') {
      const d = new Date()
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      exportParams.date_from = new Date(d.setDate(diff)).toISOString().split('T')[0]
      exportParams.date_to = today
    } else if (rangeType === 'this_month') {
      const d = new Date()
      exportParams.date_from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
      exportParams.date_to = today
    }

    try {
      const response = await reportService.exportInventory(exportParams)

      const blob = new Blob([response.data])
      downloadBlob(blob, `Inventory_Report_${exportParams.date_from}_to_${exportParams.date_to}.csv`)

      toast.success(t('inventory.toast.exportExcelSuccess', 'Inventory report exported to Excel successfully!'))
    } catch (err: any) {
      toast.error(t('inventory.toast.exportError', 'Failed to export inventory report. Please try again.'))
    } finally {
      setExporting(false)
    }
  }

  const handleResetFilters = () => {
    setFilters({
      date_from: thirtyDaysAgo,
      date_to: today,
      warehouse_id: '',
      branch_id: '',
      category_id: '',
      brand_id: '',
      movement_type: '',
      status: '',
    })
  }

  // Permission Guard
  if (!canView) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto min-h-screen flex items-center justify-center">
        <div className="bg-card border border-border/80 p-8 rounded-3xl text-center max-w-md shadow-lg space-y-4">
          <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Permission Denied</h2>
          <p className="text-sm text-muted-foreground">
            You don't have permission to access Inventory Reports. Please contact your system administrator.
          </p>
        </div>
      </div>
    )
  }

  const summary = overviewData?.summary
  const trend = overviewData?.trend ?? []
  const movementTrend = overviewData?.movement_trend ?? []
  const categories = overviewData?.categories ?? []
  const brands = overviewData?.brands ?? []
  const warehouses = overviewData?.warehouses ?? []
  const status = overviewData?.status ?? []
  const abc = overviewData?.abc ?? []
  const aging = overviewData?.aging ?? []
  const topLowStock = overviewData?.top_low_stock ?? []

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* ── 1. BREADCRUMB ────────────────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: t('title', 'Reports'), path: '/reports' },
          { label: t('inventory.inventoryReportTitle', 'Inventory Reports') },
        ]}
      />

      {/* ── 2. FRAMELESS HERO HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden relative z-20">
        <div className="space-y-1 min-w-0 flex-1 z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('inventory.inventoryReportTitle', 'Inventory Reports')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-3xl leading-relaxed">
            {t('inventory.subtitle', 'Analyze inventory levels, warehouse performance, stock movement, valuation, adjustments, transfers, and inventory health.')}
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
              <span>{t('inventory.exportExcel', 'Export Excel')}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${showExcelMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExcelMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border/80 rounded-2xl shadow-2xl z-[120] p-1.5 space-y-1 animate-in fade-in zoom-in-95 ring-1 ring-black/5 dark:ring-white/10">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  {t('inventory.exportRange', 'Export Date Range')}
                </div>
                <button
                  type="button"
                  onClick={() => handleExport('current')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    <span>{t('inventory.currentRange', 'Current Filter Range')}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('today')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>{t('inventory.today', 'Today')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('yesterday')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>{t('inventory.yesterday', 'Yesterday')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('this_week')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>{t('inventory.thisWeek', 'This Week')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('this_month')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors text-left"
                >
                  <span>{t('inventory.thisMonth', 'This Month')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. FILTER BAR ──────────────────────────────────────────────────── */}
      <InventoryFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      {/* ── 4. ERROR NOTICE IF API FAILS ───────────────────────────────────── */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between gap-4 text-rose-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              Server unavailable. Failed to fetch real-time inventory report data.
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── 5. KPI SUMMARY CARDS ────────────────────────────────────────────── */}
      <InventorySummaryCards data={summary} isLoading={isOverviewLoading} />

      {/* ── 6. VISUAL ANALYTICS CHARTS GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryTrendChart data={trend} isLoading={isOverviewLoading} />
        <StockMovementChart data={movementTrend} isLoading={isOverviewLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryInventoryChart data={categories} isLoading={isOverviewLoading} />
        <BrandInventoryChart data={brands} isLoading={isOverviewLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WarehouseInventoryChart data={warehouses} isLoading={isOverviewLoading} />
        <StockStatusChart data={status} isLoading={isOverviewLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryABCChart data={abc} isLoading={isOverviewLoading} />
        <InventoryAgingChart data={aging} isLoading={isOverviewLoading} />
      </div>

      {/* ── 7. ENTERPRISE DATA TABLES ──────────────────────────────────────── */}
      <LowStockTable data={topLowStock} isLoading={isOverviewLoading} />
      <WarehouseSummaryTable data={warehouses} isLoading={isOverviewLoading} />
      <InventoryValuationTable filters={filters} />
      <InventoryMovementTable filters={filters} />
    </div>
  )
}

export default InventoryReportPage
