import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface RevenueTrendPoint {
  date: string
  revenue: number
  orders?: number
}

interface RevenueTrendChartProps {
  data?: RevenueTrendPoint[]
  isLoading?: boolean
  groupBy?: 'daily' | 'weekly' | 'monthly'
  onGroupByChange?: (mode: 'daily' | 'weekly' | 'monthly') => void
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data = [],
  isLoading = false,
  groupBy = 'daily',
  onGroupByChange,
}) => {
  const { t } = useTranslation('reports')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const revenue = payload.find((p: any) => p.dataKey === 'revenue')?.value ?? 0
      const orders  = payload.find((p: any) => p.dataKey === 'orders')?.value ?? 0

      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/80 p-3.5 rounded-2xl shadow-xl space-y-2 text-xs min-w-[170px] ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border/60 pb-1.5">
            <Calendar size={13} className="text-primary" />
            <span>{label}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Revenue:</span>
              <span>${Number(revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-blue-600 dark:text-blue-400 font-bold">
              <span>Orders:</span>
              <span>{orders} Orders</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4">
        <div className="h-4 w-40 bg-muted/60 animate-pulse rounded-md" />
        <div className="h-64 bg-muted/30 animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground text-xs font-semibold">
          Loading chart trajectory...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500 shadow-2xs">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground tracking-tight">
              {t('sales.revenueTrend', 'Revenue Trend')}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">Revenue and order trajectory over time</p>
          </div>
        </div>

        {onGroupByChange && (
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-extrabold border border-border/40">
            {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onGroupByChange(mode)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                  groupBy === mode
                    ? 'bg-card text-primary shadow-xs font-black scale-102 border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs font-medium space-y-2">
          <TrendingUp size={32} className="opacity-30 stroke-1" />
          <span>No revenue trend data available for selected period.</span>
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                tickFormatter={(val) => formatCurrency(val, { decimals: 0 })}
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
              <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 'bold' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorOrders)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default RevenueTrendChart
