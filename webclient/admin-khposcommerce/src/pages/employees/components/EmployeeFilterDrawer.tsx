import React from 'react'
import { useTranslation } from 'react-i18next'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { EnterpriseDatePicker } from '@/components/common'

interface EmployeeFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  branchesList?: any[]
  deptList?: any[]
  posList?: any[]
  filterBranchId: string
  setFilterBranchId: (val: string) => void
  filterDeptId: string
  setFilterDeptId: (val: string) => void
  filterPosId: string
  setFilterPosId: (val: string) => void
  filterRole: string
  setFilterRole: (val: string) => void
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterGender: string
  setFilterGender: (val: string) => void
  filterDateStart: string
  setFilterDateStart: (val: string) => void
  filterDateEnd: string
  setFilterDateEnd: (val: string) => void
  filterSalaryMin: string
  setFilterSalaryMin: (val: string) => void
  filterSalaryMax: string
  setFilterSalaryMax: (val: string) => void
  onReset: () => void
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

const inputCls = "w-full h-10 text-xs sm:text-[13px] font-medium rounded-xl bg-card dark:bg-slate-900/90 border border-border/80 dark:border-slate-700/80 hover:border-primary/50 dark:hover:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all px-3.5 text-foreground dark:text-slate-100 shadow-2xs placeholder:text-xs sm:placeholder:text-[13px] placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 dark:[color-scheme:dark]"

export const EmployeeFilterDrawer: React.FC<EmployeeFilterDrawerProps> = ({
  isOpen, onClose,
  branchesList = [], deptList = [], posList = [],
  filterBranchId, setFilterBranchId,
  filterDeptId, setFilterDeptId,
  filterPosId, setFilterPosId,
  filterRole, setFilterRole,
  filterStatus, setFilterStatus,
  filterGender, setFilterGender,
  filterDateStart, setFilterDateStart,
  filterDateEnd, setFilterDateEnd,
  filterSalaryMin, setFilterSalaryMin,
  filterSalaryMax, setFilterSalaryMax,
  onReset,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const activeCount = [filterBranchId, filterDeptId, filterPosId, filterRole, filterStatus, filterGender, filterDateStart, filterDateEnd, filterSalaryMin, filterSalaryMax].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('employees.advanced_filters', 'Advanced Employee Filters')}
      activeCount={activeCount}
    >
      <FL label={t('employees.branch', 'Branch')}>
        <ModernSelect
          value={filterBranchId}
          onChange={setFilterBranchId}
          options={[{ value: '', label: t('employees.all_branches', 'All Branches') }, ...branchesList.map((b: any) => ({ value: String(b.id), label: b.name }))]}
          placeholder={t('employees.all_branches', 'All Branches')}
        />
      </FL>

      <FL label={t('employees.department', 'Department')}>
        <ModernSelect
          value={filterDeptId}
          onChange={setFilterDeptId}
          options={[{ value: '', label: t('employees.all_departments', 'All Departments') }, ...deptList.map((d: any) => ({ value: String(d.id), label: d.name }))]}
          placeholder={t('employees.all_departments', 'All Departments')}
        />
      </FL>

      <FL label={t('employees.position', 'Position')}>
        <ModernSelect
          value={filterPosId}
          onChange={setFilterPosId}
          options={[{ value: '', label: t('employees.all_positions', 'All Positions') }, ...posList.map((p: any) => ({ value: String(p.id), label: p.name }))]}
          placeholder={t('employees.all_positions', 'All Positions')}
        />
      </FL>

      <FL label={t('employees.role', 'Role')}>
        <ModernSelect
          value={filterRole}
          onChange={setFilterRole}
          options={[
            { value: '', label: t('employees.all_roles', 'All Roles') },
            { value: 'admin', label: t('employees.admin', 'Admin') },
            { value: 'manager', label: t('employees.manager', 'Manager') },
            { value: 'staff', label: t('employees.staff', 'Staff') },
          ]}
          placeholder={t('employees.all_roles', 'All Roles')}
        />
      </FL>

      <FL label={t('employees.employment_status', 'Employment Status')}>
        <ModernSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: '', label: t('employees.all_statuses', 'All Statuses') },
            { value: 'active', label: t('employees.active', 'Active') },
            { value: 'inactive', label: t('employees.inactive', 'Inactive') },
            { value: 'resigned', label: t('employees.resigned', 'Resigned') },
          ]}
          placeholder={t('employees.all_statuses', 'All Statuses')}
        />
      </FL>

      <FL label={t('employees.gender', 'Gender')}>
        <ModernSelect
          value={filterGender}
          onChange={setFilterGender}
          options={[
            { value: '', label: t('employees.all_genders', 'All Genders') },
            { value: 'male', label: t('employees.male', 'Male') },
            { value: 'female', label: t('employees.female', 'Female') },
          ]}
          placeholder={t('employees.all_genders', 'All Genders')}
        />
      </FL>

      <FL label={t('employees.date_joined_from', 'Date Joined From')}>
        <EnterpriseDatePicker
          value={filterDateStart}
          onChange={setFilterDateStart}
          placeholder={t('employees.selectDate', 'Select date')}
        />
      </FL>

      <FL label={t('employees.date_joined_to', 'Date Joined To')}>
        <EnterpriseDatePicker
          value={filterDateEnd}
          minDate={filterDateStart}
          onChange={setFilterDateEnd}
          placeholder={t('employees.selectDate', 'Select date')}
        />
      </FL>

      <div className="grid grid-cols-2 gap-2.5">
        <FL label={t('employees.min_salary', 'Min Salary ($)')}>
          <input type="number" value={filterSalaryMin} onChange={e => setFilterSalaryMin(e.target.value)} placeholder={t('employees.min', 'Min')} className={inputCls} />
        </FL>
        <FL label={t('employees.max_salary', 'Max Salary ($)')}>
          <input type="number" value={filterSalaryMax} onChange={e => setFilterSalaryMax(e.target.value)} placeholder={t('employees.max', 'Max')} className={inputCls} />
        </FL>
      </div>
    </FilterDrawerShell>
  )
}

export default EmployeeFilterDrawer
