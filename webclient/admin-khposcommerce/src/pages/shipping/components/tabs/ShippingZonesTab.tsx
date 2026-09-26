import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'

interface ShippingZonesTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: any) => void
  setDeleteId: (id: number) => void
  setConfirmOpen: (val: boolean) => void
  setDetailDrawerItem: (item: any) => void
}

export const ShippingZonesTab: React.FC<ShippingZonesTabProps> = ({
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
                {visibleColumns.name && <th>Zone Name</th>}
                {visibleColumns.carrier && <th>Zone Code</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={4} />
              ) : records.length === 0 ? (
                <EmptyState cols={4} message="No shipping zones found." />
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.name && (
                      <td>
                        <p onClick={() => setDetailDrawerItem(r)} className="font-bold text-foreground hover:text-primary cursor-pointer text-sm">
                          {r.name}
                        </p>
                      </td>
                    )}
                    {visibleColumns.carrier && (
                      <td>
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {r.code}
                        </span>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td>
                        <StatusBadge status={r.is_active} />
                      </td>
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

export default ShippingZonesTab
