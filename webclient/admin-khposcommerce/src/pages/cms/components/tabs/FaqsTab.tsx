import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { HelpCircle, Folder } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FaqsTabProps {
  records: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditModal: (item: any) => void
  confirmDelete: (id: number) => void
  selectedRows?: number[]
  onToggleSelectAll?: () => void
  onToggleSelectRow?: (id: number) => void
}

export const FaqsTab: React.FC<FaqsTabProps> = ({
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
                {visibleColumns.title && <th className="text-left font-bold text-xs">{t('cms.colQuestionAnswer', 'Question & Answer')}</th>}
                {visibleColumns.category && <th className="text-left font-bold text-xs">{t('cms.colCategory', 'Category')}</th>}
                {visibleColumns.status && <th className="text-left font-bold text-xs">{t('cms.colStatus', 'Status')}</th>}
                {visibleColumns.actions && <th className="text-right font-bold text-xs w-20">{t('cms.colActions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <LoadingSkeleton cols={5} />
              ) : records.length === 0 ? (
                <EmptyState cols={5} message={t('cms.noFaqs', 'No FAQs found.')} />
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
                                {r.question}
                              </p>
                              {r.answer && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 max-w-lg leading-relaxed">
                                  {r.answer}
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

export default FaqsTab
