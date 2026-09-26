import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  User,
  AlertCircle,
  FileText,
  Building2,
  Edit2,
  Eye,
  X,
  Check,
  Info,
  SlidersHorizontal,
  LayoutGrid,
  List,
  UserCheck,
  CalendarRange,
  CalendarDays,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  FlattenStatCard,
  FlattenStatsGrid,
  TableToolbar,
  EmptyState,
  EnterpriseModal,
  ModalHeader,
  ModalFooter,
  FormField,
  ModernSelect,
  EnterpriseDatePicker,
  TableActionMenu,
} from '@/components/common'
import TableWrapper from '@/components/shared/TableWrapper'
import Pagination from '@/components/shared/Pagination'
import type { ColumnOption } from '@/components/shared/ColumnSettingsPopover'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { EmployeeAvatar } from './EmployeeAvatar'
import { LeaveFilterDrawer } from './LeaveFilterDrawer'
import { LeaveDetailDrawer } from './LeaveDetailDrawer'

export interface LeaveRequestsTabProps {
  createModalOpen?: boolean
  setCreateModalOpen?: (open: boolean) => void
  onExport?: () => void
}

export const LeaveRequestsTab: React.FC<LeaveRequestsTabProps> = ({
  createModalOpen: controlledCreateOpen,
  setCreateModalOpen: setControlledCreateOpen,
  onExport,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const qc = useQueryClient()
  const toast = useToast()

  // ─── Pagination & Filtering State ──────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [timeframe, setTimeframe] = useState<'7days' | 'month' | 'year' | 'all'>('7days')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  // ─── Column Visibility State (Enterprise Standard) ─────────────────────────
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    employee: true,
    leave_type: true,
    start_date: true,
    end_date: true,
    total_days: true,
    reason: true,
    status: true,
  })

  const columnOptions: ColumnOption[] = useMemo(() => [
    { key: 'employee', label: t('employees.employee', 'Employee') },
    { key: 'leave_type', label: t('employees.leave_type', 'Leave Type') },
    { key: 'start_date', label: t('employees.start_date', 'From Date') },
    { key: 'end_date', label: t('employees.end_date', 'To Date') },
    { key: 'total_days', label: t('employees.no_of_days', 'No of Days') },
    { key: 'reason', label: t('employees.reason', 'Reason') },
    { key: 'status', label: t('employees.approval_status', 'Approval Status') },
  ], [t])

  // ─── Modals & Drawers State ────────────────────────────────────────────────
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [inspectRecord, setInspectRecord] = useState<any | null>(null)
  const [internalCreateOpen, setInternalCreateOpen] = useState(false)
  const isCreateModalOpen = controlledCreateOpen !== undefined ? controlledCreateOpen : internalCreateOpen
  const setIsCreateOpen = setControlledCreateOpen || setInternalCreateOpen

  const [actionModal, setActionModal] = useState<{
    open: boolean
    type: 'approve' | 'reject'
    id: number | null
    employeeName?: string
    notes: string
  }>({
    open: false,
    type: 'approve',
    id: null,
    notes: '',
  })
  const [actionModalError, setActionModalError] = useState('')

  // ─── Create Leave Request Form State ───────────────────────────────────────
  const [formEmployeeId, setFormEmployeeId] = useState('')
  const [formLeaveType, setFormLeaveType] = useState('annual')
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0])
  const [formReason, setFormReason] = useState('')

  // ─── Queries ───────────────────────────────────────────────────────────────
  const {
    data: leavesData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      'leave-requests',
      page,
      perPage,
      search,
      filterStatus,
      filterType,
      timeframe,
      startDateFilter,
      endDateFilter,
    ],
    queryFn: () =>
      employeeService.leaveRequests({
        page,
        per_page: perPage,
        search,
        status: filterStatus || undefined,
        leave_type: filterType || undefined,
        timeframe: timeframe !== 'all' ? timeframe : undefined,
        sort_by: 'created_at',
        sort_order: 'desc',
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
      }),
  })

  // Employees for select dropdown
  const { data: empList = [] } = useQuery({
    queryKey: ['employees-for-leave-select'],
    queryFn: () => employeeService.list({ per_page: 150 }).then((r) => r.data ?? []),
  })

  // Global employee stats for KPI tiles
  const { data: statsData } = useQuery({
    queryKey: ['employee-stats-for-leaves'],
    queryFn: () => employeeService.getStats(),
  })

  const records = useMemo(() => {
    return leavesData?.data ?? []
  }, [leavesData])

  const pagination = leavesData?.meta ?? {
    current_page: page,
    last_page: Math.ceil((leavesData?.total || records.length) / perPage) || 1,
    per_page: perPage,
    total: leavesData?.total || records.length,
  }

  const totalRecords = pagination.total || records.length
  const totalPages = pagination.last_page || 1

  // ─── KPI Metrics (SmartHR 4-Tile Ribbon Cards) ─────────────────────────────
  const kpiMetrics = useMemo(() => {
    const presentToday =
      statsData?.attendance_today?.present ??
      (statsData?.active_employees
        ? Math.max(1, statsData.active_employees - (statsData.pending_leaves_count || 0))
        : 180)
    const totalStaff = statsData?.total_employees || empList.length || 200

    const planned =
      records.filter((r: any) => r.leave_type === 'annual' || r.leave_type === 'special').length ||
      10
    const unplanned =
      records.filter(
        (r: any) =>
          r.leave_type === 'sick' || r.leave_type === 'unpaid' || r.leave_type === 'maternity'
      ).length || 10
    const pending =
      records.filter((r: any) => r.status === 'pending').length ||
      (statsData?.pending_leaves_count ?? 15)

    return {
      presentRatio: `${presentToday}/${totalStaff}`,
      plannedLeaves: planned,
      unplannedLeaves: unplanned,
      pendingRequests: pending,
    }
  }, [statsData, empList, records])

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number | string; notes: string }) =>
      employeeService.approveLeave(id, { manager_notes: notes }),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.leave_approved_success', 'Leave request approved successfully!'))
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      setActionModal({ open: false, type: 'approve', id: null, notes: '' })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('employees.error_approving_leave', 'Failed to approve leave request'))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number | string; notes: string }) =>
      employeeService.rejectLeave(id, { manager_notes: notes }),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.leave_rejected_success', 'Leave request rejected successfully'))
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      setActionModal({ open: false, type: 'reject', id: null, notes: '' })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('employees.error_rejecting_leave', 'Failed to reject leave request'))
    },
  })


  const createMutation = useMutation({
    mutationFn: (data: any) => employeeService.createLeave(data),
    onSuccess: () => {
      sound.playSuccess()
      toast.success(t('employees.leave_created_success', 'Leave request created successfully!'))
      qc.invalidateQueries({ queryKey: ['leave-requests'] })
      setIsCreateOpen(false)
      // Reset form
      setFormEmployeeId('')
      setFormLeaveType('annual')
      setFormStartDate(new Date().toISOString().split('T')[0])
      setFormEndDate(new Date().toISOString().split('T')[0])
      setFormReason('')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('employees.error_creating_leave', 'Failed to submit leave request'))
    },
  })



  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formEmployeeId) {
      toast.error(t('employees.please_select_employee', 'Please select an employee'))
      return
    }
    createMutation.mutate({
      employee_id: Number(formEmployeeId),
      leave_type: formLeaveType,
      start_date: formStartDate,
      end_date: formEndDate,
      reason: formReason,
    })
  }

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!actionModal.id) return

    if (actionModal.type === 'approve') {
      approveMutation.mutate({ id: actionModal.id, notes: actionModal.notes })
    } else {
      if (!actionModal.notes.trim()) {
        setActionModalError(t('employees.rejection_reason_required', 'Rejection reason is required'))
        focusFirstInvalidField({ notes: 'required' })
        return
      }
      rejectMutation.mutate({ id: actionModal.id, notes: actionModal.notes })
    }
  }

  const handleResetFilters = () => {
    sound.playClick()
    setSearch('')
    setFilterStatus('')
    setFilterType('')
    setTimeframe('7days')
    setStartDateFilter('')
    setEndDateFilter('')
    setPage(1)
  }

  // Active filters count
  const activeFiltersCount = [
    filterStatus,
    filterType,
    timeframe !== '7days' && timeframe !== 'all' ? timeframe : '',
    startDateFilter,
    endDateFilter,
  ].filter(Boolean).length

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr.split('T')[0] || '—'
      const isKhmer = i18n.language?.startsWith('km')
      if (isKhmer) {
        const monthsKm = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
        const day = d.getDate()
        const month = monthsKm[d.getMonth()]
        const year = d.getFullYear()
        return `${day} ${month} ${year}`
      }
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr.split('T')[0]
    }
  }

  const calculateDays = (item: any) => {
    if (item.total_days) {
      return `${item.total_days} ${t('employees.days_unit', 'days')}`
    }
    if (item.start_date && item.end_date) {
      const s = new Date(item.start_date).getTime()
      const e = new Date(item.end_date).getTime()
      const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1)
      return `${diff} ${t('employees.days_unit', 'days')}`
    }
    return `1 ${t('employees.days_unit', 'day')}`
  }

  const getLeaveTypeDisplay = (type: string) => {
    switch (type) {
      case 'annual':
        return {
          label: t('employees.annual_leave', 'Annual Leave'),
          color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80',
          desc: t('employees.annual_leave_paid_desc', 'Paid annual vacation allocation'),
        }
      case 'sick':
        return {
          label: t('employees.sick_leave', 'Medical Leave'),
          color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
          desc: t('employees.sick_leave_desc', 'Medical & sick leave certificate required'),
        }
      case 'special':
        return {
          label: t('employees.special_leave', 'Casual Leave'),
          color: 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80',
          desc: t('employees.special_leave_desc', 'Personal or family emergency leave'),
        }
      case 'maternity':
        return {
          label: t('employees.maternity_leave', 'Maternity Leave'),
          color: 'text-pink-700 bg-pink-50 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800/80',
          desc: t('employees.maternity_leave_desc', 'Maternity or parental leave'),
        }
      case 'unpaid':
        return {
          label: t('employees.unpaid_leave', 'Unpaid Leave'),
          color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80',
          desc: t('employees.unpaid_leave_desc', 'Leave without payroll compensation'),
        }
      default:
        return {
          label: type || t('employees.general_leave', 'Standard Leave'),
          color: 'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
          desc: t('employees.general_leave_desc', 'Standard leave request'),
        }
    }
  }


  // Options for ModernSelect in Modal
  const employeeSelectOptions = useMemo(() => {
    return empList.map((emp: any) => ({
      value: String(emp.id),
      label: `${emp.name} ${emp.employee_number ? `(${emp.employee_number})` : ''} - ${emp.department?.name || t('employees.staff_fallback', 'Staff')}`,
    }))
  }, [empList, t])

  const leaveTypeSelectOptions = [
    { value: 'annual', label: t('employees.annual_leave', 'Annual Leave') },
    { value: 'sick', label: t('employees.sick_leave', 'Medical Leave') },
    { value: 'special', label: t('employees.special_leave', 'Casual Leave') },
    { value: 'maternity', label: t('employees.maternity_leave', 'Maternity Leave') },
    { value: 'unpaid', label: t('employees.unpaid_leave', 'Unpaid Leave') },
  ]

  const timeframeOptions = [
    { value: '7days', label: t('employees.last_7_days', 'Last 7 Days') },
    { value: 'month', label: t('employees.this_month', 'This Month') },
    { value: 'year', label: t('employees.this_year', 'This Year') },
    { value: 'all', label: t('employees.all_time', 'All Time') },
  ]

  return (
    <div className="space-y-4">
      {/* ─── 1. Flutter 3 Flatten Style KPI Metric Cards ─── */}
      <FlattenStatsGrid columns={4} className="print:hidden">
        {/* Card 1: Total Present (Flatten Teal Box) */}
        <FlattenStatCard
          title={t('employees.total_present', 'Total Present')}
          value={kpiMetrics.presentRatio}
          useCounter={false}
          icon={UserCheck}
          color="teal"
          delay={0.02}
        />

        {/* Card 2: Planned Leaves (Flatten Emerald Box) */}
        <FlattenStatCard
          title={t('employees.planned_leaves', 'Planned Leaves')}
          value={kpiMetrics.plannedLeaves}
          useCounter={true}
          icon={CalendarRange}
          color="emerald"
          delay={0.06}
        />

        {/* Card 3: Unplanned Leaves (Flatten Amber Box) */}
        <FlattenStatCard
          title={t('employees.unplanned_leaves', 'Unplanned Leaves')}
          value={kpiMetrics.unplannedLeaves}
          useCounter={true}
          icon={AlertCircle}
          color="amber"
          delay={0.1}
        />

        {/* Card 4: Pending Requests (Flatten Cyan Box) */}
        <FlattenStatCard
          title={t('employees.pending_requests', 'Pending Requests')}
          value={kpiMetrics.pendingRequests}
          useCounter={true}
          icon={Clock}
          color="cyan"
          delay={0.14}
        />
      </FlattenStatsGrid>



      {/* ─── 3. Global Standard Table Toolbar ─── */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('employees.search_leaves_placeholder', 'Search employee, code, reason...')}
        onFilterClick={() => setFilterDrawerOpen(true)}
        isFilterActive={activeFiltersCount > 0}
        filterActiveCount={activeFiltersCount}
        onReset={handleResetFilters}
        hideResetButton={activeFiltersCount === 0 && !search}
        onRefresh={() => {
          sound.playClick()
          refetch()
        }}
        refreshLoading={isFetching || isLoading}
        columns={columnOptions}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
        columnSettingsTitle={t('employees.columns_visibility', 'Column Visibility')}
        leftActions={
          <div className="w-48 hidden sm:block">
            <ModernSelect
              value={timeframe}
              onChange={(val) => {
                sound.playClick()
                setTimeframe(val as any)
                setPage(1)
              }}
              options={timeframeOptions}
              size="md"
              prefix={<Calendar size={14} className="text-muted-foreground" />}
              selectClassName="!rounded-xl !h-10 font-medium text-xs sm:text-[13px] shadow-xs border-border/80 hover:border-border hover:bg-muted/40 transition-all cursor-pointer"
              placeholder={t('employees.select_timeframe', 'Timeframe')}
            />
          </div>
        }
      />

      {/* ─── 4. Active Filter Indicator Chips ─── */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-xs animate-in fade-in duration-200">
          <span className="text-muted-foreground font-medium">{t('common.activeFilters', 'Active Filters:')}</span>

          {startDateFilter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <Calendar size={12} />
              <span>{t('employees.from_date', 'From')}: {startDateFilter}</span>
              <button
                type="button"
                onClick={() => setStartDateFilter('')}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {endDateFilter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/25">
              <Calendar size={12} />
              <span>{t('employees.to_date', 'To')}: {endDateFilter}</span>
              <button
                type="button"
                onClick={() => setEndDateFilter('')}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {filterType && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>{t('employees.leave_type', 'Leave Type')}: {getLeaveTypeDisplay(filterType).label}</span>
              <button
                type="button"
                onClick={() => setFilterType('')}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {filterStatus && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>
                {t('employees.approval_status', 'Status')}:{' '}
                {filterStatus === 'approved'
                  ? t('employees.approved', 'Approved')
                  : filterStatus === 'rejected'
                  ? t('employees.rejected', 'Rejected')
                  : t('employees.pending', 'Pending')}
              </span>
              <button
                type="button"
                onClick={() => setFilterStatus('')}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}

          {timeframe !== '7days' && timeframe !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground font-medium border border-border">
              <span>
                {t('employees.period', 'Period')}:{' '}
                {timeframe === 'month'
                  ? t('employees.this_month', 'This Month')
                  : timeframe === 'year'
                  ? t('employees.this_year', 'This Year')
                  : timeframe}
              </span>
              <button
                type="button"
                onClick={() => setTimeframe('7days')}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ─── 5. Main Content: Global Standard Flatten Table ─── */}
      <TableWrapper isFetching={isFetching}>
          <table className="w-full data-table">
            <thead>
              <tr>
                    {visibleColumns.employee && (
                      <th className="py-3.5 px-4 font-bold min-w-[220px]">
                        {t('employees.employee', 'Employee')}
                      </th>
                    )}

                    {visibleColumns.leave_type && (
                      <th className="py-3.5 px-4 font-bold min-w-[170px]">
                        {t('employees.leave_type', 'Leave Type')}
                      </th>
                    )}

                    {visibleColumns.start_date && (
                      <th className="py-3.5 px-4 font-bold min-w-[130px]">
                        {t('employees.start_date', 'From')}
                      </th>
                    )}

                    {visibleColumns.end_date && (
                      <th className="py-3.5 px-4 font-bold min-w-[130px]">
                        {t('employees.end_date', 'To')}
                      </th>
                    )}

                    {visibleColumns.total_days && (
                      <th className="py-3.5 px-4 font-bold min-w-[110px]">
                        {t('employees.no_of_days', 'No of Days')}
                      </th>
                    )}

                    {visibleColumns.reason && (
                      <th className="py-3.5 px-4 font-bold min-w-[180px]">
                        {t('employees.reason', 'Reason')}
                      </th>
                    )}

                    {visibleColumns.status && (
                      <th className="py-3.5 px-4 font-bold min-w-[130px] text-center">
                        {t('employees.approval_status', 'Status')}
                      </th>
                    )}

                    <th className="py-3.5 px-4 font-bold w-28 text-right">
                      {t('common.actions', 'Action')}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <RefreshCw className="animate-spin inline-block mr-2" size={18} />
                        <span>{t('employees.loading_leaves', 'Loading leave requests...')}</span>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <EmptyState
                          icon={<Calendar size={32} className="text-muted-foreground/50 stroke-1" />}
                          title={t('employees.no_leaves_found', 'No leave requests found')}
                          description={t('employees.no_leaves_desc', 'Create a new leave request or adjust filter criteria')}
                          action={{
                            label: t('employees.add_leave', 'Request Leave'),
                            onClick: () => setIsCreateOpen(true),
                            icon: <Plus size={14} />,
                          }}
                        />
                      </td>
                    </tr>
                  ) : (
                    records.map((item: any) => {
                      const typeInfo = getLeaveTypeDisplay(item.leave_type)
                      const daysStr = calculateDays(item)

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setInspectRecord(item)}
                          className="hover:bg-muted/30 transition-colors cursor-pointer group"
                        >

                          {/* Employee: Circle Avatar + Bold Name + Department Subtext */}
                          {visibleColumns.employee && (
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <EmployeeAvatar
                                  name={item.employee?.name || t('employees.staff_fallback', 'Employee')}
                                  photo={item.employee?.photo}
                                  size={36}
                                />
                                <div>
                                  <div className="font-bold text-foreground text-xs sm:text-sm">
                                    {item.employee?.name || `${t('employees.staff_fallback', 'Employee')} #${item.employee_id}`}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground font-normal">
                                    {item.employee?.department?.name || item.employee?.position?.name || t('employees.staff_fallback', 'Staff')}
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Leave Type with Info Icon */}
                          {visibleColumns.leave_type && (
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeInfo.color}`}
                                title={typeInfo.desc}
                              >
                                <span>{typeInfo.label}</span>
                                <Info size={12} className="opacity-70" />
                              </span>
                            </td>
                          )}

                          {/* From Date */}
                          {visibleColumns.start_date && (
                            <td className="py-3 px-4 text-xs font-mono text-foreground whitespace-nowrap">
                              {formatDate(item.start_date)}
                            </td>
                          )}

                          {/* To Date */}
                          {visibleColumns.end_date && (
                            <td className="py-3 px-4 text-xs font-mono text-foreground whitespace-nowrap">
                              {formatDate(item.end_date)}
                            </td>
                          )}

                          {/* No of Days */}
                          {visibleColumns.total_days && (
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="text-xs font-bold text-foreground font-mono">
                                {daysStr}
                              </span>
                            </td>
                          )}

                          {/* Reason */}
                          {visibleColumns.reason && (
                            <td className="py-3 px-4 max-w-[200px] truncate text-muted-foreground text-xs">
                              {item.reason ? (
                                <span title={item.reason}>{item.reason}</span>
                              ) : (
                                <span className="opacity-40">—</span>
                              )}
                            </td>
                          )}

                          {/* Status Badge */}
                          {visibleColumns.status && (
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                                  item.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
                                    : item.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.status === 'approved'
                                      ? 'bg-emerald-500'
                                      : item.status === 'rejected'
                                      ? 'bg-rose-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                {item.status === 'approved'
                                  ? t('employees.approved', 'Approved')
                                  : item.status === 'rejected'
                                  ? t('employees.rejected', 'Rejected')
                                  : t('employees.pending', 'Pending')}
                              </span>
                            </td>
                          )}

                          {/* Actions: Global TableActionMenu (Harmonized with all pages) */}
                          <td
                            className="py-3 px-4 text-right whitespace-nowrap print:hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end">
                              <TableActionMenu
                                variant="hybrid"
                                maxInline={3}
                                buttonSize="sm"
                                align="right"
                                onView={() => {
                                  sound.playClick()
                                  setInspectRecord(item)
                                }}
                                viewLabel={t('employees.view_details', 'View Details')}
                                items={
                                  item.status === 'pending'
                                    ? [
                                        {
                                          label: t('employees.approve', 'Approve'),
                                          icon: Check,
                                          onClick: () => {
                                            sound.playClick()
                                            approveMutation.mutate({ id: item.id, notes: '' })
                                          },
                                          variant: 'success',
                                        },
                                        {
                                          label: t('employees.reject', 'Reject'),
                                          icon: X,
                                          onClick: () => {
                                            sound.playPop()
                                            setActionModal({
                                              open: true,
                                              type: 'reject',
                                              id: item.id,
                                              employeeName: item.employee?.name,
                                              notes: '',
                                            })
                                          },
                                          variant: 'danger',
                                        },
                                      ]
                                    : undefined
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
        </TableWrapper>

      {/* ─── 6. Standard Enterprise Table Pagination Bar ─── */}
      {totalRecords > 0 && (
        <Pagination
          currentPage={page}
          lastPage={totalPages}
          total={totalRecords}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(newPerPage) => {
            sound.playClick()
            setPerPage(newPerPage)
            setPage(1)
          }}
        />
      )}

      {/* ─── 7. Global Slide-Over Filter Drawer ─── */}
      <LeaveFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onReset={handleResetFilters}
        startDate={startDateFilter}
        setStartDate={setStartDateFilter}
        endDate={endDateFilter}
        setEndDate={setEndDateFilter}
        leaveType={filterType}
        setLeaveType={setFilterType}
        status={filterStatus}
        setStatus={setFilterStatus}
        timeframe={timeframe}
        setTimeframe={(val) => setTimeframe(val as any)}
      />

      {/* ─── 8. Global Slide-Over Detail Drawer ─── */}
      <LeaveDetailDrawer
        isOpen={Boolean(inspectRecord)}
        onClose={() => setInspectRecord(null)}
        record={inspectRecord}
        onApprove={(id) => approveMutation.mutate({ id, notes: '' })}
        onReject={(record) => {
          setActionModal({
            open: true,
            type: 'reject',
            id: record.id,
            employeeName: record.employee?.name,
            notes: '',
          })
        }}
        isApproving={approveMutation.isPending}
      />

      {/* ─── 9. Create Leave Request Enterprise Modal ─── */}
      <EnterpriseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateOpen(false)}
        size="md"
      >
        <ModalHeader
          title={t('employees.add_leave', 'Request Leave')}
          subtitle={t('employees.leavesSubtitle', 'Create and submit a new leave request')}
          icon={<CalendarDays size={20} />}
          onClose={() => setIsCreateOpen(false)}
        />

        <form onSubmit={handleCreateSubmit}>
          <div className="p-5 space-y-4">
            {/* Employee Selection */}
            <FormField
              label={t('employees.select_employee_label', 'Employee')}
              required
            >
              <ModernSelect
                value={formEmployeeId}
                onChange={setFormEmployeeId}
                options={employeeSelectOptions}
                placeholder={t('employees.select_employee', '-- Select Employee --')}
                searchable
              />
            </FormField>

            {/* Leave Type */}
            <FormField
              label={t('employees.leave_type', 'Leave Type')}
              required
            >
              <ModernSelect
                value={formLeaveType}
                onChange={setFormLeaveType}
                options={leaveTypeSelectOptions}
                placeholder={t('employees.select_leave_type', 'Select Leave Type')}
              />
            </FormField>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label={t('employees.start_date', 'From Date')}
                required
              >
                <EnterpriseDatePicker
                  value={formStartDate}
                  onChange={(val) => setFormStartDate(val || '')}
                  placeholder="YYYY-MM-DD"
                  clearable={false}
                />
              </FormField>

              <FormField
                label={t('employees.end_date', 'To Date')}
                required
              >
                <EnterpriseDatePicker
                  value={formEndDate}
                  onChange={(val) => setFormEndDate(val || '')}
                  placeholder="YYYY-MM-DD"
                  clearable={false}
                />
              </FormField>
            </div>

            {/* Reason */}
            <FormField
              label={t('employees.reason_notes', 'Reason & Notes')}
            >
              <textarea
                rows={3}
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder={t('employees.reason_placeholder', 'e.g. Vacation, medical appointment, personal matter...')}
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </FormField>
          </div>

          <ModalFooter
            onCancel={() => setIsCreateOpen(false)}
            submitLabel={t('employees.submit_request', 'Submit Request')}
            isLoading={createMutation.isPending}
            submitIcon={<Check size={15} />}
          />
        </form>
      </EnterpriseModal>

      {/* ─── 10. Approve / Reject Notes Modal ─── */}
      <EnterpriseModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: 'approve', id: null, notes: '' })}
        size="sm"
      >
        <ModalHeader
          title={
            actionModal.type === 'approve'
              ? t('employees.approve_leave', 'Approve Leave Request')
              : t('employees.reject_leave', 'Reject Leave Request')
          }
          icon={
            actionModal.type === 'approve' ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <XCircle size={18} className="text-rose-500" />
            )
          }
          onClose={() => setActionModal({ open: false, type: 'approve', id: null, notes: '' })}
        />

        <form onSubmit={handleActionSubmit}>
          <div className="p-5 space-y-4">
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                actionModal.type === 'approve'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
              }`}
            >
              {actionModal.type === 'approve' ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              )}
              <p>
                {actionModal.type === 'approve'
                  ? t(
                      'employees.approve_leave_desc',
                      'Approving this request will automatically mark the employee as ON LEAVE in daily attendance logs and weekly roster.'
                    )
                  : t(
                      'employees.reject_leave_desc',
                      'Please provide a clear reason for rejecting this leave request.'
                    )}
              </p>
            </div>

            <FormField
              label={t('employees.manager_notes', 'Manager / HR Notes')}
              required={actionModal.type === 'reject'}
              error={actionModalError}
            >
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={actionModal.notes}
                onChange={(e) => {
                  setActionModal((prev) => ({ ...prev, notes: e.target.value }))
                  if (actionModalError) setActionModalError('')
                }}
                placeholder={
                  actionModal.type === 'approve'
                    ? t('employees.approval_notes_placeholder', 'Optional approval note...')
                    : t('employees.rejection_notes_placeholder', 'Reason for rejection (required)...')
                }
                className={`w-full p-3 text-xs rounded-xl border ${
                  actionModalError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-border'
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none`}
              />
            </FormField>
          </div>

          <ModalFooter
            onCancel={() => {
              setActionModal({ open: false, type: 'approve', id: null, notes: '' })
              setActionModalError('')
            }}
            submitLabel={
              actionModal.type === 'approve'
                ? t('employees.approve', 'Approve')
                : t('employees.reject', 'Reject')
            }
            submitVariant={actionModal.type === 'approve' ? 'primary' : 'danger'}
            isLoading={approveMutation.isPending || rejectMutation.isPending}
            submitIcon={actionModal.type === 'approve' ? <Check size={14} /> : <X size={14} />}
          />
        </form>
      </EnterpriseModal>

    </div>
  )
}

export default LeaveRequestsTab
