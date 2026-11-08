import React from 'react'
import { Modal, DatePicker } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import { Receipt, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ExpenseForm } from '../types/finance.types'
const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
const textareaCls =
  'w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export interface ExpenseFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  categories: any[]
  expenseForm: ExpenseForm
  setExpenseForm: React.Dispatch<React.SetStateAction<ExpenseForm>>
  handleReceiptFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const ExpenseFormDrawer: React.FC<ExpenseFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  categories = [],
  expenseForm,
  setExpenseForm,
  handleReceiptFileChange,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('finance.edit_expense', 'Edit Expense') : t('finance.add_expense', 'Add Expense')}
      subtitle={t('finance.expense_subtitle', 'Fill in expense transaction details, category, and receipt attachment')}
      icon={<Receipt size={20} />}
      iconVariant="rose"
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
        <div>
          <label className={labelCls}>
            {t('finance.title_col', 'Expense Title')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={expenseForm.title}
            onChange={(e) => setExpenseForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={t('finance.expense_title_placeholder', 'e.g. Office Supplies & Equipment')}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground/90 dark:text-slate-200">
                {t('finance.amount_col', 'Amount ($)')} <span className="text-rose-500">*</span>
              </label>
              {Number(expenseForm.amount) > 0 && (
                <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  ≈ {Math.round(Number(expenseForm.amount) * 4100).toLocaleString()} ៛
                </span>
              )}
            </div>
            <input
              type="number"
              step="0.01"
              required
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="0.00"
              className={`${inputCls} font-mono font-bold`}
            />
          </div>

          <div>
            <DatePicker
              label={t('finance.date_col', 'Date')}
              required
              value={expenseForm.date}
              onChange={(val) => setExpenseForm((p) => ({ ...p, date: val }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('finance.payment_source', 'Payment Source')}</label>
            <select
              value={expenseForm.payment_method || 'petty_cash'}
              onChange={(e) => setExpenseForm((p) => ({ ...p, payment_method: e.target.value }))}
              className={selectCls}
            >
              <option value="petty_cash">{t('finance.source_petty_cash', 'Company Petty Cash')}</option>
              <option value="cash_register">{t('finance.source_cash_register', 'Deduct from POS Till (Till Cash Out)')}</option>
              <option value="bank_transfer">{t('finance.source_bank', 'Bank Transfer / KHQR')}</option>
              <option value="corporate_card">{t('finance.source_card', 'Corporate Card')}</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>{t('finance.payee_vendor', 'Payee / Vendor')}</label>
            <input
              type="text"
              value={expenseForm.payee || ''}
              onChange={(e) => setExpenseForm((p) => ({ ...p, payee: e.target.value }))}
              placeholder={t('finance.payee_placeholder', 'e.g. EDC, Virak Buntham, Meta Ads...')}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              {t('finance.category_col', 'Category')} <span className="text-rose-500">*</span>
            </label>
            <select
              value={expenseForm.expense_category_id}
              onChange={(e) => setExpenseForm((p) => ({ ...p, expense_category_id: e.target.value }))}
              className={selectCls}
            >
              <option value="">-- {t('finance.select_category', 'Select Category')} --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>{t('finance.status_col', 'Approval Status')}</label>
            <select
              value={expenseForm.status || 'approved'}
              onChange={(e) => setExpenseForm((p) => ({ ...p, status: e.target.value }))}
              className={selectCls}
            >
              <option value="approved">{t('finance.status_approved', 'Approved')}</option>
              <option value="pending">{t('finance.status_pending', 'Pending Review')}</option>
              <option value="rejected">{t('finance.status_rejected', 'Rejected')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t('finance.reference_number', 'Invoice / Reference Number')}</label>
          <input
            type="text"
            value={expenseForm.reference_number || ''}
            onChange={(e) => setExpenseForm((p) => ({ ...p, reference_number: e.target.value }))}
            placeholder="EXP-2026-0889"
            className={`${inputCls} font-mono`}
          />
        </div>

        <div>
          <label className={labelCls}>{t('finance.description_col', 'Description')}</label>
          <textarea
            value={expenseForm.description}
            onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
            placeholder={t('finance.placeholder_desc', 'Enter expense transaction details...')}
            rows={2}
            className={textareaCls}
          />
        </div>

        <div>
          <label className={labelCls}>{t('finance.receipt_upload', 'Attach Receipt / Invoice')}</label>
          <div className="border border-dashed border-border/80 hover:border-primary/50 rounded-lg p-3 bg-muted/20 text-center transition-colors">
            {expenseForm.receipt ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                <span className="text-xs font-mono font-medium text-foreground truncate">{expenseForm.receipt}</span>
                <button
                  type="button"
                  onClick={() => setExpenseForm((p) => ({ ...p, receipt: '' }))}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 cursor-pointer"
                >
                  {t('common.remove', 'Remove')}
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center justify-center gap-2 py-1">
                <Upload size={15} className="text-primary" />
                <span className="text-xs font-medium text-foreground">{t('finance.upload_receipt', 'Click to upload receipt document')}</span>
                <input type="file" accept="image/*,.pdf" onChange={handleReceiptFileChange} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default ExpenseFormDrawer
