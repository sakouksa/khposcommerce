import React from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import TableActionMenu from '@/components/shared/TableActionMenu'
import Pagination from '@/components/shared/Pagination'
import StatusBadge from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common'
import { formatShortDate } from '@/utils/formatters'

interface StockOpnamesTableProps {
  data: any
  isLoading: boolean
  isFetching: boolean
  pagination: any
  perPage: number
  setPage: (p: number) => void
  setPerPage: (p: number) => void
  onViewItem: (id: number) => void
  onEditItem?: (id: number) => void
  onDeleteItem?: (id: number) => void
  visibleColumns?: Record<string, boolean>
  onResetFilters?: () => void
}

export const StockOpnamesTable: React.FC<StockOpnamesTableProps> = ({
  data,
  isLoading,
  isFetching,
  pagination,
  perPage,
  setPage,
  setPerPage,
  onViewItem,
  onEditItem,
  onDeleteItem,
  visibleColumns = {},
  onResetFilters,
}) => {
  const { t } = useTranslation(['inventory', 'common', 'buttons'])
  const items: any[] = data?.data ?? []

  const activeColCount = 1 + Object.values(visibleColumns).filter(v => v !== false).length

  const getStatusBadge = (status: string) => <StatusBadge status={status} />

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {visibleColumns.date !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colDate', 'Date')}
                </th>
              )}
              {visibleColumns.reference !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colReference', 'Reference #')}
                </th>
              )}
              {visibleColumns.warehouse !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colWarehouse', 'Warehouse')}
                </th>
              )}
              {visibleColumns.items !== false && (
                <th className="text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('auditedItemsCount', 'Audited Items')}
                </th>
              )}
              {visibleColumns.accuracy !== false && (
                <th className="text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('accuracyRate', 'Accuracy Rate')}
                </th>
              )}
              {visibleColumns.notes !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('notes', 'Notes')}
                </th>
              )}
              {visibleColumns.status !== false && (
                <th className="text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colStatus', 'Status')}
                </th>
              )}
              {visibleColumns.user !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colUser', 'Auditor')}
                </th>
              )}
              <th className="sticky right-0 z-20 bg-card dark:bg-card border-l border-border text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap min-w-[80px]">
                {t('common.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {visibleColumns.date !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                  {visibleColumns.reference !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded" /></td>}
                  {visibleColumns.warehouse !== false && <td className="p-4"><div className="skeleton h-4 w-28 rounded" /></td>}
                  {visibleColumns.items !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded mx-auto" /></td>}
                  {visibleColumns.accuracy !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded mx-auto" /></td>}
                  {visibleColumns.notes !== false && <td className="p-4"><div className="skeleton h-4 w-32 rounded" /></td>}
                  {visibleColumns.status !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded mx-auto" /></td>}
                  {visibleColumns.user !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                  <td className="p-4"><div className="skeleton h-4 w-8 rounded ml-auto" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <EmptyState
                cols={activeColCount || 9}
                icon={CheckCircle2}
                title={t('noOpnameRecordsYet', 'រកមិនឃើញទិន្នន័យសវនកម្មស្តុកទេ')}
                description={t('empty.noOpnamesDesc', 'មិនមានកំណត់ត្រាសវនកម្មស្តុកត្រូវគ្នានឹងលក្ខខណ្ឌតម្រងដែលបានកំណត់ទេ។')}
              />
            ) : (
              items.map((item) => {
                const totalItems = item.items?.length || Number(item.total_items || 0)
                const matchedItems = item.items?.filter((i: any) => Number(i.variance || 0) === 0).length || 0
                const accuracy = totalItems > 0 ? ((matchedItems / totalItems) * 100).toFixed(1) : '100.0'
                const isCompleted = item.status === 'completed' || item.status === 'done' || item.status === 'reconciled'
                const canEdit = !isCompleted
                const canDelete = !isCompleted

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors group cursor-pointer"
                    onClick={() => onViewItem(item.id)}
                  >
                    {visibleColumns.date !== false && (
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatShortDate(item.created_at || item.date)}
                      </td>
                    )}
                    {visibleColumns.reference !== false && (
                      <td className="py-3 px-4 font-mono font-bold text-xs text-primary whitespace-nowrap">
                        {item.reference_number || `OPN-${item.id}`}
                      </td>
                    )}
                    {visibleColumns.warehouse !== false && (
                      <td className="py-3 px-4 text-xs font-semibold text-foreground whitespace-nowrap">
                        {item.warehouse?.name || 'Main Warehouse'}
                      </td>
                    )}
                    {visibleColumns.items !== false && (
                      <td className="py-3 px-4 text-center font-bold text-xs text-foreground whitespace-nowrap">
                        {totalItems > 0 ? `${totalItems} ${t('units', 'items')}` : 'Full Inventory'}
                      </td>
                    )}
                    {visibleColumns.accuracy !== false && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                          {accuracy}%
                        </span>
                      </td>
                    )}
                    {visibleColumns.notes !== false && (
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate">
                        {item.notes || 'Routine warehouse cycle counting'}
                      </td>
                    )}
                    {visibleColumns.status !== false && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                    )}
                    {visibleColumns.user !== false && (
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {item.user?.name || 'Audit Officer'}
                      </td>
                    )}
                    <td className="sticky right-0 z-10 bg-card group-hover:bg-muted/40 dark:group-hover:bg-muted/20 transition-colors border-l border-border py-3 px-4 text-center whitespace-nowrap min-w-[80px]" onClick={(e) => e.stopPropagation()}>
                      <TableActionMenu
                        onView={() => onViewItem(item.id)}
                        onEdit={canEdit && onEditItem ? () => onEditItem(item.id) : undefined}
                        onDelete={canDelete && onDeleteItem ? () => onDeleteItem(item.id) : undefined}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </TableWrapper>
      <Pagination
        currentPage={pagination?.current_page || pagination?.currentPage || 1}
        lastPage={pagination?.last_page || pagination?.lastPage || 1}
        total={pagination?.total ?? (data?.total || items.length)}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  )
}

export default StockOpnamesTable
