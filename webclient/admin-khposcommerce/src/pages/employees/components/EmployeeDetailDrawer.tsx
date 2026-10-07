import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import {
  User,
  Edit,
  KeyRound,
  Check,
  X,
  Loader2,
  FileText,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  CalendarCheck,
  DollarSign,
  Briefcase,
  Building2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Receipt,
  Eye,
  CreditCard,
  Layers,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { EmployeeAvatar } from './EmployeeAvatar'
import {
  StatusBadge,
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  ActionButton,
  EmptyState,
} from '@/components/common'
import type { DetailDrawerTabItem } from '@/components/common/DetailDrawer'
import { formatCurrency, GlobalFormat } from '@/utils/formatters'

export interface EmployeeDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedItem: any | null
  getPhotoUrl?: (photoPath?: string) => string | null | undefined
  onOpenEdit?: (item: any) => void
  onViewPayslip?: (payslipId: number) => void
  onNavigateTab?: (tab: 'attendance' | 'leaves' | 'payrolls', filterParam?: string) => void
}

type DrawerSubTab = 'general' | 'attendance' | 'leaves' | 'payrolls'

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({
  isOpen,
  onClose,
  selectedItem,
  getPhotoUrl,
  onOpenEdit,
  onViewPayslip,
  onNavigateTab,
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  // Sub-tab navigation state
  const [activeSubTab, setActiveSubTab] = useState<DrawerSubTab>('general')

  // Quick Action States
  const [isResettingPin, setIsResettingPin] = useState(false)
  const [newPin, setNewPin] = useState('')

  // Mutations
  const pinMutation = useMutation({
    mutationFn: (pin: string) => employeeService.update(selectedItem.id, { pos_pin: pin }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      toast.success(t('employees.pin_updated_success', 'POS PIN updated successfully'))
      if (selectedItem) {
        selectedItem.pos_pin = newPin
        selectedItem.has_pos_pin = true
      }
      setIsResettingPin(false)
      setNewPin('')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('toast.error', 'Failed to update POS PIN'))
    },
  })

  const driverStatusMutation = useMutation({
    mutationFn: (status: string) => employeeService.update(selectedItem.id, { driver_status: status }),
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      if (selectedItem) {
        selectedItem.driver_status = status
      }
      toast.success(t('employees.driver_status_updated', `Driver duty status updated to ${status}`))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('toast.error', 'Failed to update driver status'))
    },
  })

  // ─── DATA QUERIES FOR 360° PROFILE ──────────────────────────────────────────

  // 1. Attendance History
  const { data: attendanceData, isLoading: isAttLoading } = useQuery({
    queryKey: ['employee-drawer-attendance', selectedItem?.id],
    queryFn: () =>
      employeeService.attendances({
        employee_id: selectedItem.id,
        per_page: 10,
        sort_by: 'date',
        sort_order: 'desc',
      }),
    enabled: isOpen && !!selectedItem?.id && activeSubTab === 'attendance',
    staleTime: 60 * 1000,
  })

  // 2. Leave Quota Balance
  const { data: leaveBalanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['employee-drawer-leave-balance', selectedItem?.id],
    queryFn: () => employeeService.getLeaveBalance(selectedItem.id).catch(() => null),
    enabled: isOpen && !!selectedItem?.id && activeSubTab === 'leaves',
    staleTime: 60 * 1000,
  })

  // 3. Leave Requests
  const { data: leaveRequestsData, isLoading: isLeavesLoading } = useQuery({
    queryKey: ['employee-drawer-leaves', selectedItem?.id],
    queryFn: () =>
      employeeService.leaveRequests({
        employee_id: selectedItem.id,
        per_page: 6,
      }),
    enabled: isOpen && !!selectedItem?.id && activeSubTab === 'leaves',
    staleTime: 60 * 1000,
  })

  // 4. Payroll History
  const { data: payrollsData, isLoading: isPayrollsLoading } = useQuery({
    queryKey: ['employee-drawer-payrolls', selectedItem?.id],
    queryFn: () =>
      employeeService.payrolls({
        employee_id: selectedItem.id,
        per_page: 10,
      }),
    enabled: isOpen && !!selectedItem?.id && activeSubTab === 'payrolls',
    staleTime: 60 * 1000,
  })

  if (!selectedItem) return null

  const drawerTabs: DetailDrawerTabItem[] = [
    {
      key: 'general',
      label: t('employees.generalInfo', 'General & Employment'),
    },
    {
      key: 'attendance',
      label: t('employees.attendance', 'Attendance Records'),
    },
    {
      key: 'leaves',
      label: t('employees.leaves', 'Leaves & Balance'),
    },
    {
      key: 'payrolls',
      label: t('employees.payrolls', 'Payroll & Salary'),
    },
  ]

  const attendancesList = attendanceData?.data ?? []
  const leaveRequestsList = leaveRequestsData?.data ?? []
  const payrollsList = payrollsData?.data ?? []

  // Computed attendance stats from fetched records
  const attPresentCount = attendancesList.filter((a: any) => a.status === 'present').length
  const attLateCount = attendancesList.filter((a: any) => a.status === 'late').length
  const attLeaveCount = attendancesList.filter((a: any) => a.status === 'leave').length
  const attAbsentCount = attendancesList.filter((a: any) => a.status === 'absent').length

  const handleNavigateToModule = (tab: 'attendance' | 'leaves' | 'payrolls') => {
    onClose()
    if (onNavigateTab) {
      onNavigateTab(tab, selectedItem.name)
    } else {
      navigate(`/employees?tab=${tab}&search=${encodeURIComponent(selectedItem.name || '')}`)
    }
  }

  return (
    <DetailDrawer
      isOpen={isOpen && !!selectedItem}
      onClose={onClose}
      size="2xl"
    >
      <DetailDrawerHeader
        title={t('employees.employeeProfileCard', 'Employee Profile 360°')}
        subtitle={selectedItem.employee_number || selectedItem.email}
        badge={
          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold border border-primary/20">
            {selectedItem.employee_number || `EMP-${String(selectedItem.id).padStart(4, '0')}`}
          </span>
        }
        onClose={onClose}
      />

      {/* Profile Overview Card */}
      <div className="px-6 py-4 bg-muted/30 border-b border-border/80">
        <div className="flex items-center gap-4">
          <EmployeeAvatar
            photo={selectedItem.photo}
            name={selectedItem.name}
            id={selectedItem.id}
            size="xl"
            getPhotoUrl={getPhotoUrl}
          />
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {selectedItem.name}
              </h2>
              <StatusBadge status={selectedItem.status} />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{selectedItem.position?.name || t('employees.no_position', 'No Position')}</span>
              <span>•</span>
              <span className="font-semibold text-foreground/80">{selectedItem.department?.name || t('employees.no_department', 'No Department')}</span>
              <span>•</span>
              <span>{selectedItem.branch?.name || t('employees.main_branch', 'Main Branch')}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {selectedItem.is_driver && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                  {t('employees.deliveryRiders', 'Delivery Rider')}
                </span>
              )}
              {selectedItem.is_pos_supervisor && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                  {t('employees.posSupervisors', 'POS Supervisor')}
                </span>
              )}
              {selectedItem.contract_type && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border uppercase">
                  {selectedItem.contract_type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 360° Profile Tab Navigation */}
      <DetailDrawerTabNav
        tabs={drawerTabs}
        activeTab={activeSubTab}
        onChange={(tabKey) => setActiveSubTab(tabKey as DrawerSubTab)}
      />

      <DetailDrawerBody>
        {/* ─── TAB 1: GENERAL & EMPLOYMENT (Soft Grouped Cards) ─── */}
        {activeSubTab === 'general' && (
          <div className="space-y-4">
            {/* Card 1: Personal & Contact */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('employees.personalContact', 'Personal Information & Contact')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.nik', 'National ID (NIK)')}</p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">{selectedItem.nik || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.gender', 'Gender / Birth Date')}</p>
                  <p className="font-semibold capitalize text-foreground mt-0.5">
                    {selectedItem.gender ? t(`employees.${selectedItem.gender}`, selectedItem.gender) : '-'} {selectedItem.birth_date ? `• ${new Date(selectedItem.birth_date).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.email', 'Email')}</p>
                  <p className="font-semibold text-primary mt-0.5">{selectedItem.email ? GlobalFormat.email(selectedItem.email) : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.phone', 'Phone')}</p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">{selectedItem.phone ? GlobalFormat.phone(selectedItem.phone) : '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.address', 'Current Address')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Employment Details */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('employees.employmentDetails', 'Contract & Employment')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.branch', 'Branch')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.branch?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.company', 'Company')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.company?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.department', 'Department')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.department?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.position', 'Position')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.position?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.reporting_to', 'Direct Supervisor')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.manager?.name || t('employees.top_management', 'Top Management')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.contract_type', 'Contract Type')}</p>
                  <p className="font-semibold uppercase text-foreground mt-0.5">
                    {selectedItem.contract_type || 'UDC'} {selectedItem.contract_end_date ? `(${t('employees.contract_expiry', 'Expires')}: ${selectedItem.contract_end_date})` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: POS & Security */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('employees.pos_security', 'POS & Security')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-muted-foreground text-[11px] font-medium">{t('employees.pos_pin', 'Quick POS PIN')}</p>
                    {!isResettingPin && (
                      <button
                        type="button"
                        onClick={() => setIsResettingPin(true)}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {selectedItem.has_pos_pin || selectedItem.pos_pin ? t('common.reset', 'Change') : t('common.set', 'Set')}
                      </button>
                    )}
                  </div>
                  {!isResettingPin ? (
                    <p className="font-semibold font-mono text-foreground mt-0.5">
                      {selectedItem.has_pos_pin || selectedItem.pos_pin ? t('employees.pin_configured', '•••• (Configured)') : t('employees.not_set', 'Not Set')}
                    </p>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="password"
                        maxLength={6}
                        placeholder={t('employees.pin_placeholder', '4-6 digits')}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="h-7 w-24 px-2 text-xs font-mono rounded-lg border border-primary bg-background focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={newPin.length < 4 || pinMutation.isPending}
                        onClick={() => pinMutation.mutate(newPin)}
                        className="h-7 px-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {pinMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsResettingPin(false); setNewPin(''); }}
                        className="h-7 px-2 rounded-lg border border-border hover:bg-muted text-muted-foreground text-[11px] cursor-pointer"
                      >
                        {t('common.cancel', 'Cancel')}
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.card_uid', 'RFID / NFC Card UID')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">{selectedItem.card_uid || t('common.none', 'None')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.sales_commission_rate', 'Sales Commission Rate')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedItem.sales_commission_rate ?? 0}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.override_rights', 'POS Cashier Permissions')}</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {selectedItem.is_pos_supervisor ? t('employees.discount_void_allowed', 'Discount & Void Allowed') : t('employees.standard_cashier', 'Standard Cashier')}
                  </p>
                </div>
              </div>
            </div>

            {/* Optional: Driver Card (if employee is a driver) */}
            {selectedItem.is_driver && (
              <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t('employees.logistics', 'Delivery Logistics')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('employees.driver_license_no', 'Driver License')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">{selectedItem.driver_license_no || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[11px] font-medium">{t('employees.vehicle_plate_no', 'Vehicle Plate')}</p>
                    <p className="font-semibold font-mono text-foreground mt-0.5">{selectedItem.vehicle_plate_no || '-'}</p>
                  </div>
                  <div className="sm:col-span-2 pt-1">
                    <p className="text-muted-foreground text-[11px] font-medium mb-1.5">{t('employees.driver_status', 'Duty Status')}</p>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/50 border border-border/60">
                      {(['available', 'delivering', 'off_duty'] as const).map((status) => {
                        const isActive = (selectedItem.driver_status || 'available') === status
                        return (
                          <button
                            key={status}
                            type="button"
                            disabled={driverStatusMutation.isPending}
                            onClick={() => driverStatusMutation.mutate(status)}
                            className={`py-1 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer text-center ${
                              isActive
                                ? 'bg-background text-foreground shadow-2xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <span>{t(`employees.driverStatus_${status}`, status)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card 4: Salary & ABA Bank */}
            <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t('employees.cambodiaCompliance', 'Salary & ABA Bank')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.basic_salary', 'Basic Salary')}</p>
                  <p className="font-bold font-mono text-primary text-sm mt-0.5">{formatCurrency(selectedItem.basic_salary, 'USD')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.nssf_number', 'NSSF Number')}</p>
                  <p className="font-semibold font-mono text-foreground mt-0.5">{selectedItem.nssf_number || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.bank_name', 'Bank Name')}</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedItem.bank_name || 'ABA Bank'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.bank_account_number', 'Bank Account Number')}</p>
                  <p className="font-bold font-mono text-foreground mt-0.5">{selectedItem.bank_account_number || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-[11px] font-medium">{t('employees.bank_account_holder', 'Account Holder Name')}</p>
                  <p className="font-semibold uppercase text-foreground mt-0.5">{selectedItem.bank_account_holder || selectedItem.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: ATTENDANCE HISTORY ─── */}
        {activeSubTab === 'attendance' && (
          <div className="space-y-4">
            {/* Quick KPI Bar */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-center">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">{t('employees.present', 'Present')}</span>
                <span className="text-lg font-black text-emerald-800 dark:text-emerald-200">{attPresentCount}</span>
              </div>
              <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 text-center">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 block">{t('employees.late', 'Late')}</span>
                <span className="text-lg font-black text-amber-800 dark:text-amber-200">{attLateCount}</span>
              </div>
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 text-center">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block">{t('employees.on_leave', 'Leave')}</span>
                <span className="text-lg font-black text-blue-800 dark:text-blue-200">{attLeaveCount}</span>
              </div>
              <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 text-center">
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 block">{t('employees.absent', 'Absent')}</span>
                <span className="text-lg font-black text-rose-800 dark:text-rose-200">{attAbsentCount}</span>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="rounded-xl border border-border/80 overflow-hidden bg-card">
              <div className="p-3 border-b border-border/80 bg-muted/30 flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  {t('employees.recent_attendance_logs', 'Recent Attendance Logs')}
                </h4>
                <button
                  type="button"
                  onClick={() => handleNavigateToModule('attendance')}
                  className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('employees.view_full_attendance', 'View Full Attendance')}</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {isAttLoading ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <Loader2 size={18} className="animate-spin inline mr-2 text-primary" />
                  <span>{t('common.loading', 'Loading records...')}</span>
                </div>
              ) : attendancesList.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  <p>{t('employees.no_attendance_found', 'No attendance records found')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 text-xs">
                  {attendancesList.map((log: any) => (
                    <div key={log.id} className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-foreground">
                          {log.date ? new Date(log.date).toLocaleDateString() : '-'}
                        </p>
                        <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-0.5">
                          <span className="inline-flex items-center gap-1 font-mono">
                            {log.check_in || '--:--'}
                          </span>
                          <span>→</span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            {log.check_out || '--:--'}
                          </span>
                          {log.working_hours ? (
                            <span className="font-semibold text-primary">
                              ({log.working_hours} {t('employees.hours_unit', 'hrs')})
                            </span>
                          ) : null}
                        </div>
                        {log.notes && (
                          <p className="text-[11px] text-muted-foreground italic mt-0.5">{log.notes}</p>
                        )}
                      </div>
                      <div>
                        <StatusBadge status={log.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: LEAVES & BALANCE ─── */}
        {activeSubTab === 'leaves' && (
          <div className="space-y-5">
            {/* Leave Balance Quotas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-foreground">
                  {t('employees.annual_leave_quotas', { year: new Date().getFullYear(), defaultValue: `Annual Leave Quotas (${new Date().getFullYear()})` })}
                </h4>
                <button
                  type="button"
                  onClick={() => handleNavigateToModule('leaves')}
                  className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('employees.request_leave', 'Request Leave')}</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {isBalanceLoading ? (
                <div className="py-6 text-center text-muted-foreground text-xs">
                  <Loader2 size={16} className="animate-spin inline mr-2 text-primary" />
                  <span>{t('common.loading', 'Loading leave balance...')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Annual Leave */}
                  <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{t('employees.annual_leave', 'Annual Leave')}</span>
                      <span className="text-xs font-extrabold text-primary font-mono">
                        {leaveBalanceData?.annual_leave_remaining ?? 18} / {leaveBalanceData?.annual_leave_total ?? 18} {t('employees.days_unit', 'days')}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">
                      {t('employees.used', 'Used')}: {leaveBalanceData?.annual_leave_used ?? 0} {t('employees.days_unit', 'days')}
                    </p>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (((leaveBalanceData?.annual_leave_used ?? 0) / (leaveBalanceData?.annual_leave_total || 18)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Sick Leave */}
                  <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{t('employees.sick_leave', 'Sick Leave')}</span>
                      <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                        {leaveBalanceData?.sick_leave_used ?? 0} {t('employees.days_used', 'days used')}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">
                      {t('employees.remaining', 'Remaining')}: {leaveBalanceData?.sick_leave_remaining ?? 0} {t('employees.days_unit', 'days')}
                    </p>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((leaveBalanceData?.sick_leave_used ?? 0) / 10) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Special / Other */}
                  <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{t('employees.special_leave', 'Special Leave')}</span>
                      <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                        {leaveBalanceData?.special_leave_used ?? 0} {t('employees.days_used', 'days used')}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">
                      {t('employees.maternity_leave', 'Maternity Leave')}: {leaveBalanceData?.maternity_leave_used ?? 0} {t('employees.days_unit', 'days')}
                    </p>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((leaveBalanceData?.special_leave_used ?? 0) / 7) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Leave Requests */}
            <div className="rounded-xl border border-border/80 overflow-hidden bg-card">
              <div className="p-3 border-b border-border/80 bg-muted/30 flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  {t('employees.recent_leave_requests', 'Recent Leave Requests')}
                </h4>
              </div>

              {isLeavesLoading ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  <Loader2 size={16} className="animate-spin inline mr-2 text-primary" />
                  <span>{t('common.loading', 'Loading...')}</span>
                </div>
              ) : leaveRequestsList.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  <p>{t('employees.no_leaves_found', 'No leave requests found')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 text-xs">
                  {leaveRequestsList.map((req: any) => (
                    <div key={req.id} className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {req.start_date} → {req.end_date}
                          </span>
                          <span className="text-[11px] font-semibold text-primary font-mono">
                            ({req.total_days} {t('employees.days_unit', 'days')})
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          <span className="font-semibold capitalize text-foreground/80">{req.leave_type}</span>: {req.reason || '-'}
                        </p>
                        {req.manager_notes && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                            Note: {req.manager_notes}
                          </p>
                        )}
                      </div>
                      <div>
                        <StatusBadge status={req.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: PAYROLLS & COMPENSATION ─── */}
        {activeSubTab === 'payrolls' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">{t('employees.current_salary_rate', 'Current Basic Salary')}</span>
                <span className="text-xl font-black text-primary font-mono">
                  {formatCurrency(selectedItem.basic_salary, 'USD')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground block">{t('employees.bank_info', 'Payroll Bank Account')}</span>
                <span className="text-xs font-bold text-foreground font-mono">
                  {selectedItem.bank_name || 'ABA'} • {selectedItem.bank_account_number || '-'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 overflow-hidden bg-card">
              <div className="p-3 border-b border-border/80 bg-muted/30 flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  {t('employees.payslips_history', 'Payslips History')}
                </h4>
                <button
                  type="button"
                  onClick={() => handleNavigateToModule('payrolls')}
                  className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('employees.view_all_payrolls', 'View All Payrolls')}</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {isPayrollsLoading ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <Loader2 size={18} className="animate-spin inline mr-2 text-primary" />
                  <span>{t('common.loading', 'Loading payroll history...')}</span>
                </div>
              ) : payrollsList.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  <p>{t('employees.no_payrolls_found', 'No payroll records found')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60 text-xs">
                  {payrollsList.map((pay: any) => (
                    <div key={pay.id} className="p-3.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-foreground font-mono">
                            {pay.period_month || '-'}
                          </span>
                          <StatusBadge status={pay.status} />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                          <span>{t('employees.basic', 'Basic')}: <strong className="font-mono text-foreground">${Number(pay.basic_salary || 0).toFixed(2)}</strong></span>
                          <span>+ {t('employees.allowance', 'Allowance')}: <strong className="font-mono text-foreground">${Number(pay.allowances || 0).toFixed(2)}</strong></span>
                          <span>- {t('employees.deductions', 'Deductions')}: <strong className="font-mono text-foreground">${Number(pay.deductions || 0).toFixed(2)}</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block">{t('employees.net_payable', 'Net Salary')}</span>
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                            ${Number(pay.net_salary || 0).toFixed(2)}
                          </span>
                        </div>
                        {onViewPayslip && (
                          <button
                            type="button"
                            onClick={() => onViewPayslip(pay.id)}
                            className="h-7 px-2.5 rounded-lg border border-border hover:bg-muted text-primary text-xs font-semibold inline-flex items-center cursor-pointer transition-all shadow-2xs"
                            title={t('employees.view_payslip', 'View Payslip')}
                          >
                            <span>{t('employees.payslip', 'Payslip')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DetailDrawerBody>

      <DetailDrawerFooter
        rightActions={
          <div className="flex items-center gap-2">
            <ActionButton
              variant="secondary"
              label={t('common.close', 'Close')}
              onClick={onClose}
            />
            <ActionButton
              variant="primary"
              label={t('common.edit', 'Edit')}
              onClick={() => {
                if (onOpenEdit) {
                  onClose()
                  onOpenEdit(selectedItem)
                } else {
                  onClose()
                  navigate(`/employees/${selectedItem.id}/edit`)
                }
              }}
            />
          </div>
        }
      />
    </DetailDrawer>
  )
}

export default EmployeeDetailDrawer
