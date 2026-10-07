import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  RotateCcw,
  Clock,
  LogOut,
  CalendarCheck,
  UserCheck,
  UserX,
  LogIn,
  Edit,
  Eye,
  Plus,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import {
  StatusBadge,
  EmptyState,
  FlattenStatCard,
  FlattenStatsGrid,
  TableToolbar,
  TableActionMenu,
} from '@/components/common'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import TableWrapper from '@/components/shared/TableWrapper'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { EmployeeAvatar } from './EmployeeAvatar'
import AttendanceDetailModal from './AttendanceDetailModal'
import QuickAttendanceModal from './QuickAttendanceModal'
import AttendanceFilterDrawer from './AttendanceFilterDrawer'

interface DailyAttendanceLogsTabProps {
  getPhotoUrl?: (photo?: string) => string | null
  employeesList: any[]
  shiftsList?: any[]
  branchesList?: any[]
  onOpenCreateRecord?: () => void
  onOpenQrKiosk?: () => void
}

type StatusFilter = 'all' | 'present' | 'late' | 'pending' | 'leave' | 'absent'
type ViewMode = 'board' | 'table'
type SortOption = 'last_7_days' | 'recently_added' | 'ascending' | 'descending'

const KM_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
]
const EN_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const KM_DAYS = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍']
const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Helper to clean up long bilingual shift names
const formatShiftName = (name?: string, isKm = true) => {
  if (!name) return 'Regular Shift'
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

// Helper to format production hours cleanly (e.g. "8h 00m" or "8.00 ម៉ោង")
const formatProductionHours = (workedFormatted?: string, checkIn?: string, checkOut?: string, isKm = true) => {
  if (workedFormatted && workedFormatted !== '-') {
    const cleaned = workedFormatted.replace(/\s*\d+s/gi, '').trim()
    return cleaned || workedFormatted
  }
  if (checkIn && checkOut) {
    try {
      const [ih, im] = checkIn.split(':').map(Number)
      const [oh, om] = checkOut.split(':').map(Number)
      let mins = (oh * 60 + om) - (ih * 60 + im)
      if (mins < 0) mins += 24 * 60
      const hours = Math.floor(mins / 60)
      const remainMins = mins % 60
      return `${hours}h ${String(remainMins).padStart(2, '0')}m`
    } catch {
      return '-'
    }
  }
  return '-'
}

export const DailyAttendanceLogsTab: React.FC<DailyAttendanceLogsTabProps> = ({
  getPhotoUrl,
  employeesList = [],
  shiftsList = [],
  branchesList = [],
  onOpenCreateRecord,
  onOpenQrKiosk,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  const todayStr = useMemo(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  // View Mode: 'board' (Cards Grid) vs 'table' (SmartHR Table)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  // Filters State
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const isToday = selectedDate === todayStr
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [shiftFilter, setShiftFilter] = useState<string>('all')
  const [branchFilter, setBranchFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('last_7_days')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Column visibility state (Enterprise table standard)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    employee: true,
    shift: true,
    status: true,
    check_in: true,
    check_out: true,
    break: true,
    late_time: true,
    production_hours: true,
  })

  const columnOptions: ColumnOption[] = useMemo(() => [
    { key: 'employee', label: t('employees.employee', 'Employee') },
    { key: 'shift', label: t('employees.shift', 'Shift') },
    { key: 'status', label: t('employees.status', 'Work Status') },
    { key: 'check_in', label: t('employees.check_in', 'Check In') },
    { key: 'check_out', label: t('employees.check_out', 'Check Out') },
    { key: 'break', label: t('employees.break', 'Break Time') },
    { key: 'late_time', label: t('employees.late_time', 'Late Time') },
    { key: 'production_hours', label: t('employees.production_hours', 'Work Hours') },
  ], [t])

  // Selection state for checkboxes
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  // Modals & Drawers state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [inspectRecord, setInspectRecord] = useState<any | null>(null)
  const [editRecord, setEditRecord] = useState<any | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createModalInitialData, setCreateModalInitialData] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false)

  const isCustomDate = Boolean(selectedDate && selectedDate !== todayStr)

  const activeFiltersCount = [
    isCustomDate ? selectedDate : '',
    statusFilter !== 'all' && statusFilter ? statusFilter : '',
    departmentFilter !== 'all' && departmentFilter ? departmentFilter : '',
    shiftFilter !== 'all' && shiftFilter ? shiftFilter : '',
    branchFilter !== 'all' && branchFilter ? branchFilter : '',
  ].filter(Boolean).length

  const handleResetFilters = () => {
    sound.playClick()
    setSearchQuery('')
    setSelectedDate(todayStr)
    setStatusFilter('all')
    setDepartmentFilter('all')
    setShiftFilter('all')
    setBranchFilter('all')
    setPage(1)
  }

  // Query Daily Attendances for selectedDate
  const { data: attendanceResponse, isLoading } = useQuery({
    queryKey: ['attendances', selectedDate, page, perPage],
    queryFn: () =>
      employeeService.attendances({
        date: selectedDate,
        page,
        per_page: perPage,
        sort_by: 'check_in',
        sort_order: 'desc',
      }),
  })

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeService.deleteAttendance(id),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.deleteSuccess', 'Attendance record deleted'))
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['attendance-dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['attendance-monthly-summary'] })
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err?.response?.data?.message || t('common.deleteFailed', 'Failed to delete record'))
    },
  })

  // Fast Clock Out Mutation
  const clockOutMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      employeeService.updateAttendance(id, payload),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.clock_out_success', 'Clocked out successfully'))
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['attendance-dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['attendance-monthly-summary'] })
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err?.response?.data?.message || t('common.updateFailed', 'Failed to clock out'))
    },
  })

  // Fast Clock In Mutation
  const clockInMutation = useMutation({
    mutationFn: (payload: any) => employeeService.createAttendance(payload),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.clock_in_success', 'Clocked in successfully'))
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['attendance-dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['attendance-monthly-summary'] })
    },
    onError: (err: any) => {
      sound.playError()
      toast.error(err?.response?.data?.message || t('common.saveFailed', 'Failed to clock in'))
    },
  })

  // Clock Out Handler
  const handleQuickClockOut = (item: any) => {
    sound.playClick()
    const now = new Date()
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    clockOutMutation.mutate({
      id: item.id,
      payload: {
        employee_id: item.employee_id || item.employee?.id,
        date: item.attendance_date || item.date || selectedDate,
        shift_id: item.shift_id || item.shift?.id,
        check_in: item.check_in ? item.check_in.substring(0, 5) : '08:00',
        check_out: nowTime,
        status: item.status || 'present',
        notes: item.notes,
      },
    })
  }

  // Clock In Handler
  const handleQuickClockIn = (emp: any, shift?: any) => {
    sound.playClick()
    const now = new Date()
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const chosenShift = shift || shiftsList[0]

    let status = 'present'
    if (chosenShift?.start_time) {
      const [sh, sm] = chosenShift.start_time.split(':').map(Number)
      const [nh, nm] = nowTime.split(':').map(Number)
      const grace = chosenShift.late_grace_minutes || 10
      if (nh * 60 + nm > sh * 60 + sm + grace) {
        status = 'late'
      }
    }

    clockInMutation.mutate({
      employee_id: emp.id,
      date: selectedDate,
      attendance_date: selectedDate,
      shift_id: chosenShift?.id || 1,
      company_id: emp.company_id || 1,
      branch_id: emp.branch_id || 1,
      check_in: nowTime,
      status,
      check_in_method: 'manual',
      is_manual: true,
    })
  }

  const rawRecords = attendanceResponse?.data || []

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>()
    employeesList.forEach((e) => {
      const name = e.department?.name || e.department
      if (name) set.add(name)
    })
    return Array.from(set)
  }, [employeesList])

  // ─── Unified Scheduled Workforce + Live Attendance Records ───
  const unifiedRoster = useMemo(() => {
    const map = new Map<number, any>()
    rawRecords.forEach((r: any) => {
      const eId = r.employee_id || r.employee?.id
      if (eId) map.set(eId, r)
    })

    const listToMerge = employeesList.length > 0 ? employeesList : rawRecords.map((r: any) => r.employee).filter(Boolean)

    return listToMerge.map((emp: any, idx: number) => {
      const record = map.get(emp.id)
      const defaultShift =
        shiftsList.find((s) => s.id === emp.shift_id) ||
        shiftsList[idx % (shiftsList.length || 1)] ||
        shiftsList[0]

      if (record) {
        const isWorkingNow =
          (record.status === 'present' || record.status === 'late') &&
          record.check_in &&
          !record.check_out
        const isCompleted = Boolean(record.check_in && record.check_out)
        return {
          id: record.id,
          isExisting: true,
          employee: record.employee || emp,
          employee_id: emp.id,
          record,
          shift: record.shift || defaultShift,
          check_in: record.check_in,
          check_out: record.check_out,
          status: record.status, // present, late, leave, absent
          isWorkingNow,
          isCompleted,
          isPending: false,
          late_minutes: record.late_minutes || 0,
          break_minutes: defaultShift?.break_minutes || 60,
          worked_hours_formatted:
            record.working_hours || record.worked_hours_formatted || record.worked_duration || '-',
          check_in_method: record.check_in_method || 'QR Scan',
          notes: record.notes,
        }
      } else {
        return {
          id: `pending_${emp.id}`,
          isExisting: false,
          employee: emp,
          employee_id: emp.id,
          record: null,
          shift: defaultShift,
          check_in: null,
          check_out: null,
          status: 'pending',
          isWorkingNow: false,
          isCompleted: false,
          isPending: true,
          late_minutes: 0,
          break_minutes: defaultShift?.break_minutes || 60,
          worked_hours_formatted: '-',
          check_in_method: '-',
          notes: null,
        }
      }
    })
  }, [employeesList, rawRecords, shiftsList])

  // List of absentees & on-leave staff for the Stacked Avatar widget
  const absenteesList = useMemo(() => {
    return unifiedRoster.filter((r) => r.status === 'absent' || r.status === 'leave')
  }, [unifiedRoster])

  // Client-side quick filtering by status, dept, shift & search
  const filteredRoster = useMemo(() => {
    let list = [...unifiedRoster]

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter)
    }

    if (departmentFilter !== 'all') {
      list = list.filter((r) => {
        const dept = r.employee?.department?.name || r.employee?.department || ''
        return dept === departmentFilter
      })
    }

    if (shiftFilter !== 'all') {
      list = list.filter((r) => String(r.shift?.id) === shiftFilter)
    }

    if (branchFilter !== 'all') {
      list = list.filter((r) => {
        const bId = r.employee?.branch_id || r.employee?.branch?.id || r.record?.branch_id
        return String(bId) === branchFilter
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((r) => {
        const empName = (r.employee?.name || '').toLowerCase()
        const empNum = (r.employee?.employee_number || '').toLowerCase()
        const dept = (r.employee?.department?.name || r.employee?.department || '').toLowerCase()
        const pos = (r.employee?.position?.name || r.employee?.position || '').toLowerCase()
        return empName.includes(q) || empNum.includes(q) || dept.includes(q) || pos.includes(q)
      })
    }

    // Sort order
    if (sortBy === 'ascending') {
      list.sort((a, b) => (a.employee?.name || '').localeCompare(b.employee?.name || ''))
    } else if (sortBy === 'descending') {
      list.sort((a, b) => (b.employee?.name || '').localeCompare(a.employee?.name || ''))
    }

    return list
  }, [unifiedRoster, statusFilter, departmentFilter, shiftFilter, branchFilter, searchQuery, sortBy])

  // Status counts for 5-column connected stat strip
  const statusCounts = useMemo(() => {
    return {
      all: unifiedRoster.length,
      present: unifiedRoster.filter((r) => r.status === 'present').length,
      late: unifiedRoster.filter((r) => r.status === 'late').length,
      leave: unifiedRoster.filter((r) => r.status === 'leave').length,
      pending: unifiedRoster.filter((r) => r.status === 'pending').length,
      absent: unifiedRoster.filter((r) => r.status === 'absent').length,
      workingNow: unifiedRoster.filter((r) => r.isWorkingNow).length,
    }
  }, [unifiedRoster])

  // Batch Clock In All Pending Staff
  const handleBatchClockInAll = async () => {
    sound.playClick()
    const pendingList = unifiedRoster.filter((r) => r.isPending)
    if (pendingList.length === 0) return

    setBatchConfirmOpen(false)
    try {
      await Promise.all(
        pendingList.map((item) =>
          employeeService.createAttendance({
            employee_id: item.employee_id,
            date: selectedDate,
            attendance_date: selectedDate,
            shift_id: item.shift?.id || 1,
            company_id: item.employee?.company_id || 1,
            branch_id: item.employee?.branch_id || 1,
            check_in: item.shift?.start_time?.substring(0, 5) || '08:00',
            status: 'present',
            check_in_method: 'manual',
            is_manual: true,
          })
        )
      )
      sound.playSuccess()
      toast.success(t('employees.batch_clockin_success', 'All staff clocked in successfully'))
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['attendance-dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['attendance-monthly-summary'] })
    } catch {
      sound.playError()
      toast.error(t('employees.batch_clockin_failed', 'Failed to clock in staff'))
    }
  }

  // Formatted date label with Day of Week
  const formattedDateLabel = useMemo(() => {
    try {
      const parts = selectedDate.split('-')
      if (parts.length !== 3) return selectedDate
      const year = parseInt(parts[0], 10)
      const monthIndex = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const dateObj = new Date(year, monthIndex, day)
      const dayOfWeek = dateObj.getDay()

      if (isKm) {
        const dayName = KM_DAYS[dayOfWeek] || ''
        const monthName = KM_MONTHS[monthIndex] || parts[1]
        return `${dayName}, ${day} ${monthName} ${year}`
      } else {
        const dayName = EN_DAYS[dayOfWeek] || ''
        const monthName = EN_MONTHS[monthIndex] || parts[1]
        return `${dayName}, ${day} ${monthName} ${year}`
      }
    } catch {
      return selectedDate
    }
  }, [selectedDate, isKm])


  // Checkbox toggle handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredRoster.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredRoster.map((r) => r.id)))
    }
  }

  const handleToggleSelectRow = (id: string | number) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  // Paginated roster for table view
  const paginatedRoster = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredRoster.slice(start, start + perPage)
  }, [filteredRoster, page, perPage])

  const totalPages = Math.ceil(filteredRoster.length / perPage) || 1

  return (
    <div className="space-y-4">
      {/* ─── Flutter 3 Flatten Style KPI Summary Cards ─── */}
      <FlattenStatsGrid columns={4} className="print:hidden">
        {/* Present (Flatten Teal Box) */}
        <FlattenStatCard
          title={t('employees.present', 'Present')}
          value={statusCounts.present}
          useCounter={true}
          icon={UserCheck}
          color="teal"
          delay={0.05}
        />

        {/* Late (Flatten Amber Box) */}
        <FlattenStatCard
          title={t('employees.late_login', 'Late')}
          value={statusCounts.late}
          useCounter={true}
          icon={Clock}
          color="amber"
          delay={0.1}
        />

        {/* Leave (Flatten Cyan Box) */}
        <FlattenStatCard
          title={t('employees.permission', 'Leave')}
          value={statusCounts.leave}
          useCounter={true}
          icon={CalendarCheck}
          color="cyan"
          delay={0.15}
        />

        {/* Absent (Flatten Rose Box) */}
        <FlattenStatCard
          title={t('employees.absent_today', 'Absent')}
          value={statusCounts.absent}
          useCounter={true}
          icon={UserX}
          color="rose"
          delay={0.2}
        />
      </FlattenStatsGrid>

      {/* ─── Bulk Selection Banner (Appears only when rows are checked) ─── */}
      <BulkSelectionBanner
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        extraActions={
          <button
            type="button"
            onClick={() => setBatchConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <LogIn size={13} />
            <span>{t('employees.clock_in_selected', 'Clock In Selected')} ({selectedIds.size})</span>
          </button>
        }
      />

      {/* ─── Global Standard Table Toolbar ─── */}
      <TableToolbar
        search={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val)
          setPage(1)
        }}
        searchPlaceholder={t('employees.search_employee_short', 'Search employee...')}
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={activeFiltersCount > 0}
        filterActiveCount={activeFiltersCount}
        onReset={handleResetFilters}
        hideResetButton={activeFiltersCount === 0 && !searchQuery}
        onRefresh={() => {
          sound.playClick()
          qc.invalidateQueries({ queryKey: ['attendances'] })
          qc.invalidateQueries({ queryKey: ['attendance'] })
          qc.invalidateQueries({ queryKey: ['attendance-dashboard-stats'] })
        }}
        refreshLoading={isLoading}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        columnSettingsTitle={t('employees.columns_visibility', 'Column Visibility')}
      />

      {/* ─── Active Filter Indicator Chips ─── */}
      {(isCustomDate || statusFilter !== 'all' || departmentFilter !== 'all' || shiftFilter !== 'all' || branchFilter !== 'all') && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-xs animate-in fade-in duration-200">
          <span className="text-muted-foreground font-medium">{t('common.activeFilters', 'Active Filters')}:</span>

          {isCustomDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <Calendar size={12} />
              <span>{formattedDateLabel}</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setSelectedDate(todayStr)
                }}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                title={t('employees.reset_to_today', 'Reset to Today')}
              >
                <X size={11} />
              </button>
            </span>
          )}

          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>{t('employees.status', 'Status')}: {statusFilter}</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setStatusFilter('all')
                }}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {departmentFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>{t('employees.department', 'Department')}: {departmentFilter}</span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setDepartmentFilter('all')
                }}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {shiftFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>
                {t('employees.shift', 'Shift')}: {formatShiftName(shiftsList.find((s: any) => String(s.id) === shiftFilter)?.name, isKm)}
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setShiftFilter('all')
                }}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {branchFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>
                {t('employees.branch', 'Branch')}: {branchesList.find((b: any) => String(b.id) === branchFilter)?.name || branchFilter}
              </span>
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setBranchFilter('all')
                }}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline cursor-pointer ml-1"
          >
            {t('common.clearAll', 'Clear All')}
          </button>
        </div>
      )}

      {/* Table Content */}
      <TableWrapper isFetching={isLoading}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-[#e6f4f8] dark:bg-cyan-950/30 sticky top-0 border-b border-cyan-100 dark:border-cyan-900/40 z-10 text-[#0f5b78] dark:text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="w-8 !px-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredRoster.length}
                    onChange={handleToggleSelectAll}
                    className="checkbox"
                  />
                </th>
                {visibleColumns.employee !== false && <th>{t('employees.employee', 'Employee')}</th>}
                {visibleColumns.shift !== false && <th>{t('employees.shift', 'Shift')}</th>}
                {visibleColumns.status !== false && <th>{t('employees.status', 'Status')}</th>}
                {visibleColumns.check_in !== false && <th>{t('employees.check_in', 'Check In')}</th>}
                {visibleColumns.check_out !== false && <th>{t('employees.check_out', 'Check Out')}</th>}
                {visibleColumns.break !== false && <th>{t('employees.break', 'Break')}</th>}
                {visibleColumns.late_time !== false && <th>{t('employees.late_time', 'Late')}</th>}
                {visibleColumns.production_hours !== false && <th>{t('employees.production_hours', 'Work Hours')}</th>}
                <th className="text-right !pr-6">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRoster.length === 0 ? (
                <EmptyState
                  cols={2 + Object.values(visibleColumns).filter(Boolean).length}
                  icon={<Calendar className="text-muted-foreground/50 stroke-1" size={32} />}
                  title={t('employees.no_attendance_records', 'No attendance records found')}
                  description={t('employees.no_attendance_records_desc', 'Please select another date or reset filters')}
                />
              ) : (
                paginatedRoster.map((item) => {
                  const emp = item.employee
                  const isWorkingNow = item.isWorkingNow
                  const isPending = item.isPending
                  const isLate = item.status === 'late'
                  const isChecked = selectedIds.has(item.id)

                  const prodHoursText = formatProductionHours(
                    item.worked_hours_formatted,
                    item.check_in,
                    item.check_out,
                    isKm
                  )

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-muted/30 transition-colors ${isChecked ? 'bg-primary/5' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="w-8 !px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(item.id)}
                          className="checkbox"
                        />
                      </td>

                      {/* Employee: Avatar + Name + Clean Subtitle (No noisy badges) */}
                      {visibleColumns.employee !== false && (
                        <td>
                          <div className="flex items-center gap-3">
                            <EmployeeAvatar
                              photo={emp?.photo}
                              name={emp?.name}
                              id={emp?.id}
                              size="md"
                              getPhotoUrl={getPhotoUrl}
                            />
                            <div className="min-w-0">
                              <span
                                className="font-semibold text-sm text-foreground hover:text-primary cursor-pointer transition-colors block truncate"
                                onClick={() => {
                                  if (item.record) setInspectRecord(item.record)
                                }}
                              >
                                {emp?.name ?? t('employees.employee', 'Employee')}
                              </span>
                              <span className="text-xs text-muted-foreground block truncate mt-0.5">
                                {emp?.employee_number || `EMP-${String(item.employee_id).padStart(4, '0')}`} • {emp?.department?.name || emp?.department || t('employees.department', 'Staff')}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Shift: Clean subtle text */}
                      {visibleColumns.shift !== false && (
                        <td>
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatShiftName(item.shift?.name, isKm)}
                          </span>
                        </td>
                      )}

                      {/* Status: The single primary badge per row */}
                      {visibleColumns.status !== false && (
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                      )}

                      {/* Check In: Clean tabular font-mono */}
                      {visibleColumns.check_in !== false && (
                        <td className="font-mono text-xs">
                          {item.check_in ? (
                            <div className="flex items-center gap-1.5">
                              <span className={isLate ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-foreground font-medium'}>
                                {item.check_in.substring(0, 5)}
                              </span>
                              {item.check_in_method && (
                                <span className="text-[10px] text-muted-foreground/60 font-sans" title={item.check_in_method}>
                                  ({item.check_in_method === 'qr_scan' ? 'QR' : item.check_in_method})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                      )}

                      {/* Check Out: Clean tabular font-mono */}
                      {visibleColumns.check_out !== false && (
                        <td className="font-mono text-xs">
                          {item.check_out ? (
                            <span className="text-foreground font-medium">
                              {item.check_out.substring(0, 5)}
                            </span>
                          ) : isWorkingNow ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{t('employees.working_now', 'Working Now')}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                      )}

                      {/* Break */}
                      {visibleColumns.break !== false && (
                        <td className="font-mono text-xs text-muted-foreground">
                          {item.break_minutes ? `${item.break_minutes} ${t('common.minutes', 'mins')}` : '-'}
                        </td>
                      )}

                      {/* Late */}
                      {visibleColumns.late_time !== false && (
                        <td className="font-mono text-xs">
                          {item.late_minutes > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              {item.late_minutes} {t('common.minutes', 'mins')}
                            </span>
                          ) : isLate ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              15 {t('common.minutes', 'mins')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                      )}

                      {/* Work Hours: Clean tabular font-mono */}
                      {visibleColumns.production_hours !== false && (
                        <td>
                          <span className="font-mono text-xs font-medium text-foreground">
                            {prodHoursText !== '-' ? prodHoursText : <span className="text-muted-foreground/30">-</span>}
                          </span>
                        </td>
                      )}

                      {/* Actions: Global TableActionMenu (Harmonized with all pages) */}
                      <td className="print:hidden !text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {item.record ? (
                            <TableActionMenu
                              variant="hybrid"
                              maxInline={2}
                              buttonSize="sm"
                              align="right"
                              items={
                                isWorkingNow
                                  ? [
                                      {
                                        label: t('employees.clock_out', 'Clock Out'),
                                        icon: LogOut,
                                        onClick: () => handleQuickClockOut(item.record),
                                        variant: 'warning',
                                      },
                                      {
                                        label: t('common.viewDetails', 'View Details'),
                                        icon: Eye,
                                        onClick: () => setInspectRecord(item.record),
                                        variant: 'default',
                                      },
                                    ]
                                  : [
                                      {
                                        label: t('common.viewDetails', 'View Details'),
                                        icon: Eye,
                                        onClick: () => setInspectRecord(item.record),
                                        variant: 'default',
                                      },
                                    ]
                              }
                              onEdit={() => setEditRecord(item.record)}
                              editLabel={t('common.edit', 'Edit')}
                              onDelete={() => setDeleteTarget(item.record)}
                              deleteLabel={t('common.delete', 'Delete')}
                            />
                          ) : (
                            <TableActionMenu
                              variant="hybrid"
                              maxInline={2}
                              buttonSize="sm"
                              align="right"
                              items={[
                                {
                                  label: t('employees.clock_in', 'Clock In'),
                                  icon: LogIn,
                                  onClick: () => handleQuickClockIn(emp, item.shift),
                                  variant: 'success',
                                },
                                {
                                  label: t('common.add', 'Add'),
                                  icon: Plus,
                                  onClick: () => {
                                    setCreateModalInitialData({
                                      employee_id: emp.id,
                                      shift_id: item.shift?.id,
                                      check_in: item.shift?.start_time ? item.shift.start_time.substring(0, 5) : '08:00',
                                      check_out: item.shift?.end_time ? item.shift.end_time.substring(0, 5) : '17:00',
                                      date: selectedDate,
                                      attendance_date: selectedDate,
                                    })
                                    setCreateModalOpen(true)
                                  },
                                  variant: 'default',
                                },
                              ]}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>

      {/* Standard Pagination below TableWrapper */}
      {filteredRoster.length > 0 && (
        <Pagination
          currentPage={page}
          lastPage={totalPages}
          total={filteredRoster.length}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      {/* ─── Batch Clock-In Confirmation Dialog ─── */}
      <ConfirmDialog
        open={batchConfirmOpen}
        title={t('employees.batch_clockin_title', 'Clock In All Staff')}
        message={t('employees.batch_clockin_confirm', {
          count: statusCounts.pending,
          defaultValue: `Are you sure you want to clock in all ${statusCounts.pending} staff who have not arrived yet?`,
        })}
        confirmText={t('employees.batch_clockin_btn', 'Clock In All')}
        variant="info"
        onConfirm={handleBatchClockInAll}
        onCancel={() => setBatchConfirmOpen(false)}
      />

      {/* ─── Detail Audit Modal ─── */}
      <AttendanceDetailModal
        attendance={inspectRecord}
        onClose={() => setInspectRecord(null)}
      />

      {/* ─── Quick Attendance Record / Edit Modal ─── */}
      {(createModalOpen || editRecord) && (
        <QuickAttendanceModal
          open={createModalOpen || !!editRecord}
          onClose={() => {
            setCreateModalOpen(false)
            setCreateModalInitialData(null)
            setEditRecord(null)
          }}
          initialData={editRecord || createModalInitialData}
          employeesList={employeesList}
          shiftsList={shiftsList}
          branchesList={branchesList}
          getPhotoUrl={getPhotoUrl}
        />
      )}

      {/* ─── Delete Confirmation Dialog ─── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('employees.delete_attendance_title', 'Delete Attendance Record')}
        message={t('employees.delete_attendance_confirm', 'Are you sure you want to delete this attendance record? This action cannot be undone.')}
        confirmText={t('common.delete', 'Delete')}
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget?.id && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ─── Attendance Advanced Filter Drawer ─── */}
      <AttendanceFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onReset={handleResetFilters}
        selectedDate={selectedDate}
        setSelectedDate={(val) => {
          setSelectedDate(val)
          setPage(1)
        }}
        todayStr={todayStr}
        statusFilter={statusFilter}
        setStatusFilter={(val) => {
          setStatusFilter(val as StatusFilter)
          setPage(1)
        }}
        departmentFilter={departmentFilter}
        setDepartmentFilter={(val) => {
          setDepartmentFilter(val)
          setPage(1)
        }}
        shiftFilter={shiftFilter}
        setShiftFilter={(val) => {
          setShiftFilter(val)
          setPage(1)
        }}
        branchFilter={branchFilter}
        setBranchFilter={(val) => {
          setBranchFilter(val)
          setPage(1)
        }}
        departmentsList={departmentsList}
        shiftsList={shiftsList}
        branchesList={branchesList}
      />
    </div>
  )
}

export default DailyAttendanceLogsTab
