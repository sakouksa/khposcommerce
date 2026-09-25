import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseMonthPicker } from '@/components/common'

export type MonthlyAttendanceFilterType = 'all' | 'regular' | 'late' | 'overtime' | 'absent'

interface MonthlyAttendanceFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  periodMonth: string
  onMonthChange: (val: string) => void
  activeFilter: MonthlyAttendanceFilterType
  setActiveFilter: (val: MonthlyAttendanceFilterType) => void
  departmentFilter: string
  setDepartmentFilter: (val: string) => void
  departmentsList?: string[]
  filterCounts?: {
    all?: number
    regular?: number
    late?: number
    overtime?: number
    absent?: number
  }
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
)

export const MonthlyAttendanceFilterDrawer: React.FC<MonthlyAttendanceFilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  periodMonth,
  onMonthChange,
  activeFilter,
  setActiveFilter,
  departmentFilter,
  setDepartmentFilter,
  departmentsList = [],
  filterCounts,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  // Quick preset strings (This month, Previous Month, 2 Months Ago)
  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), [])

  const lastMonthStr = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().substring(0, 7)
  }, [])

  const twoMonthsAgoStr = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 2)
    return d.toISOString().substring(0, 7)
  }, [])

  const isCustomMonth = Boolean(periodMonth && currentMonthStr && periodMonth !== currentMonthStr)

  const activeCount = [
    isCustomMonth ? periodMonth : '',
    departmentFilter !== 'all' && departmentFilter ? departmentFilter : '',
    activeFilter !== 'all' && activeFilter ? activeFilter : '',
  ].filter(Boolean).length

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
      {/* 1. Period Month Filter */}
      <FL label={t('employees.period_month', 'Period Month')}>
        <div className="space-y-2">
          <EnterpriseMonthPicker
            value={periodMonth || null}
            onChange={(val) => {
              if (val) {
                onMonthChange(val)
              }
            }}
            placeholder={t('employees.select_month', 'Select Month')}
            clearable={false}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMonthChange(currentMonthStr)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                periodMonth === currentMonthStr
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t('employees.this_month', 'This Month')}
            </button>
            <button
              type="button"
              onClick={() => onMonthChange(lastMonthStr)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                periodMonth === lastMonthStr
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t('employees.previous_month', 'Previous Month')}
            </button>
            <button
              type="button"
              onClick={() => onMonthChange(twoMonthsAgoStr)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                periodMonth === twoMonthsAgoStr
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t('employees.two_months_ago', '2 Months Ago')}
            </button>
          </div>
        </div>
      </FL>

      {/* 2. Attendance Status Filter */}
      <FL label={t('employees.status', 'Attendance Status')}>
        <ModernSelect
          value={activeFilter}
          onChange={(val) => setActiveFilter(val as MonthlyAttendanceFilterType)}
          options={[
            {
              value: 'all',
              label: `${t('employees.allStaff', 'All Staff')}${filterCounts?.all !== undefined ? ` (${filterCounts.all})` : ''}`,
            },
            {
              value: 'regular',
              label: `${t('employees.regular_attendance', 'Regular (≥90%)')}${filterCounts?.regular !== undefined ? ` (${filterCounts.regular})` : ''}`,
            },
            {
              value: 'late',
              label: `${t('employees.late_arrivals', 'Late Arrivals')}${filterCounts?.late !== undefined ? ` (${filterCounts.late})` : ''}`,
            },
            {
              value: 'overtime',
              label: `${t('employees.overtime_filter', 'Overtime')}${filterCounts?.overtime !== undefined ? ` (${filterCounts.overtime})` : ''}`,
            },
            {
              value: 'absent',
              label: `${t('employees.absent_filter', 'Absences')}${filterCounts?.absent !== undefined ? ` (${filterCounts.absent})` : ''}`,
            },
          ]}
          placeholder={t('employees.all_filter', 'All Statuses')}
        />
      </FL>

      {/* 3. Department Filter */}
      {departmentsList.length > 0 && (
        <FL label={t('employees.department', 'Department')}>
          <ModernSelect
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={[
              { value: 'all', label: t('employees.all_departments', 'All Departments') },
              ...departmentsList.map((dept) => ({ value: dept, label: dept })),
            ]}
            placeholder={t('employees.all_departments', 'All Departments')}
          />
        </FL>
      )}
    </FilterDrawerShell>
  )
}

export default MonthlyAttendanceFilterDrawer
