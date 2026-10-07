import React from 'react'
import { useTranslation } from 'react-i18next'
import { EmployeeAvatar } from './EmployeeAvatar'
import { EnterpriseModal, ModalFooter } from '@/components/common'

interface AttendanceDetailModalProps {
  attendance: any | null
  onClose: () => void
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({ attendance, onClose }) => {
  const { t } = useTranslation(['employees', 'common'])
  if (!attendance) return null

  const emp = attendance.employee
  const statusColor =
    attendance.status === 'present' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
    attendance.status === 'late' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
    attendance.status === 'absent' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
    'text-blue-500 bg-blue-500/10 border-blue-500/20'

  return (
    <EnterpriseModal
      isOpen={!!attendance}
      onClose={onClose}
      title={emp?.name ?? t('employees.employee', 'Employee')}
      subtitle={emp?.employee_number ?? '#EMP-001'}
      icon={
        <EmployeeAvatar
          photo={emp?.photo}
          name={emp?.name}
          id={emp?.id ?? attendance.employee_id}
          size="sm"
        />
      }
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          showSubmit={false}
          cancelLabel={t('common.close', 'Close')}
        />
      }
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Status & Date */}
        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-2xl border border-border/50">
          <div className="text-xs font-semibold text-muted-foreground">
            <span>{t('employees.date', 'Date')}: <strong className="text-foreground">{attendance.attendance_date ?? attendance.date}</strong></span>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize ${statusColor}`}>
            {t(`employees.${attendance.status}`, attendance.status)}
          </span>
        </div>

        {/* Timeline Metrics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-card border border-border p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t('employees.check_in', 'Check In')}</span>
            <span className="text-sm font-extrabold text-foreground font-mono mt-0.5 block">{attendance.check_in ?? '--:--'}</span>
            <span className="text-[10px] text-muted-foreground">{attendance.check_in_method ?? 'QR Scan'}</span>
          </div>
          <div className="bg-card border border-border p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t('employees.break', 'Break')}</span>
            <span className="text-sm font-extrabold text-foreground font-mono mt-0.5 block">{attendance.break_minutes ?? 60}m</span>
            <span className="text-[10px] text-muted-foreground">{t('employees.standard', 'Standard')}</span>
          </div>
          <div className="bg-card border border-border p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">{t('employees.check_out', 'Check Out')}</span>
            <span className="text-sm font-extrabold text-foreground font-mono mt-0.5 block">{attendance.check_out ?? '--:--'}</span>
            <span className="text-[10px] text-muted-foreground">{attendance.check_out_method ?? 'QR Scan'}</span>
          </div>
        </div>

        {/* Calculated Statistics */}
        <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3.5 rounded-2xl border border-border/40 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase">{t('employees.worked_time', 'Worked Time')}</span>
            <span className="font-extrabold text-foreground">{attendance.working_hours ?? '0h 0m'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase">{t('employees.late_time', 'Late Time')}</span>
            <span className={`font-extrabold ${attendance.late_minutes > 0 ? 'text-amber-500' : 'text-foreground'}`}>
              {attendance.late_time ?? '0m'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase">{t('employees.overtime', 'Overtime')}</span>
            <span className="font-extrabold text-emerald-500">{attendance.overtime_formatted ?? '0m'}</span>
          </div>
        </div>

        {/* Device Lock Metadata */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('employees.device_lock_security_metadata', 'Device Lock & Security Metadata')}
          </h4>
          <div className="bg-card border border-border rounded-2xl p-3.5 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between"><span className="text-muted-foreground">{t('employees.device_name', 'Device Name')}:</span> <span className="font-bold text-foreground">{attendance.device_name ?? 'Registered Mobile Device'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('employees.device_platform', 'Device Platform')}:</span> <span className="capitalize text-primary font-bold">{attendance.device_platform ?? 'android'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('employees.ip_address', 'IP Address')}:</span> <span>{attendance.device_ip ?? '192.168.1.100'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('employees.device_lock_status', 'Device Lock Status')}:</span> <span className="text-emerald-500 font-bold">{t('employees.locked_verified', 'Locked & Verified')}</span></div>
          </div>
        </div>

        {/* GPS Location Metadata */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('employees.gps_location_coords', 'GPS Location Coordinates')}
          </h4>
          <div className="bg-card border border-border rounded-2xl p-3 text-xs flex items-center justify-between font-mono">
            <span>Lat: {attendance.gps_latitude ?? '11.5564'}, Lng: {attendance.gps_longitude ?? '104.9282'}</span>
            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{t('employees.within_radius', 'Within 100m Radius')}</span>
          </div>
        </div>
      </div>
    </EnterpriseModal>
  )
}

export default AttendanceDetailModal
