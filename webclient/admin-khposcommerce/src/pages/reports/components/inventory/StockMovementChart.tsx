import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { ArrowRightLeft } from 'lucide-react'

interface MovementPoint {
  date: string
  stock_in: number
  stock_out: number
  transfer: number
  adjustment: number
}

interface Props {
  data?: MovementPoint[]
  isLoading?: boolean
}

export const StockMovementChart: React.FC<Props> = ({ data = [], isLoading }) => {
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-blue-500" />
            {t('inventory.movementTrendTitle', 'Stock Movement Analytics')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('inventory.movementTrendSubtitle', 'Daily trajectory of Stock In, Stock Out, Transfers & Adjustments')}
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No stock movement records found for selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="stock_in" name="Stock In" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stock_out" name="Stock Out" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="transfer" name="Transfers" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="adjustment" name="Adjustments" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
