import React from 'react'
import { Modal, DatePicker } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import {
  Upload,
  FolderOpen,
  CreditCard,
  Globe,
  Percent,
  Receipt,
  DollarSign
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  TabType, ExpenseForm, CategoryForm, RegisterForm, CurrencyForm, TaxForm, PaymentMethodForm, TransactionForm
} from '../types/finance.types'

interface FinanceFormModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: TabType
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  categories: any[]
  expenseForm: ExpenseForm
  setExpenseForm: React.Dispatch<React.SetStateAction<ExpenseForm>>
  handleReceiptFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  categoryForm: CategoryForm
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryForm>>
  registerForm: RegisterForm
  setRegisterForm: React.Dispatch<React.SetStateAction<RegisterForm>>
  currencyForm: CurrencyForm
  setCurrencyForm: React.Dispatch<React.SetStateAction<CurrencyForm>>
  taxForm: TaxForm
  setTaxForm: React.Dispatch<React.SetStateAction<TaxForm>>
  paymentMethodForm: PaymentMethodForm
  setPaymentMethodForm: React.Dispatch<React.SetStateAction<PaymentMethodForm>>
  transactionForm: TransactionForm
  setTransactionForm: React.Dispatch<React.SetStateAction<TransactionForm>>
}

// ─── Standard Clean Styling Tokens (Matching CMS Modal Exactly) ─────────────
const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
const textareaCls =
  'w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export const FinanceFormDrawer: React.FC<FinanceFormModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  editingItem,
  onSubmit,
  isPending,
  categories = [],
  expenseForm,
  setExpenseForm,
  handleReceiptFileChange,
  categoryForm,
  setCategoryForm,
  registerForm,
  setRegisterForm,
  currencyForm,
  setCurrencyForm,
  taxForm,
  setTaxForm,
  paymentMethodForm,
  setPaymentMethodForm,
  transactionForm,
  setTransactionForm,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  const getModalConfig = () => {
    switch (activeTab) {
      case 'categories':
        return {
          title: isEdit ? t('finance.edit_category', 'Edit Category') : t('finance.add_category', 'Add Category'),
          subtitle: t('finance.category_subtitle', 'Configure category name, code, description, and status'),
          icon: <FolderOpen size={20} />,
          variant: 'amber' as const,
        }
      case 'registers':
        return {
          title: isEdit ? t('finance.edit_register', 'Edit Cash Register') : t('finance.add_register', 'Add Cash Register'),
          subtitle: t('finance.register_subtitle', 'Configure register name and opening/closing cash balances'),
          icon: <CreditCard size={20} />,
          variant: 'blue' as const,
        }
      case 'payment_methods':
        return {
          title: isEdit ? t('finance.edit_payment_method', 'Edit Payment Method') : t('finance.add_payment_method', 'Add Payment Method'),
          subtitle: t('finance.payment_method_subtitle', 'Configure payment parameters, processing fees, and channels'),
          icon: <CreditCard size={20} />,
          variant: 'indigo' as const,
        }
      case 'transactions':
        return {
          title: isEdit ? t('finance.edit_transaction', 'Edit Transaction') : t('finance.add_transaction', 'Record Transaction'),
          subtitle: t('finance.transaction_subtitle', 'Record debit (inflow) or credit (outflow) financial transactions'),
          icon: <DollarSign size={20} />,
          variant: 'emerald' as const,
        }
      case 'currencies':
        return {
          title: isEdit ? t('finance.edit_currency', 'Edit Currency') : t('finance.add_currency', 'Add Currency'),
          subtitle: t('finance.currency_subtitle', 'Set currency name, ISO code, symbol, and exchange rate'),
          icon: <Globe size={20} />,
          variant: 'cyan' as const,
        }
      case 'taxes':
        return {
          title: isEdit ? t('finance.edit_tax', 'Edit Tax Rule') : t('finance.add_tax', 'Add Tax Rule'),
          subtitle: t('finance.tax_subtitle', 'Configure tax rule name, rate percentage, and calculation type'),
          icon: <Percent size={20} />,
          variant: 'purple' as const,
        }
      case 'expenses':
      default:
        return {
          title: isEdit ? t('finance.edit_expense', 'Edit Expense') : t('finance.add_expense', 'Add Expense'),
          subtitle: t('finance.expense_subtitle', 'Fill in expense transaction details, category, and receipt attachment'),
          icon: <Receipt size={20} />,
          variant: 'rose' as const,
        }
    }
  }

  const config = getModalConfig()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      iconVariant={config.variant}
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
        {/* ══════════════════════════════════════════════════════════
            1. EXPENSE CATEGORIES FORM (Clean Enterprise Standard)
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('finance.category_name', 'Category Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => {
                  setCategoryForm((p) => ({
                    ...p,
                    name: e.target.value,
                    code: p.code || (e.target.value ? `EXP-${e.target.value.substring(0, 3).toUpperCase()}` : '')
                  }))
                }}
                placeholder={t('finance.placeholder_category_name', 'e.g. Travel & Transport')}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{t('finance.category_code', t('finance.code_col', 'Identifier Code'))}</label>
              <input
                type="text"
                value={categoryForm.code}
                onChange={(e) => setCategoryForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="EXP-TRV"
                className={`${inputCls} font-mono uppercase text-xs`}
              />
            </div>

            <div>
              <label className={labelCls}>{t('finance.category_description', 'Description (Optional)')}</label>
              <textarea
                value={categoryForm.description || ''}
                onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                placeholder={t('finance.placeholder_cat_desc', 'Brief overview description of this category...')}
                rows={3}
                className={textareaCls}
              />
            </div>

            {/* Active Status Card */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('finance.status_active_label', t('finance.status_active', 'Active Status'))}</p>
                <p className="text-[11px] text-muted-foreground">{t('finance.category_active_desc', t('finance.active_desc', 'Enable this expense category in the system'))}</p>
              </div>
              <input
                type="checkbox"
                id="catActive"
                checked={categoryForm.is_active}
                onChange={(e) => setCategoryForm((p) => ({ ...p, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            2. CASH REGISTERS FORM
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'registers' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('finance.register_title', 'Register Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={registerForm.title}
                onChange={(e) => setRegisterForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Main Counter POS Cash Drawer"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>{t('finance.opening_balance', 'Opening Balance ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={registerForm.opening_balance}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, opening_balance: e.target.value }))}
                  placeholder="500.00"
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div>
                <label className={labelCls}>{t('finance.closing_balance', 'Closing Balance ($)')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={registerForm.closing_balance}
                  onChange={(e) => setRegisterForm((p) => ({ ...p, closing_balance: e.target.value }))}
                  placeholder="1500.00"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('finance.status_col', 'Operational Status')}</label>
              <select
                value={registerForm.status}
                onChange={(e) => setRegisterForm((p) => ({ ...p, status: e.target.value }))}
                className={selectCls}
              >
                <option value="open">{t('finance.status_open', 'Open')}</option>
                <option value="closed">{t('finance.status_closed', 'Closed')}</option>
              </select>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            3. CURRENCIES FORM
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'currencies' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('finance.currency_name', 'Currency Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={currencyForm.name}
                onChange={(e) => setCurrencyForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. United States Dollar"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>
                  {t('finance.iso_code', 'ISO Code')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currencyForm.code}
                  onChange={(e) => setCurrencyForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="USD"
                  className={`${inputCls} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={labelCls}>
                  {t('finance.symbol_col', 'Symbol')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currencyForm.symbol}
                  onChange={(e) => setCurrencyForm((p) => ({ ...p, symbol: e.target.value }))}
                  placeholder="$"
                  className={`${inputCls} font-bold text-center`}
                />
              </div>
              <div>
                <label className={labelCls}>{t('finance.exchange_rate', 'Exchange Rate')}</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={currencyForm.exchange_rate}
                  onChange={(e) => setCurrencyForm((p) => ({ ...p, exchange_rate: e.target.value }))}
                  placeholder="1.0000"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('finance.status_active', 'Active Status')}</p>
                <p className="text-[11px] text-muted-foreground">{t('finance.currency_active_desc', 'Allow this currency for transactions')}</p>
              </div>
              <input
                type="checkbox"
                id="currActive"
                checked={currencyForm.is_active}
                onChange={(e) => setCurrencyForm((p) => ({ ...p, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            4. TAX RULES FORM
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'taxes' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('finance.tax_rule_name', 'Tax Rule Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={taxForm.name}
                onChange={(e) => setTaxForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. VAT 10%"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  {t('finance.tax_rate', 'Tax Rate')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={taxForm.rate}
                  onChange={(e) => setTaxForm((p) => ({ ...p, rate: e.target.value }))}
                  placeholder="10.00"
                  className={`${inputCls} font-mono`}
                />
              </div>
              <div>
                <label className={labelCls}>{t('finance.type_col', 'Tax Type')}</label>
                <select
                  value={taxForm.type}
                  onChange={(e) => setTaxForm((p) => ({ ...p, type: e.target.value }))}
                  className={selectCls}
                >
                  <option value="percentage">{t('finance.tax_type_percentage', 'Percentage (%)')}</option>
                  <option value="fixed">{t('finance.tax_type_fixed', 'Fixed Amount ($)')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('finance.status_active', 'Active Status')}</p>
                <p className="text-[11px] text-muted-foreground">{t('finance.tax_active_desc', 'Apply this tax rule to invoices and transactions')}</p>
              </div>
              <input
                type="checkbox"
                id="taxActive"
                checked={taxForm.is_active}
                onChange={(e) => setTaxForm((p) => ({ ...p, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            5. PAYMENT METHODS FORM
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'payment_methods' && (
          <div className="space-y-4">
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
                  placeholder="e.g. ABA KHQR / Wing"
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
                  placeholder="e.g. aba_khqr"
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
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            6. TRANSACTIONS FORM
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
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
                  placeholder="e.g. Sale, Expense, Order"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>{t('finance.ref_id', 'Reference ID')}</label>
                <input
                  type="text"
                  value={transactionForm.reference_id}
                  onChange={(e) => setTransactionForm((p) => ({ ...p, reference_id: e.target.value }))}
                  placeholder="e.g. 101"
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
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            7. EXPENSES FALLBACK FORM
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('finance.title_col', 'Expense Title')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={expenseForm.title}
                onChange={(e) => setExpenseForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Office Supplies & Equipment"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  {t('finance.amount_col', 'Amount ($)')} <span className="text-rose-500">*</span>
                </label>
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
          </div>
        )}
      </form>
    </Modal>
  )
}

export default FinanceFormDrawer
