import React from 'react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { useTranslation } from 'react-i18next'

interface BannerFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  positionFilter: string
  setPositionFilter: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  onReset: () => void
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

export const BannerFilterDrawer: React.FC<BannerFilterDrawerProps> = ({
  isOpen,
  onClose,
  positionFilter,
  setPositionFilter,
  statusFilter,
  setStatusFilter,
  onReset,
}) => {
  const { t } = useTranslation(['marketing', 'customers', 'common'])

  const activeCount = [positionFilter !== 'all' ? positionFilter : '', statusFilter !== 'all' ? statusFilter : ''].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('marketing.filterBanners', 'Filter Banners')}
      activeCount={activeCount}
      applyLabel={t('customers.applyFilters', 'Apply Filters')}
      resetLabel={t('customers.resetFilters', 'Reset Filters')}
    >
      {/* Position Filter */}
      <FL label={t('marketing.position', 'Position')}>
        <ModernSelect
          value={positionFilter}
          onChange={setPositionFilter}
          options={[
            { value: 'all', label: t('marketing.allPositions', 'All Positions') },
            { value: 'hero', label: t('marketing.posHero', 'Hero Banner') },
            { value: 'sidebar', label: t('marketing.posSidebar', 'Sidebar Banner') },
            { value: 'popup', label: t('marketing.posPopup', 'Popup Banner') },
            { value: 'footer', label: t('marketing.posFooter', 'Footer Banner') },
          ]}
          placeholder={t('marketing.allPositions', 'All Positions')}
        />
      </FL>

      {/* Status Filter */}
      <FL label={t('marketing.activeStatus', 'Status')}>
        <ModernSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: t('marketing.allStatuses', 'All Statuses') },
            { value: 'active', label: t('marketing.active', 'Active') },
            { value: 'inactive', label: t('marketing.inactive', 'Inactive') },
          ]}
          placeholder={t('marketing.allStatuses', 'All Statuses')}
        />
      </FL>
    </FilterDrawerShell>
  )
}

export default BannerFilterDrawer
