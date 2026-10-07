import React from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  autoFocus?: boolean
  onClear?: () => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  inputClassName = '',
  size = 'md',
  disabled = false,
  autoFocus = false,
  onClear,
  onKeyDown,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['common'])

  // Resolve placeholder safely and reactively
  let resolvedPlaceholder = placeholder || ''
  if (!placeholder || placeholder === 'common.search') {
    resolvedPlaceholder = t('common.search', 'Search...')
  } else if (!placeholder.includes(' ') && placeholder.includes('.') && !placeholder.includes('...')) {
    resolvedPlaceholder = t(placeholder, { defaultValue: placeholder })
  }

  // Baseline standard: size 'md' is h-10 (40px) matching shadcn inputs and dropdowns
  const heightClass =
    size === 'sm'
      ? 'h-8 min-h-[32px] max-h-[32px] text-xs'
      : size === 'lg'
      ? 'h-12 min-h-[48px] max-h-[48px] text-base'
      : 'h-10 min-h-[40px] max-h-[40px] text-sm'
  const iconSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14

  const radiusClass = size === 'sm' ? 'rounded-md' : 'rounded-lg'

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className={`relative w-full min-w-0 flex items-center ${className}`} key={language}>
      <Search
        size={iconSize}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors z-10 shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full ${heightClass} box-border leading-normal pl-9 pr-8 ${radiusClass} border border-input bg-background hover:border-muted-foreground/40 focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-input text-foreground transition-all placeholder:text-muted-foreground font-normal text-sm shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName}`}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer active:scale-90 z-10"
          title={t('common.clear', 'Clear')}
          aria-label={t('common.clear', 'Clear')}
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}

export default SearchInput
