import React from 'react'
import { useTranslation } from 'react-i18next'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { PercentBadge } from '@/components/common'

interface TaxesTabProps {
  taxes: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer: (row: any) => void
  handleDelete: (id: number, name?: string) => void
}

export const TaxesTab: React.FC<TaxesTabProps> = ({
  taxes = [],
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
                {visibleColumns.tax_name && <th>{t('finance.tax_rule_name', 'Tax Rule Name')}</th>}
                {visibleColumns.tax_rate && <th>{t('finance.tax_rate', 'Tax Rate (%)')}</th>}
                {visibleColumns.tax_type && <th>{t('finance.type_col', 'Type')}</th>}
                {visibleColumns.tax_status && <th>{t('finance.status_col', 'Status')}</th>}
                <th className="text-right">{t('finance.actions_col', t('common.actions', 'Actions'))}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={5} />
              ) : taxes.length === 0 ? (
                <EmptyState cols={5} message={t('finance.no_data_taxes', 'No tax rules configured.')} />
              ) : (
                taxes.map((row: any) => (
                  <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.tax_name && (
                      <td className="font-semibold text-foreground">{row.name}</td>
                    )}
                    {visibleColumns.tax_rate && (
                      <td className="font-bold text-foreground font-mono">
                        <PercentBadge value={row.rate} variant="blue" />
                      </td>
                    )}
                    {visibleColumns.tax_type && (
                      <td className="capitalize text-xs font-medium text-muted-foreground">{row.type || 'percentage'}</td>
                    )}
                    {visibleColumns.tax_status && (
                      <td>
                        <StatusBadge status={row.is_active} />
                      </td>
                    )}
                    <td className="text-right">
                      <TableActionMenu
                        variant="inline"
                        onEdit={() => openEditDrawer(row)}
                        onDelete={() => handleDelete(row.id, row.name)}
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

export default TaxesTab
