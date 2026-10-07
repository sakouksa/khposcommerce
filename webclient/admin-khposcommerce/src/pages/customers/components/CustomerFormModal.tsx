import React from 'react'
import {
  User, Phone, Award, CreditCard, FileText, Camera,
  Trash2, UploadCloud, CheckCircle2, Sparkles, Info, ShieldAlert, Wallet, Tag
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EnterpriseModal, ModalFooter, EnterpriseDatePicker } from '@/components/common'
import { formatPhoneNumber } from '@/utils/formatters'
import { getCustomerGroupDisplayName } from '../utils/customerGroupI18n'
import type { Customer } from '../types/customer.types'

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingCustomer: Customer | null
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  register: any
  errors: any
  companies?: any[]
  groups?: any[]
  users?: any[]
  photoPreview: string | null
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  removePhoto: () => void
  watch?: any
  setValue?: any
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  editingCustomer,
  onSubmit,
  isSubmitting,
  register,
  errors,
  companies = [],
  groups = [],
  users = [],
  photoPreview,
  onPhotoChange,
  removePhoto,
  watch,
  setValue
}) => {
  const { t } = useTranslation(['customers', 'common'])

  const watchedValues = watch ? watch() : {}
  const selectedGroupId = watchedValues?.customer_group_id
  const selectedGroup = groups.find((g: any) => String(g.id) === String(selectedGroupId))

  const inputCls =
    'w-full h-10 min-h-[40px] px-3.5 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium'
  const labelCls =
    'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingCustomer
          ? t('customers.editCustomerProfile', 'Edit Customer Profile')
          : t('customers.registerCustomer', 'Register New Customer')
      }
      subtitle={t('customers.formSubtitle', 'Manage and complete customer profile in CRM')}
      icon={<User size={20} />}
      iconVariant="blue"
      size="2xl"
      badge={
        editingCustomer ? (
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400 border border-border/60 dark:border-slate-700">
            #{editingCustomer.id}
          </span>
        ) : undefined
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          isEdit={Boolean(editingCustomer)}
          submitLabel={
            editingCustomer
              ? t('customers.saveChanges', 'Save Changes')
              : t('customers.saveCustomer', 'Save Customer')
          }
          onSubmit={(e) => onSubmit(e || ({ preventDefault: () => {} } as any))}
        />
      }
    >
      <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                
          {/* SECTION 1: General Info & Photo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/70 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User size={14} />
              </div>
              <h4 className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 tracking-wide">
                {t('customers.formTabGeneral', 'General Information & Photo')}
              </h4>
            </div>

            <div className="space-y-4">
              {/* Profile Photo Upload */}
              <div className="p-3.5 rounded-xl border border-border/80 dark:border-slate-800 bg-muted/10 dark:bg-slate-850 flex flex-col sm:flex-row items-center gap-4">
                {photoPreview ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border/80 dark:border-slate-700 group shadow-xs shrink-0 bg-background dark:bg-slate-900">
                    <img src={photoPreview} alt="Customer Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <label className="p-1.5 bg-card/80 hover:bg-card text-foreground rounded-lg cursor-pointer transition-colors" title={t('customers.changePhoto', 'Change Photo')}>
                        <Camera size={13} />
                        <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer transition-colors"
                        title={t('customers.removePhoto', 'Remove Photo')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full sm:w-auto flex-1 border-2 border-dashed border-border/80 dark:border-slate-700 hover:border-primary/50 rounded-xl p-3 flex items-center justify-center gap-3 cursor-pointer bg-background dark:bg-slate-900 hover:bg-muted/30 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <UploadCloud size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground dark:text-slate-100 block">
                        {t('customers.clickUploadPhoto', 'Click to upload photo')}
                      </span>
                      <span className="text-[10px] text-muted-foreground dark:text-slate-400">
                        {t('customers.photoHint', 'PNG, JPG or WEBP (Max 2MB)')}
                      </span>
                    </div>
                    <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                  </label>
                )}

                {photoPreview && (
                  <div className="text-xs text-muted-foreground dark:text-slate-400 space-y-0.5 text-center sm:text-left">
                    <span className="font-bold text-foreground dark:text-slate-100 block text-xs">
                      {t('customers.photoUpload', 'Profile Photo')}
                    </span>
                    <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                      {t('customers.photoHint', 'PNG, JPG or WEBP (Max 2MB)')}
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Full Name */}
              <div>
                <label className={labelCls}>
                  {t('customers.fullName', 'Customer Full Name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { required: t('customers.validation.nameRequired', 'Customer name is required') })}
                  placeholder={t('customers.namePlaceholder', 'e.g. John Doe')}
                  className={inputCls}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name.message}</p>}
              </div>

              {/* Gender & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    {t('customers.gender', 'Gender')}
                  </label>
                  <select
                    {...register('gender')}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="">{t('customers.selectGender', 'Select Gender')}</option>
                    <option value="male">{t('customers.genderMale', 'Male')}</option>
                    <option value="female">{t('customers.genderFemale', 'Female')}</option>
                    <option value="other">{t('customers.genderOther', 'Other')}</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    {t('customers.birthDate', 'Date of Birth')}
                  </label>
                  <EnterpriseDatePicker
                    value={watchedValues?.birth_date || ''}
                    onChange={(val) => setValue && setValue('birth_date', val, { shouldValidate: true, shouldDirty: true })}
                    placeholder={t('customers.birthDate', 'Date of Birth')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact & Linked Account */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/70 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Phone size={14} />
              </div>
              <h4 className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 tracking-wide">
                {t('customers.formTabContact', 'Contact & Linked User')}
              </h4>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className={labelCls}>
                    {t('customers.phone', 'Phone Number')}
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    {...register('phone', {
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        e.target.value = e.target.value.replace(/[^\d+ -]/g, '')
                      },
                    })}
                    placeholder="012 345 678"
                    className={`${inputCls} font-mono`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className={labelCls}>
                    {t('customers.email', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="customer@domain.com"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Linked User Account */}
              <div>
                <label className={labelCls}>
                  {t('customers.linkUserAccount', 'Linked User Account')}
                </label>
                <select
                  {...register('user_id')}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="" className="dark:bg-slate-900">{t('customers.noLinkedUser', 'Not linked to any user account')}</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id} className="dark:bg-slate-900">
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Customer Group & RFM Segment */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/70 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Award size={14} />
              </div>
              <h4 className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 tracking-wide">
                {t('customers.formTabGroup', 'Customer Group & RFM Segment')}
              </h4>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    {t('customers.customerGroup', 'Customer Group')}
                  </label>
                  <select
                    {...register('customer_group_id')}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="" className="dark:bg-slate-900">{t('customers.noSpecialGroup', 'General / Standard Group')}</option>
                    {groups.map((g: any) => (
                      <option key={g.id} value={g.id} className="dark:bg-slate-900">
                        {getCustomerGroupDisplayName(g.name, t)} {g.discount_percent ? `(${g.discount_percent}% OFF)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    {t('customers.rfmSegment', 'RFM Segment')}
                  </label>
                  <select
                    {...register('rfm_segment')}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="new">New Customer</option>
                    <option value="potential">Potential Loyalist</option>
                    <option value="loyal">Loyal Customer</option>
                    <option value="champions">Champions (VIP Top Spender)</option>
                    <option value="at_risk">At-Risk (Churn Warning)</option>
                    <option value="hibernating">Hibernating / Inactive</option>
                  </select>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className={labelCls}>
                  {t('customers.customerTags', 'Customer Tags (Comma separated)')}
                </label>
                <input
                  type="text"
                  {...register('tags')}
                  placeholder="#B2BVerified, #VIPContract, #Wholesale, #FastPayer"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: B2B Financial, Credit & Tax */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border/70 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <CreditCard size={14} />
              </div>
              <h4 className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 tracking-wide">
                {t('customers.formTabFinancial', 'B2B Credit, Store Wallet & Tax')}
              </h4>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Terms */}
                <div>
                  <label className={labelCls}>
                    {t('customers.paymentTerms', 'Payment Terms')}
                  </label>
                  <select
                    {...register('payment_terms')}
                    className={`${inputCls} cursor-pointer font-mono font-semibold`}
                  >
                    <option value="prepaid">Prepaid (Direct Payment)</option>
                    <option value="net_15">Net 15 Days</option>
                    <option value="net_30">Net 30 Days (Standard Corporate)</option>
                    <option value="net_60">Net 60 Days</option>
                    <option value="eom">End of Month (EOM)</option>
                  </select>
                </div>

                {/* Credit Limit */}
                <div>
                  <label className={labelCls}>
                    {t('customers.creditLimit', 'Credit Limit ($)')}
                  </label>
                  <input
                    type="number"
                    step="100"
                    {...register('credit_limit')}
                    placeholder="5000.00"
                    className={`${inputCls} font-mono font-bold`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tax Number */}
                <div>
                  <label className={labelCls}>
                    {t('customers.taxNumber', 'Tax Identification Number (VAT ID)')}
                  </label>
                  <input
                    type="text"
                    {...register('tax_number')}
                    placeholder="K00123456"
                    className={`${inputCls} font-mono uppercase`}
                  />
                </div>

                {/* Tax Branch Code */}
                <div>
                  <label className={labelCls}>
                    {t('customers.taxBranchCode', 'Tax Branch Code (e-Invoice)')}
                  </label>
                  <input
                    type="text"
                    {...register('tax_branch_code')}
                    placeholder="00001 (Head Office)"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              {/* Credit Hold Toggle */}
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-rose-500" />
                    {t('customers.lockCreditHold', 'Lock Account / Credit Hold')}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {t('customers.creditHoldDescription', 'Temporarily suspend credit purchasing for this account')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  {...register('is_credit_hold')}
                  className="checkbox h-4 w-4 rounded border-border"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Internal Notes */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2 pb-2 border-b border-border/70 dark:border-slate-800">
              <FileText size={16} className="text-primary shrink-0" />
              <h4 className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 tracking-wide">
                {t('customers.formTabNotes', 'Internal Notes')}
              </h4>
            </div>

            <div>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder={t('customers.notesPlaceholder', 'Customer preferences or internal notes...')}
                className="w-full p-3 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* Live Quick Preview Box */}
          <div className="p-3.5 rounded-xl border border-border/80 dark:border-slate-800 bg-muted/15 dark:bg-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>{t('customers.quickVerification', 'Quick Verification')}</span>
              </span>
              <span className="text-[10px] font-semibold text-primary">
                {watchedValues.is_active !== false ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-background dark:bg-slate-900 p-2 rounded-lg border border-border/50">
                <span className="text-muted-foreground text-[10px] block">{t('customers.name', 'Name')}:</span>
                <span className="font-bold text-foreground dark:text-slate-200 truncate block">
                  {watchedValues.name || '—'}
                </span>
              </div>
              <div className="bg-background dark:bg-slate-900 p-2 rounded-lg border border-border/50">
                <span className="text-muted-foreground text-[10px] block">{t('customers.phone', 'Phone')}:</span>
                <span className="font-mono font-bold text-foreground dark:text-slate-200 truncate block">
                  {watchedValues.phone || '—'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </form>
    </EnterpriseModal>
  )
}

export default CustomerFormModal
