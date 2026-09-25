import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, DollarSign, ShoppingCart, Users, Package, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, ShoppingBag,
  Briefcase, Building2, Warehouse, Store, Building, Clock,
  FileCheck, ShieldAlert, CheckCircle2, CreditCard, Truck, UserCheck, FileText, Wallet
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import { formatCurrency, formatNumber } from '@/utils/formatters'

interface DashboardStatsProps {
  stats: any
  isLoading?: boolean
  visibleWidgetIds?: string[]
}

// Generate dynamic sparklines based on stat values
const generateSparkline = (baseVal: number) => {
  if (!baseVal || baseVal === 0) {
    return [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }]
  }
  return [
    { v: Math.round(baseVal * 0.7) },
    { v: Math.round(baseVal * 0.85) },
    { v: Math.round(baseVal * 0.65) },
    { v: Math.round(baseVal * 0.9) },
    { v: Math.round(baseVal * 0.8) },
    { v: Math.round(baseVal * 0.95) },
    { v: Math.round(baseVal * 1.1) },
  ]
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading, visibleWidgetIds }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  const filterCard = (cardId: string) => {
    if (!visibleWidgetIds || visibleWidgetIds.length === 0) return true
    const statGeneralIds = ['today_sales', 'today_orders', 'total_customers', 'total_products', 'kpi_stats', 'financial_metrics']
    const hasAnyGeneralStat = visibleWidgetIds.some(id => statGeneralIds.includes(id))
    if (hasAnyGeneralStat) return true
    return visibleWidgetIds.includes(cardId)
  }

  const formatMoney = (amount: number) => {
    return formatCurrency(amount, { locale })
  }

  const formatNum = (num: number) => {
    return formatNumber(num, { locale })
  }

  // Row 1: Primary Enterprise Financials & Sales
  const topRowCards = [

    {
      id: 'today_sales',
      title: t('dashboard.todaySales'),
      value: formatMoney(stats?.today_sales),
      change: stats?.sales_growth ?? 0,
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      gradient: 'from-blue-600 to-indigo-600',
      strokeColor: '#3b82f6',
      route: '/sales',
    },
    {
      id: 'today_revenue',
      title: t('dashboard.todayRevenue'),
      value: formatMoney(stats?.today_revenue),
      change: stats?.sales_growth ?? 0,
      icon: <DollarSign className="w-5 h-5 text-white" />,
      gradient: 'from-emerald-500 to-teal-600',
      strokeColor: '#10b981',
      route: '/reports/sales',
    },
    {
      id: 'gross_profit',
      title: t('dashboard.grossProfit'),
      value: formatMoney(stats?.gross_profit),
      change: 0,
      icon: <Wallet className="w-5 h-5 text-white" />,
      gradient: 'from-emerald-600 to-emerald-700',
      strokeColor: '#059669',
      route: '/reports/profit-loss',
    },
    {
      id: 'net_profit',
      title: t('dashboard.netProfit'),
      value: formatMoney(stats?.net_profit),
      change: 0,
      icon: <DollarSign className="w-5 h-5 text-white" />,
      gradient: 'from-purple-600 to-indigo-700',
      strokeColor: '#7c3aed',
      route: '/reports/profit-loss',
    },
    {
      id: 'today_orders',
      title: t('dashboard.todayOrders'),
      value: formatNumber(stats?.today_orders),
      change: stats?.orders_growth ?? 0,
      icon: <ShoppingCart className="w-5 h-5 text-white" />,
      gradient: 'from-violet-500 to-purple-600',
      strokeColor: '#8b5cf6',
      route: '/orders',
    },
    {
      id: 'today_purchases',
      title: t('dashboard.todayPurchases'),
      value: formatMoney(stats?.today_purchases),
      change: 0,
      icon: <ShoppingBag className="w-5 h-5 text-white" />,
      gradient: 'from-pink-500 to-rose-600',
      strokeColor: '#ec4899',
      route: '/purchases',
    },
    {
      id: 'inventory_value',
      title: t('dashboard.inventoryValue'),
      value: formatMoney(stats?.inventory_value),
      change: 0,
      icon: <Package className="w-5 h-5 text-white" />,
      gradient: 'from-amber-500 to-orange-600',
      strokeColor: '#f59e0b',
      route: '/inventory',
    },
    {
      id: 'cash_balance',
      title: t('dashboard.cashBalance'),
      value: formatMoney(stats?.cash_balance),
      change: 0,
      icon: <Wallet className="w-5 h-5 text-white" />,
      gradient: 'from-cyan-600 to-blue-600',
      strokeColor: '#0891b2',
      route: '/finance',
    },
  ]

  // Row 2: Entity & Operations Counters
  const secondRowCards = [
    {
      id: 'total_customers',
      title: t('dashboard.totalCustomers'),
      value: formatNumber(stats?.total_customers),
      change: stats?.customers_growth ?? 0,
      icon: <Users className="w-5 h-5 text-white" />,
      gradient: 'from-sky-500 to-blue-600',
      strokeColor: '#0284c7',
      route: '/customers',
    },
    {
      id: 'total_employees',
      title: t('dashboard.totalEmployees'),
      value: formatNumber(stats?.total_employees),
      change: 0,
      icon: <Briefcase className="w-5 h-5 text-white" />,
      gradient: 'from-indigo-500 to-blue-700',
      strokeColor: '#4338ca',
      route: '/employees',
    },
    {
      id: 'total_products',
      title: t('dashboard.totalProducts'),
      value: formatNumber(stats?.total_products),
      change: 0,
      icon: <Package className="w-5 h-5 text-white" />,
      gradient: 'from-amber-600 to-orange-600',
      strokeColor: '#d97706',
      route: '/products',
    },
    {
      id: 'total_suppliers',
      title: t('dashboard.totalSuppliers'),
      value: formatNumber(stats?.total_suppliers),
      change: 0,
      icon: <Building2 className="w-5 h-5 text-white" />,
      gradient: 'from-teal-500 to-emerald-600',
      strokeColor: '#0d9488',
      route: '/suppliers',
    },
    {
      id: 'total_warehouses',
      title: t('dashboard.totalWarehouses'),
      value: formatNumber(stats?.total_warehouses),
      change: 0,
      icon: <Warehouse className="w-5 h-5 text-white" />,
      gradient: 'from-slate-600 to-slate-800',
      strokeColor: '#475569',
      route: '/warehouses',
    },
    {
      id: 'total_branches',
      title: t('dashboard.totalBranches'),
      value: formatNumber(stats?.total_branches),
      change: 0,
      icon: <Store className="w-5 h-5 text-white" />,
      gradient: 'from-blue-700 to-indigo-800',
      strokeColor: '#1d4ed8',
      route: '/branches',
    },
    {
      id: 'total_companies',
      title: t('dashboard.totalCompanies'),
      value: formatNumber(stats?.total_companies),
      change: 0,
      icon: <Building className="w-5 h-5 text-white" />,
      gradient: 'from-slate-700 to-zinc-900',
      strokeColor: '#334155',
      route: '/companies',
    },
    {
      id: 'pending_orders',
      title: t('dashboard.pendingOrders'),
      value: formatNumber(stats?.pending_orders),
      change: 0,
      icon: <Clock className="w-5 h-5 text-white" />,
      gradient: 'from-yellow-500 to-amber-600',
      strokeColor: '#eab308',
      route: '/orders?status=pending',
    },
  ]

  // Row 3: Actionable Alerts & Pending Status
  const thirdRowCards = [
    {
      id: 'low_stock',
      title: t('dashboard.lowStock'),
      value: formatNumber(stats?.low_stock_count),
      change: 0,
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
      gradient: 'from-orange-500 to-amber-600',
      strokeColor: '#f97316',
      route: '/inventory?alert=low',
    },
    {
      id: 'out_of_stock',
      title: t('dashboard.outOfStock'),
      value: formatNumber(stats?.out_of_stock_count),
      change: 0,
      icon: <ShieldAlert className="w-5 h-5 text-white" />,
      gradient: 'from-rose-600 to-red-700',
      strokeColor: '#e11d48',
      route: '/inventory?alert=out',
    },
    {
      id: 'pending_purchase',
      title: t('dashboard.pendingPurchase'),
      value: formatNumber(stats?.pending_purchases),
      change: 0,
      icon: <FileCheck className="w-5 h-5 text-white" />,
      gradient: 'from-purple-500 to-indigo-600',
      strokeColor: '#a855f7',
      route: '/purchases?status=pending',
    },
    {
      id: 'pending_sales',
      title: t('dashboard.pendingSales'),
      value: formatNumber(stats?.pending_sales),
      change: 0,
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
      gradient: 'from-blue-500 to-cyan-600',
      strokeColor: '#3b82f6',
      route: '/sales?status=pending',
    },
    {
      id: 'pending_payment',
      title: t('dashboard.pendingPayment'),
      value: formatNumber(stats?.pending_payments),
      change: 0,
      icon: <CreditCard className="w-5 h-5 text-white" />,
      gradient: 'from-amber-500 to-orange-600',
      strokeColor: '#f59e0b',
      route: '/finance/payments',
    },
    {
      id: 'pending_delivery',
      title: t('dashboard.pendingDelivery'),
      value: formatNumber(stats?.pending_deliveries),
      change: 0,
      icon: <Truck className="w-5 h-5 text-white" />,
      gradient: 'from-emerald-500 to-teal-600',
      strokeColor: '#10b981',
      route: '/shipping',
    },
    {
      id: 'attendance_today',
      title: t('dashboard.attendanceToday'),
      value: formatNumber(stats?.today_attendance),
      change: 0,
      icon: <UserCheck className="w-5 h-5 text-white" />,
      gradient: 'from-cyan-500 to-blue-600',
      strokeColor: '#06b6d4',
      route: '/employees/attendance',
    },
    {
      id: 'payroll_draft',
      title: t('dashboard.payrollDraft'),
      value: formatMoney(stats?.payroll_draft),
      change: 0,
      icon: <FileText className="w-5 h-5 text-white" />,
      gradient: 'from-slate-600 to-slate-800',
      strokeColor: '#64748b',
      route: '/employees/payroll',
    },
  ]

  const renderCardGrid = (cards: any[], gridCols: string) => {
    if (isLoading) {
      return (
        <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
          {Array.from({ length: cards.length }).map((_, i) => (
            <div key={i} className="h-28 bg-card border border-border/60 rounded-2xl p-4 space-y-3 animate-pulse flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-7 w-7 bg-muted rounded-xl" />
              </div>
              <div className="h-6 w-28 bg-muted rounded" />
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
        {cards.map((card, idx) => {
          const isPositive = card.change >= 0
          const numericValue = typeof card.value === 'number' ? card.value : parseFloat(String(card.value).replace(/[^0-9.-]+/g, '')) || 0
          const sparkData = generateSparkline(numericValue)

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02, duration: 0.2 }}
              whileHover={{ y: -3, transition: { duration: 0.1 } }}
              onClick={() => navigate(card.route)}
              className="bg-card border border-border/70 hover:border-primary/50 rounded-2xl p-3.5 sm:p-4.5 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group"
            >
              {/* Header info */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] sm:text-xs font-bold text-muted-foreground block truncate leading-snug">{card.title}</span>
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-foreground mt-0.5 sm:mt-1 tracking-tight truncate">{card.value}</h3>
                </div>
                <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${card.gradient} rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  {card.icon}
                </div>
              </div>

              {/* Sparkline & change info */}
              <div className="flex items-end justify-between mt-2.5 sm:mt-3 gap-2">
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold shrink-0">
                  {card.change !== 0 ? (
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                      isPositive 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(card.change)}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{t('dashboard.vsYesterday')}</span>
                  )}
                </div>

                {/* SVG Sparkline */}
                <div className="w-12 sm:w-16 h-5 sm:h-6 opacity-60 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <Area 
                        type="monotone" 
                        dataKey="v" 
                        stroke={card.strokeColor} 
                        strokeWidth={1.5} 
                        fill="none" 
                        dot={false} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  const filteredTop = topRowCards.filter(c => filterCard(c.id))
  const filteredSecond = secondRowCards.filter(c => filterCard(c.id))
  const filteredThird = thirdRowCards.filter(c => filterCard(c.id))

  if (filteredTop.length === 0 && filteredSecond.length === 0 && filteredThird.length === 0) {
    return null
  }

  const responsiveGridClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4'

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Row: Primary Financial KPIs */}
      {filteredTop.length > 0 && (
        <div>
          {renderCardGrid(filteredTop, responsiveGridClass)}
        </div>
      )}

      {/* Second Row: Enterprise Entity Stats */}
      {filteredSecond.length > 0 && (
        <div>
          {renderCardGrid(filteredSecond, responsiveGridClass)}
        </div>
      )}

      {/* Third Row: Operational Alert Counters */}
      {filteredThird.length > 0 && (
        <div>
          {renderCardGrid(filteredThird, responsiveGridClass)}
        </div>
      )}
    </div>
  )
}

export default DashboardStats
