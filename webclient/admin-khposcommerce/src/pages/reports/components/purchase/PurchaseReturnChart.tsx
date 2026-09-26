import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import { RotateCcw } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface PurchaseReturnTrendPoint {
  date: string
  amount: number
  returns_count: number
}

interface PurchaseReturnChartProps {
  data?: PurchaseReturnTrendPoint[]
  isLoading?: boolean
}

export const PurchaseReturnChart: React.FC<PurchaseReturnChartProps> = ({
  data = [],
  isLoading = false
}) => {
  const { t } = useTranslation('reports')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-xl space-y-1 text-xs">
          <div className="font-extrabold text-foreground border-b border-border/50 pb-1">
            {label}
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-600 dark:text-rose-400 font-extrabold">
            <span>{t('purchase.returnAmount', 'Return Value')}:</span>
            <span>${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-400 font-extrabold">
            <span>{t('purchase.returnCount', 'Returns Count')}:</span>
            <span>{item.returns_count} returns</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 shadow-2xs">
          <RotateCcw size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('purchase.purchaseReturnTrend', 'Purchase Return Trend')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Supplier returns and credit note trends over time
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-muted-foreground">
          Loading Purchase Return Chart...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs font-semibold text-muted-foreground">
          No purchase return trend records found.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCurrency(val, { compact: true })}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="amount"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#f43f5e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default PurchaseReturnChart
