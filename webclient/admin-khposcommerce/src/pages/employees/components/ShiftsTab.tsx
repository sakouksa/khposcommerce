import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { employeeService } from '@/services/employeeService'
import { useToast } from '@/hooks/useToast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { EmptyState, EnterpriseTimePicker, EnterpriseModal, ModalFooter, TableActionMenu } from '@/components/common'
import { formatShiftName, matchesShiftDay } from '../utils/shiftFormatters'

interface Shift {
  id: number
  company_id: number
  branch_id: number
  name: string
  start_time: string
  end_time: string
  break_minutes: number
  late_grace_minutes: number
  max_check_in_time: string | null
  min_check_out_time: string | null
  max_overtime_minutes: number
  working_days: string[]
  is_active: boolean
}

interface ShiftsTabProps {
  openCreateModalRef?: React.MutableRefObject<(() => void) | null>
}

const ShiftsTab: React.FC<ShiftsTabProps> = ({ openCreateModalRef }) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')
  const toast = useToast()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null)

  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [breakMinutes, setBreakMinutes] = useState(60)
  const [lateGraceMinutes, setLateGraceMinutes] = useState(10)
  const [maxOvertimeMinutes, setMaxOvertimeMinutes] = useState(240)
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const { data: shifts = [], isLoading } = useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: () => employeeService.shifts().then(r => r.data ?? []),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => employeeService.createShift(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] })
      toast.success(t('employees.shift_create_success', 'Shift schedule created successfully'))
      closeModal()
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? t('employees.shift_create_error', 'Failed to create shift')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => employeeService.updateShift(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] })
      toast.success(t('employees.shift_update_success', 'Shift schedule updated successfully'))
      closeModal()
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? t('employees.shift_update_error', 'Failed to update shift')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeService.deleteShift(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] })
      toast.success(t('employees.shift_delete_success', 'Shift schedule deleted'))
      setDeleteTarget(null)
    },
    onError: () => toast.error(t('employees.shift_delete_error', 'Failed to delete shift')),
  })

  const openCreateModal = () => {
    setEditingShift(null)
    setName('')
    setStartTime('08:00')
    setEndTime('17:00')
    setBreakMinutes(60)
    setLateGraceMinutes(10)
    setMaxOvertimeMinutes(240)
    setWorkingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
    setModalOpen(true)
  }

  useEffect(() => {
    if (openCreateModalRef) {
      openCreateModalRef.current = openCreateModal
    }
  }, [openCreateModalRef])

  const openEditModal = (shift: Shift) => {
    setEditingShift(shift)
    setName(shift.name)
    setStartTime(shift.start_time.substring(0, 5))
    setEndTime(shift.end_time.substring(0, 5))
    setBreakMinutes(shift.break_minutes ?? 60)
    setLateGraceMinutes(shift.late_grace_minutes ?? 10)
    setMaxOvertimeMinutes(shift.max_overtime_minutes ?? 240)
    const normalizedDays = (shift.working_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map((d: string) => {
      const matched = allDays.find(ad => ad.toLowerCase() === d.toLowerCase() || d.toLowerCase().startsWith(ad.toLowerCase()) || ad.toLowerCase().startsWith(d.toLowerCase()))
      return matched || d
    })
    setWorkingDays(normalizedDays)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingShift(null)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!name.trim()) return
    const payload = {
      company_id: 1,
      branch_id: 1,
      name: name.trim(),
      start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
      end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
      break_minutes: Number(breakMinutes),
      late_grace_minutes: Number(lateGraceMinutes),
      max_overtime_minutes: Number(maxOvertimeMinutes),
      working_days: workingDays,
      is_active: true,
    }

    if (editingShift) {
      updateMutation.mutate({ id: editingShift.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const toggleDay = (day: string) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">{t('employees.shift_management', 'Shift Management')}</h3>
          <p className="text-xs text-muted-foreground">{t('employees.shift_management_desc', 'Configure work hours, grace period, break durations, and working days.')}</p>
        </div>
      </div>

      {/* ─── Visual 24-Hour Shift Coverage Timeline (Lark / Square Shifts style) ─── */}
      {shifts.length > 0 && (
        <div className="p-4 rounded-2xl bg-card dark:bg-slate-900/50 border border-border/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              <span>{t('employees.coverage_24h', '24-Hour Shift Coverage')}</span>
            </span>
            <span className="text-[11px] text-muted-foreground dark:text-slate-400 font-medium">
              {t('employees.operating_hours', 'Operating Hours:')} <span className="font-bold text-foreground font-mono">06:00 - 24:00</span>
            </span>
          </div>

          {/* Timeline Grid */}
          <div className="space-y-2 pt-1">
            {/* Hour Markers */}
            <div className="grid grid-cols-9 text-[10px] font-mono text-muted-foreground dark:text-slate-400 border-b border-border/40 dark:border-slate-800/80 pb-1 select-none">
              <span>06:00</span>
              <span className="text-center">08:00</span>
              <span className="text-center">10:00</span>
              <span className="text-center">12:00</span>
              <span className="text-center">14:00</span>
              <span className="text-center">16:00</span>
              <span className="text-center">18:00</span>
              <span className="text-center">20:00</span>
              <span className="text-right">24:00</span>
            </div>

            {/* Shift Coverage Bars */}
            <div className="space-y-2">
              {shifts.map((shift, idx) => {
                const parseMins = (tStr: string) => {
                  if (!tStr) return 0
                  const [h, m] = tStr.split(':').map(Number)
                  return h * 60 + (m || 0)
                }
                const startMins = parseMins(shift.start_time)
                const endMins = parseMins(shift.end_time)
                const timelineStart = 6 * 60 // 06:00
                const timelineSpan = 18 * 60 // 18 hours

                const leftPct = Math.max(0, Math.min(100, ((startMins - timelineStart) / timelineSpan) * 100))
                const widthPct = Math.max(8, Math.min(100 - leftPct, ((endMins - startMins) / timelineSpan) * 100))

                const colorGradients = [
                  'from-amber-500/80 to-amber-600/90 text-white shadow-amber-500/20',
                  'from-blue-500/80 to-blue-600/90 text-white shadow-blue-500/20',
                  'from-purple-500/80 to-purple-600/90 text-white shadow-purple-500/20',
                  'from-emerald-500/80 to-emerald-600/90 text-white shadow-emerald-500/20',
                ]
                const grad = colorGradients[idx % colorGradients.length]
                const formattedName = formatShiftName(shift.name, isKm)

                return (
                  <div key={shift.id} className="relative h-7 bg-muted/50 dark:bg-slate-900/70 border border-border/20 dark:border-slate-800/80 rounded-xl overflow-hidden group">
                    <div
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      className={`absolute top-0.5 bottom-0.5 rounded-lg bg-gradient-to-r ${grad} px-2 flex items-center justify-between text-[10px] font-bold shadow-xs transition-all hover:brightness-110 cursor-pointer`}
                      title={`${formattedName}: ${shift.start_time?.substring(0, 5)} - ${shift.end_time?.substring(0, 5)}`}
                    >
                      <span className="truncate">{formattedName}</span>
                      <span className="font-mono text-[9px] opacity-90 hidden sm:inline">
                        {shift.start_time?.substring(0, 5)} - {shift.end_time?.substring(0, 5)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card dark:bg-slate-900/40 border border-border dark:border-slate-800 p-4 rounded-xl h-36 animate-pulse" />
          ))
        ) : shifts.length === 0 ? (
          <div className="col-span-3 bg-card dark:bg-slate-900/40 border border-border dark:border-slate-800 rounded-2xl overflow-hidden">
            <EmptyState
              icon={<Clock size={32} className="text-muted-foreground/50 stroke-1" />}
              title={t('employees.no_shifts_found', 'No work shifts defined')}
              description={t('employees.no_shifts_desc', 'Create a shift schedule like Morning (08:00 - 17:00) to get started.')}
            />
          </div>
        ) : (
          shifts.map(shift => {
            const formattedName = formatShiftName(shift.name, isKm)
            return (
              <div key={shift.id} className="bg-card dark:bg-slate-900/50 border border-border/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Clock size={15} className="text-primary" />
                    {formattedName}
                  </span>
                  <TableActionMenu
                    onEdit={() => openEditModal(shift)}
                    editLabel={t('common.edit', 'Edit')}
                    onDelete={() => setDeleteTarget(shift)}
                    deleteLabel={t('common.delete', 'Delete')}
                  />
                </div>

                <div className="bg-muted/40 dark:bg-slate-800/60 dark:border dark:border-slate-700/50 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground font-mono">{shift.start_time?.substring(0, 5)} - {shift.end_time?.substring(0, 5)}</span>
                  <span className="text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-950/50 border border-amber-500/20 dark:border-amber-800/40 px-2 py-0.5 rounded-full font-mono text-[10px]">
                    {t('employees.grace', 'Grace')}: {shift.late_grace_minutes}{t('employees.minutes_short', 'm')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground dark:text-slate-400 font-medium">
                  <div>{t('employees.break', 'Break')}: <span className="font-bold text-foreground font-mono">{shift.break_minutes}{t('employees.minutes_short', 'm')}</span></div>
                  <div>{t('employees.max_ot', 'Max OT')}: <span className="font-bold text-foreground font-mono">{shift.max_overtime_minutes}{t('employees.minutes_short', 'm')}</span></div>
                </div>

                <div className="flex items-center gap-1 pt-1 border-t border-border/40 dark:border-slate-800">
                  {allDays.map(day => {
                    const isDayActive = matchesShiftDay(shift.working_days, day)
                    return (
                      <span
                        key={day}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                          isDayActive
                            ? 'bg-primary/15 text-primary border border-primary/30 dark:bg-primary/25 dark:text-sky-300 dark:border-primary/40'
                            : 'bg-muted/70 text-muted-foreground/80 border border-border/40 dark:bg-slate-800/90 dark:text-slate-400 dark:border-slate-700/60'
                        }`}
                        title={t(`employees.days_${day.toLowerCase()}`)}
                      >
                        {t(`employees.days_${day.toLowerCase()}`)}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ─── Global Enterprise Modal ─── */}
      <EnterpriseModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingShift ? t('employees.edit_shift_title') : t('employees.add_shift_title')}
        subtitle={t('employees.shift_modal_subtitle')}
        icon={<Clock size={20} />}
        iconVariant="blue"
        size="lg"
        footer={
          <ModalFooter
            onCancel={closeModal}
            cancelLabel={t('common.cancel', 'Cancel')}
            submitLabel={editingShift ? t('common.saveChanges', 'Save Changes') : t('common.save', 'Save')}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            disabled={createMutation.isPending || updateMutation.isPending || !name.trim()}
            isEdit={!!editingShift}
            onSubmit={() => handleSubmit()}
          />
        }
      >
        <form id="shift-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Shift Name */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              {t('employees.shift_name')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder={t('employees.shift_name_placeholder')}
              className="form-input w-full text-xs sm:text-[13px] rounded-xl h-10 px-3.5 border-border/80 dark:border-slate-700 bg-background dark:bg-slate-900/80 text-foreground dark:text-slate-100 focus:border-primary"
            />
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <EnterpriseTimePicker
                label={t('employees.start_time')}
                required
                value={startTime}
                onChange={setStartTime}
              />
            </div>
            <div>
              <EnterpriseTimePicker
                label={t('employees.end_time')}
                required
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          </div>

          {/* Grace, Break, Max Overtime */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground dark:text-slate-400 mb-1">
                {t('employees.grace_mins')}
              </label>
              <input
                type="number"
                min="0"
                value={lateGraceMinutes}
                onChange={e => setLateGraceMinutes(Number(e.target.value))}
                className="form-input w-full text-xs rounded-xl h-9.5 px-3 border-border/80 dark:border-slate-700 bg-background dark:bg-slate-900/80 text-foreground dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground dark:text-slate-400 mb-1">
                {t('employees.break_mins')}
              </label>
              <input
                type="number"
                min="0"
                value={breakMinutes}
                onChange={e => setBreakMinutes(Number(e.target.value))}
                className="form-input w-full text-xs rounded-xl h-9.5 px-3 border-border/80 dark:border-slate-700 bg-background dark:bg-slate-900/80 text-foreground dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground dark:text-slate-400 mb-1">
                {t('employees.max_ot_mins')}
              </label>
              <input
                type="number"
                min="0"
                value={maxOvertimeMinutes}
                onChange={e => setMaxOvertimeMinutes(Number(e.target.value))}
                className="form-input w-full text-xs rounded-xl h-9.5 px-3 border-border/80 dark:border-slate-700 bg-background dark:bg-slate-900/80 text-foreground dark:text-slate-100"
              />
            </div>
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              {t('employees.working_days')}
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {allDays.map(day => {
                const isSelected = workingDays.includes(day)
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center select-none ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs border border-primary dark:bg-primary dark:text-white'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-border/60 hover:text-foreground dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                    }`}
                    title={t(`employees.days_${day.toLowerCase()}`)}
                  >
                    <span>{t(`employees.days_${day.toLowerCase()}`)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </form>
      </EnterpriseModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('employees.delete_shift_title', 'Delete Shift Schedule')}
        message={t('employees.confirm_delete_shift', 'Are you sure you want to delete this shift schedule?')}
        confirmText={t('common.delete', 'Delete')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default ShiftsTab
