import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Copy,
  Check
} from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { formatCurrency } from '@/utils/formatters'
import { useToast } from '@/hooks/useToast'

interface CategoriesTabProps {
  categories: any[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  openEditDrawer: (row: any) => void
  handleDelete: (id: number, name?: string) => void
  renderSortIcon?: (col: string) => React.ReactNode
  handleSort?: (col: string) => void
  selectedRows?: number[]
  handleSelectRow?: (id: number) => void
  handleSelectAll?: (allIds: number[]) => void
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories = [],
  isLoading,
  isFetching,
  visibleColumns,
  openEditDrawer,
  handleDelete,
  renderSortIcon,
  handleSort,
  selectedRows = [],
  handleSelectRow,
  handleSelectAll,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const toast = useToast()
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(t('finance.code_copied', 'Category code copied to clipboard.'))
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const allCategoryIds = React.useMemo(() => {
    return categories.map((c: any) => c.id)
  }, [categories])

  const isAllSelected = allCategoryIds.length > 0 && allCategoryIds.every((id: number) => selectedRows.includes(id) || selectedRows.includes(Number(id)))
  const isSomeSelected = allCategoryIds.some((id: number) => selectedRows.includes(id) || selectedRows.includes(Number(id))) && !isAllSelected

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
              <tr>
                {/* Checkbox Column for Bulk Selection */}
                {handleSelectAll && (
                  <th className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected
                      }}
                      onChange={() => handleSelectAll(allCategoryIds)}
                      className="checkbox h-4 w-4 rounded border-border text-primary focus:ring-primary/30 transition-all cursor-pointer"
                    />
                  </th>
                )}

                {/* Category Name Column */}
                {visibleColumns.category_name && (
                  <th
                    onClick={() => handleSort?.('name')}
                    className={`py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-muted-foreground select-none ${
                      handleSort ? 'cursor-pointer hover:text-foreground transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('finance.category_name', 'Category Name')}</span>
                      {renderSortIcon?.('name')}
                    </div>
                  </th>
                )}

                {/* Code Column */}
                {visibleColumns.category_code && (
                  <th
                    onClick={() => handleSort?.('code')}
                    className={`py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-muted-foreground select-none ${
                      handleSort ? 'cursor-pointer hover:text-foreground transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('finance.code_col', 'Code')}</span>
                      {renderSortIcon?.('code')}
                    </div>
                  </th>
                )}

                {/* Transactions Count Column */}
                {visibleColumns.category_transactions && (
                  <th
                    onClick={() => handleSort?.('expenses_count')}
                    className={`py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-muted-foreground select-none ${
                      handleSort ? 'cursor-pointer hover:text-foreground transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('finance.transactions_count_col', 'Transactions')}</span>
                      {renderSortIcon?.('expenses_count')}
                    </div>
                  </th>
                )}

                {/* Total Spent Amount Column */}
                {visibleColumns.category_total_spent && (
                  <th
                    onClick={() => handleSort?.('total_expense_amount')}
                    className={`py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-muted-foreground select-none ${
                      handleSort ? 'cursor-pointer hover:text-foreground transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('finance.total_spent_col', 'Total Spent')}</span>
                      {renderSortIcon?.('total_expense_amount')}
                    </div>
                  </th>
                )}

                {/* Status Column */}
                {visibleColumns.category_status && (
                  <th
                    onClick={() => handleSort?.('is_active')}
                    className={`py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-muted-foreground select-none ${
                      handleSort ? 'cursor-pointer hover:text-foreground transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('finance.status_col', 'Status')}</span>
                      {renderSortIcon?.('is_active')}
                    </div>
                  </th>
                )}

                {/* Action Column */}
                <th className="py-3.5 px-4 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  {t('finance.actions_col', t('common.actions', 'Actions'))}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <LoadingSkeleton cols={7} />
              ) : categories.length === 0 ? (
                <EmptyState cols={7} message={t('finance.no_data_categories', 'No expense categories found.')} />
              ) : (
                categories.map((row: any) => {
                  const isSelected = selectedRows.includes(row.id) || selectedRows.includes(Number(row.id))
                  const expensesCount = row.expenses_count ?? 0
                  const totalSpent = parseFloat(row.total_expense_amount ?? row.expenses_sum_amount ?? '0')

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-muted/40 transition-colors group ${
                        isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      {handleSelectRow && (
                        <td
                          className="w-10 px-4 py-3.5 text-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectRow(row.id)
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleSelectRow(row.id)}
                            className="checkbox h-4 w-4 rounded border-border text-primary focus:ring-primary/30 transition-all cursor-pointer"
                          />
                        </td>
                      )}

                      {/* Category Name */}
                      {visibleColumns.category_name && (
                        <td className="px-4 py-3.5">
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-foreground block truncate group-hover:text-primary transition-colors">
                              {row.name}
                            </span>
                            {row.description && (
                              <span className="text-[11px] text-muted-foreground font-normal truncate block mt-0.5 max-w-md">
                                {row.description}
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Category Code */}
                      {visibleColumns.category_code && (
                        <td className="px-4 py-3.5">
                          {row.code ? (
                            <button
                              type="button"
                              onClick={(e) => handleCopy(row.code, e)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border/80 transition-colors group/btn cursor-pointer"
                              title="Click to copy code"
                            >
                              <span>{row.code}</span>
                              {copiedCode === row.code ? (
                                <Check size={11} className="text-emerald-500" />
                              ) : (
                                <Copy size={11} className="text-muted-foreground opacity-40 group-hover/btn:opacity-100 transition-opacity" />
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">-</span>
                          )}
                        </td>
                      )}

                      {/* Transactions Count */}
                      {visibleColumns.category_transactions && (
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            expensesCount > 0
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted/60 text-muted-foreground border border-border/60'
                          }`}>
                            <span>
                              {expensesCount} {t('finance.transactions_unit', 'Entries')}
                            </span>
                          </span>
                        </td>
                      )}

                      {/* Total Spent Amount */}
                      {visibleColumns.category_total_spent && (
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-foreground">
                          {totalSpent > 0 ? (
                            formatCurrency(totalSpent)
                          ) : (
                            <span className="text-muted-foreground">$0.00</span>
                          )}
                        </td>
                      )}

                      {/* Status Badge */}
                      {visibleColumns.category_status && (
                        <td className="px-4 py-3.5">
                          <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
                        </td>
                      )}

                      {/* Action Menu */}
                      <td className="px-4 py-3.5 text-right">
                        <TableActionMenu
                          onEdit={() => openEditDrawer(row)}
                          onDelete={expensesCount > 0 ? undefined : () => handleDelete(row.id, row.name)}
                        />
                      </td>
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

export default CategoriesTab
