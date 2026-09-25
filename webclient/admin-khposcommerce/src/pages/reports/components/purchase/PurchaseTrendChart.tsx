import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface PurchaseTrendPoint {
  date: string
  cost: number
  orders: number
}

interface PurchaseTrendChartProps {
  data?: PurchaseTrendPoint[]
  isLoading?: boolean
  groupBy?: string
  onGroupByChange?: (grp: string) => void
}

export const PurchaseTrendChart: React.FC<PurchaseTrendChartProps> = ({
  data = [],
  isLoading = false,
  groupBy = 'daily',
  onGroupByChange
}) => {
  const { t } = useTranslation('reports')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const costVal = payload[0]?.value ?? 0
      const ordersVal = payload[1]?.value ?? payload[0]?.payload?.orders ?? 0

      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-xl space-y-1 text-xs">
          <div className="font-extrabold text-foreground border-b border-border/50 pb-1">
            {label}
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-extrabold">
            <span>{t('purchase.purchaseCost', 'Purchase Cost')}:</span>
            <span>${costVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-indigo-600 dark:text-indigo-400 font-extrabold">
            <span>{t('purchase.ordersCount', 'Orders Count')}:</span>
            <span>{ordersVal} orders</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-2xl text-primary shadow-2xs">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground tracking-tight">
              {t('purchase.purchaseTrend', 'Purchase Performance Trend')}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Historical purchase cost & order volume analytics
            </p>
          </div>
        </div>

        {/* Group By Filter Pills */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl">
          {[
            { key: 'daily', label: t('purchase.daily', 'Daily') },
            { key: 'weekly', label: t('purchase.weekly', 'Weekly') },
            { key: 'monthly', label: t('purchase.monthly', 'Monthly') },
            { key: 'yearly', label: t('purchase.yearly', 'Yearly') }
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onGroupByChange && onGroupByChange(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                groupBy === item.key
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-muted-foreground">
          Loading Purchase Trend Chart...
        </div>
      ) : data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-xs font-semibold text-muted-foreground">
          No purchase trend data available for selected period.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="purchaseCostGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="purchaseOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCurrency(val, { compact: true })}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cost"
                name="Cost"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#purchaseCostGrad)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#purchaseOrdersGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default PurchaseTrendChart
