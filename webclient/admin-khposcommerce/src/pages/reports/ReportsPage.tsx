import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import {
  BarChart3, Download, RefreshCw, FileText,
  TrendingUp, TrendingDown, DollarSign, Package,
  Calendar, Loader2, ShoppingBag, CheckCircle,
} from 'lucide-react'
import { reportService } from '@/services/reportService'
import { useToast } from '@/hooks/useToast'
import SalesReportPage from './SalesReportPage'
import PurchaseReportPage from './PurchaseReportPage'
import InventoryReportPage from './InventoryReportPage'
import { EnterpriseDatePicker } from '@/components/common'

interface ReportFilters {
  date_from: string
  date_to:   string
}

const today = new Date().toISOString().split('T')[0]
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const ReportsPage: React.FC<{ type?: string }> = ({ type = 'sales' }) => {
  const { t } = useTranslation('reports')
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  const currentType = tab || type // 'purchase', 'sales', 'inventory', 'profit-loss'

  if (currentType === 'sales') {
    return <SalesReportPage />
  }

  if (currentType === 'purchase' || currentType === 'purchases') {
    return <PurchaseReportPage />
  }

  if (currentType === 'inventory') {
    return <InventoryReportPage />
  }

  const [filters, setFilters] = useState<ReportFilters>({
    date_from: thirtyDaysAgo,
    date_to:   today,
  })
  const [exporting, setExporting] = useState(false)

  const { data: salesReport, isLoading: salesLoading, refetch: refetchSales } = useQuery({
    queryKey: ['report-sales', filters],
    queryFn: () => reportService.salesSummary(filters),
    enabled: currentType === 'sales',
  })

  const { data: purchaseReport, isLoading: purchaseLoading, refetch: refetchPurchases } = useQuery({
    queryKey: ['report-purchases', filters],
    queryFn: () => reportService.purchaseSummary(filters),
    enabled: currentType === 'purchase' || currentType === 'purchases',
  })

  const { data: inventoryReport, isLoading: invLoading, refetch: refetchInventory } = useQuery({
    queryKey: ['report-inventory', filters],
    queryFn: () => reportService.inventorySummary(filters),
    enabled: currentType === 'inventory',
  })

  const { data: profitReport, isLoading: profitLoading, refetch: refetchProfit } = useQuery({
    queryKey: ['report-profit', filters],
    queryFn: () => reportService.profitLossSummary(filters),
    enabled: currentType === 'profit-loss',
  })

  const handleExcelExport = async () => {
    setExporting(true)
    toast.info(t('toast.exportingExcel', 'Downloading Excel report, please wait...'))
    try {
      const typeKey = (currentType === 'purchase' || currentType === 'purchases') ? 'purchase' : currentType
      const response = await reportService.exportReport(typeKey, 'csv', { ...filters, format: 'excel' })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentType}-report-${filters.date_from || 'all'}-${filters.date_to || 'all'}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success(t('toast.exportExcelSuccess', 'Report exported to Excel successfully!'))
    } catch {
      toast.error(t('toast.exportError', 'Failed to export report. Please try again.'))
    } finally {
      setExporting(false)
    }
  }

  const refetch = currentType === 'sales'
    ? refetchSales
    : currentType === 'inventory'
    ? refetchInventory
    : (currentType === 'purchase' || currentType === 'purchases')
    ? refetchPurchases
    : refetchProfit

  const isLoading = salesLoading || invLoading || profitLoading || purchaseLoading

  const title =
    currentType === 'sales'                                     ? 'Sales Performance Report'    :
    (currentType === 'purchase' || currentType === 'purchases') ? 'Purchase Performance Report' :
    currentType === 'inventory'                                 ? 'Inventory Valuation Report'  :
                                                                  'Profit & Loss Report'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Analyze store metrics and export results</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExcelExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground border border-border
                       rounded-lg hover:bg-muted transition-colors font-medium disabled:opacity-60"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Excel Export
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground border border-border
                       rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={15} />
            <span>Date Range:</span>
          </div>
          <div className="w-44">
            <EnterpriseDatePicker
              value={filters.date_from}
              onChange={val => setFilters(f => ({ ...f, date_from: val }))}
              placeholder="From Date"
            />
          </div>
          <span className="text-muted-foreground">–</span>
          <div className="w-44">
            <EnterpriseDatePicker
              value={filters.date_to}
              onChange={val => setFilters(f => ({ ...f, date_to: val }))}
              placeholder="To Date"
            />
          </div>
          <button
            onClick={() => setFilters({ date_from: thirtyDaysAgo, date_to: today })}
            className="px-3 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => {
              const start = new Date()
              start.setDate(1)
              setFilters({ date_from: start.toISOString().split('T')[0], date_to: today })
            }}
            className="px-3 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            This Month
          </button>
        </div>
      </div>

      {/* ─── SALES REPORT ─────────────────────────────────────────────────────── */}
      {currentType === 'sales' && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {salesLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card p-6 rounded-xl border border-border space-y-3">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-8 w-32 rounded" />
                  </div>
                ))
              : [
                  { label: 'Total Revenue',    value: `Rp ${(salesReport?.total_sales ?? 0).toLocaleString('id-ID')}`,    icon: <DollarSign size={20} className="text-green-500" />,  color: 'bg-green-50 dark:bg-green-900/20' },
                  { label: 'Average Ticket',   value: `Rp ${Math.round(salesReport?.average_ticket ?? 0).toLocaleString('id-ID')}`,  icon: <TrendingUp size={20} className="text-blue-500" />,    color: 'bg-blue-50 dark:bg-blue-900/20'  },
                  { label: 'Transactions',     value: salesReport?.sales_count ?? 0,                                        icon: <FileText size={20} className="text-violet-500" />,   color: 'bg-violet-50 dark:bg-violet-900/20' },
                ].map(card => (
                  <div key={card.label} className="bg-card p-6 rounded-xl border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">{card.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1.5">
              <BarChart3 size={18} className="text-muted-foreground" />
              Daily Sales Performance
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesReport?.daily_breakdown ?? [
                  { date: 'Mon', total: 4000000 },
                  { date: 'Tue', total: 3000000 },
                  { date: 'Wed', total: 5000000 },
                  { date: 'Thu', total: 4780000 },
                  { date: 'Fri', total: 5890000 },
                  { date: 'Sat', total: 6390000 },
                  { date: 'Sun', total: 3200000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Sales']}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── INVENTORY REPORT ─────────────────────────────────────────────────── */}
      {currentType === 'inventory' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {invLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card p-6 rounded-xl border border-border space-y-3">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-8 w-20 rounded" />
                  </div>
                ))
              : [
                  { label: 'Total Items',         value: inventoryReport?.total_items ?? 0,     color: 'text-foreground' },
                  { label: 'Low Stock Alerts',    value: inventoryReport?.low_stock_items ?? 0, color: 'text-amber-500'  },
                  { label: 'Out of Stock',        value: inventoryReport?.out_of_stock ?? 0,    color: 'text-red-500'    },
                  { label: 'Stock Value',         value: `Rp ${(inventoryReport?.total_value ?? 0).toLocaleString('id-ID')}`, color: 'text-green-500' },
                ].map(card => (
                  <div key={card.label} className="bg-card p-6 rounded-xl border border-border">
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  </div>
                ))
            }
          </div>

          {/* Low stock table */}
          {inventoryReport?.low_stock_products?.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Package size={16} className="text-amber-500" />
                  Low Stock Products
                </h3>
              </div>
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left">Product</th>
                    <th className="text-left">SKU</th>
                    <th className="text-left">Qty</th>
                    <th className="text-left">Reorder Point</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.low_stock_products.map((item: any) => (
                    <tr key={item.id}>
                      <td className="font-medium text-sm text-foreground">{item.product_name}</td>
                      <td className="text-xs font-mono text-muted-foreground">{item.sku}</td>
                      <td><span className="badge-warning">{item.quantity}</span></td>
                      <td className="text-sm text-muted-foreground">{item.reorder_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── PURCHASES REPORT ─────────────────────────────────────────────────── */}
      {(currentType === 'purchase' || currentType === 'purchases') && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {purchaseLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card p-6 rounded-xl border border-border space-y-3">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-8 w-32 rounded" />
                  </div>
                ))
              : [
                  { label: 'Total Purchases',  value: `Rp ${(purchaseReport?.total_purchases ?? 0).toLocaleString('id-ID')}`, icon: <ShoppingBag size={20} className="text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-900/20' },
                  { label: 'Total Paid',       value: `Rp ${(purchaseReport?.total_paid ?? 0).toLocaleString('id-ID')}`,      icon: <CheckCircle size={20} className="text-green-500" />, color: 'bg-green-50 dark:bg-green-900/20' },
                  { label: 'Total Due',        value: `Rp ${(purchaseReport?.total_due ?? 0).toLocaleString('id-ID')}`,       icon: <DollarSign size={20} className="text-red-500" />, color: 'bg-red-50 dark:bg-red-900/20' },
                  { label: 'Purchases Count',  value: purchaseReport?.purchases_count ?? 0,                                 icon: <FileText size={20} className="text-indigo-500" />, color: 'bg-indigo-50 dark:bg-indigo-900/20' },
                ].map(card => (
                  <div key={card.label} className="bg-card p-6 rounded-xl border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                        <p className="text-xl font-bold mt-1 text-foreground">{card.value}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart */}
            <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1.5">
                <BarChart3 size={18} className="text-muted-foreground" />
                Monthly Purchase Trend
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={purchaseReport?.monthly_trend ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(v: any) => [`Rp ${Number(v).toLocaleString('id-ID')}`, 'Value']}
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total Ordered" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="paid" fill="#10b981" name="Total Paid" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Suppliers */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1.5">
                <TrendingUp size={18} className="text-muted-foreground" />
                Top Suppliers
              </h3>
              <div className="space-y-4">
                {purchaseReport?.top_suppliers?.map((supplier: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{supplier.supplier_name}</h4>
                      <p className="text-xs text-muted-foreground">{supplier.count} Orders</p>
                    </div>
                    <span className="font-bold text-sm text-foreground">
                      Rp {supplier.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                {(!purchaseReport?.top_suppliers || purchaseReport.top_suppliers.length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No supplier statistics available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PROFIT & LOSS REPORT ─────────────────────────────────────────────── */}
      {currentType === 'profit-loss' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profitLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card p-6 rounded-xl border border-border space-y-3">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-8 w-32 rounded" />
                  </div>
                ))
              : [
                  {
                    label: 'Gross Revenue',
                    value: `Rp ${(profitReport?.total_revenue ?? 0).toLocaleString('id-ID')}`,
                    icon: <TrendingUp size={20} className="text-green-500" />,
                    color: 'text-green-500',
                  },
                  {
                    label: 'Total Expenses',
                    value: `Rp ${(profitReport?.total_expenses ?? 0).toLocaleString('id-ID')}`,
                    icon: <TrendingDown size={20} className="text-red-500" />,
                    color: 'text-red-500',
                  },
                  {
                    label: 'Net Profit',
                    value: `Rp ${(profitReport?.net_profit ?? 0).toLocaleString('id-ID')}`,
                    icon: <DollarSign size={20} className="text-blue-500" />,
                    color: (profitReport?.net_profit ?? 0) >= 0 ? 'text-green-500' : 'text-red-500',
                  },
                ].map(card => (
                  <div key={card.label} className="bg-card p-6 rounded-xl border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>

          {/* Trend chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-1.5">
              <TrendingUp size={18} className="text-muted-foreground" />
              Revenue vs Expenses Trend
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitReport?.monthly_breakdown ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue"  stroke="#22c55e" strokeWidth={2} name="Revenue"  />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
