import React, { useMemo } from 'react'
import { Lock, Monitor, Building2, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { formatCurrency, formatShortDate } from '@/utils/formatters'

export interface CashRegistersSessionsTableProps {
  registers: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer?: (row: any) => void
  handleDelete?: (id: number, name?: string) => void
  onCloseShift?: (row: any) => void
}

export const CashRegistersSessionsTable: React.FC<CashRegistersSessionsTableProps> = ({
  registers = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditDrawer,
  handleDelete,
  onCloseShift,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const currentLocale = i18n.language === 'km' ? 'km-KH' : i18n.language

  // Aggregate stats for summary footer
  const { totalOpening, totalSales, totalBalance, openCount } = useMemo(() => {
    return registers.reduce(
      (acc, r) => {
        const opening = Number(r.opening_balance || 0)
        const sales = Number(r.cash_sales_amount ?? r.cash_sales ?? 0)
        const closing = Number(r.closing_balance ?? r.balance ?? (opening + sales))
        const isOpen = r.status === 'open'

        return {
          totalOpening: acc.totalOpening + opening,
          totalSales: acc.totalSales + sales,
          totalBalance: acc.totalBalance + closing,
          openCount: acc.openCount + (isOpen ? 1 : 0),
        }
      },
      { totalOpening: 0, totalSales: 0, totalBalance: 0, openCount: 0 }
    )
  }, [registers])

  // Column visibility flags (defaulting to true if not explicitly false)
  const showTitle = visibleColumns.register_title !== false
  const showOpening = visibleColumns.register_opening !== false
  const showSales = visibleColumns.register_sales !== false
  const showBalance = visibleColumns.register_balance !== false
  const showStatus = visibleColumns.register_status !== false

  let totalCols = 1 // Actions column is always present
  if (showTitle) totalCols++
  if (showOpening) totalCols++
  if (showSales) totalCols++
  if (showBalance) totalCols++
  if (showStatus) totalCols++

  return (
    <TableWrapper isFetching={isFetching} className="print:hidden">
      <table className="w-full data-table border-collapse">
        <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
          <tr>
            {showTitle && (
              <th className="text-left px-4 py-3.5 whitespace-nowrap min-w-[260px]">
                {t('finance.register_title', 'Register Title')}
              </th>
            )}
            {showOpening && (
              <th className="text-right px-4 py-3.5 whitespace-nowrap min-w-[130px]">
                {t('finance.opening_balance', 'Opening Balance')}
              </th>
            )}
            {showSales && (
              <th className="text-right px-4 py-3.5 whitespace-nowrap min-w-[130px]">
                {t('finance.cash_sales', 'Cash Sales')}
              </th>
            )}
            {showBalance && (
              <th className="text-right px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                {t('finance.current_balance', 'Current Balance')}
              </th>
            )}
            {showStatus && (
              <th className="text-center px-4 py-3.5 whitespace-nowrap min-w-[120px]">
                {t('finance.status_col', 'Status')}
              </th>
            )}
            <th className="text-right px-4 py-3.5 whitespace-nowrap min-w-[140px]">
              {t('finance.actions_col', t('common.actions', 'Actions'))}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {isLoading ? (
            <LoadingSkeleton cols={totalCols} />
          ) : registers.length === 0 ? (
            <EmptyState cols={totalCols} message={t('finance.no_data_registers', 'No cash registers found.')} />
          ) : (
            registers.map((row: any) => {
              const isOpen = row.status === 'open'
              const rawTitle = row.title || row.name || `Register #${row.id}`
              
              // Cleanly parse branch/location out of parenthesis if embedded
              const match = rawTitle.match(/^(.*?)(?:\s*\((.*?)\))?$/)
              const mainTitle = match && match[1] ? match[1].trim() : rawTitle
              const branchInfo =
                (match && match[2] ? match[2].trim() : '') ||
                row.branch?.name ||
                row.store?.name ||
                ''

              const openingAmount = Number(row.opening_balance || 0)
              const salesAmount = Number(row.cash_sales_amount ?? row.cash_sales ?? 0)
              const balanceAmount = Number(
                row.closing_balance ?? row.balance ?? (openingAmount + salesAmount)
              )

              return (
                <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                  {showTitle && (
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                            isOpen
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-muted/60 border-border text-muted-foreground'
                          }`}
                        >
                          <Monitor size={17} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-xs sm:text-sm truncate">
                              {mainTitle}
                            </span>
                            {row.code && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border/60 shrink-0">
                                {row.code}
                              </span>
                            )}
                          </div>
                          {branchInfo && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                              <Building2 size={11} className="shrink-0 text-muted-foreground/70" />
                              <span className="truncate">{branchInfo}</span>
                              {row.opened_at && isOpen && (
                                <>
                                  <span className="text-border">•</span>
                                  <span className="text-[10px] text-muted-foreground/80">
                                    {formatShortDate(row.opened_at)}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}

                  {showOpening && (
                    <td className="text-right px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground font-medium">
                      {formatCurrency(openingAmount, { locale: currentLocale })}
                    </td>
                  )}

                  {showSales && (
                    <td className="text-right px-4 py-3 font-mono text-xs tabular-nums">
                      {salesAmount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <TrendingUp size={12} className="shrink-0" />
                          +{formatCurrency(salesAmount, { locale: currentLocale })}
                        </span>
                      ) : salesAmount < 0 ? (
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {formatCurrency(salesAmount, { locale: currentLocale })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/70 font-normal">
                          {formatCurrency(0, { locale: currentLocale })}
                        </span>
                      )}
                    </td>
                  )}

                  {showBalance && (
                    <td className="text-right px-4 py-3 font-mono">
                      <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums tracking-tight">
                        {formatCurrency(balanceAmount, { locale: currentLocale })}
                      </span>
                    </td>
                  )}

                  {showStatus && (
                    <td className="text-center px-4 py-3">
                      <div className="flex items-center justify-center">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>{t('finance.status_open', 'Open')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                            <span>{t('finance.status_closed', 'Closed')}</span>
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  <td className="text-right px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {isOpen && onCloseShift && (
                        <button
                          type="button"
                          onClick={() => onCloseShift(row)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/25 rounded-lg transition-all shadow-2xs cursor-pointer"
                          title={t('finance.close_shift', 'Close Shift')}
                        >
                          <Lock size={12} className="shrink-0" />
                          <span>{t('finance.close_shift', 'Close Shift')}</span>
                        </button>
                      )}
                      <TableActionMenu
                        onEdit={openEditDrawer ? () => openEditDrawer(row) : undefined}
                        onDelete={isOpen || !handleDelete ? undefined : () => handleDelete(row.id, row.title || row.name)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>

        {registers.length > 0 && !isLoading && (
          <tfoot className="bg-muted/25 border-t-2 border-border font-semibold text-xs">
            <tr>
              {showTitle && (
                <td className="px-4 py-3 font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <span>{t('common.total', 'Total')}</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      ({registers.length} {t('finance.registers_count', 'registers')})
                    </span>
                  </div>
                </td>
              )}
              {showOpening && (
                <td className="text-right px-4 py-3 font-mono text-muted-foreground font-semibold">
                  {formatCurrency(totalOpening, { locale: currentLocale })}
                </td>
              )}
              {showSales && (
                <td className="text-right px-4 py-3 font-mono text-xs">
                  <span
                    className={
                      totalSales > 0
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-muted-foreground/70 font-normal'
                    }
                  >
                    {totalSales > 0
                      ? `+${formatCurrency(totalSales, { locale: currentLocale })}`
                      : formatCurrency(0, { locale: currentLocale })}
                  </span>
                </td>
              )}
              {showBalance && (
                <td className="text-right px-4 py-3 font-mono font-bold text-foreground sm:text-sm">
                  {formatCurrency(totalBalance, { locale: currentLocale })}
                </td>
              )}
              {showStatus && (
                <td className="text-center px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>
                      {openCount} / {registers.length} {t('finance.status_open', 'Open')}
                    </span>
                  </span>
                </td>
              )}
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        )}
      </table>
    </TableWrapper>
  )
}

export { CashRegistersSessionsTable as CashRegistersTable, CashRegistersSessionsTable as RegistersTable, CashRegistersSessionsTable as RegistersTab }
export default CashRegistersSessionsTable
