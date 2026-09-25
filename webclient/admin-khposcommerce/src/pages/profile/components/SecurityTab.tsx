import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, ShieldAlert, Monitor, LogOut, CheckCircle2, Lock, ShieldCheck, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const passwordSchema = z.object({
  current_password: z.string().min(1, 'security_tab.current_password_required'),
  new_password: z.string().min(8, 'security_tab.password_length'),
  new_password_confirmation: z.string().min(1, 'security_tab.confirm_password_required'),
}).refine((data) => data.new_password === data.new_password_confirmation, {
  message: 'security_tab.password_mismatch',
  path: ['new_password_confirmation'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface ActiveSession {
  id: number
  ip_address: string
  browser: string
  device: string
  platform: string
  last_activity: string
  is_current: boolean
}

interface SecurityTabProps {
  sessions: ActiveSession[]
  onChangePassword: (data: PasswordFormData) => void
  isChangingPassword: boolean
  onLogoutOtherDevices: () => void
  isLoggingOutDevices: boolean
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  sessions = [],
  onChangePassword,
  onLogoutOtherDevices,
  isChangingPassword,
  isLoggingOutDevices,
}) => {
  const { t } = useTranslation('profile')
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const newPassword = watch('new_password', '')
  const [strengthScore, setStrengthScore] = useState(0)

  useEffect(() => {
    let score = 0
    if (newPassword.length >= 8) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[a-z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1
    setStrengthScore(score)
  }, [newPassword])

  const getStrengthInfo = () => {
    if (strengthScore <= 1) return { label: t('security_tab.strength_too_weak', 'Too Weak'), color: 'bg-red-500', text: 'text-red-500' }
    if (strengthScore === 2) return { label: t('security_tab.strength_weak', 'Weak'), color: 'bg-orange-500', text: 'text-orange-500' }
    if (strengthScore === 3) return { label: t('security_tab.strength_fair', 'Fair'), color: 'bg-amber-500', text: 'text-amber-500' }
    if (strengthScore === 4) return { label: t('security_tab.strength_strong', 'Strong'), color: 'bg-blue-500', text: 'text-blue-500' }
    return { label: t('security_tab.strength_very_strong', 'Very Strong'), color: 'bg-emerald-500', text: 'text-emerald-500' }
  }

  const strength = getStrengthInfo()

  const onSubmitPassword = (data: PasswordFormData) => {
    onChangePassword(data)
    reset()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
      {/* Change Password Card */}
      <form
        onSubmit={handleSubmit(onSubmitPassword)}
        className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6 h-fit"
      >
        <div className="pb-4 border-b border-border/50">
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <KeyRound size={18} className="text-primary" />
            <span>{t('security_tab.credentials_title', 'Update Security Credentials')}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('security_tab.sessions_subtitle', 'Manage your security credentials and active authenticated devices.')}
          </p>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={13} className="text-primary" />
              <span>{t('security_tab.current_password', 'Current Password')}</span>
            </label>
            <input
              type="password"
              {...register('current_password')}
              placeholder={t('security_tab.current_pwd_placeholder', 'Enter your current password')}
              className={`w-full px-4 py-2.5 rounded-2xl border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60 ${
                errors.current_password ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
              }`}
            />
            {errors.current_password && (
              <p className="text-[11px] text-red-500 font-bold mt-1">{t(errors.current_password.message || '')}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={13} className="text-primary" />
              <span>{t('security_tab.new_password', 'New Password')}</span>
            </label>
            <input
              type="password"
              {...register('new_password')}
              placeholder={t('security_tab.new_pwd_placeholder', 'Enter new password (min. 8 characters)')}
              className={`w-full px-4 py-2.5 rounded-2xl border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60 ${
                errors.new_password ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
              }`}
            />
            {errors.new_password && (
              <p className="text-[11px] text-red-500 font-bold mt-1">{t(errors.new_password.message || '')}</p>
            )}

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{t('security_tab.strength', 'Password Strength')}:</span>
                  <span className={`font-extrabold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        level <= strengthScore ? strength.color : 'bg-muted-foreground/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={13} className="text-primary" />
              <span>{t('security_tab.confirm_password', 'Confirm New Password')}</span>
            </label>
            <input
              type="password"
              {...register('new_password_confirmation')}
              placeholder={t('security_tab.confirm_pwd_placeholder', 'Confirm new password again')}
              className={`w-full px-4 py-2.5 rounded-2xl border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60 ${
                errors.new_password_confirmation ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
              }`}
            />
            {errors.new_password_confirmation && (
              <p className="text-[11px] text-red-500 font-bold mt-1">{t(errors.new_password_confirmation.message || '')}</p>
            )}
          </div>
        </div>

        {/* Change Password Submit */}
        <div className="pt-4 border-t border-border/50 flex justify-end">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-2xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <KeyRound size={15} />
            <span>{isChangingPassword ? t('security_tab.changing', 'Updating...') : t('security_tab.change_password_btn', 'Change Password')}</span>
          </button>
        </div>
      </form>

      {/* Active Sessions Manager Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6 flex flex-col justify-between">
        <div>
          <div className="pb-4 border-b border-border/50">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <ShieldAlert size={18} className="text-primary" />
              <span>{t('security_tab.sessions_title', 'Active Sessions Manager')}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('security_tab.sessions_subtitle', 'These are the devices currently authenticated to your account.')}
            </p>
          </div>

          <div className="pt-4 space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3.5 rounded-2xl bg-muted/20 border border-border/60 flex items-center gap-3"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Monitor size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground truncate">{sess.browser} on {sess.platform}</span>
                    {sess.is_current && (
                      <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {t('security_tab.current_session', 'Current')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    IP: {sess.ip_address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={onLogoutOtherDevices}
            disabled={isLoggingOutDevices}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-extrabold rounded-2xl text-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <LogOut size={14} />
            <span>{isLoggingOutDevices ? t('security_tab.revoking', 'Revoking...') : t('security_tab.revoke_other_sessions', 'Revoke All Other Sessions')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SecurityTab
