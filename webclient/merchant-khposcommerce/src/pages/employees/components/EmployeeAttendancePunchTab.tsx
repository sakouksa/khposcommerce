import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock,
  Fingerprint,
  Calendar,
  CheckCircle2,
  Coffee,
  Sparkles,
  TrendingUp,
  TrendingDown,
  LogOut,
  UserCheck,
  ShieldCheck,
  MapPin,
  Smartphone,
  ChevronRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { sound } from '@/utils/sound'
import { useToast } from '@/hooks/useToast'
import { EmployeeAvatar } from './EmployeeAvatar'

interface EmployeeAttendancePunchTabProps {
  employeesList: any[]
  shiftsList?: any[]
  getPhotoUrl?: (photo?: string) => string | null
}

export const EmployeeAttendancePunchTab: React.FC<EmployeeAttendancePunchTabProps> = ({
  employeesList = [],
  shiftsList = [],
  getPhotoUrl,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  // Selected employee for the punch simulator/self-service
  const [selectedEmpId, setSelectedEmpId] = useState<number>(() => {
    return employeesList[0]?.id || 1
  })

  // Current Live Time
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const selectedEmployee = useMemo(() => {
    return employeesList.find((e) => e.id === selectedEmpId) || employeesList[0]
  }, [employeesList, selectedEmpId])

  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), [])

  // Query Daily Attendance for selected date
  const { data: attendanceResponse, isLoading } = useQuery({
    queryKey: ['attendances', todayStr],
    queryFn: () => employeeService.attendances({ date: todayStr, per_page: 100 }),
  })

  const records = attendanceResponse?.data || []
  const todayRecord = useMemo(() => {
    return records.find((r: any) => (r.employee_id || r.employee?.id) === selectedEmployee?.id)
  }, [records, selectedEmployee])

  // Punch Mutations
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

  const isClockedIn = Boolean(todayRecord?.check_in && !todayRecord?.check_out)
  const isCompleted = Boolean(todayRecord?.check_in && todayRecord?.check_out)

  const handlePunchToggle = () => {
    sound.playClick()
    const now = new Date()
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    if (isClockedIn && todayRecord) {
      // Clock Out
      clockOutMutation.mutate({
        id: todayRecord.id,
        payload: {
          employee_id: selectedEmployee?.id,
          date: todayStr,
          shift_id: todayRecord.shift_id || 1,
          check_in: todayRecord.check_in?.substring(0, 5) || '08:00',
          check_out: nowTime,
          status: todayRecord.status || 'present',
        },
      })
    } else {
      // Clock In
      clockInMutation.mutate({
        employee_id: selectedEmployee?.id,
        date: todayStr,
        attendance_date: todayStr,
        shift_id: selectedEmployee?.shift_id || shiftsList[0]?.id || 1,
        company_id: selectedEmployee?.company_id || 1,
        branch_id: selectedEmployee?.branch_id || 1,
        check_in: nowTime,
        status: 'present',
        check_in_method: 'kiosk',
      })
    }
  }

  // Greeting
  const hour = currentTime.getHours()
  const greeting =
    hour < 12
      ? t('employees.good_morning', 'Good Morning')
      : hour < 18
      ? t('employees.good_afternoon', 'Good Afternoon')
      : t('employees.good_evening', 'Good Evening')

  // Formatted Live Time
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')
  const timeFormatted = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateFormatted = currentTime.toLocaleDateString(isKm ? 'km-KH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // Shift details
  const empShift = shiftsList.find((s) => s.id === selectedEmployee?.shift_id) || shiftsList[0] || {
    name: t('employees.standard_shift', 'Standard Shift'),
    start_time: '08:00',
    end_time: '17:00',
    break_minutes: 60,
  }

  return (
    <div className="space-y-4">
      {/* ─── Top Employee Selector Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Fingerprint size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {t('employees.employee_view', 'SmartHR Punch Dashboard')}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {t('employees.employee_view_desc', 'Select employee to inspect attendance records and punch live work shifts.')}
            </p>
          </div>
        </div>

        {/* Employee Dropdown */}
        <select
          value={selectedEmpId}
          onChange={(e) => setSelectedEmpId(Number(e.target.value))}
          className="h-8 px-3 text-xs rounded-xl bg-muted/40 border border-border/80 font-bold text-foreground cursor-pointer focus:border-primary shadow-2xs"
        >
          {employeesList.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.department?.name || emp.department || 'Staff'}) - #{emp.employee_number || emp.id}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Main Side-By-Side SmartHR Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Punch Card Widget (Exact SmartHR `/attendance-employee`) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs flex-1 flex flex-col justify-between text-center space-y-4">
            {/* Header: Greeting & Live Clock */}
            <div>
              <span className="text-xs font-semibold text-muted-foreground">{greeting}, {selectedEmployee?.name}</span>
              <h3 className="text-2xl font-extrabold font-mono text-foreground tracking-tight mt-1">
                {timeFormatted}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{dateFormatted}</p>
            </div>

            {/* Circular Progress Avatar Ring */}
            <div className="relative mx-auto my-2 w-32 h-32 flex items-center justify-center">
              {/* Outer SVG Ring */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-muted/40"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={isClockedIn ? 'text-emerald-500' : isCompleted ? 'text-primary' : 'text-muted-foreground/30'}
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={isClockedIn ? '70' : isCompleted ? '0' : '276.46'}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              {/* Centered Employee Avatar */}
              <div className="absolute inset-0 flex items-center justify-center">
                <EmployeeAvatar
                  photo={selectedEmployee?.photo}
                  name={selectedEmployee?.name}
                  size={84}
                  shape="circle"
                  getPhotoUrl={getPhotoUrl}
                />
              </div>

              {/* Glowing Pulse Dot if Working */}
              {isClockedIn && (
                <span className="absolute top-2 right-2 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-card" />
                </span>
              )}
            </div>

            {/* Production Badge & Punch In Status */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold font-mono">
                <Clock size={13} />
                <span>
                  {isClockedIn
                    ? t('employees.production_in_progress', 'Production: 6.50 hrs (In Progress)')
                    : isCompleted
                    ? t('employees.production_completed', 'Production: 8.00 hrs (Completed)')
                    : t('employees.production_zero', 'Production: 0.00 hrs')}
                </span>
              </div>

              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
                <Fingerprint size={14} className="text-primary" />
                <span>
                  {todayRecord?.check_in
                    ? `${t('employees.punch_in_at', 'Punch In at')} ${todayRecord.check_in.substring(0, 5)} ${todayRecord.status === 'late' ? `(${t('employees.late', 'Late')})` : ''}`
                    : t('employees.not_punched_in_today', 'Not punched in yet today')}
                </span>
              </div>
            </div>

            {/* SmartHR Big Action Button */}
            <div>
              <button
                type="button"
                disabled={clockInMutation.isPending || clockOutMutation.isPending}
                onClick={handlePunchToggle}
                className={`w-full h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer select-none ${
                  isClockedIn
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                    : isCompleted
                    ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                {isClockedIn ? (
                  <>
                    <LogOut size={16} />
                    <span>{t('employees.punch_out', 'Punch Out')}</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>{t('employees.shift_completed_done', 'Shift Completed Today (Done)')}</span>
                  </>
                ) : (
                  <>
                    <Fingerprint size={16} />
                    <span>{t('employees.punch_in', 'Punch In')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Work Hours Matrices & Timeline (Exact SmartHR `/attendance-employee`) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 4 Work Hours Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Today */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-mono text-foreground">
                  {todayRecord?.check_in ? '8.00' : '0.00'} <span className="text-xs font-normal text-muted-foreground">/ 8h</span>
                </h3>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{t('employees.total_hours_today', 'Total Hours Today')}</p>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp size={11} />
                <span>{t('employees.on_schedule_100', '100% on schedule')}</span>
              </div>
            </div>

            {/* Card 2: Week */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-mono text-foreground">
                  38.5 <span className="text-xs font-normal text-muted-foreground">/ 40h</span>
                </h3>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{t('employees.total_hours_week', 'Total Hours Week')}</p>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp size={11} />
                <span>{t('employees.plus_5_last_week', '+5% vs last week')}</span>
              </div>
            </div>

            {/* Card 3: Month */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-mono text-foreground">
                  152 <span className="text-xs font-normal text-muted-foreground">/ 160h</span>
                </h3>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{t('employees.total_hours_month', 'Total Hours Month')}</p>
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                <TrendingUp size={11} />
                <span>{t('employees.attendance_rate_95', '95% attendance rate')}</span>
              </div>
            </div>

            {/* Card 4: Overtime */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Coffee size={16} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-mono text-foreground">
                  12.5 <span className="text-xs font-normal text-muted-foreground">/ 20h</span>
                </h3>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">{t('employees.overtime_this_month', 'Overtime This Month')}</p>
              </div>
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                <TrendingUp size={11} />
                <span>{t('employees.ot_saved_amount', 'OT Saved $75.00')}</span>
              </div>
            </div>
          </div>

          {/* SmartHR Multi-Segment Color Breakdown Bar */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-foreground">
              {t('employees.today_time_breakdown', "Today's Time Breakdown")}
            </h4>

            {/* 4 Stat Figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> {t('employees.total_working_hours', 'Total Working Hours')}
                </span>
                <div className="text-base font-bold font-mono text-foreground mt-0.5">08h 30m</div>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('employees.productive_hours', 'Productive Hours')}
                </span>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">07h 30m</div>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> {t('employees.break_hours', 'Break Hours')}
                </span>
                <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">01h 00m</div>
              </div>
              <div>
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> {t('employees.overtime_hours', 'Overtime Hours')}
                </span>
                <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">00h 00m</div>
              </div>
            </div>

            {/* Segmented Color Bar */}
            <div className="h-6 w-full rounded-xl bg-muted/50 p-1 flex gap-1 overflow-hidden border border-border/60">
              <div className="bg-emerald-500 rounded-lg h-full transition-all" style={{ width: '65%' }} title="Productive (65%)" />
              <div className="bg-amber-500 rounded-lg h-full transition-all" style={{ width: '15%' }} title="Break (15%)" />
              <div className="bg-blue-500 rounded-lg h-full transition-all" style={{ width: '10%' }} title="Overtime (10%)" />
              <div className="bg-muted-foreground/20 rounded-lg h-full transition-all flex-1" title="Remaining" />
            </div>

            {/* Shift Reference */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50 text-muted-foreground">
              <span>
                {t('employees.assigned_shift', 'Assigned Shift')}: <strong className="text-foreground">{empShift.name}</strong> ({empShift.start_time?.substring(0, 5)} - {empShift.end_time?.substring(0, 5)})
              </span>
              <span>
                {t('employees.late_grace_time', 'Late Grace Period')}: <strong className="text-foreground">{empShift.late_grace_minutes || 10} {t('employees.mins_unit', 'mins')}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeAttendancePunchTab
