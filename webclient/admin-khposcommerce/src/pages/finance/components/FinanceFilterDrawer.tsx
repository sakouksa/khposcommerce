import React from 'react'
import { useTranslation } from 'react-i18next'
import { ModernSelect, EnterpriseDatePicker } from '@/components/common'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import type { TabType } from '../types/finance.types'

interface FinanceFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeTab: TabType
  categories: any[]
  filterType: string
  setFilterType: (val: string) => void
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterAccount: string
  setFilterAccount: (val: string) => void
  filterCategory: string
  setFilterCategory: (val: string) => void
  filterPaymentMethod: string
  setFilterPaymentMethod: (val: string) => void
  filterDateStart: string
  setFilterDateStart: (val: string) => void
  filterDateEnd: string
  setFilterDateEnd: (val: string) => void
  filterAmountMin: string
  setFilterAmountMin: (val: string) => void
  filterAmountMax: string
  setFilterAmountMax: (val: string) => void
  filterCreatedBy: string
  setFilterCreatedBy: (val: string) => void
  onReset: () => void
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

const inputCls = "w-full h-10 min-h-[40px] text-xs sm:text-[13px] font-medium rounded-lg border border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all px-3.5 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const FinanceFilterDrawer: React.FC<FinanceFilterDrawerProps> = ({
  isOpen, onClose,
  activeTab, categories = [],
  filterType, setFilterType,
  filterStatus, setFilterStatus,
  filterCategory, setFilterCategory,
  filterDateStart, setFilterDateStart,
  filterDateEnd, setFilterDateEnd,
  filterAmountMin, setFilterAmountMin,
  filterAmountMax, setFilterAmountMax,
  onReset,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  const activeCount = [
    filterStatus,
    filterType,
    filterCategory,
    filterDateStart,
    filterDateEnd,
    filterAmountMin,
    filterAmountMax
  ].filter(Boolean).length

  const categoryOptions = [
    { value: '', label: t('finance.all_categories', 'All Categories') },
    ...categories.map((c) => ({ value: String(c.id), label: c.name }))
  ]

  const getStatusOptions = () => {
    switch (activeTab) {
      case 'payment_methods':
      case 'categories':
      case 'currencies':
      case 'taxes':
        return [
          { value: '', label: t('finance.all_statuses', 'All Statuses') },
          { value: 'active', label: t('finance.status_active', 'Active') },
          { value: 'inactive', label: t('finance.status_inactive', 'Inactive') },
        ]
      case 'registers':
        return [
          { value: '', label: t('finance.all_statuses', 'All Statuses') },
          { value: 'open', label: t('finance.status_open', 'Open') },
          { value: 'closed', label: t('finance.status_closed', 'Closed') },
        ]
      case 'expenses':
      default:
        return [
          { value: '', label: t('finance.all_statuses', 'All Statuses') },
          { value: 'approved', label: t('finance.status_approved', 'Approved') },
          { value: 'pending', label: t('finance.status_pending', 'Pending') },
          { value: 'rejected', label: t('finance.status_rejected', 'Rejected') },
        ]
    }
  }

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('finance.filter_title', 'Filter Ledger Records')}
      activeCount={activeCount}
      resetLabel={t('common.reset', 'Reset Filters')}
    >
      {/* Status Filter (All tabs except transactions) */}
      {activeTab !== 'transactions' && (
        <FL label={t('finance.status_col', 'Status')}>
          <ModernSelect
            value={filterStatus}
            onChange={(val) => setFilterStatus(String(val ?? ''))}
            options={getStatusOptions()}
            placeholder={t('finance.all_statuses', 'All Statuses')}
          />
        </FL>
      )}

      {/* Type Filter for Transactions */}
      {activeTab === 'transactions' && (
        <FL label={t('finance.type_col', 'Transaction Type')}>
          <ModernSelect
            value={filterType}
            onChange={(val) => setFilterType(String(val ?? ''))}
            options={[
              { value: '', label: t('finance.all_types', 'All Types') },
              { value: 'debit', label: t('finance.type_debit', 'Debit (Inflow)') },
              { value: 'credit', label: t('finance.type_credit', 'Credit (Outflow)') },
            ]}
            placeholder={t('finance.all_types', 'All Types')}
          />
        </FL>
      )}

      {/* Category Filter (Expenses Only) */}
      {activeTab === 'expenses' && (
        <FL label={t('finance.category_col', 'Category')}>
          <ModernSelect
            value={filterCategory}
            onChange={(val) => setFilterCategory(String(val ?? ''))}
            options={categoryOptions}
            placeholder={t('finance.all_categories', 'All Categories')}
          />
        </FL>
      )}

      {/* Date Range & Amounts (Expenses Only) */}
      {activeTab === 'expenses' && (
        <>
          <FL label={t('finance.from_date', 'From Date')}>
            <EnterpriseDatePicker
              value={filterDateStart}
              onChange={setFilterDateStart}
              placeholder={t('finance.select_date', 'Select date')}
            />
          </FL>

          <FL label={t('finance.to_date', 'To Date')}>
            <EnterpriseDatePicker
              value={filterDateEnd}
              minDate={filterDateStart}
              onChange={setFilterDateEnd}
              placeholder={t('finance.select_date', 'Select date')}
            />
          </FL>

          <FL label={t('finance.min_amount', 'Min Amount')}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground dark:text-slate-400 pointer-events-none">$</span>
              <input
                type="number"
                value={filterAmountMin}
                onChange={e => setFilterAmountMin(e.target.value)}
                placeholder="0.00"
                className={`${inputCls} pl-8`}
              />
            </div>
          </FL>

          <FL label={t('finance.max_amount', 'Max Amount')}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground dark:text-slate-400 pointer-events-none">$</span>
              <input
                type="number"
                value={filterAmountMax}
                onChange={e => setFilterAmountMax(e.target.value)}
                placeholder="10000.00"
                className={`${inputCls} pl-8`}
              />
            </div>
          </FL>
        </>
      )}
    </FilterDrawerShell>
  )
}

export default FinanceFilterDrawer
