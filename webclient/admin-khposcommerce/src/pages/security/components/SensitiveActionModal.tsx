import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Lock,
  UserCheck
} from 'lucide-react'
import { securityService } from '@/services/securityService'
import { showToast } from '@/utils/toast'

export type SecurityLevel = 'confirm' | 'reason' | 'pin' | 'manager_approval'

interface SensitiveActionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data?: any) => void
  level?: SecurityLevel
  title?: string
  subtitle?: string
  actionName: string
  actionPayload?: any
  confirmButtonText?: string
  isDestructive?: boolean
  requireReason?: boolean
}

export const SensitiveActionModal: React.FC<SensitiveActionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  level = 'confirm',
  title,
  subtitle,
  actionName,
  actionPayload,
  confirmButtonText,
  isDestructive = false,
  requireReason = false,
}) => {
  const { t } = useTranslation(['security', 'common'])
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [pin, setPin] = useState('')
  const [managerUsername, setManagerUsername] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (level === 'reason' && !reason.trim()) {
      setErrorMsg(t('security:approval.reasonPlaceholder', 'Please provide a valid reason.'))
      return
    }

    if ((level === 'pin' || level === 'manager_approval') && !pin.trim()) {
      setErrorMsg(t('security:approval.enterPin', 'Please enter a 4-8 digit security PIN.'))
      return
    }

    try {
      setLoading(true)

      if (level === 'manager_approval') {
        const res = await securityService.verifyManagerPin({
          pin,
          manager_username: managerUsername.trim() || undefined,
          action: actionName,
          notes: reason.trim() || undefined,
          payload: actionPayload,
        })

        if (res.success || res.data) {
          showToast.success(t('security:approval.approvalSuccess', 'Manager approval granted.'))
          onSuccess(res.data || res)
          onClose()
        } else {
          setErrorMsg(res.message || t('security:approval.approvalFailed', 'Manager PIN verification failed.'))
        }
      } else {
        onSuccess({ reason, pin })
        onClose()
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('security:approval.approvalFailed', 'Authorization failed.')
      setErrorMsg(msg)
      showToast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const getModalHeader = () => {
    switch (level) {
      case 'manager_approval':
        return {
          icon: <ShieldAlert className="w-6 h-6 text-amber-500" />,
          title: title || t('security:approval.title', 'Manager Authorization Required'),
          desc: subtitle || t('security:approval.subtitle', 'This sensitive operation requires manager approval.')
        }
      case 'pin':
        return {
          icon: <KeyRound className="w-6 h-6 text-indigo-500" />,
          title: title || t('security:settings.managerPinTitle', 'Security PIN Required'),
          desc: subtitle || t('security:settings.managerPinDesc', 'Enter your security PIN to authorize this action.')
        }
      case 'reason':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          title: title || t('common:confirm', 'Confirmation & Reason Required'),
          desc: subtitle || t('common:confirmMessage', 'Please provide a clear justification for this action.')
        }
      default:
        return {
          icon: isDestructive ? <AlertTriangle className="w-6 h-6 text-rose-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          title: title || t('common:confirmTitle', 'Confirm Action'),
          desc: subtitle || t('common:confirmMessage', 'Are you sure you want to proceed?')
        }
    }
  }

  const header = getModalHeader()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              {header.icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {header.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {header.desc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800/50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {level === 'manager_approval' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t('security:approval.managerUsername', 'Manager Username (Optional)')}
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={managerUsername}
                  onChange={(e) => setManagerUsername(e.target.value)}
                  placeholder="admin or manager username"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white outline-none transition-all"
                />
              </div>
            </div>
          )}

          {(level === 'pin' || level === 'manager_approval') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t('security:approval.enterPin', 'Manager Security PIN')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={8}
                  autoFocus
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-9 pr-3 py-2 text-base tracking-widest font-mono bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:text-white outline-none transition-all"
                />
              </div>
            </div>
          )}

          {(level === 'reason' || level === 'manager_approval') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t('security:approval.reason', 'Reason')} {level === 'reason' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('security:approval.reasonPlaceholder', 'Specify reason for authorization...')}
                className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all resize-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              {t('security:approval.cancelBtn', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
              }`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{confirmButtonText || t('security:approval.confirmBtn', 'Authorize Action')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default SensitiveActionModal
