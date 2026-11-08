import React from 'react'
import {
  Users,
  Building2,
  Activity,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FlattenStatCard, FlattenStatsGrid } from '@/components/common'
import type { EmployeeStatsData } from '../types/employee.types'

interface EmployeeStatsCardsProps {
  statsData?: EmployeeStatsData
  empListLength?: number
  activeCount?: number
  resignedCount?: number
  deptCount?: number
  posCount?: number
  branchCount?: number
  totalSalarySum?: number
  currentStatusFilter?: string
  onFilterStatus?: (status: string) => void
  onSelectAttendanceStatus?: (status: string) => void
  onNavigateToLeaves?: () => void
  onNavigateToAttendance?: () => void
}

export const EmployeeStatsCards: React.FC<EmployeeStatsCardsProps> = ({
  statsData,
  empListLength = 0,
  activeCount = 0,
  resignedCount = 0,
  deptCount = 0,
  posCount = 0,
  branchCount = 0,
  totalSalarySum = 0,
  currentStatusFilter,
  onFilterStatus,
}) => {
  const { t } = useTranslation(['employees', 'common'])

  const totalEmployees = statsData?.total_employees ?? empListLength
  const activeEmp = statsData?.active_employees ?? activeCount
  const resignedEmp = statsData?.resigned_employees ?? resignedCount

  const totalDepts = statsData?.total_departments ?? deptCount
  const totalPositions = statsData?.total_positions ?? posCount

  const presentCount = statsData?.attendance_today?.present ?? 0
  const lateCount = statsData?.attendance_today?.late ?? 0
  const absentCount = statsData?.attendance_today?.absent ?? 0
  const leaveCount = statsData?.attendance_today?.leave ?? 0
  const holidayCount = statsData?.attendance_today?.holiday ?? 0
  const totalToday = presentCount + lateCount + absentCount + leaveCount + holidayCount
  const attendanceRate = totalToday > 0 ? Math.round(((presentCount + lateCount) / totalToday) * 100) : 100

  const monthlyPayroll = Number(statsData?.monthly_salary_expense || totalSalarySum || 0)
  const averageSalary = Number(
    statsData?.average_salary || (activeEmp > 0 ? monthlyPayroll / activeEmp : 0)
  )
  const pendingPayroll = Number(statsData?.payroll_draft ?? 0)

  return (
    <div className="print:hidden space-y-3">
      {/* ─── 4 Flatten Dashboard KPI Cards (Flutter 3 Flatten Style) ──────── */}
      <FlattenStatsGrid columns={4}>
        {/* Card 1: Total Workforce (Flatten Teal / Petrol Box) */}
        <FlattenStatCard
          title={t('employees.total_employees', 'Total Team Members')}
          value={totalEmployees}
          color="teal"
          icon={Users}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <button
                type="button"
                onClick={() => onFilterStatus?.('active')}
                className={`font-semibold flex items-center gap-1 transition-all cursor-pointer rounded px-1.5 py-0.5 ${
                  currentStatusFilter === 'active'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 font-bold'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
                title={t('employees.filter_by_active', 'Filter active staff')}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {activeEmp} {t('employees.active', 'Active')}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onFilterStatus?.('resigned')}
                className={`font-medium transition-all cursor-pointer rounded px-1.5 py-0.5 ${
                  currentStatusFilter === 'resigned'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={t('employees.filter_by_resigned', 'Filter resigned staff')}
              >
                {resignedEmp} {t('employees.resigned', 'Resigned')}
              </button>
            </span>
          }
        />

        {/* Card 2: Org & Positions (Flatten Emerald Green Box) */}
        <FlattenStatCard
          title={t('employees.departments_positions', 'Organization & Roles')}
          value={totalDepts}
          color="emerald"
          icon={Building2}
          delay={0.05}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {totalPositions} {t('employees.positions', 'Positions')}
              </span>
              <span>•</span>
              <span className="text-slate-400 font-medium">
                {branchCount} {t('employees.branches', 'Branches')}
              </span>
            </span>
          }
        />

        {/* Card 3: Attendance Rate (Flatten Cyan / Sky Box) */}
        <FlattenStatCard
          title={t('employees.attendance_rate', 'Daily Attendance Rate')}
          value={attendanceRate}
          suffix="%"
          color="cyan"
          icon={Activity}
          delay={0.1}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {presentCount} {t('employees.present', 'Present')}
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {lateCount} {t('employees.late', 'Late')}
              </span>
              <span>•</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {absentCount} {t('employees.absent', 'Absent')}
              </span>
            </span>
          }
        />

        {/* Card 4: Monthly Payroll (Flatten Slate / Steel Box) */}
        <FlattenStatCard
          title={t('employees.monthly_payroll', 'Monthly Payroll Expense')}
          value={monthlyPayroll}
          prefix="$"
          decimals={2}
          color="slate"
          icon={Wallet}
          delay={0.15}
          subtitle={
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {t('employees.avg', 'Avg')}: ${Number(averageSalary).toFixed(0)}
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {pendingPayroll} {t('employees.pending', 'Pending')}
              </span>
            </span>
          }
        />
      </FlattenStatsGrid>
    </div>
  )
}

export default EmployeeStatsCards


