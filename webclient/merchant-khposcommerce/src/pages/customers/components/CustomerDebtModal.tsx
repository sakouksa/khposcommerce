import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Landmark, 
  Receipt,
  CheckCircle2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/useToast'
import { customerService } from '@/services/customerService'
import { Modal } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import type { Customer } from '../types/customer.types'

interface CustomerDebtModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSuccess?: () => void
}

export const CustomerDebtModal: React.FC<CustomerDebtModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSuccess,
}) => {
  const { t } = useTranslation(['customers', 'common', 'finance'])
  const toast = useToast()

  const [amount, setAmount] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [referenceNo, setReferenceNo] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const outstanding = Number(customer?.outstanding_balance || 0)

  useEffect(() => {
    if (isOpen && customer) {
      setAmount(outstanding > 0 ? String(outstanding) : '')
      setPaymentMethod('cash')
      setReferenceNo(`PAY-${Date.now().toString().slice(-6)}`)
      setNotes('')
    }
  }, [isOpen, customer, outstanding])

  if (!customer) return null

  const handleQuickAmount = (val: number) => {
    setAmount(String(val.toFixed(2)))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (outstanding <= 0) {
      toast.info(t('customers.noDebtToSettle', 'Customer has no outstanding debt to settle.'))
      return
    }

    const payAmount = parseFloat(amount)

    if (isNaN(payAmount) || payAmount <= 0) {
      toast.error(t('customers.enterValidAmount', 'Please enter a valid payment amount'))
      return
    }

    setLoading(true)
    try {
      await customerService.settleDebt(customer.id, {
        amount: payAmount,
        payment_method: paymentMethod,
        reference_no: referenceNo,
        notes: notes,
      })

      toast.success(t('customers.debtSettledSuccess', 'Debt settled successfully!'))
      onSuccess?.()
      onClose()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Payment failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const remainingAfterPayment = Math.max(0, outstanding - (parseFloat(amount) || 0))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('customers.settleDebtTitle', 'Settle Customer Debt')}
      subtitle={
        <span>
          {customer.name} {customer.phone ? <span className="font-mono text-muted-foreground dark:text-slate-400 font-semibold">({customer.phone})</span> : ''}
        </span>
      }
      icon={<Banknote size={20} />}
      iconVariant="emerald"
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={loading}
          disabled={outstanding <= 0}
          submitLabel={t('customers.confirmPayment', 'Confirm Payment')}
          cancelLabel={t('common.cancel', 'Cancel')}
          onSubmit={handleSubmit}
        />
      }
    >
      <div className="p-5 sm:p-6 space-y-5 text-xs">
        {/* Zero Debt Alert Banner */}
        {outstanding <= 0 && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t('customers.noOutstandingDebt', 'This customer has no outstanding debt ($0.00).')}</span>
          </div>
        )}

        {/* Balance Overview Card */}
        <div className="p-4 rounded-2xl bg-muted/30 dark:bg-slate-800/40 border border-border/80 dark:border-slate-700/60 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">
              {t('customers.currentOutstanding', 'Current Outstanding Debt')}
            </p>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
              ${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="border-l border-border/70 dark:border-slate-700/60 pl-4">
            <p className="text-xs text-muted-foreground dark:text-slate-400 font-medium">
              {t('customers.remainingBalance', 'Remaining Balance')}
            </p>
            <p className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
              remainingAfterPayment === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground dark:text-slate-100'
            }`}>
              ${remainingAfterPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Payment Amount Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground dark:text-slate-200 block">
            {t('customers.paymentAmount', 'Payment Amount ($ USD)')} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-400 font-bold font-mono text-base">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-11 pl-8 pr-4 bg-background dark:bg-slate-900 border border-border/80 dark:border-slate-700/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-lg font-black font-mono text-foreground dark:text-slate-100 transition-all shadow-2xs"
              required
            />
          </div>

          {/* Quick Amount Pills */}
          {outstanding > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickAmount(outstanding)}
                className="h-8 px-3 text-xs font-bold rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {t('customers.payAll', 'Pay All')} (${outstanding.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(outstanding / 2)}
                className="h-8 px-3 text-xs font-bold rounded-lg bg-card dark:bg-slate-800 border border-border/80 dark:border-slate-700 text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                50% (${(outstanding / 2).toFixed(2)})
              </button>
              {outstanding > 100 && (
                <button
                  type="button"
                  onClick={() => handleQuickAmount(100)}
                  className="h-8 px-3 text-xs font-bold rounded-lg bg-card dark:bg-slate-800 border border-border/80 dark:border-slate-700 text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  $100.00
                </button>
              )}
              {outstanding > 500 && (
                <button
                  type="button"
                  onClick={() => handleQuickAmount(500)}
                  className="h-8 px-3 text-xs font-bold rounded-lg bg-card dark:bg-slate-800 border border-border/80 dark:border-slate-700 text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  $500.00
                </button>
              )}
            </div>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground dark:text-slate-200 block">
            {t('customers.paymentMethod', 'Payment Method')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { key: 'cash', label: t('customers.payMethodCash', 'Cash'), icon: Banknote },
              { key: 'bank_transfer', label: t('customers.payMethodBank', 'Bank Transfer'), icon: Landmark },
              { key: 'credit_card', label: t('customers.payMethodCard', 'Credit Card'), icon: CreditCard },
              { key: 'cheque', label: t('customers.payMethodCheque', 'Cheque'), icon: Receipt },
            ].map((pm) => {
              const IconComp = pm.icon
              const isSelected = paymentMethod === pm.key
              return (
                <button
                  key={pm.key}
                  type="button"
                  onClick={() => setPaymentMethod(pm.key)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground shadow-xs ring-1 ring-primary/40'
                      : 'border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/80 hover:bg-muted dark:hover:bg-slate-700 text-muted-foreground dark:text-slate-300'
                  }`}
                >
                  <IconComp size={18} className="mb-1.5" />
                  <span className="text-[11px] truncate text-center">{pm.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Reference Number & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground dark:text-slate-200 block">
              {t('customers.referenceNo', 'Reference No.')}
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full h-10 px-3 bg-background dark:bg-slate-900 border border-border/80 dark:border-slate-700/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs text-foreground dark:text-slate-100 font-mono transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground dark:text-slate-200 block">
              {t('customers.memoNotes', 'Notes / Memo')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('customers.debtNotesPlaceholder', 'e.g. ABA Bank Transaction ID or notes...')}
              className="w-full h-10 px-3 bg-background dark:bg-slate-900 border border-border/80 dark:border-slate-700/80 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-500 transition-all"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CustomerDebtModal
