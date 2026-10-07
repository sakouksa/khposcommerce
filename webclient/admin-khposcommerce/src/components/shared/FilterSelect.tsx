import React from 'react'
import { ModernSelect } from '@/pages/pos/components/ModernSelect'

interface FilterSelectProps {
  label?: string
  options: { value: string | number; label: string }[]
  value?: string | number
  onChange?: (e: any) => void
  className?: string
  placeholder?: string
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  options,
  value = '',
  onChange,
  className = '',
  placeholder = 'Select...',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-sm font-medium text-muted-foreground">{label}:</span>}
      <ModernSelect
        value={value}
        onChange={(val) => {
          if (onChange) {
            onChange({ target: { value: val } })
          }
        }}
        options={options}
        placeholder={placeholder}
      />
    </div>
  )
}

export default FilterSelect
