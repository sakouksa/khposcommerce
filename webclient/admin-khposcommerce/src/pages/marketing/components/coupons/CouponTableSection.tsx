import React from 'react'
import { Copy, QrCode, Printer, Store, Globe, Layers, Barcode } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import type { Coupon } from '../../types/coupon'

interface CouponTableSectionProps {
  coupons: Coupon[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  setDetailDrawerCoupon: (coupon: Coupon) => void
  openEditModal: (coupon: Coupon) => void
  handleDuplicate: (coupon: Coupon) => void
  setDeleteTarget: (coupon: Coupon) => void
  toggleStatusMutation: any
  onOpenVerifier?: (coupon: Coupon) => void
}

export const CouponTableSection: React.FC<CouponTableSectionProps> = ({
  coupons = [],
  isLoading,
  isFetching,
  visibleColumns,
  setDetailDrawerCoupon,
  openEditModal,
  handleDuplicate,
  setDeleteTarget,
  toggleStatusMutation,
  onOpenVerifier,
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
                {visibleColumns.name && <th>Coupon Campaign</th>}
                {visibleColumns.code && <th>Code & Channel</th>}
                {visibleColumns.type && <th>Type</th>}
                {visibleColumns.value && <th>Discount Value</th>}
                {visibleColumns.minSpend && <th>Min Spend</th>}
                {visibleColumns.usageLimit && <th>Redemptions / Limit</th>}
                {visibleColumns.expiresAt && <th>Expiry Date</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={9} />
              ) : coupons.length === 0 ? (
                <EmptyState cols={9} message="No coupons or vouchers found matching query." />
              ) : (
                coupons.map((coupon) => {
                  const isExp = coupon.expires_at && new Date(coupon.expires_at) < new Date()
                  const isKhqr = coupon.payment_methods?.includes('khqr_bakong')
                  const maxUses = coupon.usage_limit || 100
                  const used = coupon.used_count || 0
                  const usagePercent = Math.min(100, Math.round((used / maxUses) * 100))

                  return (
                    <tr key={coupon.id} className="hover:bg-muted/40 transition-colors">
                      {visibleColumns.name && (
                        <td>
                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                onClick={() => setDetailDrawerCoupon(coupon)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors text-sm"
                              >
                                {coupon.name}
                              </p>
                              {isKhqr && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/10 text-red-600 border border-red-500/20">
                                  KHQR
                                </span>
                              )}
                            </div>
                            {coupon.batch_id && (
                              <p className="text-[10px] text-muted-foreground font-mono">Batch: {coupon.batch_id}</p>
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.code && (
                        <td>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              {coupon.code}
                            </span>
                            {renderChannelBadge(coupon.channel_scope)}
                          </div>
                        </td>
                      )}

                      {visibleColumns.type && (
                        <td className="capitalize text-xs font-medium">
                          <span className="bg-muted px-2 py-0.5 rounded border border-border">
                            {coupon.type?.replace('_', ' ')}
                          </span>
                        </td>
                      )}

                      {visibleColumns.value && (
                        <td>
                          <div className="font-bold text-foreground text-sm font-mono">
                            {coupon.type === 'percentage' ? (
                              <span>
                                {Number(coupon.value || 0)}% OFF
                                {coupon.max_discount_cap && (
                                  <span className="text-[10px] text-muted-foreground font-normal block">
                                    (Cap: ${Number(coupon.max_discount_cap || 0).toFixed(2)})
                                  </span>
                                )}
                              </span>
                            ) : coupon.type === 'fixed' ? (
                              <span>
                                {coupon.currency === 'KHR'
                                  ? `${Number(coupon.value || 0).toLocaleString()} ៛`
                                  : `$${Number(coupon.value || 0).toFixed(2)}`}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold">Free Delivery</span>
                            )}
                          </div>
                        </td>
                      )}

                      {visibleColumns.minSpend && (
                        <td className="text-xs font-mono">
                          {coupon.minimum_amount ? `$${Number(coupon.minimum_amount || 0).toFixed(2)}` : '$0.00'}
                          {coupon.minimum_amount_khr && (
                            <span className="text-[10px] text-muted-foreground block">
                              ~{Number(coupon.minimum_amount_khr || 0).toLocaleString()} ៛
                            </span>
                          )}
                        </td>
                      )}

                      {visibleColumns.usageLimit && (
                        <td className="text-xs">
                          <div className="space-y-1 min-w-[110px]">
                            <div className="flex justify-between font-mono text-[11px]">
                              <span className="font-bold text-foreground">{used} uses</span>
                              <span className="text-muted-foreground">{usagePercent}%</span>
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

                      {visibleColumns.expiresAt && (
                        <td className="text-xs font-mono">
                          {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                          {isExp && <span className="text-[10px] text-rose-500 font-bold block">Expired</span>}
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td>
                          <button
                            type="button"
                            onClick={() => toggleStatusMutation.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <StatusBadge status={isExp ? 'expired' : coupon.is_active ? 'active' : 'inactive'} />
                          </button>
                        </td>
                      )}

                      {visibleColumns.actions && (
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            onView={() => setDetailDrawerCoupon(coupon)}
                            onEdit={() => openEditModal(coupon)}
                            onDelete={() => setDeleteTarget(coupon)}
                            items={[
                              {
                                label: 'Scan & Verify',
                                icon: Barcode,
                                onClick: () => onOpenVerifier && onOpenVerifier(coupon),
                              },
                              {
                                label: 'Duplicate Voucher',
                                icon: Copy,
                                onClick: () => handleDuplicate(coupon),
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

export default CouponTableSection
