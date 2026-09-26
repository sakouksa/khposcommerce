import React from 'react'
import { useTranslation } from 'react-i18next'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface LeaveFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  startDate: string
  setStartDate: (val: string) => void
  endDate: string
  setEndDate: (val: string) => void
  leaveType: string
  setLeaveType: (val: string) => void
  status: string
  setStatus: (val: string) => void
  timeframe: string
  setTimeframe: (val: string) => void
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
)

export const LeaveFilterDrawer: React.FC<LeaveFilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  leaveType,
  setLeaveType,
  status,
  setStatus,
  timeframe,
  setTimeframe,
}) => {
  const { t } = useTranslation(['employees', 'common'])

  const activeCount = [
    startDate,
    endDate,
    leaveType,
    status,
    timeframe !== '7days' && timeframe !== 'all' && timeframe ? timeframe : '',
  ].filter(Boolean).length

  const leaveTypeOptions = [
    { value: '', label: t('employees.all_leave_types', 'All Leave Types') },
    { value: 'annual', label: t('employees.annual_leave', 'Annual Leave') },
    { value: 'sick', label: t('employees.sick_leave', 'Medical Leave') },
    { value: 'special', label: t('employees.special_leave', 'Casual Leave') },
    { value: 'maternity', label: t('employees.maternity_leave', 'Maternity Leave') },
    { value: 'unpaid', label: t('employees.unpaid_leave', 'Unpaid Leave') },
  ]

  const statusOptions = [
    { value: '', label: t('common.allStatus', 'All Statuses') },
    { value: 'pending', label: t('employees.pending', 'Pending Approval') },
    { value: 'approved', label: t('employees.approved', 'Approved') },
    { value: 'rejected', label: t('employees.rejected', 'Rejected') },
  ]

  const timeframeOptions = [
    { value: '7days', label: t('employees.last_7_days', 'Last 7 Days') },
    { value: 'month', label: t('employees.this_month', 'This Month') },
    { value: 'year', label: t('employees.this_year', 'This Year') },
    { value: 'all', label: t('employees.all_time', 'All Time') },
  ]

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('employees.advanced_filters', 'Advanced Filters')}
      activeCount={activeCount}
      applyLabel={t('common.applyFilters', 'Apply Filters')}
      resetLabel={t('common.reset', 'Reset')}
    >
      <div className="space-y-4">
        {/* 1. Timeframe */}
        <FL label={t('employees.timeframe', 'Timeframe Period')}>
          <ModernSelect
            value={timeframe || '7days'}
            onChange={setTimeframe}
            options={timeframeOptions}
            placeholder={t('employees.select_timeframe', 'Select Timeframe')}
          />
        </FL>

        {/* 2. Custom Date Range */}
        <FL label={t('employees.date_range', 'Date Range')}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1">
                {t('employees.start_date', 'From Date')}
              </span>
              <EnterpriseDatePicker
                value={startDate || null}
                onChange={(val) => setStartDate(val || '')}
                placeholder="YYYY-MM-DD"
                clearable
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1">
                {t('employees.end_date', 'To Date')}
              </span>
              <EnterpriseDatePicker
                value={endDate || null}
                onChange={(val) => setEndDate(val || '')}
                placeholder="YYYY-MM-DD"
                clearable
              />
            </div>
          </div>
        </FL>

        {/* 3. Leave Type */}
        <FL label={t('employees.leave_type', 'Leave Type')}>
          <ModernSelect
            value={leaveType}
            onChange={setLeaveType}
            options={leaveTypeOptions}
            placeholder={t('employees.all_leave_types', 'All Leave Types')}
          />
        </FL>

        {/* 4. Approval Status */}
        <FL label={t('employees.approval_status', 'Approval Status')}>
          <ModernSelect
            value={status}
            onChange={setStatus}
            options={statusOptions}
            placeholder={t('common.allStatus', 'All Statuses')}
          />
        </FL>
      </div>
    </FilterDrawerShell>
  )
}

export default LeaveFilterDrawer
