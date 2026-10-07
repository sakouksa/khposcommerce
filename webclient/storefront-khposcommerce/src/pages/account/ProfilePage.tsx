import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Camera,
  KeyRound,
} from 'lucide-react'
import { useAuthStore } from '@/stores'
import api from '@/lib/api'
import Spinner from '@/components/ui/Spinner'

export const ProfilePage: React.FC = () => {
  const { customer, user, updateCustomer } = useAuthStore()

  // Profile Form States
  const [name, setName] = useState(customer?.name || user?.name || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await api.put('/auth/profile', { name, phone })
      updateCustomer({ name, phone })
      setMessage({ type: 'success', text: 'Your personal information has been updated successfully.' })
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMessage(null)

    if (password !== passwordConfirmation) {
      setPassMessage({ type: 'error', text: 'New password and confirmation do not match.' })
      return
    }

    if (password.length < 8) {
      setPassMessage({ type: 'error', text: 'Password must be at least 8 characters long.' })
      return
    }

    setPassLoading(true)

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      })
      setPassMessage({ type: 'success', text: 'Password changed successfully.' })
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
    } catch (err: any) {
      setPassMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password. Verify your current password.',
      })
    } finally {
      setPassLoading(false)
    }
  }

  const displayName = customer?.name || user?.name || 'Customer'
  const displayEmail = customer?.email || user?.email || ''
  const avatarUrl = customer?.photo

  return (
    <div className="space-y-6">
      {/* ─── Card 1: Personal Information ──────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#f58220]/10 text-[#f58220] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Personal Information
            </h2>
            <p className="text-xs text-slate-400">Update your public profile and contact details</p>
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`mb-6 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#f58220]/40 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f58220] to-[#e07110] text-white flex items-center justify-center text-2xl font-bold shadow-xs">
                  {displayName[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Profile Photo</div>
              <p className="text-[11px] text-slate-400">
                Synced securely from your connected Google Account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={displayEmail}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none select-none"
                />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number (For Delivery & Contact)
            </label>
            <div className="relative max-w-sm">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 012 345 678"
                className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#f58220] hover:bg-[#e07110] active:scale-98 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? <Spinner size="sm" /> : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Card 2: Password & Security ───────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Change Account Password
            </h2>
            <p className="text-xs text-slate-400">Ensure your account uses a strong, unique password</p>
          </div>
        </div>

        {/* Feedback Alert */}
        {passMessage && (
          <div
            className={`mb-6 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              passMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
            }`}
          >
            {passMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            )}
            <span>{passMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label={showNewPass ? 'Hide password' : 'Show password'}
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-70"
            >
              {passLoading ? <Spinner size="sm" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
