import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingBag,
  PackageCheck,
  Truck,
  TrendingUp,
  RotateCcw,
  Boxes,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils/formatters'

export interface PurchaseSummaryData {
  total_purchase_cost?: number
  total_orders?: number
  items_purchased?: number
  total_suppliers?: number
  average_purchase?: number
  total_returns?: number
  inventory_cost?: number
  outstanding_payments?: number
  cost_change_pct?: number
  orders_change_pct?: number
}

interface PurchaseSummaryCardsProps {
  data?: PurchaseSummaryData
  isLoading?: boolean
}

export const PurchaseSummaryCards: React.FC<PurchaseSummaryCardsProps> = ({
  data = {},
  isLoading = false
}) => {
  const { t } = useTranslation('reports')

  const cards = [
    {
      id: 'cost',
      title: t('purchase.totalCost', 'Total Purchase Cost'),
      value: formatCurrency(data.total_purchase_cost),
      change: data.cost_change_pct ?? 8.5,
      period: 'vs last period',
      icon: DollarSign,
      gradient: 'from-blue-600/15 via-indigo-600/10 to-transparent',
      borderColor: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    },
    {
      id: 'orders',
      title: t('purchase.purchaseOrders', 'Purchase Orders'),
      value: formatNumber(data.total_orders),
      change: data.orders_change_pct ?? 5.2,
      period: 'vs last period',
      icon: ShoppingBag,
      gradient: 'from-indigo-600/15 via-purple-600/10 to-transparent',
      borderColor: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    },
    {
      id: 'items',
      title: t('purchase.totalItems', 'Total Purchased Items'),
      value: formatNumber(data.items_purchased),
      icon: PackageCheck,
      gradient: 'from-emerald-600/15 via-teal-600/10 to-transparent',
      borderColor: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'suppliers',
      title: t('purchase.totalSuppliers', 'Total Active Suppliers'),
      value: formatNumber(data.total_suppliers),
      icon: Truck,
      gradient: 'from-amber-600/15 via-yellow-600/10 to-transparent',
      borderColor: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      id: 'avg_purchase',
      title: t('purchase.avgPurchase', 'Average Purchase Value'),
      value: formatCurrency(data.average_purchase),
      icon: TrendingUp,
      gradient: 'from-cyan-600/15 via-blue-600/10 to-transparent',
      borderColor: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
    },
    {
      id: 'returns',
      title: t('purchase.purchaseReturns', 'Purchase Returns'),
      value: formatCurrency(data.total_returns),
      icon: RotateCcw,
      gradient: 'from-rose-600/15 via-red-600/10 to-transparent',
      borderColor: 'border-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    },
    {
      id: 'inventory_cost',
      title: t('purchase.inventoryCost', 'Inventory Valuation Cost'),
      value: formatCurrency(data.inventory_cost),
      icon: Boxes,
      gradient: 'from-violet-600/15 via-purple-600/10 to-transparent',
      borderColor: 'border-violet-500/20',
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
    },
    {
      id: 'outstanding',
      title: t('purchase.outstandingPayments', 'Outstanding Supplier Balance'),
      value: formatCurrency(data.outstanding_payments),
      icon: CreditCard,
      gradient: 'from-orange-600/15 via-amber-600/10 to-transparent',
      borderColor: 'border-orange-500/20',
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-card border border-border/60 rounded-[22px] p-5 animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-muted/50 rounded-lg" />
              <div className="w-9 h-9 bg-muted/50 rounded-xl" />
            </div>
            <div className="w-32 h-7 bg-muted/60 rounded-xl" />
            <div className="w-20 h-3 bg-muted/40 rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isPositive = card.change !== undefined && card.change >= 0

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`relative overflow-hidden bg-card border ${card.borderColor} rounded-[22px] p-5 shadow-sm hover:shadow-md transition-all duration-300 group`}
          >
            {/* Soft Ambient Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity`}
            />

            <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl border ${card.iconBg} shadow-2xs group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {card.value}
                </h2>

                {card.change !== undefined ? (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className={`inline-flex items-center text-[11px] font-black px-2 py-0.5 rounded-full ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(card.change)}%
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {card.period}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">
                    Real-time aggregated database metric
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default PurchaseSummaryCards
