import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { AppImage } from '@/components/common'
import { Star, Building2, Sparkles, Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TestimonialItem } from '../../types/cms.types'

interface TestimonialsTabProps {
  records: TestimonialItem[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: TestimonialItem) => void
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
}

export const TestimonialsTab: React.FC<TestimonialsTabProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditModal,
  confirmDelete,
  selectedRows = [],
  onToggleSelectAll,
  onToggleSelectRow,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const isAllSelected = records.length > 0 && selectedRows.length === records.length

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}
          />
        ))}
      </div>
    )
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
                {visibleColumns.author && <th className="text-left font-bold text-xs">{t('cms.colAuthor', 'Client / Customer')}</th>}
                {visibleColumns.feedback && <th className="text-left font-bold text-xs">{t('cms.colFeedback', 'Feedback / Review')}</th>}
                {visibleColumns.rating && <th className="text-left font-bold text-xs w-28">{t('cms.colRating', 'Rating')}</th>}
                {visibleColumns.featured && <th className="text-center font-bold text-xs w-28">{t('cms.colFeatured', 'Homepage')}</th>}
                {visibleColumns.status && <th className="text-left font-bold text-xs w-24">{t('cms.colStatus', 'Status')}</th>}
                {visibleColumns.actions && <th className="text-right font-bold text-xs w-20">{t('cms.colActions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <LoadingSkeleton cols={7} />
              ) : records.length === 0 ? (
                <EmptyState cols={7} message={t('cms.noTestimonials', 'No customer testimonials or reviews found.')} />
              ) : (
                records.map((r) => {
                  const isSelected = selectedRows.includes(r.id)
                  const avatarSrc = r.avatar || '/images/users/user-01.jpg'
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
                          aria-label={`Select testimonial ${r.id}`}
                        />
                      </td>
                      {visibleColumns.author && (
                        <td>
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0 bg-muted/60">
                              <AppImage
                                src={avatarSrc}
                                alt={r.author_name}
                                fallbackType="general"
                                fallbackSrc="/images/users/user-01.jpg"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p
                                onClick={() => openEditModal(r)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer text-sm group-hover:text-primary transition-colors truncate"
                              >
                                {r.author_name}
                              </p>
                              {(r.role || r.company) && (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                  <Building2 size={11} className="text-muted-foreground/70" />
                                  <span>{[r.role, r.company].filter(Boolean).join(' • ')}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.feedback && (
                        <td>
                          <div className="flex items-start gap-2 max-w-lg py-1">
                            <Quote size={13} className="text-primary shrink-0 mt-0.5 opacity-60" />
                            <p className="text-xs text-foreground/90 line-clamp-2 italic">
                              "{r.comment}"
                            </p>
                          </div>
                        </td>
                      )}
                      {visibleColumns.rating && (
                        <td>
                          {renderStars(r.rating || 5)}
                        </td>
                      )}
                      {visibleColumns.featured && (
                        <td className="text-center">
                          {r.is_featured ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Sparkles size={11} />
                              <span>Featured</span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
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
                            onEdit={() => openEditModal(r)}
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

export default TestimonialsTab
