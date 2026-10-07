import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { AppImage } from '@/components/common'
import { Calendar, Tag as TagIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BlogDetailDrawer } from '../BlogDetailDrawer'

interface BlogsTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal?: (item: any) => void
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
}

export const BlogsTab: React.FC<BlogsTabProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  confirmDelete,
  selectedRows = [],
  onToggleSelectAll,
  onToggleSelectRow,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const navigate = useNavigate()
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null)

  const handleEdit = (r: any) => {
    navigate(`/cms/blogs/${r.id}/edit`)
  }

  const handleView = (r: any) => {
    setSelectedBlog(r)
  }

  const isAllSelected = records.length > 0 && selectedRows.length === records.length

  return (
    <>
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
                  {visibleColumns.title && <th className="text-left font-bold text-xs">{t('cms.colHeadline', 'Article Headline')}</th>}
                  {visibleColumns.slug && <th className="text-left font-bold text-xs">{t('cms.colSlug', 'URL Slug')}</th>}
                  {visibleColumns.category && <th className="text-left font-bold text-xs">{t('cms.colCategory', 'Category')}</th>}
                  {visibleColumns.status && <th className="text-left font-bold text-xs">{t('cms.colStatus', 'Status')}</th>}
                  {visibleColumns.actions && <th className="text-right font-bold text-xs w-20">{t('cms.colActions', 'Actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <LoadingSkeleton cols={6} />
                ) : records.length === 0 ? (
                  <EmptyState cols={6} message={t('cms.noBlogs', 'No blog articles found matching query.')} />
                ) : (
                  records.map((r, idx) => {
                    const st = (r.status || 'published').toLowerCase()
                    const coverImage = r.featured_image || r.image || r.image_url
                    const blogIndex = typeof r.id === 'number' ? ((r.id - 1) % 10) + 1 : (idx % 10) + 1
                    const dynamicFallback = `/images/blogs/blog-${String(blogIndex).padStart(2, '0')}.jpg`
                    const categoryName = r.blog_category?.name || r.category_name || r.category?.name || t('cms.general', 'General')
                    const isSelected = selectedRows.includes(r.id)

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
                          <td>
                            <div className="flex items-center gap-3.5 py-1">
                              <div
                                onClick={() => handleView(r)}
                                className="relative w-16 sm:w-20 h-11 sm:h-12 rounded-xl overflow-hidden border border-border/80 shrink-0 bg-muted/60 shadow-2xs cursor-pointer"
                              >
                                <AppImage
                                  src={coverImage}
                                  alt={r.title}
                                  fallbackType="general"
                                  fallbackSrc={dynamicFallback}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="min-w-0">
                                <p
                                  onClick={() => handleView(r)}
                                  className="font-bold text-foreground hover:text-primary cursor-pointer text-sm line-clamp-1 group-hover:text-primary transition-colors"
                                >
                                  {r.title}
                                </p>
                                {r.excerpt ? (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-md">
                                    {r.excerpt}
                                  </p>
                                ) : r.created_at ? (
                                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Calendar size={11} />
                                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.slug && (
                          <td>
                            <span className="font-mono text-xs text-muted-foreground bg-muted/60 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-border inline-block max-w-[220px] truncate">
                              {r.slug}
                            </span>
                          </td>
                        )}
                        {visibleColumns.category && (
                          <td>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border/70">
                              <TagIcon size={11} className="text-muted-foreground" />
                              <span>{categoryName}</span>
                            </span>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td>
                            <StatusBadge status={st} />
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
      />
    </>
  )
}

export default BlogsTab
