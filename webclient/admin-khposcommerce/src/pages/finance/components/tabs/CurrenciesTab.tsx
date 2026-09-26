import React from 'react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface CurrenciesTabProps {
  currencies: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer: (row: any) => void
  handleDelete: (id: number, name?: string) => void
}

export const CurrenciesTab: React.FC<CurrenciesTabProps> = ({
  currencies = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditDrawer,
  handleDelete,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {visibleColumns.currency_name && <th>{t('finance.currency_name', 'Currency Name')}</th>}
                {visibleColumns.currency_code && <th>{t('finance.iso_code', 'ISO Code')}</th>}
                {visibleColumns.currency_symbol && <th>{t('finance.symbol_col', 'Symbol')}</th>}
                {visibleColumns.currency_rate && <th>{t('finance.exchange_rate', 'Exchange Rate')}</th>}
                {visibleColumns.currency_status && <th>{t('finance.status_col', 'Status')}</th>}
                <th className="text-right">{t('finance.actions_col', t('common.actions', 'Actions'))}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={6} />
              ) : currencies.length === 0 ? (
                <EmptyState cols={6} message={t('finance.no_data_currencies', 'No currencies configured.')} />
              ) : (
                currencies.map((row: any) => (
                  <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.currency_name && (
                      <td className="font-semibold text-foreground">
                        {row.name} {row.is_default && (
                          <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded ml-1 border border-primary/20">
                            {t('finance.default_badge', 'Default')}
                          </span>
                        )}
                      </td>
                    )}
                    {visibleColumns.currency_code && (
                      <td className="font-mono text-xs font-bold">{row.code}</td>
                    )}
                    {visibleColumns.currency_symbol && (
                      <td className="font-bold text-center w-12">{row.symbol}</td>
                    )}
                    {visibleColumns.currency_rate && (
                      <td className="font-mono text-xs font-semibold">{Number(row.exchange_rate || 1).toFixed(4)}</td>
                    )}
                    {visibleColumns.currency_status && (
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          row.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        }`}>
                          {row.is_active ? t('finance.active', 'Active') : t('finance.inactive', 'Inactive')}
                        </span>
                      </td>
                    )}
                    <td className="text-right">
                      <TableActionMenu
                        variant="inline"
                        onEdit={() => openEditDrawer(row)}
                        onDelete={row.is_default ? undefined : () => handleDelete(row.id, row.name)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default CurrenciesTab
