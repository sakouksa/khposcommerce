import React from 'react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface PaymentMethodsTabProps {
  methods: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer: (row: any) => void
  handleDelete: (id: number, name?: string) => void
  toggleStatus: (row: any) => void
}

export const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({
  methods = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditDrawer,
  handleDelete,
  toggleStatus,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  const formatType = (type?: string) => {
    if (!type) return t('finance.pm_type_cash', 'Cash')
    const key = `finance.pm_type_${type.toLowerCase()}`
    return t(key, type.replace(/_/g, ' '))
  }

  const formatFee = (method: any) => {
    const percent = Number(method.fee_percent || 0)
    const fixed = Number(method.fee_fixed || 0)
    if (percent === 0 && fixed === 0) {
      return (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {t('finance.fee_free', 'Free')}
        </span>
      )
    }
    const parts = []
    if (percent > 0) parts.push(`${percent}%`)
    if (fixed > 0) parts.push(`$${fixed.toFixed(2)}`)
    return <span className="text-xs font-semibold font-mono text-foreground">{parts.join(' + ')}</span>
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {visibleColumns.pm_name && <th>{t('finance.method_name', 'Method Name')}</th>}
                {visibleColumns.pm_code && <th>{t('finance.code_col', 'Code')}</th>}
                {visibleColumns.pm_type && <th>{t('finance.type_col', 'Type')}</th>}
                {visibleColumns.pm_fee && <th>{t('finance.fee_col', 'Fee')}</th>}
                {visibleColumns.pm_channels && <th>{t('finance.channels_col', 'Channels')}</th>}
                {visibleColumns.pm_status && <th>{t('finance.status_col', 'Status')}</th>}
                <th className="text-right">{t('finance.actions_col', t('common.actions', 'Actions'))}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={7} />
              ) : methods.length === 0 ? (
                <EmptyState cols={7} message={t('finance.no_data_payment_methods', 'No payment methods found.')} />
              ) : (
                methods.map((method: any) => (
                  <tr key={method.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.pm_name && (
                      <td className="font-semibold text-foreground">{method.name}</td>
                    )}
                    {visibleColumns.pm_code && (
                      <td className="font-mono text-xs text-primary font-bold">{method.code}</td>
                    )}
                    {visibleColumns.pm_type && (
                      <td className="text-xs font-medium capitalize text-muted-foreground">
                        {formatType(method.type)}
                      </td>
                    )}
                    {visibleColumns.pm_fee && (
                      <td>{formatFee(method)}</td>
                    )}
                    {visibleColumns.pm_channels && (
                      <td>
                        <div className="flex items-center gap-1.5">
                          {method.available_pos && (
                            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              POS
                            </span>
                          )}
                          {method.available_online && (
                            <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              Online
                            </span>
                          )}
                          {!method.available_pos && !method.available_online && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.pm_status && (
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleStatus(method)}
                          className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border cursor-pointer transition-all hover:scale-105 ${
                            method.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          {method.is_active ? t('finance.active', 'Active') : t('finance.inactive', 'Inactive')}
                        </button>
                      </td>
                    )}
                    <td className="text-right">
                      <TableActionMenu
                        onEdit={() => openEditDrawer(method)}
                        onDelete={() => handleDelete(method.id, method.name)}
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

export default PaymentMethodsTab
