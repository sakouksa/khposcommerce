import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Landmark,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Calculator,
  ArrowRight
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'
import { CloseButton } from '@/components/common'

interface RegisterCloseModalProps {
  register: any | null
  isOpen: boolean
  onClose: () => void
  onConfirmClose: (data: { id: number; closingBalance: number; note: string; actualCash: number }) => void
  isSubmitting?: boolean
}

export const RegisterCloseModal: React.FC<RegisterCloseModalProps> = ({
  register,
  isOpen,
  onClose,
  onConfirmClose,
  isSubmitting = false,
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const currentLocale = i18n.language === 'km' ? 'km-KH' : i18n.language

  const [actualCashStr, setActualCashStr] = useState<string>('')
  const [closingNote, setClosingNote] = useState<string>('')

  const openingBalance = Number(register?.opening_balance || 0)
  const cashSales = Number(register?.cash_sales_amount || register?.cash_sales || 0)
  const expectedBalance = openingBalance + cashSales

  useEffect(() => {
    if (isOpen && register) {
      setActualCashStr(String(expectedBalance))
      setClosingNote('')
    }
  }, [isOpen, register, expectedBalance])

  if (!isOpen || !register) return null

  const actualCash = parseFloat(actualCashStr) || 0
  const discrepancy = actualCash - expectedBalance
  const isBalanced = Math.abs(discrepancy) < 0.01
  const isOver = discrepancy > 0.01
  const isShort = discrepancy < -0.01

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirmClose({
      id: register.id,
      closingBalance: expectedBalance,
      actualCash,
      note: closingNote,
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t('finance.close_register_title', 'Close Cash Register Shift')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {register.title || register.name || `Register #${register.id}`}
                </p>
              </div>
            </div>
            <CloseButton onClose={onClose} size="md" variant="default" />
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Reconciliation Ledger Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold uppercase text-[10px]">
                  {t('finance.opening_balance', 'Opening Balance')}
                </span>
                <p className="font-mono font-bold text-foreground text-sm">
                  {formatCurrency(openingBalance, { locale: currentLocale })}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold uppercase text-[10px]">
                  {t('finance.cash_sales', 'Cash Sales')}
                </span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  +{formatCurrency(cashSales, { locale: currentLocale })}
                </p>
              </div>

              <div className="col-span-2 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="font-bold text-foreground text-xs">
                  {t('finance.expected_balance', 'Expected Cash in Drawer')}:
                </span>
                <span className="font-mono font-extrabold text-base text-primary">
                  {formatCurrency(expectedBalance, { locale: currentLocale })}
                </span>
              </div>
            </div>

            {/* Actual Counted Cash Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>{t('finance.actual_cash_count', 'Actual Counted Cash ($)')} *</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  {t('finance.cashier_count_hint', 'Physical cash counted in drawer')}
                </span>
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={actualCashStr}
                  onChange={(e) => setActualCashStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-border bg-card text-foreground font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>
            </div>

            {/* Live Discrepancy Indicator Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                isBalanced
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : isOver
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {isBalanced ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={16} className={isOver ? 'text-blue-500' : 'text-rose-500'} />
                )}
                <span>
                  {isBalanced
                    ? t('finance.reconciliation_balanced', 'Drawer Balanced (No Discrepancy)')
                    : isOver
                    ? t('finance.reconciliation_over', 'Cash Over (Surplus)')
                    : t('finance.reconciliation_short', 'Cash Short (Deficit)')}
                </span>
              </div>

              <div className="font-mono font-extrabold text-sm">
                {discrepancy >= 0 ? `+${formatCurrency(discrepancy, { locale: currentLocale })}` : formatCurrency(discrepancy, { locale: currentLocale })}
              </div>
            </div>

            {/* Closing Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                {t('finance.closing_note', 'Closing Notes / Discrepancy Reason (Optional)')}
              </label>
              <textarea
                rows={2}
                value={closingNote}
                onChange={(e) => setClosingNote(e.target.value)}
                placeholder={t('finance.closing_note_placeholder', 'Add any reconciliation note, denomination breakdown, or shift hand-over memo...')}
                className="w-full p-3 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock size={14} />
                <span>{isSubmitting ? t('common.saving', 'Closing...') : t('finance.confirm_close_shift', 'Confirm Shift Closure')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default RegisterCloseModal
