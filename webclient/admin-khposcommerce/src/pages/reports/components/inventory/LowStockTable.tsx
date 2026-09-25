import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ShieldAlert } from 'lucide-react'

interface LowStockItem {
  id: number
  name: string
  sku: string
  category_name: string
  brand_name: string
  current_stock: number
  reorder_level: number
}

interface Props {
  data?: LowStockItem[]
  isLoading?: boolean
}

export const LowStockTable: React.FC<Props> = ({ data = [], isLoading }) => {
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
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {t('inventory.lowStockTableTitle', 'Critical Low Stock Products')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('inventory.lowStockTableSubtitle', 'Products at or below reorder threshold')}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-muted/50 border-b border-border/40 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3 text-right">Current Stock</th>
              <th className="px-4 py-3 text-right">Reorder Point</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-emerald-500" />
                    <span>All inventory items are healthy and above reorder thresholds!</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const stock = Number(item.current_stock)
                const isOutOfStock = stock <= 0

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-3">{item.category_name}</td>
                    <td className="px-4 py-3">{item.brand_name}</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">{stock}</td>
                    <td className="px-4 py-3 text-right font-medium text-muted-foreground">{Number(item.reorder_level)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isOutOfStock
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
