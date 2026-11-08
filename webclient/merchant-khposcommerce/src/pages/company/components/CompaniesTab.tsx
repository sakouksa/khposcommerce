import React from 'react'
import { Building2, Eye, Edit2, Trash2 } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'

interface CompaniesTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  setDetailDrawerItem: (item: any) => void
  openEditModal: (item: any) => void
  setDeleteTarget: (item: any) => void
  toggleStatusMutation: any
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({
  records,
  isLoading,
  isFetching,
  visibleColumns,
  setDetailDrawerItem,
  openEditModal,
  setDeleteTarget,
  toggleStatusMutation,
}) => {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {visibleColumns.name && <th>Company Identity</th>}
                {visibleColumns.contact && <th>Contact Info</th>}
                {visibleColumns.taxNumber && <th>Tax ID (NPWP)</th>}
                {visibleColumns.location && <th>Headquarters Location</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={6} />
              ) : records.length === 0 ? (
                <EmptyState cols={6} message="No company entities found matching query parameters." />
              ) : (
                records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.name && (
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                            {r.name ? r.name.substring(0, 2) : 'CO'}
                          </div>
                          <div>
                            <p
                              onClick={() => setDetailDrawerItem(r)}
                              className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors text-sm"
                            >
                              {r.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{r.slug || r.code || 'enterprise-co'}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.contact && (
                      <td className="text-xs">
                        <p className="font-semibold text-foreground">{r.email || 'N/A'}</p>
                        <p className="text-muted-foreground">{r.phone || 'N/A'}</p>
                      </td>
                    )}
                    {visibleColumns.taxNumber && <td className="text-xs font-mono">{r.tax_number || 'N/A'}</td>}
                    {visibleColumns.location && (
                      <td className="text-xs">
                        {[r.city, r.province, r.country].filter(Boolean).join(', ') || 'N/A'}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleStatusMutation.mutate({ id: r.id, is_active: !r.is_active })}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <StatusBadge status={r.is_active} />
                        </button>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          onView={() => setDetailDrawerItem(r)}
                          onEdit={() => openEditModal(r)}
                          onDelete={() => setDeleteTarget(r)}
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

export default CompaniesTab
