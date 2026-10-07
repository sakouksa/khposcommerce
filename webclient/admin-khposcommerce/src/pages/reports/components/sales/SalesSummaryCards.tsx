import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingBag, TrendingUp, CircleDollarSign,
  Users, PackageCheck, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils/formatters'

export interface DashboardStatsData {
  total_revenue: number
  total_orders: number
  average_order_value: number
  total_profit: number
  total_customers: number
  items_sold: number
  revenue_change_pct?: number
  orders_change_pct?: number
  profit_change_pct?: number
}

interface SalesSummaryCardsProps {
  data?: DashboardStatsData
  isLoading?: boolean
}

export const SalesSummaryCards: React.FC<SalesSummaryCardsProps> = ({ data, isLoading }) => {
  const { t } = useTranslation('reports')

  const cards = [
    {
      title: t('sales.totalRevenue', 'Total Revenue'),
      value: formatCurrency(data?.total_revenue),
      change: data?.revenue_change_pct ?? 0,
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      accentColor: 'emerald',
    },
    {
      title: t('sales.totalOrders', 'Total Orders'),
      value: `${formatNumber(data?.total_orders)} Orders`,
      change: data?.orders_change_pct ?? 0,
      icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,
      gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
      border: 'border-blue-500/20 dark:border-blue-500/30',
      iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      accentColor: 'blue',
    },
    {
      title: t('sales.avgOrderValue', 'Avg Order Value'),
      value: formatCurrency(data?.average_order_value),
      change: null,
      icon: <TrendingUp className="w-5 h-5 text-indigo-500" />,
      gradient: 'from-indigo-500/10 via-purple-500/5 to-transparent',
      border: 'border-indigo-500/20 dark:border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
      accentColor: 'indigo',
    },
    {
      title: t('sales.totalProfit', 'Total Profit'),
      value: formatCurrency(data?.total_profit),
      change: data?.profit_change_pct ?? 0,
      icon: <CircleDollarSign className="w-5 h-5 text-purple-500" />,
      gradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
      border: 'border-purple-500/20 dark:border-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      accentColor: 'purple',
    },
    {
      title: t('sales.totalCustomers', 'Total Customers'),
      value: `${formatNumber(data?.total_customers)} Customers`,
      change: null,
      icon: <Users className="w-5 h-5 text-amber-500" />,
      gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      border: 'border-amber-500/20 dark:border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      accentColor: 'amber',
    },
    {
      title: t('sales.itemsSold', 'Items Sold'),
      value: `${formatNumber(data?.items_sold)} Items`,
      change: null,
      icon: <PackageCheck className="w-5 h-5 text-cyan-500" />,
      gradient: 'from-cyan-500/10 via-sky-500/5 to-transparent',
      border: 'border-cyan-500/20 dark:border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
      accentColor: 'cyan',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-card border border-border/80 rounded-[22px] p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-muted/60 animate-pulse rounded-lg" />
              <div className="h-9 w-9 bg-muted/60 animate-pulse rounded-xl" />
            </div>
            <div className="h-7 w-28 bg-muted/60 animate-pulse rounded-lg" />
            <div className="h-3 w-24 bg-muted/60 animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const isPositive = (card.change ?? 0) >= 0

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className={`p-5 rounded-[22px] bg-gradient-to-br ${card.gradient} border ${card.border} bg-card shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground line-clamp-1">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl shadow-2xs transition-transform group-hover:scale-110 ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-xl font-extrabold text-foreground tracking-tight line-clamp-1">
                {card.value}
              </div>

              {card.change !== null && card.change !== undefined && (
                <div className="flex items-center gap-1 text-[11px]">
                  <span
                    className={`inline-flex items-center font-extrabold px-1.5 py-0.5 rounded-md ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {isPositive ? `+${card.change}%` : `${card.change}%`}
                  </span>
                  <span className="text-muted-foreground truncate text-[10px]">
                    vs last period
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default SalesSummaryCards
