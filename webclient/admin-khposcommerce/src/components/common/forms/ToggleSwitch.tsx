import React from 'react'
import { sound } from '@/utils/sound'
import { RefreshCw } from 'lucide-react'

export interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  activeColor?: 'primary' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose'
  className?: string
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  loading = false,
  size = 'md',
  activeColor = 'primary',
  className = '',
}) => {
  const getColorClasses = () => {
    switch (activeColor) {
      case 'emerald':
        return 'bg-emerald-500 shadow-emerald-500/30 ring-emerald-500/40 text-emerald-500'
      case 'amber':
        return 'bg-amber-500 shadow-amber-500/30 ring-amber-500/40 text-amber-500'
      case 'blue':
        return 'bg-blue-500 shadow-blue-500/30 ring-blue-500/40 text-blue-500'
      case 'purple':
        return 'bg-purple-500 shadow-purple-500/30 ring-purple-500/40 text-purple-500'
      case 'rose':
        return 'bg-rose-500 shadow-rose-500/30 ring-rose-500/40 text-rose-500'
      case 'primary':
      default:
        return 'bg-primary shadow-primary/30 ring-primary/40 text-primary'
    }
  }

  const colorClass = getColorClasses()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled || loading}
      onClick={() => {
        if (!disabled && !loading) {
          sound.playClick()
          onChange(!checked)
        }
      }}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed select-none ${
        size === 'sm' ? 'h-4.5 w-8' : size === 'lg' ? 'h-7 w-13' : 'h-6 w-11'
      } ${
        checked
          ? `${colorClass} shadow-sm ring-1`
          : 'bg-muted-foreground/25 hover:bg-muted-foreground/35 border border-border/40'
      } ${className}`}
    >
      <span
        className={`pointer-events-none inline-block transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
          size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
        } ${
          checked
            ? size === 'sm'
              ? 'translate-x-3.5'
              : size === 'lg'
              ? 'translate-x-6'
              : 'translate-x-5'
            : 'translate-x-0.5'
        } ${size === 'sm' ? 'mt-[2px]' : size === 'lg' ? 'mt-0.5' : 'mt-0.5'}`}
      >
        {loading ? (
          <RefreshCw className="w-2.5 h-2.5 animate-spin text-muted-foreground" />
        ) : (
          checked && <span className={`w-1.5 h-1.5 rounded-full ${colorClass.split(' ')[0]}`} />
        )}
      </span>
    </button>
  )
}

export default ToggleSwitch
