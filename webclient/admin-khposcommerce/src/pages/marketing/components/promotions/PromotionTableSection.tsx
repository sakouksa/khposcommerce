import React from 'react'
import { Copy, Calculator, Store, Globe, Smartphone, CreditCard, Layers } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import type { Promotion } from '../../types/promotion'

interface PromotionTableSectionProps {
  promotions: Promotion[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  getPromoStatus: (p: Promotion) => 'running' | 'scheduled' | 'expired' | 'paused' | 'draft'
  setDetailDrawerPromo: (p: Promotion) => void
  openEditModal: (p: Promotion) => void
  handleDuplicate: (p: Promotion) => void
  setDeleteTarget: (p: Promotion) => void
  toggleStatusMutation: any
  onOpenSimulator?: (p?: Promotion) => void
}

export const PromotionTableSection: React.FC<PromotionTableSectionProps> = ({
  promotions = [],
  isLoading,
  isFetching,
  visibleColumns,
  getPromoStatus,
  setDetailDrawerPromo,
  openEditModal,
  handleDuplicate,
  setDeleteTarget,
  toggleStatusMutation,
  onOpenSimulator,
}) => {
  const renderChannelBadge = (scope?: string) => {
    if (scope === 'pos_only') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Store size={10} />
          <span>POS</span>
        </span>
      )
    }
    if (scope === 'storefront_only') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <Globe size={10} />
          <span>WEB</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Layers size={10} />
        <span>OMNI</span>
      </span>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {visibleColumns.name && <th>Promotion Campaign</th>}
                {visibleColumns.type && <th>Type & Channel</th>}
                {visibleColumns.priority && <th>Priority</th>}
                {visibleColumns.dates && <th>Schedule (Start - End)</th>}
                {visibleColumns.performance && <th>Orders & Usage</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={7} />
              ) : promotions.length === 0 ? (
                <EmptyState cols={7} message="No promotion rules found matching query." />
              ) : (
                promotions.map((p) => {
                  const st = getPromoStatus(p)
                  const conditions = p.conditions || {}
                  const isKhqrOnly = conditions.payment_methods?.includes('khqr_bakong')
                  const maxUses = p.max_redemptions || 500
                  const usedCount = p.orders_count || p.total_redemptions || 0
                  const usagePercent = Math.min(100, Math.round((usedCount / maxUses) * 100))

                  return (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      {visibleColumns.name && (
                        <td>
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                onClick={() => setDetailDrawerPromo(p)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors text-sm"
                              >
                                {p.name}
                              </p>
                              {isKhqrOnly && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/10 text-red-600 border border-red-500/20">
                                  KHQR
                                </span>
                              )}
                            </div>
                            {p.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.type && (
                        <td>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="capitalize text-xs font-semibold bg-muted px-2 py-0.5 rounded border border-border">
                              {p.type?.replace('_', ' ') || 'Discount'}
                            </span>
                            {renderChannelBadge(p.channel_scope)}
                          </div>
                        </td>
                      )}
                      {visibleColumns.priority && (
                        <td className="font-mono text-xs font-bold text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-md bg-muted/60">
                            {p.priority || 0}
                          </span>
                        </td>
                      )}
                      {visibleColumns.dates && (
                        <td className="text-xs font-mono">
                          <div>Starts: {p.starts_at ? new Date(p.starts_at).toLocaleDateString() : 'Immediate'}</div>
                          <div className="text-muted-foreground">Ends: {p.ends_at ? new Date(p.ends_at).toLocaleDateString() : 'Never'}</div>
                        </td>
                      )}
                      {visibleColumns.performance && (
                        <td className="text-xs">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex justify-between font-mono text-[11px]">
                              <span className="font-bold text-foreground">{usedCount} orders</span>
                              <span className="text-muted-foreground">{usagePercent}% cap</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-300"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <button
                            type="button"
                            onClick={() => toggleStatusMutation.mutate({ id: p.id, is_active: !p.is_active })}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <StatusBadge status={st} />
                          </button>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            onView={() => setDetailDrawerPromo(p)}
                            onEdit={() => openEditModal(p)}
                            onDelete={() => setDeleteTarget(p)}
                            items={[
                              {
                                label: 'Test in Simulator',
                                icon: Calculator,
                                onClick: () => onOpenSimulator && onOpenSimulator(p),
                              },
                              {
                                label: 'Duplicate Rule',
                                icon: Copy,
                                onClick: () => handleDuplicate(p),
                              },
                            ]}
                          />
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default PromotionTableSection
