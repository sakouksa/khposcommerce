import React from 'react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface CouponFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterType: string
  setFilterType: (val: string) => void
  filterMinDiscount: string
  setFilterMinDiscount: (val: string) => void
  filterMaxDiscount: string
  setFilterMaxDiscount: (val: string) => void
  filterUsageLimit: string
  setFilterUsageLimit: (val: string) => void
  filterStartDate: string
  setFilterStartDate: (val: string) => void
  filterEndDate: string
  setFilterEndDate: (val: string) => void
  onReset: () => void
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

const inputCls = "w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const CouponFilterDrawer: React.FC<CouponFilterDrawerProps> = ({
  isOpen, onClose,
  filterStatus, setFilterStatus,
  filterType, setFilterType,
  filterMinDiscount, setFilterMinDiscount,
  filterMaxDiscount, setFilterMaxDiscount,
  filterUsageLimit, setFilterUsageLimit,
  filterStartDate, setFilterStartDate,
  filterEndDate, setFilterEndDate,
  onReset,
}) => {
  const activeCount = [filterStatus !== 'all' ? filterStatus : '', filterType !== 'all' ? filterType : '', filterMinDiscount, filterMaxDiscount, filterUsageLimit !== 'all' ? filterUsageLimit : '', filterStartDate, filterEndDate].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="Filter Coupons & Vouchers"
      activeCount={activeCount}
    >
      <FL label="Coupon Status">
        <ModernSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active & Usable' },
            { value: 'inactive', label: 'Inactive / Paused' },
            { value: 'expired', label: 'Expired Vouchers' },
            { value: 'scheduled', label: 'Scheduled Future' },
          ]}
          placeholder="All Statuses"
        />
      </FL>

      <FL label="Discount Type">
        <ModernSelect
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'percentage', label: 'Percentage (%)' },
            { value: 'fixed', label: 'Fixed Amount ($)' },
            { value: 'free_shipping', label: 'Free Shipping' },
          ]}
          placeholder="All Types"
        />
      </FL>

      <div className="grid grid-cols-2 gap-2.5">
        <FL label="Min Discount">
          <input type="number" value={filterMinDiscount} onChange={e => setFilterMinDiscount(e.target.value)} placeholder="0" className={inputCls} />
        </FL>
        <FL label="Max Discount">
          <input type="number" value={filterMaxDiscount} onChange={e => setFilterMaxDiscount(e.target.value)} placeholder="100" className={inputCls} />
        </FL>
      </div>

      <FL label="Usage Limit Policy">
        <ModernSelect
          value={filterUsageLimit}
          onChange={setFilterUsageLimit}
          options={[
            { value: 'all', label: 'All Limits' },
            { value: 'unlimited', label: 'Unlimited Uses' },
            { value: 'limited', label: 'Limited Quantity Uses' },
          ]}
          placeholder="All Limits"
        />
      </FL>

      <FL label="Expires From Date">
        <EnterpriseDatePicker
          value={filterStartDate}
          onChange={setFilterStartDate}
          placeholder="Select start date"
        />
      </FL>

      <FL label="Expires To Date">
        <EnterpriseDatePicker
          value={filterEndDate}
          minDate={filterStartDate}
          onChange={setFilterEndDate}
          placeholder="Select end date"
        />
      </FL>
    </FilterDrawerShell>
  )
}

export default CouponFilterDrawer
