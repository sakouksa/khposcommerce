import React from 'react'
import { Modal } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import { Percent } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TaxForm } from '../types/finance.types'
const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export interface TaxFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  taxForm: TaxForm
  setTaxForm: React.Dispatch<React.SetStateAction<TaxForm>>
}

export const TaxFormDrawer: React.FC<TaxFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  taxForm,
  setTaxForm,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('finance.edit_tax', 'Edit Tax Rule') : t('finance.add_tax', 'Add Tax Rule')}
      subtitle={t('finance.tax_subtitle', 'Configure tax rule name, rate percentage, and calculation type')}
      icon={<Percent size={20} />}
      iconVariant="purple"
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
            {t('finance.tax_rule_name', 'Tax Rule Name')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={taxForm.name}
            onChange={(e) => setTaxForm((p) => ({ ...p, name: e.target.value }))}
            placeholder={t('finance.tax_name_placeholder', 'e.g. VAT 10%')}
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
      </form>
    </Modal>
  )
}

export default TaxFormDrawer
