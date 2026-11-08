import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { HelpCircle, Folder, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface FaqsHelpTableProps {
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

export type FaqsTabProps = FaqsHelpTableProps
export type FaqsTableProps = FaqsHelpTableProps

export const FaqsHelpTable: React.FC<FaqsHelpTableProps> = ({
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
                    onClick={() => onSort?.('question')}
                    className={`text-left font-bold text-xs ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colQuestionAnswer', 'Question & Answer')}</span>
                      {renderSortIcon('question')}
                    </div>
                  </th>
                )}
                {visibleColumns.category && (
                  <th
                    onClick={() => onSort?.('category')}
                    className={`text-left font-bold text-xs ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colCategory', 'Category')}</span>
                      {renderSortIcon('category')}
                    </div>
                  </th>
                )}
                {visibleColumns.sortOrder && (
                  <th
                    onClick={() => onSort?.('sort_order')}
                    className={`text-left font-bold text-xs w-28 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colOrder', 'Display Order')}</span>
                      {renderSortIcon('sort_order')}
                    </div>
                  </th>
                )}
                {visibleColumns.status && (
                  <th
                    onClick={() => onSort?.('status')}
                    className={`text-left font-bold text-xs w-28 ${onSort ? 'cursor-pointer hover:bg-muted/60 transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('cms.colStatus', 'Status')}</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>
                )}
                {visibleColumns.actions && (
                  <th className="text-right font-bold text-xs w-20">{t('cms.colActions', 'Actions')}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <LoadingSkeleton cols={colsCount} />
              ) : records.length === 0 ? (
                <EmptyState cols={colsCount} message={t('cms.noFaqs', 'No FAQs or help articles found')} />
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
                          aria-label={`Select FAQ ${r.id}`}
                        />
                      </td>
                      {visibleColumns.title && (
                        <td>
                          <div className="flex items-start gap-3 py-1">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20 mt-0.5">
                              <HelpCircle size={17} />
                            </div>
                            <div className="min-w-0">
                              <p
                                onClick={() => openEditModal(r)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer text-sm group-hover:text-primary transition-colors"
                              >
                                {r.question || r.title}
                              </p>
                              {(r.answer || r.content) && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 max-w-lg leading-relaxed">
                                  {r.answer || r.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.category && (
                        <td>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border/70">
                            <Folder size={11} className="text-muted-foreground" />
                            <span>{r.category || t('cms.general', 'General')}</span>
                          </span>
                        </td>
                      )}
                      {visibleColumns.sortOrder && (
                        <td>
                          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold border border-border/50">
                            #{r.sort_order ?? 0}
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

export { FaqsHelpTable as FaqsTab, FaqsHelpTable as FaqsTable }
export default FaqsHelpTable
