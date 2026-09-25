import React from 'react'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { Clock } from 'lucide-react'

interface AgingItem {
  range: string
  count: number
  color: string
}

interface Props {
  data?: AgingItem[]
  isLoading?: boolean
}

export const InventoryAgingChart: React.FC<Props> = ({ data = [], isLoading }) => {
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
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-amber-500" />
        {t('inventory.agingChartTitle', 'Inventory Aging Report')}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t('inventory.agingChartSubtitle', 'Product shelf age breakdown (0-30, 31-60, 61-90, 90+ days)')}
      </p>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No inventory aging breakdown data found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`${val || 0} Products`, 'Inventory Count']}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.map((entry, idx) => (
                  <Cell key={`ag-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
