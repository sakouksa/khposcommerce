import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GlobalPrintContainer,
  GlobalPrintHeader,
  GlobalPrintFooter,
} from '@/components/shared/GlobalPrint'
import { formatShiftName } from '../utils/shiftFormatters'
import type { Shift } from './WeeklyShiftRosterTab'

interface WeeklyShiftRosterPrintModalProps {
  isOpen: boolean
  onClose: () => void
  employeesList: any[]
  shiftsList: Shift[]
  weekDays: Array<{
    index: number
    dateStr: string
    dayNum: number
    monthNum: number
    isToday: boolean
  }>
  weekRangeLabel: string
  getAssignedShift: (employeeId: number, dateStr: string, dayIndex: number) => any
  calculateWeeklyHours: (employeeId: number) => number
  branchName?: string
}

export const WeeklyShiftRosterPrintModal: React.FC<WeeklyShiftRosterPrintModalProps> = ({
  isOpen,
  onClose,
  employeesList,
  shiftsList,
  weekDays,
  weekRangeLabel,
  getAssignedShift,
  calculateWeeklyHours,
  branchName,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common', 'finance'])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  // Calculate daily statistics across all employees
  const dailyStats = useMemo(() => {
    return weekDays.map((d) => {
      let onDutyCount = 0
      let offCount = 0
      let dailyHoursSum = 0

      employeesList.forEach((emp) => {
        const shift = getAssignedShift(emp.id, d.dateStr, d.index)
        if (shift === 'off') {
          offCount += 1
        } else if (shift && typeof shift === 'object') {
          onDutyCount += 1
          if (shift.start_time && shift.end_time) {
            const [sh, sm] = shift.start_time.split(':').map(Number)
            const [eh, em] = shift.end_time.split(':').map(Number)
            let diff = eh + em / 60 - (sh + sm / 60)
            if (diff < 0) diff += 24
            dailyHoursSum += diff
          } else {
            dailyHoursSum += 8
          }
        }
      })

      return {
        dateStr: d.dateStr,
        onDutyCount,
        offCount,
        dailyHoursSum: Math.round(dailyHoursSum * 10) / 10,
      }
    })
  }, [weekDays, employeesList, getAssignedShift])

  // Grand total weekly hours for all employees
  const grandTotalHours = useMemo(() => {
    return employeesList.reduce((acc, emp) => acc + (calculateWeeklyHours(emp.id) || 0), 0)
  }, [employeesList, calculateWeeklyHours])

  if (!isOpen) return null

  const referenceNo = `RST-${weekDays[0]?.dateStr?.replace(/-/g, '') || 'WEEK'}`

  const signatures = [
    {
      titleLocalized: t('employees.prepared_by', 'Prepared By'),
      name: t('employees.hr_operations_team', 'HR Operations Team'),
      role: t('employees.hr_attendance_officer', 'HR & Attendance Officer'),
    },
    {
      titleLocalized: t('employees.verified_by', 'Verified By'),
      name: t('employees.operations_manager', 'Operations Manager'),
      role: t('employees.store_operations_manager', 'Store Operations Manager'),
    },
    {
      titleLocalized: t('employees.approved_by', 'Approved By'),
      name: t('employees.general_director', 'General Director'),
      role: t('employees.managing_director', 'Managing Director'),
    },
  ]

  const dayLabels = [
    t('employees.mon_name', 'Monday'),
    t('employees.tue_name', 'Tuesday'),
    t('employees.wed_name', 'Wednesday'),
    t('employees.thu_name', 'Thursday'),
    t('employees.fri_name', 'Friday'),
    t('employees.sat_name', 'Saturday'),
    t('employees.sun_name', 'Sunday'),
  ]

  return (
    <GlobalPrintContainer
      isOpen={isOpen}
      onClose={onClose}
      modalTitle={t('employees.weekly_shift_roster_title', 'Weekly Employee Shift Roster')}
      documentSubtitle={`${weekRangeLabel} • ${branchName || t('employees.headquarters', 'Headquarters')}`}
      layout="modal"
      width="max-w-6xl"
      pageOrientation="landscape"
    >
      {/* 1. Global Standard Dynamic Header */}
      <GlobalPrintHeader
        title={t('employees.weekly_shift_roster_title', 'Weekly Employee Shift Roster')}
        subtitleEnglish="WEEKLY EMPLOYEE SHIFT ROSTER & TIMETABLE"
        documentTypeLabel={t('employees.official_schedule', 'Official Schedule')}
        referenceNumber={referenceNo}
        referenceLabel={t('employees.roster_ref_no', 'Roster Ref #')}
        date={weekDays[0]?.dateStr}
        dateLabel={t('employees.effective_date', 'Effective Date')}
        status="approved"
        branchName={branchName}
        extraMeta={[
          {
            label: t('employees.total_workforce', 'Total Workforce'),
            value: `${employeesList.length} ${t('employees.staff_unit', 'Staff')}`,
          },
          {
            label: t('employees.roster_period', 'Roster Period'),
            value: weekRangeLabel,
          },
        ]}
      />

      {/* 2. Shift Color / Time Guide Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] mb-3 [print-color-adjust:exact] print:bg-slate-50 print:border-slate-300 print:mb-2 print:p-2 print-break-avoid">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-800">
            {t('employees.shifts_label', 'Shifts:')}
          </span>
          {shiftsList.map((s) => (
            <div
              key={s.id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs print:border-slate-300"
            >
              <span className="font-bold text-slate-800">{formatShiftName(s.name, isKm)}</span>
              <span className="text-slate-500 font-mono text-[10px]">
                ({s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)})
              </span>
            </div>
          ))}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-rose-200 text-rose-600 shadow-2xs font-semibold print:border-rose-300">
            <span>{t('employees.off_day', 'Off Day')}</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono hidden sm:block print:block">
          <span>{t('employees.total_weekly_hours_label', 'Total Weekly Hours:')} <strong className="text-slate-900 font-bold">{grandTotalHours}h</strong></span>
        </div>
      </div>

      {/* 3. Official Printable Matrix Table (Multi-Page Flow Enabled) */}
      <div className="rounded-xl border border-slate-300 overflow-hidden shadow-2xs [print-color-adjust:exact] print:rounded-none print:shadow-none print:border-slate-400">
        <table className="w-full table-fixed border-collapse text-[11px] print:text-[9px]">
          {/* thead with display: table-header-group ensures it repeats automatically on every printed page */}
          <thead className="table-header-group">
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold uppercase text-[10px] tracking-wider print:bg-slate-200 print:border-slate-400">
              <th className="py-2 px-1 text-center w-[4%] border-r border-slate-300 print:border-slate-400 print:w-[3.5%]">#</th>
              <th className="py-2 px-2 text-left border-r border-slate-300 w-[18%] print:w-[17%] print:px-1.5 print:border-slate-400">
                {t('employees.employee_and_department', 'Employee & Department')}
              </th>
              {weekDays.map((d, i) => (
                <th
                  key={d.dateStr}
                  className="py-2 px-0.5 text-center border-r border-slate-300 w-[10.5%] print:w-[10.5%] print:px-0.5 print:border-slate-400"
                >
                  <div className="font-bold text-slate-900 truncate">{dayLabels[i]}</div>
                  <div className="text-[9.5px] font-mono text-slate-600 font-normal print:text-[8px]">
                    {d.dayNum}/{d.monthNum}
                  </div>
                </th>
              ))}
              <th className="py-2 px-1 text-center w-[6.5%] print:w-[6%] print:px-0.5">
                {t('common.total', 'Total')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 table-row-group print:divide-slate-300">
            {employeesList.map((emp, idx) => {
              const totalHours = calculateWeeklyHours(emp.id)
              return (
                <tr
                  key={emp.id}
                  className={`print-break-avoid ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <td className="py-1.5 px-1 text-center font-mono font-bold text-slate-500 border-r border-slate-200 print:border-slate-300 print:py-1 print:px-0.5">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-200 print:border-slate-300 print:py-1 print:px-1.5">
                    <div className="font-bold text-slate-900 text-xs truncate print:text-[9.5px]">{emp.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono truncate print:text-[8px]">
                      {emp.employee_number || `#${emp.id}`} • {emp.department?.name || emp.department || t('employees.staff_fallback', 'Staff')}
                    </div>
                  </td>
                  {weekDays.map((d) => {
                    const shift = getAssignedShift(emp.id, d.dateStr, d.index)
                    const isOff = shift === 'off'
                    const isAssigned = shift && !isOff

                    return (
                      <td
                        key={d.dateStr}
                        className="py-1 px-0.5 text-center border-r border-slate-200 print:border-slate-300 print:py-0.5 print:px-0.5"
                      >
                        {isOff ? (
                          <span className="inline-block px-1 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-medium border border-slate-200 print:bg-slate-100 print:border-slate-300 print:text-[7.5px]">
                            {t('employees.off_badge', 'Off')}
                          </span>
                        ) : isAssigned ? (
                          <div className="px-0.5 py-0.5 rounded bg-slate-100/90 border border-slate-200 text-slate-900 flex flex-col items-center justify-center print:bg-slate-50 print:border-slate-300 print:p-0.5">
                            <span className="font-bold text-[9px] truncate max-w-full leading-tight print:text-[7.5px]">
                              {formatShiftName(shift.name, isKm)}
                            </span>
                            <span className="text-[8px] font-mono text-slate-600 leading-tight print:text-[7px]">
                              {shift.start_time?.substring(0, 5)}-{shift.end_time?.substring(0, 5)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono text-[9px]">—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="py-1.5 px-1 text-center font-mono font-bold text-xs text-slate-900 print:text-[9.5px] print:py-1 print:px-0.5">
                    {totalHours}h
                  </td>
                </tr>
              )
            })}

            {/* Daily Workforce Summary Counts positioned at the end of the table rows */}
            <tr className="print-break-avoid border-t-2 border-slate-400 bg-slate-100 font-semibold print:bg-slate-100" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <td colSpan={2} className="py-1.5 px-2 text-left border-r border-slate-300 font-bold text-slate-900 text-[10px] print:text-[8.5px]">
                {t('employees.staff_on_duty', 'Staff on Duty')}
              </td>
              {dailyStats.map((stat) => (
                <td key={stat.dateStr} className="py-1.5 px-0.5 text-center border-r border-slate-300 font-mono text-[9.5px] text-slate-900 font-bold print:text-[8px] print:px-0.5">
                  <span className="inline-block px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 print:bg-emerald-50 print:border-emerald-300">
                    {stat.onDutyCount} {t('employees.person_unit', 'p')}
                  </span>
                </td>
              ))}
              <td className="py-1.5 px-1 text-center font-mono font-bold text-xs text-slate-900 print:text-[9.5px]">
                {grandTotalHours}h
              </td>
            </tr>

            <tr className="print-break-avoid bg-slate-50 text-slate-600 text-[9.5px]" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <td colSpan={2} className="py-1 px-2 text-left border-r border-slate-300 font-medium print:text-[8px]">
                {t('employees.day_off_staff', 'Day Off Staff')}
              </td>
              {dailyStats.map((stat) => (
                <td key={stat.dateStr} className="py-1 px-0.5 text-center border-r border-slate-300 font-mono text-[9px] text-slate-500 print:text-[7.5px] print:px-0.5">
                  {stat.offCount > 0 ? (
                    <span>{stat.offCount} {t('employees.person_unit', 'off')}</span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              ))}
              <td className="py-1 px-1 text-center font-mono text-[8.5px] text-slate-500 print:text-[8px]">
                {employeesList.length} {t('employees.staff_unit', 'Staff')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Official Signatures and Footer */}
      <div className="print-break-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <GlobalPrintFooter
          signatures={signatures}
          customWatermark={t('employees.roster_print_watermark', 'Enterprise HR & Workforce Management • Official Work Schedule')}
          noticeText={t('employees.roster_print_notice', 'Notice: All employees must adhere to the assigned schedule above. Any shift swap or leave request must be submitted to the HR department at least 24 hours in advance.')}
        />
      </div>
    </GlobalPrintContainer>
  )
}

export default WeeklyShiftRosterPrintModal


