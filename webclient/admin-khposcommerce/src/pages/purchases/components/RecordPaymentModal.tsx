import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Loader2, CreditCard, Receipt, Building2, CheckCircle } from 'lucide-react'
import { CloseButton } from '@/components/common'
import type { Purchase } from '../types/purchase.types'
import { formatCurrency, getDetailDualValues } from '../utils/purchaseCurrency'

interface RecordPaymentModalProps {
  isOpen: boolean
  purchase: Purchase | null
  onClose: () => void
  onSubmit: (amount: number, notes: string) => void
  isSubmitting: boolean
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  purchase,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const { t } = useTranslation(['purchases', 'common'])
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [validationError, setValidationError] = useState('')

  const dueAmount = purchase ? Number(purchase.due_amount || 0) : 0
  const currencyCode = purchase?.currency_code || 'USD'

  useEffect(() => {
    if (isOpen && purchase) {
      setAmount(dueAmount > 0 ? dueAmount.toString() : '')
      setNotes('')
      setValidationError('')
    }
  }, [isOpen, purchase, dueAmount])

  if (!isOpen || !purchase) return null

  const dualDue = getDetailDualValues(dueAmount, purchase)
  const dualGrandTotal = getDetailDualValues(purchase.grand_total, purchase)
  const dualPaid = getDetailDualValues(purchase.paid_amount, purchase)

  const handleQuickAmount = (ratio: number) => {
    const calculated = (dueAmount * ratio).toFixed(2)
    setAmount(calculated)
    setValidationError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseFloat(amount)
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      setValidationError(t('purchases.enterValidPaymentAmount', 'Please enter a valid payment amount greater than zero.'))
      return
    }
    if (numericAmount > dueAmount + 0.01) {
      setValidationError(t('purchases.amountExceedsDue', 'Payment amount cannot exceed outstanding balance.'))
      return
    }
    setValidationError('')
    onSubmit(numericAmount, notes)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <DollarSign size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <span>{t('purchases.recordPayment', 'Record Payment')}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border/80">
                    PO #{purchase.reference_number}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('purchases.recordPaymentSubtitle', 'Settle supplier payable balance for this purchase order.')}
                </p>
              </div>
            </div>
            <CloseButton onClose={onClose} size="md" color="rose" />
          </div>

          {/* PO Context Info */}
          <div className="p-6 bg-muted/10 border-b border-border space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-background border border-border">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
                  {t('purchases.grandTotal', 'Grand Total')}
                </span>
                <span className="font-black font-mono text-foreground text-sm">
                  {formatCurrency(purchase.grand_total, currencyCode)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider block mb-1">
                  {t('purchases.outstandingDue', 'Outstanding Due')}
                </span>
                <span className="font-black font-mono text-rose-600 dark:text-rose-400 text-sm">
                  {formatCurrency(dueAmount, currencyCode)}
                </span>
              </div>
            </div>

            {/* Quick Amount Selector */}
            {dueAmount > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground font-medium">
                  {t('purchases.quickSelect', 'Quick Pay')}:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(1)}
                  className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer border border-primary/20"
                >
                  {t('purchases.fullBalance', '100% Full Due')}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(0.5)}
                  className="px-2.5 py-1 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer border border-border"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(0.25)}
                  className="px-2.5 py-1 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors cursor-pointer border border-border"
                >
                  25%
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {validationError && (
              <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                {validationError}
              </div>
            )}

            {/* Payment Amount Input */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                {t('purchases.paymentAmount', 'Payment Amount')} ({currencyCode}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <CreditCard size={15} />
                </div>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={dueAmount}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setValidationError(''); }}
                  placeholder={`Max: ${dueAmount}`}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-mono font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t('purchases.maxPaymentHelp', 'Maximum payable is')} <strong className="font-mono text-foreground">{formatCurrency(dueAmount, currencyCode)}</strong>
              </p>
            </div>

            {/* Payment Notes */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                {t('purchases.paymentNotes', 'Payment Notes / Reference')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Receipt size={15} />
                </div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('purchases.paymentNotesPlaceholder', 'e.g. Bank transfer ref #12345, Cash settlement...')}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground outline-none transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className="px-6 py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={15} />
                )}
                <span>{t('purchases.confirmPayment', 'Confirm Payment')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default RecordPaymentModal
