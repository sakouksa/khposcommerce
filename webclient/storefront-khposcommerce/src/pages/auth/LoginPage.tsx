import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores'
import { useGoogleAuth } from '@/hooks'
import authService from '@/services/authService'
import Spinner from '@/components/ui/Spinner'

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const redirectPath = (location.state as any)?.from || '/account'
  const promptMessage = (location.state as any)?.message || null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real Google OAuth Hook
  const {
    loginWithGoogle,
    googleLoading,
    googleError,
  } = useGoogleAuth({ onSuccessRedirect: redirectPath })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await authService.login({ email, password })
      const data = res.data || res
      login(data.access_token, data.user, data.customer)
      navigate(redirectPath)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t('auth.invalid_credentials', 'Invalid email or password. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-7 sm:p-9 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all">
      {/* ── Title ────────────────────────────────────────────────────── */}
      <h1 className="text-2xl sm:text-[25px] font-bold text-center text-slate-900 dark:text-white tracking-tight mb-6">
        {t('auth.login_title', 'Login to your account.')}
      </h1>

      {/* Info / Redirect Prompt Alert */}
      {promptMessage && !error && !googleError && (
        <div className="mb-4 p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-semibold border border-orange-200/80 dark:border-orange-900/60 flex items-center gap-2.5 shadow-2xs">
          <Info className="w-4 h-4 text-[#f58220] flex-shrink-0" />
          <span>{promptMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {(error || googleError) && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
          <span>{error || googleError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Number or Email */}
        <div>
          <input
            type="text"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.phone_or_email', 'Phone Number Or Email')}
            className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password_label', 'Password')}
            className="w-full h-11 pl-4 pr-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#f58220] focus:ring-[#f58220] cursor-pointer accent-[#f58220]"
            />
            <span>{t('auth.remember_me', 'Remember Me')}</span>
          </label>

          <Link
            to="/auth/forgot-password"
            className="text-slate-500 hover:text-[#f58220] transition-colors"
          >
            {t('auth.forgot_password', 'Forgot password?')}
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 rounded-lg bg-[#f58220] hover:bg-[#e07110] text-white text-sm font-bold shadow-xs transition-colors active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-70 mt-2"
        >
          {loading ? <Spinner size="sm" /> : t('auth.signin_btn', 'Login')}
        </button>
      </form>

      {/* ── Or Login With ────────────────────────────────────────────── */}
      <div className="my-6">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 dark:text-slate-500 select-none">
            {t('auth.or_login_with', 'Or Login With')}
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Circular Google Button */}
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={googleLoading || loading}
            title={t('auth.continue_with_google', 'Login with Google')}
            className="w-10 h-10 rounded-full bg-[#EA4335] hover:bg-[#d93025] active:scale-95 text-white flex items-center justify-center shadow-xs transition-transform cursor-pointer disabled:opacity-70"
          >
            {googleLoading ? (
              <Spinner size="sm" />
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Don't have an account? Register Now ──────────────────────── */}
      <div className="text-center text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
        <p>{t('auth.no_account', 'Dont have an account?')}</p>
        <Link
          to="/auth/register"
          className="text-[#f58220] hover:text-[#d4690d] font-bold inline-block hover:underline"
        >
          {t('auth.register_now', 'Register Now')}
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
