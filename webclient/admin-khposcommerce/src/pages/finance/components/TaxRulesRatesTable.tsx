import React from 'react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { PercentBadge } from '@/components/common'

export interface TaxRulesRatesTableProps {
  taxes: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer?: (row: any) => void
  handleDelete?: (id: number, name?: string) => void
}

export const TaxRulesRatesTable: React.FC<TaxRulesRatesTableProps> = ({
  taxes = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditDrawer,
  handleDelete,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  return (
    <TableWrapper isFetching={isFetching} className="print:hidden">
      <table className="w-full data-table border-collapse">
        <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
          <tr>
            {visibleColumns.tax_name && <th className="text-left px-4 py-3.5 whitespace-nowrap">{t('finance.tax_rule_name', 'Tax Rule Name')}</th>}
            {visibleColumns.tax_rate && <th className="text-center px-4 py-3.5 whitespace-nowrap">{t('finance.tax_rate', 'Tax Rate (%)')}</th>}
            {visibleColumns.tax_type && <th className="text-left px-4 py-3.5 whitespace-nowrap">{t('finance.type_col', 'Type')}</th>}
            {visibleColumns.tax_status && <th className="text-center px-4 py-3.5 whitespace-nowrap">{t('finance.status_col', 'Status')}</th>}
            <th className="text-right px-4 py-3.5 whitespace-nowrap">{t('finance.actions_col', t('common.actions', 'Actions'))}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {isLoading ? (
            <LoadingSkeleton cols={5} />
          ) : taxes.length === 0 ? (
            <EmptyState cols={5} message={t('finance.no_data_taxes', 'No tax rules configured.')} />
          ) : (
            taxes.map((row: any) => (
              <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                {visibleColumns.tax_name && (
                  <td className="px-4 py-3 font-semibold text-foreground">{row.name}</td>
                )}
                {visibleColumns.tax_rate && (
                  <td className="px-4 py-3 font-bold text-foreground font-mono text-center">
                    <PercentBadge value={row.rate} variant="blue" />
                  </td>
                )}
                {visibleColumns.tax_type && (
                  <td className="px-4 py-3 capitalize text-xs font-medium text-muted-foreground">
                    {row.type === 'fixed' ? t('finance.tax_type_fixed', 'Fixed') : t('finance.tax_type_percentage', 'Percentage')}
                  </td>
                )}
                {visibleColumns.tax_status && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <StatusBadge status={row.is_active} />
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <TableActionMenu
                    variant="inline"
                    onEdit={openEditDrawer ? () => openEditDrawer(row) : undefined}
                    onDelete={handleDelete ? () => handleDelete(row.id, row.name) : undefined}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableWrapper>
  )
}

export { TaxRulesRatesTable as TaxesTab, TaxRulesRatesTable as TaxRulesTable, TaxRulesRatesTable as TaxesTable }
export default TaxRulesRatesTable
