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
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react'
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

const FL = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
)

const inputCls = "w-full h-10 min-h-[40px] text-xs sm:text-[13px] font-medium rounded-xl border border-border/80 dark:border-slate-800 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all px-3.5 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const FinanceFilterDrawer: React.FC<FinanceFilterDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  categories = [],
  filterType,
  setFilterType,
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
    filterType,
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

  const getStatusOptions = () => {
    switch (activeTab) {
      case 'payment_methods':
      case 'categories':
      case 'currencies':
      case 'taxes':
        return [
          {
            value: '',
            label: t('finance.all_statuses', 'All Statuses'),
            icon: <Layers size={14} className="text-muted-foreground" />
          },
          {
            value: 'active',
            label: t('finance.status_active', 'Active'),
            icon: <CheckCircle2 size={14} className="text-emerald-500" />
          },
          {
            value: 'inactive',
            label: t('finance.status_inactive', 'Inactive'),
            icon: <XCircle size={14} className="text-rose-500" />
          },
        ]
      case 'registers':
        return [
          {
            value: '',
            label: t('finance.all_statuses', 'All Statuses'),
            icon: <Layers size={14} className="text-muted-foreground" />
          },
          {
            value: 'open',
            label: t('finance.status_open', 'Open'),
            icon: <CheckCircle2 size={14} className="text-emerald-500" />
          },
          {
            value: 'closed',
            label: t('finance.status_closed', 'Closed'),
            icon: <XCircle size={14} className="text-slate-400" />
          },
        ]
      case 'expenses':
      default:
        return [
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
    }
  }

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={
        activeTab === 'expenses'
          ? t('finance.filter_expenses_title', 'Filter Operating Expenses')
          : t('finance.filter_title', 'Filter Financial Records')
      }
      activeCount={activeCount}
      applyLabel={`${t('finance.apply_filters', 'Apply Filters')}${activeCount > 0 ? ` (${activeCount})` : ''}`}
      resetLabel={t('finance.reset_filters', 'Reset Filters')}
    >
      {/* 1. Status Filter */}
      {activeTab !== 'transactions' && (
        <FL label={t('finance.filter_status', t('finance.status_col', 'Status'))}>
          <ModernSelect
            value={filterStatus}
            onChange={(val) => setFilterStatus(String(val ?? ''))}
            options={getStatusOptions()}
            placeholder={t('finance.all_statuses', 'All Statuses')}
          />
        </FL>
      )}

      {/* 2. Type Filter for Transactions */}
      {activeTab === 'transactions' && (
        <FL label={t('finance.filter_type', t('finance.type_col', 'Transaction Type'))}>
          <ModernSelect
            value={filterType}
            onChange={(val) => setFilterType(String(val ?? ''))}
            options={[
              {
                value: '',
                label: t('finance.all_types', 'All Types'),
                icon: <Layers size={14} className="text-muted-foreground" />
              },
              {
                value: 'debit',
                label: t('finance.type_debit', 'Debit (Inflow)'),
                icon: <ArrowDownLeft size={14} className="text-emerald-500" />
              },
              {
                value: 'credit',
                label: t('finance.type_credit', 'Credit (Outflow)'),
                icon: <ArrowUpRight size={14} className="text-rose-500" />
              },
            ]}
            placeholder={t('finance.all_types', 'All Types')}
          />
        </FL>
      )}

      {/* 3. Category Filter (Expenses Only) */}
      {activeTab === 'expenses' && (
        <FL label={t('finance.filter_category', t('finance.category_col', 'Expense Category'))}>
          <ModernSelect
            value={filterCategory}
            onChange={(val) => setFilterCategory(String(val ?? ''))}
            options={categoryOptions}
            placeholder={t('finance.all_categories', 'All Categories')}
          />
        </FL>
      )}

      {/* 4. Date Range & Amounts (Expenses Only) - Clean 1-Column Layout */}
      {activeTab === 'expenses' && (
        <>
          <FL label={t('finance.from_date', 'From Date')}>
            <EnterpriseDatePicker
              value={filterDateStart}
              onChange={setFilterDateStart}
              placeholder={t('finance.select_from_date', 'YYYY-MM-DD')}
            />
          </FL>

          <FL label={t('finance.to_date', 'To Date')}>
            <EnterpriseDatePicker
              value={filterDateEnd}
              minDate={filterDateStart}
              onChange={setFilterDateEnd}
              placeholder={t('finance.select_to_date', 'YYYY-MM-DD')}
            />
          </FL>

          <FL label={t('finance.min_amount', 'Min Amount')}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground dark:text-slate-400 pointer-events-none">$</span>
              <input
                type="number"
                value={filterAmountMin}
                onChange={e => setFilterAmountMin(e.target.value)}
                placeholder={t('finance.min_amount_placeholder', '0.00')}
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
                placeholder={t('finance.max_amount_placeholder', '10,000.00')}
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
