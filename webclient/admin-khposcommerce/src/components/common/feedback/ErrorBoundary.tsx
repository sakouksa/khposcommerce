import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// ─── Skydiver Falling SVG Illustration Component ──────────────────────────────
const SomethingWentWrongIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[400px] h-[220px] sm:h-[260px] mx-auto flex items-center justify-center select-none">
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Background Clouds */}
        <path
          d="M70 170 C70 155 85 145 100 150 C110 135 135 135 145 150 C155 145 170 155 165 170 C170 185 155 195 140 190 C130 200 105 200 95 190 C80 195 65 185 70 170 Z"
          className="fill-blue-50/80 dark:fill-slate-800/60"
        />
        <path
          d="M270 160 C270 148 282 140 295 144 C303 132 323 132 331 144 C339 140 351 148 347 160 C351 172 339 180 327 176 C319 184 299 184 291 176 C279 180 267 172 270 160 Z"
          className="fill-blue-50/70 dark:fill-slate-800/50"
        />

        {/* Falling Speed Lines (Above Parachute) */}
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-slate-800 dark:text-slate-200">
          <line x1="180" y1="35" x2="180" y2="52" />
          <line x1="196" y1="28" x2="196" y2="50" />
          <line x1="212" y1="42" x2="212" y2="58" />
        </g>

        {/* Parachute Canopy */}
        {/* Outer canopy shape with scalloped bottom */}
        <path
          d="M130 115 C130 55 270 55 270 115 C255 125 240 120 235 115 C225 125 210 120 200 115 C190 125 175 120 165 115 C155 125 140 120 130 115 Z"
          className="fill-sky-200 dark:fill-sky-800/80 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Parachute Segments */}
        <path
          d="M165 115 C170 80 185 60 200 58 C215 60 230 80 235 115"
          className="fill-sky-100 dark:fill-sky-700/70 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="2.5"
        />
        <path
          d="M200 58 L200 115"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-slate-800 dark:text-slate-100"
        />

        {/* Parachute Top Loop */}
        <path
          d="M190 58 C190 48 210 48 210 58"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="text-slate-800 dark:text-slate-100"
        />

        {/* Suspension Lines / Cords */}
        <g stroke="currentColor" strokeWidth="1.8" className="text-slate-700 dark:text-slate-300">
          <line x1="135" y1="117" x2="195" y2="185" />
          <line x1="165" y1="115" x2="198" y2="185" />
          <line x1="235" y1="115" x2="202" y2="185" />
          <line x1="265" y1="117" x2="205" y2="185" />
        </g>

        {/* Skydiver Body & Limbs */}
        {/* Legs / Lower Body in flight pose */}
        <path
          d="M195 210 C195 230 225 240 245 240 L245 200 L268 200 C272 200 275 204 275 208 L275 225 C275 235 265 245 245 245 L215 245 C195 245 180 230 180 210 Z"
          className="fill-sky-400 dark:fill-sky-600 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Torso */}
        <path
          d="M185 190 C185 180 215 180 215 190 L215 230 C215 240 185 240 185 230 Z"
          className="fill-sky-400 dark:fill-sky-600 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Left Arm Raised */}
        <path
          d="M185 195 L178 175 C176 168 185 165 188 172 L192 190"
          className="fill-sky-400 dark:fill-sky-600 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Right Arm Raised */}
        <path
          d="M208 190 L212 172 C215 165 224 168 222 175 L215 195"
          className="fill-sky-400 dark:fill-sky-600 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Backpack / Parachute Pack */}
        <path
          d="M215 195 C222 195 226 200 226 210 C226 220 222 225 215 225 Z"
          className="fill-slate-800 dark:fill-slate-200 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="2"
        />

        {/* Head */}
        <circle
          cx="200"
          cy="195"
          r="16"
          className="fill-amber-50 dark:fill-slate-200 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="3"
        />

        {/* Wild Messy Hair */}
        <path
          d="M186 190 C184 178 190 172 193 178 C196 170 202 168 204 176 C208 170 214 172 214 180 C216 182 216 188 214 192 Z"
          className="fill-slate-800 dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="2"
        />

        {/* Shocked Eyes */}
        <circle cx="194" cy="193" r="2.2" className="fill-slate-900" />
        <circle cx="206" cy="193" r="2.2" className="fill-slate-900" />

        {/* Shocked Open Mouth */}
        <path
          d="M194 202 C194 210 206 210 206 202 Z"
          className="fill-slate-900 stroke-slate-900"
          strokeWidth="1.5"
        />

        {/* Motion Wind Lines next to skydiver */}
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-slate-800 dark:text-slate-200">
          <line x1="265" y1="140" x2="265" y2="155" />
          <line x1="275" y1="150" x2="275" y2="170" />
        </g>
      </svg>
    </div>
  )
}

// ─── Functional Error View (with Translations) ────────────────────────────────
interface ErrorViewProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReload: () => void
  onHome: () => void
}

const ErrorBoundaryView: React.FC<ErrorViewProps> = ({ onReload, onHome }) => {
  const { t } = useTranslation(['errors', 'common'])

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-xl w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* 1. Skydiver / Parachute Illustration */}
        <SomethingWentWrongIllustration />

        {/* 2. Heading & Subtitles */}
        <div className="space-y-2.5 px-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {t('errors.somethingWentWrongTitle', 'Aaaah! Something went wrong')}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t('errors.somethingWentWrongDesc1', 'Brace yourself till we get the error fixed.')}
            <br />
            {t('errors.somethingWentWrongDesc2', 'You may also refresh the page or try again later')}
          </p>
        </div>

        {/* 3. Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onReload}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0e5a77] hover:bg-[#0a465c] shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>{t('errors.refreshPage', 'Refresh Page')}</span>
          </button>
          <button
            type="button"
            onClick={onHome}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Home size={15} />
            <span>{t('errors.backToHome', 'Back to Home')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ErrorBoundary Class Component ───────────────────────────────────────────
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorBoundaryView
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReload={this.handleReset}
          onHome={this.handleGoHome}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
