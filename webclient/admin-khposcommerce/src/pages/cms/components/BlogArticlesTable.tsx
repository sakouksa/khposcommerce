import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { AppImage } from '@/components/common'
import { Calendar, Tag as TagIcon, Eye, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BlogDetailDrawer } from './BlogDetailDrawer'

export interface BlogArticlesTableProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal?: (item: any) => void
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
}

export const BlogArticlesTable: React.FC<BlogArticlesTableProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  confirmDelete,
  selectedRows = [],
  onToggleSelectAll,
  onToggleSelectRow,
  sortBy = 'id',
  sortOrder = 'desc',
  onSort,
}) => {
  const { t, i18n } = useTranslation(['cms', 'common'])
  const navigate = useNavigate()
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null)
  const currentLocale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  const handleEdit = (r: any) => {
    navigate(`/cms/blogs/${r.id}/edit`)
  }

  const handleView = (r: any) => {
    setSelectedBlog(r)
  }

  const isAllSelected = records.length > 0 && selectedRows.length === records.length

  const renderSortIcon = (columnKey: string) => {
    if (!onSort) return null
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={13} className="text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowDown size={13} className="text-primary shrink-0 transition-transform" />
      )
    }
    return (
      <ArrowUpDown
        size={13}
        className="opacity-0 group-hover:opacity-60 text-muted-foreground shrink-0 transition-opacity"
      />
    )
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
        <TableWrapper isFetching={isFetching}>
          <div className="overflow-x-auto">
            <table className="w-full data-table border-collapse">
              <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 select-none">
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
                  {visibleColumns.title && (
                    <th
                      onClick={() => onSort?.('title')}
                      className={`text-left font-bold text-xs min-w-[260px] max-w-md ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{t('cms.colHeadline')}</span>
                        {renderSortIcon('title')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.category && (
                    <th className="text-left font-bold text-xs whitespace-nowrap">{t('cms.colCategory')}</th>
                  )}
                  {visibleColumns.views && (
                    <th
                      onClick={() => onSort?.('views')}
                      className={`text-left font-bold text-xs whitespace-nowrap ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{t('cms.cardTotalViews')}</span>
                        {renderSortIcon('views')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.slug && (
                    <th className="text-left font-bold text-xs whitespace-nowrap">{t('cms.colSlug')}</th>
                  )}
                  {visibleColumns.status && (
                    <th
                      onClick={() => onSort?.('status')}
                      className={`text-left font-bold text-xs whitespace-nowrap ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{t('cms.colStatus')}</span>
                        {renderSortIcon('status')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.created_at && (
                    <th
                      onClick={() => onSort?.('created_at')}
                      className={`text-left font-bold text-xs whitespace-nowrap ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{t('common.date')}</span>
                        {renderSortIcon('created_at')}
                      </div>
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="text-right font-bold text-xs w-20 whitespace-nowrap">{t('cms.colActions')}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <LoadingSkeleton cols={8} />
                ) : records.length === 0 ? (
                  <EmptyState cols={8} message={t('cms.noBlogs')} />
                ) : (
                  records.map((r, idx) => {
                    const st = (r.status || 'published').toLowerCase()
                    const coverImage = r.featured_image || r.image || r.image_url
                    const blogIndex = typeof r.id === 'number' ? ((r.id - 1) % 10) + 1 : (idx % 10) + 1
                    const dynamicFallback = `/images/blogs/blog-${String(blogIndex).padStart(2, '0')}.jpg`
                    const categoryName =
                      r.blog_category?.name || r.category_name || r.category?.name || t('cms.general')
                    const isSelected = selectedRows.includes(r.id)
                    const views = Number(r.view_count ?? r.views_count ?? r.views ?? 0)
                    const dateVal = r.published_at || r.created_at

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
                            aria-label={`Select blog ${r.id}`}
                          />
                        </td>
                        {visibleColumns.title && (
                          <td className="max-w-md min-w-[260px]">
                            <div className="flex items-center gap-3.5 py-1.5">
                              <div
                                onClick={() => handleView(r)}
                                className="relative w-16 sm:w-20 h-11 sm:h-12 rounded-xl overflow-hidden border border-border/80 shrink-0 bg-muted/60 shadow-2xs cursor-pointer group-hover:border-primary/50 transition-colors"
                              >
                                <AppImage
                                  src={coverImage}
                                  alt={r.title}
                                  fallbackType="general"
                                  fallbackSrc={dynamicFallback}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="min-w-0 max-w-[280px] sm:max-w-[360px] lg:max-w-[450px] flex-1">
                                <p
                                  onClick={() => handleView(r)}
                                  className="font-bold text-foreground hover:text-primary cursor-pointer text-sm leading-snug group-hover:text-primary transition-colors truncate block"
                                  title={r.title}
                                >
                                  {r.title}
                                </p>
                                {r.excerpt ? (
                                  <p
                                    className="text-xs text-muted-foreground mt-0.5 truncate block leading-relaxed"
                                    title={r.excerpt}
                                  >
                                    {r.excerpt}
                                  </p>
                                ) : r.created_at ? (
                                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                                    <Calendar size={11} />
                                    <span>{new Date(r.created_at).toLocaleDateString(currentLocale)}</span>
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.category && (
                          <td>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border/70 whitespace-nowrap">
                              <TagIcon size={11} className="text-muted-foreground" />
                              <span>{categoryName}</span>
                            </span>
                          </td>
                        )}
                        {visibleColumns.views && (
                          <td>
                            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/50 whitespace-nowrap">
                              <Eye size={12} className="text-muted-foreground/70" />
                              <span>{views.toLocaleString()}</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.slug && (
                          <td className="py-2.5">
                            <span
                              className="font-mono text-xs text-muted-foreground bg-muted/60 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-border inline-block max-w-[200px] truncate select-all font-medium"
                              title={r.slug}
                            >
                              {r.slug}
                            </span>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="whitespace-nowrap">
                            <StatusBadge status={st} />
                          </td>
                        )}
                        {visibleColumns.created_at && (
                          <td>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                              <Calendar size={12} className="text-muted-foreground/60 shrink-0" />
                              <span>
                                {dateVal ? new Date(dateVal).toLocaleDateString(currentLocale) : '—'}
                              </span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="text-right" onClick={(e) => e.stopPropagation()}>
                            <TableActionMenu
                              onView={() => handleView(r)}
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

      {/* Blog Detail Drawer */}
      <BlogDetailDrawer
        isOpen={!!selectedBlog}
        onClose={() => setSelectedBlog(null)}
        blog={selectedBlog}
        onEdit={(item) => {
          setSelectedBlog(null)
          handleEdit(item)
        }}
      />
    </>
  )
}

export { BlogArticlesTable as BlogsTab, BlogArticlesTable as BlogsTable }
export default BlogArticlesTable
