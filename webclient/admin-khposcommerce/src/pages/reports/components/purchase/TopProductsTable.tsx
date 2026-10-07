import React from 'react'
import { useTranslation } from 'react-i18next'
import { Trophy, Package } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface TopPurchasedProductItem {
  rank: number
  product_id: number
  product_name: string
  sku: string
  category_name: string
  quantity_purchased: number
  purchase_cost: number
  average_cost: number
  current_stock: number
}

interface TopProductsTableProps {
  data?: TopPurchasedProductItem[]
  isLoading?: boolean
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  data = [],
  isLoading = false
}) => {
  const { t } = useTranslation('reports')

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 shrink-0">
        <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500 shadow-2xs">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('purchase.topProducts', 'Top Purchased Products')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">Top 10 products by purchase expenditure</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted/30 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-xs font-semibold">
          No top purchased product data found.
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-extrabold bg-muted/20 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-3 w-10 text-center">Rank</th>
                <th className="py-3 px-3 min-w-[160px]">{t('purchase.product', 'Product')}</th>
                <th className="py-3 px-3 min-w-[90px]">{t('purchase.sku', 'SKU')}</th>
                <th className="py-3 px-3 min-w-[100px]">{t('purchase.category', 'Category')}</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">{t('purchase.qtyPurchased', 'Qty')}</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">{t('purchase.totalCost', 'Cost')}</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">{t('purchase.stock', 'Stock')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((item, idx) => (
                <tr key={idx} className="h-[46px] hover:bg-accent/40 transition-colors group">
                  <td className="py-1 px-3 text-center font-black whitespace-nowrap">
                    {item.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 text-xs font-black shadow-xs">
                        1
                      </span>
                    ) : item.rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 text-xs font-black shadow-xs">
                        2
                      </span>
                    ) : item.rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-50 text-xs font-black shadow-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-bold">{item.rank}</span>
                    )}
                  </td>
                  <td className="py-1 px-3 font-extrabold text-foreground group-hover:text-primary transition-colors whitespace-nowrap max-w-[180px] truncate">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-muted-foreground shrink-0" />
                      <span className="truncate" title={item.product_name}>{item.product_name}</span>
                    </div>
                  </td>
                  <td className="py-1 px-3 text-muted-foreground font-mono text-[11px] whitespace-nowrap">{item.sku}</td>
                  <td className="py-1 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted/60 text-muted-foreground border border-border/40 whitespace-nowrap">
                      {item.category_name}
                    </span>
                  </td>
                  <td className="py-1 px-3 text-right font-black text-foreground whitespace-nowrap">{item.quantity_purchased.toLocaleString()}</td>
                  <td className="py-1 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatCurrency(item.purchase_cost)}
                  </td>
                  <td className="py-1 px-3 text-right font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {item.current_stock.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TopProductsTable
