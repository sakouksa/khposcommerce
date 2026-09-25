import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutDashboard, ShieldCheck, Lock } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'

const SecurityGuardsForbiddenIllustration: React.FC = () => (
  <svg
    viewBox="0 0 600 380"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-xl h-auto mx-auto my-2 select-none"
  >
    {/* Ground Baseline */}
    <line x1="40" y1="360" x2="560" y2="360" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" className="dark:stroke-slate-800" />

    {/* ── 1. LEFT: RED NO ENTRY ROAD SIGN & DECORATIVE LEAVES ─────────────── */}
    {/* Red Plant / Leaves at base */}
    <path d="M70 360 C50 340 50 300 75 270 C85 300 80 340 70 360 Z" fill="#ef4444" opacity="0.85" />
    <path d="M95 360 C80 330 90 290 105 275 C115 310 105 345 95 360 Z" fill="#f87171" opacity="0.75" />
    <path d="M60 360 C40 350 45 320 60 310 C65 330 65 350 60 360 Z" fill="#dc2626" opacity="0.9" />

    {/* Sign Post */}
    <rect x="98" y="140" width="6" height="220" fill="#94a3b8" className="dark:fill-slate-700" />
    <circle cx="101" cy="360" r="4" fill="#64748b" />

    {/* Red No Entry Circle Sign */}
    <circle cx="101" cy="140" r="38" fill="#ef4444" stroke="#ffffff" strokeWidth="4" />
    <rect x="76" y="134" width="50" height="12" rx="4" fill="#ffffff" />

    {/* ── 2. CENTER: TWO POLICE OFFICERS (MALE & FEMALE) ────────────────────── */}
    {/* MALE OFFICER (Left Officer with Whistle & Stop Hand) */}
    {/* Legs & Pants */}
    <path d="M165 220 L158 355 H192 L185 220 Z" fill="#1e293b" className="dark:fill-slate-900" />
    <path d="M195 220 L198 355 H232 L215 220 Z" fill="#1e293b" className="dark:fill-slate-900" />
    <path d="M150 350 L156 360 H192 L194 350 Z" fill="#0f172a" />
    <path d="M196 350 L200 360 H238 L234 350 Z" fill="#0f172a" />

    {/* Belt & Duty Gear */}
    <rect x="162" y="210" width="60" height="14" fill="#0f172a" rx="2" />
    <rect x="175" y="212" width="10" height="10" fill="#cbd5e1" rx="1" />
    <rect x="160" y="218" width="12" height="18" fill="#334155" rx="2" />
    <rect x="210" y="218" width="14" height="20" fill="#334155" rx="2" />

    {/* Shirt & Body */}
    <path d="M140 120 L160 210 H224 L244 120 Z" fill="#f1f5f9" className="dark:fill-slate-200" />
    <path d="M192 120 V210" stroke="#cbd5e1" strokeWidth="1.5" />
    {/* Pockets & Badges */}
    <rect x="165" y="145" width="16" height="14" fill="#e2e8f0" rx="2" />
    <path d="M208 140 L216 140 L219 148 L212 156 L205 148 Z" fill="#ef4444" /> {/* Red Badge */}

    {/* Arms: Left Arm Raised STOP Gesture */}
    <path d="M140 120 L115 150 L125 180" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-slate-200" />
    <circle cx="128" cy="115" r="10" fill="#f87171" /> {/* Palm Stop */}
    {/* Fingers for Stop Gesture */}
    <rect x="122" y="92" width="4" height="16" rx="2" fill="#f87171" />
    <rect x="127" y="90" width="4" height="18" rx="2" fill="#f87171" />
    <rect x="132" y="92" width="4" height="16" rx="2" fill="#f87171" />
    <rect x="137" y="96" width="4" height="14" rx="2" fill="#f87171" />

    {/* Head & Face */}
    <ellipse cx="192" cy="95" rx="14" ry="16" fill="#f87171" />
    {/* Whistle */}
    <rect x="188" y="102" width="10" height="6" fill="#ef4444" rx="1" />
    {/* Police Cap */}
    <path d="M172 85 C172 70 212 70 212 85 Z" fill="#1e293b" />
    <path d="M168 85 H216 V89 H168 Z" fill="#0f172a" />
    <path d="M164 88 C164 88 192 92 220 88 L216 85 H168 Z" fill="#0f172a" />
    <circle cx="192" cy="78" r="4" fill="#cbd5e1" /> {/* Cap Badge */}

    {/* FEMALE OFFICER (Right Officer Standing Back-to-Back) */}
    {/* Legs & Pants */}
    <path d="M230 220 L238 355 H268 L255 220 Z" fill="#1e293b" className="dark:fill-slate-900" />
    <path d="M260 220 L275 355 H305 L285 220 Z" fill="#1e293b" className="dark:fill-slate-900" />
    <path d="M235 350 L238 360 H272 L268 350 Z" fill="#0f172a" />
    <path d="M272 350 L276 360 H310 L305 350 Z" fill="#0f172a" />

    {/* Belt */}
    <rect x="225" y="210" width="60" height="14" fill="#0f172a" rx="2" />
    <rect x="245" y="212" width="10" height="10" fill="#cbd5e1" rx="1" />

    {/* Body & Crossed Arms */}
    <path d="M220 125 L230 210 H285 L295 125 Z" fill="#f1f5f9" className="dark:fill-slate-200" />
    {/* Red Sleeve Patch */}
    <circle cx="236" cy="150" r="6" fill="#ef4444" />

    {/* Arms Crossed */}
    <path d="M225 150 Q260 170 290 155" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" className="dark:stroke-slate-200" />
    <path d="M230 160 Q260 175 285 160" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" className="dark:stroke-slate-400" />

    {/* Head & Hair */}
    <ellipse cx="260" cy="98" rx="13" ry="15" fill="#f87171" />
    {/* Curly Wavy Dark Hair */}
    <path d="M245 92 C240 80 250 70 262 70 C275 70 282 82 276 94 C272 88 268 85 260 85 C252 85 248 88 245 92 Z" fill="#0f172a" />
    <circle cx="248" cy="85" r="7" fill="#0f172a" />
    <circle cx="270" cy="85" r="7" fill="#0f172a" />
    <circle cx="260" cy="76" r="8" fill="#0f172a" />

    {/* ── 3. RIGHT: 403 FORBIDDEN SIGN & ROAD BARRIER ───────────────────────── */}
    {/* Tilted White Sign Board */}
    <g transform="rotate(-3 400 130)">
      {/* Background shadow/board */}
      <rect x="330" y="30" width="180" height="200" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="6" className="dark:fill-slate-900 dark:stroke-slate-700 shadow-xl" />

      {/* Tape strips on 4 corners */}
      <rect x="320" y="24" width="24" height="12" fill="#e2e8f0" transform="rotate(-25 320 24)" opacity="0.8" />
      <rect x="495" y="24" width="24" height="12" fill="#e2e8f0" transform="rotate(25 495 24)" opacity="0.8" />
      <rect x="320" y="215" width="24" height="12" fill="#e2e8f0" transform="rotate(25 320 215)" opacity="0.8" />
      <rect x="495" y="215" width="24" height="12" fill="#e2e8f0" transform="rotate(-25 495 215)" opacity="0.8" />

      {/* Red Hand Stop Circle */}
      <circle cx="420" cy="90" r="30" stroke="#ef4444" strokeWidth="3" fill="none" />
      <path d="M410 92 V80 C410 77 413 77 413 80 V92 M416 92 V76 C416 73 419 73 419 76 V92 M422 92 V78 C422 75 425 75 425 78 V92 M428 92 V83 C428 80 431 80 431 83 V92 C431 104 410 104 410 92 Z" fill="#ef4444" />

      {/* 403 Text */}
      <text x="420" y="155" textAnchor="middle" fontSize="36" fontWeight="900" fill="#0f172a" className="dark:fill-white" fontFamily="sans-serif">
        403
      </text>

      {/* Error Forbidden Text */}
      <text x="420" y="180" textAnchor="middle" fontSize="14" fontWeight="700" fill="#475569" className="dark:fill-slate-300" fontFamily="sans-serif">
        Error Forbidden
      </text>
    </g>

    {/* Road Construction Barrier (Right Bottom) */}
    {/* Barrier Posts */}
    <rect x="355" y="220" width="8" height="140" fill="#cbd5e1" className="dark:fill-slate-700" />
    <rect x="505" y="220" width="8" height="140" fill="#cbd5e1" className="dark:fill-slate-700" />

    {/* Red Light Reflectors on top of posts */}
    <circle cx="359" cy="214" r="8" fill="#ef4444" />
    <circle cx="509" cy="214" r="8" fill="#ef4444" />

    {/* Upper Striped Board */}
    <g>
      <rect x="335" y="235" width="195" height="32" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" rx="3" className="dark:fill-slate-800 dark:stroke-slate-700" />
      <path d="M345 235 L365 267 H385 L365 235 Z M395 235 L415 267 H435 L415 235 Z M445 235 L465 267 H485 L465 235 Z" fill="#ef4444" />
    </g>

    {/* Lower Striped Board */}
    <g>
      <rect x="335" y="280" width="195" height="32" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" rx="3" className="dark:fill-slate-800 dark:stroke-slate-700" />
      <path d="M345 280 L365 312 H385 L365 280 Z M395 280 L415 312 H435 L415 280 Z M445 280 L465 312 H485 L465 280 Z" fill="#ef4444" />
    </g>
  </svg>
)

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()

  const handleRequestAccess = () => {
    toast.info('Access request logged. Please notify your administrator to grant permission.')
  }

  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-4 md:p-8 relative overflow-hidden bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-3xl w-full flex flex-col items-center relative z-10 space-y-4"
      >
        {/* ── 1. Vector Security Guards & 403 Barrier Illustration ─────────── */}
        <div className="w-full py-1">
          <SecurityGuardsForbiddenIllustration />
        </div>

        {/* ── 2. Access Restricted Description ─────────────────────────────── */}
        <div className="space-y-2 max-w-lg">
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Your current account role does not have permission to view or manage this section. Contact your administrator if you believe this is an error.
          </p>
        </div>

        {/* ── 3. Diagnostic User Context Pill ─────────────────────────────── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
          <Lock className="w-3.5 h-3.5 text-rose-500" />
          <span>Role: <strong className="text-slate-800 dark:text-slate-200">{user?.roles?.[0]?.replace('_', ' ') || 'Restricted Role'}</strong></span>
          <span>•</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">{location.pathname}</span>
        </div>

        {/* ── 4. Action Buttons ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={handleRequestAccess}
            className="px-5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Request Access</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AccessDeniedPage
