import React from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { translateString } from '@/lib/i18n'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '../feedback/EmptyState'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string
  title: React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  className?: string
  headerClassName?: string
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey?: keyof T | ((row: T) => string | number)
  loading?: boolean
  isFetching?: boolean
  emptyText?: React.ReactNode
  emptyDescription?: React.ReactNode
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string, dir: 'asc' | 'desc') => void
  onRowClick?: (row: T, index: number) => void
  rowClassName?: (row: T, index: number) => string
  footer?: React.ReactNode
  className?: string
  stickyHeader?: boolean
  skeletonRows?: number
  renderMobileCard?: (row: T, index: number) => React.ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DataTable<T extends object>({
  columns,
  data,
  rowKey = 'id' as keyof T,
  loading = false,
  isFetching = false,
  emptyText,
  emptyDescription,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
  rowClassName,
  footer,
  className = '',
  stickyHeader = true,
  skeletonRows = 5,
  renderMobileCard,
}: DataTableProps<T>) {
  const { t } = useTranslation(['tables', 'empty', 'common'])

  // Resolve empty state strings with i18n support
  const resolvedEmptyText = emptyText
    ? typeof emptyText === 'string'
      ? translateString(emptyText)
      : emptyText
    : t('tables:emptyData', { defaultValue: t('empty:noRecord', 'No records found') })

  const resolvedEmptyDescription = emptyDescription
    ? typeof emptyDescription === 'string'
      ? translateString(emptyDescription)
      : emptyDescription
    : undefined

  const getKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') return rowKey(row)
    return (row[rowKey] as string | number) ?? index
  }

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return
    const key = column.key as string
    const nextDirection: 'asc' | 'desc' = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
    onSort(key, nextDirection)
  }

  const getSortTitle = (column: Column<T>): string | undefined => {
    if (!column.sortable) return undefined
    const key = column.key as string
    if (sortKey === key) {
      return sortDir === 'asc'
        ? t('tables:sortAsc', 'Sorted ascending')
        : t('tables:sortDesc', 'Sorted descending')
    }
    return t('tables:sort', 'Click to sort')
  }

  const renderSortIndicator = (column: Column<T>) => {
    if (!column.sortable) return null
    const key = column.key as string
    if (sortKey === key) {
      return sortDir === 'asc' ? (
        <ArrowUp
          size={13}
          className="text-primary shrink-0 transition-transform"
          aria-label={t('tables:sortAsc', 'Sorted ascending')}
        />
      ) : (
        <ArrowDown
          size={13}
          className="text-primary shrink-0 transition-transform"
          aria-label={t('tables:sortDesc', 'Sorted descending')}
        />
      )
    }
    return (
      <ArrowUpDown
        size={13}
        className="opacity-0 group-hover:opacity-60 text-muted-foreground shrink-0 transition-opacity"
        aria-label={t('tables:sort', 'Click to sort')}
      />
    )
  }

  const renderColumnTitle = (column: Column<T>): React.ReactNode => {
    if (typeof column.title === 'string') {
      return translateString(column.title)
    }
    return column.title
  }

  const getCellValue = (row: T, column: Column<T>): unknown => {
    const keys = (column.key as string).split('.')
    return keys.reduce<unknown>(
      (accumulator, currentKey) =>
        accumulator && typeof accumulator === 'object'
          ? (accumulator as Record<string, unknown>)[currentKey]
          : undefined,
      row
    )
  }

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center'
    if (align === 'right') return 'text-right'
    return 'text-left'
  }

  return (
    <div className={`relative w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden print:hidden ${className}`}>
      {/* Subtle fetching overlay indicator */}
      {isFetching && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 bg-background/20 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none transition-opacity"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/95 border border-border shadow-md">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-medium text-muted-foreground">
              {t('tables:fetchingData', { defaultValue: t('common:loading', 'Loading data...') })}
            </span>
          </div>
        </div>
      )}

      {/* ── 1. RESPONSIVE MOBILE CARDS LIST (< md) ────────────────────── */}
      {renderMobileCard && (
        <div className="block md:hidden">
          {loading ? (
            <div
              className="p-3.5 space-y-3"
              aria-busy="true"
              aria-label={t('tables:loading', 'Loading records...')}
            >
              {Array.from({ length: 4 }).map((_, skeletonIndex) => (
                <div
                  key={skeletonIndex}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-28 bg-muted rounded-md" />
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <div className="h-5 w-24 bg-muted rounded" />
                    <div className="h-7 w-20 bg-muted rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {resolvedEmptyText}
              </p>
              {resolvedEmptyDescription && (
                <p className="text-xs text-muted-foreground/80">
                  {resolvedEmptyDescription}
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {data.map((row, index) => (
                <div
                  key={getKey(row, index)}
                  onClick={() => onRowClick?.(row, index)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {renderMobileCard(row, index)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 2. DESKTOP DATA TABLE (hidden on mobile if renderMobileCard is active) ────── */}
      <div className={`${renderMobileCard ? 'hidden md:block' : 'block'} overflow-x-auto w-full`}>
        <table className="w-full data-table border-collapse">
          {/* Header */}
          <thead className={`bg-[#e6f4f8] dark:bg-cyan-950/30 border-b border-cyan-100 dark:border-cyan-900/40 select-none ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((column) => {
                const sortTitle = getSortTitle(column)
                return (
                  <th
                    key={column.key as string}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                    title={sortTitle}
                    aria-sort={
                      sortKey === column.key
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={`px-4 py-3.5 text-[11px] font-bold text-[#0f5b78] dark:text-cyan-300 uppercase tracking-wider select-none transition-colors ${getAlignClass(column.align)} ${column.headerClassName || ''}
                      ${column.sortable ? 'cursor-pointer hover:bg-cyan-100/60 dark:hover:bg-cyan-900/40 group' : ''}`}
                  >
                    <div
                      className={`flex items-center gap-1.5 ${
                        column.align === 'right'
                          ? 'justify-end'
                          : column.align === 'center'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <span className="leading-snug">{renderColumnTitle(column)}</span>
                      {renderSortIndicator(column)}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <LoadingSkeleton cols={columns.length} rows={skeletonRows} />
            ) : data.length === 0 ? (
              <EmptyState
                cols={columns.length}
                message={resolvedEmptyText}
                description={resolvedEmptyDescription}
              />
            ) : (
              data.map((row, index) => {
                const customClassName = rowClassName ? rowClassName(row, index) : ''
                return (
                  <tr
                    key={getKey(row, index)}
                    onClick={() => onRowClick?.(row, index)}
                    className={`group hover:bg-muted/40 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${customClassName}`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key as string}
                        className={`px-4 py-3.5 text-sm align-middle ${getAlignClass(column.align)} ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(getCellValue(row, column), row, index)
                          : String(getCellValue(row, column) ?? '—')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer (e.g. pagination slot) */}
      {footer && (
        <div className="border-t border-border px-4 py-3 bg-card/60">
          {footer}
        </div>
      )}
    </div>
  )
}

export default DataTable
