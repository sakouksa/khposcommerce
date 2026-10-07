import React from 'react'
import { Lock, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu, { type TableActionItem } from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { formatCurrency } from '@/utils/formatters'

interface RegistersTabProps {
  registers: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer: (row: any) => void
  handleDelete: (id: number, name?: string) => void
  onCloseShift?: (row: any) => void
}

export const RegistersTab: React.FC<RegistersTabProps> = ({
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

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {visibleColumns.register_title && <th>{t('finance.register_title', 'Register Title')}</th>}
                <th>{t('finance.opening_balance', 'Opening Balance')}</th>
                <th>{t('finance.cash_sales', 'Cash Sales')}</th>
                {visibleColumns.register_balance && <th>{t('finance.current_balance', 'Closing / Balance')}</th>}
                {visibleColumns.register_status && <th>{t('finance.status_col', 'Status')}</th>}
                <th className="text-right">{t('finance.actions_col', t('common.actions', 'Actions'))}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={6} />
              ) : registers.length === 0 ? (
                <EmptyState cols={6} message={t('finance.no_data_registers', 'No cash registers found.')} />
              ) : (
                registers.map((row: any) => {
                  const isOpen = row.status === 'open'
                  const customActions: TableActionItem[] = []
                  if (isOpen && onCloseShift) {
                    customActions.push({
                      label: t('finance.close_shift', 'Close Shift'),
                      icon: Lock,
                      onClick: () => onCloseShift(row),
                      variant: 'warning',
                    })
                  }

                  return (
                    <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                      {visibleColumns.register_title && (
                        <td className="font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <span>{row.title || row.name || `Register #${row.id}`}</span>
                            {isOpen && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {t('finance.live_active', 'Active')}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="font-mono text-muted-foreground text-xs">
                        {formatCurrency(row.opening_balance ?? 0, { locale: currentLocale })}
                      </td>
                      <td className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                        +{formatCurrency(row.cash_sales_amount ?? row.cash_sales ?? 0, { locale: currentLocale })}
                      </td>
                      {visibleColumns.register_balance && (
                        <td className="font-bold text-foreground font-mono">
                          {formatCurrency(row.closing_balance ?? row.balance ?? (Number(row.opening_balance || 0) + Number(row.cash_sales_amount || 0)), { locale: currentLocale })}
                        </td>
                      )}
                      {visibleColumns.register_status && (
                        <td>
                          <StatusBadge status={row.status || 'closed'} />
                        </td>
                      )}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isOpen && onCloseShift && (
                            <button
                              type="button"
                              onClick={() => onCloseShift(row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors cursor-pointer"
                              title={t('finance.close_shift', 'Close Shift')}
                            >
                              <Lock size={12} />
                              <span>{t('finance.close_shift', 'Close Shift')}</span>
                            </button>
                          )}
                          <TableActionMenu
                            items={customActions}
                            onEdit={() => openEditDrawer(row)}
                            onDelete={isOpen ? undefined : () => handleDelete(row.id, row.title || row.name)}
                          />
                        </div>
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

export default RegistersTab
