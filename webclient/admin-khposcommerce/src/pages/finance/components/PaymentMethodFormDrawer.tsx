import React from 'react'
import { Modal } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import { CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PaymentMethodForm } from '../types/finance.types'
const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export interface PaymentMethodFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  paymentMethodForm: PaymentMethodForm
  setPaymentMethodForm: React.Dispatch<React.SetStateAction<PaymentMethodForm>>
}

export const PaymentMethodFormDrawer: React.FC<PaymentMethodFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  paymentMethodForm,
  setPaymentMethodForm,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('finance.edit_payment_method', 'Edit Payment Method') : t('finance.add_payment_method', 'Add Payment Method')}
      subtitle={t('finance.payment_method_subtitle', 'Configure payment parameters, processing fees, and channels')}
      icon={<CreditCard size={20} />}
      iconVariant="indigo"
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          onSubmit={onSubmit}
          isSubmitting={isPending}
          isEdit={isEdit}
          submitLabel={
            isEdit
              ? t('common.saveChanges', 'Save Changes')
              : t('common.save', 'Save')
          }
        />
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="p-5 sm:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              {t('finance.method_name', 'Payment Method Name')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={paymentMethodForm.name}
              onChange={(e) => setPaymentMethodForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={t('finance.pm_name_placeholder', 'e.g. ABA KHQR / Wing')}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              {t('finance.method_code', 'Method Code')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={paymentMethodForm.code}
              onChange={(e) => setPaymentMethodForm((p) => ({ ...p, code: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              placeholder={t('finance.pm_code_placeholder', 'e.g. aba_khqr')}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('finance.gateway_type', 'Gateway Type / Method')}</label>
          <select
            value={paymentMethodForm.type}
            onChange={(e) => setPaymentMethodForm((p) => ({ ...p, type: e.target.value }))}
            className={selectCls}
          >
            <option value="cash">{t('finance.pm_type_cash', 'Cash')}</option>
            <option value="bank_transfer">{t('finance.pm_type_bank_transfer', 'Bank Transfer')}</option>
            <option value="credit_card">{t('finance.pm_type_credit_card', 'Credit Card')}</option>
            <option value="debit_card">{t('finance.pm_type_debit_card', 'Debit Card')}</option>
            <option value="ewallet">{t('finance.pm_type_ewallet', 'E-Wallet')}</option>
            <option value="qr_code">{t('finance.pm_type_qr_code', 'QR Code (KHQR)')}</option>
            <option value="qris">{t('finance.pm_type_qris', 'KHQR / Static QR')}</option>
            <option value="other">{t('finance.pm_type_other', 'Other')}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('finance.fee_percent', 'Processing Fee (%)')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paymentMethodForm.fee_percent}
              onChange={(e) => setPaymentMethodForm((p) => ({ ...p, fee_percent: e.target.value }))}
              placeholder="0.00"
              className={`${inputCls} font-mono`}
            />
          </div>

          <div>
            <label className={labelCls}>{t('finance.fee_fixed', 'Fixed Fee ($)')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={paymentMethodForm.fee_fixed}
              onChange={(e) => setPaymentMethodForm((p) => ({ ...p, fee_fixed: e.target.value }))}
              placeholder="0.00"
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border/80 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
            <input
              type="checkbox"
              checked={paymentMethodForm.available_pos}
              onChange={(e) => setPaymentMethodForm((p) => ({ ...p, available_pos: e.target.checked }))}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
            <span className="text-xs font-semibold text-foreground">{t('finance.pos_channel', 'POS Counter Channel')}</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border/80 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
            <input
              type="checkbox"
              checked={paymentMethodForm.available_online}
              onChange={(e) => setPaymentMethodForm((p) => ({ ...p, available_online: e.target.checked }))}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
            <span className="text-xs font-semibold text-foreground">{t('finance.online_store', 'Online Store Channel')}</span>
          </label>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
          <div>
            <p className="text-xs font-semibold text-foreground">{t('finance.status_active', 'Active Status')}</p>
            <p className="text-[11px] text-muted-foreground">{t('finance.pm_active_desc', 'Enable this payment method in checkout channels')}</p>
          </div>
          <input
            type="checkbox"
            id="pmActive"
            checked={paymentMethodForm.is_active}
            onChange={(e) => setPaymentMethodForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
          />
        </div>
      </form>
    </Modal>
  )
}

export default PaymentMethodFormDrawer
