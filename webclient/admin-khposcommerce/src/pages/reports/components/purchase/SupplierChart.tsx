import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts'
import { Truck } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface SupplierBreakdownItem {
  supplier_name: string
  total_purchase: number
  orders_count: number
}

interface SupplierChartProps {
  data?: SupplierBreakdownItem[]
  isLoading?: boolean
}

const BAR_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316'
]

export const SupplierChart: React.FC<SupplierChartProps> = ({
  data = [],
  isLoading = false
}) => {
  const { t } = useTranslation('reports')

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-xl space-y-1 text-xs">
          <div className="font-extrabold text-foreground border-b border-border/50 pb-1">
            {item.supplier_name}
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-extrabold">
            <span>{t('purchase.totalPurchase', 'Total Purchase')}:</span>
            <span>${item.total_purchase.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-blue-600 dark:text-blue-400 font-extrabold">
            <span>{t('purchase.orders', 'Orders')}:</span>
            <span>{item.orders_count} orders</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500 shadow-2xs">
          <Truck size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('purchase.purchaseBySupplier', 'Purchase by Supplier')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Top suppliers breakdown by purchase volume ($)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-muted/20 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-muted-foreground">
          Loading Supplier Chart...
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs font-semibold text-muted-foreground">
          No supplier purchase data available.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.slice(0, 7)}
              margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.4} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCurrency(val, { compact: true })}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              />
              <YAxis
                type="category"
                dataKey="supplier_name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                width={110}
              />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="total_purchase" radius={[0, 8, 8, 0]} barSize={18}>
                {data.slice(0, 7).map((entry, index) => (
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

export default SupplierChart
