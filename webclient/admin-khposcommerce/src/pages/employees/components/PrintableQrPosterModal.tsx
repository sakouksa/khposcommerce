import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Printer, Download, ShieldCheck, MapPin, Wifi, Smartphone, Sparkles, Building2, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'

interface PrintableQrPosterModalProps {
  open: boolean
  onClose: () => void
  branchName?: string
  shiftName?: string
  qrToken: string
  radiusMeters?: number
  wifiSsid?: string
}

export const PrintableQrPosterModal: React.FC<PrintableQrPosterModalProps> = ({
  open,
  onClose,
  branchName = 'Headquarters (Main Branch)',
  shiftName = 'All Active Shifts (08:00 - 17:00)',
  qrToken,
  radiusMeters = 50,
  wifiSsid = 'COMPANY_STAFF_5G',
}) => {
  const { t } = useTranslation(['employees', 'common'])
  const toast = useToast()
  const posterRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    qrToken || 'COMPANY_STATIC_ATTENDANCE_STAND_HQ'
  )}`

  const handlePrint = () => {
    sound.playClick()
    window.print()
  }

  const handleDownload = async () => {
    sound.playClick()
    try {
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `attendance_poster_${branchName.replace(/\s+/g, '_').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success(t('employees.poster_download_success', 'QR Poster downloaded successfully'))
    } catch {
      toast.error(t('employees.poster_download_error', 'Failed to download QR Poster'))
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="bg-card w-full max-w-xl border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center max-h-[95vh]"
        >
          {/* Top Bar Action */}
          <div className="w-full flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Printer size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground">
                  {t('employees.attendance_poster_title', 'Print-Ready Attendance Standee')}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {t('employees.attendance_poster_desc', 'Zero Hardware Cost • Multi-Factor Geofencing')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Printer size={14} />
                <span>{t('employees.print_a4_standee', 'Print A4 / Standee')}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl border border-border/60 transition-colors cursor-pointer"
              >
                <Download size={14} /> PNG
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted ml-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Poster Canvas Area */}
          <div className="p-6 w-full overflow-y-auto flex justify-center bg-slate-100 dark:bg-slate-950/60">
            <div
              ref={posterRef}
              id="printable-attendance-poster"
              className="w-full max-w-[420px] bg-white text-slate-900 rounded-3xl p-7 shadow-xl border-4 border-slate-900/10 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

              {/* Company Logo / Header */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                  POS
                </div>
                <div className="text-left">
                  <h2 className="font-black text-sm tracking-tight text-slate-900">ENTERPRISE ERP & POS</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attendance Checkpoint</p>
                </div>
              </div>

              {/* Branch & Shift Badge */}
              <div className="mt-4 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                <Building2 size={13} className="text-blue-600" />
                <span>{branchName}</span>
              </div>

              {/* Title in Khmer & English */}
              <div className="mt-3 space-y-0.5">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {t('employees.scan_attendance_title', 'Scan Attendance Check-In')}
                </h1>
                <p className="text-xs font-extrabold text-indigo-600">
                  {t('employees.scan_to_checkin_out', 'Scan to Check In / Out')}
                </p>
              </div>

              {/* Crisp Sharp QR Container */}
              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col items-center">
                <img
                  src={qrImageUrl}
                  alt="Official Attendance QR Code"
                  className="w-56 h-56 object-contain rounded-xl bg-white p-2 shadow-xs"
                />
                <div className="mt-2 text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" />
                  <span>TOKEN: {qrToken.slice(0, 16)}...</span>
                </div>
              </div>

              {/* Step by Step Instructions in Khmer & English */}
              <div className="w-full mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left space-y-2">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {t('employees.how_to_scan', 'Instructions / How to Scan')}:
                </p>
                <div className="flex items-start gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="text-slate-700 font-medium">
                    {t('employees.scan_step_1', 'Open Employee Mobile App and tap Scan Attendance')}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="text-slate-700 font-medium">
                    {t('employees.scan_step_2', 'Turn on GPS or connect to Wi-Fi ({{wifi}})', { wifi: wifiSsid })}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="text-slate-700 font-medium">
                    {t('employees.scan_step_3', 'Point camera to this QR code to record attendance immediately')}
                  </span>
                </div>
              </div>

              {/* Multi-Factor Security Guarantee Badges */}
              <div className="w-full grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center">
                <div className="p-1.5 bg-blue-50/80 rounded-xl text-blue-700 space-y-0.5">
                  <MapPin size={12} className="mx-auto" />
                  <p className="text-[9px] font-extrabold">GPS Geofence</p>
                  <p className="text-[8px] text-blue-500 font-mono">Radius &lt;{radiusMeters}m</p>
                </div>
                <div className="p-1.5 bg-emerald-50/80 rounded-xl text-emerald-700 space-y-0.5">
                  <Wifi size={12} className="mx-auto" />
                  <p className="text-[9px] font-extrabold">Office Wi-Fi</p>
                  <p className="text-[8px] text-emerald-500 font-mono">SSID Bound</p>
                </div>
                <div className="p-1.5 bg-purple-50/80 rounded-xl text-purple-700 space-y-0.5">
                  <Smartphone size={12} className="mx-auto" />
                  <p className="text-[9px] font-extrabold">Device ID</p>
                  <p className="text-[8px] text-purple-500 font-mono">Single Account</p>
                </div>
              </div>

              {/* Bottom Footer Note */}
              <div className="mt-3 flex items-center gap-1 text-[9px] font-bold text-slate-400">
                <ShieldCheck size={11} className="text-emerald-500" />
                <span>{t('employees.anti_cheat_protected', 'Anti-Cheat Protected • Remote photo scanning prohibited')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PrintableQrPosterModal
