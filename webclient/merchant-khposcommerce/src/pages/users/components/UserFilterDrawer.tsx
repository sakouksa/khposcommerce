import React from 'react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface UserFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  roles?: any[]
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterRole: string
  setFilterRole: (val: string) => void
  filterStartDate: string
  setFilterStartDate: (val: string) => void
  filterEndDate: string
  setFilterEndDate: (val: string) => void
  filterVerified: string
  setFilterVerified: (val: string) => void
  filter2FA: string
  setFilter2FA: (val: string) => void
  onReset: () => void
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

const inputCls = "w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const UserFilterDrawer: React.FC<UserFilterDrawerProps> = ({
  isOpen, onClose,
  roles = [],
  filterStatus, setFilterStatus,
  filterRole, setFilterRole,
  filterStartDate, setFilterStartDate,
  filterEndDate, setFilterEndDate,
  filterVerified, setFilterVerified,
  filter2FA, setFilter2FA,
  onReset,
}) => {
  const activeCount = [filterStatus !== 'all' ? filterStatus : '', filterRole !== 'all' ? filterRole : '', filterStartDate, filterEndDate, filterVerified !== 'all' ? filterVerified : '', filter2FA !== 'all' ? filter2FA : ''].filter(Boolean).length

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin / Super Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'staff', label: 'Staff' },
    ...roles.map((r: any) => ({ value: r.name, label: r.name }))
  ]

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="Filter Users Directory"
      activeCount={activeCount}
    >
      <FL label="Account Status">
        <ModernSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active Accounts' },
            { value: 'inactive', label: 'Inactive Accounts' },
            { value: 'blocked', label: 'Blocked / Suspended' },
          ]}
          placeholder="All Statuses"
        />
      </FL>

      <FL label="System Role">
        <ModernSelect
          value={filterRole}
          onChange={setFilterRole}
          options={roleOptions}
          placeholder="All Roles"
        />
      </FL>

      <FL label="Joined From Date">
        <EnterpriseDatePicker
          value={filterStartDate}
          onChange={setFilterStartDate}
          placeholder="Select joined from date"
        />
      </FL>

      <FL label="Joined To Date">
        <EnterpriseDatePicker
          value={filterEndDate}
          onChange={setFilterEndDate}
          placeholder="Select joined to date"
        />
      </FL>

      <FL label="Email Verification">
        <ModernSelect
          value={filterVerified}
          onChange={setFilterVerified}
          options={[
            { value: 'all', label: 'All Users' },
            { value: 'verified', label: 'Verified Emails Only' },
            { value: 'unverified', label: 'Unverified Only' },
          ]}
          placeholder="All Users"
        />
      </FL>

      <FL label="2FA Authentication">
        <ModernSelect
          value={filter2FA}
          onChange={setFilter2FA}
          options={[
            { value: 'all', label: 'All Users' },
            { value: 'enabled', label: '2FA Enabled' },
            { value: 'disabled', label: '2FA Disabled' },
          ]}
          placeholder="All Users"
        />
      </FL>
    </FilterDrawerShell>
  )
}

export default UserFilterDrawer
