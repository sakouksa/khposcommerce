import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, description, action, className = '' }) => {
  const desc = subtitle || description
  return (
    <div className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 mb-5 print:hidden ${className}`}>
      <div className="space-y-1 min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">{title}</h1>
        {desc && <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">{desc}</p>}
      </div>
      {action && (
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 w-full xl:w-auto xl:justify-end shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

export default PageHeader
