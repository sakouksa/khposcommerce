import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  badge?: string
  viewAllLink?: string
  viewAllText?: string
  className?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  badge,
  viewAllLink,
  viewAllText,
  className,
}) => {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-400/30 text-blue-600 dark:text-blue-400 shadow-2xs shrink-0">
              {icon}
            </div>
          )}
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
              {badge}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-2xl font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group self-start sm:self-auto"
        >
          {viewAllText || t('common.view_all')}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

export default SectionHeader
