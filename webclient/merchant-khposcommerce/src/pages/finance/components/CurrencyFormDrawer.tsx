import React from 'react'
import { Modal } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CurrencyForm } from '../types/finance.types'
const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'

export interface CurrencyFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  currencyForm: CurrencyForm
  setCurrencyForm: React.Dispatch<React.SetStateAction<CurrencyForm>>
}

export const CurrencyFormDrawer: React.FC<CurrencyFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  currencyForm,
  setCurrencyForm,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('finance.edit_currency', 'Edit Currency') : t('finance.add_currency', 'Add Currency')}
      subtitle={t('finance.currency_subtitle', 'Set currency name, ISO code, symbol, and exchange rate')}
      icon={<Globe size={20} />}
      iconVariant="cyan"
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
            {t('finance.currency_name', 'Currency Name')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={currencyForm.name}
            onChange={(e) => setCurrencyForm((p) => ({ ...p, name: e.target.value }))}
            placeholder={t('finance.currency_name_placeholder', 'e.g. United States Dollar')}
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
              placeholder={t('finance.iso_code_placeholder', 'USD')}
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
              placeholder={t('finance.symbol_placeholder', '$')}
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
              placeholder={t('finance.exchange_rate_placeholder', '1.0000')}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>

        {currencyForm.code === 'KHR' && (
          <p className="text-[11px] font-medium text-primary dark:text-sky-400">
            💡 {t('finance.khr_rate_hint', 'Enter Riel amount equal to 1 USD (e.g. 4100)')}
          </p>
        )}

        {currencyForm.code === 'USD' && (
          <p className="text-[11px] font-medium text-muted-foreground">
            ℹ️ {t('finance.base_rate_fixed_hint', 'Base currency rate is fixed at 1.0000')}
          </p>
        )}

        <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
          <div>
            <p className="text-xs font-semibold text-foreground">{t('finance.active_status', 'Active Status')}</p>
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
      </form>
    </Modal>
  )
}

export default CurrencyFormDrawer
