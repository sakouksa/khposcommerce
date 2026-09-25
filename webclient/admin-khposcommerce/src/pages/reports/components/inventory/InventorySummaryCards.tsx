import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  DollarSign, Package, Layers, AlertTriangle, XCircle,
  TrendingUp, RefreshCw, ArrowRightLeft, ClipboardCheck, Warehouse
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils/formatters'

interface SummaryData {
  total_inventory_value: number
  potential_revenue: number
  total_products: number
  total_stock_quantity: number
  low_stock_products: number
  out_of_stock: number
  inventory_cost: number
  inventory_adjustments: number
  inventory_transfers: number
  opname_completed: number
  opname_pending: number
  opname_difference: number
  total_warehouses: number
  growth_pct?: number
}

interface Props {
  data?: SummaryData
  isLoading?: boolean
}

export const InventorySummaryCards: React.FC<Props> = ({ data, isLoading }) => {
  const { t } = useTranslation('reports')

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-card/60 animate-pulse border border-border/40 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-9 w-9 bg-muted rounded-xl" />
            </div>
            <div className="h-7 w-36 bg-muted rounded mt-2" />
            <div className="h-3 w-24 bg-muted rounded mt-2" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: t('inventory.totalValue', 'Total Inventory Value'),
      value: formatCurrency(data?.total_inventory_value),
      subtitle: `${data?.growth_pct ?? 8.4}% vs last month`,
      icon: DollarSign,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/20',
      badge: '+8.4%',
      badgeColor: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      title: t('inventory.totalProducts', 'Total Products'),
      value: formatNumber(data?.total_products),
      subtitle: t('inventory.trackedSKUs', 'Active Tracked SKUs'),
      icon: Package,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-500 border-blue-500/20',
    },
    {
      title: t('inventory.totalStockQuantity', 'Total Stock Quantity'),
      value: `${formatNumber(data?.total_stock_quantity)} Units`,
      subtitle: `${t('inventory.potentialRevenue', 'Potential Revenue')}: ${formatCurrency(data?.potential_revenue)}`,
      icon: Layers,
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-500 border-indigo-500/20',
    },
    {
      title: t('inventory.lowStockProducts', 'Low Stock Alert'),
      value: `${formatNumber(data?.low_stock_products)} Items`,
      subtitle: t('inventory.requiresReorder', 'Requires Reorder'),
      icon: AlertTriangle,
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-500 border-amber-500/20',
      badge: 'Action Needed',
      badgeColor: 'bg-amber-500/10 text-amber-500',
    },
    {
      title: t('inventory.outOfStock', 'Out of Stock'),
      value: `${formatNumber(data?.out_of_stock)} Items`,
      subtitle: t('inventory.zeroStockLevel', 'Zero Stock Level'),
      icon: XCircle,
      color: 'from-rose-500/20 to-red-500/10 text-rose-500 border-rose-500/20',
      badge: 'Critical',
      badgeColor: 'bg-rose-500/10 text-rose-500',
    },
    {
      title: t('inventory.inventoryCost', 'Inventory Valuation Cost'),
      value: formatCurrency(data?.inventory_cost),
      subtitle: t('inventory.atCostPrice', 'Calculated at Cost Price'),
      icon: TrendingUp,
      color: 'from-purple-500/20 to-violet-500/10 text-purple-500 border-purple-500/20',
    },
    {
      title: t('inventory.adjustmentsTransfers', 'Adjustments & Transfers'),
      value: `${formatNumber(data?.inventory_adjustments)} / ${formatNumber(data?.inventory_transfers)}`,
      subtitle: t('inventory.totalLogCount', 'Adjustments / Transfers'),
      icon: ArrowRightLeft,
      color: 'from-cyan-500/20 to-sky-500/10 text-cyan-500 border-cyan-500/20',
    },
    {
      title: t('inventory.opnameWarehouses', 'Stock Opname & Warehouses'),
      value: `${data?.opname_completed ?? 0} Done · ${data?.total_warehouses ?? 0} Warehouses`,
      subtitle: `${data?.opname_pending ?? 0} Pending Audits`,
      icon: Warehouse,
      color: 'from-fuchsia-500/20 to-pink-500/10 text-fuchsia-500 border-fuchsia-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} border border-border/40 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {card.value}
              </span>
              {card.badge && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              {card.subtitle}
            </p>
          </div>
        )
      })}
    </div>
  )
}
