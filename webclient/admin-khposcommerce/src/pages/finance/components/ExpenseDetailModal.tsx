import React, { useState } from 'react'
import {
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Maximize2,
  X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'
import { getStorageFileUrl } from '@/utils/image'
import { useToast } from '@/hooks/useToast'
import { Image as AntImage } from 'antd'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
  ActionButton,
} from '@/components/common'

interface ExpenseDetailModalProps {
  expense: any | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (expense: any) => void
  onPrintOfficialVoucher?: (expense: any) => void
  onApprove?: (id: number) => void
  onReject?: (id: number) => void
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  isOpen,
  onClose,
  onEdit,
  onPrintOfficialVoucher,
  onApprove,
  onReject,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const currentLocale = i18n.language === 'km' ? 'km-KH' : 'en-US'
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false)

  if (!expense) return null

  const referenceNo = expense.reference_number || `EXP-${String(expense.id).padStart(5, '0')}`
  const amount = Number(expense.amount || 0)
  const status = expense.status || 'approved'
  const categoryName =
    expense.category?.name ||
    (typeof expense.expense_category === 'object' ? expense.expense_category?.name : expense.expense_category) ||
    expense.category_name ||
    t('finance.all_categories', 'Operational Expense')
  const receiptUrl = getStorageFileUrl(expense.receipt)
  const isPdf = Boolean(expense.receipt && expense.receipt.toLowerCase().endsWith('.pdf'))

  const copyReference = () => {
    navigator.clipboard.writeText(referenceNo)
    setCopied(true)
    toast.success(t('common.copied', 'Copied to clipboard!'))
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    if (onPrintOfficialVoucher) {
      onPrintOfficialVoucher(expense)
    } else {
      window.print()
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={13} />
            <span>{t('finance.status_approved', 'Approved')}</span>
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock size={13} />
            <span>{t('finance.status_pending', 'Pending Review')}</span>
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle size={13} />
            <span>{t('finance.status_rejected', 'Rejected')}</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
            <span>{status}</span>
          </span>
        )
    }
  }

  const formatExpenseDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    if (i18n.language === 'km') {
      const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
      const day = d.getDate()
      const month = khmerMonths[d.getMonth()]
      const year = d.getFullYear()
      return `ថ្ងៃទី ${day} ខែ${month} ឆ្នាំ${year}`
    }
    return d.toLocaleDateString(currentLocale, { dateStyle: 'medium' })
  }

  const branchDisplayName =
    expense.branch_id === 1 || expense.branch?.id === 1 || expense.branch?.name === 'Head Office 1'
      ? t('finance.main_branch', 'Headquarters (HQ Main Branch)')
      : (expense.branch?.name || t('finance.main_branch', 'Headquarters (HQ Main Branch)'))

  const descriptionText =
    !expense.description || expense.description === 'Regular business operational expense.'
      ? t('finance.default_regular_desc', 'Regular business operational expense recorded in general ledger.')
      : expense.description

  return (
    <>
      <DetailDrawer
        isOpen={isOpen && !!expense}
        onClose={onClose}
        size="xl"
      >
        {/* Global Header */}
        <DetailDrawerHeader
          icon={<Receipt size={20} />}
          iconVariant="rose"
          title={t('finance.expense_details', 'Expense Voucher Details')}
          subtitle={t('finance.recorded_financial_outlay', 'Recorded financial operational outlay')}
          badge={getStatusBadge()}
          actions={
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={t('finance.print_voucher', 'Print Voucher')}
            >
              <Printer size={17} />
            </button>
          }
          onClose={onClose}
        />

        {/* Global Body */}
        <DetailDrawerBody>
          {/* Spotlight Amount Card */}
          <div className="bg-gradient-to-br from-rose-500/[0.07] via-card to-amber-500/[0.04] border border-rose-500/20 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('finance.total_outlay', 'Total Outlay Amount')}
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                USD ($)
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                {formatCurrency(amount, { locale: currentLocale })}
              </div>
              <button
                onClick={copyReference}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-card border border-border text-foreground hover:bg-muted/80 transition-colors shadow-2xs cursor-pointer select-none"
                title={t('common.copy', 'Copy reference')}
              >
                <span>{referenceNo}</span>
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="text-muted-foreground" />}
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-2 text-xs flex-wrap">
              <span className="text-muted-foreground font-medium truncate">
                {expense.title || t('finance.untitled_expense', 'Untitled Expense')}
              </span>
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg border border-border bg-muted text-foreground text-xs font-semibold shrink-0">
                <span>{categoryName}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Transaction Information */}
          <DetailDrawerCard
            title={t('finance.general_info', 'Transaction Information')}
          >
            <DetailDrawerRow
              label={t('finance.date_col', 'Expense Date')}
              value={formatExpenseDate(expense.date)}
            />
            <DetailDrawerRow
              label={t('finance.branch', 'Branch / Department')}
              value={branchDisplayName}
            />
            <DetailDrawerRow
              label={t('finance.category_col', 'Category')}
              value={categoryName}
            />
            
            {/* Description & Operational Notes Box */}
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t('finance.description_col', 'Description & Notes')}
              </p>
              <p className="text-xs text-foreground leading-relaxed font-medium bg-muted/40 p-3 rounded-xl border border-border/60">
                {descriptionText}
              </p>
            </div>
          </DetailDrawerCard>

          {/* Section 2: Digital Invoice / Receipt File */}
          <DetailDrawerCard
            title={t('finance.receipt_attachment', 'Digital Invoice Attachment')}
            badge={
              expense.receipt ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={11} />
                  {t('finance.receipt_verified', 'Attached File')}
                </span>
              ) : undefined
            }
          >
            {expense.receipt ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      <Receipt size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{expense.receipt}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {isPdf ? t('finance.pdf_doc_voucher', 'PDF Document / Voucher') : t('finance.voucher_digital_type', 'Digital Image / PDF voucher')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPdf) {
                          setLightboxOpen(true)
                        } else {
                          setImagePreviewVisible(true)
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-2xs cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>{t('common.view', 'View')}</span>
                    </button>
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors cursor-pointer"
                      title={t('common.openInNewTab', 'Open in new tab')}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Image Preview if it's an image */}
                {!isPdf && (
                  <div className="rounded-xl overflow-hidden border border-border bg-black/5 dark:bg-black/40 p-2 flex items-center justify-center">
                    <AntImage
                      src={receiptUrl}
                      alt="Receipt Preview"
                      className="max-h-56 object-contain rounded-lg w-full transition-transform hover:scale-[1.01]"
                      wrapperClassName="w-full flex items-center justify-center cursor-pointer"
                      preview={{
                        visible: imagePreviewVisible,
                        onVisibleChange: (val) => setImagePreviewVisible(val),
                        mask: (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-white drop-shadow-md">
                            <Maximize2 size={15} />
                            <span>{t('finance.fullscreen_preview', 'Preview Fullscreen')}</span>
                          </div>
                        ),
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground border-2 border-dashed border-border/70 rounded-2xl bg-muted/10">
                <p className="font-medium">{t('finance.no_receipt_attached', 'No digital receipt attached for this entry.')}</p>
              </div>
            )}
          </DetailDrawerCard>

          {/* Barcode & Verification Footer Card */}
          <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 dark:bg-muted/10 text-center space-y-1 relative">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {t('finance.verified_voucher', 'Verified Voucher')}
            </div>
            <div className="text-[10px] font-mono tracking-widest text-muted-foreground/70 uppercase">
              ||||| ||| ||||||| |||| |||||||| ||| |||||
            </div>
            <div className="text-[11px] font-mono font-bold text-muted-foreground">
              {referenceNo}
            </div>
          </div>
        </DetailDrawerBody>

        {/* Global Footer */}
        <DetailDrawerFooter
          onClose={onClose}
          closeLabel={t('common.close', 'Close')}
          leftActions={
            <ActionButton
              icon={<Printer size={14} />}
              variant="secondary"
              onClick={handlePrint}
            >
              {t('finance.print_voucher', 'Voucher')}
            </ActionButton>
          }
          rightActions={
            <>
              {status === 'pending' && onReject && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onReject(expense.id)
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
                >
                  <XCircle size={14} />
                  <span>{t('finance.reject_btn', 'Reject')}</span>
                </button>
              )}

              {status === 'pending' && onApprove && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onApprove(expense.id)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer shadow-xs"
                >
                  <CheckCircle2 size={14} />
                  <span>{t('finance.approve_btn', 'Approve')}</span>
                </button>
              )}

              {onEdit && (
                <ActionButton
                  icon={<Edit size={14} />}
                  variant="primary"
                  onClick={() => {
                    onClose()
                    onEdit(expense)
                  }}
                >
                  {t('finance.edit_expense_btn', 'Edit Voucher')}
                </ActionButton>
              )}
            </>
          }
        />
      </DetailDrawer>

      {/* Lightbox / Fullscreen Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2.5 min-w-0">
                <Receipt size={18} className="text-primary shrink-0" />
                <span className="text-sm font-bold text-foreground truncate">{expense.receipt}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Content */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/5 dark:bg-black/40 min-h-[400px]">
              {isPdf ? (
                <iframe
                  src={receiptUrl}
                  title="PDF Document"
                  className="w-full h-[70vh] rounded-xl border border-border bg-white"
                />
              ) : (
                <AntImage
                  src={receiptUrl}
                  alt="Receipt Attachment Preview"
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-md"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ExpenseDetailModal
