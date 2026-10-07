import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts'
import { CreditCard } from 'lucide-react'

export interface PaymentStatusBreakdownItem {
  payment_status: string
  name: string
  count: number
  total: number
}

interface PaymentStatusChartProps {
  data?: PaymentStatusBreakdownItem[]
  isLoading?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#10b981',
  partial: '#f59e0b',
  unpaid: '#ef4444'
}

export const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({
  data = [],
  isLoading = false
}) => {
  const { t } = useTranslation('reports')

  const totalSum = data.reduce((acc, curr) => acc + (curr.total || 0), 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const pct = totalSum > 0 ? ((item.total / totalSum) * 100).toFixed(1) : '0'

      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-xl space-y-1 text-xs">
          <div className="font-extrabold text-foreground border-b border-border/50 pb-1">
            {item.name || item.payment_status.toUpperCase()}
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-extrabold">
            <span>{t('purchase.totalAmount', 'Total Amount')}:</span>
            <span>${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-blue-600 dark:text-blue-400 font-extrabold">
            <span>{t('purchase.orders', 'Orders')}:</span>
            <span>{item.count} ({pct}%)</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 shadow-2xs">
          <CreditCard size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('purchase.paymentStatus', 'Purchase Payment Status')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Paid vs Partial vs Unpaid settlement breakdown
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-muted-foreground">
          Loading Payment Status Chart...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs font-semibold text-muted-foreground">
          No payment status data available.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="total"
                  label={false}
                  labelLine={false}
                >
                  {data.map((entry, index) => {
                    const st = (entry.payment_status || 'unpaid').toLowerCase()
                    const color = STATUS_COLORS[st] || '#6366f1'
                    return <Cell key={`cell-${index}`} fill={color} />
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {data.map((item, idx) => {
              const st = (item.payment_status || 'unpaid').toLowerCase()
              const color = STATUS_COLORS[st] || '#6366f1'
              const pct = totalSum > 0 ? ((item.total / totalSum) * 100).toFixed(1) : '0'

              return (
                <div key={idx} className="flex flex-col items-center justify-center bg-muted/20 p-2.5 rounded-xl border border-border/40 text-xs text-center space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-foreground">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="capitalize">{item.payment_status}</span>
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-black">
                    ${item.total >= 1000 ? `${(item.total / 1000).toFixed(1)}k` : item.total.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    {item.count} orders ({pct}%)
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentStatusChart
