import React from 'react'
import type { LucideIcon } from 'lucide-react'

export interface WorkspaceTabItem {
  id: string
  label: string
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode
  count?: number | string
  badge?: React.ReactNode
  disabled?: boolean
}

export interface WorkspaceTabsProps {
  tabs: WorkspaceTabItem[]
  activeTab: string
  onChange?: (tabId: string) => void
  onTabChange?: (tabId: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'pill' | 'segmented' | 'underline'
  rightContent?: React.ReactNode
  /**
   * Whether to display icons next to tab labels.
   * Default is false to maintain clean, clutter-free enterprise UX (Linear/Stripe standard).
   */
  showIcons?: boolean
}

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  onTabChange,
  className = '',
  size = 'md',
  variant = 'underline',
  rightContent,
  showIcons = false,
}) => {
  const handleTabSelect = (tabId: string) => {
    if (onChange) onChange(tabId)
    if (onTabChange) onTabChange(tabId)
  }
  const sizeClasses = {
    sm: variant === 'underline' ? 'px-2.5 py-1.5 text-xs gap-1.5' : 'px-3 py-1.5 text-xs gap-1.5',
    md: variant === 'underline' ? 'px-3 py-2 text-xs sm:text-[13px] gap-2' : 'px-3.5 py-1.5 text-xs sm:text-[13px] gap-2',
    lg: variant === 'underline' ? 'px-4 py-2.5 text-sm gap-2.5' : 'px-4 py-2 text-sm gap-2.5',
  }

  const iconSizes = {
    sm: 13,
    md: 14,
    lg: 16,
  }

  // Render Icon helper (supports LucideIcon component or ReactNode)
  const renderIcon = (
    icon: WorkspaceTabItem['icon'],
    isActive: boolean
  ) => {
    if (!showIcons || !icon) return null

    if (React.isValidElement(icon)) {
      return icon
    }

    const IconComponent = icon as React.ComponentType<{ size?: number; className?: string }>
    return (
      <IconComponent
        size={iconSizes[size]}
        className={`shrink-0 transition-colors duration-150 ${
          isActive
            ? 'text-primary'
            : 'text-muted-foreground/80 dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-slate-200'
        }`}
      />
    )
  }

  // 1. Sleek Minimal Line / Underline (Default) - Vercel / GitHub / Linear Style
  if (variant === 'underline') {
    return (
      <div
        role="tablist"
        className={`w-full flex items-center justify-between gap-2 border-b border-border/70 dark:border-slate-800 print:hidden relative min-w-0 ${className}`}
      >
        <div className="flex items-center gap-1 sm:gap-1.5 -mb-px overflow-x-auto no-scrollbar scroll-smooth touch-pan-x flex-1 min-w-0 py-0.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && handleTabSelect(tab.id)}
                className={`group relative flex items-center ${sizeClasses[size]} border-b-2 font-medium transition-all duration-150 cursor-pointer whitespace-nowrap select-none rounded-t-lg shrink-0 ${
                  tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/30 dark:hover:bg-slate-800/40'
                }`}
              >
                {renderIcon(tab.icon, isActive)}
                <span className="tracking-tight">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full transition-colors shrink-0 ${
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'
                        : 'bg-muted dark:bg-slate-800 text-muted-foreground group-hover:text-foreground group-hover:bg-muted-foreground/15 border border-border/40'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge}
              </button>
            )
          })}
        </div>
        {rightContent && (
          <div className="shrink-0 flex items-center pb-1 pl-2">
            {rightContent}
          </div>
        )}
      </div>
    )
  }

  // 2. Sleek Segmented Capsule - Apple macOS / Raycast Style
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        className={`w-full flex items-center justify-between gap-2 print:hidden min-w-0 ${className}`}
      >
        <div className="inline-flex items-center gap-1 p-1 bg-muted/60 dark:bg-slate-900 border border-border/60 dark:border-slate-800 rounded-xl overflow-x-auto no-scrollbar scroll-smooth touch-pan-x max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && handleTabSelect(tab.id)}
                className={`group flex items-center ${sizeClasses[size]} rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer select-none shrink-0 ${
                  tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  isActive
                    ? 'bg-card text-foreground font-semibold shadow-xs border border-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40 font-medium'
                }`}
              >
                {renderIcon(tab.icon, isActive)}
                <span className="tracking-tight">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full transition-colors shrink-0 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'bg-muted-foreground/10 text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge}
              </button>
            )
          })}
        </div>
        {rightContent && (
          <div className="shrink-0 flex items-center pl-2">
            {rightContent}
          </div>
        )}
      </div>
    )
  }

  // 3. Modern Soft-Tint Pills (Refined, no thick outer border box)
  return (
    <div
      role="tablist"
      className={`w-full flex items-center justify-between gap-2 print:hidden min-w-0 ${className}`}
    >
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x flex-1 min-w-0 py-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleTabSelect(tab.id)}
              className={`group flex items-center ${sizeClasses[size]} rounded-xl transition-all duration-150 whitespace-nowrap cursor-pointer select-none shrink-0 ${
                tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-semibold border border-primary/20 shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted/70 dark:hover:bg-slate-800 hover:text-foreground font-medium'
              }`}
            >
              {renderIcon(tab.icon, isActive)}
              <span className="tracking-tight">{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors shrink-0 ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground group-hover:bg-muted-foreground/20'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge}
            </button>
          )
        })}
      </div>
      {rightContent && (
        <div className="shrink-0 flex items-center pl-2">
          {rightContent}
        </div>
      )}
    </div>
  )
}

export { usePageTab } from '@/hooks/usePageTab'
export type { UsePageTabOptions } from '@/hooks/usePageTab'
export default WorkspaceTabs
