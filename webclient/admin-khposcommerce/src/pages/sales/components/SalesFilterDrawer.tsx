import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar, DollarSign, CreditCard, Shield, Layers,
  CheckCircle2, Clock, CornerUpLeft, XCircle, QrCode, Building2
} from 'lucide-react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface SalesFilterDrawerProps {
  open: boolean
  onClose: () => void
  statusFilter: string | undefined
  setStatusFilter: (status: string | undefined) => void
  paymentStatusFilter: string | undefined
  setPaymentStatusFilter: (paymentStatus: string | undefined) => void
  paymentMethodFilter: string | undefined
  setPaymentMethodFilter: (paymentMethod: string | undefined) => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
  minTotal: string
  setMinTotal: (amount: string) => void
  maxTotal: string
  setMaxTotal: (amount: string) => void
  onReset: () => void
  onApply: () => void
  activeFiltersCount: number
}

const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
)

const inputClassName = "w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const SalesFilterDrawer: React.FC<SalesFilterDrawerProps> = ({
  open,
  onClose,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  minTotal,
  setMinTotal,
  maxTotal,
  setMaxTotal,
  onReset,
  onApply,
  activeFiltersCount,
}) => {
  const { t } = useTranslation(['sales', 'common'])

  const statusOptions = [
    { value: '', label: t('allStatuses', 'All Statuses'), icon: <Layers size={14} className="text-muted-foreground" /> },
    { value: 'completed', label: t('completed', 'Completed'), icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { value: 'pending', label: t('pending', 'Pending'), icon: <Clock size={14} className="text-amber-500" /> },
    { value: 'refunded', label: t('refunded', 'Refunded'), icon: <CornerUpLeft size={14} className="text-purple-500" /> },
    { value: 'cancelled', label: t('cancelled', 'Cancelled'), icon: <XCircle size={14} className="text-rose-500" /> },
  ]

  const paymentStatusOptions = [
    { value: '', label: t('allPaymentStatuses', 'All Payment Statuses'), icon: <Shield size={14} className="text-muted-foreground" /> },
    { value: 'paid', label: t('paid', 'Paid'), icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { value: 'unpaid', label: t('unpaid', 'Unpaid'), icon: <XCircle size={14} className="text-rose-500" /> },
    { value: 'partial', label: t('partial', 'Partial'), icon: <Clock size={14} className="text-amber-500" /> },
    { value: 'refunded', label: t('refunded', 'Refunded'), icon: <CornerUpLeft size={14} className="text-purple-500" /> },
  ]

  const paymentMethodOptions = [
    { value: '', label: t('allPaymentMethods', 'All Payment Methods'), icon: <CreditCard size={14} className="text-muted-foreground" /> },
    { value: 'cash', label: t('cashPayment', 'Cash Payment'), icon: <DollarSign size={14} className="text-emerald-500" /> },
    { value: 'card', label: t('creditDebitCard', 'Credit/Debit Card'), icon: <CreditCard size={14} className="text-indigo-500" /> },
    { value: 'qr', label: 'ABA / KHQR', icon: <QrCode size={14} className="text-rose-500" /> },
    { value: 'bank_transfer', label: t('bankTransfer', 'Bank Transfer'), icon: <Building2 size={14} className="text-blue-500" /> },
  ]

  return (
    <FilterDrawerShell
      isOpen={open}
      onClose={onClose}
      onReset={onReset}
      title={t('filterSalesOrders', 'Filter Sales Orders')}
      activeCount={activeFiltersCount}
      applyLabel={`${t('applyFilters', 'Apply Filters')} (${activeFiltersCount})`}
      resetLabel={t('resetAll', 'Reset All')}
    >
      {/* 1. Order Status */}
      <FilterField label={t('orderStatus', 'Order Status')}>
        <ModernSelect
          value={statusFilter || ''}
          onChange={(selectedOption) => setStatusFilter(String(selectedOption || '') || undefined)}
          options={statusOptions}
          placeholder={t('allStatuses', 'All Statuses')}
        />
      </FilterField>

      {/* 2. Payment Status */}
      <FilterField label={t('paymentStatusLabel', 'Payment Status')}>
        <ModernSelect
          value={paymentStatusFilter || ''}
          onChange={(selectedOption) => setPaymentStatusFilter(String(selectedOption || '') || undefined)}
          options={paymentStatusOptions}
          placeholder={t('allPaymentStatuses', 'All Payment Statuses')}
        />
      </FilterField>

      {/* 3. Payment Method */}
      <FilterField label={t('paymentMethod', 'Payment Method')}>
        <ModernSelect
          value={paymentMethodFilter || ''}
          onChange={(selectedOption) => setPaymentMethodFilter(String(selectedOption || '') || undefined)}
          options={paymentMethodOptions}
          placeholder={t('allPaymentMethods', 'All Payment Methods')}
        />
      </FilterField>

      {/* 4. Date Range */}
      <FilterField label={t('transactionDateRange', 'Transaction Date Range')}>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground dark:text-slate-400 block mb-1">{t('fromDate', 'From Date')}</span>
            <EnterpriseDatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder={t('fromDate', 'From Date')}
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground dark:text-slate-400 block mb-1">{t('toDate', 'To Date')}</span>
            <EnterpriseDatePicker
              value={endDate}
              minDate={startDate}
              onChange={setEndDate}
              placeholder={t('toDate', 'To Date')}
            />
          </div>
        </div>
      </FilterField>

      {/* 5. Total Amount Range */}
      <FilterField label={t('grandTotalRange', 'Grand Total Range ($)')}>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground dark:text-slate-400">$</span>
            <input
              type="number"
              placeholder={t('minPricePlaceholder', 'Min $ (e.g. 10)')}
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              className={`${inputClassName} pl-7`}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground dark:text-slate-400">$</span>
            <input
              type="number"
              placeholder={t('maxPricePlaceholder', 'Max $ (e.g. 500)')}
              value={maxTotal}
              onChange={(e) => setMaxTotal(e.target.value)}
              className={`${inputClassName} pl-7`}
            />
          </div>
        </div>
      </FilterField>
    </FilterDrawerShell>
  )
}

export default SalesFilterDrawer
