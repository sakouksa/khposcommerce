import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle2, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import Spinner from '@/components/ui/Spinner'

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t('auth.reset_failed', 'Failed to send reset email. Please check your email address.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 transition-all">
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2C376B] dark:text-blue-400 mb-1 shadow-inner">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
          {t('auth.reset_password_title', 'Reset Password')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('auth.reset_password_subtitle', "Enter your registered email and we'll send you a password recovery link")}
        </p>
      </div>

      {sent ? (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
            {t('auth.reset_link_sent', 'Reset link sent successfully!')}
          </h3>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            {t('auth.reset_link_desc', 'If an account exists for {{email}}, you will receive a password reset link shortly.', { email })}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200/80 dark:border-rose-900/60 flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {t('auth.email_label', 'Email Address')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#2C376B] dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#1D2549] via-[#242D5A] to-[#2C376B] hover:from-[#151b36] hover:to-[#202952] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('auth.send_reset_link', 'Send Recovery Link')}</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('auth.back_to_login', 'Back to Sign In')}</span>
        </Link>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
