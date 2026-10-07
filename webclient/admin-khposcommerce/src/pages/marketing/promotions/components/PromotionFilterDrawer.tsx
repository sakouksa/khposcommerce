import React from 'react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface PromotionFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterType: string
  setFilterType: (val: string) => void
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

export const PromotionFilterDrawer: React.FC<PromotionFilterDrawerProps> = ({
  isOpen, onClose,
  filterStatus, setFilterStatus,
  filterType, setFilterType,
  filterStartDate, setFilterStartDate,
  filterEndDate, setFilterEndDate,
  onReset,
}) => {
  const activeCount = [filterStatus !== 'all' ? filterStatus : '', filterType !== 'all' ? filterType : '', filterStartDate, filterEndDate].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="Filter Promotion Campaigns"
      activeCount={activeCount}
    >
      <FL label="Campaign Status">
        <ModernSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'running', label: 'Running Active' },
            { value: 'scheduled', label: 'Scheduled Future' },
            { value: 'expired', label: 'Expired Campaigns' },
            { value: 'paused', label: 'Paused / Inactive' },
          ]}
          placeholder="All Statuses"
        />
      </FL>

      <FL label="Promotion Type">
        <ModernSelect
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'discount', label: 'Direct Discount' },
            { value: 'buy_x_get_y', label: 'Buy X Get Y Free (BOGO)' },
            { value: 'bundle', label: 'Bundle Package Offer' },
            { value: 'tier_spending', label: 'Spend Threshold Bonus' },
          ]}
          placeholder="All Types"
        />
      </FL>

      <FL label="Starts From Date">
        <EnterpriseDatePicker
          value={filterStartDate}
          onChange={setFilterStartDate}
          placeholder="Select start date"
        />
      </FL>

      <FL label="Ends To Date">
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

export default PromotionFilterDrawer
