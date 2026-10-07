import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface BrandSalesPoint {
  id: number
  name: string
  quantity: number
  total: number
  revenue?: number
}

interface BrandSalesChartProps {
  data?: BrandSalesPoint[]
  isLoading?: boolean
}

const BAR_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']

export const BrandSalesChart: React.FC<BrandSalesChartProps> = ({
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
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.payload.name}</span>
          </div>
          <div className="text-purple-600 dark:text-purple-400 font-extrabold">
            Revenue: ${Number(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-muted-foreground font-medium">
            Quantity Sold: {item.payload.quantity} units
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
          Loading brand performance...
        </div>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.name,
    total: item.total || item.revenue || 0,
    quantity: item.quantity,
  }))

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-500 shadow-2xs">
          <BarChart3 size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('sales.salesByBrand', 'Sales By Brand')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">Top performing brands by total sales revenue</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs font-medium space-y-2">
          <BarChart3 size={32} className="opacity-30 stroke-1" />
          <span>No brand sales data available.</span>
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.4} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCurrency(val, { decimals: 0 })}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={18}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default BrandSalesChart
