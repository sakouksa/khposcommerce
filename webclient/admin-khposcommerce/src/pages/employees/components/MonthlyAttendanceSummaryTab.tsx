import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  AlertCircle,
  Users,
  Calculator,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import {
  FlattenStatCard,
  FlattenStatsGrid,
  TableToolbar,
  TableActionMenu,
  EmptyState,
} from '@/components/common'
import TableWrapper from '@/components/shared/TableWrapper'
import Pagination from '@/components/shared/Pagination'
import type { ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { sound } from '@/utils/sound'
import EmployeeAvatar from './EmployeeAvatar'
import MonthlyEmployeeDetailDrawer from './MonthlyEmployeeDetailDrawer'
import MonthlyAttendanceFilterDrawer from './MonthlyAttendanceFilterDrawer'

const KM_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
]
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface MonthlyAttendanceSummaryTabProps {
  periodMonth: string
  onMonthChange: (newMonth: string) => void
  onSelectEmployeeForLogs?: (employeeId: number) => void
  onOpenPayrollModal?: (month: string) => void
  getPhotoUrl?: (photo?: string) => string | null
  exportRef?: React.MutableRefObject<(() => void) | null>
}

type FilterType = 'all' | 'regular' | 'late' | 'overtime' | 'absent'

export const MonthlyAttendanceSummaryTab: React.FC<MonthlyAttendanceSummaryTabProps> = ({
  periodMonth,
  onMonthChange,
  onOpenPayrollModal,
  getPhotoUrl,
  exportRef,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [drawerEmployee, setDrawerEmployee] = useState<any | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    employee: true,
    department: true,
    scheduled_days: true,
    present_days: true,
    late: true,
    absent: true,
    overtime: true,
    rate: true,
    actions: true,
  })

  const columnOptions: ColumnOption[] = useMemo(
    () => [
      { key: 'employee', label: t('employees.employee', 'Employee'), alwaysVisible: true },
      { key: 'department', label: t('employees.department_and_position', 'Department & Role') },
      { key: 'scheduled_days', label: t('employees.scheduled_days', 'Scheduled Days') },
      { key: 'present_days', label: t('employees.actual_days_worked', 'Days Worked') },
      { key: 'late', label: t('employees.total_late_incidents', 'Late') },
      { key: 'absent', label: t('employees.absent', 'Absent') },
      { key: 'overtime', label: t('employees.total_overtime', 'Overtime') },
      { key: 'rate', label: t('employees.attendance_rate', 'Attendance Rate (%)') },
      { key: 'actions', label: t('common.actions', 'Actions'), alwaysVisible: true },
    ],
    [t]
  )

  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), [])

  // Format month for display (Guaranteed pure Khmer or English)
  const monthDisplayLabel = useMemo(() => {
    try {
      const [y, m] = periodMonth.split('-').map(Number)
      const isKhmer = i18n.language === 'km' || i18n.language?.startsWith('km')
      if (isKhmer) {
        const monthName = KM_MONTHS[m - 1] || m
        return `${monthName} ${y}`
      } else {
        const monthName = EN_MONTHS[m - 1] || m
        return `${monthName} ${y}`
      }
    } catch {
      return periodMonth
    }
  }, [periodMonth, i18n.language])

  // Query Monthly Attendance Summary from Backend
  const { data, isLoading } = useQuery({
    queryKey: ['attendance-monthly-summary', periodMonth],
    queryFn: () => employeeService.getMonthlyAttendanceSummary({ period_month: periodMonth }),
  })

  const rawItems = useMemo(() => data?.items || [], [data?.items])

  // Extract unique departments for filtering
  const departmentsList = useMemo(() => {
    const depts = new Set<string>()
    rawItems.forEach((i: any) => {
      if (i.department) depts.add(i.department)
    })
    return Array.from(depts)
  }, [rawItems])

  // Computed summary metrics for fallback & accurate card values
  const metrics = useMemo(() => {
    if (rawItems.length === 0) {
      return {
        avgRate: 0,
        totalLate: 0,
        totalLateMinutes: 0,
        totalOt: 0,
        totalAbsent: 0,
      }
    }
    const sumRate = rawItems.reduce((acc: number, i: any) => acc + (Number(i.attendance_rate) || 0), 0)
    const computedAvg = Math.round((sumRate / rawItems.length) * 10) / 10
    const avgRate = data?.avg_attendance_rate ?? computedAvg
    const totalLate = data?.total_late_incidents ?? rawItems.reduce((acc: number, i: any) => acc + (Number(i.late_days) || 0), 0)
    const totalLateMinutes = data?.total_late_minutes ?? rawItems.reduce((acc: number, i: any) => acc + (Number(i.late_minutes) || 0), 0)
    const totalOt = data?.total_overtime_hours ?? rawItems.reduce((acc: number, i: any) => acc + (Number(i.overtime_hours) || 0), 0)
    const totalAbsent = rawItems.reduce((acc: number, i: any) => acc + (Number(i.absent_days) || 0), 0)

    return {
      avgRate,
      totalLate,
      totalLateMinutes,
      totalOt,
      totalAbsent,
    }
  }, [rawItems, data])

  // Filter items by search query & category segment & department
  const filteredItems = useMemo(() => {
    let result = rawItems

    // 1. Quick Category Filter
    if (activeFilter === 'regular') {
      result = result.filter((item: any) => (item.attendance_rate || 0) >= 90)
    } else if (activeFilter === 'late') {
      result = result.filter((item: any) => (item.late_days || 0) > 0)
    } else if (activeFilter === 'overtime') {
      result = result.filter((item: any) => (item.overtime_hours || 0) > 0)
    } else if (activeFilter === 'absent') {
      result = result.filter((item: any) => (item.absent_days || 0) > 0)
    }

    // 2. Department Filter
    if (departmentFilter !== 'all') {
      result = result.filter((item: any) => item.department === departmentFilter)
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((item: any) => {
        const name = item.employee_name?.toLowerCase() || ''
        const code = item.employee_number?.toLowerCase() || ''
        const dept = item.department?.toLowerCase() || ''
        const pos = item.position?.toLowerCase() || ''
        return name.includes(q) || code.includes(q) || dept.includes(q) || pos.includes(q)
      })
    }

    return result
  }, [rawItems, activeFilter, departmentFilter, searchQuery])

  // Count items for quick filter pills
  const filterCounts = useMemo(() => {
    return {
      all: rawItems.length,
      regular: rawItems.filter((i: any) => (i.attendance_rate || 0) >= 90).length,
      late: rawItems.filter((i: any) => (i.late_days || 0) > 0).length,
      overtime: rawItems.filter((i: any) => (i.overtime_hours || 0) > 0).length,
      absent: rawItems.filter((i: any) => (i.absent_days || 0) > 0).length,
    }
  }, [rawItems])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (periodMonth !== currentMonthStr) count += 1
    if (activeFilter !== 'all') count += 1
    if (departmentFilter !== 'all') count += 1
    return count
  }, [periodMonth, currentMonthStr, activeFilter, departmentFilter])

  // Reset all filters
  const handleResetAllFilters = () => {
    sound.playClick()
    onMonthChange(currentMonthStr)
    setSearchQuery('')
    setActiveFilter('all')
    setDepartmentFilter('all')
    setPage(1)
  }

  // Paginated items
  const totalPages = Math.ceil(filteredItems.length / perPage) || 1
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredItems.slice(start, start + perPage)
  }, [filteredItems, page, perPage])

  // Export Timesheet to CSV
  const handleExportCsv = useCallback(() => {
    if (!rawItems.length) return

    const headers = [
      'Employee Number',
      'Employee Name',
      'Department',
      'Position',
      'Scheduled Days',
      'Worked Days',
      'Late Incidents',
      'Late Minutes',
      'Absent Days',
      'Overtime Hours',
      'Attendance Rate (%)',
    ]

    const rows = rawItems.map((item: any) => [
      `"${item.employee_number || ''}"`,
      `"${item.employee_name || ''}"`,
      `"${item.department || ''}"`,
      `"${item.position || ''}"`,
      item.scheduled_days ?? 0,
      item.present_days ?? 0,
      item.late_days ?? 0,
      item.late_minutes ?? 0,
      item.absent_days ?? 0,
      item.overtime_hours ?? 0,
      item.attendance_rate ?? 0,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Timesheet_Summary_${periodMonth}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [rawItems, periodMonth])

  // Connect exportRef for parent toolbar triggering
  useEffect(() => {
    if (exportRef) {
      exportRef.current = handleExportCsv
    }
  }, [exportRef, handleExportCsv])

  return (
    <div className="space-y-4">
      {/* ─── 1. Flutter 3 Flatten Style KPI Summary Cards ─── */}
      <FlattenStatsGrid columns={4} className="print:hidden">
        {/* Card 1: Total Staff (Flatten Teal Box) */}
        <FlattenStatCard
          title={t('employees.total_staff', 'Total Staff')}
          value={rawItems.length}
          useCounter={true}
          icon={Users}
          color="teal"
          delay={0.02}
        />

        {/* Card 2: Attendance Rate (Flatten Emerald Box) */}
        <FlattenStatCard
          title={t('employees.avg_attendance_rate', 'Average Attendance Rate')}
          value={metrics.avgRate}
          suffix="%"
          decimals={1}
          useCounter={true}
          icon={CheckCircle2}
          color="emerald"
          delay={0.06}
        />

        {/* Card 3: Late Incidents (Flatten Amber Box) */}
        <FlattenStatCard
          title={t('employees.total_late_incidents', 'Total Late')}
          value={metrics.totalLate}
          useCounter={true}
          icon={AlertCircle}
          color="amber"
          delay={0.1}
        />

        {/* Card 4: Overtime Hours (Flatten Cyan Box) */}
        <FlattenStatCard
          title={t('employees.total_overtime', 'Total Overtime')}
          value={metrics.totalOt}
          suffix="h"
          useCounter={true}
          icon={Clock}
          color="cyan"
          delay={0.14}
        />
      </FlattenStatsGrid>

      {/* ─── 2. Global Standard Table Toolbar ─── */}
      <TableToolbar
        search={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setPage(1)
        }}
        searchPlaceholder={t('employees.search_employee_short', 'Search employee...')}
        onFilterClick={() => setIsFilterDrawerOpen(true)}
        isFilterActive={activeFiltersCount > 0}
        filterActiveCount={activeFiltersCount}
        onReset={handleResetAllFilters}
        hideResetButton={activeFiltersCount === 0 && !searchQuery}
        onRefresh={() => {
          sound.playClick()
          queryClient.invalidateQueries({ queryKey: ['attendance-monthly-summary', periodMonth] })
        }}
        refreshLoading={isLoading}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        columnSettingsTitle={t('employees.columns_visibility', 'Column Visibility')}
      />

      {/* ─── 3. Active Filter Indicator Chips ─── */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-xs animate-in fade-in duration-200">
          <span className="text-muted-foreground font-medium">{t('common.activeFilters', 'Active Filters')}:</span>

          {/* Month Filter Chip */}
          {periodMonth !== currentMonthStr && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <Calendar size={12} />
              <span>{monthDisplayLabel}</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  onMonthChange(currentMonthStr)
                  setPage(1)
                }}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                title={t('employees.reset_to_this_month', 'Reset to this month')}
              >
                <X size={11} />
              </button>
            </span>
          )}

          {/* Category Filter Chip */}
          {activeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>
                {activeFilter === 'regular'
                  ? t('employees.regular_filter', 'Regular (≥90%)')
                  : activeFilter === 'late'
                  ? t('employees.late_filter', 'Late Arrivals')
                  : activeFilter === 'overtime'
                  ? t('employees.overtime_filter', 'Overtime')
                  : t('employees.absent_filter', 'Absent')}
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setActiveFilter('all')
                  setPage(1)
                }}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {/* Department Filter Chip */}
          {departmentFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>{t('employees.department', 'Department')}: {departmentFilter}</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setDepartmentFilter('all')
                  setPage(1)
                }}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline ml-1 cursor-pointer"
          >
            {t('common.clearAll', 'Clear All')}
          </button>
        </div>
      )}

      {/* ─── 4. Standard TableWrapper & Data Table ─── */}
      <TableWrapper isFetching={isLoading}>
        {filteredItems.length === 0 && !isLoading ? (
          <EmptyState
            icon={<Calendar className="text-muted-foreground/50 stroke-1" size={32} />}
            title={t('employees.no_timesheet_data', 'No attendance summary data for this month')}
            description={t('employees.no_attendance_records_desc', 'Please select another month or reset filters')}
            py="py-16"
          />
        ) : (
          <table className="w-full data-table border-collapse">
            <thead>
              <tr className="border-b border-cyan-100 dark:border-cyan-900/40 bg-[#e6f4f8] dark:bg-cyan-950/30 text-[#0f5b78] dark:text-cyan-300 text-[11px] font-bold uppercase tracking-wider select-none">
                {visibleColumns.employee !== false && (
                  <th className="!px-4 !py-3">{t('employees.employee', 'Employee')}</th>
                )}
                {visibleColumns.department !== false && (
                  <th className="!py-3 font-semibold text-xs text-muted-foreground">{t('employees.department_and_position', 'Department & Role')}</th>
                )}
                {visibleColumns.scheduled_days !== false && (
                  <th className="!text-center !py-3 font-semibold text-xs text-muted-foreground">{t('employees.scheduled_days', 'Scheduled Days')}</th>
                )}
                {visibleColumns.present_days !== false && (
                  <th className="!text-center !py-3 font-semibold text-xs text-muted-foreground">{t('employees.actual_days_worked', 'Days Worked')}</th>
                )}
                {visibleColumns.late !== false && (
                  <th className="!text-center !py-3 font-semibold text-xs text-muted-foreground">{t('employees.total_late_incidents', 'Late')}</th>
                )}
                {visibleColumns.absent !== false && (
                  <th className="!text-center !py-3 font-semibold text-xs text-muted-foreground">{t('employees.absent', 'Absent')}</th>
                )}
                {visibleColumns.overtime !== false && (
                  <th className="!text-center !py-3 font-semibold text-xs text-muted-foreground">{t('employees.total_overtime', 'Overtime')}</th>
                )}
                {visibleColumns.rate !== false && (
                  <th className="min-w-[120px] !py-3 font-semibold text-xs text-muted-foreground">{t('employees.attendance_rate', 'Attendance Rate (%)')}</th>
                )}
                {visibleColumns.actions !== false && (
                  <th className="!text-right !pr-6 !py-3 font-semibold text-xs text-muted-foreground">{t('common.actions', 'Actions')}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item: any) => {
                const rate = item.attendance_rate || 0
                const isHigh = rate >= 90
                const isMed = rate >= 70 && rate < 90

                return (
                  <tr
                    key={item.employee_id}
                    onClick={() => setDrawerEmployee(item)}
                    className="cursor-pointer hover:bg-muted/30 transition-colors group"
                  >
                    {/* Employee Avatar & Name */}
                    {visibleColumns.employee !== false && (
                      <td className="!px-4 !py-3">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar
                            photo={item.photo}
                            name={item.employee_name}
                            id={item.employee_id}
                            size="sm"
                            getPhotoUrl={getPhotoUrl}
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {item.employee_name}
                            </div>
                            <div className="font-mono text-[11px] text-muted-foreground tracking-tight truncate">
                              {item.employee_number}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Department & Role */}
                    {visibleColumns.department !== false && (
                      <td className="!py-3">
                        <div className="text-foreground text-xs font-medium truncate">{item.department || '—'}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{item.position || '—'}</div>
                      </td>
                    )}

                    {/* Scheduled Days */}
                    {visibleColumns.scheduled_days !== false && (
                      <td className="!text-center !py-3 font-mono text-xs font-medium text-foreground/80">
                        {item.scheduled_days ?? 0}{' '}
                        <span className="text-[10px] font-normal text-muted-foreground">
                          {t('employees.days_unit', 'days')}
                        </span>
                      </td>
                    )}

                    {/* Actual Worked Days */}
                    {visibleColumns.present_days !== false && (
                      <td className="!text-center !py-3 font-mono text-xs font-bold text-foreground">
                        {item.present_days ?? 0}{' '}
                        <span className="text-[10px] font-normal text-muted-foreground">
                          {t('employees.days_unit', 'days')}
                        </span>
                      </td>
                    )}

                    {/* Late */}
                    {visibleColumns.late !== false && (
                      <td className="!text-center !py-3">
                        {item.late_days > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            {item.late_days}x ({item.late_minutes}m)
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs font-mono">—</span>
                        )}
                      </td>
                    )}

                    {/* Absent */}
                    {visibleColumns.absent !== false && (
                      <td className="!text-center !py-3">
                        {item.absent_days > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            {item.absent_days} {t('employees.days_unit', 'days')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs font-mono">—</span>
                        )}
                      </td>
                    )}

                    {/* Overtime */}
                    {visibleColumns.overtime !== false && (
                      <td className="!text-center !py-3">
                        {item.overtime_hours > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                            +{item.overtime_hours}h
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs font-mono">—</span>
                        )}
                      </td>
                    )}

                    {/* Attendance Rate */}
                    {visibleColumns.rate !== false && (
                      <td className="!py-3">
                        <div className="space-y-1 max-w-[120px]">
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`font-mono font-bold ${
                                isHigh
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isMed
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {rate}%
                            </span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHigh ? 'bg-emerald-500' : isMed ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    {visibleColumns.actions !== false && (
                      <td className="!text-right !pr-6 !py-3" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          onView={() => setDrawerEmployee(item)}
                          viewLabel={t('employees.view_days_detail', 'Details')}
                          items={
                            onOpenPayrollModal
                              ? [
                                  {
                                    label: t('employees.calculate_payroll_shortcut', 'Calculate Payroll'),
                                    icon: Calculator,
                                    onClick: () => onOpenPayrollModal(periodMonth),
                                    variant: 'primary',
                                  },
                                ]
                              : []
                          }
                        />
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </TableWrapper>

      {/* ─── 5. Standard Pagination ─── */}
      {filteredItems.length > 0 && (
        <Pagination
          currentPage={page}
          lastPage={totalPages}
          total={filteredItems.length}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      {/* ─── 6. Slide-in Drilldown Drawer ─── */}
      <MonthlyEmployeeDetailDrawer
        isOpen={!!drawerEmployee}
        onClose={() => setDrawerEmployee(null)}
        employeeSummary={drawerEmployee}
        periodMonth={periodMonth}
        getPhotoUrl={getPhotoUrl}
      />

      {/* ─── 7. Harmonized Advanced Filter Drawer ─── */}
      <MonthlyAttendanceFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onReset={handleResetAllFilters}
        periodMonth={periodMonth}
        onMonthChange={(newMonth) => {
          onMonthChange(newMonth)
          setPage(1)
        }}
        activeFilter={activeFilter}
        setActiveFilter={(newFilter) => {
          setActiveFilter(newFilter)
          setPage(1)
        }}
        departmentFilter={departmentFilter}
        setDepartmentFilter={(newDept) => {
          setDepartmentFilter(newDept)
          setPage(1)
        }}
        departmentsList={departmentsList}
        filterCounts={filterCounts}
      />
    </div>
  )
}

export default MonthlyAttendanceSummaryTab
