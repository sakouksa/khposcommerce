import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface ShippingRatesTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: any) => void
  setDeleteId: (id: number) => void
  setConfirmOpen: (val: boolean) => void
  setDetailDrawerItem: (item: any) => void
}

export const ShippingRatesTab: React.FC<ShippingRatesTabProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditModal,
  setDeleteId,
  setConfirmOpen,
  setDetailDrawerItem,
}) => {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {visibleColumns.name && <th>Weight Range (kg)</th>}
                {visibleColumns.cost && <th>Rate ($)</th>}
                {visibleColumns.actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={3} />
              ) : records.length === 0 ? (
                <EmptyState cols={3} message="No shipping rates found." />
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.name && (
                      <td>
                        <p onClick={() => setDetailDrawerItem(r)} className="font-mono text-xs font-bold text-foreground cursor-pointer hover:text-primary">
                          {r.min_weight ?? 0}kg - {r.max_weight ?? 10}kg
                        </p>
                      </td>
                    )}
                    {visibleColumns.cost && (
                      <td className="font-mono text-xs font-bold text-emerald-600">${r.price ?? r.rate ?? 0}</td>
                    )}
                    {visibleColumns.actions && (
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          onView={() => setDetailDrawerItem(r)}
                          onEdit={() => openEditModal(r)}
                          onDelete={() => { setDeleteId(r.id); setConfirmOpen(true); }}
                        />
                      </td>
                    )}
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

export default ShippingRatesTab
