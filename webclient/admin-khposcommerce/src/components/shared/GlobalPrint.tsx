import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Printer, FileText, ShieldCheck, MapPin, Phone, Mail, Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CloseButton } from '@/components/common/buttons/CloseButton'
import { useCompanyStore } from '@/stores/companyStore'
import { useAuthStore } from '@/stores/authStore'
import { getAbsoluteImageUrl } from '@/utils/image'

/* ==========================================================================
   1. GLOBAL PRINT CONTAINER (DRAWER / MODAL WRAPPER)
   ========================================================================== */

export interface GlobalPrintContainerProps {
  isOpen: boolean
  onClose: () => void
  onPrint?: () => void
  modalTitle?: string
  documentSubtitle?: string
  children: React.ReactNode
  width?: string
  layout?: 'drawer' | 'modal'
  usePortal?: boolean
  contentClassName?: string
  printButtonText?: string
  closeButtonText?: string
  actionsPosition?: 'top' | 'bottom' | 'both'
  icon?: React.ReactNode
  pageOrientation?: 'portrait' | 'landscape'
}

export const GlobalPrintContainer: React.FC<GlobalPrintContainerProps> = ({
  isOpen,
  onClose,
  onPrint,
  modalTitle,
  documentSubtitle,
  children,
  width,
  layout = 'drawer',
  usePortal = true,
  contentClassName,
  printButtonText,
  closeButtonText,
  actionsPosition = 'top',
  icon,
  pageOrientation = 'portrait',
}) => {
  const { t } = useTranslation(['common', 'finance'])
  const isLandscape = pageOrientation === 'landscape'
  const defaultWidth = isLandscape ? 'max-w-6xl' : 'max-w-2xl sm:max-w-3xl'
  const containerWidth = width || defaultWidth

  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }, [onPrint])

  // Lock body scroll and mark print modal state when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('has-print-modal')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('has-print-modal')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('has-print-modal')
    }
  }, [isOpen])

  // Close on Escape key or print on Cmd+P / Ctrl+P
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p' && isOpen) {
        e.preventDefault()
        handlePrint()
      }
    },
    [isOpen, onClose, handlePrint]
  )

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const isDrawer = layout === 'drawer'

  const printContent = (
    <AnimatePresence>
      {isOpen && (
        <div id="global-print-active-canvas" className="fixed inset-0 z-[90] overflow-hidden print:p-0 print:static print:block print:overflow-visible print:h-auto print:max-h-none">
          {/* Dynamic page orientation style for print dialog */}
          <style>{`
            @media print {
              @page {
                size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'} !important;
                margin: ${isLandscape ? '6mm 8mm' : '8mm 10mm'} !important;
              }
            }
          `}</style>

          {/* Backdrop overlay */}
          <motion.div
            key="print-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity cursor-pointer print:hidden"
          />

          {/* Slide-over Drawer Panel (Sliding in from the Right) */}
          {isDrawer ? (
            <motion.div
              key="print-drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className={`fixed right-0 top-0 bottom-0 z-10 flex flex-col bg-white text-slate-900 border-l border-slate-200 shadow-2xl w-full ${containerWidth} print:shadow-none print:w-full print:max-w-none print:static print:h-auto print:max-h-none print:overflow-visible print:border-none print:block`}
            >
              {/* Top Toolbar Header (Hidden on physical print) */}
              <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md shrink-0 print:hidden select-none">
                <div className="space-y-0.5 pt-0.5">
                  <div className="flex items-center gap-2">
                    {icon || <FileText className="h-4.5 w-4.5 text-primary shrink-0" />}
                    <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      {modalTitle || t('common.document_preview', 'Official Document Preview')}
                    </h2>
                  </div>
                  {documentSubtitle && (
                    <p className="text-[11px] text-slate-500 font-medium pl-6.5">
                      {documentSubtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 pt-0.5">
                  {actionsPosition !== 'bottom' && (
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer select-none"
                    >
                      <Printer size={15} />
                      <span>{printButtonText || t('common.print', 'Print / PDF')}</span>
                    </button>
                  )}
                  <CloseButton onClose={onClose} size="md" variant="default" />
                </div>
              </div>

              {/* Scrollable Printable Document Canvas */}
              <div className={`flex-1 overflow-y-auto ${contentClassName || 'p-6 sm:p-8 bg-white'} print:p-6 print:m-0 print:overflow-visible print:h-auto print:max-h-none print:block [print-color-adjust:exact] [-webkit-print-color-adjust:exact]`}>
                {children}
              </div>

              {/* Drawer Bottom Action Buttons Footer */}
              {(actionsPosition === 'bottom' || actionsPosition === 'both') && (
                <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200 print:hidden select-none shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer select-none"
                  >
                    {closeButtonText || t('common.close', 'Close')}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer select-none"
                  >
                    <Printer size={15} />
                    <span>{printButtonText || t('common.print', 'Print / PDF')}</span>
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* Centered Modal Mode (Official Document Preview) */
            <div className="fixed inset-0 z-10 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:block print:overflow-visible print:h-auto print:max-h-none">
              <motion.div
                key="print-modal-panel"
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full ${containerWidth} bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] z-10 print:shadow-none print:w-full print:max-w-none print:rounded-none print:m-0 print:border-none print:h-auto print:max-h-none print:overflow-visible print:block print:static`}
              >
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden select-none shrink-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {icon || <FileText className="h-4.5 w-4.5 text-primary" />}
                      <span className="font-bold text-sm text-slate-900">
                        {modalTitle || t('common.document_preview', 'Official Document Preview')}
                      </span>
                    </div>
                    {documentSubtitle && (
                      <p className="text-[11px] text-slate-500 font-medium pl-6.5">
                        {documentSubtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {actionsPosition !== 'bottom' && (
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer select-none"
                      >
                        <Printer size={15} />
                        <span>{printButtonText || t('common.print', 'Print / PDF')}</span>
                      </button>
                    )}
                    <CloseButton onClose={onClose} size="md" variant="default" />
                  </div>
                </div>
                <div className={`overflow-y-auto flex-1 ${contentClassName || 'p-6 sm:p-8 space-y-6 bg-white text-slate-900'} print:p-6 print:m-0 print:overflow-visible print:h-auto print:max-h-none print:block [print-color-adjust:exact] [-webkit-print-color-adjust:exact]`}>
                  {children}
                </div>

                {/* Modal Bottom Action Buttons Footer */}
                {(actionsPosition === 'bottom' || actionsPosition === 'both') && (
                  <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200 print:hidden select-none shrink-0">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer select-none"
                    >
                      {closeButtonText || t('common.close', 'Close')}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer select-none"
                    >
                      <Printer size={15} />
                      <span>{printButtonText || t('common.print', 'Print / PDF')}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  )

  if (!usePortal || typeof document === 'undefined') {
    return printContent
  }

  return createPortal(printContent, document.body)
}

/* ==========================================================================
   2. GLOBAL PRINT HEADER (ENTERPRISE LETTERHEAD & VOUCHER TITLE)
   ========================================================================== */

export interface CompanyPrintInfo {
  name?: string
  tagline?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  vatNumber?: string
  logoUrl?: string
  branchName?: string
  branchAddress?: string
  branchPhone?: string
}

export interface GlobalPrintHeaderProps {
  title?: string
  subtitleKhmer?: string
  subtitleEnglish?: string
  documentTypeLabel?: string
  referenceNumber: string
  referenceLabel?: string
  date?: string | Date | null
  dateLabel?: string
  status?: string
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  companyInfo?: CompanyPrintInfo
  branchName?: string
  extraMeta?: Array<{ label: string; value: string }>
  showCenterTitle?: boolean
}

const formatDisplayDate = (d: string | Date | null | undefined, locale = 'km-KH'): string => {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return typeof d === 'string' ? d : '—'
  
  if (locale.startsWith('km')) {
    const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
    return `ថ្ងៃទី ${date.getDate()} ខែ${khmerMonths[date.getMonth()]} ឆ្នាំ${date.getFullYear()}`
  }
  
  return date.toLocaleDateString(locale, { dateStyle: 'medium' })
}

export const GlobalPrintHeader: React.FC<GlobalPrintHeaderProps> = ({
  title,
  subtitleKhmer: _subtitleKhmer,
  subtitleEnglish,
  documentTypeLabel: _documentTypeLabel,
  referenceNumber,
  referenceLabel,
  date,
  dateLabel,
  status,
  companyInfo,
  branchName,
  extraMeta = [],
  showCenterTitle = false,
}) => {
  const { t, i18n } = useTranslation(['finance', 'returns', 'orders', 'common'])
  const { branding } = useCompanyStore()
  const { user: authUser } = useAuthStore()
  const currentLocale = i18n.language === 'km' ? 'km-KH' : i18n.language

  // ── Dynamic Real Store & Company Data ─────────────────────────────────────
  const rawLogo = companyInfo?.logoUrl || branding.logo || authUser?.company?.logo || '/logo.png'
  const logoUrl = getAbsoluteImageUrl(rawLogo) || '/logo.png'

  const resolvedCompanyName =
    companyInfo?.name ||
    branding.company_name ||
    branding.brand_name ||
    authUser?.company?.name ||
    'NEXTECH TBONG KHMUM'

  const resolvedTagline =
    companyInfo?.tagline ||
    branding.brand_tagline ||
    'Enterprise POS & Retail Commerce'

  const resolvedBranch =
    branchName ||
    companyInfo?.branchName ||
    authUser?.branch?.name ||
    'សាខាខេត្តត្បូងឃ្មុំ (Tbong Khmum Branch)'

  const resolvedAddress =
    companyInfo?.address ||
    branding.address ||
    authUser?.company?.address ||
    'Phum Tbong Khmum, Khum Tbong Khmum, Tbong Khmum Province'

  const resolvedPhone =
    companyInfo?.phone ||
    branding.phone ||
    (authUser?.company as any)?.phone ||
    '+855 (0) 23 999 888'

  const resolvedEmail =
    companyInfo?.email ||
    branding.email ||
    (authUser?.company as any)?.email ||
    'finance@nextech-pos.com'

  const refLabel = referenceLabel || t('finance.voucher_no', 'Voucher #')
  const dLabel = dateLabel || t('finance.date_col', 'Date')
  const docTitle = title || t('finance.voucher_title', 'OFFICIAL EXPENSE PAYMENT VOUCHER')
  const docSubtitle = subtitleEnglish || t('finance.voucher_subtitle', 'OFFICIAL EXPENSE PAYMENT VOUCHER')

  const getStatusText = (st?: string) => {
    if (!st) return t('finance.status_approved', 'Approved')
    const lower = st.toLowerCase()
    if (lower === 'approved' || lower === 'active') return t('finance.status_approved', 'Active / Approved')
    if (lower === 'pending') return t('finance.status_pending', 'Pending')
    if (lower === 'rejected' || lower === 'hold') return t('finance.status_rejected', 'Credit Hold / Inactive')
    if (i18n.exists(`returns.statuses.${lower}`)) return t(`returns.statuses.${lower}`)
    if (i18n.exists(`orders.statuses.${lower}`)) return t(`orders.statuses.${lower}`)
    return st.toUpperCase()
  }

  return (
    <div className="w-full select-none pb-3 mb-3 border-b border-slate-300 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      {/* ─── 1. Unified Clean Enterprise Letterhead ─────────────────────────── */}
      <div className="flex justify-between items-start gap-6">
        
        {/* Left Column: Brand Logo + Clean Store Identity */}
        <div className="flex items-start gap-3 max-w-[52%]">
          {/* Logo container */}
          <div
            style={{
              width: '46px',
              height: '46px',
              minWidth: '46px',
              minHeight: '46px',
              maxWidth: '46px',
              maxHeight: '46px',
            }}
            className="w-[46px] h-[46px] min-w-[46px] min-h-[46px] max-w-[46px] max-h-[46px] rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-none"
          >
            <img
              src={logoUrl}
              alt={resolvedCompanyName}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              className="w-full h-full max-w-full max-h-full object-contain block shrink-0"
              onError={(e) => {
                const target = e.target as HTMLElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent && !parent.querySelector('.fallback-monogram')) {
                  const mono = document.createElement('div')
                  mono.className = 'fallback-monogram w-full h-full bg-slate-900 text-white rounded flex items-center justify-center font-black text-sm'
                  mono.innerText = resolvedCompanyName.charAt(0).toUpperCase() || 'N'
                  parent.appendChild(mono)
                }
              }}
            />
          </div>

          {/* Store Name, Branch, and Clean Contact Hierarchy */}
          <div className="space-y-0.5 text-xs text-slate-800">
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-tight text-slate-950 uppercase leading-none">
                {resolvedCompanyName}
              </h1>
              <p className="text-[9.5px] text-slate-500 font-medium tracking-normal mt-0.5">
                {resolvedTagline}
              </p>
            </div>

            {resolvedBranch && (
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700">
                <Store size={10} className="text-slate-500 shrink-0" />
                <span>{resolvedBranch}</span>
              </div>
            )}

            <div className="text-[9px] space-y-0.5 text-slate-500 leading-tight pt-0.5">
              <p className="flex items-center gap-1">
                <MapPin size={8.5} className="text-slate-400 shrink-0" />
                <span>{resolvedAddress}</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap font-mono">
                <span className="flex items-center gap-1">
                  <Phone size={8.5} className="text-slate-400 shrink-0" />
                  <span>{resolvedPhone}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail size={8.5} className="text-slate-400 shrink-0" />
                  <span>{resolvedEmail}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Document Title & Clean Reference Details */}
        <div className="text-right space-y-1 min-w-[220px] max-w-[46%] shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-950 leading-tight">
              {docTitle}
            </h2>
            {docSubtitle && docSubtitle !== docTitle && (
              <p className="text-[8.5px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
                {docSubtitle}
              </p>
            )}
          </div>

          <div className="space-y-0.5 pt-0.5 text-[10px]">
            <div className="flex justify-end items-baseline gap-1.5">
              <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">
                {refLabel}:
              </span>
              <span className="font-mono font-bold text-xs text-slate-950">
                {referenceNumber}
              </span>
            </div>

            <div className="flex justify-end items-baseline gap-1.5 text-slate-600">
              <span className="text-[9px] uppercase font-medium text-slate-500 tracking-wider">{dLabel}:</span>
              <span className="font-medium text-slate-800 text-[9.5px]">{formatDisplayDate(date, currentLocale)}</span>
            </div>

            {status && (
              <div className="flex justify-end items-baseline gap-1.5 pt-0.5">
                <span className="text-[9px] uppercase font-medium text-slate-500 tracking-wider">{t('finance.status_col', 'Status')}:</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                  {getStatusText(status)}
                </span>
              </div>
            )}

            {extraMeta.map((meta, i) => (
              <div key={i} className="flex justify-end items-baseline gap-1.5 text-[9px]">
                <span className="text-slate-500">{meta.label}:</span>
                <span className="font-semibold text-slate-900">{meta.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── 2. Optional Centered Banner (Only if explicitly enabled) ──────── */}
      {showCenterTitle && (
        <div className="text-center pt-2 pb-1 border-t border-slate-200 mt-2">
          <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
            {docTitle}
          </h2>
          {docSubtitle && docSubtitle !== docTitle && (
            <p className="text-[9.5px] font-bold tracking-[0.18em] text-slate-500 uppercase mt-0.5">
              {docSubtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   3. GLOBAL PRINT FOOTER (SIGNATURES, LEGAL NOTICE & SYSTEM WATERMARK)
   ========================================================================== */

export interface PrintSignatureRole {
  titleKhmer?: string
  titleEnglish?: string
  titleLocalized?: string
  name?: string
  role?: string
  date?: string
}

export interface GlobalPrintFooterProps {
  signatures?: PrintSignatureRole[]
  noticeText?: string
  showTimestamp?: boolean
  customWatermark?: string
  pageNumberText?: string
}

const formatPrintDateTime = (d: Date = new Date(), _locale = 'km-KH'): string => {
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year} ${hours}:${minutes}`
}

export const GlobalPrintFooter: React.FC<GlobalPrintFooterProps> = ({
  signatures,
  noticeText,
  showTimestamp = true,
  customWatermark,
  pageNumberText,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const currentLocale = i18n.language === 'km' ? 'km-KH' : i18n.language

  const defaultSigs: PrintSignatureRole[] = [
    {
      titleLocalized: t('finance.prepared_by', 'Prepared By'),
      name: 'Staff Member',
      role: t('finance.applicant_role', 'Applicant / Staff'),
    },
    {
      titleLocalized: t('finance.verified_by', 'Verified By'),
      name: 'Super Admin',
      role: t('finance.accountant_role', 'Finance Officer / Cashier'),
    },
    {
      titleLocalized: t('finance.authorized_by', 'Authorized By'),
      name: 'Finance Director',
      role: t('finance.manager_role', 'Managing Director / Approver'),
    },
  ]

  const activeSignatures = signatures && signatures.length > 0 ? signatures : defaultSigs
  const currentDateTimeStr = formatPrintDateTime(new Date(), currentLocale)
  const watermark = customWatermark || t('finance.print_watermark', 'Enterprise POS System • Certified Financial Audit Voucher')
  const pageText = pageNumberText || `${t('common.page', 'Page')} 1 / 1`

  const getGridColsStyle = (count: number) => {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
    }
  }

  return (
    <div className="w-full pt-3 mt-4 border-t border-slate-300 select-none space-y-3 [print-color-adjust:exact] [-webkit-print-color-adjust:exact] print:break-inside-avoid">
      {/* Optional Legal / Contract Notice */}
      {noticeText && (
        <div className="text-[9.5px] text-slate-600 leading-relaxed border-l-2 border-slate-400 pl-2.5 bg-slate-50 py-1 rounded-r font-normal">
          {noticeText}
        </div>
      )}

      {/* Dynamic Signatures Grid */}
      <div
        style={getGridColsStyle(activeSignatures.length)}
        className="gap-8 text-center text-xs pt-2"
      >
        {activeSignatures.map((sig, idx) => (
          <div key={idx} className="space-y-6 flex flex-col justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 text-[10.5px] uppercase tracking-wider">
                {sig.titleLocalized || sig.titleKhmer || sig.titleEnglish}
              </p>
              {sig.titleEnglish && sig.titleKhmer && (
                <p className="text-[8.5px] text-slate-400 font-medium tracking-wide">
                  ({sig.titleEnglish})
                </p>
              )}
            </div>

            <div className="pt-2 text-[9.5px] text-slate-700 space-y-0.5">
              <div className="w-3/4 mx-auto border-b border-slate-300 mb-2"></div>
              <p className="font-bold text-slate-900 truncate">
                {sig.name || '__________________________'}
              </p>
              <p className="text-[8.5px] text-slate-500 font-medium">
                {sig.role || 'Authorized Signatory'}
              </p>
              {sig.date && (
                <p className="text-[8px] text-slate-400 font-mono pt-0.5">
                  {t('finance.date_col', 'Date')}: {sig.date}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* System Watermark / Footer Timestamp */}
      <div className="flex justify-between items-center text-[8.5px] text-slate-400 pt-2 border-t border-slate-200 font-mono">
        <div className="flex items-center gap-1">
          <ShieldCheck size={10} className="text-slate-400 shrink-0" />
          <span>{watermark}</span>
        </div>
        <div className="flex items-center gap-3">
          {showTimestamp && (
            <span>{t('finance.printed_on', 'Generated on')}: {currentDateTimeStr}</span>
          )}
          <span>{pageText}</span>
        </div>
      </div>
    </div>
  )
}

export default GlobalPrintContainer
