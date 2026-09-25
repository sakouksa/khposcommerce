import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { AppImage } from '@/components/common'
import { Calendar, Layers, Link as LinkIcon, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAbsoluteImageUrl } from '@/utils/image'
import type { BannerItem } from '../../types/cms.types'

interface BannersTabProps {
  records: BannerItem[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal?: (item: BannerItem) => void
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
}

export const BannersTab: React.FC<BannersTabProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  confirmDelete,
  selectedRows = [],
  onToggleSelectAll,
  onToggleSelectRow,
}) => {
  const { t } = useTranslation(['cms', 'common', 'marketing'])
  const navigate = useNavigate()

  const handleEdit = (r: BannerItem) => {
    navigate(`/cms/banners/${r.id}/edit`)
  }

  const isAllSelected = records.length > 0 && selectedRows.length === records.length

  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case 'hero':
      case 'home_hero':
        return { label: t('marketing.posHero', 'Hero Slider (Top)'), color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' }
      case 'sidebar':
      case 'spotlight':
      case 'home_secondary':
        return { label: t('marketing.posSpotlight', 'Spotlight 4-Deals'), color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
      case 'popup':
        return { label: t('marketing.posPopup', 'Promotional Popup'), color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
      case 'footer':
        return { label: t('marketing.posFooter', 'Footer Banner'), color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
      default:
        return { label: pos || 'General', color: 'bg-muted text-foreground border-border' }
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                <th className="w-10 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                    aria-label="Select all"
                  />
                </th>
                {visibleColumns.title && <th className="text-left font-bold text-xs">{t('cms.colBannerTitle', 'Banner & Creative')}</th>}
                {visibleColumns.position && <th className="text-left font-bold text-xs">{t('cms.colPosition', 'Placement')}</th>}
                {visibleColumns.sortOrder && <th className="text-center font-bold text-xs w-20">{t('cms.colOrder', 'Priority')}</th>}
                {visibleColumns.status && <th className="text-left font-bold text-xs">{t('cms.colStatus', 'Status')}</th>}
                {visibleColumns.actions && <th className="text-right font-bold text-xs w-20">{t('cms.colActions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <LoadingSkeleton cols={6} />
              ) : records.length === 0 ? (
                <EmptyState cols={6} message={t('cms.noBanners', 'No banners or hero promotions found.')} />
              ) : (
                records.map((r) => {
                  const isSelected = selectedRows.includes(r.id)
                  const img = r.image || r.image_url || '/images/banners/banner-01.jpg'
                  const resolvedImg = getAbsoluteImageUrl(img)
                  const posMeta = getPositionLabel(r.position)
                  const isActive = r.is_active !== false

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-muted/40 transition-colors group ${
                        isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      <td className="w-10 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectRow?.(r.id)}
                          className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
                          aria-label={`Select banner ${r.id}`}
                        />
                      </td>
                      {visibleColumns.title && (
                        <td>
                          <div className="flex items-center gap-3.5 py-1">
                            <div
                              onClick={() => handleEdit(r)}
                              className="relative w-24 sm:w-28 h-12 sm:h-14 rounded-xl overflow-hidden border border-border/80 shrink-0 bg-muted/60 shadow-2xs cursor-pointer"
                            >
                              <AppImage
                                src={resolvedImg}
                                alt={r.title}
                                fallbackType="general"
                                fallbackSrc="/images/banners/banner-01.jpg"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {r.discount_tag && (
                                <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                  {r.discount_tag}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  onClick={() => handleEdit(r)}
                                  className="font-bold text-foreground hover:text-primary cursor-pointer text-sm line-clamp-1 group-hover:text-primary transition-colors"
                                >
                                  {r.title}
                                </p>
                                {r.badge && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                                    <Sparkles size={10} />
                                    {r.badge}
                                  </span>
                                )}
                              </div>
                              {r.subtitle && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-md">
                                  {r.subtitle}
                                </p>
                              )}
                              {(r.link || r.link_url) && (
                                <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5 truncate max-w-sm">
                                  <LinkIcon size={10} className="text-primary" />
                                  <span className="truncate">{r.link || r.link_url}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.position && (
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${posMeta.color}`}>
                            <Layers size={11} />
                            <span>{posMeta.label}</span>
                          </span>
                        </td>
                      )}
                      {visibleColumns.sortOrder && (
                        <td className="text-center">
                          <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/60 dark:bg-slate-800 px-2 py-1 rounded-md border border-border inline-block min-w-[28px]">
                            {r.sort_order ?? 0}
                          </span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <StatusBadge status={isActive ? 'active' : 'inactive'} />
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            onEdit={() => handleEdit(r)}
                            onDelete={() => confirmDelete(r.id)}
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

export default BannersTab
