import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, X } from 'lucide-react'

export interface InlineFilterOption {
  label: string
  value: string | number
  count?: number
}

export interface InlineFilterSelectProps {
  /** Default label shown when no filter is active, e.g. "Category", "Supplier" */
  label: string
  /** Currently selected value */
  value?: string | number
  /** Callback when option changes */
  onChange: (value: string) => void
  /** Available filter options */
  options: InlineFilterOption[]
  /** Label for the 'All' / clear option (e.g. 'All categories') */
  allLabel?: string
  /** Whether to show a clear button when active */
  clearable?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Custom root class */
  className?: string
  /** Width or min-width class (e.g. 'w-[140px]') */
  widthClassName?: string
}

/**
 * Standard Shadcn-style Inline Filter Dropdown.
 * Renders directly in the Table Toolbar for fast 1-click filtering.
 */
export const InlineFilterSelect: React.FC<InlineFilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
  allLabel,
  clearable = true,
  disabled = false,
  size = 'md',
  className = '',
  widthClassName = 'w-auto min-w-[110px]',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isSelected = value !== undefined && value !== null && String(value).trim() !== ''
  const selectedOption = options.find((opt) => String(opt.value) === String(value))
  const displayLabel = isSelected && selectedOption ? selectedOption.label : label

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = (val: string | number) => {
    onChange(String(val))
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setIsOpen(false)
  }

  // Exact Shadcn standard: h-10 (40px), rounded-lg, text-sm, border-input
  const heightClasses = {
    sm: 'h-8 min-h-[32px] max-h-[32px] px-2.5 text-xs rounded-md',
    md: 'h-10 min-h-[40px] max-h-[40px] px-3.5 text-sm font-medium rounded-lg',
    lg: 'h-12 min-h-[48px] max-h-[48px] px-4 text-base font-medium rounded-xl',
  }

  const currentHeightClass = heightClasses[size] || heightClasses.md

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 border bg-background font-medium shadow-xs hover:bg-accent hover:text-accent-foreground text-foreground transition-all duration-200 cursor-pointer select-none box-border leading-normal ${currentHeightClass} ${widthClassName} ${
          isSelected
            ? 'border-primary/50 bg-primary/5 text-primary font-semibold'
            : 'border-input text-foreground'
        } ${isOpen ? 'ring-1 ring-ring/30 bg-accent text-accent-foreground' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-expanded={isOpen}
      >
        <span className="truncate whitespace-nowrap">{displayLabel}</span>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {clearable && isSelected && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Clear"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-foreground' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Options Menu with Solid Opaque Background */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1.5 min-w-[180px] sm:min-w-[200px] w-auto max-w-[300px] bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border border-border/90 shadow-2xl rounded-xl p-1.5 z-50 select-none flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col py-0.5 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {/* 'All' default option */}
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left ${
                  !isSelected
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {!isSelected ? (
                    <Check size={15} className="text-foreground shrink-0" strokeWidth={2.5} />
                  ) : (
                    <span className="w-4 h-4 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{allLabel || `All ${label}`}</span>
                </div>
              </button>

              {/* Items */}
              {options.map((opt) => {
                const isItemActive = String(opt.value) === String(value)
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left ${
                      isItemActive
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isItemActive ? (
                        <Check size={15} className="text-foreground shrink-0" strokeWidth={2.5} />
                      ) : (
                        <span className="w-4 h-4 shrink-0" />
                      )}
                      <span className="whitespace-nowrap">{opt.label}</span>
                    </div>

                    {opt.count !== undefined && (
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0 ml-2">
                        {opt.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InlineFilterSelect
