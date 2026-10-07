import React from 'react'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Warehouse } from 'lucide-react'

interface WarehouseItem {
  name: string
  quantity: number
  total: number
  percentage: number
}

interface Props {
  data?: WarehouseItem[]
  isLoading?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b']

export const WarehouseInventoryChart: React.FC<Props> = ({ data = [], isLoading }) => {
  const { t } = useTranslation('reports')

  if (isLoading) {
    return (
      <div className="h-80 rounded-2xl bg-card border border-border/50 p-5 animate-pulse flex items-center justify-center">
        <div className="h-48 w-48 rounded-full bg-muted/40" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
        <Warehouse className="h-4 w-4 text-cyan-500" />
        {t('inventory.warehouseChartTitle', 'Warehouse Stock Distribution')}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t('inventory.warehouseChartSubtitle', 'Inventory valuation share per warehouse')}
      </p>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No warehouse distribution data found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="total"
                nameKey="name"
              >
                {data.map((_, idx) => (
                  <Cell key={`wh-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any, _name: any, entry: any) => [
                  `$${Number(val || 0).toLocaleString()} (${entry?.payload?.percentage || 0}%)`,
                  'Valuation'
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
