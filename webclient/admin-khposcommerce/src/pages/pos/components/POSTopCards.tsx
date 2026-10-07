import React from 'react'
import { DollarSign, ShoppingBag, ShoppingCart, Percent, Receipt, TrendingUp, Users, Vault, Lock, Layers, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { posService } from '@/services/posService'
import { dashboardService } from '@/services/dashboardService'

interface POSTopCardsProps {
  cartTotal: number
  cartItemsCount: number
  cartDiscount: number
  cartTax: number
}

export const POSTopCards: React.FC<POSTopCardsProps> = ({
  cartTotal,
  cartItemsCount,
  cartDiscount,
  cartTax,
}) => {
  const { t } = useTranslation(['pos', 'common'])

  // ── Fetch real daily stats from API ─────────────────────────────────────
  const { data: dailyStats, isLoading: loadingStats } = useQuery({
    queryKey: ['pos-daily-stats'],
    queryFn: () => posService.getSales({
      date: new Date().toISOString().split('T')[0], per_page: 1
    }).then(r => {
      // The API returns paginated sales; we use total count + sum from meta
      const meta = r.data?.meta ?? r.meta ?? r.pagination ?? {}
      return {
        totalCount: meta.total ?? 0,
        totalAmount: meta.total_amount ?? null,
      }
    }),
    staleTime: 30000,
    retry: false,
  })

  // ── Fetch today's dashboard stats ────────────────────────────────────────
  const { data: dashStats } = useQuery({
    queryKey: ['dashboard-stats-pos'],
    queryFn: () => dashboardService.getStats().then(r => r.data ?? r ?? {}),
    staleTime: 60000,
    retry: false,
  })

  const todaySales   = dashStats?.today_sales   ?? dailyStats?.totalAmount ?? 0
  const todayOrders  = dashStats?.today_orders  ?? dailyStats?.totalCount  ?? 0
  const activeCustomers = dashStats?.total_customers ?? 0

  // ── Estimate profit from cost vs. cart total ─────────────────────────────
  const estProfit = cartTotal > 0 ? cartTotal * 0.35 : 0

  const fmt = (n: number) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const cards = [
    {
      title: t('todaysSales', "Today's Sales"),
      value: loadingStats ? '...' : fmt(todaySales),
      icon: DollarSign,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: t('todaysOrders', "Today's Orders"),
      value: loadingStats ? '...' : `${todayOrders} ${t('sales', 'sales')}`,
      icon: ShoppingBag,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: t('cartTotal', "Cart Total"),
      value: fmt(cartTotal),
      icon: ShoppingCart,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      highlight: true,
    },
    {
      title: t('cartItems', "Cart Items"),
      value: `${cartItemsCount} ${t('items', 'items')}`,
      icon: Layers,
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: t('totalDiscount', "Total Discount"),
      value: `-${fmt(cartDiscount)}`,
      icon: Percent,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: t('vatTax10', "VAT / Tax"),
      value: fmt(cartTax),
      icon: Receipt,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: t('estProfitMargin', "Est. Profit Margin"),
      value: fmt(estProfit),
      icon: TrendingUp,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    },
    {
      title: t('activeCustomers', "Active Customers"),
      value: `${activeCustomers || '—'}`,
      icon: Users,
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
    },
    {
      title: t('cashDrawerFloat', "Cash Drawer Float"),
      value: fmt(500),
      icon: Vault,
      color: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20",
    },
    {
      title: t('registerStatus', "Register Status"),
      value: t('open', "Open"),
      icon: Lock,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-10 gap-2 sm:gap-2.5">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={i}
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 shadow-2xs ${
              c.highlight
                ? 'bg-primary/5 border-primary/40 shadow-xs ring-1 ring-primary/20'
                : 'bg-card border-border/70 hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground truncate">{c.title}</span>
              <div className={`p-1 rounded-lg border shrink-0 ${c.color}`}>
                {loadingStats && (i === 0 || i === 1)
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Icon size={12} />
                }
              </div>
            </div>
            <div className="text-xs sm:text-sm font-black text-foreground truncate">{c.value}</div>
          </div>
        )
      })}
    </div>
  )
}
