import React from 'react'
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Tag } from 'lucide-react'

interface CategoryItem {
  name: string
  quantity: number
  total: number
}

interface Props {
  data?: CategoryItem[]
  isLoading?: boolean
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export const CategoryInventoryChart: React.FC<Props> = ({ data = [], isLoading }) => {
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
        <Tag className="h-4 w-4 text-indigo-500" />
        {t('inventory.categoryChartTitle', 'Inventory by Category')}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t('inventory.categoryChartSubtitle', 'Stock value breakdown by category')}
      </p>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No category distribution data found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="total"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Valuation ($)']}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
