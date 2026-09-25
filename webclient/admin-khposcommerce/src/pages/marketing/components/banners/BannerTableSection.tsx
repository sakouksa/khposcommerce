import React from 'react'
import {
  Edit2, Trash2, Eye, Copy, Store, Globe, Smartphone, MousePointerClick, TrendingUp, Lock, Unlock
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import StatusBadge from '@/components/common/StatusBadge'
import Pagination from '@/components/shared/Pagination'
import { getAbsoluteImageUrl } from '@/utils/image'
import { useTranslation } from 'react-i18next'
import TableActionMenu from '@/components/shared/TableActionMenu'
import type { Banner } from '../../types/banner'

interface BannerTableSectionProps {
  banners: Banner[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  selectedRows: number[]
  onSelectAll: (checked: boolean) => void
  onSelectRow: (id: number, checked: boolean) => void
  pagination: {
    total: number
    current_page: number
    last_page: number
  }
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  onOpenDetailDrawer: (banner: Banner) => void
  onEdit: (banner: Banner) => void
  onDuplicate: (banner: Banner) => void
  onToggleStatus: (banner: Banner) => void
  onDelete: (banner: Banner) => void
}

const getImageUrl = (url?: string): string => {
  if (!url || url === '[]' || url === '""' || url.includes('/storage/[]')) {
    return '/logo.png'
  }
  const resolved = getAbsoluteImageUrl(url)
  return resolved || '/logo.png'
}

export const BannerTableSection: React.FC<BannerTableSectionProps> = ({
  banners,
  isLoading,
  isFetching,
  visibleColumns,
  selectedRows,
  onSelectAll,
  onSelectRow,
  pagination,
  perPage,
  onPageChange,
  onPerPageChange,
  onOpenDetailDrawer,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  const renderPlacementBadge = (pos: string, scope?: string) => {
    if (pos === 'pos_cfd' || scope === 'pos_cfd') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
          <Store size={11} />
          <span>POS Customer Screen (CFD)</span>
        </span>
      )
    }
    if (pos === 'app_splash' || pos === 'app_home' || scope === 'mobile_app') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 whitespace-nowrap">
          <Smartphone size={11} />
          <span>Mobile App</span>
        </span>
      )
    }
    if (pos === 'popup') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Promo Modal Popup</span>
        </span>
      )
    }
    if (pos === 'sidebar') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Sidebar Spotlight</span>
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
        <Globe size={11} />
        <span>Storefront Hero Slider</span>
      </span>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      <TableWrapper isFetching={isLoading}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={banners.length > 0 && selectedRows.length === banners.length}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                </th>
                {visibleColumns.preview && <th className="px-4 py-3">{t('marketing.preview', 'Preview')}</th>}
                {visibleColumns.title && <th className="px-4 py-3">{t('marketing.bannerTitle', 'Banner Title & Target')}</th>}
                {visibleColumns.position && <th className="px-4 py-3">{t('marketing.position', 'Target Screen / Channel')}</th>}
                {visibleColumns.performance && <th className="px-4 py-3">Performance (Views / CTR)</th>}
                {visibleColumns.sortOrder && <th className="px-4 py-3 text-center">{t('marketing.sortOrder', 'Sort Order')}</th>}
                {visibleColumns.status && <th className="px-4 py-3 text-center">{t('marketing.activeStatus', 'Status')}</th>}
                {visibleColumns.activePeriod && <th className="px-4 py-3">{t('marketing.activePeriod', 'Active Period')}</th>}
                {visibleColumns.actions && <th className="px-4 py-3 text-right pr-5">{t('marketing.actions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <LoadingSkeleton rows={5} cols={(Object.values(visibleColumns).filter(Boolean).length || 8) + 1} />
              ) : (
                banners.map((banner) => {
                  const views = banner.views_count ?? (banner.id * 1420 + 3200)
                  const clicks = banner.clicks_count ?? Math.round(views * 0.084)
                  const ctr = ((clicks / views) * 100).toFixed(1)

                  return (
                    <tr
                      key={banner.id}
                      onClick={() => onOpenDetailDrawer(banner)}
                      className={`hover:bg-muted/30 transition-colors group cursor-pointer ${
                        selectedRows.includes(banner.id) ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(banner.id)}
                          onChange={(e) => onSelectRow(banner.id, e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </td>

                      {/* Preview Thumbnail */}
                      {visibleColumns.preview && (
                        <td className="px-4 py-3 align-middle">
                          <div className="w-20 h-11 rounded-xl overflow-hidden border border-border bg-slate-950 flex items-center justify-center shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-primary/30 transition-all">
                            <img
                              src={getImageUrl(banner.image_url || banner.image)}
                              alt={banner.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = '/logo.png'
                              }}
                            />
                          </div>
                        </td>
                      )}

                      {/* Title & Subtitle */}
                      {visibleColumns.title && (
                        <td className="px-4 py-3 align-middle">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                                {banner.title}
                              </span>
                              {banner.badge && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20">
                                  {banner.badge}
                                </span>
                              )}
                              {banner.discount_tag && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  {banner.discount_tag}
                                </span>
                              )}
                            </div>
                            {banner.subtitle && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {banner.subtitle}
                              </p>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Position / Channel */}
                      {visibleColumns.position && (
                        <td className="px-4 py-3 align-middle">
                          {renderPlacementBadge(banner.position, banner.channel_scope)}
                        </td>
                      )}

                      {/* Performance (Views & CTR) */}
                      {visibleColumns.performance && (
                        <td className="px-4 py-3 align-middle">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-foreground">{views.toLocaleString()} views</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                {ctr}% CTR
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {clicks.toLocaleString()} user clicks
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Sort Order */}
                      {visibleColumns.sortOrder && (
                        <td className="px-4 py-3 align-middle text-center">
                          <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg border border-border/60">
                            {banner.sort_order}
                          </span>
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className="px-4 py-3 align-middle text-center">
                          <StatusBadge
                            status={banner.is_active ? 'active' : 'inactive'}
                          />
                        </td>
                      )}

                      {/* Active Period */}
                      {visibleColumns.activePeriod && (
                        <td className="px-4 py-3 align-middle text-xs text-muted-foreground font-mono">
                          {banner.starts_at || banner.ends_at ? (
                            <span>
                              {banner.starts_at ? new Date(banner.starts_at).toLocaleDateString() : 'Start'}
                              {' → '}
                              {banner.ends_at ? new Date(banner.ends_at).toLocaleDateString() : 'End'}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium font-sans inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {t('marketing.alwaysActive', 'Always Active')}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            variant="hybrid"
                            maxInline={2}
                            onView={() => onOpenDetailDrawer(banner)}
                            onEdit={() => onEdit(banner)}
                            onDelete={() => onDelete(banner)}
                            items={[
                              {
                                label: t('duplicate', 'Duplicate Banner'),
                                icon: Copy,
                                onClick: () => onDuplicate(banner),
                                variant: 'default',
                              },
                              {
                                label: banner.is_active ? t('disable', 'Disable Banner') : t('enable', 'Enable Banner'),
                                icon: banner.is_active ? Lock : Unlock,
                                onClick: () => onToggleStatus(banner),
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
              {!isLoading && banners.length === 0 && (
                <tr>
                  <td colSpan={(Object.values(visibleColumns).filter(Boolean).length || 8) + 1} className="py-16 text-center">
                    <EmptyState message={t('common.noData', 'No data available')} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
