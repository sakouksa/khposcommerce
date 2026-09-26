import React from 'react'
import { useTranslation } from 'react-i18next'
import { Trophy, Truck } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface TopSupplierItem {
  rank: number
  supplier_id: number
  supplier_name: string
  supplier_phone?: string
  supplier_email?: string
  orders_count: number
  total_purchase: number
  outstanding: number
}

interface TopSuppliersTableProps {
  data?: TopSupplierItem[]
  isLoading?: boolean
}

export const TopSuppliersTable: React.FC<TopSuppliersTableProps> = ({
  data = [],
  isLoading = false
}) => {
  const { t } = useTranslation('reports')

  const getInitials = (name: string) => {
    if (!name) return 'S'
    const parts = name.split(' ')
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4 flex flex-col h-full">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 shrink-0">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 shadow-2xs">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('purchase.topSuppliers', 'Top Purchase Suppliers')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">Top 10 suppliers by total purchase volume</p>
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
          No top supplier data found.
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse min-w-[580px]">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-extrabold bg-muted/20 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-3 w-10 text-center">Rank</th>
                <th className="py-3 px-3 min-w-[160px]">{t('purchase.supplier', 'Supplier')}</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">{t('purchase.orders', 'Orders')}</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">{t('purchase.totalPurchase', 'Total Spent')}</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">{t('purchase.outstanding', 'Outstanding')}</th>
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
                  <td className="py-1 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[10px] flex items-center justify-center border border-amber-500/20 shrink-0 shadow-2xs">
                        {getInitials(item.supplier_name)}
                      </div>
                      <div>
                        <div className="font-extrabold text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                          {item.supplier_name}
                        </div>
                        {(item.supplier_phone || item.supplier_email) && (
                          <div className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                            {item.supplier_phone || item.supplier_email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-1 px-3 text-center font-black whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-500/20 whitespace-nowrap">
                      {item.orders_count}
                    </span>
                  </td>
                  <td className="py-1 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatCurrency(item.total_purchase)}
                  </td>
                  <td className="py-1 px-3 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {formatCurrency(item.outstanding)}
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

export default TopSuppliersTable
