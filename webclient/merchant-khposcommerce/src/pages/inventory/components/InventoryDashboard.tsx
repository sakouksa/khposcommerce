import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  Package, Warehouse, AlertTriangle, TrendingUp, DollarSign,
  RefreshCw, BarChart2, CheckCircle, Layers, Tag, Database, List
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatCurrency, formatNumber } from '@/utils/formatters'
import inventoryService from '@/services/inventoryService'

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#a855f7']

interface InventoryDashboardProps {
  stats?: any
  statsData?: any
  loadingStats?: boolean
  onTabChange: (tabId: any) => void
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  stats,
  statsData,
  loadingStats,
  onTabChange
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['inventory', 'common'])
  const [warehouseViewMode, setWarehouseViewMode] = useState<'chart' | 'list'>('chart')

  // Query database stats directly if not supplied via props
  const {
    data: fetchedStats,
    isLoading: queryLoading,
    isFetching: queryFetching,
    refetch
  } = useQuery({
    queryKey: ['inventory-dashboard-stats'],
    queryFn: () => inventoryService.stats(),
    enabled: !stats && !statsData,
    staleTime: 30000,
  })

  const currentStats = stats || statsData || fetchedStats || {}
  const isLoading = (loadingStats ?? false) || (!stats && !statsData && queryLoading)
  const isRefreshing = queryFetching

  const summary = currentStats.summary || {}
  const rawCharts = currentStats.charts || {}

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['inventory-dashboard-stats'] })
    if (!stats && !statsData) {
      await refetch()
    }
  }

  // Quantitative Metrics from Backend Database
  const totalItems = Number(summary.total_items ?? summary.total_products ?? 0)
  const totalQty = Number(summary.total_qty ?? 0)
  const availableQty = Number(summary.available_qty ?? 0)
  const reservedQty = Number(summary.reserved_qty ?? 0)
  const lowStock = Number(summary.low_stock ?? summary.low_stock_alert ?? 0)
  const outOfStock = Number(summary.out_of_stock ?? 0)
  const overstock = Number(summary.overstock ?? 0)
  const totalWarehouses = Number(summary.warehouses ?? summary.total_warehouses ?? 0)
  const inventoryCost = Number(summary.inventory_cost ?? 0)
  const inventoryValue = Number(summary.inventory_value ?? summary.selling_value ?? 0)
  const profitPotential = Number(summary.profit_potential ?? (inventoryValue - inventoryCost))
  const turnoverRate = Number(summary.turnover_rate ?? 0)

  // Monthly Movement Chart Data from Real Database Movements
  const monthlyMovementData = useMemo(() => {
    const list = Array.isArray(rawCharts.monthly_movement) ? rawCharts.monthly_movement : []
    return list.map((d: any) => {
      const cleanKey = (d.month || '').trim()
      return {
        ...d,
        displayMonth: t(`dashboard_months.${cleanKey}`, { defaultValue: cleanKey })
      }
    })
  }, [rawCharts.monthly_movement, t])

  // Warehouse Stock Breakdown Data: Use raw database warehouse names directly
  const warehouseData = useMemo(() => {
    const rawList = Array.isArray(rawCharts.by_warehouse) ? rawCharts.by_warehouse : []
    const totalVolume = rawList.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0)

    return [...rawList]
      .sort((a: any, b: any) => (Number(b.value) || 0) - (Number(a.value) || 0))
      .map((d: any) => {
        const val = Number(d.value) || 0
        const pct = totalVolume > 0 ? ((val / totalVolume) * 100).toFixed(1) : '0.0'
        const rawName = String(d.name || '').trim()

        // Clean single-line label for chart axis (extract primary location prefix if long, e.g. "Phnom Penh", "Tbong Khmum")
        const words = rawName.split(/\s+/)
        const shortLabel = words.length > 2 && rawName.length > 15
          ? words.slice(0, 2).join(' ')
          : rawName

        return {
          ...d,
          value: val,
          pct,
          shortLabel,
          fullName: rawName,
          name: rawName,
        }
      })
  }, [rawCharts.by_warehouse])

  // Category Distribution Data: Use raw database category names directly
  const categoryData = useMemo(() => {
    const data = Array.isArray(rawCharts.by_category) ? rawCharts.by_category : []
    return data.map((d: any) => ({
      ...d,
      name: String(d.name || ''),
      value: Number(d.value) || 0
    }))
  }, [rawCharts.by_category])

  // Brand Distribution Data: Use raw database brand names directly
  const brandData = useMemo(() => {
    const data = Array.isArray(rawCharts.by_brand) ? rawCharts.by_brand : []
    return data.map((d: any) => ({
      ...d,
      name: String(d.name || ''),
      value: Number(d.value) || 0
    }))
  }, [rawCharts.by_brand])

  // Loading Skeleton View
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="space-y-2">
            <div className="h-6 w-64 bg-muted rounded-lg" />
            <div className="h-4 w-96 bg-muted/60 rounded-md" />
          </div>
          <div className="h-9 w-32 bg-muted rounded-xl" />
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-card border border-border/80 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-28 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded-xl" />
              </div>
              <div className="h-7 w-36 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted/70 rounded" />
            </div>
          ))}
        </div>

        {/* 6 Mini Metrics Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(idx => (
            <div key={idx} className="bg-card/70 border border-border/70 p-3.5 rounded-xl flex items-center gap-3">
              <div className="h-8 w-8 bg-muted rounded-lg shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="h-2.5 w-16 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* 4 Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-card border border-border/80 rounded-2xl p-5 space-y-4">
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-80 bg-muted/40 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* ─── Header & Sync Bar ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {t('dashboardTitle', 'Real-Time Inventory Database Analytics')}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('dashboardSubtitle', 'Synchronized statistics pulled directly from active database records')}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-foreground bg-muted/80 hover:bg-muted border border-border/80 rounded-xl transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-primary' : 'text-muted-foreground'} />
          <span>{t('refreshData', 'Refresh Data')}</span>
        </button>
      </div>

      {/* ─── Financial & Operational Key Performance Cards ───────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Total Stock Value (USD) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('inventory_value', 'Inventory Valuation ($)')}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {formatCurrency(inventoryValue)}
            </h3>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span>{t('inventory_cost', 'Cost')}:</span>
              <span className="font-bold text-foreground">{formatCurrency(inventoryCost)}</span>
            </p>
          </div>
        </motion.div>

        {/* Card 2: Profit Potential (USD) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('profit_potential', 'Profit Potential ($)')}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(profitPotential)}
            </h3>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {inventoryCost > 0 ? `+${((profitPotential / inventoryCost) * 100).toFixed(1)}%` : '+0%'}
              </span>
              <span>{t('estimatedMargin', 'estimated margin')}</span>
            </p>
          </div>
        </motion.div>

        {/* Card 3: Stock Health & Alert Status */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('low_stock', 'Low Stock & Out of Stock')}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {formatNumber(lowStock)}
              </h3>
              <span className="text-xs text-muted-foreground font-bold">
                / {formatNumber(outOfStock)} {t('out_of_stock', 'Out of stock')}
              </span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {lowStock + outOfStock > 0 ? t('reorderActionRequired', 'Reorder action required') : t('allStockHealthy', 'All stock is optimal')}
            </p>
          </div>
        </motion.div>

        {/* Card 4: Inventory Turnover & Hubs */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('turnover_rate', 'Turnover Rate & Warehouses')}
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <RefreshCw size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {turnoverRate}x
              </h3>
              <span className="text-xs text-muted-foreground font-bold">
                • {totalWarehouses} {t('activeWarehouses', 'Active Hubs')}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t('highVelocityStock', 'High inventory velocity & fulfillment')}
            </p>
          </div>
        </motion.div>

      </div>

      {/* ─── Secondary Quantitative Mini-Metrics Row ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-card/70 border border-border/70 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Package size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{t('totalItems', 'Total SKUs')}</p>
            <p className="text-base font-black text-foreground truncate font-mono">{formatNumber(totalItems)}</p>
          </div>
        </div>

        <div className="bg-card/70 border border-border/70 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <BarChart2 size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{t('total_qty', 'Total Quantity')}</p>
            <p className="text-base font-black text-foreground truncate font-mono">{formatNumber(totalQty)}</p>
          </div>
        </div>

        <div className="bg-card/70 border border-border/70 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{t('available_qty', 'Available')}</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 truncate font-mono">{formatNumber(availableQty)}</p>
          </div>
        </div>

        <div className="bg-card/70 border border-border/70 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{t('reserved_qty', 'Reserved')}</p>
            <p className="text-base font-black text-foreground truncate font-mono">{formatNumber(reservedQty)}</p>
          </div>
        </div>

        <div className="bg-card/70 border border-border/70 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <TrendingUp size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{t('overstock', 'Overstock')}</p>
            <p className="text-base font-black text-foreground truncate font-mono">{formatNumber(overstock)}</p>
          </div>
        </div>

        <div className="bg-card/70 border border-border/70 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
            <Warehouse size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">{t('activeWarehouses', 'Warehouses')}</p>
            <p className="text-base font-black text-foreground truncate font-mono">{formatNumber(totalWarehouses)}</p>
          </div>
        </div>

      </div>

      {/* ─── Visual Analytical Charts Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Monthly Stock Movement (In vs Out) */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 truncate">
                <BarChart2 size={16} className="text-primary shrink-0" />
                <span>{t('monthly_movement', 'Monthly Stock Movement (In vs Out)')}</span>
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {t('inflowOutflowComparison', 'Comparison of stock-in shipments versus sales outflow')}
              </p>
            </div>
            {/* Quick aggregate badge */}
            <span className="text-[11px] font-medium text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md shrink-0 font-mono hidden sm:inline-block">
              {formatNumber(summary.stock_in || 0)} In • {formatNumber(summary.stock_out || 0)} Out
            </span>
          </div>

          <div className="h-80 w-full pt-2 notranslate" translate="no">
            {monthlyMovementData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                <BarChart2 size={24} className="mb-2 opacity-40" />
                <span>{t('noMovementData', 'No stock movement records')}</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyMovementData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/60 opacity-35" />
                  <XAxis
                    dataKey="displayMonth"
                    stroke="currentColor"
                    className="text-xs text-muted-foreground font-semibold"
                    tickLine={false}
                  />
                  <YAxis
                    width={50}
                    stroke="currentColor"
                    className="text-xs text-muted-foreground font-mono"
                    tickLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${Number(value).toLocaleString()} ${t('units', 'units')}`,
                      name === 'in' ? t('stockIn', 'Stock In') : name === 'out' ? t('stockOut', 'Stock Out') : name
                    ]}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    formatter={(val) => val === 'in' ? t('stockIn', 'Stock In') : val === 'out' ? t('stockOut', 'Stock Out') : val}
                  />
                  <Bar dataKey="in" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} name={t('stockIn', 'Stock In')} />
                  <Bar dataKey="out" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} name={t('stockOut', 'Stock Out')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Stock Quantity by Warehouse */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 truncate">
                <Warehouse size={16} className="text-primary shrink-0" />
                <span>{t('stock_by_warehouse', 'Stock Quantity by Warehouse')}</span>
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {t('warehouseDistributionDesc', 'Inventory volume allocated across warehouse facilities')}
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-1 notranslate" translate="no">
            {warehouseData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                <Warehouse size={24} className="mb-2 opacity-40" />
                <span>{t('noWarehouseData', 'No warehouse stock records')}</span>
              </div>
            ) : warehouseViewMode === 'list' ? (
              /* Clean Full-Name Detail List with Progress Bars - Completely eliminates collision */
              <div className="h-full overflow-y-auto pr-2 space-y-2.5 scrollbar-thin">
                {warehouseData.map((item: any, idx: number) => {
                  const maxVal = Number(warehouseData[0]?.value) || 1
                  const fillPct = Math.min(100, Math.max(2, (item.value / maxVal) * 100))
                  return (
                    <div key={idx} className="space-y-1 p-2 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-foreground truncate" title={item.fullName}>
                          {item.fullName}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 font-mono">
                          <span className="font-bold text-foreground">{formatNumber(item.value)}</span>
                          <span className="text-[10px] text-muted-foreground">({item.pct}%)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted/80 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${fillPct}%`,
                            background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Clean Single-Line BarChart */
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={warehouseData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="warehouseBarGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border/60 opacity-35" />
                  <XAxis
                    type="number"
                    stroke="currentColor"
                    className="text-xs text-muted-foreground font-mono"
                    tickLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                  />
                  <YAxis
                    dataKey="shortLabel"
                    type="category"
                    stroke="currentColor"
                    className="text-xs text-muted-foreground font-medium"
                    width={105}
                    interval={0}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, _name: any, entry: any) => [
                      `${Number(value).toLocaleString()} ${t('units', 'units')} (${entry.payload.pct}%)`,
                      entry.payload.fullName
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#warehouseBarGrad)"
                    radius={[0, 6, 6, 0]}
                    barSize={12}
                    name={t('colTotalQty', 'Quantity')}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Stock Distribution by Category */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                {t('stock_by_category', 'Stock Distribution by Category')}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t('categoryShareDesc', 'Proportion of inventory catalog grouped by category')}
              </p>
            </div>
          </div>
          <div className="h-72 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                <Layers size={24} className="mb-2 opacity-40" />
                <span>{t('noCategoryData', 'No category stock records')}</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryData.map((_: any, index: number) => (
                      <Cell key={`cell-cat-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} ${t('units', 'units')}`, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Stock Distribution by Brand */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                {t('stock_by_brand', 'Stock Distribution by Brand')}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t('brandShareDesc', 'Product brand allocation across the inventory spectrum')}
              </p>
            </div>
          </div>
          <div className="h-72 flex items-center justify-center">
            {brandData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                <Tag size={24} className="mb-2 opacity-40" />
                <span>{t('noBrandData', 'No brand stock records')}</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {brandData.map((_: any, index: number) => (
                      <Cell key={`cell-brand-${index}`} fill={PALETTE[(index + 3) % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} ${t('units', 'units')}`, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

export default InventoryDashboard
