import React from 'react'
import SearchInput from '@/components/shared/SearchInput'
import { ResetButton, RefreshButton } from '../buttons/GlobalActionButtons'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FilterOption {
  label: string
  value: string
}

export interface FilterField {
  key: string
  placeholder?: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

export interface SearchFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterField[]
  onRefresh?: () => void
  onReset?: () => void
  loading?: boolean
  actions?: React.ReactNode // extra buttons on the right side
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  onRefresh,
  onReset,
  loading = false,
  actions,
  size = 'md',
  className = '',
}) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>
    {/* Global Search input */}
    <SearchInput
      value={searchValue}
      onChange={onSearchChange}
      placeholder={searchPlaceholder}
      size={size}
    />

    {/* Dropdown filters */}
    {filters.map((f) => {
      const options = [
        ...(f.placeholder ? [{ value: '', label: f.placeholder }] : []),
        ...f.options.map((opt) => ({ value: opt.value, label: opt.label })),
      ]
      return (
        <ModernSelect
          key={f.key}
          value={f.value}
          onChange={(val) => f.onChange(String(val))}
          options={options}
          placeholder={f.placeholder || 'Select...'}
        />
      )
    })}

    {/* Reset */}
    {onReset && <ResetButton onClick={onReset} size={size} />}

    {/* Refresh */}
    {onRefresh && (
      <RefreshButton onClick={onRefresh} loading={loading} size={size} />
    )}

    {/* Right-side actions */}
    {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
  </div>
)

export default SearchFilter
