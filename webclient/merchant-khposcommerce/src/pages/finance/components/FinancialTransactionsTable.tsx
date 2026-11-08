import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  QrCode,
  Wallet,
  Building2,
  Banknote,
  CreditCard,
  FileText,
  Eye,
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { formatDisplayDate, CAMBODIA_TIMEZONE } from '@/utils/formatters'
import TransactionDetailDrawer from './TransactionDetailDrawer'

export interface FinancialTransactionsTableProps {
  transactions: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer?: (row: any) => void
  handleDelete?: (id: number, name?: string) => void
}

export const FinancialTransactionsTable: React.FC<FinancialTransactionsTableProps> = ({
  transactions = [],
  isLoading,
  isFetching,
  visibleColumns,
  handleDelete,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const currentLocale = i18n.language === 'km' ? 'km-KH' : 'en-US'
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)

  // Aggregate stats for overview KPI strip and summary footer
  const stats = useMemo(() => {
    let totalInflow = 0
    let totalOutflow = 0
    let inflowCount = 0
    let outflowCount = 0

    transactions.forEach((tx: any) => {
      const amt = Math.abs(Number(tx.amount || 0))
      const isCredit = tx.type?.toLowerCase() === 'credit'
      if (isCredit) {
        totalOutflow += amt
        outflowCount += 1
      } else {
        totalInflow += amt
        inflowCount += 1
      }
    })

    const netCashflow = totalInflow - totalOutflow
    return {
      totalCount: transactions.length,
      totalInflow,
      totalOutflow,
      inflowCount,
      outflowCount,
      netCashflow,
    }
  }, [transactions])

  // Fully translated reference label (e.g. "ការបញ្ជាទិញ #150" or "Order #150")
  const formatReference = (refType?: string, refId?: any) => {
    if (!refType && !refId) return null
    const cleanType = refType ? refType.split('\\').pop() || refType : ''
    let typeLabel = cleanType || t('finance.ref_col', 'Reference')

    if (cleanType.toLowerCase().includes('order')) {
      typeLabel = t('finance.ref_order', 'Order')
    } else if (cleanType.toLowerCase().includes('expense')) {
      typeLabel = t('finance.ref_expense', 'Expense')
    } else if (cleanType.toLowerCase().includes('purchase')) {
      typeLabel = t('finance.ref_purchase', 'Purchase')
    } else if (cleanType.toLowerCase().includes('register')) {
      typeLabel = t('finance.ref_register', 'Cash Register')
    }

    return `${typeLabel} #${refId || ''}`
  }

  // Branded payment method pill with localized fallback
  const getPaymentMethodBadge = (name?: string) => {
    if (!name) return <span className="text-muted-foreground/50 text-xs">—</span>
    const lower = name.toLowerCase()

    if (lower.includes('aba') || lower.includes('khqr')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 whitespace-nowrap">
          <QrCode size={13} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>{name}</span>
        </span>
      )
    }

    if (lower.includes('wing')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 whitespace-nowrap">
          <Wallet size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{name}</span>
        </span>
      )
    }

    if (lower.includes('acleda')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 whitespace-nowrap">
          <Building2 size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{name}</span>
        </span>
      )
    }

    if (lower.includes('cash') || lower.includes('cod') || lower.includes('សាច់ប្រាក់')) {
      const displayName =
        lower.includes('cod') || lower.includes('delivery')
          ? t('finance.pm_cod', 'Cash on Delivery (COD)')
          : name

      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 whitespace-nowrap">
          <Banknote size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{displayName}</span>
        </span>
      )
    }

    if (lower.includes('card') || lower.includes('visa') || lower.includes('mastercard')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 whitespace-nowrap">
          <CreditCard size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{name}</span>
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border whitespace-nowrap">
        <Receipt size={13} className="shrink-0" />
        <span>{name}</span>
      </span>
    )
  }

  // Clean branch & company badge (splits "Company Name - Branch A")
  const getBranchBadge = (rawCompany?: string) => {
    if (!rawCompany) return <span className="text-muted-foreground/60 text-xs">—</span>
    const parts = rawCompany.split(' - ')
    const company = parts[0]?.trim()
    const branch = parts.length > 1 ? parts.slice(1).join(' - ').trim() : ''

    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1.5 font-medium text-xs text-foreground">
          <Building2 size={13} className="text-primary/70 shrink-0" />
          <span>{branch || company}</span>
        </span>
        {branch && (
          <span className="text-[11px] text-muted-foreground/80 truncate max-w-[190px]" title={company}>
            {company}
          </span>
        )}
      </div>
    )
  }

  // Localized date and time display (uses active locale, e.g. "11 កញ្ញា 2026")
  const renderDateTime = (dateStr?: string) => {
    if (!dateStr) return <span className="text-muted-foreground/50 text-xs">—</span>
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) {
        return <span className="text-xs font-mono text-muted-foreground">{dateStr}</span>
      }
      const dateFormatted = formatDisplayDate(d, { locale: currentLocale })
      const timeFormatted = d.toLocaleTimeString(currentLocale, {
        timeZone: CAMBODIA_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            {dateFormatted}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground/80 whitespace-nowrap">
            {timeFormatted}
          </span>
        </div>
      )
    } catch {
      return <span className="text-xs font-mono text-muted-foreground">{dateStr}</span>
    }
  }

  // Column flags
  const showId = visibleColumns.txn_id !== false
  const showType = visibleColumns.txn_type !== false
  const showAmount = visibleColumns.txn_amount !== false
  const showCompany = visibleColumns.txn_company !== false
  const showMethod = visibleColumns.txn_method !== false
  const showRef = visibleColumns.txn_ref !== false
  const showDesc = visibleColumns.txn_description !== false
  const showDate = visibleColumns.txn_date !== false

  let totalCols = 1 // Actions column
  if (showId) totalCols++
  if (showType) totalCols++
  if (showAmount) totalCols++
  if (showCompany) totalCols++
  if (showMethod) totalCols++
  if (showRef) totalCols++
  if (showDesc) totalCols++
  if (showDate) totalCols++

  return (
    <div className="space-y-4">
      {/* Main Table */}
      <TableWrapper isFetching={isFetching} className="print:hidden">
        <table className="w-full data-table border-collapse">
          <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
            <tr>
              {showId && (
                <th className="text-left px-4 py-3.5 whitespace-nowrap w-20">
                  {t('finance.id_col', 'ID')}
                </th>
              )}
              {showType && (
                <th className="text-left px-4 py-3.5 whitespace-nowrap min-w-[160px]">
                  {t('finance.type_col', 'Transaction Type')}
                </th>
              )}
              {showAmount && (
                <th className="text-right px-4 py-3.5 whitespace-nowrap min-w-[130px]">
                  {t('finance.amount_col', 'Amount')}
                </th>
              )}
              {showCompany && (
                <th className="text-left px-4 py-3.5 whitespace-nowrap min-w-[180px]">
                  {t('finance.branch_col', 'Branch / Company')}
                </th>
              )}
              {showMethod && (
                <th className="text-left px-4 py-3.5 whitespace-nowrap min-w-[170px]">
                  {t('finance.payment_method', 'Payment Method')}
                </th>
              )}
              {showRef && (
                <th className="text-left px-4 py-3.5 whitespace-nowrap min-w-[130px]">
                  {t('finance.ref_col', 'Reference')}
                </th>
              )}
              {showDesc && (
                <th className="text-left px-4 py-3.5 whitespace-nowrap min-w-[220px]">
                  {t('finance.description_col', 'Description')}
                </th>
              )}
              {showDate && (
                <th className="text-left px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                  {t('finance.date_col', 'Date & Time')}
                </th>
              )}
              <th className="text-right px-4 py-3.5 whitespace-nowrap w-24">
                {t('finance.actions_col', t('common.actions', 'Actions'))}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <LoadingSkeleton cols={totalCols} />
            ) : transactions.length === 0 ? (
              <EmptyState
                cols={totalCols}
                message={t('finance.no_data_transactions', 'No financial transactions found.')}
              />
            ) : (
              transactions.map((row: any) => {
                const isCredit = row.type?.toLowerCase() === 'credit'
                const amount = Math.abs(Number(row.amount || 0))
                const refText = formatReference(row.reference_type, row.reference_id)
                const rawCompany = row.company?.name || (row.company_id ? `Company #${row.company_id}` : '')
                const paymentMethodName = row.payment_method?.name || row.paymentMethod?.name

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedTransaction(row)}
                    className="cursor-pointer hover:bg-muted/40 transition-colors group"
                  >
                    {showId && (
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-md border border-border/50 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                          #{row.id}
                        </span>
                      </td>
                    )}
                    {showType && (
                      <td className="px-4 py-3">
                        {isCredit ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-2xs">
                            <ArrowDownRight size={13} strokeWidth={2.5} className="shrink-0" />
                            <span>{t('finance.type_credit', 'Credit Outflow')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                            <ArrowUpRight size={13} strokeWidth={2.5} className="shrink-0" />
                            <span>{t('finance.type_debit', 'Debit Inflow')}</span>
                          </span>
                        )}
                      </td>
                    )}
                    {showAmount && (
                      <td className="text-right px-4 py-3 font-mono font-bold text-xs sm:text-sm tabular-nums">
                        <span
                          className={
                            isCredit
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {isCredit ? '-' : '+'}$
                          {amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                    )}
                    {showCompany && (
                      <td className="px-4 py-3">
                        {getBranchBadge(rawCompany)}
                      </td>
                    )}
                    {showMethod && (
                      <td className="px-4 py-3">
                        {getPaymentMethodBadge(paymentMethodName)}
                      </td>
                    )}
                    {showRef && (
                      <td className="px-4 py-3">
                        {refText ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md bg-muted/80 text-foreground font-medium border border-border/60 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                            <FileText size={11} className="text-primary/70 shrink-0" />
                            <span>{refText}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </td>
                    )}
                    {showDesc && (
                      <td className="px-4 py-3">
                        <div
                          className="max-w-[220px] truncate text-xs text-muted-foreground"
                          title={row.description}
                        >
                          {row.description || <span className="text-muted-foreground/40 italic">—</span>}
                        </div>
                      </td>
                    )}
                    {showDate && (
                      <td className="px-4 py-3">
                        {renderDateTime(row.created_at)}
                      </td>
                    )}
                    <td
                      className="text-right px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedTransaction(row)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title={t('finance.view_detail', t('common.view_detail', 'View Details'))}
                        >
                          <Eye size={15} />
                        </button>
                        <TableActionMenu
                          onView={() => setSelectedTransaction(row)}
                          onDelete={
                            handleDelete
                              ? () => handleDelete(row.id, `Transaction #${row.id}`)
                              : undefined
                          }
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>

          {transactions.length > 0 && !isLoading && (
            <tfoot className="bg-muted/25 border-t-2 border-border font-semibold text-xs">
              <tr>
                {showId && (
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {stats.totalCount} {t('finance.records_count', 'records')}
                  </td>
                )}
                {showType && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <ArrowUpRight size={12} strokeWidth={2.5} />
                        {stats.inflowCount}
                      </span>
                      <span className="text-muted-foreground/50">/</span>
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                        <ArrowDownRight size={12} strokeWidth={2.5} />
                        {stats.outflowCount}
                      </span>
                    </div>
                  </td>
                )}
                {showAmount && (
                  <td className="text-right px-4 py-3 font-mono font-bold text-xs sm:text-sm tabular-nums">
                    <div className="flex flex-col items-end">
                      <span
                        className={
                          stats.netCashflow >= 0
                            ? 'text-foreground'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {stats.netCashflow >= 0 ? '+' : '-'}$
                        {Math.abs(stats.netCashflow).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {t('finance.net_cashflow', 'Net Cashflow')}
                      </span>
                    </div>
                  </td>
                )}
                {showCompany && <td className="px-4 py-3" />}
                {showMethod && <td className="px-4 py-3" />}
                {showRef && <td className="px-4 py-3" />}
                {showDesc && <td className="px-4 py-3" />}
                {showDate && <td className="px-4 py-3" />}
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </TableWrapper>

      {/* Slide-out Transaction Detail Inspection */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}

export { FinancialTransactionsTable as TransactionsTable, FinancialTransactionsTable as TransactionsTab }
export default FinancialTransactionsTable
