import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'

export interface CurrenciesRatesTableProps {
  currencies?: any[]
  isLoading?: boolean
  isFetching?: boolean
  visibleColumns?: Record<string, boolean>
  openEditDrawer?: (row: any) => void
  handleDelete?: (id: number, name?: string) => void
}

/**
 * Format rate cleanly with commas
 */
const formatRate = (rate: number | string): string => {
  const num = Number(rate)
  if (isNaN(num)) return '1'
  if (num % 1 === 0) {
    return num.toLocaleString('en-US')
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

export const CurrenciesRatesTable: React.FC<CurrenciesRatesTableProps> = ({
  currencies = [],
  isLoading = false,
  isFetching = false,
  visibleColumns = {
    currency_name: true,
    currency_code: true,
    currency_symbol: true,
    currency_rate: true,
    currency_status: true,
  },
  openEditDrawer,
  handleDelete,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  // Strictly filter to the 2 active currencies: USD & KHR
  const operationalCurrencies = useMemo(() => {
    const list = currencies.filter((c: any) =>
      ['USD', 'KHR'].includes((c.code || '').toUpperCase())
    )
    return [...list].sort((a: any, b: any) =>
      (a.code || '').toUpperCase() === 'USD' ? -1 : 1
    )
  }, [currencies])

  // Extract KHR rate for display
  const khrCurrency = useMemo(() => {
    return currencies.find((c: any) => (c.code || '').toUpperCase() === 'KHR')
  }, [currencies])

  const khrRateNumber = Number(khrCurrency?.exchange_rate || 4100)
  const inverseKhr = khrRateNumber > 0 ? (1 / khrRateNumber).toFixed(5) : '0.00024'

  return (
    <TableWrapper isFetching={isFetching} className="print:hidden">
      <table className="w-full data-table border-collapse">
        <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
          <tr>
            {visibleColumns.currency_name && (
              <th className="text-left px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.currency_name', 'Currency Name')}
              </th>
            )}
            {visibleColumns.currency_code && (
              <th className="text-left px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.iso_code', 'ISO Code')}
              </th>
            )}
            {visibleColumns.currency_symbol && (
              <th className="text-center px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.symbol_col', 'Symbol')}
              </th>
            )}
            {visibleColumns.currency_rate && (
              <th className="text-right px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t('finance.exchange_rate', 'Exchange Rate')}</span>
                  <span className="text-[11px] font-mono text-primary font-normal">
                    {t('finance.vs_base_usd', '(vs 1 USD)')}
                  </span>
                </div>
              </th>
            )}
            {visibleColumns.currency_status && (
              <th className="text-center px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {t('finance.status_col', 'Status')}
              </th>
            )}
            <th className="text-right px-4 py-3.5 whitespace-nowrap text-xs font-semibold text-muted-foreground">
              {t('finance.actions_col', t('common.actions', 'Actions'))}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {isLoading ? (
            <LoadingSkeleton cols={6} />
          ) : operationalCurrencies.length === 0 ? (
            <EmptyState cols={6} message={t('finance.no_data_currencies', 'No currencies found.')} />
          ) : (
            operationalCurrencies.map((row: any) => {
              const code = (row.code || '').toUpperCase()
              const flag = code === 'USD' ? '🇺🇸' : code === 'KHR' ? '🇰🇭' : '💵'
              const isBase = code === 'USD' || Boolean(row.is_default)
              const localizedName = code === 'USD'
                ? t('finance.currency_usd_name', row.name || 'US Dollar')
                : code === 'KHR'
                ? t('finance.currency_khr_name', row.name || 'Cambodian Riel')
                : row.name

              const localizedSub = code === 'USD'
                ? t('finance.currency_usd_sub', 'United States Dollar')
                : code === 'KHR'
                ? t('finance.currency_khr_sub', 'Khmer Riel')
                : ''

              return (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    isBase
                      ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  {/* Currency Name & Localized Name */}
                  {visibleColumns.currency_name && (
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted/70 dark:bg-slate-800/80 border border-border/80 flex items-center justify-center text-lg shrink-0 shadow-2xs select-none">
                          {flag}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-sm">
                              {localizedName}
                            </span>
                            {isBase && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full shadow-2xs">
                                <Sparkles size={10} className="fill-primary" />
                                <span>{t('finance.base_badge', 'Base Currency')}</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {localizedSub}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}

                  {/* ISO Code Badge */}
                  {visibleColumns.currency_code && (
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/70 dark:bg-slate-800/80 border border-border/80 font-mono text-xs font-bold text-foreground">
                        {row.code}
                      </span>
                    </td>
                  )}

                  {/* Symbol Badge */}
                  {visibleColumns.currency_symbol && (
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-lg bg-muted/60 dark:bg-slate-800/80 border border-border/80 font-bold text-foreground text-sm shadow-2xs">
                        {row.symbol}
                      </span>
                    </td>
                  )}

                  {/* Clean Exchange Rate Display */}
                  {visibleColumns.currency_rate && (
                    <td className="px-4 py-3.5 text-right">
                      {isBase ? (
                        <div className="flex flex-col items-end">
                          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary dark:text-emerald-400 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-md border border-primary/20">
                            <CheckCircle2 size={13} />
                            <span>1.0000 ({t('finance.base_rate_short', 'Base')})</span>
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            1 USD = 1.00 $
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
                            <span className="text-xs font-medium text-muted-foreground">
                              {t('finance.one_usd_equals', '1 USD =')}
                            </span>
                            <span className="text-primary dark:text-sky-400 font-extrabold text-[15px] tabular-nums">
                              {formatRate(row.exchange_rate)}
                            </span>
                            <span className="text-xs font-semibold text-foreground/90">
                              {row.symbol || row.code}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            1 {row.symbol || row.code} ≈ ${inverseKhr}
                          </div>
                        </div>
                      )}
                    </td>
                  )}

                  {/* Status Pill */}
                  {visibleColumns.currency_status && (
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            row.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                          <span>
                            {row.is_active ? t('finance.active', 'Active') : t('finance.inactive', 'Inactive')}
                          </span>
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Inline Action Menu */}
                  <td className="px-4 py-3.5 text-right">
                    <TableActionMenu
                      variant="inline"
                      onEdit={openEditDrawer ? () => openEditDrawer(row) : undefined}
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </TableWrapper>
  )
}

export { CurrenciesRatesTable as CurrenciesTab, CurrenciesRatesTable as CurrenciesTable }
export default CurrenciesRatesTable
