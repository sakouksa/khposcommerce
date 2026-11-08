import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Loader2 } from 'lucide-react'
import FormHeader, { type FormHeaderProps } from './FormHeader'
import FormFooter, { type FormFooterProps } from './FormFooter'
import LoadingSpinner from '../feedback/LoadingSpinner'

// ─── ICON VARIANTS ────────────────────────────────────────────────────────────

export type FormCardIconVariant =
  | 'primary'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'purple'
  | 'rose'
  | 'indigo'
  | 'slate'

const ICON_VARIANT_STYLES: Record<FormCardIconVariant, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
}

// ─── CONTAINER MAX-WIDTH HELPER ───────────────────────────────────────────────

export type FormMaxWidth =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | 'full'
  | string

const MAX_WIDTH_MAP: Record<string, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'w-full',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'w-full max-w-none',
}

const resolveMaxWidth = (width?: FormMaxWidth): string => {
  if (!width) return 'w-full'
  return MAX_WIDTH_MAP[width] || (width.startsWith('max-w-') ? width : `max-w-[${width}]`)
}

// ─── 1. FORM CARD COMPONENT ───────────────────────────────────────────────────

export interface FormCardProps {
  /** Title of the card/section */
  title: React.ReactNode
  /** Subtitle or explanatory text */
  subtitle?: React.ReactNode
  /** Leading icon for card header */
  icon?: React.ReactNode
  /** Icon badge container color variant */
  iconVariant?: FormCardIconVariant
  /** Right badge (e.g. status, contract type, count) */
  badge?: React.ReactNode
  /** Right action buttons (e.g. toggle, settings, auto-generate) */
  action?: React.ReactNode
  /** Enable collapsible accordion behavior */
  collapsible?: boolean
  /** Initial state if collapsible is true (default: true) */
  defaultOpen?: boolean
  /** Controlled open state for accordion */
  isOpen?: boolean
  /** Callback on toggle */
  onToggle?: (open: boolean) => void
  /** Show border line below card header (default: false) */
  divider?: boolean
  /** Card body content */
  children: React.ReactNode
  /** Custom wrapper CSS class */
  className?: string
  /** Custom header container CSS class */
  headerClassName?: string
  /** Custom content container CSS class */
  contentClassName?: string
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  subtitle,
  icon,
  iconVariant = 'primary',
  badge,
  action,
  collapsible = false,
  defaultOpen = true,
  isOpen: controlledOpen,
  onToggle,
  divider = false,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isExpanded = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen

  const handleToggle = () => {
    if (!collapsible) return
    const nextState = !isExpanded
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextState)
    }
    onToggle?.(nextState)
  }

  const iconStyle = ICON_VARIANT_STYLES[iconVariant] || ICON_VARIANT_STYLES.primary

  return (
    <div
      className={`bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xs transition-all duration-200 ${className}`}
    >
      {/* Card Header */}
      <div
        onClick={collapsible ? handleToggle : undefined}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          collapsible ? 'cursor-pointer select-none group' : ''
        } ${divider ? 'pb-4 border-b border-border/70 dark:border-slate-800' : ''} ${headerClassName}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {icon && (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 transition-transform ${
                collapsible ? 'group-hover:scale-105' : ''
              } ${iconStyle}`}
            >
              {icon}
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-foreground dark:text-slate-100 tracking-tight">
                {title}
              </h3>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-center ml-auto shrink-0">
          {action}
          {collapsible && (
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-muted dark:hover:bg-slate-800 text-muted-foreground transition-colors cursor-pointer"
              aria-label="Toggle section"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      {collapsible ? (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className={`${divider ? 'pt-5' : 'pt-6'} ${contentClassName}`}>{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className={`${divider ? 'pt-5' : 'pt-6'} ${contentClassName}`}>{children}</div>
      )}
    </div>
  )
}

// ─── 2. FORM SECTION COMPONENT (SUB-SECTION INSIDE CARD) ──────────────────────

export interface FormSectionProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  divider?: boolean
  children: React.ReactNode
  className?: string
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  divider = false,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${divider ? 'pt-5 border-t border-border/70 dark:border-slate-800/80' : ''} ${className}`}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && <h4 className="text-xs sm:text-sm font-bold text-foreground dark:text-slate-200">{title}</h4>}
          {subtitle && <p className="text-[11px] text-muted-foreground dark:text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── 3. FORM CONTENT / BODY COMPONENT ─────────────────────────────────────────

export interface FormContentProps {
  /** Maximum container width constraint */
  maxWidth?: FormMaxWidth
  /** Custom layout styles ('stack', 'grid-2', 'two-column', 'custom') */
  layout?: 'stack' | 'grid-2' | 'two-column' | 'custom'
  children: React.ReactNode
  className?: string
}

export const FormContent: React.FC<FormContentProps> = ({
  maxWidth = '3xl',
  layout = 'stack',
  children,
  className = '',
}) => {
  const maxWidthCls = resolveMaxWidth(maxWidth)

  let layoutCls = 'space-y-6'
  if (layout === 'grid-2') {
    layoutCls = 'grid grid-cols-1 md:grid-cols-2 gap-6 items-start'
  } else if (layout === 'two-column') {
    layoutCls = 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
  } else if (layout === 'custom') {
    layoutCls = ''
  }

  return (
    <div className={`w-full ${maxWidthCls} ${layoutCls} ${className}`}>
      {children}
    </div>
  )
}

// ─── 4. MAIN FORM LAYOUT CONTAINER ────────────────────────────────────────────

export interface FormLayoutProps {
  /** Form submission handler */
  onSubmit?: (e: React.FormEvent) => void
  /** Prevent HTML5 default validation tooltips */
  noValidate?: boolean
  /** Loading state (displays centered spinner or skeleton) */
  isLoading?: boolean
  /** Loading text message */
  loadingText?: string
  /** Submitting state */
  isSubmitting?: boolean
  /** Form Header element or prop */
  header?: React.ReactNode
  /** Alternatively provide header props directly */
  headerProps?: FormHeaderProps
  /** Form Footer element or prop */
  footer?: React.ReactNode
  /** Alternatively provide footer props directly */
  footerProps?: FormFooterProps
  /** Stick footer to bottom of viewport with blur backdrop (default: false) */
  stickyFooter?: boolean
  /** Maximum width for form content */
  maxWidth?: FormMaxWidth
  /** Main form contents / cards */
  children: React.ReactNode
  /** Custom wrapper CSS class */
  className?: string
  /** Custom form element CSS class */
  formClassName?: string
}

export const FormLayoutComponent: React.FC<FormLayoutProps> = ({
  onSubmit,
  noValidate = true,
  isLoading = false,
  loadingText,
  isSubmitting = false,
  header,
  headerProps,
  footer,
  footerProps,
  stickyFooter = false,
  maxWidth = '3xl',
  children,
  className = '',
  formClassName = '',
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center gap-3">
        <LoadingSpinner />
        {loadingText && (
          <p className="text-xs text-muted-foreground font-medium animate-pulse">{loadingText}</p>
        )}
      </div>
    )
  }

  const resolvedHeader = header || (headerProps ? <FormHeader {...headerProps} /> : null)
  const resolvedFooter =
    footer ||
    (footerProps ? (
      <FormFooter
        sticky={stickyFooter}
        isSubmitting={isSubmitting || footerProps.isSubmitting}
        {...footerProps}
      />
    ) : null)

  const contentBlock = (
    <div className="space-y-8">
      {/* Form Content / Cards */}
      {children}

      {/* Form Footer */}
      {resolvedFooter}
    </div>
  )

  return (
    <div className={`space-y-6 pb-12 w-full transition-all ${className}`}>
      {/* 1. Global Form Header */}
      {resolvedHeader}

      {/* 2. Form Tag or Div Container */}
      {onSubmit ? (
        <form onSubmit={onSubmit} noValidate={noValidate} className={`space-y-8 ${formClassName}`}>
          {contentBlock}
        </form>
      ) : (
        <div className={`space-y-8 ${formClassName}`}>{contentBlock}</div>
      )}
    </div>
  )
}

// ─── COMPOUND COMPONENT ASSIGNMENT ────────────────────────────────────────────

export type FormLayoutType = typeof FormLayoutComponent & {
  Header: typeof FormHeader
  Content: typeof FormContent
  Body: typeof FormContent
  Card: typeof FormCard
  Section: typeof FormSection
  Footer: typeof FormFooter
}

export const FormLayout = FormLayoutComponent as FormLayoutType
FormLayout.Header = FormHeader
FormLayout.Content = FormContent
FormLayout.Body = FormContent
FormLayout.Card = FormCard
FormLayout.Section = FormSection
FormLayout.Footer = FormFooter

export default FormLayout
