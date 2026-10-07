import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ModernSelect,
  EnterpriseDatePicker,
  FilterDrawerShell
} from '@/components/common'
import {
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  Tag,
} from 'lucide-react'

export interface ExpenseFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  categories: any[]
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterCategory: string
  setFilterCategory: (val: string) => void
  filterDateStart: string
  setFilterDateStart: (val: string) => void
  filterDateEnd: string
  setFilterDateEnd: (val: string) => void
  filterAmountMin: string
  setFilterAmountMin: (val: string) => void
  filterAmountMax: string
  setFilterAmountMax: (val: string) => void
  filterCreatedBy?: string
  setFilterCreatedBy?: (val: string) => void
  onReset: () => void
}

const FL = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
)

const inputCls = "w-full h-10 min-h-[40px] text-xs sm:text-[13px] font-medium rounded-xl border border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all px-3.5 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const ExpenseFilterDrawer: React.FC<ExpenseFilterDrawerProps> = ({
  isOpen,
  onClose,
  categories = [],
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  filterDateStart,
  setFilterDateStart,
  filterDateEnd,
  setFilterDateEnd,
  filterAmountMin,
  setFilterAmountMin,
  filterAmountMax,
  setFilterAmountMax,
  onReset,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  const activeCount = [
    filterStatus,
    filterCategory,
    filterDateStart,
    filterDateEnd,
    filterAmountMin,
    filterAmountMax
  ].filter(Boolean).length

  const categoryOptions = [
    {
      value: '',
      label: t('finance.all_categories', 'All Categories'),
      icon: <Layers size={14} className="text-muted-foreground" />
    },
    ...categories.map((c) => ({
      value: String(c.id),
      label: c.name,
      icon: <Tag size={14} className="text-primary/70" />
    }))
  ]

  const statusOptions = [
    {
      value: '',
      label: t('finance.all_statuses', 'All Statuses'),
      icon: <Layers size={14} className="text-muted-foreground" />
    },
    {
      value: 'approved',
      label: t('finance.status_approved', 'Approved'),
      icon: <CheckCircle2 size={14} className="text-emerald-500" />
    },
    {
      value: 'pending',
      label: t('finance.status_pending', 'Pending Approval'),
      icon: <Clock size={14} className="text-amber-500" />
    },
    {
      value: 'rejected',
      label: t('finance.status_rejected', 'Rejected'),
      icon: <XCircle size={14} className="text-rose-500" />
    },
  ]

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title={t('finance.filter_expenses', 'Filter Expenses')}
      description={t('finance.filter_expenses_desc', 'Filter expense records by category, status, date range and amount.')}
      activeFilterCount={activeCount}
      onReset={onReset}
      onApply={onClose}
    >
      <div className="space-y-4">
        {/* Status */}
        <FL label={t('finance.status_col', 'Approval Status')}>
          <ModernSelect
            value={filterStatus}
            onChange={(val) => setFilterStatus(String(val ?? ''))}
            options={statusOptions}
            className="w-full"
          />
        </FL>

        {/* Category */}
        <FL label={t('finance.category_col', 'Expense Category')}>
          <ModernSelect
            value={filterCategory}
            onChange={(val) => setFilterCategory(String(val ?? ''))}
            options={categoryOptions}
            className="w-full"
          />
        </FL>

        {/* Date Range */}
        <div className="space-y-3 pt-1">
          <FL label={t('finance.date_from', 'Start Date')}>
            <EnterpriseDatePicker
              value={filterDateStart}
              onChange={(val) => setFilterDateStart(val)}
              placeholder={t('common.selectDate', 'Select start date')}
              className="w-full"
            />
          </FL>
          <FL label={t('finance.date_to', 'End Date')}>
            <EnterpriseDatePicker
              value={filterDateEnd}
              onChange={(val) => setFilterDateEnd(val)}
              placeholder={t('common.selectDate', 'Select end date')}
              className="w-full"
            />
          </FL>
        </div>

        {/* Amount Range */}
        <div className="space-y-2 pt-1">
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {t('finance.amount_range', 'Amount Range ($)')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder={t('finance.min_amount', 'Min ($)')}
              value={filterAmountMin}
              onChange={(e) => setFilterAmountMin(e.target.value)}
              className={inputCls}
            />
            <input
              type="number"
              placeholder={t('finance.max_amount', 'Max ($)')}
              value={filterAmountMax}
              onChange={(e) => setFilterAmountMax(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </FilterDrawerShell>
  )
}

export default ExpenseFilterDrawer
