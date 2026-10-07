import React from 'react'
import { useTranslation } from 'react-i18next'
import SearchInput from '@/components/shared/SearchInput'
import {
  FilterButton,
  ResetButton,
  RefreshButton,
} from '../buttons/GlobalActionButtons'
import ColumnSettingsPopover, {
  type ColumnOption,
} from '@/components/shared/ColumnSettingsPopover'

export interface TableToolbarProps {
  /** Search value */
  search?: string
  /** Handler when search input changes */
  onSearchChange?: (value: string) => void
  /** Custom placeholder for search input (or i18n key) */
  searchPlaceholder?: string
  /** Whether search input is disabled */
  searchDisabled?: boolean
  /** Custom class for search container */
  searchClassName?: string
  /** Hide search input */
  hideSearch?: boolean

  /** Handler when clicking Filter button (e.g. opens filter drawer / modal) */
  onFilterClick?: (e?: React.MouseEvent) => void
  /** Whether any filter is active (highlights filter button) */
  isFilterActive?: boolean
  /** Number of active filters to display as a badge */
  filterActiveCount?: number
  /** Custom label for filter button */
  filterLabel?: string
  /** Whether filter button is disabled */
  filterDisabled?: boolean
  /** Hide filter button */
  hideFilterButton?: boolean

  /** Handler when clicking Reset button ("កំណត់ឡើងវិញ" / "Reset") */
  onReset?: (e?: React.MouseEvent) => void
  /** Custom label for reset button */
  resetLabel?: string
  /** Tooltip/Title for reset button */
  resetTitle?: string
  /** Whether reset button is disabled */
  resetDisabled?: boolean
  /** Whether reset button should only show icon */
  resetIconOnly?: boolean
  /** Hide reset button */
  hideResetButton?: boolean

  /** Handler when clicking Refresh icon button */
  onRefresh?: (e?: React.MouseEvent) => void
  /** Whether refresh query is loading/fetching (spins icon) */
  refreshLoading?: boolean
  /** Whether refresh button is disabled */
  refreshDisabled?: boolean
  /** Tooltip/Title for refresh button */
  refreshTitle?: string
  /** Hide refresh button */
  hideRefreshButton?: boolean

  /** Column definitions for column visibility settings */
  columns?: ColumnOption[]
  /** Current column visibility map */
  visibleColumns?: Record<string, boolean>
  /** Handler when column visibility map changes */
  onColumnChange?: (updated: Record<string, boolean>) => void
  /** Default visible columns map for reset action */
  defaultVisibleColumns?: Record<string, boolean>
  /** Custom title for column settings popover */
  columnSettingsTitle?: string
  /** Hide column settings popover */
  hideColumnSettings?: boolean

  /** Additional actions/components to render before search input on the left side (e.g. date stepper, status controller) */
  prependLeftActions?: React.ReactNode
  /** Additional actions/components to render on the left side */
  leftActions?: React.ReactNode
  /** Additional actions/components to render on the right side (e.g. view mode switcher, export, print) */
  rightActions?: React.ReactNode
  /** Children to render inside toolbar */
  children?: React.ReactNode

  /** Custom root className */
  className?: string
  /** Custom left container className */
  leftClassName?: string
  rightClassName?: string
  /** Aliases for convenience */
  searchValue?: string
  activeFiltersCount?: number
  onResetFilters?: (e?: React.MouseEvent) => void
  customFilters?: React.ReactNode
  isRefreshing?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Standard Global Table Toolbar Component.
 * Provides unified Search Input, Filter Button, Reset Button, Refresh Button, and Column Settings Popover.
 * Responsive, dark/light mode harmonized, and fully customizable.
 */
export const TableToolbar: React.FC<TableToolbarProps> = ({
  search,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchDisabled = false,
  searchClassName = '',
  hideSearch = false,

  onFilterClick,
  isFilterActive = false,
  filterActiveCount,
  activeFiltersCount,
  filterLabel,
  filterDisabled = false,
  hideFilterButton = false,

  onReset,
  onResetFilters,
  resetLabel,
  resetTitle,
  resetDisabled = false,
  resetIconOnly = false,
  hideResetButton = false,

  onRefresh,
  refreshLoading = false,
  isRefreshing = false,
  refreshDisabled = false,
  refreshTitle,
  hideRefreshButton = false,

  columns,
  visibleColumns,
  onColumnChange,
  defaultVisibleColumns,
  columnSettingsTitle,
  hideColumnSettings = false,

  prependLeftActions,
  leftActions,
  customFilters,
  rightActions,
  children,

  className = '',
  leftClassName = '',
  rightClassName = '',
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])

  const effectiveSearch = search ?? searchValue
  const effectiveReset = onReset ?? onResetFilters
  const effectiveLeftActions = leftActions ?? customFilters
  const effectiveActiveCount = filterActiveCount ?? activeFiltersCount
  const effectiveRefreshLoading = refreshLoading || Boolean(isRefreshing)

  const showLeft =
    (!hideSearch && onSearchChange !== undefined && effectiveSearch !== undefined) ||
    (!hideFilterButton && onFilterClick !== undefined) ||
    (!hideResetButton && effectiveReset !== undefined) ||
    Boolean(prependLeftActions) ||
    Boolean(effectiveLeftActions)

  const showRight =
    (!hideRefreshButton && onRefresh !== undefined) ||
    (!hideColumnSettings && columns && visibleColumns && onColumnChange) ||
    Boolean(rightActions)

  return (
    <div
      className={`flex flex-col lg:flex-row gap-2.5 sm:gap-3 items-stretch lg:items-center justify-between bg-card p-3 sm:p-4 rounded-xl border border-border shadow-xs print:hidden transition-all duration-200 ${className}`}
    >
      {/* ─── LEFT REGION: Prepend Actions + Search + Filter + Reset + Custom Left Actions (Grouped Naturally) ─── */}
      <div className={`flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 flex-wrap sm:flex-nowrap ${leftClassName}`}>
        {prependLeftActions}

        {/* Search Input: responsive width, paired with filter */}
        {!hideSearch && onSearchChange !== undefined && effectiveSearch !== undefined && (
          <div className="w-full sm:w-72 md:w-80 lg:w-96 flex-1 sm:flex-initial min-w-0">
            <SearchInput
              value={effectiveSearch}
              onChange={onSearchChange}
              placeholder={searchPlaceholder || t('common.search', 'Search...')}
              disabled={searchDisabled}
              size={size}
              className={`w-full ${searchClassName}`}
            />
          </div>
        )}

        {/* Filter Button: placed directly adjacent to search */}
        {!hideFilterButton && onFilterClick !== undefined && (
          <FilterButton
            onClick={onFilterClick}
            isActive={isFilterActive}
            activeCount={effectiveActiveCount}
            label={filterLabel}
            disabled={filterDisabled}
            size={size}
          />
        )}

        {/* Reset Button: placed right next to filter when active */}
        {!hideResetButton && effectiveReset !== undefined && (
          <ResetButton
            onClick={effectiveReset}
            label={resetLabel}
            title={resetTitle}
            disabled={resetDisabled}
            iconOnly={resetIconOnly}
            size={size}
          />
        )}

        {/* Any custom left actions (status filters, date range stepper, etc.) */}
        {effectiveLeftActions}
      </div>

      {/* ─── RIGHT REGION: View Switcher, Refresh & Column Settings (Table Utilities) ─── */}
      {showRight && (
        <div
          className={`flex items-center gap-1.5 sm:gap-2 shrink-0 self-end lg:self-auto ${rightClassName}`}
        >
          {rightActions}

          {!hideRefreshButton && onRefresh !== undefined && (
            <RefreshButton
              onClick={onRefresh}
              loading={effectiveRefreshLoading}
              disabled={refreshDisabled}
              title={refreshTitle || t('common.refresh', 'Refresh')}
              size={size}
            />
          )}

          {!hideColumnSettings &&
            columns &&
            visibleColumns &&
            onColumnChange && (
              <ColumnSettingsPopover
                columns={columns}
                visibleColumns={visibleColumns}
                onChange={onColumnChange}
                defaultVisibleColumns={defaultVisibleColumns}
                title={columnSettingsTitle}
                size={size}
              />
            )}
        </div>
      )}

      {children}
    </div>
  )
}

export const TableFilterToolbar = TableToolbar
export const DataTableToolbar = TableToolbar
export const SearchFilterToolbar = TableToolbar

export default TableToolbar
