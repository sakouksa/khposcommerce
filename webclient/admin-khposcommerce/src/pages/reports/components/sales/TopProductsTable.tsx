import React from 'react'
import { useTranslation } from 'react-i18next'
import { Trophy, Package, Award } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface TopProductItem {
  rank: number
  product_id?: number
  product_name: string
  sku: string
  category_name: string
  quantity_sold: number
  revenue: number
  profit: number
}

interface TopProductsTableProps {
  data?: TopProductItem[]
  isLoading?: boolean
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { t } = useTranslation('reports')

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 shadow-2xs">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('sales.topProducts', 'Top Selling Products')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">Top 10 highest revenue generating products</p>
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
          No top product data found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-extrabold bg-muted/20 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-3 w-10 text-center">Rank</th>
                <th className="py-3 px-3 min-w-[160px]">{t('sales.product', 'Product')}</th>
                <th className="py-3 px-3 min-w-[90px]">{t('sales.sku', 'SKU')}</th>
                <th className="py-3 px-3 min-w-[110px]">{t('sales.category', 'Category')}</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">{t('sales.quantitySold', 'Qty Sold')}</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">{t('sales.revenue', 'Revenue')}</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">{t('sales.profit', 'Profit')}</th>
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
                  <td className="py-1 px-3 font-extrabold text-foreground group-hover:text-primary transition-colors whitespace-nowrap max-w-[200px] truncate">
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
                  <td className="py-1 px-3 text-right font-black text-foreground whitespace-nowrap">{item.quantity_sold.toLocaleString()}</td>
                  <td className="py-1 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="py-1 px-3 text-right font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {formatCurrency(item.profit)}
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
