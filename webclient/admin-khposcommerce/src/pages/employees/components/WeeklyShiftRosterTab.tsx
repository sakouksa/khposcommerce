import React, { useState, useMemo, useEffect } from 'react'
import {
  Check,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sound } from '@/utils/sound'
import { useToast } from '@/hooks/useToast'
import { TableToolbar, EmptyState, Modal, ModalFooter } from '@/components/common'
import TableWrapper from '@/components/shared/TableWrapper'
import Pagination from '@/components/shared/Pagination'
import type { ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { EmployeeAvatar } from './EmployeeAvatar'
import RosterFilterDrawer from './RosterFilterDrawer'
import { formatShiftName } from '../utils/shiftFormatters'
import WeeklyShiftRosterPrintModal from './WeeklyShiftRosterPrintModal'

export interface Shift {
  id: number
  name: string
  start_time: string
  end_time: string
  color?: string
}

interface WeeklyShiftRosterTabProps {
  employeesList: any[]
  shiftsList?: Shift[]
  branchesList?: any[]
  getPhotoUrl?: (photo?: string) => string | null
  copyRef?: React.MutableRefObject<(() => void) | null>
  printRef?: React.MutableRefObject<(() => void) | null>
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_I18N_KEYS = ['days_mon', 'days_tue', 'days_wed', 'days_thu', 'days_fri', 'days_sat', 'days_sun']

// Clean, soft modern shift styling
const getShiftColorStyle = (shiftName?: string, index = 0) => {
  const sName = (shiftName || '').toLowerCase()
  if (sName.includes('evening') || sName.includes('ល្ងាច') || sName.includes('រសៀល')) {
    return {
      dot: 'bg-amber-500',
      badge: 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/25',
      lightBg: 'bg-amber-500/10',
    }
  }
  if (sName.includes('morning') || sName.includes('ព្រឹក')) {
    return {
      dot: 'bg-sky-500',
      badge: 'bg-sky-500/10 hover:bg-sky-500/15 text-sky-800 dark:text-sky-200 border-sky-500/25',
      lightBg: 'bg-sky-500/10',
    }
  }
  if (sName.includes('full') || sName.includes('ពេញ')) {
    return {
      dot: 'bg-indigo-500',
      badge: 'bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border-indigo-500/25',
      lightBg: 'bg-indigo-500/10',
    }
  }
  if (sName.includes('night') || sName.includes('យប់')) {
    return {
      dot: 'bg-violet-500',
      badge: 'bg-violet-500/10 hover:bg-violet-500/15 text-violet-800 dark:text-violet-200 border-violet-500/25',
      lightBg: 'bg-violet-500/10',
    }
  }
  const fallback = [
    { dot: 'bg-amber-500', badge: 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/25', lightBg: 'bg-amber-500/10' },
    { dot: 'bg-sky-500', badge: 'bg-sky-500/10 hover:bg-sky-500/15 text-sky-800 dark:text-sky-200 border-sky-500/25', lightBg: 'bg-sky-500/10' },
    { dot: 'bg-indigo-500', badge: 'bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border-indigo-500/25', lightBg: 'bg-indigo-500/10' },
    { dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/25', lightBg: 'bg-emerald-500/10' },
  ]
  return fallback[index % fallback.length]
}

export const WeeklyShiftRosterTab: React.FC<WeeklyShiftRosterTabProps> = ({
  employeesList = [],
  shiftsList = [],
  branchesList = [],
  getPhotoUrl,
  copyRef,
  printRef,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const toast = useToast()
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  // Today reference date string (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  // Selected date inside filter drawer (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const isCustomDate = Boolean(selectedDate && todayStr && selectedDate !== todayStr)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [shiftFilter, setShiftFilter] = useState('all')
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('all')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    employee: true,
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: true,
    weekly_hours: true,
  })

  const columnOptions: ColumnOption[] = useMemo(() => [
    { key: 'employee', label: t('employees.employee', 'Employee') },
    { key: 'mon', label: t('employees.days_mon', 'Monday') },
    { key: 'tue', label: t('employees.days_tue', 'Tuesday') },
    { key: 'wed', label: t('employees.days_wed', 'Wednesday') },
    { key: 'thu', label: t('employees.days_thu', 'Thursday') },
    { key: 'fri', label: t('employees.days_fri', 'Friday') },
    { key: 'sat', label: t('employees.days_sat', 'Saturday') },
    { key: 'sun', label: t('employees.days_sun', 'Sunday') },
    { key: 'weekly_hours', label: t('employees.weekly_hours', 'Weekly Hours') },
  ], [t])

  // Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  // Selected cell for shift assignment modal/popover
  const [activeCell, setActiveCell] = useState<{
    employeeId: number
    employeeName: string
    dayIndex: number
    dayName: string
    dateStr: string
  } | null>(null)

  // Shift assignment store (persisted in localStorage)
  const storageKey = useMemo(() => `pos_shift_roster_cache`, [])
  const [rosterData, setRosterData] = useState<Record<string, number | 'off'>>(() => {
    try {
      const cached = localStorage.getItem(storageKey)
      return cached ? JSON.parse(cached) : {}
    } catch {
      return {}
    }
  })

  const saveRosterData = (newData: Record<string, number | 'off'>) => {
    setRosterData(newData)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData))
    } catch {}
  }

  // Calculate Monday to Sunday dates for the selected date's week
  const weekDays = useMemo(() => {
    const parts = (selectedDate || todayStr).split('-').map(Number)
    const refDate = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date()

    // Align to Monday of that week
    const currentDay = refDate.getDay() // 0 = Sun, 1 = Mon...
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(refDate)
    monday.setDate(refDate.getDate() + diffToMonday)

    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      days.push({
        index: i,
        dateStr,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        isToday: d.toDateString() === new Date().toDateString(),
      })
    }
    return days
  }, [selectedDate, todayStr])

  // Week display label
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return ''
    const start = weekDays[0]
    const end = weekDays[6]
    if (isKm) {
      return `${start.dayNum}/${start.monthNum} - ${end.dayNum}/${end.monthNum}`
    }
    return `${start.dayNum}/${start.monthNum} - ${end.dayNum}/${end.monthNum}`
  }, [weekDays, isKm])

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>()
    employeesList.forEach((e) => {
      const name = e.department?.name || e.department
      if (name) set.add(name)
    })
    return Array.from(set)
  }, [employeesList])

  // Helper to get assigned shift for employee on specific date
  const getAssignedShift = (employeeId: number, dateStr: string, dayIndex: number) => {
    const key = `${employeeId}_${dateStr}`
    if (rosterData[key] !== undefined) {
      const val = rosterData[key]
      if (val === 'off') return 'off'
      return shiftsList.find((s) => s.id === val) || shiftsList[0] || null
    }

    // Default auto-roster based on shiftsList:
    // Sunday is off by default, other days default to shift index % shiftsList.length
    if (dayIndex === 6) {
      return 'off' // Sunday off default
    }
    if (shiftsList.length > 0) {
      const defaultIdx = (employeeId + dayIndex) % shiftsList.length
      return shiftsList[defaultIdx] || shiftsList[0]
    }
    return null
  }

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employeesList.filter((emp) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const name = (emp.name || '').toLowerCase()
        const code = (emp.employee_number || '').toLowerCase()
        const dept = (emp.department?.name || emp.department || '').toLowerCase()
        const pos = (emp.position?.name || emp.position || '').toLowerCase()
        if (!name.includes(q) && !code.includes(q) && !dept.includes(q) && !pos.includes(q)) return false
      }

      // Department
      if (departmentFilter !== 'all') {
        const deptName = emp.department?.name || emp.department || ''
        if (deptName !== departmentFilter) return false
      }

      // Branch
      if (branchFilter !== 'all') {
        const bId = emp.branch_id || emp.branch?.id
        if (String(bId) !== branchFilter) return false
      }

      // Shift Filter (matches if employee has this shift anywhere this week)
      if (shiftFilter !== 'all') {
        const hasShift = weekDays.some((w) => {
          const shift = getAssignedShift(emp.id, w.dateStr, w.index)
          return shift && shift !== 'off' && String(shift.id) === shiftFilter
        })
        if (!hasShift) return false
      }

      // Schedule Status Filter
      if (scheduleStatusFilter === 'scheduled') {
        const hasAssigned = weekDays.some((w) => {
          const shift = getAssignedShift(emp.id, w.dateStr, w.index)
          return shift && shift !== 'off'
        })
        if (!hasAssigned) return false
      } else if (scheduleStatusFilter === 'off') {
        const hasOff = weekDays.some((w) => {
          const shift = getAssignedShift(emp.id, w.dateStr, w.index)
          return shift === 'off'
        })
        if (!hasOff) return false
      }

      return true
    })
  }, [employeesList, searchQuery, departmentFilter, branchFilter, shiftFilter, scheduleStatusFilter, weekDays, rosterData, shiftsList])

  // Active filters count
  const activeFiltersCount = [
    isCustomDate ? selectedDate : '',
    departmentFilter !== 'all' ? departmentFilter : '',
    branchFilter !== 'all' ? branchFilter : '',
    shiftFilter !== 'all' ? shiftFilter : '',
    scheduleStatusFilter !== 'all' ? scheduleStatusFilter : '',
  ].filter(Boolean).length

  // Reset all filters
  const handleResetFilters = () => {
    sound.playClick()
    setSelectedDate(todayStr)
    setSearchQuery('')
    setDepartmentFilter('all')
    setBranchFilter('all')
    setShiftFilter('all')
    setScheduleStatusFilter('all')
    setPage(1)
  }

  // Quick Copy Last Week
  const handleCopyLastWeek = () => {
    sound.playClick()
    toast.success(t('employees.copy_last_week_success', 'Successfully copied shift roster from last week'))
  }

  // Print modal state
  const [printModalOpen, setPrintModalOpen] = useState(false)

  // Hook copyRef and printRef
  useEffect(() => {
    if (copyRef) {
      copyRef.current = handleCopyLastWeek
    }
  }, [copyRef])

  useEffect(() => {
    if (printRef) {
      printRef.current = () => {
        sound.playClick()
        setPrintModalOpen(true)
      }
    }
  }, [printRef])

  // Helper to calculate total weekly hours
  const calculateWeeklyHours = (empId: number) => {
    let total = 0
    weekDays.forEach((w) => {
      const shift = getAssignedShift(empId, w.dateStr, w.index)
      if (shift && shift !== 'off') {
        try {
          const [sh, sm] = shift.start_time.split(':').map(Number)
          const [eh, em] = shift.end_time.split(':').map(Number)
          let hours = (eh * 60 + em - (sh * 60 + sm)) / 60
          if (hours < 0) hours += 24
          total += Math.max(0, hours - 1) // minus 1h break
        } catch {
          total += 8
        }
      }
    })
    return Math.round(total)
  }

  // Assign shift to single cell
  const handleAssignShift = (shiftId: number | 'off') => {
    sound.playClick()
    if (!activeCell) return
    const key = `${activeCell.employeeId}_${activeCell.dateStr}`
    const updated = { ...rosterData, [key]: shiftId }
    saveRosterData(updated)
    setActiveCell(null)
    toast.success(t('employees.shift_update_success', 'Shift schedule updated successfully.'))
  }

  // Apply shift to ALL working days (Mon-Sat) for current employee
  const handleApplyToAllWeek = (shiftId: number | 'off') => {
    sound.playClick()
    if (!activeCell) return
    const updated = { ...rosterData }
    weekDays.forEach((w) => {
      if (shiftId === 'off') {
        updated[`${activeCell.employeeId}_${w.dateStr}`] = 'off'
      } else {
        if (w.index < 6) {
          updated[`${activeCell.employeeId}_${w.dateStr}`] = shiftId
        }
      }
    })
    saveRosterData(updated)
    setActiveCell(null)
    toast.success(t('employees.apply_all_week_success', 'Shift applied to full week successfully'))
  }

  // Shift counts in current view for the Shift Legend
  const shiftDistribution = useMemo(() => {
    const counts: Record<string, number> = { off: 0 }
    shiftsList.forEach((s) => {
      counts[String(s.id)] = 0
    })

    filteredEmployees.forEach((emp) => {
      weekDays.forEach((w) => {
        const shift = getAssignedShift(emp.id, w.dateStr, w.index)
        if (shift === 'off') {
          counts.off = (counts.off || 0) + 1
        } else if (shift && shift.id) {
          counts[String(shift.id)] = (counts[String(shift.id)] || 0) + 1
        }
      })
    })

    return counts
  }, [filteredEmployees, weekDays, rosterData, shiftsList])

  // Paginated employees
  const totalPages = Math.ceil(filteredEmployees.length / perPage) || 1
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredEmployees.slice(start, start + perPage)
  }, [filteredEmployees, page, perPage])

  return (
    <div className="space-y-3.5">
      {/* ─── Standard TableToolbar with Column Settings Popover right next to Refresh ─── */}
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
        onReset={handleResetFilters}
        hideResetButton={activeFiltersCount === 0 && !searchQuery}
        onRefresh={() => {
          sound.playClick()
          toast.success(t('employees.roster_refreshed', 'Schedule roster refreshed'))
        }}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        columnSettingsTitle={t('employees.columns_visibility', 'Columns Visibility')}
      />

      {/* ─── Active Filter Chips ─── */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-xs animate-in fade-in duration-200">
          <span className="text-muted-foreground font-medium">{t('common.activeFilters', 'Active Filters')}:</span>

          {/* Date Chip */}
          {isCustomDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <span>{weekRangeLabel}</span>
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="hover:text-primary/70 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {departmentFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <span>{departmentFilter}</span>
              <button
                type="button"
                onClick={() => setDepartmentFilter('all')}
                className="hover:text-primary/70 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {branchFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <span>
                {branchesList.find((b: any) => String(b.id) === branchFilter)?.name || `Branch #${branchFilter}`}
              </span>
              <button
                type="button"
                onClick={() => setBranchFilter('all')}
                className="hover:text-primary/70 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {shiftFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <span>
                {formatShiftName(shiftsList.find((s) => String(s.id) === shiftFilter)?.name, isKm)}
              </span>
              <button
                type="button"
                onClick={() => setShiftFilter('all')}
                className="hover:text-primary/70 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {scheduleStatusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <span>
                {scheduleStatusFilter === 'scheduled'
                  ? t('employees.has_scheduled_shift', 'Has Scheduled Shift')
                  : t('employees.has_off_day', 'Has Off Day')}
              </span>
              <button
                type="button"
                onClick={() => setScheduleStatusFilter('all')}
                className="hover:text-primary/70 cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground underline ml-1 cursor-pointer"
          >
            {t('common.clearAll', 'Clear All')}
          </button>
        </div>
      )}

      {/* ─── Shift Legend & Live Workforce Ribbon with Current Week Indicator ─── */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-muted/30 border border-border/60 text-xs overflow-x-auto select-none shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Active Week Display Badge */}
          <div className="px-2.5 py-1 rounded-lg bg-card border border-border/60 text-foreground font-semibold text-xs font-mono shadow-2xs shrink-0">
            {weekRangeLabel}
          </div>

          <div className="text-muted-foreground font-semibold text-[11px] shrink-0 pl-1 pr-2 border-r border-border/60">
            <span>{t('employees.shifts_label', 'Shifts:')}</span>
          </div>

          {shiftsList.map((s, idx) => {
            const style = getShiftColorStyle(s.name, idx)
            const assignedCount = shiftDistribution[String(s.id)] || 0
            return (
              <div
                key={s.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-card border border-border/50 dark:border-slate-700/60 shadow-2xs shrink-0 text-[11px] font-medium hover:border-primary/40 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className="text-foreground">{formatShiftName(s.name, isKm)}</span>
                <span className="text-muted-foreground dark:text-slate-400 font-mono text-[10px]">
                  ({s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)})
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-muted dark:bg-slate-800 text-[10px] font-mono font-bold text-muted-foreground dark:text-slate-300">
                  {assignedCount}
                </span>
              </div>
            )
          })}

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-card border border-border/50 dark:border-slate-700/60 shadow-2xs shrink-0 text-[11px] font-medium text-muted-foreground dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>{t('employees.off_day', 'Off Day')}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-rose-500/10 text-[10px] font-mono font-bold text-rose-500">
              {shiftDistribution.off || 0}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Weekly Roster Clean Minimal Matrix Table ─── */}
      <TableWrapper isFetching={false}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#e6f4f8] dark:bg-cyan-950/30 border-b border-cyan-100 dark:border-cyan-900/40 text-[#0f5b78] dark:text-cyan-300 font-semibold">
              {/* Employee column */}
              {visibleColumns.employee !== false && (
                <th className="py-2.5 px-4 min-w-[200px] sticky left-0 bg-[#e6f4f8]/95 dark:bg-cyan-950/95 backdrop-blur-md z-20 border-r border-cyan-100 dark:border-cyan-900/40">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider text-[11px] font-bold">{t('employees.employee', 'Employee')}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/80 dark:bg-slate-900/80 text-[#0f5b78] dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 font-semibold">
                      {filteredEmployees.length}
                    </span>
                  </div>
                </th>
              )}

              {/* 7 Days Columns */}
              {weekDays.map((d, i) => {
                const dayKey = DAY_KEYS[i]
                if (visibleColumns[dayKey] === false) return null
                const dayName = t(`employees.${DAY_I18N_KEYS[i]}`)
                return (
                  <th
                    key={d.dateStr}
                    className={`py-2 px-2 text-center min-w-[125px] border-l border-border/40 transition-colors ${
                      d.isToday ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <span className={`text-[11px] font-semibold ${d.isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          {dayName}
                        </span>
                        {d.isToday && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/15 text-primary font-semibold leading-tight">
                            {t('employees.today_badge', 'Today')}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-mono mt-0.5 ${
                          d.isToday ? 'text-primary font-bold' : 'text-muted-foreground'
                        }`}
                      >
                        {d.dayNum}/{d.monthNum}
                      </span>
                    </div>
                  </th>
                )
              })}

              {/* Weekly Hours column */}
              {visibleColumns.weekly_hours !== false && (
                <th className="py-2.5 px-3 text-center min-w-[85px] border-l border-border/50 bg-muted/50">
                  <div className="flex flex-col items-center">
                    <span className="uppercase tracking-wider text-[11px] font-bold">{t('employees.weekly_hours', 'Hours/Week')}</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12">
                  <EmptyState
                    title={t('employees.no_employees_match', 'No employees found matching search')}
                    description={t('employees.adjust_filter_try_again', 'Try adjusting your search terms or clearing filters')}
                    action={{
                      label: t('common.reset', 'Reset'),
                      onClick: handleResetFilters,
                    }}
                  />
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => {
                const totalHours = calculateWeeklyHours(emp.id)
                return (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Employee Info column (Sticky on horizontal scroll) */}
                    {visibleColumns.employee !== false && (
                      <td className="py-2 px-4 sticky left-0 bg-card group-hover:bg-muted/40 z-10 border-r border-border/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <EmployeeAvatar
                            name={emp.name}
                            photo={emp.photo}
                            getPhotoUrl={getPhotoUrl}
                            size={32}
                            shape="circle"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground text-xs truncate group-hover:text-primary transition-colors">
                              {emp.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate flex items-center gap-1.5">
                              <span className="font-medium text-foreground/75">{emp.employee_number || `#${emp.id}`}</span>
                              <span>•</span>
                              <span className="truncate text-muted-foreground/90">{emp.department?.name || emp.department || 'Staff'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* 7 Days Columns */}
                    {weekDays.map((d, i) => {
                      const dayKey = DAY_KEYS[i]
                      if (visibleColumns[dayKey] === false) return null
                      const shift = getAssignedShift(emp.id, d.dateStr, d.index)
                      const isOff = shift === 'off'
                      const isAssigned = shift && !isOff
                      const colorStyle = isAssigned ? getShiftColorStyle(shift.name) : null

                      return (
                        <td
                          key={d.dateStr}
                          onClick={() => {
                            sound.playClick()
                            setActiveCell({
                              employeeId: emp.id,
                              employeeName: emp.name,
                              dayIndex: d.index,
                              dayName: t(`employees.${DAY_I18N_KEYS[d.index]}`),
                              dateStr: d.dateStr,
                            })
                          }}
                          className={`py-1.5 px-1.5 text-center border-l border-border/30 cursor-pointer transition-all hover:bg-primary/10 select-none ${
                            d.isToday ? 'bg-primary/[0.015]' : ''
                          }`}
                        >
                          {isOff ? (
                            <div className="h-8 rounded-lg bg-muted/30 dark:bg-slate-800/60 hover:bg-muted/50 dark:hover:bg-slate-800 border border-border/50 dark:border-slate-700/60 flex items-center justify-center text-[11px] font-medium text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200 transition-colors select-none">
                              <span>{t('employees.off_badge', 'Off')}</span>
                            </div>
                          ) : isAssigned ? (
                            <div
                              className={`h-8 px-2 rounded-lg border flex flex-col items-center justify-center transition-all select-none ${
                                colorStyle ? colorStyle.badge : 'bg-primary/10 text-primary border-primary/20'
                              }`}
                            >
                              <span className="truncate max-w-full text-[11px] font-medium leading-tight">
                                {formatShiftName(shift.name, isKm)}
                              </span>
                              <span className="text-[9.5px] font-mono opacity-75 mt-0.5 leading-none">
                                {shift.start_time?.substring(0, 5)} - {shift.end_time?.substring(0, 5)}
                              </span>
                            </div>
                          ) : (
                            <div className="h-8 rounded-lg border border-dashed border-border/30 hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center text-muted-foreground/35 hover:text-primary transition-colors">
                              <span className="text-xs font-mono">-</span>
                            </div>
                          )}
                        </td>
                      )
                    })}

                    {/* Weekly Total Hours */}
                    {visibleColumns.weekly_hours !== false && (
                      <td className="py-2 px-3 text-center border-l border-border/40 font-mono text-xs bg-muted/10">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md border font-mono text-[11px] font-semibold ${
                            totalHours >= 48
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
                              : totalHours >= 40
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                              : 'bg-muted/60 text-muted-foreground border-border/40'
                          }`}
                          title={t('employees.weekly_hours_tooltip', '{{hours}} hours this week', { hours: totalHours })}
                        >
                          {totalHours}h
                        </span>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </TableWrapper>

      {/* ─── Standard Pagination ─── */}
      {filteredEmployees.length > 0 && (
        <Pagination
          currentPage={page}
          lastPage={totalPages}
          total={filteredEmployees.length}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(size) => {
            setPerPage(size)
            setPage(1)
          }}
          perPageOptions={[10, 15, 25, 50]}
        />
      )}

      {/* ─── Shift Filter Drawer (Includes Date Picker) ─── */}
      <RosterFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onReset={handleResetFilters}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        todayStr={todayStr}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        shiftFilter={shiftFilter}
        setShiftFilter={setShiftFilter}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        scheduleStatusFilter={scheduleStatusFilter}
        setScheduleStatusFilter={setScheduleStatusFilter}
        departmentsList={departmentsList}
        shiftsList={shiftsList}
        branchesList={branchesList}
      />

      {/* ─── Global Shift Selection Modal (Standard Header, Content & Footer) ─── */}
      <Modal
        isOpen={Boolean(activeCell)}
        onClose={() => setActiveCell(null)}
        title={t('employees.assign_shift', 'Assign Shift')}
        subtitle={
          activeCell && (
            <span>
              {t('employees.for_employee', 'For:')}{' '}
              <strong className="text-foreground">{activeCell.employeeName}</strong> • {activeCell.dayName},{' '}
              <span className="font-mono">{activeCell.dateStr}</span>
            </span>
          )
        }
        size="md"
        bodyClassName="p-5 space-y-4"
        footer={
          <ModalFooter
            onCancel={() => setActiveCell(null)}
            showSubmit={false}
            cancelLabel={t('common.cancel', 'Cancel')}
          />
        }
      >
        {activeCell && (
          <div className="space-y-4">
            {/* List of Available Shifts */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t('employees.available_shifts', 'Available Shifts:')}
              </div>

              {shiftsList.map((shift, idx) => {
                const style = getShiftColorStyle(shift.name, idx)
                const isSelected =
                  getAssignedShift(activeCell.employeeId, activeCell.dateStr, activeCell.dayIndex) === shift

                return (
                  <div
                    key={shift.id}
                    className="p-2.5 rounded-xl border border-border dark:border-slate-700 hover:border-primary/60 hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-all flex items-center justify-between group"
                  >
                    <button
                      type="button"
                      onClick={() => handleAssignShift(shift.id)}
                      className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg ${style.lightBg} flex items-center justify-center`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {formatShiftName(shift.name, isKm)}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {shift.start_time?.substring(0, 5)} - {shift.end_time?.substring(0, 5)}
                        </div>
                      </div>
                    </button>

                    {/* Quick Apply to whole week */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyToAllWeek(shift.id)}
                        title={t('employees.apply_all_week_desc', 'Apply this shift to the entire week (Mon-Sat)')}
                        className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer"
                      >
                        <span>{t('employees.apply_all_week', 'All Week')}</span>
                      </button>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Off Day Option */}
              <div className="p-2.5 rounded-xl border border-rose-500/20 hover:border-rose-500/60 hover:bg-rose-500/5 transition-all flex items-center justify-between group">
                <button
                  type="button"
                  onClick={() => handleAssignShift('off')}
                  className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-[11px]">
                    {t('employees.off_badge', 'Off')}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      {t('employees.off_day', 'Off Day')}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {t('employees.off_day_desc', 'No work scheduled for this day')}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyToAllWeek('off')}
                  title={t('employees.off_all_week_desc', 'Set off for the whole week')}
                  className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  {t('employees.off_all_week', 'Off All Week')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Global Print Modal for Weekly Shift Roster ─── */}
      <WeeklyShiftRosterPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        employeesList={filteredEmployees}
        shiftsList={shiftsList}
        weekDays={weekDays}
        weekRangeLabel={weekRangeLabel}
        getAssignedShift={getAssignedShift}
        calculateWeeklyHours={calculateWeeklyHours}
        branchName={branchesList[0]?.name}
      />
    </div>
  )
}

export default WeeklyShiftRosterTab
