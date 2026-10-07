import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Search, X, Loader2, AlertCircle, RefreshCw, User, Package, Building2, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '@/api/client'
import { getAbsoluteImageUrl } from '@/utils/image'

export interface SelectOption {
  value: string | number
  label: string
  title?: string
  subtitle?: string
  description?: string
  code?: string
  badge?: string | { name?: string; label?: string }
  badgeColor?: string
  avatar?: string
  icon?: React.ReactNode
  disabled?: boolean
  raw?: any
}

export interface SelectProps {
  value?: string | number | (string | number)[]
  onChange?: (value: any, option?: SelectOption | SelectOption[]) => void
  options?: SelectOption[]
  asyncSearch?: (query: string) => Promise<SelectOption[]>
  fetchUrl?: string
  queryParams?: Record<string, any>
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  multiple?: boolean
  clearable?: boolean
  allowClear?: boolean
  disabled?: boolean
  required?: boolean
  loading?: boolean
  error?: string | boolean | null
  hideErrorText?: boolean
  helperText?: string
  icon?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  className?: string
  buttonClassName?: string
  dropdownClassName?: string
  align?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  autoFocusSearch?: boolean
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options: staticOptions,
  asyncSearch,
  fetchUrl,
  queryParams,
  label,
  placeholder,
  searchPlaceholder,
  multiple = false,
  clearable = true,
  allowClear = true,
  disabled = false,
  required = false,
  loading: externalLoading = false,
  error: externalError,
  hideErrorText = false,
  helperText,
  icon,
  prefix,
  suffix,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  align = 'left',
  size = 'md',
  autoFocusSearch = true,
}) => {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [asyncOptions, setAsyncOptions] = useState<EnterpriseSelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const [coords, setCoords] = useState<{
    top: number
    left: number
    right?: number
    width: number
    placement: 'top' | 'bottom'
  }>({ top: 0, left: 0, width: 0, placement: 'bottom' })

  const isClearable = clearable && allowClear

  // Calculate coordinates for portal floating dropdown
  const updateCoords = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropdownEstimatedHeight = 280
    const placement = spaceBelow < dropdownEstimatedHeight && rect.top > spaceBelow ? 'top' : 'bottom'

    const top = placement === 'bottom' ? rect.bottom + 6 : rect.top - 6
    const left = align === 'right' ? undefined : rect.left
    const right = align === 'right' ? window.innerWidth - rect.right : undefined

    setCoords({
      top,
      left: left ?? 0,
      right,
      width: Math.max(rect.width, 220),
      placement,
    })
  }, [align])

  useEffect(() => {
    if (!isOpen) return
    updateCoords()
    window.addEventListener('resize', updateCoords)
    window.addEventListener('scroll', updateCoords, true)
    return () => {
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords, true)
    }
  }, [isOpen, updateCoords])

  // Fetch Remote Options if fetchUrl or asyncSearch provided
  const loadAsyncData = useCallback(async (query: string = '') => {
    if (!asyncSearch && !fetchUrl) return
    setIsLoading(true)
    setFetchError(null)

    try {
      if (asyncSearch) {
        const res = await asyncSearch(query)
        setAsyncOptions(res || [])
      } else if (fetchUrl) {
        const res = await api.get(fetchUrl, {
          params: { q: query, search: query, limit: 50, ...queryParams },
        })
        const data = res.data?.data?.data || res.data?.data || res.data || []
        const mapped: EnterpriseSelectOption[] = data.map((item: any) => ({
          value: item.id ?? item.code ?? item.value,
          label: item.name ?? item.title ?? item.label ?? String(item.id),
          title: item.name ?? item.title ?? item.label,
          subtitle: item.code || item.sku || item.phone || item.email || item.description || item.department?.name,
          code: item.code || item.sku,
          badge: item.status || item.role || item.group?.name || item.type,
          avatar: getAbsoluteImageUrl(item.avatar || item.primary_image || item.image),
          raw: item,
        }))
        setAsyncOptions(mapped)
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to load options')
    } finally {
      setIsLoading(false)
    }
  }, [asyncSearch, fetchUrl, queryParams])

  // Initial and debounced API fetching
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      loadAsyncData(filterText)
    }, asyncSearch || fetchUrl ? 300 : 0)
    return () => clearTimeout(timer)
  }, [filterText, isOpen, loadAsyncData, asyncSearch, fetchUrl])

  // Combine static and remote options
  const allOptions = useMemo(() => {
    if (fetchUrl || asyncSearch) {
      return asyncOptions
    }
    return staticOptions || []
  }, [fetchUrl, asyncSearch, asyncOptions, staticOptions])

  // Filter options locally if no remote API search
  const filteredOptions = useMemo(() => {
    if (fetchUrl || asyncSearch) return allOptions
    if (!filterText.trim()) return allOptions
    const q = filterText.toLowerCase()
    return allOptions.filter((o) => {
      const badgeText = typeof o.badge === 'object' && o.badge ? o.badge.name || o.badge.label || '' : String(o.badge || '')
      return (
        o.label.toLowerCase().includes(q) ||
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.subtitle && o.subtitle.toLowerCase().includes(q)) ||
        (o.code && o.code.toLowerCase().includes(q)) ||
        badgeText.toLowerCase().includes(q)
      )
    })
  }, [allOptions, filterText, fetchUrl, asyncSearch])

  // Selected Option(s) lookup
  const selectedOption = useMemo(() => {
    if (multiple && Array.isArray(value)) {
      return allOptions.filter((o) => value.map(String).includes(String(o.value)))
    }
    return allOptions.find((o) => String(o.value) === String(value))
  }, [value, allOptions, multiple])

  const popoverRef = useRef<HTMLDivElement>(null)

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const isInsideContainer = containerRef.current && containerRef.current.contains(target)
      const isInsidePopover = popoverRef.current && popoverRef.current.contains(target)
      if (!isInsideContainer && !isInsidePopover) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto focus search input when opening
  useEffect(() => {
    if (isOpen && autoFocusSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    if (isOpen) {
      setHighlightedIndex(0)
    }
  }, [isOpen, autoFocusSearch])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  // Handle option selection
  const handleSelect = (opt: EnterpriseSelectOption) => {
    if (opt.disabled) return

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const exists = currentValues.map(String).includes(String(opt.value))
      let newValues: (string | number)[]
      if (exists) {
        newValues = currentValues.filter((v) => String(v) !== String(opt.value))
      } else {
        newValues = [...currentValues, opt.value]
      }
      const selectedOpts = allOptions.filter((o) => newValues.map(String).includes(String(o.value)))
      onChange?.(newValues, selectedOpts)
    } else {
      onChange?.(opt.value, opt)
      setIsOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(multiple ? [] : '', multiple ? [] : undefined)
  }

  // Size styling - baseline standard is h-10 (40px)
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg min-h-[34px] h-[34px] box-border font-medium',
    md: 'px-3.5 py-2 text-xs sm:text-[13px] rounded-xl min-h-[40px] h-10 box-border font-medium',
    lg: 'px-4 py-2.5 text-sm rounded-xl min-h-[46px] h-[46px] box-border font-medium',
  }[size]

  const displayPlaceholder = placeholder || t('select.placeholder', 'Select option...')
  const displaySearchPlaceholder = searchPlaceholder || t('select.search', 'Search...')
  const alignPositionClass = align === 'right' ? 'right-0' : 'left-0'

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== undefined && value !== null && value !== ''

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`} onKeyDown={handleKeyDown}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setIsOpen(!isOpen)
          setFilterText('')
        }}
        className={`w-full flex items-center justify-between gap-2 bg-card dark:bg-slate-900 border text-foreground dark:text-slate-100 transition-all cursor-pointer shadow-2xs ${sizeClasses} ${
          externalError
            ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20'
            : isOpen
            ? 'border-primary ring-2 ring-primary/20 shadow-xs'
            : 'border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 hover:bg-muted/30 dark:hover:bg-slate-800/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-muted dark:bg-slate-800' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate flex-1 text-left">
          {(icon || prefix) && <span className="text-primary shrink-0">{icon || prefix}</span>}

          {/* Selected Content Display */}
          {multiple && Array.isArray(selectedOption) ? (
            selectedOption.length > 0 ? (
              <div className="flex flex-wrap gap-1 items-center max-w-full truncate">
                {selectedOption.slice(0, 3).map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[11px] font-medium"
                  >
                    {opt.label}
                  </span>
                ))}
                {selectedOption.length > 3 && (
                  <span className="text-[10px] font-semibold text-muted-foreground dark:text-slate-400">+{selectedOption.length - 3}</span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground dark:text-slate-400 font-normal text-sm truncate">{displayPlaceholder}</span>
            )
          ) : !multiple && selectedOption && !Array.isArray(selectedOption) ? (
            <div className="flex items-center gap-2 min-w-0 truncate">
              {selectedOption.avatar ? (
                <img
                  src={selectedOption.avatar}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  onError={(e) => { e.currentTarget.src = '/images/default-avatar.svg' }}
                />
              ) : selectedOption.icon ? (
                <span className="shrink-0">{selectedOption.icon}</span>
              ) : null}
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-normal text-sm text-foreground dark:text-slate-100 truncate">{selectedOption.label}</span>
                {selectedOption.subtitle && (
                  <span className="text-[11px] text-muted-foreground dark:text-slate-400 truncate hidden sm:inline">
                    ({selectedOption.subtitle})
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground dark:text-slate-400 font-normal text-sm truncate">{displayPlaceholder}</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(externalLoading || isLoading) && <Loader2 size={14} className="animate-spin text-primary shrink-0" />}

          {isClearable && hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 hover:bg-muted dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X size={13} />
            </span>
          )}

          {suffix}

          <ChevronDown
            size={14}
            className={`text-muted-foreground dark:text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          />
        </div>
      </button>

      {/* Helper Text or Error */}
      {!hideErrorText && (typeof externalError === 'string' || helperText) && (
        <p className={`text-[11px] mt-1 ${externalError ? 'text-rose-500 font-semibold' : 'text-muted-foreground dark:text-slate-400'}`}>
          {typeof externalError === 'string' ? externalError : helperText}
        </p>
      )}

      {/* Popover Dropdown Panel rendered via Portal to prevent modal height distortion & overflow clipping */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: coords.placement === 'top' ? 8 : -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: coords.placement === 'top' ? 8 : -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: coords.placement === 'bottom' ? `${coords.top}px` : 'auto',
                bottom: coords.placement === 'top' ? `${window.innerHeight - coords.top}px` : 'auto',
                left: align === 'right' ? 'auto' : `${coords.left}px`,
                right: align === 'right' ? `${coords.right}px` : 'auto',
                minWidth: `${Math.max(coords.width, 240)}px`,
                maxWidth: `${Math.max(coords.width, 480)}px`,
                zIndex: 99999,
              }}
              className={`bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 space-y-1 ring-1 ring-black/5 dark:ring-white/10 ${dropdownClassName}`}
            >
              {/* Quick Search Box (Shown when options > 5 or async search) */}
              {(fetchUrl || asyncSearch || allOptions.length > 5) && (
                <div className="relative mb-1 px-1">
                  <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder={displaySearchPlaceholder}
                    className="w-full bg-muted/40 dark:bg-slate-800/80 border border-border/70 dark:border-slate-700 rounded-xl pl-8 pr-8 py-1.5 text-xs text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground dark:placeholder:text-slate-500"
                  />
                  {filterText && (
                    <button
                      type="button"
                      onClick={() => setFilterText('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Options List Container */}
              <div ref={listRef} className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
                {isLoading ? (
                  <div className="p-4 text-center space-y-2">
                    <Loader2 size={18} className="animate-spin text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground font-medium">{t('loading', 'Loading options...')}</p>
                  </div>
                ) : fetchError ? (
                  <div className="p-3 text-center space-y-2">
                    <AlertCircle size={18} className="text-rose-500 mx-auto" />
                    <p className="text-xs text-rose-500 font-medium">{fetchError}</p>
                    <button
                      type="button"
                      onClick={() => loadAsyncData(filterText)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      <RefreshCw size={12} /> {t('retry', 'Retry')}
                    </button>
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className="p-4 text-center space-y-1 text-muted-foreground">
                    <Search size={20} className="mx-auto opacity-40 mb-1" />
                    <p className="text-xs font-semibold">{t('noOptions', 'No options found')}</p>
                    {filterText && <p className="text-[11px] opacity-75">"{filterText}"</p>}
                  </div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = multiple
                      ? Array.isArray(value) && value.map(String).includes(String(opt.value))
                      : String(opt.value) === String(value)

                    const isHighlighted = idx === highlightedIndex
                    const badgeText = typeof opt.badge === 'object' && opt.badge ? opt.badge.name || opt.badge.label || '' : String(opt.badge || '')

                    return (
                      <button
                        key={`${opt.value}-${idx}`}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => handleSelect(opt)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-[13px] transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary'
                            : isHighlighted
                            ? 'bg-muted/70 text-foreground dark:bg-slate-800/80 dark:text-slate-100 font-medium'
                            : 'text-foreground/90 dark:text-slate-200 hover:bg-muted/50 dark:hover:bg-slate-800/50 font-normal'
                        } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 truncate flex-1">
                          {opt.avatar ? (
                            <img
                              src={opt.avatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-border"
                              onError={(e) => { e.currentTarget.src = '/images/default-avatar.svg' }}
                            />
                          ) : opt.icon ? (
                            <span className="shrink-0">{opt.icon}</span>
                          ) : null}

                          <div className="min-w-0 truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate">{opt.title || opt.label}</span>
                              {opt.code && (
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400'}`}>
                                  {opt.code}
                                </span>
                              )}
                            </div>
                            {(opt.subtitle || opt.description) && (
                              <p className={`text-[10px] truncate ${isSelected ? 'text-primary/80' : 'text-muted-foreground dark:text-slate-400'}`}>
                                {opt.subtitle || opt.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {badgeText && (
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                                isSelected ? 'bg-primary/20 text-primary' : 'bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400'
                              }`}
                            >
                              {badgeText}
                            </span>
                          )}
                          {isSelected && <Check size={14} className="text-primary font-bold shrink-0" />}
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

// ─── Backward Compatibility Aliases ───────────────────────────────────────────
export type EnterpriseSelectOption = SelectOption
export type EnterpriseSelectProps = SelectProps
export const EnterpriseSelect = Select
export const AppSelect = Select

export default Select
