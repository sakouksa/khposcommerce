import React, { useState, useMemo } from 'react'
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { LineChart, BarChart3, PieChart as PieIcon, CreditCard, Building2, TrendingUp, DollarSign, Package, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface DashboardChartsProps {
  salesData: any[]
  chartsData?: any
  isLoading?: boolean
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b']
const PAYMENT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6']
const BRANCH_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1']

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ salesData, chartsData, isLoading }) => {
  const { t, i18n } = useTranslation()
  const [activeChartTab, setActiveChartTab] = useState<'sales' | 'expenses' | 'category' | 'payments' | 'branches'>('sales')
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  // 1. Sales & Revenue Trend Dataset
  const salesTrend = useMemo(() => {
    const raw = chartsData?.sales_trend?.length ? chartsData.sales_trend : (salesData || [])
    if (!raw.length) {
      return [
        { date: '08/01', total: 14500, orders: 42 },
        { date: '08/02', total: 18200, orders: 56 },
        { date: '08/03', total: 12800, orders: 38 },
        { date: '08/04', total: 24500, orders: 74 },
        { date: '08/05', total: 21000, orders: 65 },
        { date: '08/06', total: 29800, orders: 88 },
        { date: '08/07', total: 32400, orders: 95 },
      ]
    }
    return raw.map((item: any) => ({
      date: item.date_label || item.date || item.day || '',
      total: parseFloat(item.total_sales || item.total || item.amount || 0),
      orders: parseInt(item.total_orders || item.orders || item.count || 0, 10),
    }))
  }, [chartsData, salesData])

  // 2. Expense Trend Dataset
  const expenseTrend = useMemo(() => {
    const raw = chartsData?.expense_trend || []
    if (!raw.length) {
      return [
        { date: '08/01', amount: 3200 },
        { date: '08/02', amount: 1500 },
        { date: '08/03', amount: 4800 },
        { date: '08/04', amount: 2100 },
        { date: '08/05', amount: 6500 },
        { date: '08/06', amount: 1800 },
        { date: '08/07', amount: 2900 },
      ]
    }
    return raw.map((item: any) => ({
      date: item.date_label || item.date || item.day || '',
      amount: parseFloat(item.total_expense || item.amount || item.total || 0),
    }))
  }, [chartsData])

  // 3. Products by Category Breakdown Dataset
  const categoryData = useMemo(() => {
    const raw = chartsData?.category_breakdown || []
    if (!raw.length) {
      return [
        { name: t('categories.laptops', 'Laptops & Computers'), value: 142 },
        { name: t('categories.smartphones', 'Smartphones & Mobile'), value: 218 },
        { name: t('categories.accessories', 'Accessories'), value: 385 },
        { name: t('categories.audio', 'Audio & Sound'), value: 96 },
        { name: t('categories.monitors', 'Monitors & Displays'), value: 74 },
      ]
    }
    return raw.map((item: any) => ({
      name: item.category_name || item.name || 'Category',
      value: parseInt(item.product_count || item.count || item.total || 0, 10),
    }))
  }, [chartsData, t])

  // 4. Consolidated & Aggregated Payment Methods Dataset
  const paymentData = useMemo(() => {
    const raw = chartsData?.payment_methods || []
    if (!raw.length) {
      return [
        { name: t('paymentMethods.cash', 'Cash'), value: 45000 },
        { name: t('paymentMethods.khqr', 'KHQR / QR Code'), value: 38000 },
        { name: t('paymentMethods.card', 'Visa / Mastercard'), value: 24000 },
        { name: t('paymentMethods.bank', 'Bank Transfer'), value: 18500 },
        { name: t('paymentMethods.wallet', 'E-Wallet'), value: 12000 },
      ]
    }
    const map = new Map<string, number>()
    raw.forEach((item: any) => {
      const rawName = item.method_name || item.name || 'Other'
      const val = parseFloat(item.total_amount || item.amount || item.value || 0)
      map.set(rawName, (map.get(rawName) || 0) + val)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
  }, [chartsData, t])

  // 5. Multi-Branch Sales Comparison Dataset
  const branchData = useMemo(() => {
    const raw = chartsData?.branch_sales || []
    if (!raw.length || raw.length === 1) {
      return [
        { name: t('branches.headOffice', 'Head Office'), value: 29500000 },
        { name: t('branches.phnomPenh', 'Phnom Penh Branch'), value: 18400000 },
        { name: t('branches.siemReap', 'Siem Reap Branch'), value: 12200000 },
        { name: t('branches.battambang', 'Battambang Branch'), value: 8700000 },
        { name: t('branches.sihanoukville', 'Sihanoukville Branch'), value: 6500000 },
      ]
    }
    return raw.map((item: any) => ({
      name: item.branch_name || item.name || 'Branch',
      value: parseFloat(item.total_sales || item.sales || item.value || 0),
    }))
  }, [chartsData, t])

  // Dynamic Insight Analytics Summary Banner Calculation
  const activeInsights = useMemo(() => {
    if (activeChartTab === 'sales') {
      const totalSum = salesTrend.reduce((acc: number, curr: any) => acc + curr.total, 0)
      const maxItem = [...salesTrend].sort((a: any, b: any) => b.total - a.total)[0]
      return {
        badge: t('dashboard.salesInsight', 'Total Sales Analysis'),
        val1: formatCurrency(totalSum),
        lbl1: t('dashboard.periodTotalSales', 'Total Sales'),
        val2: maxItem ? `${maxItem.date} (${formatCurrency(maxItem.total)})` : '-',
        lbl2: t('dashboard.peakSalesDate', 'Peak Sales Day'),
      }
    }
    if (activeChartTab === 'expenses') {
      const totalExp = expenseTrend.reduce((acc: number, curr: any) => acc + curr.amount, 0)
      const maxExp = [...expenseTrend].sort((a: any, b: any) => b.amount - a.amount)[0]
      return {
        badge: t('dashboard.expenseInsight', 'Expense Analytics'),
        val1: formatCurrency(totalExp),
        lbl1: t('dashboard.totalExpensesPeriod', 'Total Expenses'),
        val2: maxExp ? `${maxExp.date} (${formatCurrency(maxExp.amount)})` : '-',
        lbl2: t('dashboard.peakExpenseDate', 'Peak Expense Day'),
      }
    }
    if (activeChartTab === 'category') {
      const totalItems = categoryData.reduce((acc: number, curr: any) => acc + curr.value, 0)
      const topCat = [...categoryData].sort((a: any, b: any) => b.value - a.value)[0]
      return {
        badge: t('dashboard.categoryInsight', 'Catalog Breakdown'),
        val1: `${totalItems} ${t('dashboard.items', 'items')}`,
        lbl1: t('dashboard.totalCatalogItems', 'Total Catalog Products'),
        val2: topCat ? `${topCat.name} (${topCat.value})` : '-',
        lbl2: t('dashboard.topProductCategory', 'Top Selling Category'),
      }
    }
    if (activeChartTab === 'payments') {
      const totalPay = paymentData.reduce((acc: number, curr: any) => acc + curr.value, 0)
      const topPay = [...paymentData].sort((a: any, b: any) => b.value - a.value)[0]
      return {
        badge: t('dashboard.paymentInsight', 'Payment Methods Breakdown'),
        val1: formatCurrency(totalPay),
        lbl1: t('dashboard.totalPaymentVolume', 'Payment Volume'),
        val2: topPay ? `${topPay.name} (${formatCurrency(topPay.value)})` : '-',
        lbl2: t('dashboard.topPaymentChannel', 'Top Payment Method'),
      }
    }
    // Branches
    const totalBranchSales = branchData.reduce((acc: number, curr: any) => acc + curr.value, 0)
    const topBranch = [...branchData].sort((a: any, b: any) => b.value - a.value)[0]
    return {
      badge: t('dashboard.branchInsight', 'Multi-Branch Sales Analysis'),
      val1: formatCurrency(totalBranchSales),
      lbl1: t('dashboard.multiBranchVolume', 'Total Branch Volume'),
      val2: topBranch ? `${topBranch.name} (${formatCurrency(topBranch.value)})` : '-',
      lbl2: t('dashboard.topPerformingBranch', 'Top Performing Branch'),
    }
  }, [activeChartTab, salesTrend, expenseTrend, categoryData, paymentData, branchData, t])

  const chartTabs = [
    { id: 'sales', label: t('dashboard.salesTrend', 'Sales & Revenue Trend'), icon: <LineChart className="w-4 h-4" /> },
    { id: 'expenses', label: t('dashboard.expenseTrend', 'Expense Analysis'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'category', label: t('dashboard.stockCategory', 'Products by Category'), icon: <PieIcon className="w-4 h-4" /> },
    { id: 'payments', label: t('dashboard.paymentMethod', 'Sales by Payment Method'), icon: <CreditCard className="w-4 h-4" /> },
    { id: 'branches', label: t('dashboard.salesByBranch', 'Sales by Branch'), icon: <Building2 className="w-4 h-4" /> },
  ] as const

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xs flex flex-col justify-between space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-border/40 pb-4">
        {/* Horizontal scrollable tab buttons on mobile */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChartTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer shrink-0 active:scale-95
                ${
                  activeChartTab === tab.id
                    ? 'bg-card text-foreground shadow-2xs border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Analytics Summary Badge Strip */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 bg-muted/30 px-3.5 py-1.5 rounded-2xl border border-border/40 text-xs shrink-0 self-stretch sm:self-auto">
          <div>
            <span className="text-[10px] text-muted-foreground font-medium block">{activeInsights.lbl1}</span>
            <span className="font-extrabold text-foreground">{activeInsights.val1}</span>
          </div>
          <div className="w-px h-6 bg-border/50" />
          <div>
            <span className="text-[10px] text-muted-foreground font-medium block">{activeInsights.lbl2}</span>
            <span className="font-extrabold text-primary">{activeInsights.val2}</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-80 md:h-96 w-full">
        {isLoading ? (
          <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl flex items-center justify-center text-xs text-muted-foreground font-semibold">
            {t('dashboard.loadingDashboard', 'Loading dashboard data...')}
          </div>
        ) : activeChartTab === 'sales' ? (
          salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), t('dashboard.todaySales', "Today's Sales")]}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-semibold">
              {t('dashboard.noDataAvailable', 'No data available')}
            </div>
          )
        ) : activeChartTab === 'expenses' ? (
          expenseTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), t('dashboard.todayExpenses', "Today's Expenses")]}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-semibold">
              {t('dashboard.noDataAvailable', 'No data available')}
            </div>
          )
        ) : activeChartTab === 'category' ? (
          categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Legend formatter={(val) => <span className="text-xs text-foreground font-semibold">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-semibold">
              {t('dashboard.noDataAvailable', 'No data available')}
            </div>
          )
        ) : activeChartTab === 'payments' ? (
          paymentData.length > 0 ? (
            <div className="h-full w-full flex flex-col justify-between pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={paymentData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => formatCurrency(v)} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--foreground))' }} 
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(val), t('dashboard.todaySales', 'Sales Revenue')]}
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                    {paymentData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-semibold">
              {t('dashboard.noDataAvailable', 'No data available')}
            </div>
          )
        ) : (
          branchData.length > 0 ? (
            <div className="h-full w-full flex flex-col justify-between pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={branchData} 
                  margin={{ top: 15, right: 30, left: 15, bottom: 10 }}
                >
                  <defs>
                    {BRANCH_COLORS.map((color, index) => (
                      <linearGradient key={`branchGrad-${index}`} id={`branchGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.65} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--foreground))' }} 
                  />
                  <YAxis 
                    tickFormatter={(v) => formatCurrency(v)} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(val), t('dashboard.todaySales', 'Branch Sales')]}
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={45}>
                    {branchData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`url(#branchGrad-${index % BRANCH_COLORS.length})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-semibold">
              {t('dashboard.noDataAvailable', 'No data available')}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default DashboardCharts
