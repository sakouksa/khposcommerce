import React from 'react'
import { useTranslation } from 'react-i18next'
import { FilterDrawerShell } from '@/components/shared/FilterDrawerShell'
import ModernSelect from '@/components/shared/ModernSelect'

interface SuppliersFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  countryFilter: string
  setCountryFilter: (val: string) => void
  cityFilter: string
  setCityFilter: (val: string) => void
  users: any[]
  createdByFilter: string
  setCreatedByFilter: (val: string) => void
  onReset: () => void
  setPage: (page: number) => void
}

const FieldLabel: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
)

export const SuppliersFilterDrawer: React.FC<SuppliersFilterDrawerProps> = ({
  isOpen,
  onClose,
  statusFilter,
  setStatusFilter,
  countryFilter,
  setCountryFilter,
  cityFilter,
  setCityFilter,
  users = [],
  createdByFilter,
  setCreatedByFilter,
  onReset,
  setPage,
}) => {
  const { t } = useTranslation(['suppliers', 'common'])

  const activeCount = [
    statusFilter,
    countryFilter,
    cityFilter,
    createdByFilter,
  ].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('suppliers.advancedFilters', 'Advanced Supplier Filters')}
      activeCount={activeCount}
      applyLabel={t('common.applyFilters', 'Apply Filters')}
      resetLabel={t('common.reset', 'Reset')}
    >
      {/* Status Filter */}
      <FieldLabel label={t('suppliers.status', 'Supplier Status')}>
        <ModernSelect
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(String(val))
            setPage(1)
          }}
          options={[
            { value: '', label: t('suppliers.allStatuses', 'All Statuses') },
            { value: '1', label: t('suppliers.active', 'Active') },
            { value: '0', label: t('suppliers.inactive', 'Inactive') },
          ]}
          placeholder={t('suppliers.allStatuses', 'All Statuses')}
        />
      </FieldLabel>

      {/* Country Filter */}
      <FieldLabel label={t('suppliers.country', 'Country')}>
        <input
          type="text"
          value={countryFilter}
          onChange={(e) => {
            setCountryFilter(e.target.value)
            setPage(1)
          }}
          placeholder={t('suppliers.countryPlaceholder', 'e.g. Cambodia, China, Thailand, Vietnam...')}
          className="w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400"
        />
      </FieldLabel>

      {/* City / Province Filter */}
      <FieldLabel label={t('suppliers.city', 'City / Province')}>
        <input
          type="text"
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value)
            setPage(1)
          }}
          placeholder={t('suppliers.cityPlaceholder', 'e.g. Phnom Penh, Bangkok, Shanghai, Hanoi...')}
          className="w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400"
        />
      </FieldLabel>

      {/* Created By User */}
      <FieldLabel label={t('suppliers.createdBy', 'Created By')}>
        <ModernSelect
          value={createdByFilter}
          onChange={(val) => {
            setCreatedByFilter(String(val))
            setPage(1)
          }}
          options={[
            { value: '', label: t('suppliers.allUsers', 'All Users') },
            ...(users ?? []).map((u: any) => ({
              value: String(u.id),
              label: u.name,
            })),
          ]}
          placeholder={t('suppliers.allUsers', 'All Users')}
        />
      </FieldLabel>
    </FilterDrawerShell>
  )
}
