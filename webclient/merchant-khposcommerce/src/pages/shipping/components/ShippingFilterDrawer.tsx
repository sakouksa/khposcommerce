import React from 'react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface ShippingFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterCourier: string
  setFilterCourier: (val: string) => void
  filterProvince: string
  setFilterProvince: (val: string) => void
  filterCity: string
  setFilterCity: (val: string) => void
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

export const ShippingFilterDrawer: React.FC<ShippingFilterDrawerProps> = ({
  isOpen, onClose,
  filterStatus, setFilterStatus,
  filterCourier, setFilterCourier,
  filterProvince, setFilterProvince,
  filterCity, setFilterCity,
  filterStartDate, setFilterStartDate,
  filterEndDate, setFilterEndDate,
  onReset,
}) => {
  const activeCount = [filterStatus !== 'all' ? filterStatus : '', filterCourier !== 'all' ? filterCourier : '', filterProvince, filterCity, filterStartDate, filterEndDate].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="Filter Logistics Records"
      activeCount={activeCount}
    >
      <FL label="Shipment Status">
        <ModernSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending Pickup' },
            { value: 'shipped', label: 'In Transit / Shipped' },
            { value: 'delivered', label: 'Delivered Successfully' },
            { value: 'failed', label: 'Failed Delivery' },
            { value: 'returned', label: 'Returned to Sender' },
          ]}
          placeholder="All Statuses"
        />
      </FL>

      <FL label="Courier Carrier">
        <ModernSelect
          value={filterCourier}
          onChange={setFilterCourier}
          options={[
            { value: 'all', label: 'All Carriers' },
            { value: 'dhl', label: 'DHL Express' },
            { value: 'fedex', label: 'FedEx Priority' },
            { value: 'ups', label: 'UPS Logistics' },
            { value: 'local_express', label: 'Local Express' },
          ]}
          placeholder="All Carriers"
        />
      </FL>

      <FL label="Destination Province / State">
        <input type="text" value={filterProvince} onChange={e => setFilterProvince(e.target.value)} placeholder="e.g. Phnom Penh, California" className={inputCls} />
      </FL>

      <FL label="Destination City">
        <input type="text" value={filterCity} onChange={e => setFilterCity(e.target.value)} placeholder="e.g. Siem Reap, Los Angeles" className={inputCls} />
      </FL>

      <FL label="Created From Date">
        <EnterpriseDatePicker
          value={filterStartDate}
          onChange={setFilterStartDate}
          placeholder="Select created from date"
        />
      </FL>

      <FL label="Created To Date">
        <EnterpriseDatePicker
          value={filterEndDate}
          onChange={setFilterEndDate}
          placeholder="Select created to date"
        />
      </FL>
    </FilterDrawerShell>
  )
}

export default ShippingFilterDrawer
