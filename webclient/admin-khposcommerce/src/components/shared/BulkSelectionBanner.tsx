import React from 'react'
import { AlertCircle, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface BulkSelectionBannerProps {
  selectedCount: number
  onDelete?: () => void
  onClear?: () => void
  deleteLabel?: string
  clearLabel?: string
  deleteLoading?: boolean
  className?: string
  extraActions?: React.ReactNode
}

export const BulkSelectionBanner: React.FC<BulkSelectionBannerProps> = ({
  selectedCount,
  onDelete,
  onClear,
  deleteLabel,
  clearLabel,
  deleteLoading = false,
  className = '',
  extraActions,
}) => {
  const { t } = useTranslation(['common', 'employees', 'customers', 'finance'])

  if (selectedCount === 0) return null

  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-3.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-2xl shadow-xs animate-in fade-in slide-in-from-top-2 backdrop-blur-xs ${className}`}
    >
      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-primary font-bold">
        <div className="w-6 h-6 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center shrink-0">
          <AlertCircle size={14} className="text-primary" />
        </div>
        <span>
          {selectedCount} {t('common.selected', 'Selected')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {extraActions}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleteLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-xl cursor-pointer transition-all duration-150 shadow-xs hover:shadow active:scale-[0.98] disabled:opacity-50"
          >
            <Trash2 size={13} />
            <span>{deleteLabel || t('common.deleteSelected', 'Delete Selected')}</span>
          </button>
        )}

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={13} />
            <span>{clearLabel || t('common.cancel', 'Cancel')}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default BulkSelectionBanner
