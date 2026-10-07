import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { FolderOpen, ArrowUp, ArrowDown, ArrowUpDown, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface BlogCategoriesTableProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: any) => void
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
}

export const BlogCategoriesTable: React.FC<BlogCategoriesTableProps> = ({
  records = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditModal,
  confirmDelete,
  selectedRows = [],
  onToggleSelectAll,
  onToggleSelectRow,
  sortBy = 'id',
  sortOrder = 'desc',
  onSort,
}) => {
  const { t } = useTranslation(['cms', 'common'])
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

  const colsCount = 1 + Object.values(visibleColumns).filter(Boolean).length

  return (
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
                    onClick={() => onSort?.('name')}
                    className={`text-left font-bold text-xs ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colCategoryName', 'Category Name')}</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                )}
                {visibleColumns.slug && (
                  <th
                    onClick={() => onSort?.('slug')}
                    className={`text-left font-bold text-xs ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colSlug', 'Slug')}</span>
                      {renderSortIcon('slug')}
                    </div>
                  </th>
                )}
                {visibleColumns.posts && (
                  <th
                    onClick={() => onSort?.('posts_count')}
                    className={`text-center font-bold text-xs w-28 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{t('cms.cardLinkedArticles', 'Posts Count')}</span>
                      {renderSortIcon('posts_count')}
                    </div>
                  </th>
                )}
                {visibleColumns.status && (
                  <th
                    onClick={() => onSort?.('is_active')}
                    className={`text-left font-bold text-xs w-28 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colStatus', 'Status')}</span>
                      {renderSortIcon('is_active')}
                    </div>
                  </th>
                )}
                {visibleColumns.actions && <th className="text-right font-bold text-xs w-20">{t('cms.colActions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <LoadingSkeleton cols={colsCount} />
              ) : records.length === 0 ? (
                <EmptyState cols={colsCount} message={t('cms.noCategories', 'No categories found')} />
              ) : (
                records.map((r) => {
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
                          aria-label={`Select category ${r.id}`}
                        />
                      </td>
                      {visibleColumns.title && (
                        <td>
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                              <FolderOpen size={18} />
                            </div>
                            <div className="min-w-0">
                              <p
                                onClick={() => openEditModal(r)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer text-sm group-hover:text-primary transition-colors"
                              >
                                {r.name}
                              </p>
                              {r.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-sm">
                                  {r.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.slug && (
                        <td>
                          <span className="font-mono text-xs text-muted-foreground bg-muted/60 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-border inline-block">
                            {r.slug}
                          </span>
                        </td>
                      )}
                      {visibleColumns.posts && (
                        <td className="text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                            <FileText size={12} />
                            <span>{r.posts_count ?? r.blogs_count ?? 0}</span>
                          </span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <StatusBadge status={r.is_active ? 'active' : 'inactive'} />
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

export { BlogCategoriesTable as BlogCategoriesTab }
export default BlogCategoriesTable
