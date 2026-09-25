import React from 'react'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { ShieldCheck } from 'lucide-react'

interface StatusItem {
  name: string
  value: number
  color: string
}

interface Props {
  data?: StatusItem[]
  isLoading?: boolean
}

export const StockStatusChart: React.FC<Props> = ({ data = [], isLoading }) => {
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
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        {t('inventory.statusChartTitle', 'Stock Status Distribution')}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t('inventory.statusChartSubtitle', 'In Stock, Low Stock, Out of Stock, Inactive')}
      </p>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No stock status data found.
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
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, idx) => (
                  <Cell key={`st-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`${val || 0} SKUs`, 'Products']}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
