import React, { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export type HttpErrorCode =
  | 400
  | 401
  | 403
  | 404
  | 408
  | 429
  | 500
  | 502
  | 503
  | 504
  | 'app'
  | 'runtime'
  | 'offline'
  | 'unknown'

export interface HttpErrorPageProps {
  code?: HttpErrorCode
  title?: string
  subtitle?: string
  description?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  showRetryButton?: boolean
  showContactButton?: boolean
  onRetry?: () => void
  fullPage?: boolean
  error?: Error | null
  errorInfo?: React.ErrorInfo | null
  extraActions?: React.ReactNode
}

// ─────────────────────────────────────────────────────────────────────────────
//  100% Cloned DotGrid Canvas from AdminCN Template
// ─────────────────────────────────────────────────────────────────────────────

interface DotGridProps {
  className?: string
  dotSize?: number
  gap?: number
  baseColor?: string
  activeColor?: string
  radius?: number
  displacement?: number
  maxScale?: number
}

const DotGrid: React.FC<DotGridProps> = ({
  className,
  dotSize = 2,
  gap = 22,
  baseColor = 'rgba(255, 255, 255, 0.1)',
  activeColor = '#10b981', // Emerald green from screenshot
  radius = 160,
  displacement = 12,
  maxScale = 3.2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    interface DotItem {
      x: number
      y: number
      offsetX: number
      offsetY: number
      targetX: number
      targetY: number
      scale: number
      targetScale: number
    }

    const dots: DotItem[] = []
    const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 }
    let idleAngle = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots.length = 0
      for (let x = gap / 2; x < rect.width; x += gap) {
        for (let y = gap / 2; y < rect.height; y += gap) {
          dots.push({
            x,
            y,
            offsetX: 0,
            offsetY: 0,
            targetX: 0,
            targetY: 0,
            scale: 1,
            targetScale: 1,
          })
        }
      }
    }
    resize()

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor

    const render = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight

      // If user hasn't moved mouse into the box, create an ambient radar sphere on the left side
      // exactly matching the emerald sphere in the user's screenshot!
      idleAngle += 0.02
      let activeX = mouse.targetX
      let activeY = mouse.targetY

      if (activeX < 0) {
        activeX = width * 0.28 + Math.cos(idleAngle * 0.7) * 20
        activeY = height * 0.5 + Math.sin(idleAngle) * 30
      }

      ctx.clearRect(0, 0, width, height)
      mouse.x = lerp(mouse.x, activeX, 0.12)
      mouse.y = lerp(mouse.y, activeY, 0.12)

      for (const dot of dots) {
        const dx = dot.x - mouse.x
        const dy = dot.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const distFactor = Math.max(0, 1 - dist / radius)

        if (distFactor > 0) {
          const angle = Math.atan2(dy, dx)
          dot.targetX = Math.cos(angle) * displacement * distFactor
          dot.targetY = Math.sin(angle) * displacement * distFactor
          dot.targetScale = 1 + distFactor * (maxScale - 1)
        } else {
          dot.targetX = 0
          dot.targetY = 0
          dot.targetScale = 1
        }

        dot.offsetX = lerp(dot.offsetX, dot.targetX, 0.12)
        dot.offsetY = lerp(dot.offsetY, dot.targetY, 0.12)
        dot.scale = lerp(dot.scale, dot.targetScale, 0.12)

        const drawX = dot.x + dot.offsetX
        const drawY = dot.y + dot.offsetY

        ctx.beginPath()
        ctx.arc(drawX, drawY, dotSize * dot.scale, 0, 2 * Math.PI)

        if (distFactor > 0.05) {
          ctx.globalAlpha = 1
          ctx.shadowBlur = 20 * distFactor
          ctx.shadowColor = activeColor
          ctx.fillStyle = activeColor
        } else {
          ctx.shadowBlur = 0
          ctx.globalAlpha = 0.2
          ctx.fillStyle = baseColor
        }
        ctx.fill()
        ctx.globalAlpha = 1
      }
      animId = requestAnimationFrame(render)
    }
    render()

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top
    }

    const onMouseLeave = () => {
      mouse.targetX = -9999
      mouse.targetY = -9999
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    window.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [dotSize, gap, radius, displacement, maxScale, baseColor, activeColor])

  return <canvas ref={canvasRef} className={cn('absolute inset-0 h-full w-full', className)} />
}

// ─────────────────────────────────────────────────────────────────────────────
//  100% Cloned MorphingText from AdminCN Template (with SVG Threshold filter)
// ─────────────────────────────────────────────────────────────────────────────

interface MorphingTextProps {
  texts: string[]
  className?: string
}

const MorphingTextInternal: React.FC<{ texts: string[] }> = ({ texts }) => {
  const textIndexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const timeRef = useRef(new Date())
  const text1Ref = useRef<HTMLSpanElement | null>(null)
  const text2Ref = useRef<HTMLSpanElement | null>(null)

  const setStyles = useCallback(
    (fraction: number) => {
      const t1 = text1Ref.current
      const t2 = text2Ref.current
      if (!t1 || !t2) return

      t2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      t2.style.opacity = `${100 * Math.pow(fraction, 0.4)}%`

      const inv = 1 - fraction
      t1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`
      t1.style.opacity = `${100 * Math.pow(inv, 0.4)}%`

      t1.innerText = texts[textIndexRef.current % texts.length]
      t2.innerText = texts[(textIndexRef.current + 1) % texts.length]
    },
    [texts]
  )

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0

    let fraction = morphRef.current / 1.5
    if (fraction > 1) {
      cooldownRef.current = 0.5
      fraction = 1
    }

    setStyles(fraction)

    if (fraction === 1) {
      textIndexRef.current++
    }
  }, [setStyles])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    const t1 = text1Ref.current
    const t2 = text2Ref.current
    if (t1 && t2) {
      t2.style.filter = 'none'
      t2.style.opacity = '100%'
      t1.style.filter = 'none'
      t1.style.opacity = '0%'
    }
  }, [])

  useEffect(() => {
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const now = new Date()
      const dt = (now.getTime() - timeRef.current.getTime()) / 1000
      timeRef.current = now

      cooldownRef.current -= dt
      if (cooldownRef.current <= 0) {
        doMorph()
      } else {
        doCooldown()
      }
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [doMorph, doCooldown])

  return (
    <>
      <span
        ref={text1Ref}
        className="absolute inset-x-0 top-0 m-auto inline-block w-full whitespace-pre-line leading-[0.95]"
      />
      <span
        ref={text2Ref}
        className="absolute inset-x-0 top-0 m-auto inline-block w-full whitespace-pre-line leading-[0.95]"
      />
    </>
  )
}

const MorphingText: React.FC<MorphingTextProps> = ({ texts, className }) => {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-3xl text-center font-sans text-6xl sm:text-7xl lg:text-[6.5rem] xl:text-[8rem] font-bold text-white tracking-tight leading-[0.95] drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] filter-[url(#threshold)_blur(0.6px)] select-none',
        className
      )}
    >
      <MorphingTextInternal texts={texts} />
      <svg id="filters" className="fixed h-0 w-0 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component (100% Clone of AdminCN error-page-404 layout)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_MORPHING_TEXTS: Record<string, string[]> = {
  '400': ['Bad\nRequest', 'Invalid\nURL', '400\nError'],
  '401': ['Access\nDenied', 'Please\nLogin', '401\nUnauthorized'],
  '403': ['Access\nForbidden', 'No\nAccess', '403\nBlocked'],
  '404': ['Page\nDrifted', 'Error\nPage', 'Lost in\nSpace', '404\nWhoops!'],
  '408': ['Request\nTimeout', 'Network\nSlow', '408\nTimeout'],
  '429': ['Too Many\nRequests', 'Rate\nLimit', 'Slow\nDown', '429\nLimit'],
  '500': ['Server\nCrash', 'Error\nPage', 'System\nError', '500\nWhoops!'],
  '502': ['Bad\nGateway', 'Server\nDown', '502\nGateway'],
  '503': ['Service\nDown', 'Under\nRepair', '503\nMaintenance'],
  '504': ['Gateway\nTimeout', 'Server\nTimeout', '504\nTimeout'],
  app: ['Page\nDrifted', 'Error\nPage', 'Runtime\nError', 'App\nCrash'],
  runtime: ['Page\nDrifted', 'Error\nPage', 'Runtime\nError', 'App\nCrash'],
  offline: ['Offline\nMode', 'No\nInternet', 'Network\nLost'],
  unknown: ['System\nError', 'Something\nWrong', 'Whoops!'],
  default: ['Page\nDrifted', 'Error\nPage', 'Lost in\nSpace'],
}

export const HttpErrorPage: React.FC<HttpErrorPageProps> = ({
  code = 'unknown',
  title,
  subtitle,
  description,
  showBackButton,
  showHomeButton = true,
  showRetryButton,
  showContactButton,
  onRetry,
  error,
  errorInfo,
  extraActions,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  const codeKey = String(code)
  const isClientError = codeKey === 'app' || codeKey === 'runtime'
  const isNumericCode = !isNaN(Number(codeKey))
  const lookupKey = isClientError ? 'app' : codeKey

  // Phrases for animated MorphingText (specific to each error code)
  const morphTexts =
    DEFAULT_MORPHING_TEXTS[codeKey] ??
    DEFAULT_MORPHING_TEXTS[lookupKey] ??
    DEFAULT_MORPHING_TEXTS.default

  // 1. Headline: "404 - Whoops!" or in Khmer "404 - អូ៎! មានបញ្ហា"
  const defaultHeadline = isNumericCode
    ? `${codeKey} - ${t('errorPage.whoops', 'Whoops!')}`
    : isClientError
    ? `500 - ${t('errorPage.whoops', 'Whoops!')}`
    : codeKey === 'offline'
    ? `${t('errorPage.offline.badge', 'Offline')} - ${t('errorPage.whoops', 'Whoops!')}`
    : t('errorPage.whoops', 'Whoops!')

  const displayHeadline = title ?? defaultHeadline

  // 2. Subheading: Localized title for this error code (e.g. "Internal Server Error" / "កំហុស Server ផ្ទៃក្នុង")
  const defaultSubtitle = t(
    `errorPage.${lookupKey}.title`,
    t('errorPage.somethingWentWrong', 'Something went wrong')
  )
  const displaySubtitle = subtitle ?? defaultSubtitle

  // 3. Description: Localized description for this error code
  const defaultDesc = t(
    `errorPage.${lookupKey}.description`,
    t(`errorPage.${lookupKey}.subtitle`, t('errorPage.somethingWentWrong', 'Something went wrong'))
  )
  const displayDesc = description ?? defaultDesc

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-background text-foreground flex flex-col justify-center overflow-y-auto">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 w-full">
        {/* ── Left Column: Clean Typography & Combo 1 Action Buttons ──── */}
        <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-12 text-center">
          {/* Main Headline: "404 - Whoops!" / "404 - អូ៎! មានបញ្ហា" */}
          <h2 className="mb-6 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            {displayHeadline}
          </h2>

          {/* Subheading: "Internal Server Error" / "កំហុស Server ផ្ទៃក្នុង" */}
          <h3 className="mb-1.5 text-2xl sm:text-3xl font-semibold text-foreground">
            {displaySubtitle}
          </h3>

          {/* Description Paragraph: Dynamic localized description */}
          <p className="text-muted-foreground mb-6 max-w-sm text-sm sm:text-base leading-relaxed">
            {displayDesc}
          </p>

          {/* Action Buttons: Combo 1 (Back to Dashboard + Try Again) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="default"
              onClick={() => {
                if (onRetry) onRetry()
                navigate('/dashboard')
              }}
              className="h-10 px-5 rounded-md font-medium text-sm inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('errorPage.backToDashboard', t('errorPage.dashboard', 'Back to Dashboard'))}
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={() => {
                if (onRetry) {
                  onRetry()
                } else {
                  window.location.reload()
                }
              }}
              className="h-10 px-5 rounded-md font-medium text-sm inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-xs gap-2"
            >
              <RotateCw className="h-4 w-4" />
              {t('errorPage.tryAgain', 'Try Again')}
            </Button>
          </div>
        </div>

        {/* ── Right Column: Exact AdminCN Canvas + MorphingText Box (Clean & Minimalist) ──── */}
        <div className="relative max-h-screen w-full p-2 max-lg:hidden flex items-center justify-center">
          <div className="relative h-full w-full min-h-[500px] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
            {/* Interactive DotGrid Canvas with Emerald Sonar Sphere */}
            <DotGrid
              dotSize={2}
              gap={22}
              baseColor="rgba(255, 255, 255, 0.12)"
              activeColor="#10b981"
              radius={150}
              displacement={12}
              maxScale={3.2}
            />

            {/* Centered Morphing Text: "Page\nDrifted", "Error\nPage", etc. */}
            <div className="absolute inset-0 z-10 flex items-center justify-center select-none pointer-events-none px-6">
              <MorphingText texts={morphTexts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HttpErrorPage
