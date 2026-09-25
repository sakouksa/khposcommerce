import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar, DollarSign, Truck, Shield, Layers,
  CheckCircle2, Clock, CornerUpLeft, XCircle, AlertCircle
} from 'lucide-react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface OrdersFilterDrawerProps {
  open: boolean
  onClose: () => void
  statusFilter: string | undefined
  setStatusFilter: (val: string | undefined) => void
  paymentStatusFilter: string | undefined
  setPaymentStatusFilter: (val: string | undefined) => void
  fulfillmentStatusFilter: string | undefined
  setFulfillmentStatusFilter: (val: string | undefined) => void
  startDate: string
  setStartDate: (val: string) => void
  endDate: string
  setEndDate: (val: string) => void
  minTotal: string
  setMinTotal: (val: string) => void
  maxTotal: string
  setMaxTotal: (val: string) => void
  onReset: () => void
  onApply: () => void
  activeFiltersCount: number
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">{label}</label>
    {children}
  </div>
)

const inputCls = "w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const OrdersFilterDrawer: React.FC<OrdersFilterDrawerProps> = ({
  open,
  onClose,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  fulfillmentStatusFilter,
  setFulfillmentStatusFilter,
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
  const { t } = useTranslation(['orders', 'common'])

  const statusOptions = [
    { value: '', label: t('allOrderStatuses', 'All Order Statuses'), icon: <Layers size={14} className="text-muted-foreground" /> },
    { value: 'pending', label: t('pending', 'Pending'), icon: <Clock size={14} className="text-amber-500" /> },
    { value: 'confirmed', label: t('confirmed', 'Confirmed'), icon: <CheckCircle2 size={14} className="text-blue-500" /> },
    { value: 'processing', label: t('processing', 'Processing'), icon: <Clock size={14} className="text-indigo-500" /> },
    { value: 'shipped', label: t('shipped', 'Shipped'), icon: <Truck size={14} className="text-sky-500" /> },
    { value: 'delivered', label: t('delivered', 'Delivered'), icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { value: 'completed', label: t('completed', 'Completed'), icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { value: 'cancelled', label: t('cancelled', 'Cancelled'), icon: <XCircle size={14} className="text-rose-500" /> },
    { value: 'refunded', label: t('refunded', 'Refunded'), icon: <CornerUpLeft size={14} className="text-purple-500" /> },
  ]

  const paymentStatusOptions = [
    { value: '', label: t('allPaymentStatuses', 'All Payment Statuses'), icon: <Shield size={14} className="text-muted-foreground" /> },
    { value: 'paid', label: t('paid', 'Paid'), icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { value: 'unpaid', label: t('unpaid', 'Unpaid'), icon: <XCircle size={14} className="text-rose-500" /> },
    { value: 'partial', label: t('partial', 'Partial'), icon: <Clock size={14} className="text-amber-500" /> },
    { value: 'refunded', label: t('refunded', 'Refunded'), icon: <CornerUpLeft size={14} className="text-purple-500" /> },
  ]

  const fulfillmentStatusOptions = [
    { value: '', label: t('allFulfillmentStatuses', 'All Fulfillment Statuses'), icon: <Truck size={14} className="text-muted-foreground" /> },
    { value: 'fulfilled', label: t('fulfilled', 'Fulfilled'), icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
    { value: 'unfulfilled', label: t('unfulfilled', 'Unfulfilled'), icon: <AlertCircle size={14} className="text-amber-500" /> },
    { value: 'partial', label: t('partial', 'Partial'), icon: <Clock size={14} className="text-blue-500" /> },
  ]

  return (
    <FilterDrawerShell
      isOpen={open}
      onClose={onClose}
      onReset={onReset}
      title={t('filterWebOrders', 'Filter Web E-Commerce Orders')}
      activeCount={activeFiltersCount}
      applyLabel={`${t('applyFilters', 'Apply Filters')} (${activeFiltersCount})`}
      resetLabel={t('resetAll', 'Reset All')}
    >
      {/* 1. Order Status */}
      <FL label={t('orderStatus', 'Order Status')}>
        <ModernSelect
          value={statusFilter || ''}
          onChange={(val) => setStatusFilter(String(val || '') || undefined)}
          options={statusOptions}
          placeholder={t('allOrderStatuses', 'All Order Statuses')}
        />
      </FL>

      {/* 2. Payment Status */}
      <FL label={t('paymentStatus', 'Payment Status')}>
        <ModernSelect
          value={paymentStatusFilter || ''}
          onChange={(val) => setPaymentStatusFilter(String(val || '') || undefined)}
          options={paymentStatusOptions}
          placeholder={t('allPaymentStatuses', 'All Payment Statuses')}
        />
      </FL>

      {/* 3. Fulfillment Status */}
      <FL label={t('fulfillmentStatus', 'Fulfillment Status')}>
        <ModernSelect
          value={fulfillmentStatusFilter || ''}
          onChange={(val) => setFulfillmentStatusFilter(String(val || '') || undefined)}
          options={fulfillmentStatusOptions}
          placeholder={t('allFulfillmentStatuses', 'All Fulfillment Statuses')}
        />
      </FL>

      {/* 4. Date Range */}
      <FL label={t('orderDateRange', 'Order Date Range')}>
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
      </FL>

      {/* 5. Total Amount Range */}
      <FL label={t('orderTotalRange', 'Order Total Range ($)')}>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground dark:text-slate-400">$</span>
            <input
              type="number"
              placeholder={t('minPricePlaceholder', 'Min $ (e.g. 10)')}
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              className={`${inputCls} pl-7`}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground dark:text-slate-400">$</span>
            <input
              type="number"
              placeholder={t('maxPricePlaceholder', 'Max $ (e.g. 500)')}
              value={maxTotal}
              onChange={(e) => setMaxTotal(e.target.value)}
              className={`${inputCls} pl-7`}
            />
          </div>
        </div>
      </FL>
    </FilterDrawerShell>
  )
}

export default OrdersFilterDrawer
