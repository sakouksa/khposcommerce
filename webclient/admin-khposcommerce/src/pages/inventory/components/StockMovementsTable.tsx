import React from 'react'
import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import TableActionMenu from '@/components/shared/TableActionMenu'
import Pagination from '@/components/shared/Pagination'
import { EmptyState } from '@/components/common'
import { formatShortDate } from '@/utils/formatters'

interface StockMovementsTableProps {
  data: any
  isLoading: boolean
  isFetching: boolean
  pagination: any
  perPage: number
  setPage: (p: number) => void
  setPerPage: (p: number) => void
  onViewItem: (id: number) => void
  onSort?: (field: string) => void
  renderSortIcon?: (field: string) => React.ReactNode
  visibleColumns?: Record<string, boolean>
  onResetFilters?: () => void
}

export const StockMovementsTable: React.FC<StockMovementsTableProps> = ({
  data,
  isLoading,
  isFetching,
  pagination,
  perPage,
  setPage,
  setPerPage,
  onViewItem,
  onSort,
  renderSortIcon,
  visibleColumns = {},
  onResetFilters,
}) => {
  const { t } = useTranslation(['inventory', 'common'])
  const items: any[] = data?.data ?? []

  const activeColCount = 1 + Object.values(visibleColumns).filter(v => v !== false).length

  const getTypeBadge = (type: string, refType?: string) => {
    const isPositive = type === 'in' || type === 'addition'
    const isTransfer = refType?.includes('transfer') || type === 'transfer'
    const isAdjustment = refType?.includes('adjustment') || refType?.includes('opname') || type === 'adjustment'

    if (isTransfer) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {t('transfer', 'Transfer')}
        </span>
      )
    }

    if (isAdjustment) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
          {t('adjustment', 'Adjustment')}
        </span>
      )
    }

    if (isPositive) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          {t('stockIn', 'Stock In')}
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
        {t('stockOut', 'Stock Out')}
      </span>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {visibleColumns.date !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colDate', 'Date & Time')}
                </th>
              )}
              {visibleColumns.reference !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colReference', 'Reference')}
                </th>
              )}
              {visibleColumns.product !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colProduct', 'Product & SKU')}
                </th>
              )}
              {visibleColumns.warehouse !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colWarehouse', 'Warehouse')}
                </th>
              )}
              {visibleColumns.type !== false && (
                <th className="text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colMovementType', 'Type')}
                </th>
              )}
              {visibleColumns.quantity !== false && (
                <th className="text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colQtyChange', 'Qty Change')}
                </th>
              )}
              {visibleColumns.balance !== false && (
                <th className="text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colStockAfter', 'Stock Balance')}
                </th>
              )}
              {visibleColumns.user !== false && (
                <th className="text-left py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colUser', 'Operator')}
                </th>
              )}
              <th className="sticky right-0 z-10 bg-card border-l border-border text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap min-w-[80px]">
                {t('common.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {visibleColumns.date !== false && <td className="p-4"><div className="skeleton h-4 w-28 rounded" /></td>}
                  {visibleColumns.reference !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded" /></td>}
                  {visibleColumns.product !== false && <td className="p-4"><div className="skeleton h-4 w-40 rounded" /></td>}
                  {visibleColumns.warehouse !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded" /></td>}
                  {visibleColumns.type !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded mx-auto" /></td>}
                  {visibleColumns.quantity !== false && <td className="p-4"><div className="skeleton h-4 w-12 rounded mx-auto" /></td>}
                  {visibleColumns.balance !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded mx-auto" /></td>}
                  {visibleColumns.user !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                  <td className="p-4"><div className="skeleton h-4 w-8 rounded ml-auto" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <EmptyState
                cols={activeColCount || 9}
                icon={Activity}
                title={t('noMovementsFound', 'No stock movement data found.')}
                description={t('empty.noMovementsDesc', 'No stock movement records match the specified filter conditions.')}
              />
            ) : (
              items.map((item) => {
                const qty = Number(item.quantity) || 0
                const qtyBefore = Number(item.quantity_before) || 0
                const qtyAfter = Number(item.quantity_after) || 0
                const isPositive = item.type === 'in' || item.type === 'addition'

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onViewItem(item.id)}
                  >
                    {visibleColumns.date !== false && (
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatShortDate(item.created_at)}
                      </td>
                    )}
                    {visibleColumns.reference !== false && (
                      <td className="py-3 px-4 font-mono font-bold text-xs text-primary whitespace-nowrap">
                        {item.reference_type ? (
                          <span className="capitalize">{item.reference_type} #{item.reference_id || item.id}</span>
                        ) : (
                          `MOV-${item.id}`
                        )}
                      </td>
                    )}
                    {visibleColumns.product !== false && (
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-foreground text-xs block leading-snug">
                            {item.product?.name || 'Catalog Product'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            SKU: {item.product?.sku || item.sku || '—'}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.warehouse !== false && (
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {item.warehouse?.name || 'Main Warehouse'}
                      </td>
                    )}
                    {visibleColumns.type !== false && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getTypeBadge(item.type, item.reference_type)}
                      </td>
                    )}
                    {visibleColumns.quantity !== false && (
                      <td className="py-3 px-4 text-center font-black text-xs whitespace-nowrap">
                        <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isPositive ? '+' : '-'}{Math.abs(qty)}
                        </span>
                      </td>
                    )}
                    {visibleColumns.balance !== false && (
                      <td className="py-3 px-4 text-center font-mono text-xs whitespace-nowrap">
                        <span className="text-muted-foreground">{qtyBefore}</span>
                        <span className="mx-1 text-muted-foreground/50">→</span>
                        <span className="font-bold text-foreground">{qtyAfter}</span>
                      </td>
                    )}
                    {visibleColumns.user !== false && (
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {item.user?.name || 'System Admin'}
                      </td>
                    )}
                    <td className="sticky right-0 z-10 bg-card group-hover:bg-muted/40 dark:group-hover:bg-muted/20 transition-colors border-l border-border py-3 px-4 text-center whitespace-nowrap min-w-[80px]" onClick={(e) => e.stopPropagation()}>
                      <TableActionMenu
                        onView={() => onViewItem(item.id)}
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

export default StockMovementsTable
