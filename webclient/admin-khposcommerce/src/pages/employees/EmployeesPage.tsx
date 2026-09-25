import React, { useState, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Trash2, RefreshCw, Briefcase, Users, UserCheck, DollarSign, Calendar,
  Download, Upload, Filter, Settings, RotateCcw, QrCode, X, AlertCircle, FileSpreadsheet, Calculator, FileText,
  Landmark, Copy, Printer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { companyService } from '@/services/companyService'
import { userService } from '@/services/userService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { downloadCsv } from '@/utils/export'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Breadcrumb from '@/components/common/Breadcrumb'
import {
  HeaderActionsGroup,
  AddButton,
  ActionButton,
  ExportButton,
  ImportButton,
  QrKioskButton,
  TableToolbar,
} from '@/components/common'
import { useServerPagination } from '@/hooks/useServerPagination'
import { usePageTab } from '@/hooks/usePageTab'
import { getAbsoluteImageUrl } from '@/utils/image'
import ResetButton from '@/components/shared/ResetButton'
import ColumnSettingsPopover from '@/components/shared/ColumnSettingsPopover'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'
import ShiftsTab from './components/ShiftsTab'
import LeaveRequestsTab from './components/LeaveRequestsTab'
import HolidaysTab from './components/HolidaysTab'
import AutoGeneratePayrollModal from './components/AutoGeneratePayrollModal'
import AbaBulkExportModal from './components/AbaBulkExportModal'
import PayslipModal from './components/PayslipModal'
import DynamicQrKioskModal from './components/DynamicQrKioskModal'
import AttendanceDetailModal from './components/AttendanceDetailModal'
import MonthlyAttendanceSummaryTab from './components/MonthlyAttendanceSummaryTab'
import AttendanceManagementSection, { type AttendanceSubView } from './components/AttendanceManagementSection'
import { EmployeeStatsCards } from './components/EmployeeStatsCards'
import { EmployeeFilterDrawer } from './components/EmployeeFilterDrawer'
import { EmployeeDetailDrawer } from './components/EmployeeDetailDrawer'
import { EmployeeFormModal } from './components/EmployeeFormModal'
import { EmployeeImportModal } from './components/EmployeeImportModal'
import { EmployeeTableSection } from './components/EmployeeTableSection'
import { INITIAL_VISIBLE_COLUMNS_MAP, type Tab, type ImportResult } from './types/employee.types'

const EmployeesPage: React.FC = () => {
  const { t } = useTranslation(['employees', 'common', 'nav'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setPageActiveTab] = usePageTab<Tab>({
    storageKey: 'employees_active_tab',
    defaultTab: 'employees',
    validTabs: ['employees', 'departments', 'positions', 'attendance', 'payrolls', 'leaves', 'holidays'],
    transform: (raw) => (raw === 'org' ? 'departments' : (raw as Tab)),
  })
  const setActiveTab = (tab: Tab) => {
    setPageActiveTab(tab)
    setSelectedRows([])
    if (tab !== 'attendance') {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.delete('subtab')
        return next
      }, { replace: true })
    }
  }

  // Server side pagination
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: `employees_${activeTab}` })

  // Sorting
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Additional Filter States
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filterBranchId, setFilterBranchId] = useState('')
  const [filterDeptId, setFilterDeptId] = useState('')
  const [filterPosId, setFilterPosId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterDateStart, setFilterDateStart] = useState('')
  const [filterDateEnd, setFilterDateEnd] = useState('')
  const [filterSalaryMin, setFilterSalaryMin] = useState('')
  const [filterSalaryMax, setFilterSalaryMax] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')

  // Column Visibility Map across all sub-tabs
  const [visibleColumnsMap, setVisibleColumnsMap] = useState<Record<Tab, Record<string, boolean>>>(INITIAL_VISIBLE_COLUMNS_MAP)
  const visibleColumns = visibleColumnsMap[activeTab] || {}

  const currentColumns = useMemo(() => {
    const defaultCols = INITIAL_VISIBLE_COLUMNS_MAP[activeTab] || {}
    return Object.keys(defaultCols).map((col) => ({
      key: col,
      label: t(`employees.${col}`, col.replace(/_/g, ' ')),
    }))
  }, [activeTab, t])

  // UI Modals / Drawers states
  const [modalOpen, setModalOpen] = useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Enterprise Modals: Payroll Generator & Payslip & ABA Bulk
  const [autoPayrollModalOpen, setAutoPayrollModalOpen] = useState(false)
  const [selectedPayslipId, setSelectedPayslipId] = useState<number | null>(null)
  const [abaBulkExportOpen, setAbaBulkExportOpen] = useState(false)
  const [abaBulkMonth, setAbaBulkMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  )

  // CSV Import Modal & QR Kiosk
  const [importOpen, setImportOpen] = useState(false)
  const [kioskModalOpen, setKioskModalOpen] = useState(false)
  const [selectedAttendanceDetail, setSelectedAttendanceDetail] = useState<any | null>(null)
  const [attendanceSubTab, setAttendanceSubTab] = usePageTab<AttendanceSubView>({
    paramKey: 'subtab',
    storageKey: 'employees_attendance_subtab',
    defaultTab: 'logs',
    validTabs: ['logs', 'roster', 'shifts', 'summary'],
  })
  const openShiftModalRef = useRef<(() => void) | null>(null)
  const copyLastWeekRef = useRef<(() => void) | null>(null)
  const printRosterRef = useRef<(() => void) | null>(null)
  const exportMonthlySummaryRef = useRef<(() => void) | null>(null)
  const [attendanceMonth, setAttendanceMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  )
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // Attendance & Leaves & Holidays Header Actions State
  const [attendanceQuickModalOpen, setAttendanceQuickModalOpen] = useState(false)
  const [leaveCreateModalOpen, setLeaveCreateModalOpen] = useState(false)
  const [holidayCreateModalOpen, setHolidayCreateModalOpen] = useState(false)
  const [exportingAttendance, setExportingAttendance] = useState(false)

  const handleExportAttendanceCsv = async (range: string = 'all') => {
    sound.playClick()
    try {
      setExportingAttendance(true)
      await employeeService.exportAttendanceCsv({ range })
      toast.success(t('employees.export_success', 'Attendance CSV exported successfully'))
    } catch {
      toast.error(t('employees.export_error', 'Failed to export attendance CSV'))
    } finally {
      setExportingAttendance(false)
    }
  }

  // Bulk actions & Delete confirmations
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // Form Fields
  const [formCompanyId, setFormCompanyId] = useState('1')
  const [formBranchId, setFormBranchId] = useState('1')
  const [formDeptId, setFormDeptId] = useState('')
  const [formPosId, setFormPosId] = useState('')
  const [formUserId, setFormUserId] = useState('')
  const [formEmployeeNumber, setFormEmployeeNumber] = useState('')
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formNik, setFormNik] = useState('')
  const [formGender, setFormGender] = useState('male')
  const [formBirthDate, setFormBirthDate] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formPhoto, setFormPhoto] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formJoinDate, setFormJoinDate] = useState('')
  const [formResignDate, setFormResignDate] = useState('')
  const [formStatus, setFormStatus] = useState('active')
  const [formBasicSalary, setFormBasicSalary] = useState('')

  // Form Fields for Attendance
  const [attEmployeeId, setAttEmployeeId] = useState('')
  const [attDate, setAttDate] = useState('')
  const [attCheckIn, setAttCheckIn] = useState('')
  const [attCheckOut, setAttCheckOut] = useState('')
  const [attStatus, setAttStatus] = useState('present')
  const [attNotes, setAttNotes] = useState('')

  // Form Fields for Payroll
  const [payEmployeeId, setPayEmployeeId] = useState('')
  const [payPeriodMonth, setPayPeriodMonth] = useState('')
  const [payWorkingDays, setPayWorkingDays] = useState('22')
  const [payPresentDays, setPayPresentDays] = useState('22')
  const [payAllowances, setPayAllowances] = useState('0')
  const [payDeductions, setPayDeductions] = useState('0')
  const [payOvertimePay, setPayOvertimePay] = useState('0')
  const [payStatus, setPayStatus] = useState('draft')
  const [payPaidAt, setPayPaidAt] = useState('')
  const [payNotes, setPayNotes] = useState('')

  // Queries for Dropdowns
  const { data: companiesList = [] } = useQuery({
    queryKey: ['companies-list'],
    queryFn: () => companyService.getCompanies({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: branchesList = [] } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.getBranches({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: deptList = [] } = useQuery({
    queryKey: ['departments-list'],
    queryFn: () => employeeService.departments({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: posList = [] } = useQuery({
    queryKey: ['positions-list'],
    queryFn: () => employeeService.positions({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: shiftsList = [] } = useQuery({
    queryKey: ['shifts-list'],
    queryFn: () => employeeService.shifts({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: usersList = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.list({ per_page: 150 }).then(r => r.data ?? []),
  })

  const { data: empList = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => employeeService.list({ per_page: 150 }).then(r => r.data ?? []),
  })

  // Global HR Stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['employee-stats'],
    queryFn: () => employeeService.stats(),
  })

  // Main Data Query based on activeTab
  const queryParams = useMemo(() => ({
    page,
    per_page: perPage,
    search: debouncedSearch,
    sort_by: sortBy,
    sort_order: sortOrder,
    branch_id: filterBranchId || undefined,
    department_id: filterDeptId || undefined,
    position_id: filterPosId || undefined,
    status: filterStatus || undefined,
    gender: filterGender || undefined,
    date_from: filterDateStart || undefined,
    date_to: filterDateEnd || undefined,
    salary_min: filterSalaryMin || undefined,
    salary_max: filterSalaryMax || undefined,
    role: filterRole || undefined,
    month: activeTab === 'attendance' ? attendanceMonth : undefined,
  }), [
    page, perPage, debouncedSearch, sortBy, sortOrder,
    filterBranchId, filterDeptId, filterPosId, filterStatus,
    filterGender, filterDateStart, filterDateEnd, filterSalaryMin,
    filterSalaryMax, filterRole, activeTab, attendanceMonth
  ])

  const { data: currentData, isLoading, isFetching, refetch } = useQuery({
    queryKey: [activeTab, queryParams],
    queryFn: () => {
      switch (activeTab) {
        case 'departments':
          return employeeService.departments(queryParams)
        case 'positions':
          return employeeService.positions(queryParams)
        case 'attendance':
          return employeeService.attendance(queryParams)
        case 'payrolls':
          return employeeService.payrolls(queryParams)
        case 'leaves':
          return Promise.resolve({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } })
        case 'employees':
        default:
          return employeeService.list(queryParams)
      }
    },
    enabled: activeTab !== 'leaves',
  })

  const records = currentData?.data ?? []
  const pagination = currentData?.meta ?? {
    current_page: page,
    last_page: 1,
    per_page: perPage,
    total: records.length,
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => {
      switch (activeTab) {
        case 'departments':
        case 'positions':
        case 'payrolls':
          return employeeService.createItemByTab(activeTab, data)
        case 'attendance':
          return employeeService.createAttendance(data)
        case 'employees':
        default:
          return employeeService.create(data)
      }
    },
    onSuccess: () => {
      toast.success(t('employees.createSuccess', 'Record created successfully.'))
      qc.invalidateQueries({ queryKey: [activeTab] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.createFailed', 'Failed to create record.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      switch (activeTab) {
        case 'departments':
        case 'positions':
        case 'payrolls':
          return employeeService.updateItemByTab(activeTab, id, data)
        case 'attendance':
          return employeeService.updateAttendance(id, data)
        case 'employees':
        default:
          return employeeService.update(id, data)
      }
    },
    onSuccess: () => {
      toast.success(t('employees.updateSuccess', 'Record updated successfully.'))
      qc.invalidateQueries({ queryKey: [activeTab] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.updateFailed', 'Failed to update record.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number; force?: boolean }) => {
      switch (activeTab) {
        case 'departments':
        case 'positions':
        case 'payrolls':
          return employeeService.deleteItemByTab(activeTab, id)
        case 'attendance':
          return employeeService.deleteAttendance(id)
        case 'employees':
        default:
          return employeeService.delete(id)
      }
    },
    onSuccess: () => {
      toast.success(t('employees.deleteSuccess', 'Record deleted successfully.'))
      qc.invalidateQueries({ queryKey: [activeTab] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      setDeleteTarget(null)
      adjustAfterDelete(1)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.deleteFailed', 'Failed to delete record.'))
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => employeeService.bulkDelete(activeTab, ids),
    onSuccess: () => {
      toast.success(t('employees.bulkDeleteSuccess', 'Selected records deleted successfully.'))
      qc.invalidateQueries({ queryKey: [activeTab] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
      adjustAfterDelete(selectedRows.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('common.bulkDeleteFailed', 'Failed to delete selected records.'))
    },
  })

  // Bulk / Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(records.map((r: any) => r.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id])
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Photo Upload Handler for Modal
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const uploadData = new FormData()
    uploadData.append('photo', file)
    setUploadingPhoto(true)
    try {
      const res = await employeeService.uploadPhoto(uploadData)
      const photoPath = res.data?.path || res.data?.url || res.path || res.url
      setFormPhoto(photoPath)
      toast.success(t('employees.photoUploaded', 'Photo uploaded successfully.'))
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('employees.photoUploadFailed', 'Failed to upload photo.'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Export CSV Handler
  const handleExport = async () => {
    const toastId = toast.info(t('employees.export_generating', 'Preparing CSV export...'))
    try {
      const res = await (async () => {
        switch (activeTab) {
          case 'departments':
            return employeeService.departments({ per_page: 500 })
          case 'positions':
            return employeeService.positions({ per_page: 500 })
          case 'attendance':
            return employeeService.attendance({ per_page: 500 })
          case 'payrolls':
            return employeeService.payrolls({ per_page: 500 })
          case 'employees':
          default:
            return employeeService.list({ per_page: 500 })
        }
      })()

      const exportRecords = res?.data ?? []
      let headers: string[] = []
      let rows: (string | number | boolean | null | undefined)[][] = []

      if (activeTab === 'departments') {
        headers = [
          t('employees.code', 'Code'),
          t('employees.name', 'Name'),
          t('employees.branch', 'Branch'),
          t('employees.description', 'Description'),
          t('employees.status', 'Status'),
        ]
        rows = exportRecords.map((dept: any) => [
          dept.code || `DEPT-${dept.id}`,
          dept.name || '',
          dept.branch?.name || '',
          dept.description || '',
          dept.is_active ? t('employees.active', 'Active') : t('employees.inactive', 'Inactive'),
        ])
      } else if (activeTab === 'positions') {
        headers = [
          t('employees.code', 'Code'),
          t('employees.name', 'Name'),
          t('employees.department', 'Department'),
          t('employees.description', 'Description'),
          t('employees.status', 'Status'),
        ]
        rows = exportRecords.map((pos: any) => [
          pos.code || `POS-${pos.id}`,
          pos.name || '',
          pos.department?.name || '',
          pos.description || '',
          pos.is_active ? t('employees.active', 'Active') : t('employees.inactive', 'Inactive'),
        ])
      } else if (activeTab === 'attendance') {
        headers = [
          t('employees.employee', 'Employee'),
          t('employees.date', 'Date'),
          t('employees.check_in', 'Check In'),
          t('employees.check_out', 'Check Out'),
          t('employees.status', 'Status'),
          t('employees.notes', 'Notes'),
        ]
        rows = exportRecords.map((att: any) => [
          att.employee?.name || `Employee #${att.employee_id}`,
          att.date ? att.date.split('T')[0] : '',
          att.check_in || '',
          att.check_out || '',
          att.status,
          att.notes || '',
        ])
      } else if (activeTab === 'payrolls') {
        headers = [
          t('employees.employee', 'Employee'),
          t('employees.period', 'Period'),
          t('employees.basic_salary', 'Basic Salary'),
          t('employees.allowances', 'Allowances'),
          t('employees.sales_commission', 'Commission'),
          t('employees.nssf_deduction', 'NSSF'),
          t('employees.tax_deduction', 'Tax'),
          t('employees.net_salary', 'Net Salary'),
          t('employees.status', 'Status'),
        ]
        rows = exportRecords.map((pay: any) => [
          pay.employee?.name || `Employee #${pay.employee_id}`,
          pay.period_month || '',
          Number(pay.basic_salary || 0).toFixed(2),
          Number(pay.allowances || 0).toFixed(2),
          Number(pay.sales_commission || 0).toFixed(2),
          Number(pay.nssf_deduction || 0).toFixed(2),
          Number(pay.tax_deduction || 0).toFixed(2),
          Number(pay.net_salary || 0).toFixed(2),
          pay.status,
        ])
      } else {
        headers = [
          t('employees.employee_number', 'Employee Number'),
          t('employees.name', 'Name'),
          t('employees.email', 'Email'),
          t('employees.phone', 'Phone'),
          t('employees.department', 'Department'),
          t('employees.position', 'Position'),
          t('employees.basic_salary', 'Basic Salary'),
          t('employees.status', 'Status'),
        ]
        rows = exportRecords.map((emp: any) => [
          emp.employee_number || `EMP-${emp.id}`,
          emp.name || '',
          emp.email || '',
          emp.phone || '',
          emp.department?.name || '',
          emp.position?.name || '',
          emp.basic_salary ? Number(emp.basic_salary).toFixed(2) : '0.00',
          emp.status,
        ])
      }

      downloadCsv(`${activeTab}`, headers, rows)
      toast.dismiss(toastId)
      toast.success(t('employees.export_success', 'Export downloaded successfully.'))
    } catch {
      toast.dismiss(toastId)
      toast.error(t('employees.export_error', 'Export failed. Please try again.'))
    }
  }

  // Export ABA Bulk CSV Handler
  const handleExportAbaBulk = () => {
    const currentMonth = new Date().toISOString().substring(0, 7)
    setAbaBulkMonth(currentMonth)
    setAbaBulkExportOpen(true)
  }

  // Import Upload
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    setImportResult(null)

    const formData = new FormData()
    formData.append('file', importFile)

    employeeService.importData(activeTab, formData)
      .then(res => {
        setImporting(false)
        const resData = (res.data?.data || res.data) as ImportResult
        setImportResult(resData)
        if (resData?.errors?.length === 0) {
          toast.success(t('employees.import_success_count', 'Successfully imported {{count}} records.', { count: resData.success_count }))
          qc.invalidateQueries({ queryKey: [activeTab] })
          refetchStats()
          closeImportModal()
        } else {
          toast.warning(t('employees.import_completed_with_errors', 'Import completed with errors. {{count}} records imported.', { count: resData?.success_count || 0 }))
        }
      })
      .catch(err => {
        setImporting(false)
        toast.error(err?.response?.data?.message || t('employees.import_failed', 'Failed to import CSV.'))
      })
  }

  // Modal open helpers
  const openCreateModal = () => {
    if (activeTab === 'employees') {
      navigate('/employees/create')
      return
    }
    setSelectedItem(null)
    setFormCompanyId('1')
    setFormBranchId('1')
    setFormDeptId('')
    setFormPosId('')
    setFormUserId('')
    if (activeTab === 'departments') {
      setFormEmployeeNumber(`DEPT-${Math.floor(1000 + Math.random() * 9000)}`)
    } else if (activeTab === 'positions') {
      setFormEmployeeNumber(`POS-${Math.floor(1000 + Math.random() * 9000)}`)
    } else {
      setFormEmployeeNumber(`EMP${Math.floor(100000 + Math.random() * 900000)}`)
    }
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormNik('')
    setFormGender('male')
    setFormBirthDate('')
    setFormAddress('')
    setFormPhoto('')
    setFormJoinDate(new Date().toISOString().split('T')[0])
    setFormResignDate('')
    setFormStatus('active')
    setFormBasicSalary('')
    setAttEmployeeId('')
    setAttDate(new Date().toISOString().split('T')[0])
    setAttCheckIn('08:00')
    setAttCheckOut('17:00')
    setAttStatus('present')
    setAttNotes('')
    setPayEmployeeId('')
    setPayPeriodMonth(new Date().toISOString().substring(0, 7))
    setPayWorkingDays('22')
    setPayPresentDays('22')
    setPayAllowances('0')
    setPayDeductions('0')
    setPayOvertimePay('0')
    setPayStatus('draft')
    setPayPaidAt('')
    setPayNotes('')
    setModalOpen(true)
  }

  const openEditModal = (item: any) => {
    if (activeTab === 'employees') {
      navigate(`/employees/${item.id}/edit`)
      return
    }
    setSelectedItem(item)
    if (activeTab === 'departments') {
      setFormName(item.name)
      setFormEmployeeNumber(item.code ?? '')
      setFormCompanyId(item.company_id?.toString() ?? '1')
      setFormBranchId(item.branch_id?.toString() ?? '1')
      setFormAddress(item.description ?? '')
      setFormStatus(item.is_active ? 'active' : 'inactive')
    } else if (activeTab === 'positions') {
      setFormName(item.name)
      setFormEmployeeNumber(item.code ?? '')
      setFormCompanyId(item.company_id?.toString() ?? '1')
      setFormDeptId(item.department_id?.toString() ?? '')
      setFormAddress(item.description ?? '')
      setFormStatus(item.is_active ? 'active' : 'inactive')
    } else if (activeTab === 'attendance') {
      setAttEmployeeId(item.employee_id?.toString() ?? '')
      setAttDate(item.date ? item.date.split('T')[0] : '')
      setAttCheckIn(item.check_in ?? '')
      setAttCheckOut(item.check_out ?? '')
      setAttStatus(item.status)
      setAttNotes(item.notes ?? '')
    } else if (activeTab === 'payrolls') {
      setPayEmployeeId(item.employee_id?.toString() ?? '')
      setPayPeriodMonth(item.period_month)
      setPayWorkingDays(item.working_days?.toString() ?? '22')
      setPayPresentDays(item.present_days?.toString() ?? '22')
      setFormBasicSalary(item.basic_salary?.toString() ?? '0')
      setPayAllowances(item.allowances?.toString() ?? '0')
      setPayDeductions(item.deductions?.toString() ?? '0')
      setPayOvertimePay(item.overtime_pay?.toString() ?? '0')
      setPayStatus(item.status)
      setPayPaidAt(item.paid_at ? item.paid_at.split('T')[0] : '')
      setPayNotes(item.notes ?? '')
    }
    setModalOpen(true)
  }

  const openViewDrawer = (item: any) => {
    setSelectedItem(item)
    setDetailDrawerOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedItem(null)
  }

  const closeImportModal = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportResult(null)
  }

  const handleResetFilters = () => {
    setFilterBranchId('')
    setFilterDeptId('')
    setFilterPosId('')
    setFilterStatus('')
    setFilterGender('')
    setFilterDateStart('')
    setFilterDateEnd('')
    setFilterSalaryMin('')
    setFilterSalaryMax('')
    setFilterRole('')
    setSelectedSegment('')
    reset()
  }

  const handleSelectSegment = (segmentKey: string) => {
    if (segmentKey === 'leaves') {
      setActiveTab('leaves')
      setSelectedSegment('')
      return
    }
    if (activeTab !== 'employees') {
      setActiveTab('employees')
    }
    setSelectedSegment(prev => (prev === segmentKey ? '' : segmentKey))
    setPage(1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let payload: any = {}
    if (activeTab === 'departments') {
      payload = {
        company_id: Number(formCompanyId),
        branch_id: Number(formBranchId),
        name: formName,
        code: formEmployeeNumber || null,
        description: formAddress || null,
        is_active: formStatus === 'active'
      }
    } else if (activeTab === 'positions') {
      payload = {
        company_id: Number(formCompanyId),
        department_id: Number(formDeptId),
        name: formName,
        code: formEmployeeNumber || null,
        description: formAddress || null,
        is_active: formStatus === 'active'
      }
    } else if (activeTab === 'employees') {
      payload = {
        company_id: Number(formCompanyId),
        branch_id: Number(formBranchId),
        department_id: formDeptId ? Number(formDeptId) : null,
        position_id: formPosId ? Number(formPosId) : null,
        user_id: formUserId ? Number(formUserId) : null,
        employee_number: formEmployeeNumber,
        name: formName,
        email: formEmail || null,
        phone: formPhone || null,
        nik: formNik || null,
        gender: formGender,
        birth_date: formBirthDate || null,
        address: formAddress || null,
        photo: formPhoto || null,
        join_date: formJoinDate || null,
        resign_date: formResignDate || null,
        status: formStatus,
        basic_salary: formBasicSalary ? Number(formBasicSalary) : 0
      }
    } else if (activeTab === 'attendance') {
      payload = {
        employee_id: Number(attEmployeeId),
        date: attDate,
        check_in: attCheckIn || null,
        check_out: attCheckOut || null,
        status: attStatus,
        notes: attNotes || null
      }
    } else if (activeTab === 'payrolls') {
      const basic = formBasicSalary ? Number(formBasicSalary) : 0
      const allow = payAllowances ? Number(payAllowances) : 0
      const ded = payDeductions ? Number(payDeductions) : 0
      const ot = payOvertimePay ? Number(payOvertimePay) : 0
      const net = basic + allow + ot - ded
      payload = {
        employee_id: Number(payEmployeeId),
        period_month: payPeriodMonth,
        working_days: Number(payWorkingDays),
        present_days: Number(payPresentDays),
        basic_salary: basic,
        allowances: allow,
        deductions: ded,
        overtime_pay: ot,
        net_salary: net,
        status: payStatus,
        paid_at: payPaidAt || null,
        notes: payNotes || null
      }
    }

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const confirmDelete = (itemOrId: any) => {
    if (typeof itemOrId === 'object' && itemOrId !== null) {
      setDeleteTarget(itemOrId)
    } else {
      const found = records.find((r: any) => r.id === itemOrId)
      setDeleteTarget(found || { id: itemOrId })
    }
  }

  const handleDelete = () => {
    if (deleteTarget?.id) {
      deleteMutation.mutate({ id: deleteTarget.id, force: false })
    }
  }

  const getSingleDeleteTitle = () => {
    if (activeTab === 'employees') return t('employees.deleteEmployeeTitle', 'Delete Employee')
    if (activeTab === 'departments') return t('employees.deleteDepartmentTitle', 'Delete Department')
    if (activeTab === 'positions') return t('employees.deletePositionTitle', 'Delete Position')
    if (activeTab === 'attendance') return t('employees.deleteAttendanceTitle', 'Delete Attendance Record')
    if (activeTab === 'payrolls') return t('employees.deletePayrollTitle', 'Delete Payroll Record')
    return t('employees.deleteTitle', 'Delete Record')
  }

  const getDeleteTargetName = () => {
    if (!deleteTarget) return ''
    if (deleteTarget.name) return deleteTarget.name
    if (activeTab === 'attendance') {
      return deleteTarget.employee?.name ? `${deleteTarget.employee.name} (${deleteTarget.attendance_date || (deleteTarget.date ? deleteTarget.date.split('T')[0] : '')})` : (deleteTarget.attendance_date || deleteTarget.date || '')
    }
    if (activeTab === 'payrolls') {
      return deleteTarget.employee?.name ? `${deleteTarget.employee.name} (${deleteTarget.period_month || ''})` : (deleteTarget.period_month || '')
    }
    return deleteTarget.code || deleteTarget.employee_number || (deleteTarget.id ? `#${deleteTarget.id}` : '')
  }

  const getBulkDeleteTitle = () => {
    if (activeTab === 'employees') return t('employees.bulkDeleteEmployeesTitle', 'Delete Selected Employees')
    if (activeTab === 'departments') return t('employees.bulkDeleteDepartmentsTitle', 'Delete Selected Departments')
    if (activeTab === 'positions') return t('employees.bulkDeletePositionsTitle', 'Delete Selected Positions')
    if (activeTab === 'attendance') return t('employees.bulkDeleteAttendanceTitle', 'Delete Selected Attendance Logs')
    if (activeTab === 'payrolls') return t('employees.bulkDeletePayrollsTitle', 'Delete Selected Payrolls')
    return t('employees.bulkDeleteTitle', 'Delete Selected Records')
  }

  const getBulkDeleteMessage = () => {
    let msgKey = 'employees.confirmBulkDeleteMessage'
    let defaultMsg = `Are you sure you want to delete ${selectedRows.length} selected records? This action will move them to the trash.`
    if (activeTab === 'employees') {
      msgKey = 'employees.confirmBulkDeleteEmployeesMessage'
      defaultMsg = `Are you sure you want to delete ${selectedRows.length} selected employees? This action will move them to the trash.`
    } else if (activeTab === 'departments') {
      msgKey = 'employees.confirmBulkDeleteDepartmentsMessage'
      defaultMsg = `Are you sure you want to delete ${selectedRows.length} selected departments? This action cannot be undone.`
    } else if (activeTab === 'positions') {
      msgKey = 'employees.confirmBulkDeletePositionsMessage'
      defaultMsg = `Are you sure you want to delete ${selectedRows.length} selected positions? This action cannot be undone.`
    } else if (activeTab === 'attendance') {
      msgKey = 'employees.confirmBulkDeleteAttendanceMessage'
      defaultMsg = `Are you sure you want to delete ${selectedRows.length} selected attendance logs? This action cannot be undone.`
    } else if (activeTab === 'payrolls') {
      msgKey = 'employees.confirmBulkDeletePayrollsMessage'
      defaultMsg = `Are you sure you want to delete ${selectedRows.length} selected payroll records? This action cannot be undone.`
    }
    return t(msgKey, {
      count: selectedRows.length,
      defaultValue: defaultMsg
    }).replace('{{count}}', String(selectedRows.length))
  }

  const getPhotoUrl = (photoPath?: string) => {
    if (!photoPath) return null
    return getAbsoluteImageUrl(photoPath) || null
  }

  const activeFiltersCount = [
    filterBranchId,
    filterDeptId,
    filterPosId,
    filterStatus,
    filterGender,
    filterDateStart,
    filterDateEnd,
    filterSalaryMin,
    filterSalaryMax,
    filterRole,
  ].filter(Boolean).length

  const pageTitle = useMemo(() => {
    switch (activeTab) {
      case 'holidays':
        return t('nav.holidays', 'Public Holidays')
      case 'attendance':
        return t('nav.attendanceManagement', 'Attendance & Shifts')
      case 'leaves':
        return t('nav.leaveManagement', 'Leave Management')
      case 'payrolls':
        return t('nav.payrollManagement', 'Payroll')
      case 'departments':
      case 'positions':
        return t('nav.orgStructure', 'Organization Structure')
      case 'employees':
      default:
        return t('nav.employeeDirectory', 'Employee Directory')
    }
  }, [activeTab, t])

  const pageSubtitle = useMemo(() => {
    switch (activeTab) {
      case 'holidays':
        return t('employees.holidays_subtitle', 'Manage company holiday calendar, national holidays, and annual observed non-working days')
      case 'attendance':
        return t('employees.attendanceSubtitle', 'Track check-in/out logs, overtime hours, and daily shift rosters in real time')
      case 'leaves':
        return t('employees.leavesSubtitle', 'Manage leave requests, review 1-click approvals, and track annual leave entitlements')
      case 'payrolls':
        return t('employees.payrollsSubtitle', 'Automated payroll calculation with attendance, NSSF, salary tax, and ABA bulk export')
      case 'departments':
      case 'positions':
        return t('employees.orgSubtitle', 'Manage company departments and job positions to maintain organizational hierarchy')
      case 'employees':
      default:
        return t('employees.directorySubtitle', 'Manage employee profiles, employment status, contracts, and 360° personnel information')
    }
  }, [activeTab, t])

  const badgeText = useMemo(() => {
    switch (activeTab) {
      case 'holidays':
        return t('employees.total_holidays', 'Total Holidays')
      case 'attendance':
        return t('employees.todayAttendance', 'Today Attendance')
      case 'leaves':
        return `${statsData?.pending_leaves_count || 0} ${t('employees.pendingLeaves', 'Pending Requests')}`
      case 'payrolls':
        return t('employees.payrollMonthBadge', 'Monthly Calculation')
      case 'departments':
        return `${deptList?.length || 0} ${t('employees.departments', 'Departments')}`
      case 'positions':
        return `${posList?.length || 0} ${t('employees.positions', 'Positions')}`
      case 'employees':
      default:
        return `${empList?.length || 0} ${t('employees.staffMembers', 'Staff')}`
    }
  }, [activeTab, statsData, deptList, posList, empList, t])

  const breadcrumbItems = useMemo(() => {
    const root = { label: t('nav.employeeManagement', 'Employee Management'), path: '/employees' }
    switch (activeTab) {
      case 'holidays':
        return [root, { label: t('nav.holidays', 'Public Holidays') }]
      case 'attendance':
        return [root, { label: t('nav.attendanceManagement', 'Attendance & Shifts') }]
      case 'leaves':
        return [root, { label: t('nav.leaveManagement', 'Leave Management') }]
      case 'payrolls':
        return [root, { label: t('nav.payrollManagement', 'Payroll') }]
      case 'departments':
      case 'positions':
        return [
          root,
          { label: t('nav.orgStructure', 'Organization Structure'), path: '/employees?tab=departments' },
          { label: activeTab === 'positions' ? t('employees.positions', 'Positions') : t('employees.departments', 'Departments') },
        ]
      case 'employees':
      default:
        return [root, { label: t('nav.employeeDirectory', 'Employee Directory') }]
    }
  }, [activeTab, t])

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb items={breadcrumbItems} />

      {/* Frameless Dynamic Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {pageTitle}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {badgeText}
            </span>

            {/* In Organization Structure, provide the sleek switcher between Departments & Positions */}
            {(activeTab === 'departments' || activeTab === 'positions') && (
              <div className="inline-flex items-center p-1 bg-muted/80 rounded-xl border border-border/80 shadow-2xs ml-0 sm:ml-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('departments')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'departments'
                      ? 'bg-card text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('employees.departments', 'Departments')} ({deptList?.length ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('positions')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'positions'
                      ? 'bg-card text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('employees.positions', 'Positions')} ({posList?.length ?? 0})
                </button>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {pageSubtitle}
          </p>
        </div>

        <HeaderActionsGroup>
          {activeTab === 'payrolls' && (
            <>
              <AddButton
                onClick={() => setAutoPayrollModalOpen(true)}
                icon={<Calculator size={15} />}
                label={t('employees.auto_generate_payroll', 'Auto-Generate')}
              />

              <ActionButton
                onClick={handleExportAbaBulk}
                icon={<Landmark size={15} className="text-emerald-600 dark:text-emerald-400" />}
                label={t('employees.export_aba_bulk', 'ABA Bulk CSV')}
                title="Export ABA Bank Corporate CSV"
              />
            </>
          )}

          {activeTab === 'employees' && (
            <>
              <ImportButton
                onClick={() => setImportOpen(true)}
                label={t('employees.import_csv', 'Import CSV')}
              />
              <ExportButton
                onClick={handleExport}
                label={t('employees.export_csv', 'Export CSV')}
              />
            </>
          )}

          {activeTab === 'attendance' && (
            <>
              {attendanceSubTab === 'logs' && (
                <>
                  <QrKioskButton
                    onClick={() => setKioskModalOpen(true)}
                    label={t('employees.qr_attendance', 'QR Attendance')}
                  />
                  <ExportButton
                    onExportRange={handleExportAttendanceCsv}
                    loading={exportingAttendance}
                    label={t('common.exportCsv', 'Export CSV')}
                  />
                  <AddButton
                    onClick={() => setAttendanceQuickModalOpen(true)}
                    label={t('employees.add_attendance', 'Record Attendance')}
                  />
                </>
              )}

              {attendanceSubTab === 'shifts' && (
                <AddButton
                  onClick={() => {
                    sound.playClick()
                    openShiftModalRef.current?.()
                  }}
                  label={t('employees.add_shift_schedule', 'Add Shift')}
                />
              )}

              {attendanceSubTab === 'roster' && (
                <>
                  <ActionButton
                    onClick={() => {
                      sound.playClick()
                      copyLastWeekRef.current?.()
                    }}
                    icon={<Copy size={15} className="text-primary" />}
                    label={t('employees.copy_last_week', 'Copy Last Week')}
                  />

                  <ActionButton
                    onClick={() => {
                      sound.playClick()
                      printRosterRef.current?.()
                    }}
                    icon={<Printer size={15} className="text-muted-foreground dark:text-slate-400" />}
                    label={t('common.print', 'Print')}
                  />
                </>
              )}

              {attendanceSubTab === 'summary' && (
                <>
                  <ExportButton
                    onClick={() => {
                      sound.playClick()
                      exportMonthlySummaryRef.current?.()
                    }}
                    label={t('common.exportCsv', 'Export CSV')}
                  />
                  <AddButton
                    onClick={() => {
                      sound.playClick()
                      setAbaBulkMonth(attendanceMonth)
                      setAutoPayrollModalOpen(true)
                    }}
                    icon={<Calculator size={15} />}
                    label={t('employees.calculate_payroll_shortcut', 'Calculate Payroll')}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'leaves' && (
            <>
              <ExportButton
                onClick={handleExport}
                label={t('common.exportCsv', 'Export CSV')}
              />
              <AddButton
                onClick={() => setLeaveCreateModalOpen(true)}
                label={t('employees.add_leave', 'Request Leave')}
              />
            </>
          )}

          {activeTab === 'holidays' && (
            <AddButton
              onClick={() => setHolidayCreateModalOpen(true)}
              label={t('employees.add_holiday', 'Add Holiday')}
            />
          )}

          {activeTab !== 'leaves' && activeTab !== 'attendance' && activeTab !== 'holidays' && (
            <AddButton
              onClick={() => openCreateModal()}
              label={
                activeTab === 'payrolls'
                  ? t('employees.add_payroll_title', 'Add Payroll Slip')
                  : activeTab === 'departments'
                  ? t('employees.add_department', 'Add Department')
                  : activeTab === 'positions'
                  ? t('employees.add_position', 'Add Position')
                  : t('employees.add_employee', 'Add Employee')
              }
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Summary KPI Cards - On Main Employees Directory Tab */}
      {activeTab === 'employees' && (
        <EmployeeStatsCards
          statsData={statsData}
          empListLength={empList?.length ?? 0}
          activeCount={empList?.filter((e: any) => e.status === 'active').length ?? 0}
          resignedCount={empList?.filter((e: any) => e.status === 'resigned').length ?? 0}
          deptCount={deptList?.length ?? 0}
          posCount={posList?.length ?? 0}
          branchCount={branchesList?.length ?? 0}
          totalSalarySum={empList?.reduce((acc: number, e: any) => acc + (Number(e.basic_salary) || 0), 0) ?? 0}
          currentStatusFilter={filterStatus}
          onFilterStatus={(status) => {
            setFilterStatus(prev => prev === status ? '' : status)
            setPage(1)
          }}
          onSelectAttendanceStatus={(status) => {
            setActiveTab('attendance')
            setAttendanceSubTab('logs')
            setFilterStatus(status)
          }}
          onNavigateToLeaves={() => setActiveTab('leaves')}
          onNavigateToAttendance={() => {
            setActiveTab('attendance')
            setAttendanceSubTab('logs')
          }}
        />
      )}

      {/* RENDER ACTIVE TAB CONTENT */}
      {activeTab === 'holidays' ? (
        <HolidaysTab
          createModalOpen={holidayCreateModalOpen}
          setCreateModalOpen={setHolidayCreateModalOpen}
        />
      ) : activeTab === 'leaves' ? (
        <LeaveRequestsTab
          createModalOpen={leaveCreateModalOpen}
          setCreateModalOpen={setLeaveCreateModalOpen}
          onExport={handleExport}
        />
      ) : activeTab === 'attendance' ? (
        <AttendanceManagementSection
          periodMonth={attendanceMonth}
          onMonthChange={setAttendanceMonth}
          employeesList={empList}
          shiftsList={shiftsList}
          branchesList={branchesList}
          companiesList={companiesList}
          getPhotoUrl={getPhotoUrl}
          quickModalOpen={attendanceQuickModalOpen}
          setQuickModalOpen={setAttendanceQuickModalOpen}
          subView={attendanceSubTab}
          onSubViewChange={setAttendanceSubTab}
          openShiftModalRef={openShiftModalRef}
          copyLastWeekRef={copyLastWeekRef}
          printRosterRef={printRosterRef}
          exportMonthlyRef={exportMonthlySummaryRef}
          onOpenPayrollModal={(month) => {
            setAbaBulkMonth(month)
            setAutoPayrollModalOpen(true)
          }}
        />
      ) : (
        <>
          {/* ─── Bulk actions banner ─── */}
          <BulkSelectionBanner
            selectedCount={selectedRows.length}
            onDelete={() => setBulkDeleteConfirmOpen(true)}
            onClear={() => setSelectedRows([])}
            deleteLabel={t('employees.deleteSelected', 'Delete Selected')}
            deleteLoading={bulkDeleteMutation.isPending}
          />

          {/* ─── Global Standard Table Toolbar ─── */}
          <TableToolbar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder={t('employees.search_placeholder', 'Search employee name, email, phone, role...')}
            onFilterClick={() => setFilterDrawerOpen(true)}
            isFilterActive={activeFiltersCount > 0}
            filterActiveCount={activeFiltersCount}
            onReset={handleResetFilters}
            hideResetButton={activeFiltersCount === 0 && !search}
            onRefresh={() => qc.invalidateQueries({ queryKey: [activeTab] })}
            refreshLoading={isFetching}
            columns={currentColumns}
            visibleColumns={visibleColumns}
            defaultVisibleColumns={INITIAL_VISIBLE_COLUMNS_MAP[activeTab]}
            onColumnChange={(updated) =>
              setVisibleColumnsMap((prev) => ({
                ...prev,
                [activeTab]: updated,
              }))
            }
            columnSettingsTitle={t('employees.columns_visibility', t('common.columnsVisibility', 'Column Visibility'))}
          />

          {/* Advanced Filter Drawer */}
          <EmployeeFilterDrawer
            isOpen={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            branchesList={branchesList}
            deptList={deptList}
            posList={posList}
            filterBranchId={filterBranchId}
            setFilterBranchId={setFilterBranchId}
            filterDeptId={filterDeptId}
            setFilterDeptId={setFilterDeptId}
            filterPosId={filterPosId}
            setFilterPosId={setFilterPosId}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterGender={filterGender}
            setFilterGender={setFilterGender}
            filterDateStart={filterDateStart}
            setFilterDateStart={setFilterDateStart}
            filterDateEnd={filterDateEnd}
            setFilterDateEnd={setFilterDateEnd}
            filterSalaryMin={filterSalaryMin}
            setFilterSalaryMin={setFilterSalaryMin}
            filterSalaryMax={filterSalaryMax}
            setFilterSalaryMax={setFilterSalaryMax}
            onReset={handleResetFilters}
          />

          {/* Table Section */}
          <EmployeeTableSection
            activeTab={activeTab}
            records={records}
            isLoading={isLoading}
            isFetching={isFetching}
            selectedRows={selectedRows}
            handleSelectAll={handleSelectAll}
            handleSelectRow={handleSelectRow}
            visibleColumns={visibleColumns}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
            getPhotoUrl={getPhotoUrl}
            openViewDrawer={openViewDrawer}
            setSelectedAttendanceDetail={setSelectedAttendanceDetail}
            openEditModal={openEditModal}
            confirmDelete={confirmDelete}
            onOpenPayslip={(id) => setSelectedPayslipId(id)}
          />

          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </>
      )}

      {/* Form Modal for Depts, Positions, Attendance, Payroll */}
      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        activeTab={activeTab}
        selectedItem={selectedItem}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        companiesList={companiesList}
        branchesList={branchesList}
        deptList={deptList}
        posList={posList}
        usersList={usersList}
        empList={empList}
        formCompanyId={formCompanyId}
        setFormCompanyId={setFormCompanyId}
        formBranchId={formBranchId}
        setFormBranchId={setFormBranchId}
        formDeptId={formDeptId}
        setFormDeptId={setFormDeptId}
        formPosId={formPosId}
        setFormPosId={setFormPosId}
        formUserId={formUserId}
        setFormUserId={setFormUserId}
        formEmployeeNumber={formEmployeeNumber}
        setFormEmployeeNumber={setFormEmployeeNumber}
        formName={formName}
        setFormName={setFormName}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formPhone={formPhone}
        setFormPhone={setFormPhone}
        formNik={formNik}
        setFormNik={setFormNik}
        formGender={formGender}
        setFormGender={setFormGender}
        formBirthDate={formBirthDate}
        setFormBirthDate={setFormBirthDate}
        formAddress={formAddress}
        setFormAddress={setFormAddress}
        formPhoto={formPhoto}
        setFormPhoto={setFormPhoto}
        uploadingPhoto={uploadingPhoto}
        handlePhotoFileChange={handlePhotoFileChange}
        getPhotoUrl={getPhotoUrl}
        formJoinDate={formJoinDate}
        setFormJoinDate={setFormJoinDate}
        formResignDate={formResignDate}
        setFormResignDate={setFormResignDate}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formBasicSalary={formBasicSalary}
        setFormBasicSalary={setFormBasicSalary}
        attEmployeeId={attEmployeeId}
        setAttEmployeeId={setAttEmployeeId}
        attDate={attDate}
        setAttDate={setAttDate}
        attCheckIn={attCheckIn}
        setAttCheckIn={setAttCheckIn}
        attCheckOut={attCheckOut}
        setAttCheckOut={setAttCheckOut}
        attStatus={attStatus}
        setAttStatus={setAttStatus}
        attNotes={attNotes}
        setAttNotes={setAttNotes}
        payEmployeeId={payEmployeeId}
        setPayEmployeeId={setPayEmployeeId}
        payPeriodMonth={payPeriodMonth}
        setPayPeriodMonth={setPayPeriodMonth}
        payWorkingDays={payWorkingDays}
        setPayWorkingDays={setPayWorkingDays}
        payPresentDays={payPresentDays}
        setPayPresentDays={setPayPresentDays}
        payAllowances={payAllowances}
        setPayAllowances={setPayAllowances}
        payDeductions={payDeductions}
        setPayDeductions={setPayDeductions}
        payOvertimePay={payOvertimePay}
        setPayOvertimePay={setPayOvertimePay}
        payStatus={payStatus}
        setPayStatus={setPayStatus}
        payPaidAt={payPaidAt}
        setPayPaidAt={setPayPaidAt}
        payNotes={payNotes}
        setPayNotes={setPayNotes}
      />

      {/* Auto-Generate Monthly Payroll Modal */}
      <AutoGeneratePayrollModal
        isOpen={autoPayrollModalOpen}
        onClose={() => setAutoPayrollModalOpen(false)}
        branchesList={branchesList}
        onOpenAbaExport={(month) => {
          setAbaBulkMonth(month)
          setAbaBulkExportOpen(true)
        }}
      />

      {/* ABA Bulk Transfer Export Modal */}
      <AbaBulkExportModal
        isOpen={abaBulkExportOpen}
        onClose={() => setAbaBulkExportOpen(false)}
        initialMonth={abaBulkMonth}
      />

      {/* Official Payslip Modal Preview */}
      <PayslipModal
        isOpen={!!selectedPayslipId}
        onClose={() => setSelectedPayslipId(null)}
        payrollId={selectedPayslipId}
      />

      {/* CSV Import Uploader Modal */}
      <EmployeeImportModal
        isOpen={importOpen}
        onClose={closeImportModal}
        activeTab={activeTab}
        importFile={importFile}
        setImportFile={setImportFile}
        importing={importing}
        importResult={importResult}
        onSubmit={handleImportSubmit}
      />

      {/* Employee Detail Drawer 360° Profile */}
      <EmployeeDetailDrawer
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        selectedItem={selectedItem}
        getPhotoUrl={getPhotoUrl}
        onOpenEdit={(item) => {
          setDetailDrawerOpen(false)
          openEditModal(item)
        }}
        onViewPayslip={(payslipId) => {
          setDetailDrawerOpen(false)
          setSelectedPayslipId(payslipId)
        }}
        onNavigateTab={(tab, filterParam) => {
          setDetailDrawerOpen(false)
          setActiveTab(tab)
          if (filterParam) {
            setSearch(filterParam)
          }
        }}
      />

      <DynamicQrKioskModal
        open={kioskModalOpen}
        onClose={() => setKioskModalOpen(false)}
        initialCompanies={companiesList}
        initialBranches={branchesList}
      />
      <AttendanceDetailModal attendance={selectedAttendanceDetail} onClose={() => setSelectedAttendanceDetail(null)} />

      {/* Single Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={getSingleDeleteTitle()}
        itemName={getDeleteTargetName()}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title={getBulkDeleteTitle()}
        message={getBulkDeleteMessage()}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  )
}

export default EmployeesPage
