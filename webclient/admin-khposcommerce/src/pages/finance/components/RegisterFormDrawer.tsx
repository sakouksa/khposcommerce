import React from 'react'
import { Modal } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import { CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RegisterForm } from '../types/finance.types'
const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export interface RegisterFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  registerForm: RegisterForm
  setRegisterForm: React.Dispatch<React.SetStateAction<RegisterForm>>
}

export const RegisterFormDrawer: React.FC<RegisterFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  registerForm,
  setRegisterForm,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('finance.edit_register', 'Edit Cash Register') : t('finance.add_register', 'Add Cash Register')}
      subtitle={t('finance.register_subtitle', 'Configure register name and opening/closing cash balances')}
      icon={<CreditCard size={20} />}
      iconVariant="blue"
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
            {t('finance.register_title', 'Register Name')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={registerForm.title}
            onChange={(e) => setRegisterForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={t('finance.register_title_placeholder', 'e.g. Main Counter POS Cash Drawer')}
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
      </form>
    </Modal>
  )
}

export default RegisterFormDrawer
