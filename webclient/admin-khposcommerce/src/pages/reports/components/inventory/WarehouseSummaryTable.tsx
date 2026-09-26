import React from 'react'
import { useTranslation } from 'react-i18next'
import { Warehouse } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface WarehouseSummaryItem {
  name: string
  quantity: number
  total: number
  percentage: number
}

interface Props {
  data?: WarehouseSummaryItem[]
  isLoading?: boolean
}

export const WarehouseSummaryTable: React.FC<Props> = ({ data = [], isLoading }) => {
  const { t } = useTranslation('reports')

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 p-5 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-32 bg-muted/40 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-cyan-500" />
            {t('inventory.warehouseSummaryTitle', 'Warehouse Operations Summary')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('inventory.warehouseSummarySubtitle', 'Stock quantity, total valuation, and portfolio share per warehouse')}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-muted/50 border-b border-border/40 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="px-4 py-3">Warehouse Name</th>
              <th className="px-4 py-3 text-right">Total Stock Units</th>
              <th className="px-4 py-3 text-right">Total Valuation ($)</th>
              <th className="px-4 py-3 text-right">Portfolio Share (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No warehouse summary records found.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{item.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-500">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-500">{item.percentage}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
