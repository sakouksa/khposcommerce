import React from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

export interface PurchaseReturnRow {
  id: number
  reference_number?: string
  date?: string
  total_amount_base?: number
  reason?: string
  status?: string
  supplier?: { name: string }
  purchase?: { reference_number?: string }
  user?: { name: string }
}

interface PurchaseReturnTableProps {
  data?: PurchaseReturnRow[]
  isLoading?: boolean
}

export const PurchaseReturnTable: React.FC<PurchaseReturnTableProps> = ({
  data = [],
  isLoading = false
}) => {
  const { t } = useTranslation('reports')

  return (
    <div className="bg-card border border-border/80 rounded-[24px] p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 shadow-2xs">
          <RotateCcw size={20} />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {t('purchase.purchaseReturnLog', 'Purchase Returns Log')}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Supplier return credit notes and debit advice
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs font-semibold text-muted-foreground animate-pulse">
          Loading Purchase Returns Log...
        </div>
      ) : data.length === 0 ? (
        <div className="py-12 text-center text-xs font-semibold text-muted-foreground">
          No purchase return records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-extrabold bg-muted/20 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-3">{t('purchase.returnNo', 'Return No')}</th>
                <th className="py-3 px-3">{t('purchase.purchaseRef', 'Purchase Ref')}</th>
                <th className="py-3 px-3">{t('purchase.supplier', 'Supplier')}</th>
                <th className="py-3 px-3">{t('purchase.date', 'Return Date')}</th>
                <th className="py-3 px-3">{t('purchase.reason', 'Reason')}</th>
                <th className="py-3 px-3 text-right">{t('purchase.totalAmount', 'Total Amount')}</th>
                <th className="py-3 px-3 text-center">{t('purchase.status', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-accent/40 transition-colors group">
                  <td className="py-3 px-3 font-extrabold text-foreground font-mono text-[11px] whitespace-nowrap">
                    {row.reference_number || `RET-${row.id}`}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                    {row.purchase?.reference_number || 'N/A'}
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                    {row.supplier?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-medium whitespace-nowrap">
                    {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-medium whitespace-nowrap max-w-[200px] truncate">
                    {row.reason || 'Standard Supplier Return'}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {formatCurrency(row.total_amount_base)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase">
                      {row.status || 'APPROVED'}
                    </span>
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

export default PurchaseReturnTable
