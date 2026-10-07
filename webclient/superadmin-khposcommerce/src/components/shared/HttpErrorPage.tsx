import React from 'react'
import { Result, Button, Space, ConfigProvider, theme } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, LayoutDashboard, RotateCcw, Mail } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────
export type HttpErrorCode = 400 | 401 | 403 | 404 | 408 | 429 | 500 | 502 | 503 | 504 | 'offline' | 'unknown'

type AntdResultStatus = React.ComponentProps<typeof Result>['status']

export interface HttpErrorPageProps {
  code?: HttpErrorCode
  /** Override translated title */
  title?: string
  /** Override translated description */
  description?: string
  /**
   * Override which action buttons appear.
   * If omitted, each error code shows its own sensible default set.
   */
  showBackButton?: boolean
  showHomeButton?: boolean
  showRetryButton?: boolean
  showContactButton?: boolean
  onRetry?: () => void
  /** If true, fills full viewport (standalone page). If false, fills parent container. */
  fullPage?: boolean
}

interface ErrorMeta {
  antdStatus: AntdResultStatus
  /** Default action buttons shown for this error if caller doesn't override */
  defaultActions: ('back' | 'home' | 'retry' | 'contact')[]
}

const ERROR_META: Record<string, ErrorMeta> = {
  '400': { antdStatus: 'warning', defaultActions: ['back'] },
  '401': { antdStatus: '403',     defaultActions: ['home'] },
  '403': { antdStatus: '403',     defaultActions: ['home', 'contact'] },
  '404': { antdStatus: '404',     defaultActions: ['back', 'home'] },
  '408': { antdStatus: 'warning', defaultActions: ['retry'] },
  '429': { antdStatus: 'warning', defaultActions: ['back'] },
  '500': { antdStatus: '500',     defaultActions: ['retry', 'home'] },
  '502': { antdStatus: '500',     defaultActions: ['retry'] },
  '503': { antdStatus: '500',     defaultActions: ['retry'] },
  '504': { antdStatus: '500',     defaultActions: ['retry'] },
  'offline': { antdStatus: 'warning', defaultActions: ['retry'] },
  'unknown': { antdStatus: 'error',   defaultActions: ['back', 'contact'] },
}

// ─────────────────────────────────────────────────────────────────────────────
//  Component (Ant Design Result based)
// ─────────────────────────────────────────────────────────────────────────────
const HttpErrorPage: React.FC<HttpErrorPageProps> = ({
  code = 'unknown',
  title,
  description,
  showBackButton,
  showHomeButton,
  showRetryButton,
  showContactButton,
  onRetry,
  fullPage = true,
}) => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()
  const { themeMode, language, primaryColor } = useThemeStore()

  const codeKey = String(code)
  const meta = ERROR_META[codeKey] ?? ERROR_META['unknown']
  const antdStatus = meta.antdStatus

  // Determine if dark mode is active
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Localized strings
  const displayTitle = title ?? t(`errorPage.${codeKey}.title`, t('errorPage.unknown.title'))
  const displaySubtitle = t(`errorPage.${codeKey}.subtitle`, t('errorPage.unknown.subtitle'))
  const displayDesc = description ?? t(`errorPage.${codeKey}.description`, t('errorPage.unknown.description'))

  // Format title for Ant Design Result:
  // For numeric codes (403, 404, 500, etc.) title shows code or custom title
  const isNumericCode = !isNaN(Number(codeKey))
  const resultTitle = title ? title : (isNumericCode ? codeKey : displayTitle)

  // Per-error smart button defaults, overridden by explicit props
  const defaults = meta.defaultActions
  const showBack = showBackButton ?? defaults.includes('back')
  const showHome = showHomeButton ?? defaults.includes('home')
  const showRetry = showRetryButton ?? defaults.includes('retry')
  const showContact = showContactButton ?? defaults.includes('contact')

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor || '#1677ff',
          fontFamily:
            language === 'km'
              ? "'Kantumruy Pro', -apple-system, BlinkMacSystemFont, sans-serif"
              : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          borderRadius: 8,
        },
      }}
    >
      <div
        className={`flex items-center justify-center bg-background text-foreground transition-colors ${
          fullPage ? 'min-h-screen w-full p-4 sm:p-8' : 'min-h-[460px] w-full p-6'
        }`}
      >
        <Result
          status={antdStatus}
          title={
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {resultTitle}
            </span>
          }
          subTitle={
            <div className="flex flex-col items-center gap-1.5 max-w-md mx-auto mt-1">
              {isNumericCode && (
                <div className="text-base font-semibold text-foreground/90">
                  {displayTitle}
                </div>
              )}
              <div className="text-sm text-muted-foreground leading-relaxed">
                {displaySubtitle || displayDesc}
              </div>
            </div>
          }
          extra={
            <Space wrap size="middle" className="justify-center">
              {showBack && (
                <Button
                  icon={<ArrowLeft className="w-4 h-4 inline-block mr-1" />}
                  onClick={() => navigate(-1)}
                  size="large"
                >
                  {t('errorPage.goBack')}
                </Button>
              )}

              {showHome && (
                <Button
                  type="primary"
                  icon={<LayoutDashboard className="w-4 h-4 inline-block mr-1" />}
                  onClick={() => navigate('/dashboard')}
                  size="large"
                >
                  {t('errorPage.dashboard')}
                </Button>
              )}

              {showRetry && (
                <Button
                  type={showHome ? 'default' : 'primary'}
                  icon={<RotateCcw className="w-4 h-4 inline-block mr-1" />}
                  onClick={onRetry ?? (() => window.location.reload())}
                  size="large"
                >
                  {t('errorPage.tryAgain')}
                </Button>
              )}

              {showContact && (
                <Button
                  type="text"
                  icon={<Mail className="w-4 h-4 inline-block mr-1" />}
                  onClick={() => window.open('mailto:support@khposcommerce.com', '_blank')}
                  size="large"
                >
                  {t('errorPage.contactSupport')}
                </Button>
              )}
            </Space>
          }
        >
          {/* Path info pill */}
          <div className="text-center mt-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              {location.pathname}
            </span>
          </div>
        </Result>
      </div>
    </ConfigProvider>
  )
}

export default HttpErrorPage
