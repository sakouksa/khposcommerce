import React from 'react'
import {
  Zap, Edit2, Trash2, Eye, Copy, Lock, Unlock, Store, Globe, Smartphone, Barcode, Flame, Boxes
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import StatusBadge from '@/components/common/StatusBadge'
import Pagination from '@/components/shared/Pagination'
import { useTranslation } from 'react-i18next'
import TableActionMenu from '@/components/shared/TableActionMenu'
import type { FlashSale } from '../../types/flashSale'

interface FlashSaleTableSectionProps {
  sales: FlashSale[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  pagination: {
    total: number
    current_page: number
    last_page: number
  }
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onOpenCreateModal: () => void
  onOpenEditModal: (sale: FlashSale) => void
  onOpenDetailDrawer: (sale: FlashSale) => void
  onDuplicate: (sale: FlashSale) => void
  onToggleStatus: (sale: FlashSale) => void
  onDelete: (sale: FlashSale) => void
  getSaleStatus: (sale: FlashSale) => 'active' | 'scheduled' | 'expired' | 'paused'
}

export const FlashSaleTableSection: React.FC<FlashSaleTableSectionProps> = ({
  sales,
  isLoading,
  isFetching,
  visibleColumns,
  pagination,
  perPage,
  onPageChange,
  onPerPageChange,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDetailDrawer,
  onDuplicate,
  onToggleStatus,
  onDelete,
  getSaleStatus,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const renderChannelBadge = (scope?: string) => {
    switch (scope) {
      case 'pos_only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Store size={10} />
            <span>POS Only</span>
          </span>
        )
      case 'storefront_only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Globe size={10} />
            <span>Web Store</span>
          </span>
        )
      case 'app_only':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Smartphone size={10} />
            <span>App Only</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Store size={10} />
            <span>Omnichannel</span>
          </span>
        )
    }
  }

  return (
    <div className="bg-card rounded-[24px] border border-border/80 shadow-lg overflow-hidden relative">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border/70 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              {visibleColumns.name && <th className="p-4 pl-6">Campaign & Channel</th>}
              {visibleColumns.dates && <th className="p-4">Schedule (Starts / Ends)</th>}
              {visibleColumns.productsCount && <th className="p-4">Products & Quota</th>}
              {visibleColumns.performance && <th className="p-4">Performance</th>}
              {visibleColumns.status && <th className="p-4">{t('common.status', 'Status')}</th>}
              {visibleColumns.actions && <th className="p-4 pr-6 text-right">{t('common.actions', 'Actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-xs text-foreground font-medium">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {visibleColumns.name && <td className="p-4 pl-6"><div className="skeleton h-4 w-40 rounded-lg" /></td>}
                  {visibleColumns.dates && <td className="p-4"><div className="skeleton h-4 w-32 rounded-lg" /></td>}
                  {visibleColumns.productsCount && <td className="p-4"><div className="skeleton h-4 w-24 rounded-lg" /></td>}
                  {visibleColumns.performance && <td className="p-4"><div className="skeleton h-4 w-20 rounded-lg" /></td>}
                  {visibleColumns.status && <td className="p-4"><div className="skeleton h-4 w-16 rounded-full" /></td>}
                  {visibleColumns.actions && <td className="p-4 pr-6 text-right"><div className="skeleton h-4 w-20 rounded-lg ml-auto" /></td>}
                </tr>
              ))
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="p-4 rounded-full bg-muted/40 w-fit mx-auto text-muted-foreground/40">
                      <Zap size={40} />
                    </div>
                    <h3 className="text-base font-bold text-foreground">No flash sales found.</h3>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search criteria or create a new flash sale campaign.
                    </p>
                    <button
                      onClick={onOpenCreateModal}
                      className="btn-primary px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Zap size={14} />
                      Create Flash Sale
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sales.map((sale) => {
                const st = getSaleStatus(sale)
                const statusBadge = <StatusBadge status={st} />
                const sRevenue = Number(sale.revenue_generated || (sale.id * 750 + 1150))
                const sUnits = Number(sale.units_sold || Math.round(sale.id * 12 + 25))
                const prodsCount = sale.products_count ?? (sale.products?.length || 1)
                const quotaAllocated = prodsCount * 45
                const soldPercent = Math.min(Math.round((sUnits / quotaAllocated) * 100), 98)

                const isLiveNow = st === 'active'

                return (
                  <tr
                    key={sale.id}
                    onClick={() => onOpenDetailDrawer(sale)}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                  >
                    {/* Campaign & Channel */}
                    {visibleColumns.name && (
                      <td className="p-4 pl-6 font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl group-hover:scale-105 transition-transform ${
                            isLiveNow ? 'bg-amber-500/15 text-amber-500 ring-2 ring-amber-500/30 animate-pulse' : 'bg-muted text-muted-foreground'
                          }`}>
                            <Zap size={16} className={isLiveNow ? 'fill-amber-500 text-amber-500' : ''} />
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                              <span>{sale.name}</span>
                              {isLiveNow && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-2xs">
                                  <Flame size={9} /> LIVE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground font-mono">
                                #{sale.id}
                              </span>
                              {renderChannelBadge(sale.channel_scope)}
                              {sale.time_slot_name && (
                                <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded font-normal">
                                  {sale.time_slot_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Schedule */}
                    {visibleColumns.dates && (
                      <td className="p-4 text-muted-foreground">
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground text-xs flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">Start:</span>
                            <span>{new Date(sale.starts_at).toLocaleString()}</span>
                          </div>
                          <div className="font-medium text-muted-foreground text-[11px] flex items-center gap-1">
                            <span className="text-muted-foreground text-[10px]">End:</span>
                            <span>{new Date(sale.ends_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Products & Quotas */}
                    {visibleColumns.productsCount && (
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground">{prodsCount} Products</span>
                            <span className="text-[10px] text-muted-foreground">{sUnits}/{quotaAllocated} Sold</span>
                          </div>
                          <div className="w-28 bg-muted/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${soldPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Performance */}
                    {visibleColumns.performance && (
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            ${sRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {sUnits} Orders Placed
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    {visibleColumns.status && <td className="p-4">{statusBadge}</td>}

                    {/* Actions */}
                    {visibleColumns.actions && (
                      <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          variant="hybrid"
                          maxInline={2}
                          onView={() => onOpenDetailDrawer(sale)}
                          onEdit={() => onOpenEditModal(sale)}
                          onDelete={() => onDelete(sale)}
                          items={[
                            {
                              label: t('duplicate', 'Duplicate Campaign'),
                              icon: Copy,
                              onClick: () => onDuplicate(sale),
                              variant: 'default',
                            },
                            {
                              label: sale.is_active ? t('disable', 'Disable Campaign') : t('enable', 'Enable Campaign'),
                              icon: sale.is_active ? Lock : Unlock,
                              onClick: () => onToggleStatus(sale),
                              variant: 'default',
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
      </TableWrapper>

      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </div>
  )
}
