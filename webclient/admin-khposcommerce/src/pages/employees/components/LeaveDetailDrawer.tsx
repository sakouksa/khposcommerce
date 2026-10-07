import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
  StatusBadge,
} from '@/components/common'
import { EmployeeAvatar } from './EmployeeAvatar'
import {
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Check,
  X,
  Building2,
  Briefcase,
} from 'lucide-react'
import { formatDateTime } from '@/utils/formatters'

interface LeaveDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  record: any | null
  onApprove?: (id: number | string) => void
  onReject?: (record: any) => void
  isApproving?: boolean
}

export const LeaveDetailDrawer: React.FC<LeaveDetailDrawerProps> = ({
  isOpen,
  onClose,
  record,
  onApprove,
  onReject,
  isApproving = false,
}) => {
  const { t, i18n } = useTranslation(['employees', 'common'])
  const isKm = i18n.language === 'km' || i18n.language?.startsWith('km')

  if (!record) return null

  const daysUnit = t('employees.days_unit', 'days')
  const totalDays = record.total_days ?? 1

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr.split('T')[0] || '—'
      if (isKm) {
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

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'annual':
        return t('employees.annual_leave', 'Annual Leave')
      case 'sick':
        return t('employees.sick_leave', 'Medical Leave')
      case 'special':
        return t('employees.special_leave', 'Casual Leave')
      case 'maternity':
        return t('employees.maternity_leave', 'Maternity Leave')
      case 'unpaid':
        return t('employees.unpaid_leave', 'Unpaid Leave')
      default:
        return type || t('employees.general_leave', 'General Leave')
    }
  }

  const isPending = record.status === 'pending'

  return (
    <DetailDrawer isOpen={isOpen} onClose={onClose} size="lg">
      {/* ─── Drawer Header ─── */}
      <DetailDrawerHeader
        title={
          <div className="flex items-center gap-3">
            <EmployeeAvatar
              name={record.employee?.name || t('employees.staff_fallback', 'Staff')}
              photo={record.employee?.photo}
              size={44}
            />
            <div>
              <h3 className="text-base font-bold text-foreground">
                {record.employee?.name || t('employees.employee_num_fallback', `Employee #${record.employee_id}`, { id: record.employee_id })}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>{record.employee?.department?.name || t('employees.departments', 'Department')}</span>
                <span>•</span>
                <span>{record.employee?.position?.name || t('employees.positions', 'Position')}</span>
              </p>
            </div>
          </div>
        }
        statusBadge={
          <StatusBadge
            status={
              record.status === 'approved'
                ? 'active'
                : record.status === 'rejected'
                ? 'inactive'
                : 'pending'
            }
            customLabel={
              record.status === 'approved'
                ? t('employees.approved', 'Approved')
                : record.status === 'rejected'
                ? t('employees.rejected', 'Rejected')
                : t('employees.pending', 'Pending Approval')
            }
          />
        }
      />

      {/* ─── Drawer Body ─── */}
      <DetailDrawerBody>
        <div className="space-y-4">
          {/* 4 Quick Stat Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Leave Type */}
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                {t('employees.leave_type', 'Leave Type')}
              </span>
              <span className="text-xs font-extrabold text-foreground block truncate">
                {getLeaveTypeLabel(record.leave_type)}
              </span>
            </div>

            {/* 2. Total Days */}
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                {t('employees.no_of_days', 'Total Days')}
              </span>
              <span className="text-sm font-extrabold text-foreground block font-mono">
                {totalDays} {daysUnit}
              </span>
            </div>

            {/* 3. Start Date */}
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                {t('employees.start_date', 'From')}
              </span>
              <span className="text-xs font-bold text-foreground block font-mono truncate">
                {formatDateDisplay(record.start_date)}
              </span>
            </div>

            {/* 4. End Date */}
            <div className="bg-muted/40 border border-border/70 rounded-xl p-3 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                {t('employees.end_date', 'To')}
              </span>
              <span className="text-xs font-bold text-foreground block font-mono truncate">
                {formatDateDisplay(record.end_date)}
              </span>
            </div>
          </div>

          {/* Leave Request Information Card */}
          <DetailDrawerCard
            title={t('employees.leave_request_details', 'Request Information')}
            icon={<CalendarDays size={16} />}
          >
            <DetailDrawerRow
              label={t('employees.leave_type', 'Leave Type')}
              value={
                <span className="font-bold text-foreground">
                  {getLeaveTypeLabel(record.leave_type)}
                </span>
              }
            />
            <DetailDrawerRow
              label={t('employees.date_range', 'Date Range')}
              value={
                <span className="font-mono text-xs">
                  {formatDateDisplay(record.start_date)} → {formatDateDisplay(record.end_date)} ({totalDays} {daysUnit})
                </span>
              }
            />
            <DetailDrawerRow
              label={t('employees.reason', 'Reason / Purpose')}
              value={
                record.reason ? (
                  <p className="text-xs text-foreground bg-muted/30 p-2 rounded-lg border border-border/50 whitespace-pre-wrap leading-relaxed">
                    {record.reason}
                  </p>
                ) : (
                  <span className="text-muted-foreground text-xs italic">{t('common.none', 'None specified')}</span>
                )
              }
            />
          </DetailDrawerCard>

          {/* Approval & Review Notes Card */}
          <DetailDrawerCard
            title={t('employees.approval_status', 'Review & Decision')}
            icon={<UserCheck size={16} />}
          >
            <DetailDrawerRow
              label={t('employees.approval_decision', 'Decision')}
              value={
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    record.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : record.status === 'rejected'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {record.status === 'approved' ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>{t('employees.approved', 'Approved')}</span>
                    </>
                  ) : record.status === 'rejected' ? (
                    <>
                      <XCircle size={13} />
                      <span>{t('employees.rejected', 'Rejected')}</span>
                    </>
                  ) : (
                    <>
                      <Clock size={13} />
                      <span>{t('employees.pending_review', 'Pending Review')}</span>
                    </>
                  )}
                </span>
              }
            />
            {record.manager_notes && (
              <DetailDrawerRow
                label={t('employees.manager_notes', 'Manager Notes')}
                value={
                  <p className="text-xs text-foreground bg-muted/30 p-2 rounded-lg border border-border/50 whitespace-pre-wrap leading-relaxed">
                    {record.manager_notes}
                  </p>
                }
              />
            )}
            {record.approver && (
              <DetailDrawerRow
                label={t('employees.reviewed_by', 'Reviewed By')}
                value={record.approver?.name || record.approver_name || t('employees.manager_role_fallback', 'HR Manager')}
              />
            )}
          </DetailDrawerCard>

          {/* Audit Metadata Card */}
          <DetailDrawerCard
            title={t('employees.audit_trail', 'Audit Information')}
            icon={<Clock size={16} />}
          >
            <DetailDrawerRow
              label={t('common.created_at', 'Requested At')}
              value={
                record.created_at ? (
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDateTime(record.created_at)}
                  </span>
                ) : '—'
              }
            />
            {record.updated_at && (
              <DetailDrawerRow
                label={t('common.updated_at', 'Last Updated')}
                value={
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDateTime(record.updated_at)}
                  </span>
                }
              />
            )}
          </DetailDrawerCard>
        </div>
      </DetailDrawerBody>

      {/* ─── Drawer Footer ─── */}
      <DetailDrawerFooter onClose={onClose}>
        {isPending && onApprove && onReject && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isApproving}
              onClick={() => onApprove(record.id)}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Check size={14} />
              <span>{t('employees.approve', 'Approve')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onReject(record)
              }}
              className="h-9 px-3.5 rounded-xl border border-rose-300 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <X size={14} />
              <span>{t('employees.reject', 'Reject')}</span>
            </button>
          </div>
        )}
      </DetailDrawerFooter>
    </DetailDrawer>
  )
}

export default LeaveDetailDrawer
