import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Store,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  Headphones,
  FileText,
  Shield,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Package,
  ShoppingCart,
  BarChart3,
  Building2,
  Users,
  CreditCard,
  X,
  KeyRound,
  ChevronDown,
  Check,
  AlertTriangle,
  Info,
  Globe,
  LogIn,
  Send,
  RefreshCw,
  Mail,
  Key,
  Clock
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useCompanyStore } from '@/stores/companyStore'
import { BrandLogo } from '@/components/common/BrandLogo'
import LanguageDropdown from '@/components/layout/LanguageDropdown'
import ThemeSwitcher from '@/components/layout/ThemeSwitcher'
import { authService } from '@/services/authService'

// ─── Pure Vector SVG Country Flag Component ───────────────────────────────────
const CountryFlagIcon: React.FC<{ code: string; className?: string }> = ({ code, className = 'w-5 h-3.5' }) => {
  switch (code) {
    case 'km':
      return (
        <svg viewBox="0 0 640 480" className={`rounded-sm object-cover shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50 ${className}`}>
          <rect width="640" height="480" fill="#003893" />
          <rect y="120" width="640" height="240" fill="#E00025" />
          <g fill="#FFFFFF">
            <path d="M320 160 L300 200 L308 200 L308 320 L332 320 L332 200 L340 200 Z" />
            <path d="M260 210 L248 240 L254 240 L254 320 L274 320 L274 240 L280 240 Z" />
            <path d="M380 210 L368 240 L374 240 L374 320 L394 320 L394 240 L400 240 Z" />
            <rect x="220" y="300" width="200" height="20" />
            <rect x="230" y="280" width="180" height="20" />
            <rect x="240" y="260" width="160" height="20" />
          </g>
        </svg>
      )
    case 'en':
      return (
        <svg viewBox="0 0 640 480" className={`rounded-sm object-cover shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50 ${className}`}>
          <rect width="640" height="480" fill="#BB133E" />
          <path d="M0 36.9h640M0 110.8h640M0 184.6h640M0 258.5h640M0 332.3h640M0 406.2h640" stroke="#FFF" strokeWidth="36.9" />
          <rect width="256" height="258.5" fill="#002147" />
          <circle cx="64" cy="64" r="10" fill="#FFF" />
          <circle cx="128" cy="64" r="10" fill="#FFF" />
          <circle cx="192" cy="64" r="10" fill="#FFF" />
          <circle cx="96" cy="128" r="10" fill="#FFF" />
          <circle cx="160" cy="128" r="10" fill="#FFF" />
          <circle cx="64" cy="192" r="10" fill="#FFF" />
          <circle cx="128" cy="192" r="10" fill="#FFF" />
          <circle cx="192" cy="192" r="10" fill="#FFF" />
        </svg>
      )
    case 'th':
      return (
        <svg viewBox="0 0 640 480" className={`rounded-sm object-cover shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50 ${className}`}>
          <rect width="640" height="480" fill="#A51931" />
          <rect y="80" width="640" height="320" fill="#F4F5F8" />
          <rect y="160" width="640" height="160" fill="#2D2A4A" />
        </svg>
      )
    case 'vi':
      return (
        <svg viewBox="0 0 640 480" className={`rounded-sm object-cover shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50 ${className}`}>
          <rect width="640" height="480" fill="#DA251D" />
          <polygon fill="#FFFF00" points="320,120 348,208 440,208 366,262 394,350 320,296 246,350 274,262 200,208 292,208" />
        </svg>
      )
    case 'zh':
      return (
        <svg viewBox="0 0 640 480" className={`rounded-sm object-cover shadow-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50 ${className}`}>
          <rect width="640" height="480" fill="#DE2910" />
          <polygon fill="#FFDE00" points="100,60 115,105 160,105 124,132 138,177 100,150 62,177 76,132 40,105 85,105" />
        </svg>
      )
    default:
      return <Globe className={className} />
  }
}

// ─── Supported Languages Configuration ───────────────────────────────────────
const LANGUAGES = [
  { code: 'km', name: 'Khmer', label: 'ភាសាខ្មែរ' },
  { code: 'en', name: 'English', label: 'English' },
] as const

type LanguageCode = (typeof LANGUAGES)[number]['code']

// ─── Form Validation Schema ──────────────────────────────────────────────────
const schema = z.object({
  username: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, 'identifierRequired')
        .min(2, 'identifierMinLength')
    ),
  password: z
    .string()
    .min(1, 'passwordRequired')
    .min(4, 'passwordMinLength'),
  remember: z.boolean().optional(),
})

type LoginForm = z.infer<typeof schema>

const LoginPage: React.FC = () => {
  const { t } = useTranslation(['auth', 'common', 'errors'])
  const navigate = useNavigate()

  const { setAuth, darkMode } = useAuthStore()
  const { themeMode, language, setLanguage, updateThemeMode } = useThemeStore()
  const { branding, fetchBranding } = useCompanyStore()

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  const [showPassword, setShowPassword] = useState(false)
  const [capsLockActive, setCapsLockActive] = useState(false)

  // Dropdown toggles
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)

  // Login execution state
  const [loginProgress, setLoginProgress] = useState(0)
  const [isSuccessState, setIsSuccessState] = useState(false)
  const [serverError, setServerError] = useState<{
    code?: number
    title: string
    message: string
  } | null>(null)

  // Modals state
  const [activeModal, setActiveModal] = useState<'forgot' | 'support' | 'terms' | 'privacy' | null>(null)

  // ─── REAL FORGOT PASSWORD MODAL STATE + LIVE OTP EXPIRY COUNTDOWN TIMER ──────
  const [forgotStep, setForgotStep] = useState<1 | 2>(1)
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [forgotOtpToken, setForgotOtpToken] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotShowPass, setForgotShowPass] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null)
  const [maskedContactInfo, setMaskedContactInfo] = useState<string | null>(null)

  // OTP Countdown Timer (120 seconds = 2 minutes)
  const [otpTimeLeft, setOtpTimeLeft] = useState<number>(120)

  // Ticking OTP countdown effect when on step 2
  useEffect(() => {
    let timerId: ReturnType<typeof setInterval>
    if (activeModal === 'forgot' && forgotStep === 2 && otpTimeLeft > 0) {
      timerId = setInterval(() => {
        setOtpTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timerId) clearInterval(timerId)
    }
  }, [activeModal, forgotStep, otpTimeLeft])

  // Format seconds to MM:SS
  const formatOtpTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const usernameInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '', remember: true },
  })

  const { ref: registerUsernameRef, ...usernameRegisterProps } = register('username')

  // Auto focus username on mount
  useEffect(() => {
    usernameInputRef.current?.focus()
  }, [])

  // Sync current language object
  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  const handleLanguageChange = async (langCode: LanguageCode) => {
    await setLanguage(langCode)
    setLangDropdownOpen(false)
  }

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    updateThemeMode(mode)
    setThemeDropdownOpen(false)
  }

  // Detect Caps Lock Keypress
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'))
    }
  }

  // Reset Forgot Password Modal State
  const resetForgotState = () => {
    setForgotStep(1)
    setForgotIdentifier('')
    setForgotOtpToken('')
    setForgotNewPassword('')
    setForgotLoading(false)
    setForgotError(null)
    setForgotSuccessMsg(null)
    setMaskedContactInfo(null)
    setOtpTimeLeft(120)
  }

  // ─── REAL FORGOT PASSWORD HANDLERS (CONNECTED TO LARAVEL BACKEND API) ──────
  const handleRequestPasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!forgotIdentifier.trim()) {
      setForgotError(t('auth.errors.422'))
      return
    }

    try {
      setForgotLoading(true)
      setForgotError(null)
      setForgotSuccessMsg(null)

      const res = await authService.forgotPassword({
        identifier: forgotIdentifier.trim(),
      })

      const data = res.data.data
      setForgotOtpToken(data.reset_token || '123456')
      setMaskedContactInfo(data.masked_contact || 'registered contact')
      setForgotSuccessMsg(`Reset code verified! OTP code: ${data.reset_token}`)
      setOtpTimeLeft(120) // Reset 120 second timer
      setForgotStep(2)
    } catch (err: any) {
      const msg = err.response?.data?.message || t('auth.errors.404')
      setForgotError(msg)
    } finally {
      setForgotLoading(false)
    }
  }

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otpTimeLeft === 0) {
      setForgotError(t('auth.modals.otpExpiredMsg'))
      return
    }

    if (!forgotOtpToken.trim() || !forgotNewPassword.trim()) {
      setForgotError(t('auth.errors.422'))
      return
    }

    if (forgotNewPassword.length < 4) {
      setForgotError(t('auth.errors.422'))
      return
    }

    try {
      setForgotLoading(true)
      setForgotError(null)

      const res = await authService.resetPassword({
        identifier: forgotIdentifier.trim(),
        reset_token: forgotOtpToken.trim(),
        password: forgotNewPassword.trim(),
      })

      setForgotSuccessMsg(t('auth.loginSuccess'))
      
      // Auto fill form credentials for instant login
      setValue('username', forgotIdentifier.trim(), { shouldValidate: true })
      setValue('password', forgotNewPassword.trim(), { shouldValidate: true })

      setTimeout(() => {
        setActiveModal(null)
        resetForgotState()
      }, 1500)
    } catch (err: any) {
      const msg = err.response?.data?.message || t('auth.errors.422')
      setForgotError(msg)
    } finally {
      setForgotLoading(false)
    }
  }

  // ─── Login Form Submission Handler ─────────────────────────────────────────
  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError(null)
      setIsSuccessState(false)
      setLoginProgress(25)

      // Sanitized input
      const sanitizedUsername = data.username.trim()

      setLoginProgress(50)

      const res = await authService.login({
        username: sanitizedUsername,
        password: data.password,
        remember: data.remember ?? false,
      })

      setLoginProgress(85)

      const { user, access_token, token, refresh_token } = res.data.data
      const effectiveToken = access_token || token

      setLoginProgress(100)
      setIsSuccessState(true)

      // Save auth state cleanly
      setAuth(user, effectiveToken, refresh_token)

      // Smooth transition redirect
      setTimeout(() => {
        navigate('/dashboard')
      }, 700)
    } catch (err: any) {
      setLoginProgress(0)
      setIsSuccessState(false)

      const status = err.response?.status
      const backendMsg = err.response?.data?.message

      let errorTitle = t('auth.errorTitles.authFailed', 'Authentication Failed')
      let errorMessage = t('auth.errors.unknown', 'An unexpected error occurred. Please try again.')

      if (!err.response) {
        if (!navigator.onLine) {
          errorTitle = t('auth.errorTitles.network', 'Network Connection Error')
          errorMessage = t('auth.errors.offline')
        } else if (err.code === 'ECONNABORTED') {
          errorTitle = t('auth.errorTitles.network', 'Network Connection Error')
          errorMessage = t('auth.errors.timeout')
        } else {
          errorTitle = t('auth.errorTitles.network', 'Network Connection Error')
          errorMessage = t('auth.errors.networkError')
        }
      } else if (status === 401) {
        errorTitle = t('auth.errorTitles.authFailed', 'Authentication Failed')
        errorMessage = t('auth.errors.401')
      } else if (status === 403) {
        errorTitle = t('auth.errorTitles.accessDenied', 'Access Denied')
        errorMessage = t('auth.errors.403')
      } else if (status === 404) {
        errorTitle = t('auth.errorTitles.notFound', 'Account Not Found')
        errorMessage = t('auth.errors.404')
      } else if (status === 419) {
        errorTitle = t('auth.errorTitles.sessionExpired', 'Session Expired')
        errorMessage = t('auth.errors.419')
      } else if (status === 422) {
        errorTitle = t('auth.errorTitles.authFailed', 'Invalid Information')
        errorMessage = t('auth.errors.422')
      } else if (status === 429) {
        errorTitle = t('auth.errorTitles.locked', 'Account Temporarily Locked')
        errorMessage = t('auth.errors.429')
      } else if (status === 500) {
        errorTitle = t('auth.errorTitles.serverError', 'System Error')
        errorMessage = t('auth.errors.500')
      } else if (status === 503) {
        errorTitle = t('auth.errorTitles.maintenance', 'Server Under Maintenance')
        errorMessage = t('auth.errors.503')
      } else if (backendMsg) {
        errorMessage = backendMsg
      }

      setServerError({
        code: status,
        title: errorTitle,
        message: errorMessage,
      })
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      
      {/* ─── Ambient Glow & Particle Background ────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/10 dark:from-blue-600/20 dark:via-indigo-600/15 dark:to-purple-600/10 blur-[130px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tl from-indigo-400/20 via-blue-400/15 to-cyan-400/10 dark:from-indigo-600/20 dark:via-blue-600/15 dark:to-cyan-500/10 blur-[130px] animate-pulse delay-1000" />
        <div className="absolute top-[35%] left-[45%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] rounded-full bg-blue-500/10 blur-[150px]" />
        
        {/* Subtle grid background lines */}
        <div 
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* ─── TOP NAVIGATION / HEADER QUICK BAR ─────────────────────────────── */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <BrandLogo size="sm" animated />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white truncate">
              {branding.brand_name || 'NexPOS'}
            </span>
            <span className="hidden xs:inline-flex text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {t('auth.systemVersion', 'v2.5')}
            </span>
          </div>
        </div>

        {/* Quick Actions (Language Switcher & Theme Mode matching Admin Dashboard) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Support Modal Trigger */}
          <button
            onClick={() => setActiveModal('support')}
            className="hidden md:inline-flex h-9 items-center gap-2 px-3.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t('auth.helpSupport', 'Help & Support')}</span>
          </button>

          {/* Standard Language Dropdown */}
          <LanguageDropdown isInNavbar={false} />

          {/* Standard Theme Switcher */}
          <ThemeSwitcher isInNavbar={false} />
        </div>
      </header>

      {/* ─── MAIN RESPONSIVE MODERN HERO & SPACIOUS LOGIN CARD ──────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center my-auto">

          {/* ─── LEFT HERO SECTION (Showcase, Values & Live Metrics - 100% 5-Language i18n) ─── */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center py-4 pr-0 xl:pr-6 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="space-y-6 xl:space-y-7 max-w-2xl"
            >
              {/* Dynamic Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold shadow-xs backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{t('auth.badge')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.18]">
                {t('auth.heroTitle')}
              </h1>

              {/* Subtitle */}
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                {t('auth.heroSubtitle')}
              </p>

              {/* 3 Modern Feature Cards */}
              <div className="space-y-3.5 pt-2">
                {[
                  {
                    icon: <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                    bg: 'bg-blue-500/10 border-blue-500/20',
                    title: t('auth.features.posTitle', 'High-Speed POS & Barcode Checkout'),
                    desc: t('auth.features.posDesc', 'Instant KHQR, split payments, and fast thermal receipt printing.'),
                  },
                  {
                    icon: <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
                    bg: 'bg-indigo-500/10 border-indigo-500/20',
                    title: t('auth.features.inventoryTitle', 'Multi-Branch Inventory & Warehousing'),
                    desc: t('auth.features.inventoryDesc', 'Real-time atomic stock sync, inter-branch transfers, and audit logs.'),
                  },
                  {
                    icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                    bg: 'bg-emerald-500/10 border-emerald-500/20',
                    title: t('auth.features.securityTitle', 'Role-Based Access & Security Audit'),
                    desc: t('auth.features.securityDesc', 'Granular permission controls, shift tracking, and activity audits.'),
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-start gap-3.5"
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.bg} border flex items-center justify-center shrink-0 mt-0.5`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 3 Live Trust Stats Row */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-left">
                  <div className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">{t('auth.stats.uptime', '99.99%')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{t('auth.stats.uptimeLabel', 'Uptime SLA')}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-left">
                  <div className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{t('auth.stats.sync', 'Real-Time')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{t('auth.stats.syncLabel', 'Cloud Sync')}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-left">
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{t('auth.stats.security', '256-Bit')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{t('auth.stats.securityLabel', 'SSL Encrypted')}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT LOGIN CARD SECTION (Ultra-Clean, Minimalist & Modern UX) ─── */}
          <div className="w-full lg:col-span-6 xl:col-span-5 flex items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-[420px] sm:max-w-[440px] mx-auto lg:mr-0"
            >
              {/* Ultra-Clean Card Container */}
              <div className="relative rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-8 overflow-hidden text-left">
                
                {/* Progress Bar during loading */}
                {isSubmitting && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden z-20">
                    <motion.div
                      className="h-full bg-blue-600"
                      initial={{ width: '0%' }}
                      animate={{ width: `${loginProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Header inside Login Card */}
                <div className="text-center mb-6 sm:mb-7 flex flex-col items-center">
                  <div className="mb-3 inline-flex items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                    <BrandLogo size="md" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {t('auth.loginTitle')}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 font-normal max-w-xs leading-relaxed">
                    {t('auth.loginSubtitle')}
                  </p>
                </div>

                {/* Modern Error Alert Box */}
                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -6 }}
                      className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 shadow-xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-rose-900 dark:text-rose-100">{serverError.title}</div>
                        <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">{serverError.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setServerError(null)}
                        className="text-rose-400 hover:text-rose-700 p-0.5 rounded cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── ULTRA CLEAN LOGIN FORM ──────────────────────────────── */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-4.5" onKeyDown={handleKeyDown}>
                  
                  {/* Identifier Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('auth.identifierLabel')}
                    </label>
                    <div className="relative group">
                      <div
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-all duration-200 pointer-events-none shadow-2xs ${
                          errors.username
                            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80 text-rose-500'
                            : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/60 dark:border-slate-700/60 text-slate-400 dark:text-slate-400 group-focus-within:bg-blue-50 group-focus-within:border-blue-300/80 group-focus-within:text-blue-600 dark:group-focus-within:bg-blue-950/60 dark:group-focus-within:border-blue-800/80 dark:group-focus-within:text-blue-400'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-focus-within:scale-105" />
                      </div>
                      <input
                        {...usernameRegisterProps}
                        ref={(e) => {
                          registerUsernameRef(e)
                          usernameInputRef.current = e
                        }}
                        type="text"
                        autoComplete="username"
                        placeholder={t('auth.identifierPlaceholder')}
                        className={`w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-950/70 border rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm
                                   placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-2xs ${
                                     errors.username
                                       ? 'border-rose-500 ring-1 ring-rose-500/30'
                                       : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                   }`}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>{errors.username.message === 'identifierRequired' ? t('auth.validation.identifierRequired', 'Please enter your username, employee code or phone') : errors.username.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('auth.password')}
                      </label>

                      {/* Caps Lock Indicator */}
                      {capsLockActive && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          {t('auth.capsLockOn')}
                        </span>
                      )}
                    </div>

                    <div className="relative group">
                      <div
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-all duration-200 pointer-events-none shadow-2xs ${
                          errors.password
                            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80 text-rose-500'
                            : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/60 dark:border-slate-700/60 text-slate-400 dark:text-slate-400 group-focus-within:bg-blue-50 group-focus-within:border-blue-300/80 group-focus-within:text-blue-600 dark:group-focus-within:bg-blue-950/60 dark:group-focus-within:border-blue-800/80 dark:group-focus-within:text-blue-400'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-focus-within:scale-105" />
                      </div>
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder={t('auth.passwordPlaceholder')}
                        className={`w-full pl-11 sm:pl-12 pr-11 py-2.5 sm:py-3 bg-white dark:bg-slate-950/70 border rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm
                                   placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-2xs ${
                                     errors.password
                                       ? 'border-rose-500 ring-1 ring-rose-500/30'
                                       : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                   }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>{errors.password.message === 'passwordRequired' ? t('auth.validation.passwordRequired', 'Please enter your password') : errors.password.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        {...register('remember')}
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 accent-blue-600 transition-all cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                        {t('auth.rememberMe')}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        resetForgotState()
                        setActiveModal('forgot')
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-all cursor-pointer"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccessState}
                    className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-sm hover:shadow transition-all duration-200
                              flex items-center justify-center gap-2 cursor-pointer ${
                                isSuccessState
                                  ? 'bg-emerald-600 hover:bg-emerald-500'
                                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isSuccessState ? (
                      <div className="flex items-center gap-2 text-white font-bold">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{t('auth.loginSuccess')}</span>
                      </div>
                    ) : isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{t('auth.loggingIn')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-semibold">
                        <LogIn className="w-4 h-4" />
                        <span>{t('auth.loginButton')}</span>
                      </div>
                    )}
                  </button>
                </form>

                {/* ─── Trust & Security Badge ─────────────────────────────── */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-center text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{t('auth.securityNote')}</span>
                </div>

              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-200/70 dark:border-slate-900 text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
        <div>
          © {new Date().getFullYear()} {branding.brand_name || branding.company_name || 'OptaPOS'}. {t('auth.allRightsReserved', 'All rights reserved.')}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => setActiveModal('privacy')}
            className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            {t('auth.privacyPolicy')}
          </button>
          <button
            onClick={() => setActiveModal('terms')}
            className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            {t('auth.termsOfService')}
          </button>
          <button
            onClick={() => setActiveModal('support')}
            className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            {t('auth.helpSupport')}
          </button>
        </div>
      </footer>

      {/* ─── MODALS (INTERACTIVE FORGOT PASSWORD, SUPPORT, TERMS, PRIVACY) ─── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-left overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ─── REAL INTERACTIVE FORGOT PASSWORD MODAL FLOW ────────────── */}
              {activeModal === 'forgot' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {forgotStep === 1 ? t('auth.modals.forgotStep1Title') : t('auth.modals.forgotStep2Title')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {forgotStep === 1
                          ? t('auth.modals.forgotStep1Sub')
                          : t('auth.modals.forgotStep2Sub')}
                      </p>
                    </div>
                  </div>

                  {/* Success Alert Banner */}
                  {forgotSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{forgotSuccessMsg}</span>
                    </div>
                  )}

                  {/* Error Alert Banner */}
                  {forgotError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {/* STEP 1: REQUEST OTP RESET TOKEN */}
                  {forgotStep === 1 && (
                    <form onSubmit={handleRequestPasswordReset} className="space-y-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('auth.modals.identifierInputLabel')}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={forgotIdentifier}
                            onChange={(e) => setForgotIdentifier(e.target.value)}
                            placeholder="admin or admin@enterprise-pos.com or EMP-0001"
                            className="w-full px-4 py-3 bg-slate-100/80 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {forgotLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t('auth.modals.verifyingAccount')}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>{t('auth.modals.requestOtpBtn')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* STEP 2: ENTER OTP & NEW PASSWORD WITH LIVE EXPIRY COUNTDOWN TIMER */}
                  {forgotStep === 2 && (
                    <form onSubmit={handleConfirmPasswordReset} className="space-y-4 pt-1">
                      {/* OTP Live Countdown Badge & Resend Button */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                          <span className="text-amber-800 dark:text-amber-200 font-medium">
                            {otpTimeLeft > 0 ? (
                              <>
                                {t('auth.modals.otpExpiresIn')}:{' '}
                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                  {formatOtpTimer(otpTimeLeft)}
                                </span>
                              </>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-bold">
                                {t('auth.modals.otpExpiredMsg')}
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Resend Code Button */}
                        <button
                          type="button"
                          onClick={() => handleRequestPasswordReset()}
                          disabled={forgotLoading}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold text-[11px] transition-all disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${forgotLoading ? 'animate-spin' : ''}`} />
                          <span>{t('auth.modals.resendOtp')}</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('auth.modals.otpInputLabel')}
                        </label>
                        <input
                          type="text"
                          disabled={otpTimeLeft === 0}
                          value={forgotOtpToken}
                          onChange={(e) => setForgotOtpToken(e.target.value)}
                          placeholder="e.g. 123456"
                          className={`w-full px-4 py-3 bg-slate-100/80 dark:bg-slate-950/70 border rounded-xl text-slate-900 dark:text-white text-xs font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                            otpTimeLeft === 0
                              ? 'opacity-50 border-rose-500 bg-rose-500/5'
                              : 'border-slate-300 dark:border-slate-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('auth.modals.newPassInputLabel')}
                        </label>
                        <div className="relative">
                          <input
                            type={forgotShowPass ? 'text' : 'password'}
                            disabled={otpTimeLeft === 0}
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 pr-10 bg-slate-100/80 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setForgotShowPass(!forgotShowPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {forgotShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setForgotStep(1)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-200"
                        >
                          {t('auth.modals.back')}
                        </button>

                        <button
                          type="submit"
                          disabled={forgotLoading || otpTimeLeft === 0}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {forgotLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{t('auth.modals.updatingPassword')}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{t('auth.modals.confirmResetBtn')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* IT Support Fallback Note */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{t('auth.modals.needSupport')}</span>
                    <button
                      onClick={() => setActiveModal('support')}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      {t('auth.modals.contactSupport')}
                    </button>
                  </div>
                </div>
              )}

              {/* Support Content */}
              {activeModal === 'support' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('auth.modals.supportTitle')}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('auth.modals.supportDesc')}
                  </p>
                  <div className="space-y-2 pt-2 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Email:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{t('auth.modals.supportEmail')}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Hotline:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{t('auth.modals.supportPhone')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Content */}
              {activeModal === 'terms' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('auth.modals.termsTitle')}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('auth.modals.termsDesc')}
                  </p>
                </div>
              )}

              {/* Privacy Content */}
              {activeModal === 'privacy' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('auth.modals.privacyTitle')}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('auth.modals.privacyDesc')}
                  </p>
                </div>
              )}

              {/* Close Action */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setActiveModal(null)
                    resetForgotState()
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs transition-colors"
                >
                  {t('auth.close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LoginPage
