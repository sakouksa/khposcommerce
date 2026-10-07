import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts'
import { CreditCard } from 'lucide-react'

export interface PaymentMethodPoint {
  name: string
  code?: string
  orders: number
  total: number
  revenue?: number
}

interface PaymentChartProps {
  data?: PaymentMethodPoint[]
  isLoading?: boolean
}

const PAYMENT_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316']

export const PaymentChart: React.FC<PaymentChartProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { t } = useTranslation('reports')

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-xl space-y-1 text-xs ring-1 ring-black/5 dark:ring-white/10">
          <div className="font-extrabold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
            <span>{item.name}</span>
          </div>
          <div className="text-emerald-600 dark:text-emerald-400 font-extrabold">
            Total: ${Number(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted-foreground font-medium">
            Orders: {item.payload.orders} Transactions
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
          Loading payment channels...
        </div>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.total || item.revenue || 0,
    orders: item.orders,
  }))

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-500 shadow-2xs">
          <CreditCard size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('sales.paymentMethods', 'Payment Method Analysis')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">Revenue share by payment channel (Cash, KHQR, Visa, etc.)</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs font-medium space-y-2">
          <CreditCard size={32} className="opacity-30 stroke-1" />
          <span>No payment method data available.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Chart Container */}
          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} stroke="var(--card)" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Clean 2-Column Legend Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-3 border-t border-border/40 max-h-36 overflow-y-auto pr-1">
            {chartData.map((item, index) => {
              const pct = totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : '0'
              const color = PAYMENT_COLORS[index % PAYMENT_COLORS.length]

              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-accent/40 transition-colors border border-transparent hover:border-border/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                    <span className="truncate text-xs font-extrabold text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] shrink-0 font-bold">
                    <span className="text-muted-foreground">{pct}%</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                      ${item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value.toFixed(0)}
                    </span>
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

export default PaymentChart
