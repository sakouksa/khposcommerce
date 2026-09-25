import React from 'react'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'

interface ABCItem {
  class: string
  products: number
  value: number
  color: string
}

interface Props {
  data?: ABCItem[]
  isLoading?: boolean
}

export const InventoryABCChart: React.FC<Props> = ({ data = [], isLoading }) => {
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
        <BarChart3 className="h-4 w-4 text-indigo-500" />
        {t('inventory.abcChartTitle', 'ABC Inventory Analysis')}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t('inventory.abcChartSubtitle', 'Class A (Top 70%), Class B (Next 20%), Class C (Bottom 10%)')}
      </p>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No ABC inventory classification data found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis dataKey="class" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any, _name: any, item: any) => [
                  `$${Number(val || 0).toLocaleString()} (${item?.payload?.products || 0} products)`,
                  'Inventory Valuation'
                ]}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, idx) => (
                  <Cell key={`abc-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
