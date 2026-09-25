import React from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { formatShortDateTime } from '@/utils/formatters'

interface TransactionsTabProps {
  transactions: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer: (row: any) => void
  handleDelete: (id: number, name?: string) => void
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions = [],
  isLoading,
  isFetching,
  visibleColumns,
  handleDelete,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  const formatReference = (refType?: string, refId?: any) => {
    if (!refType && !refId) return '-'
    const cleanType = refType ? refType.split('\\').pop() || refType : 'Ref'
    return `${cleanType} #${refId || ''}`
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {visibleColumns.txn_id && <th className="w-16">ID</th>}
                {visibleColumns.txn_type && <th>{t('finance.type_col', 'Type')}</th>}
                {visibleColumns.txn_amount && <th>{t('finance.amount_col', 'Amount')}</th>}
                {visibleColumns.txn_company && <th>{t('finance.company_col', 'Company')}</th>}
                {visibleColumns.txn_method && <th>{t('finance.payment_method', 'Payment Method')}</th>}
                {visibleColumns.txn_ref && <th>{t('finance.ref_col', 'Reference')}</th>}
                {visibleColumns.txn_description && <th>{t('finance.description_col', 'Description')}</th>}
                {visibleColumns.txn_date && <th>{t('finance.date_col', 'Date')}</th>}
                <th className="text-right">{t('finance.actions_col', t('common.actions', 'Actions'))}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={8} />
              ) : transactions.length === 0 ? (
                <EmptyState cols={8} message={t('finance.no_data_transactions', 'No transactions found.')} />
              ) : (
                transactions.map((row: any) => {
                  const isCredit = row.type?.toLowerCase() === 'credit'
                  return (
                    <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                      {visibleColumns.txn_id && (
                        <td className="font-mono text-xs text-muted-foreground font-semibold">
                          #{row.id}
                        </td>
                      )}
                      {visibleColumns.txn_type && (
                        <td>
                          {isCredit ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <ArrowDownRight size={12} strokeWidth={2.5} />
                              {t('finance.type_credit', 'Credit (Outflow)')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <ArrowUpRight size={12} strokeWidth={2.5} />
                              {t('finance.type_debit', 'Debit (Inflow)')}
                            </span>
                          )}
                        </td>
                      )}
                      {visibleColumns.txn_amount && (
                        <td className="font-mono font-bold text-xs sm:text-sm">
                          <span className={isCredit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {isCredit ? '-' : '+'} ${Math.abs(Number(row.amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                      )}
                      {visibleColumns.txn_company && (
                        <td className="text-xs text-muted-foreground font-medium">
                          {row.company?.name || `Company #${row.company_id || 1}`}
                        </td>
                      )}
                      {visibleColumns.txn_method && (
                        <td className="text-xs text-foreground font-medium">
                          {row.payment_method?.name || row.paymentMethod?.name || '-'}
                        </td>
                      )}
                      {visibleColumns.txn_ref && (
                        <td className="font-mono text-xs text-primary font-medium">
                          {formatReference(row.reference_type, row.reference_id)}
                        </td>
                      )}
                      {visibleColumns.txn_description && (
                        <td className="text-xs text-muted-foreground max-w-xs truncate">
                          {row.description || '-'}
                        </td>
                      )}
                      {visibleColumns.txn_date && (
                        <td className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {row.created_at ? formatShortDateTime(row.created_at) : '-'}
                        </td>
                      )}
                      <td className="text-right">
                        <TableActionMenu
                          onDelete={() => handleDelete(row.id, `Transaction #${row.id}`)}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default TransactionsTab
