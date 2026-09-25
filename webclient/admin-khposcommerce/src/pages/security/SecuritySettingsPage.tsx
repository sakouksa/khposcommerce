import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Percent,
  Clock,
  Smartphone,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck
} from 'lucide-react'
import { securityService } from '../../services/securityService'
import { showToast } from '../../utils/toast'

export const SecuritySettingsPage: React.FC = () => {
  const { t } = useTranslation(['security', 'common'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasManagerPin, setHasManagerPin] = useState(false)

  // PIN setup modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pinCurrentPassword, setPinCurrentPassword] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  // Policy Settings state
  const [settings, setSettings] = useState({
    session_timeout_minutes: 120,
    max_active_sessions_per_user: 3,
    max_failed_attempts: 5,
    lockout_duration_minutes: 15,
    max_active_devices: 5,
    enforce_device_fingerprinting: true,
    auto_revoke_suspicious_device: false,
    require_manager_for_discount: true,
    max_cashier_discount_percent: 10,
    cashier_max_discount: 10,
    supervisor_max_discount: 25,
    manager_max_discount: 50,
    pos_require_shift_for_sale: true,
    require_manager_for_price_override: true,
    require_manager_for_refund: true,
    require_manager_for_void: true,
    audit_logging_enabled: true,
  })

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await securityService.getSettings()
      if (res.success || res.data) {
        const payload = res.data?.settings || res.settings || res.data || {}
        setSettings((prev) => ({ ...prev, ...payload }))
        setHasManagerPin(Boolean(res.data?.has_manager_pin ?? res.has_manager_pin))
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to load security settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await securityService.updateSettings(settings)
      if (res.success || res) {
        showToast.success(t('security:settings.saveSuccess', 'Security policies updated successfully'))
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to update security settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSetManagerPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError(null)

    if (newPin !== confirmPin) {
      setPinError(t('security:settings.pinMismatchError', 'New PIN and confirmation PIN do not match'))
      return
    }

    if (newPin.length < 4 || newPin.length > 8) {
      setPinError(t('security:settings.pinLengthError', 'PIN must be between 4 and 8 digits'))
      return
    }

    try {
      setPinLoading(true)
      const res = await securityService.setManagerPin({
        current_password: pinCurrentPassword,
        pin: newPin,
        pin_confirmation: confirmPin,
      })

      if (res.success || res) {
        showToast.success(t('security:settings.pinSetSuccess', 'Manager PIN updated successfully'))
        setHasManagerPin(true)
        setIsPinModalOpen(false)
        setPinCurrentPassword('')
        setNewPin('')
        setConfirmPin('')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to set manager PIN'
      setPinError(msg)
      showToast.error(msg)
    } finally {
      setPinLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs">{t('common:loading', 'Loading security settings...')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('security:settings.title', 'Security Policies')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('security:settings.subtitle', 'Configure authentication safeguards and POS authorization rules')}
          </p>
        </div>

        <button
          onClick={() => setIsPinModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all"
        >
          <KeyRound className="w-4 h-4" />
          <span>
            {hasManagerPin
              ? t('security:settings.updateManagerPin', 'Update Manager PIN')
              : t('security:settings.setupManagerPin', 'Setup Manager PIN')}
          </span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Authentication & Session Security */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-4 h-4 text-indigo-500" />
            <span>{t('security:settings.authSection', 'Authentication & Session Security')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('security:settings.sessionTimeout', 'Session Timeout (Minutes)')}
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={5}
                  max={1440}
                  value={settings.session_timeout_minutes}
                  onChange={(e) =>
                    setSettings({ ...settings, session_timeout_minutes: Number(e.target.value) })
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('security:settings.maxFailedAttempts', 'Max Failed Login Attempts')}
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={settings.max_failed_attempts}
                onChange={(e) =>
                  setSettings({ ...settings, max_failed_attempts: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('security:settings.lockoutDuration', 'Lockout Duration (Minutes)')}
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={settings.lockout_duration_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, lockout_duration_minutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('security:settings.maxActiveDevices', 'Max Active Devices Per User')}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.max_active_devices}
                  onChange={(e) =>
                    setSettings({ ...settings, max_active_devices: Number(e.target.value) })
                  }
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: POS Financial Controls & Discount Limits */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            <Percent className="w-4 h-4 text-emerald-500" />
            <span>{t('security:settings.posSection', 'POS & Financial Safeguards')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('security:settings.cashierMaxDiscount', 'Cashier Max Discount (%)')}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={settings.cashier_max_discount}
                onChange={(e) =>
                  setSettings({ ...settings, cashier_max_discount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('security:settings.supervisorMaxDiscount', 'Supervisor Max Discount (%)')}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={settings.supervisor_max_discount}
                onChange={(e) =>
                  setSettings({ ...settings, supervisor_max_discount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('security:settings.managerMaxDiscount', 'Manager Max Discount (%)')}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={settings.manager_max_discount}
                onChange={(e) =>
                  setSettings({ ...settings, manager_max_discount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pos_require_shift_for_sale}
                onChange={(e) =>
                  setSettings({ ...settings, pos_require_shift_for_sale: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('security:settings.requireShift', 'Require Active Shift/Register for Sales')}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_manager_for_refund}
                onChange={(e) =>
                  setSettings({ ...settings, require_manager_for_refund: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('security:settings.requireManagerRefund', 'Require Manager Approval for Refunds')}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_manager_for_void}
                onChange={(e) =>
                  setSettings({ ...settings, require_manager_for_void: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('security:settings.requireManagerVoid', 'Require Manager Approval to Void Sale')}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.audit_logging_enabled}
                onChange={(e) =>
                  setSettings({ ...settings, audit_logging_enabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('security:settings.auditEnabled', 'Enable Detailed Activity & Audit Logging')}
              </span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{t('security:settings.saveBtn', 'Save Security Policies')}</span>
          </button>
        </div>
      </form>

      {/* Setup Manager PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('security:settings.managerPinTitle', 'Manager Security PIN')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('security:settings.managerPinDesc', 'Used to authorize sensitive actions and overrides at POS registers')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSetManagerPin} className="p-5 space-y-4">
              {pinError && (
                <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800/50 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('security:settings.currentPassword', 'Current Password')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={pinCurrentPassword}
                    onChange={(e) => setPinCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('security:settings.newPin', 'New PIN (4-8 digits)')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 text-base font-mono tracking-widest bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('security:settings.confirmPin', 'Confirm New PIN')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 text-base font-mono tracking-widest bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {t('common:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={pinLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  {pinLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('security:settings.savePinBtn', 'Save PIN')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default SecuritySettingsPage
