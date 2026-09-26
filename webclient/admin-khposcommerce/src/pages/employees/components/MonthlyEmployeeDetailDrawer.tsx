import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
  EmptyState,
} from '@/components/common'
import { EmployeeAvatar } from './EmployeeAvatar'

const KM_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
]
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface MonthlyEmployeeDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  employeeSummary: any | null
  periodMonth: string
  getPhotoUrl?: (photo?: string) => string | null | undefined
}

export const MonthlyEmployeeDetailDrawer: React.FC<MonthlyEmployeeDetailDrawerProps> = ({
  isOpen,
  onClose,
  employeeSummary,
  periodMonth,
  getPhotoUrl,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])

  const employeeId = employeeSummary?.employee_id
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  // Fetch daily attendance logs for this employee in this month
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['employee-month-attendance-logs', employeeId, periodMonth],
    queryFn: () =>
      employeeService.attendance({
        employee_id: employeeId,
        month: periodMonth,
        per_page: 50,
      }),
    enabled: isOpen && !!employeeId,
  })

  // Format month name cleanly in Khmer or English
  const formattedMonth = useMemo(() => {
    try {
      const [y, m] = periodMonth.split('-').map(Number)
      if (m >= 1 && m <= 12) {
        const monthName = isKm ? KM_MONTHS[m - 1] : EN_MONTHS[m - 1]
        return isKm ? `ខែ${monthName} ឆ្នាំ${y}` : `${monthName} ${y}`
      }
      return periodMonth
    } catch {
      return periodMonth
    }
  }, [periodMonth, isKm])

  // Units
  const daysUnit = t('employees.days_unit', 'Days')
  const hoursUnit = t('employees.hours_unit', 'Hours')
  const minsUnit = t('employees.mins_unit', 'Mins')
  const timesUnit = t('employees.times_unit', 'Times')

  // Helper to format worked duration text to local language
  const formatDurationText = (val?: string) => {
    if (!val || val === '-') return null
    if (!isKm) return val
    return val
      .replace(/\s*h\s*/gi, ` ${hoursUnit} `)
      .replace(/\s*m\s*/gi, ` ${minsUnit}`)
      .trim()
  }

  if (!employeeSummary) return null

  const logs = logsData?.data || []
  const rate = employeeSummary.attendance_rate || 0
  const isHigh = rate >= 90
  const isMed = rate >= 70 && rate < 90

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
    >
      {/* Global Standard Header */}
      <DetailDrawerHeader
        title={
          <div className="flex items-center gap-2.5 min-w-0">
            <EmployeeAvatar
              photo={employeeSummary.photo}
              name={employeeSummary.employee_name}
              id={employeeSummary.employee_id}
              size="sm"
              getPhotoUrl={getPhotoUrl}
            />
            <span className="font-bold text-base text-foreground tracking-tight truncate">
              {employeeSummary.employee_name}
            </span>
          </div>
        }
        subtitle={
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <span>{employeeSummary.department || t('employees.not_set', 'Not Set')}</span>
            <span>•</span>
            <span>{employeeSummary.position || t('employees.allStaff', 'Staff')}</span>
            <span>•</span>
            <span className="font-medium text-foreground">{formattedMonth}</span>
          </div>
        }
        badge={
          <span className="px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-mono font-bold border border-border/80">
            {employeeSummary.employee_number || `#EMP-${employeeSummary.employee_id}`}
          </span>
        }
        onClose={onClose}
      />

      {/* Global Standard Body */}
      <DetailDrawerBody
        isLoading={isLoading}
        loadingText={t('employees.loading_daily_records', 'Loading daily attendance records...')}
        className="space-y-5"
      >
        {/* KPI Summary Grid - Clean, Typographic, Localized */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Scheduled Days */}
          <div className="p-3 rounded-xl bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-800 text-center">
            <div className="text-[11px] font-medium text-muted-foreground truncate">
              {t('employees.scheduled_days', 'Scheduled Days')}
            </div>
            <div className="text-sm font-bold font-mono text-foreground mt-1">
              {employeeSummary.scheduled_days ?? 0}{' '}
              <span className="text-[10px] font-normal text-muted-foreground">
                {daysUnit}
              </span>
            </div>
          </div>

          {/* Actual Worked */}
          <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-center">
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
              {t('employees.actual_days_worked', 'Actual Days Worked')}
            </div>
            <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
              {employeeSummary.present_days ?? 0}{' '}
              <span className="text-[10px] font-normal opacity-80">
                {daysUnit}
              </span>
            </div>
          </div>

          {/* Late Incidents */}
          <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-center">
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 truncate">
              {t('employees.total_late_incidents', 'Total Late')}
            </div>
            <div className="text-sm font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
              {employeeSummary.late_days ?? 0}
              {timesUnit}{' '}
              <span className="text-[10px] font-normal opacity-80">
                ({employeeSummary.late_minutes ?? 0}
                {minsUnit})
              </span>
            </div>
          </div>

          {/* Absent Days */}
          <div className="p-3 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 text-center">
            <div className="text-[11px] font-medium text-rose-700 dark:text-rose-400 truncate">
              {t('employees.absent', 'Absent')}
            </div>
            <div className="text-sm font-bold font-mono text-rose-700 dark:text-rose-400 mt-1">
              {employeeSummary.absent_days ?? 0}{' '}
              <span className="text-[10px] font-normal opacity-80">
                {daysUnit}
              </span>
            </div>
          </div>

          {/* Overtime */}
          <div className="p-3 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 text-center">
            <div className="text-[11px] font-medium text-blue-700 dark:text-blue-400 truncate">
              {t('employees.total_overtime', 'Total Overtime')}
            </div>
            <div className="text-sm font-bold font-mono text-blue-700 dark:text-blue-400 mt-1">
              +{employeeSummary.overtime_hours ?? 0}{' '}
              <span className="text-[10px] font-normal opacity-80">{hoursUnit}</span>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="p-3 rounded-xl bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-800 text-center">
            <div className="text-[11px] font-medium text-muted-foreground truncate">
              {t('employees.attendance_rate', 'Attendance Rate')}
            </div>
            <div
              className={`text-sm font-bold font-mono mt-1 ${
                isHigh
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isMed
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {rate}%
            </div>
          </div>
        </div>

        {/* Daily Attendance Records Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {t('employees.daily_records_title', 'Daily Attendance Records for Month')}
            </h4>
            <span className="text-xs font-mono font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-muted border border-border/50">
              {logs.length} {t('employees.records_count', 'records')}
            </span>
          </div>

          {logs.length === 0 ? (
            <EmptyState
              title={t('employees.no_timesheet_data', 'No attendance records found for this month')}
              description={t('employees.no_logs_found_desc', 'No attendance logs found for this employee in the selected month')}
            />
          ) : (
            <div className="space-y-2">
              {logs.map((log: any) => {
                const logDate = (log.attendance_date || log.date || '').substring(0, 10)
                const isPresent = log.status === 'present'
                const isLate = log.status === 'late'
                const isAbsent = log.status === 'absent'

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-border/70 dark:border-slate-800 bg-card hover:bg-muted/20 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4 text-xs"
                  >
                    {/* Left: Date, Status, Notes */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-foreground font-mono text-xs tracking-tight">
                          {logDate}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            isPresent
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : isLate
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                              : isAbsent
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                              : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {isLate
                            ? `${t('employees.late', 'Late')} (${log.late_minutes} ${minsUnit})`
                            : isPresent
                            ? t('employees.on_time', 'On-time')
                            : isAbsent
                            ? t('employees.absent', 'Absent')
                            : t('employees.leave', 'Leave')}
                        </span>
                      </div>

                      {log.notes && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          <span className="font-medium text-foreground/70">
                            {t('employees.notes_label', 'Note')}:
                          </span>{' '}
                          {log.notes}
                        </div>
                      )}
                    </div>

                    {/* Right: Check-in / Check-out Times and Worked Hours */}
                    <div className="text-right shrink-0 space-y-1 font-mono">
                      <div className="text-xs font-semibold text-foreground tracking-tight">
                        {log.check_in ? log.check_in.substring(0, 5) : '--:--'} –{' '}
                        {log.check_out ? log.check_out.substring(0, 5) : '--:--'}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-2">
                        {log.worked_hours_formatted && (
                          <span className="font-medium text-foreground/80">
                            {formatDurationText(log.worked_hours_formatted)}
                          </span>
                        )}
                        {log.overtime_minutes > 0 && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            +{log.overtime_formatted ? formatDurationText(log.overtime_formatted) : `${Math.round(log.overtime_minutes / 60)} ${hoursUnit}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DetailDrawerBody>

      {/* Global Standard Footer */}
      <DetailDrawerFooter
        onClose={onClose}
        closeLabel={t('common.close', 'Close')}
      />
    </DetailDrawer>
  )
}

export default MonthlyEmployeeDetailDrawer
