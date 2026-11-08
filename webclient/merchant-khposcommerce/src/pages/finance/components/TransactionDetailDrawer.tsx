import React, { useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Wallet,
  QrCode,
  Banknote,
  Trash2,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDisplayDate, CAMBODIA_TIMEZONE } from '@/utils/formatters'
import { useToast } from '@/hooks/useToast'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
  ActionButton,
} from '@/components/common'
import { Button } from '@/components/ui/button'

interface TransactionDetailDrawerProps {
  transaction: any | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: number, name?: string) => void
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transaction,
  isOpen,
  onClose,
  onDelete,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const currentLocale = i18n.language === 'km' ? 'km-KH' : 'en-US'
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  if (!transaction) return null

  const isCredit = transaction.type?.toLowerCase() === 'credit'
  const amount = Math.abs(Number(transaction.amount || 0))

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const datePart = formatDisplayDate(d, { locale: currentLocale })
      const timePart = d.toLocaleTimeString(currentLocale, {
        timeZone: CAMBODIA_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      return `${datePart}, ${timePart}`
    } catch {
      return dateStr
    }
  }

  const getRefTypeLabel = (type?: string) => {
    if (!type) return t('finance.ref_col', 'Reference')
    const clean = type.split('\\').pop() || type
    if (clean.toLowerCase().includes('order')) return t('finance.ref_order', 'Order')
    if (clean.toLowerCase().includes('expense')) return t('finance.ref_expense', 'Expense')
    if (clean.toLowerCase().includes('purchase')) return t('finance.ref_purchase', 'Purchase')
    if (clean.toLowerCase().includes('register')) return t('finance.ref_register', 'Cash Register')
    return clean
  }

  const refTypeLabel = getRefTypeLabel(transaction.reference_type)
  const refText = transaction.reference_id ? `${refTypeLabel} #${transaction.reference_id}` : ''

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t('common.copied', 'Copied to clipboard!'))
    setTimeout(() => setCopied(false), 2000)
  }

  const getMethodBadge = (name?: string) => {
    if (!name) return <span className="text-muted-foreground/50 text-xs">—</span>
    const lower = name.toLowerCase()

    if (lower.includes('aba') || lower.includes('khqr')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25">
          <QrCode size={13} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>{name}</span>
        </span>
      )
    }

    if (lower.includes('wing')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
          <Wallet size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{name}</span>
        </span>
      )
    }

    if (lower.includes('acleda')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25">
          <Building2 size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{name}</span>
        </span>
      )
    }

    if (lower.includes('cash') || lower.includes('cod') || lower.includes('សាច់ប្រាក់')) {
      const displayName =
        lower.includes('cod') || lower.includes('delivery')
          ? t('finance.pm_cod', 'Cash on Delivery (COD)')
          : name

      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
          <Banknote size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{displayName}</span>
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
        <CreditCard size={13} className="shrink-0" />
        <span>{name}</span>
      </span>
    )
  }

  const rawCompany = transaction.company?.name || (transaction.company_id ? `Company #${transaction.company_id}` : '')
  const companyParts = rawCompany.split(' - ')
  const mainCompany = companyParts[0]?.trim()
  const branchName = companyParts.length > 1 ? companyParts.slice(1).join(' - ').trim() : ''

  return (
    <DetailDrawer isOpen={isOpen} onClose={onClose} size="lg">
      {/* Header */}
      <DetailDrawerHeader
        title={
          <div className="flex items-center gap-2">
            <span>{t('finance.transaction_detail', 'Transaction Details')}</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              #{transaction.id}
            </span>
          </div>
        }
        subtitle={
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={13} className="shrink-0 text-primary/70" />
            <span>{formatDateTime(transaction.created_at)}</span>
          </span>
        }
        icon={isCredit ? <ArrowDownRight size={20} strokeWidth={2.5} /> : <ArrowUpRight size={20} strokeWidth={2.5} />}
        iconVariant={isCredit ? 'rose' : 'emerald'}
        badge={
          isCredit ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25 shadow-2xs">
              <ArrowDownRight size={13} strokeWidth={2.5} />
              <span>{t('finance.type_outflow', 'Credit Outflow')}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs">
              <ArrowUpRight size={13} strokeWidth={2.5} />
              <span>{t('finance.type_inflow', 'Debit Inflow')}</span>
            </span>
          )
        }
        onClose={onClose}
      />

      {/* Body */}
      <DetailDrawerBody className="space-y-4 p-5">
        {/* Highlight Amount Banner */}
        <div
          className={`rounded-2xl p-5 border flex items-center justify-between ${
            isCredit
              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50'
              : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isCredit ? t('finance.total_outflow', 'Total Outflow') : t('finance.total_inflow', 'Total Inflow')}
            </p>
            <p
              className={`text-3xl font-extrabold font-mono mt-1 tabular-nums tracking-tight ${
                isCredit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isCredit ? '-' : '+'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-background/80 text-muted-foreground border border-border/60">
                ≈ ៛{(Math.round(amount * 4100)).toLocaleString(currentLocale)}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <CheckCircle2 size={12} className={isCredit ? 'text-rose-600' : 'text-emerald-600'} />
                <span>{isCredit ? t('finance.credit_settled', 'Disbursed & Settled') : t('finance.debit_received', 'Received & Settled')}</span>
              </span>
            </div>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
              isCredit
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        {/* Core Transaction Metadata */}
        <DetailDrawerCard title={t('finance.transaction_summary', 'Transaction Summary')}>
          <DetailDrawerRow
            label={t('finance.reference_doc', 'Reference Document')}
            value={
              refText ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold border border-primary/20">
                    <FileText size={13} className="shrink-0" />
                    <span>{refText}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(refText)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title={t('finance.copy_reference', t('common.copy', 'Copy Reference'))}
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              ) : (
                <span className="text-muted-foreground/50 text-xs">—</span>
              )
            }
          />
          <DetailDrawerRow
            label={t('finance.payment_method', 'Payment Method')}
            value={getMethodBadge(transaction.payment_method?.name || transaction.paymentMethod?.name)}
          />
          <DetailDrawerRow
            label={t('finance.branch_company', 'Branch / Company')}
            value={
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground">
                  <Building2 size={13} className="text-primary/70 shrink-0" />
                  <span>{branchName || mainCompany}</span>
                </span>
                {branchName && (
                  <span className="text-[11px] text-muted-foreground/80 truncate max-w-[240px]" title={mainCompany}>
                    {mainCompany}
                  </span>
                )}
              </div>
            }
          />
          <DetailDrawerRow
            label={t('finance.transaction_datetime', 'Date & Time')}
            value={
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Clock size={12} className="text-muted-foreground/80 shrink-0" />
                <span>{formatDateTime(transaction.created_at)}</span>
              </div>
            }
          />
        </DetailDrawerCard>

        {/* Description & Note */}
        <DetailDrawerCard title={t('finance.description_notes', 'Description & Notes')}>
          {transaction.description ? (
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 text-xs text-foreground/90 leading-relaxed break-words font-medium">
              {transaction.description}
            </div>
          ) : (
            <div className="p-3.5 bg-muted/20 rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground/60 italic text-center">
              {t('finance.no_description', 'No description or notes provided.')}
            </div>
          )}
        </DetailDrawerCard>
      </DetailDrawerBody>

      {/* Footer */}
      <DetailDrawerFooter
        onClose={onClose}
        closeLabel={t('common.close', 'Close')}
        leftActions={
          onDelete ? (
            <ActionButton
              variant="outline"
              onClick={() => {
                onDelete(transaction.id, `Transaction #${transaction.id}`)
                onClose()
              }}
              className="text-destructive hover:bg-destructive/10 border-destructive/30"
              icon={<Trash2 size={14} />}
            >
              {t('finance.delete_transaction', t('common.delete', 'Delete Transaction'))}
            </ActionButton>
          ) : undefined
        }
        rightActions={
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl px-4">
            {t('common.close', 'Close')}
          </Button>
        }
      />
    </DetailDrawer>
  )
}

export default TransactionDetailDrawer
