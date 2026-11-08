import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Layers,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Percent,
  FileText,
  Package,
  XCircle,
} from 'lucide-react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { getCategoryDisplayName } from '../ReturnPoliciesPage'

export interface ReturnPoliciesFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  activeFiltersCount: number

  categoryFilter: string
  setCategoryFilter: (val: string) => void
  categories: Array<{ id: number; name: string }>

  returnableFilter: string
  setReturnableFilter: (val: string) => void

  exchangeFilter: string
  setExchangeFilter: (val: string) => void

  restockingFilter: string
  setRestockingFilter: (val: string) => void

  receiptFilter: string
  setReceiptFilter: (val: string) => void

  packagingFilter: string
  setPackagingFilter: (val: string) => void

  windowDaysFilter: string
  setWindowDaysFilter: (val: string) => void
}

const FieldLabel = ({ label }: { label: string }) => (
  <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">
    {label}
  </label>
)

export const ReturnPoliciesFilterDrawer: React.FC<ReturnPoliciesFilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  activeFiltersCount,
  categoryFilter,
  setCategoryFilter,
  categories,
  returnableFilter,
  setReturnableFilter,
  exchangeFilter,
  setExchangeFilter,
  restockingFilter,
  setRestockingFilter,
  receiptFilter,
  setReceiptFilter,
  packagingFilter,
  setPackagingFilter,
  windowDaysFilter,
  setWindowDaysFilter,
}) => {
  const { t } = useTranslation(['returns', 'orders', 'common'])

  // Category Options
  const categoryOptions = [
    {
      value: 'all',
      label: t('policies.filters.allCategories', 'All Coverage (Store-Wide & Categories)'),
      icon: <Layers size={14} className="text-muted-foreground" />,
    },
    {
      value: 'storewide',
      label: t('policies.filters.storewideOnly', 'Store-Wide Baseline Only'),
      icon: <Globe size={14} className="text-primary" />,
    },
    ...categories.map((c) => ({
      value: String(c.id),
      label: getCategoryDisplayName(c.name, t),
      icon: <Layers size={14} className="text-purple-500" />,
    })),
  ]

  // Return Eligibility Options
  const returnableOptions = [
    {
      value: 'all',
      label: t('policies.filters.allEligibility', 'All Policies (Returnable & Final Sale)'),
      icon: <RotateCcw size={14} className="text-muted-foreground" />,
    },
    {
      value: 'returnable',
      label: t('policies.filters.returnableOnly', 'Returnable Items Allowed'),
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    },
    {
      value: 'final_sale',
      label: t('policies.filters.finalSaleOnly', 'Non-Returnable (Final Sale / As-Is)'),
      icon: <AlertTriangle size={14} className="text-rose-500" />,
    },
  ]

  // Exchange Allowed Options
  const exchangeOptions = [
    {
      value: 'all',
      label: t('policies.filters.allExchanges', 'All Exchange Statuses'),
      icon: <RotateCcw size={14} className="text-muted-foreground" />,
    },
    {
      value: 'allowed',
      label: t('policies.filters.exchangeAllowed', 'Exchange Allowed (1-to-1 or Model Swap)'),
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    },
    {
      value: 'not_allowed',
      label: t('policies.filters.exchangeNotAllowed', 'No Exchanges Permitted'),
      icon: <XCircle size={14} className="text-rose-500" />,
    },
  ]

  // Restocking Fee Options
  const restockingOptions = [
    {
      value: 'all',
      label: t('policies.filters.allRestocking', 'All Restocking Rates'),
      icon: <Percent size={14} className="text-muted-foreground" />,
    },
    {
      value: 'free',
      label: t('policies.filters.freeRestocking', '0% Fee (Free Return Restocking)'),
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
    },
    {
      value: 'has_fee',
      label: t('policies.filters.hasRestockingFee', 'Fee Charged (> 0% e.g. 10%, 15%)'),
      icon: <Percent size={14} className="text-amber-500" />,
    },
  ]

  // Return Window Range Options
  const windowDaysOptions = [
    {
      value: 'all',
      label: t('policies.filters.allWindows', 'All Return Windows'),
      icon: <Clock size={14} className="text-muted-foreground" />,
    },
    {
      value: '7',
      label: t('policies.filters.days7', '7 Days Return Window'),
      icon: <Clock size={14} className="text-blue-500" />,
    },
    {
      value: '14',
      label: t('policies.filters.days14', '14 Days Return Window'),
      icon: <Clock size={14} className="text-indigo-500" />,
    },
    {
      value: '30',
      label: t('policies.filters.days30', '30 Days Return Window'),
      icon: <Clock size={14} className="text-purple-500" />,
    },
    {
      value: '0',
      label: t('policies.filters.days0', '0 Days (Strict Final Sale)'),
      icon: <AlertTriangle size={14} className="text-rose-500" />,
    },
  ]

  // Receipt Requirement
  const receiptOptions = [
    {
      value: 'all',
      label: t('policies.filters.allReceiptRules', 'All Receipt Rules'),
      icon: <FileText size={14} className="text-muted-foreground" />,
    },
    {
      value: 'required',
      label: t('policies.filters.receiptRequired', 'Must Require Official Receipt'),
      icon: <CheckCircle2 size={14} className="text-blue-500" />,
    },
    {
      value: 'not_required',
      label: t('policies.filters.receiptOptional', 'Receipt Not Strictly Required'),
      icon: <RotateCcw size={14} className="text-muted-foreground" />,
    },
  ]

  // Packaging Requirement
  const packagingOptions = [
    {
      value: 'all',
      label: t('policies.filters.allPackagingRules', 'All Box / Packaging Rules'),
      icon: <Package size={14} className="text-muted-foreground" />,
    },
    {
      value: 'required',
      label: t('policies.filters.packagingRequired', 'Must Require Original Packaging / Box'),
      icon: <CheckCircle2 size={14} className="text-indigo-500" />,
    },
    {
      value: 'not_required',
      label: t('policies.filters.packagingOptional', 'Original Box Not Required'),
      icon: <RotateCcw size={14} className="text-muted-foreground" />,
    },
  ]

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('policies.filterTitle', 'Filter Return & Exchange Policies')}
      activeCount={activeFiltersCount}
      applyLabel={
        activeFiltersCount > 0
          ? `${t('common.applyFilters', 'Apply Filters')} (${activeFiltersCount})`
          : t('common.applyFilters', 'Apply Filters')
      }
      resetLabel={t('common.reset', 'Reset All')}
    >
      {/* 1. Category / Coverage Filter */}
      <div>
        <FieldLabel label={t('policies.filters.appliesTo', 'Applies To / Category')} />
        <ModernSelect
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(String(val || 'all'))}
          options={categoryOptions}
          placeholder={t('policies.filters.allCategories', 'All Coverage')}
        />
      </div>

      {/* 2. Return Eligibility */}
      <div>
        <FieldLabel label={t('policies.filters.eligibility', 'Return Eligibility')} />
        <ModernSelect
          value={returnableFilter}
          onChange={(val) => setReturnableFilter(String(val || 'all'))}
          options={returnableOptions}
          placeholder={t('policies.filters.allEligibility', 'All Policies')}
        />
      </div>

      {/* 3. Exchange Allowance */}
      <div>
        <FieldLabel label={t('policies.filters.exchange', 'Exchange Allowed')} />
        <ModernSelect
          value={exchangeFilter}
          onChange={(val) => setExchangeFilter(String(val || 'all'))}
          options={exchangeOptions}
          placeholder={t('policies.filters.allExchanges', 'All Exchange Statuses')}
        />
      </div>

      {/* 4. Restocking Fee Rate */}
      <div>
        <FieldLabel label={t('policies.filters.restocking', 'Restocking Fee Rate')} />
        <ModernSelect
          value={restockingFilter}
          onChange={(val) => setRestockingFilter(String(val || 'all'))}
          options={restockingOptions}
          placeholder={t('policies.filters.allRestocking', 'All Restocking Rates')}
        />
      </div>

      {/* 5. Return Window Days */}
      <div>
        <FieldLabel label={t('policies.filters.window', 'Return Window Period')} />
        <ModernSelect
          value={windowDaysFilter}
          onChange={(val) => setWindowDaysFilter(String(val || 'all'))}
          options={windowDaysOptions}
          placeholder={t('policies.filters.allWindows', 'All Return Windows')}
        />
      </div>

      {/* 6. Receipt Requirement */}
      <div>
        <FieldLabel label={t('policies.filters.receiptRule', 'Receipt Requirement')} />
        <ModernSelect
          value={receiptFilter}
          onChange={(val) => setReceiptFilter(String(val || 'all'))}
          options={receiptOptions}
          placeholder={t('policies.filters.allReceiptRules', 'All Receipt Rules')}
        />
      </div>

      {/* 7. Packaging Requirement */}
      <div>
        <FieldLabel label={t('policies.filters.packagingRule', 'Original Packaging Requirement')} />
        <ModernSelect
          value={packagingFilter}
          onChange={(val) => setPackagingFilter(String(val || 'all'))}
          options={packagingOptions}
          placeholder={t('policies.filters.allPackagingRules', 'All Box Rules')}
        />
      </div>
    </FilterDrawerShell>
  )
}

export default ReturnPoliciesFilterDrawer
