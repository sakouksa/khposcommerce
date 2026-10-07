import React from 'react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '@/stores/themeStore'
import { getCustomerGroupDisplayName } from '../utils/customerGroupFormatters'

interface CustomerFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  groupIdFilter: string
  setGroupIdFilter: (val: string) => void
  genderFilter: string
  setGenderFilter: (val: string) => void
  rfmFilter?: string
  setRfmFilter?: (val: string) => void
  paymentTermsFilter?: string
  setPaymentTermsFilter?: (val: string) => void
  creditHoldFilter?: string
  setCreditHoldFilter?: (val: string) => void
  groups: any[]
  onReset: () => void
  rfmBreakdown?: Record<string, number>
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

export const CustomerFilterDrawer: React.FC<CustomerFilterDrawerProps> = ({
  isOpen, onClose,
  statusFilter, setStatusFilter,
  groupIdFilter, setGroupIdFilter,
  genderFilter, setGenderFilter,
  rfmFilter = '', setRfmFilter,
  paymentTermsFilter = '', setPaymentTermsFilter,
  creditHoldFilter = '', setCreditHoldFilter,
  groups = [],
  onReset,
  rfmBreakdown,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['customers', 'common'])

  const activeCount = [
    statusFilter !== 'all' ? statusFilter : '',
    groupIdFilter,
    genderFilter,
    rfmFilter,
    paymentTermsFilter,
    creditHoldFilter,
  ].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('customers.filterCustomers', 'Filter Customers & B2B Tiers')}
      activeCount={activeCount}
      applyLabel={t('customers.applyFilters', 'Apply Filters')}
      resetLabel={t('customers.resetFilters', 'Reset Filters')}
    >
      <FL label={t('customers.accountStatus', 'Account Status')}>
        <ModernSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: t('customers.allStatuses', 'All Statuses') },
            { value: 'active', label: t('customers.activeAccounts', 'Active Accounts') },
            { value: 'inactive', label: t('customers.inactiveAccounts', 'Inactive Accounts') },
          ]}
          placeholder={t('customers.allStatuses', 'All Statuses')}
        />
      </FL>

      <FL label={t('customers.rfmSegmentFilter', 'RFM Segment & Lifecycle')}>
        <ModernSelect
          value={rfmFilter}
          onChange={(val) => setRfmFilter && setRfmFilter(val)}
          options={[
            { value: '', label: t('customers.allRfmSegments', 'All Segments') },
            {
              value: 'champions',
              label: `${t('customers.rfmChampions', 'Champions')}${rfmBreakdown?.champions !== undefined ? ` (${rfmBreakdown.champions})` : ''}`,
            },
            {
              value: 'loyal',
              label: `${t('customers.rfmLoyal', 'Loyal Customers')}${rfmBreakdown?.loyal !== undefined ? ` (${rfmBreakdown.loyal})` : ''}`,
            },
            {
              value: 'potential',
              label: `${t('customers.rfmPotential', 'Potential Loyalists')}${rfmBreakdown?.potential !== undefined ? ` (${rfmBreakdown.potential})` : ''}`,
            },
            {
              value: 'at_risk',
              label: `${t('customers.rfmAtRisk', 'At-Risk (Churn Warning)')}${rfmBreakdown?.at_risk !== undefined ? ` (${rfmBreakdown.at_risk})` : ''}`,
            },
            {
              value: 'hibernating',
              label: `${t('customers.rfmHibernating', 'Hibernating / Inactive')}${rfmBreakdown?.hibernating !== undefined ? ` (${rfmBreakdown.hibernating})` : ''}`,
            },
            {
              value: 'new',
              label: `${t('customers.rfmNew', 'New Customers')}${rfmBreakdown?.new !== undefined ? ` (${rfmBreakdown.new})` : ''}`,
            },
          ]}
          placeholder={t('customers.allRfmSegments', 'All Segments')}
        />
      </FL>

      <FL label={t('customers.paymentTermsFilter', 'Payment Terms (B2B Credit)')}>
        <ModernSelect
          value={paymentTermsFilter}
          onChange={(val) => setPaymentTermsFilter && setPaymentTermsFilter(val)}
          options={[
            { value: '', label: t('customers.allTerms', 'All Payment Terms') },
            { value: 'prepaid', label: t('customers.termPrepaid', 'Prepaid (Direct Pay)') },
            { value: 'net_15', label: t('customers.paymentTermNet15', 'Net 15') },
            { value: 'net_30', label: t('customers.paymentTermNet30', 'Net 30') },
            { value: 'net_60', label: t('customers.paymentTermNet60', 'Net 60') },
            { value: 'eom', label: t('customers.paymentTermEom', 'End of Month (EOM)') },
          ]}
          placeholder={t('customers.allTerms', 'All Payment Terms')}
        />
      </FL>

      <FL label={t('customers.creditHoldFilter', 'Credit Hold Status')}>
        <ModernSelect
          value={creditHoldFilter}
          onChange={(val) => setCreditHoldFilter && setCreditHoldFilter(val)}
          options={[
            { value: '', label: t('customers.allCreditStatuses', 'All Accounts') },
            { value: 'true', label: t('customers.creditHoldLocked', 'Locked / On Credit Hold') },
            { value: 'false', label: t('customers.creditHoldUnlocked', 'Active Credit Limit') },
          ]}
          placeholder={t('customers.allCreditStatuses', 'All Accounts')}
        />
      </FL>

      <FL label={t('customers.customerGroup', 'Customer Group')}>
        <ModernSelect
          value={groupIdFilter}
          onChange={setGroupIdFilter}
          options={[
            { value: '', label: t('customers.allGroups', 'All Groups') },
            ...groups.map((g: any) => ({
              value: String(g.id),
              label: getCustomerGroupDisplayName(g.name, t, language),
            }))
          ]}
          placeholder={t('customers.allGroups', 'All Groups')}
        />
      </FL>

      <FL label={t('customers.gender', 'Gender')}>
        <ModernSelect
          value={genderFilter}
          onChange={setGenderFilter}
          options={[
            { value: '', label: t('customers.allGenders', 'All Genders') },
            { value: 'male', label: t('customers.genderMale', 'Male') },
            { value: 'female', label: t('customers.genderFemale', 'Female') },
            { value: 'other', label: t('customers.genderOther', 'Other') },
          ]}
          placeholder={t('customers.allGenders', 'All Genders')}
        />
      </FL>
    </FilterDrawerShell>
  )
}

export default CustomerFilterDrawer
