import React from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
  breadcrumb?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  action,
  actions,
  children,
  breadcrumb,
  icon,
  className = '',
}) => {
  const desc = subtitle || description
  const actionContent = actions || action || children

  return (
    <div
      className={cn(
        'flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 mb-5 print:hidden',
        className
      )}
    >
      <div className="space-y-1 min-w-0 flex-1">
        {breadcrumb && <div className="mb-1">{breadcrumb}</div>}
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-primary shrink-0">{icon}</div>}
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {title}
          </h1>
        </div>
        {desc && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {desc}
          </p>
        )}
      </div>
      {actionContent && (
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 w-full xl:w-auto xl:justify-end shrink-0">
          {actionContent}
        </div>
      )}
    </div>
  )
}

export default PageHeader
