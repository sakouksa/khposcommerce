import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface TrendPoint {
  date: string
  value: number
  count?: number
}

interface Props {
  data?: TrendPoint[]
  isLoading?: boolean
}

export const InventoryTrendChart: React.FC<Props> = ({ data = [], isLoading }) => {
  const { t } = useTranslation('reports')

  if (isLoading) {
    return (
      <div className="h-80 rounded-2xl bg-card border border-border/50 p-5 animate-pulse flex items-center justify-center">
        <div className="h-48 w-full bg-muted/40 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            {t('inventory.trendTitle', 'Inventory Valuation Trend')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('inventory.trendSubtitle', 'Total stock valuation trajectory over time')}
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No valuation trend records found for selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val, { compact: true })} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Valuation ($)']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="value" name="Valuation ($)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
