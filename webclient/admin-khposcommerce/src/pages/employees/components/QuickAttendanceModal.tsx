import React, { useState, useEffect, useMemo } from 'react'
import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { EmployeeAvatar } from './EmployeeAvatar'
import { formatShiftName } from '../utils/shiftFormatters'
import {
  EnterpriseModal,
  ModalFooter,
  EnterpriseDatePicker,
  EnterpriseTimePicker,
  FieldLabel,
  FieldError,
} from '@/components/common'

interface QuickAttendanceModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  initialData?: any | null
  employeesList: any[]
  shiftsList?: any[]
  branchesList?: any[]
  getPhotoUrl?: (path?: string) => string | null | undefined
}

export const QuickAttendanceModal: React.FC<QuickAttendanceModalProps> = ({
  open,
  onClose,
  onSuccess,
  initialData,
  employeesList = [],
  shiftsList = [],
  branchesList = [],
  getPhotoUrl,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const isKm = i18n.language?.startsWith('km') ?? true
  const toast = useToast()
  const qc = useQueryClient()

  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), [])
  const yesterdayStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().substring(0, 10)
  }, [])

  // Form State
  const [employeeId, setEmployeeId] = useState<string>('')
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr)
  const [shiftId, setShiftId] = useState<string>('')
  const [checkIn, setCheckIn] = useState<string>('08:00')
  const [checkOut, setCheckOut] = useState<string>('17:00')
  const [status, setStatus] = useState<string>('present')
  const [notes, setNotes] = useState<string>('')
  const [showEmployeeError, setShowEmployeeError] = useState(false)

  const isEditing = Boolean(initialData && initialData.id)

  // Reset or populate fields when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      setShowEmployeeError(false)
      if (initialData) {
        setEmployeeId(String(initialData.employee_id || initialData.employee?.id || ''))
        setAttendanceDate(initialData.attendance_date || initialData.date || todayStr)
        setShiftId(initialData.shift_id ? String(initialData.shift_id) : (shiftsList[0]?.id ? String(shiftsList[0].id) : ''))
        setCheckIn(initialData.check_in ? initialData.check_in.substring(0, 5) : '08:00')
        setCheckOut(initialData.check_out ? initialData.check_out.substring(0, 5) : '17:00')
        setStatus(initialData.status || 'present')
        setNotes(initialData.notes || '')
      } else {
        // When clicking Add: DO NOT auto-select any employee! Prompt user to choose.
        setEmployeeId('')
        setAttendanceDate(todayStr)
        setShiftId(shiftsList[0]?.id ? String(shiftsList[0].id) : '')
        setCheckIn('08:00')
        setCheckOut('17:00')
        setStatus('present')
        setNotes('')
      }
    }
  }, [open, initialData, todayStr, shiftsList])

  // Live Working Hours & Break Calculation
  const calculatedDuration = useMemo(() => {
    if (!checkIn || !checkOut || status === 'absent' || status === 'leave') return null
    try {
      const [inH, inM] = checkIn.split(':').map(Number)
      const [outH, outM] = checkOut.split(':').map(Number)
      let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
      if (totalMinutes < 0) totalMinutes += 24 * 60
      const breakMinutes = totalMinutes >= 300 ? 60 : 0
      const netMinutes = Math.max(0, totalMinutes - breakMinutes)
      const hours = (netMinutes / 60).toFixed(1)
      return {
        totalHours: hours,
        rawMinutes: totalMinutes,
        hasBreak: breakMinutes > 0,
      }
    } catch {
      return null
    }
  }, [checkIn, checkOut, status])

  const selectedEmployee = useMemo(() => {
    return employeesList.find((e) => String(e.id) === String(employeeId))
  }, [employeesList, employeeId])

  // Save Mutation (Create or Update)
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing && initialData?.id) {
        return employeeService.updateAttendance(initialData.id, payload)
      }
      return employeeService.createAttendance(payload)
    },
    onSuccess: () => {
      sound.playSuccess()
      toast.success(
        isEditing
          ? t('employees.attendance_update_success', 'Attendance record updated successfully')
          : t('employees.attendance_create_success', 'Attendance record created successfully')
      )
      qc.invalidateQueries({ queryKey: ['attendance'] })
      qc.invalidateQueries({ queryKey: ['attendances'] })
      qc.invalidateQueries({ queryKey: ['attendance-monthly-summary'] })
      qc.invalidateQueries({ queryKey: ['attendance-dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['employee-stats'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: any) => {
      sound.playError()
      const msg = err?.response?.data?.message || t('common.saveFailed', 'Failed to save attendance record')
      toast.error(msg)
    },
  })

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!employeeId) {
      setShowEmployeeError(true)
      focusFirstInvalidField({ employeeId: 'required' })
      return
    }

    const payload: any = {
      employee_id: Number(employeeId),
      attendance_date: attendanceDate,
      date: attendanceDate,
      status,
      notes: notes.trim() || undefined,
    }

    if (shiftId) {
      payload.shift_id = Number(shiftId)
    }

    // Only send check_in / check_out if present or late or overtime
    if (status !== 'absent' && status !== 'leave') {
      payload.check_in = checkIn ? `${checkIn}:00` : undefined
      payload.check_out = checkOut ? `${checkOut}:00` : undefined
    }

    mutation.mutate(payload)
  }

  // Keyboard Shortcut: Ctrl/Cmd + Enter to submit form
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, employeeId, attendanceDate, status, notes, shiftId, checkIn, checkOut])

  // Quick Preset Handlers
  const applyPreset = (presetCheckIn: string, presetCheckOut: string, presetStatus = 'present') => {
    sound.playClick()
    setCheckIn(presetCheckIn)
    setCheckOut(presetCheckOut)
    setStatus(presetStatus)
  }

  return (
    <EnterpriseModal
      isOpen={open}
      onClose={onClose}
      title={
        isEditing
          ? t('employees.edit_attendance_title', 'Edit Attendance Record')
          : t('employees.quick_record_attendance', 'Record Attendance')
      }
      subtitle={t('employees.quick_attendance_desc', 'Enter daily check-in, check-out, and working status')}
      icon={<Clock size={20} />}
      iconVariant="blue"
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          submitLabel={
            isEditing
              ? t('common.saveChanges', 'Save Changes')
              : t('employees.save_attendance', 'Save Record')
          }
          isSubmitting={mutation.isPending}
          disabled={mutation.isPending}
          isEdit={isEditing}
          onSubmit={() => handleSubmit()}
        />
      }
    >
      <form id="quick-attendance-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* 1. Standard Select for Employee */}
        <div>
          <FieldLabel label={t('employees.employee', 'Employee')} required />

          {isEditing && selectedEmployee ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 dark:bg-slate-900/60 border border-border dark:border-slate-800">
              <EmployeeAvatar
                photo={selectedEmployee.photo}
                name={selectedEmployee.name}
                id={selectedEmployee.id}
                size="md"
                getPhotoUrl={getPhotoUrl}
              />
              <div>
                <div className="font-bold text-sm text-foreground">{selectedEmployee.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {selectedEmployee.employee_number} • {selectedEmployee.department?.name || selectedEmployee.position?.name || ''}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <select
                id="employeeId"
                name="employeeId"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value)
                  if (showEmployeeError && e.target.value) {
                    setShowEmployeeError(false)
                  }
                }}
                required
                className={`w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border ${
                  showEmployeeError && !employeeId
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-border/80 dark:border-slate-700/80'
                } bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer shadow-2xs`}
              >
                <option value="" disabled className="dark:bg-slate-900 text-muted-foreground">
                  {t('employees.select_employee', '-- Select Employee --')}
                </option>
                {employeesList.map((emp) => (
                  <option key={emp.id} value={emp.id} className="dark:bg-slate-900">
                    {emp.name} {emp.employee_number ? `(${emp.employee_number})` : `#${emp.id}`} - {emp.department?.name || emp.position?.name || 'Staff'}
                  </option>
                ))}
              </select>

              {showEmployeeError && !employeeId && (
                <FieldError error={t('employees.select_employee_required', 'Please select an employee')} />
              )}
            </div>
          )}
        </div>

        {/* 2. Global DatePicker & Quick Jump */}
        <div>
          <FieldLabel
            label={t('employees.attendance_date', 'Attendance Date')}
            required
            action={
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAttendanceDate(todayStr)}
                  className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    attendanceDate === todayStr
                      ? 'bg-primary text-white font-bold'
                      : 'text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {t('employees.today', 'Today')}
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceDate(yesterdayStr)}
                  className={`px-2.5 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    attendanceDate === yesterdayStr
                      ? 'bg-primary text-white font-bold'
                      : 'text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {t('employees.yesterday', 'Yesterday')}
                </button>
              </div>
            }
          />
          <EnterpriseDatePicker
            value={attendanceDate || null}
            onChange={(dateStr) => {
              if (dateStr) setAttendanceDate(dateStr)
            }}
            placeholder={t('employees.select_date', 'Select Date')}
            clearable={false}
            size="small"
          />
        </div>

        {/* 3. Status Selector Radio Pills */}
        <div>
          <FieldLabel label={t('employees.attendance_status', 'Attendance Status')} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setStatus('present')}
              className={`h-9 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                status === 'present'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-card hover:bg-muted text-muted-foreground border-border dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t('employees.present', 'Present')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('late')}
              className={`h-9 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                status === 'late'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-card hover:bg-muted text-muted-foreground border-border dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{t('employees.late', 'Late')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('absent')}
              className={`h-9 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                status === 'absent'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-card hover:bg-muted text-muted-foreground border-border dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{t('employees.absent', 'Absent')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('leave')}
              className={`h-9 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                status === 'leave'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-card hover:bg-muted text-muted-foreground border-border dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>{t('employees.leave', 'Leave')}</span>
            </button>
          </div>
        </div>

        {/* 4. Global TimePicker for Check In & Check Out (Visible when Present or Late) */}
        {status !== 'absent' && status !== 'leave' && (
          <div className="space-y-3 p-3.5 rounded-2xl bg-muted/20 dark:bg-slate-900/40 border border-border/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {t('employees.working_hours', 'Working Hours')}
              </span>
              {/* Quick Presets */}
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => applyPreset('08:00', '17:00', 'present')}
                  className="px-2 py-0.5 rounded bg-card hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 border border-border dark:border-slate-700 font-semibold text-foreground dark:text-slate-200 transition-all cursor-pointer"
                >
                  08:00 - 17:00
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('08:00', '12:00', 'present')}
                  className="px-2 py-0.5 rounded bg-card hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 border border-border dark:border-slate-700 font-semibold text-foreground dark:text-slate-200 transition-all cursor-pointer"
                >
                  {t('employees.morning_half', 'Morning (Half)')}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('13:00', '17:00', 'present')}
                  className="px-2 py-0.5 rounded bg-card hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 border border-border dark:border-slate-700 font-semibold text-foreground dark:text-slate-200 transition-all cursor-pointer"
                >
                  {t('employees.afternoon_half', 'Afternoon (Half)')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <div>
                <FieldLabel label={t('employees.check_in', 'Check In')} required={status !== 'absent'} />
                <EnterpriseTimePicker
                  value={checkIn}
                  onChange={(timeStr) => setCheckIn(timeStr || '08:00')}
                  format="HH:mm"
                  ampm={false}
                  size="small"
                />
              </div>
              <div>
                <FieldLabel label={t('employees.check_out', 'Check Out')} />
                <EnterpriseTimePicker
                  value={checkOut}
                  onChange={(timeStr) => setCheckOut(timeStr || '17:00')}
                  format="HH:mm"
                  ampm={false}
                  size="small"
                />
              </div>
            </div>

            {/* Real-time Computed Hours Indicator (Clean, without excessive icons) */}
            {calculatedDuration && (
              <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary dark:text-primary-foreground font-medium">
                <span className="font-semibold text-foreground">
                  {t('employees.total_calculated_hours', 'Total Work Hours (Auto)')}:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {calculatedDuration.totalHours} {t('employees.hours_unit', 'hours')}
                  {calculatedDuration.hasBreak && (
                    <span className="text-[11px] text-muted-foreground font-normal ml-1.5">
                      ({t('employees.deducted_break', '1h break deducted')})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 5. Standard Select for Shift Schedule */}
        {shiftsList.length > 0 && (
          <div>
            <FieldLabel label={t('employees.shift', 'Shift Schedule')} />
            <select
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
              className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer shadow-2xs"
            >
              <option value="" className="dark:bg-slate-900">
                {t('employees.standard_default_shift', 'Standard / Automatic Shift')}
              </option>
              {shiftsList.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  {formatShiftName(s.name, isKm)} ({s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 6. Notes (Standard form-input with FieldLabel) */}
        <div>
          <FieldLabel label={t('employees.notes', 'Notes')} />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('employees.attendance_notes_placeholder', 'Optional: reason for manual entry, supervisor approval, etc.')}
            rows={2}
            className="w-full p-3 rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-500 text-xs sm:text-[13px] font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>
      </form>
    </EnterpriseModal>
  )
}

export default QuickAttendanceModal
