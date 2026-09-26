import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts'
import { Warehouse } from 'lucide-react'

export interface WarehouseDistributionItem {
  id: number
  name: string
  total: number
  orders: number
}

interface WarehouseChartProps {
  data?: WarehouseDistributionItem[]
  isLoading?: boolean
}

const WAREHOUSE_COLORS = [
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ec4899'
]

export const WarehouseChart: React.FC<WarehouseChartProps> = ({
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
            {item.name}
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-extrabold">
            <span>{t('purchase.totalPurchase', 'Total Purchase')}:</span>
            <span>${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-blue-600 dark:text-blue-400 font-extrabold">
            <span>{t('purchase.orders', 'Orders')}:</span>
            <span>{item.orders} orders ({pct}%)</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 flex flex-col justify-between">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-500 shadow-2xs">
          <Warehouse size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('purchase.warehouseDistribution', 'Warehouse Purchase Distribution')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Purchase stock receiving distribution across facilities
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-muted-foreground">
          Loading Warehouse Chart...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs font-semibold text-muted-foreground">
          No warehouse purchase data available.
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
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={WAREHOUSE_COLORS[index % WAREHOUSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {data.map((item, idx) => {
              const pct = totalSum > 0 ? ((item.total / totalSum) * 100).toFixed(1) : '0'
              const color = WAREHOUSE_COLORS[idx % WAREHOUSE_COLORS.length]

              return (
                <div key={item.id || idx} className="flex items-center justify-between bg-muted/20 px-3 py-1.5 rounded-xl border border-border/40 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-bold text-foreground truncate" title={item.name}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-right font-black shrink-0 ml-2">
                    <span className="text-muted-foreground text-[10px]">{pct}%</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ${item.total >= 1000 ? `${(item.total / 1000).toFixed(1)}k` : item.total.toFixed(0)}
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

export default WarehouseChart
