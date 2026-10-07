import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores'
import { useGoogleAuth } from '@/hooks'
import authService from '@/services/authService'
import Spinner from '@/components/ui/Spinner'

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real Google OAuth Hook
  const {
    loginWithGoogle,
    googleLoading,
    googleError,
  } = useGoogleAuth({ onSuccessRedirect: '/account' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.password_confirmation) {
      setError(t('auth.passwords_do_not_match', 'Passwords do not match'))
      return
    }

    if (!agreeTerms) {
      setError(t('auth.must_agree_terms', 'Please agree to terms & conditions'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await authService.register(formData)
      const data = res.data || res
      login(data.access_token, data.user, data.customer)
      navigate('/account')
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t('auth.registration_failed', 'Registration failed. Please try another email.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-7 sm:p-9 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all">
      {/* ── Title ────────────────────────────────────────────────────── */}
      <h1 className="text-2xl sm:text-[25px] font-bold text-center text-slate-900 dark:text-white tracking-tight mb-6">
        {t('auth.create_account', 'Create your account.')}
      </h1>

      {/* Error Alert */}
      {(error || googleError) && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
          <span>{error || googleError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder={t('auth.full_name', 'Full Name')}
            className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
          />
        </div>

        {/* Email Address */}
        <div>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder={t('auth.email_label', 'Email Address')}
            className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
          />
        </div>

        {/* Phone Number */}
        <div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t('auth.phone_number', 'Phone Number (Optional)')}
            className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
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

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="password_confirmation"
            required
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder={t('auth.confirm_password', 'Confirm Password')}
            className="w-full h-11 pl-4 pr-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
          <input
            id="agree-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-[#f58220] focus:ring-[#f58220] cursor-pointer accent-[#f58220]"
          />
          <label htmlFor="agree-terms" className="cursor-pointer select-none leading-normal">
            {t('auth.agree_terms', 'I agree to the Terms of Service & Privacy Policy')}
          </label>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[#f58220] hover:bg-[#e07110] text-white text-sm font-bold shadow-xs transition-colors active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-70 mt-2"
        >
          {loading ? <Spinner size="sm" /> : t('auth.register_btn', 'Create Account')}
        </button>
      </form>

      {/* ── Or Register With ─────────────────────────────────────────── */}
      <div className="my-6">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 dark:text-slate-500 select-none">
            {t('auth.or_login_with', 'Or Register With')}
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Circular Google Button */}
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={googleLoading || loading}
            title={t('auth.continue_with_google', 'Register with Google')}
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

      {/* ── Already have an account? Sign In ─────────────────────────── */}
      <div className="text-center text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
        <p>{t('auth.already_have_account', 'Already have an account?')}</p>
        <Link
          to="/auth/login"
          className="text-[#f58220] hover:text-[#d4690d] font-bold inline-block hover:underline"
        >
          {t('auth.signin_now', 'Sign In')}
        </Link>
      </div>
    </div>
  )
}

export default RegisterPage
