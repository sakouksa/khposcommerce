import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface BreadcrumbItem {
  label: string
  path?: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '', showHome = true }) => {
  const { t } = useTranslation()

  return (
    <nav className={`flex items-center flex-wrap gap-1.5 text-xs text-muted-foreground min-w-0 ${className}`}>
      {showHome && (
        <Link to="/dashboard" className="hover:text-foreground flex items-center gap-1 transition-colors shrink-0">
          <Home size={12} />
          <span>{t('nav.dashboard', 'Dashboard')}</span>
        </Link>
      )}
      {items.map((item, index) => {
        const linkTarget = item.path || item.href
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} className="text-muted-foreground/50 shrink-0" />
            {linkTarget && !isLast ? (
              <Link
                to={linkTarget}
                className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[180px] md:max-w-none shrink-0"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-[160px] sm:max-w-[280px] md:max-w-none ${isLast ? 'text-foreground font-medium' : ''}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
