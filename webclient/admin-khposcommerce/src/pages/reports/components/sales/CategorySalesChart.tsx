import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'

export interface CategorySalesPoint {
  id: number
  name: string
  quantity: number
  total: number
  revenue?: number
}

interface CategorySalesChartProps {
  data?: CategorySalesPoint[]
  isLoading?: boolean
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#a855f7'
]

export const CategorySalesChart: React.FC<CategorySalesChartProps> = ({
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
          Loading category distribution...
        </div>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.total || item.revenue || 0,
    quantity: item.quantity,
  }))

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 shadow-2xs">
          <PieIcon size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('sales.salesByCategory', 'Sales By Category')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">Revenue distribution by product categories</p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground text-xs font-medium space-y-2">
          <PieIcon size={32} className="opacity-30 stroke-1" />
          <span>No category sales data available.</span>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--card)" strokeWidth={3} />
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
              const color = COLORS[index % COLORS.length]

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

export default CategorySalesChart
