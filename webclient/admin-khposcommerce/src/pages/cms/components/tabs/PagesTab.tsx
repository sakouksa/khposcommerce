import React from 'react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { FileCode, ShieldCheck, Globe, Eye, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface PagesTabProps {
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

export const PagesTab: React.FC<PagesTabProps> = ({
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

  const isPolicyPage = (slug: string, title: string) => {
    const text = (slug + ' ' + title).toLowerCase()
    return (
      text.includes('policy') ||
      text.includes('term') ||
      text.includes('warranty') ||
      text.includes('shipping') ||
      text.includes('return') ||
      text.includes('privacy') ||
      text.includes('គោលការណ៍')
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
                {visibleColumns.title && <th className="text-left font-bold text-xs">{t('cms.colPageTitle', 'Page Title & Structure')}</th>}
                {visibleColumns.slug && <th className="text-left font-bold text-xs">{t('cms.colSlug', 'Storefront Route')}</th>}
                {visibleColumns.category && <th className="text-left font-bold text-xs">{t('cms.colPageType', 'Type')}</th>}
                {visibleColumns.status && <th className="text-left font-bold text-xs">{t('cms.colStatus', 'Status')}</th>}
                {visibleColumns.actions && <th className="text-right font-bold text-xs w-20">{t('cms.colActions', 'Actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <LoadingSkeleton cols={6} />
              ) : records.length === 0 ? (
                <EmptyState cols={6} message={t('cms.noPages', 'No landing pages or store policies found.')} />
              ) : (
                records.map((r) => {
                  const isSelected = selectedRows.includes(r.id)
                  const isPolicy = isPolicyPage(r.slug || '', r.title || '')

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
                          aria-label={`Select page ${r.id}`}
                        />
                      </td>
                      {visibleColumns.title && (
                        <td>
                          <div className="flex items-center gap-3 py-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isPolicy
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
                            }`}>
                              {isPolicy ? <ShieldCheck size={18} /> : <FileCode size={18} />}
                            </div>
                            <div className="min-w-0">
                              <p
                                onClick={() => openEditModal(r)}
                                className="font-bold text-foreground hover:text-primary cursor-pointer text-sm group-hover:text-primary transition-colors"
                              >
                                {r.title}
                              </p>
                              {r.meta_title ? (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-sm">
                                  {r.meta_title}
                                </p>
                              ) : (
                                <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                                  <span>HTML / Rich Content</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.slug && (
                        <td>
                          <span className="font-mono text-xs text-muted-foreground bg-muted/60 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-border inline-flex items-center gap-1.5">
                            <Globe size={11} className="text-primary" />
                            <span>/{r.slug}</span>
                          </span>
                        </td>
                      )}
                      {visibleColumns.category && (
                        <td>
                          {isPolicy ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck size={11} />
                              <span>Store Policy</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              <FileCode size={11} />
                              <span>Landing Page</span>
                            </span>
                          )}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <StatusBadge status={(r.status || 'published').toLowerCase()} />
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

export default PagesTab
