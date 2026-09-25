import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface AttendanceFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  onReset: () => void
  selectedDate?: string
  setSelectedDate?: (val: string) => void
  todayStr?: string
  statusFilter: string
  setStatusFilter: (val: string) => void
  departmentFilter: string
  setDepartmentFilter: (val: string) => void
  shiftFilter?: string
  setShiftFilter?: (val: string) => void
  branchFilter?: string
  setBranchFilter?: (val: string) => void
  departmentsList?: string[]
  shiftsList?: any[]
  branchesList?: any[]
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
)

export const AttendanceFilterDrawer: React.FC<AttendanceFilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  selectedDate,
  setSelectedDate,
  todayStr,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  shiftFilter = 'all',
  setShiftFilter,
  branchFilter = 'all',
  setBranchFilter,
  departmentsList = [],
  shiftsList = [],
  branchesList = [],
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  const formatShiftName = (name?: string) => {
    if (!name) return t('employees.regular_shift', 'Regular Shift')
    const match = name.match(/^(.*?)\s*\((.*?)\)$/)
    if (match) {
      const p1 = match[1].trim()
      const p2 = match[2].trim()
      const hasKmP2 = /[\u1780-\u17FF]/.test(p2)
      const hasKmP1 = /[\u1780-\u17FF]/.test(p1)
      if (isKm) {
        if (hasKmP2) return p2
        if (hasKmP1) return p1
      } else {
        if (!hasKmP1) return p1
        if (!hasKmP2) return p2
      }
    }
    if (!isKm) {
      return name.replace(/\([^)]*[\u1780-\u17FF][^)]*\)/g, '').trim() || name
    }
    return name
  }

  const yesterdayStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])

  const isCustomDate = Boolean(selectedDate && todayStr && selectedDate !== todayStr)

  const activeCount = [
    isCustomDate ? selectedDate : '',
    statusFilter !== 'all' && statusFilter ? statusFilter : '',
    departmentFilter !== 'all' && departmentFilter ? departmentFilter : '',
    shiftFilter !== 'all' && shiftFilter ? shiftFilter : '',
    branchFilter !== 'all' && branchFilter ? branchFilter : '',
  ].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('employees.advanced_filters', 'Advanced Filters')}
      activeCount={activeCount}
    >
      {/* 1. Date Filter */}
      {setSelectedDate && (
        <FL label={t('employees.attendance_date', 'Attendance Date')}>
          <div className="space-y-2">
            <EnterpriseDatePicker
              value={selectedDate || null}
              onChange={(dateStr) => {
                if (dateStr) {
                  setSelectedDate(dateStr)
                }
              }}
              placeholder={t('employees.select_date', 'Select Date')}
              clearable={false}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => todayStr && setSelectedDate(todayStr)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {t('employees.today', 'Today')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(yesterdayStr)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  selectedDate !== todayStr && selectedDate === yesterdayStr
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {t('employees.yesterday', 'Yesterday')}
              </button>
            </div>
          </div>
        </FL>
      )}

      {/* 2. Status Filter */}
      <FL label={t('employees.status', 'Status')}>
        <ModernSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: t('employees.all_statuses', 'All Statuses') },
            { value: 'present', label: t('employees.present', 'Present') },
            { value: 'late', label: t('employees.late_login', 'Late') },
            { value: 'leave', label: t('employees.permission', 'Leave') },
            { value: 'pending', label: t('employees.pending_approval', 'Pending') },
            { value: 'absent', label: t('employees.absent_today', 'Absent') },
          ]}
          placeholder={t('employees.all_statuses', 'All Statuses')}
        />
      </FL>

      {/* 3. Department Filter */}
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

      {/* 4. Shift Filter */}
      {setShiftFilter && shiftsList.length > 0 && (
        <FL label={t('employees.shift', 'Shift')}>
          <ModernSelect
            value={shiftFilter}
            onChange={setShiftFilter}
            options={[
              { value: 'all', label: t('employees.all_shifts', 'All Shifts') },
              ...shiftsList.map((s: any) => ({
                value: String(s.id),
                label: formatShiftName(s.name),
              })),
            ]}
            placeholder={t('employees.all_shifts', 'All Shifts')}
          />
        </FL>
      )}

      {/* 5. Branch Filter */}
      {setBranchFilter && branchesList.length > 0 && (
        <FL label={t('employees.branch', 'Branch')}>
          <ModernSelect
            value={branchFilter}
            onChange={setBranchFilter}
            options={[
              { value: 'all', label: t('employees.all_branches', 'All Branches') },
              ...branchesList.map((b: any) => ({ value: String(b.id), label: b.name })),
            ]}
            placeholder={t('employees.all_branches', 'All Branches')}
          />
        </FL>
      )}
    </FilterDrawerShell>
  )
}

export default AttendanceFilterDrawer
