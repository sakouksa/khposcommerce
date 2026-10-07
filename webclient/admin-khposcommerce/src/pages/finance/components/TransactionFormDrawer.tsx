import React from 'react'
import { Modal } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import { DollarSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TransactionForm } from '../types/finance.types'
const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
const textareaCls =
  'w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export interface TransactionFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  transactionForm: TransactionForm
  setTransactionForm: React.Dispatch<React.SetStateAction<TransactionForm>>
}

export const TransactionFormDrawer: React.FC<TransactionFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  transactionForm,
  setTransactionForm,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('finance.edit_transaction', 'Edit Transaction') : t('finance.add_transaction', 'Record Transaction')}
      subtitle={t('finance.transaction_subtitle', 'Record debit (inflow) or credit (outflow) financial transactions')}
      icon={<DollarSign size={20} />}
      iconVariant="emerald"
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
              {t('finance.transaction_type', 'Transaction Type')} <span className="text-rose-500">*</span>
            </label>
            <select
              value={transactionForm.type}
              onChange={(e) => setTransactionForm((p) => ({ ...p, type: e.target.value }))}
              className={selectCls}
            >
              <option value="debit">{t('finance.type_debit', 'Debit (Inflow)')}</option>
              <option value="credit">{t('finance.type_credit', 'Credit (Outflow)')}</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>
              {t('finance.amount_col', 'Amount ($)')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="0.00"
              className={`${inputCls} font-mono font-bold`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('finance.ref_type', 'Reference Type')}</label>
            <input
              type="text"
              value={transactionForm.reference_type}
              onChange={(e) => setTransactionForm((p) => ({ ...p, reference_type: e.target.value }))}
              placeholder={t('finance.ref_type_placeholder', 'e.g. Sale, Expense, Order')}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>{t('finance.ref_id', 'Reference ID')}</label>
            <input
              type="text"
              value={transactionForm.reference_id}
              onChange={(e) => setTransactionForm((p) => ({ ...p, reference_id: e.target.value }))}
              placeholder={t('finance.ref_id_placeholder', 'e.g. 101')}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('finance.description_col', 'Description')}</label>
          <textarea
            value={transactionForm.description}
            onChange={(e) => setTransactionForm((p) => ({ ...p, description: e.target.value }))}
            placeholder={t('finance.placeholder_desc', 'Enter transaction description details...')}
            rows={2}
            className={textareaCls}
          />
        </div>
      </form>
    </Modal>
  )
}

export default TransactionFormDrawer
