import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  User,
  Award,
  CreditCard,
  FileText,
  Camera,
  Trash2
} from 'lucide-react'
import { customerService } from '@/services/customerService'
import { companyService } from '@/services/companyService'
import { userService } from '@/services/userService'
import { useToast } from '@/hooks/useToast'
import {
  FormLayout,
  FormContent,
  FormCard,
  FormHeader,
  FormFooter,
  LoadingSpinner,
  FormField,
  FieldLabel,
  EnterpriseDatePicker,
  FieldError,
  getFieldClass,
} from '@/components/common'
import CustomErrorMessage from '@/components/ui/CustomErrorMessage'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { getAbsoluteImageUrl } from '@/utils/image'
import { formatPhoneNumber } from '@/utils/formatters'
import { getCustomerGroupDisplayName } from './utils/customerGroupFormatters'
import type { CustomerFormData } from './types/customer.types'

const BLANK_CUSTOMER_FORM: CustomerFormData = {
  company_id: '1',
  customer_group_id: '',
  user_id: '',
  name: '',
  email: '',
  phone: '',
  gender: '',
  birth_date: '',
  payment_terms: 'prepaid',
  credit_limit: '1000',
  is_credit_hold: false,
  wallet_balance: '0',
  tax_number: '',
  tax_branch_code: '00001',
  rfm_segment: 'new',
  tags: '',
  notes: '',
  is_active: true,
}

export const CustomerFormPage: React.FC = () => {
  const { t } = useTranslation(['customers', 'common', 'nav'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const customerId = id ? parseInt(id) : null
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  const [formData, setFormData] = useState<CustomerFormData>(BLANK_CUSTOMER_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Photo upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoAction, setPhotoAction] = useState<'keep' | 'remove' | 'change'>('keep')

  const setFormField = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Fetch customer data if editing
  const {
    data: customerDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['customer-detail', customerId],
    queryFn: () => (customerId ? customerService.show(customerId) : null),
    enabled: isEdit && !isNaN(customerId as number),
  })

  // Queries for dropdowns
  const { data: companies = [] } = useQuery({
    queryKey: ['companies-list-dropdown'],
    queryFn: () => companyService.getCompanies({ per_page: 100 }).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: groups = [] } = useQuery({
    queryKey: ['customer-groups-list'],
    queryFn: () => customerService.groups({ per_page: 100 }).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users-list-dropdown'],
    queryFn: () => userService.list({ per_page: 200 }).then(r => r.data?.data ?? r.data ?? []),
  })

  useEffect(() => {
    if (customerDetail) {
      const tagsString = Array.isArray(customerDetail.tags) 
        ? customerDetail.tags.join(', ') 
        : (customerDetail.tags || '')

      setFormData({
        company_id: customerDetail.company_id?.toString() || '1',
        customer_group_id: customerDetail.customer_group_id?.toString() || '',
        user_id: customerDetail.user_id?.toString() || '',
        name: customerDetail.name || '',
        email: customerDetail.email || '',
        phone: customerDetail.phone || '',
        gender: customerDetail.gender || '',
        birth_date: customerDetail.birth_date || '',
        payment_terms: customerDetail.payment_terms || 'prepaid',
        credit_limit: customerDetail.credit_limit?.toString() || '1000',
        is_credit_hold: !!customerDetail.is_credit_hold,
        wallet_balance: customerDetail.wallet_balance?.toString() || '0',
        tax_number: customerDetail.tax_number || '',
        tax_branch_code: customerDetail.tax_branch_code || '00001',
        rfm_segment: customerDetail.rfm_segment || 'new',
        tags: tagsString,
        notes: customerDetail.notes || '',
        is_active: customerDetail.is_active !== undefined ? !!customerDetail.is_active : true,
      })
      if (customerDetail.photo) {
        setPhotoPreview(getAbsoluteImageUrl(customerDetail.photo))
      }
      setPhotoAction('keep')
    }
  }, [customerDetail])

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: FormData) => customerService.create(payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('toast.created', { item: t('customers.title', 'Customer') }))
      navigate('/customers')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to create customer.'))
    },
  })

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => customerService.update(id, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      qc.invalidateQueries({ queryKey: ['customer-detail', customerId] })
      toast.success(t('toast.updated', { item: t('customers.title', 'Customer') }))
      navigate('/customers')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to update customer.'))
    },
  })

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
      setPhotoAction('change')
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoAction('remove')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!formData.name.trim()) {
      errors.name = t('customers.validationNameRequired', 'Customer name is required')
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    const dataPayload = new FormData()
    dataPayload.append('company_id', formData.company_id)
    if (formData.customer_group_id) dataPayload.append('customer_group_id', formData.customer_group_id)
    if (formData.user_id) dataPayload.append('user_id', formData.user_id)
    dataPayload.append('name', formData.name)
    if (formData.email) dataPayload.append('email', formData.email)
    if (formData.phone) dataPayload.append('phone', formData.phone)
    if (formData.gender) dataPayload.append('gender', formData.gender)
    if (formData.birth_date) dataPayload.append('birth_date', formData.birth_date)
    
    // Enterprise attributes
    dataPayload.append('payment_terms', formData.payment_terms)
    if (formData.credit_limit) dataPayload.append('credit_limit', formData.credit_limit)
    dataPayload.append('is_credit_hold', formData.is_credit_hold ? '1' : '0')
    if (formData.wallet_balance) dataPayload.append('wallet_balance', formData.wallet_balance)
    if (formData.tax_number) dataPayload.append('tax_number', formData.tax_number)
    if (formData.tax_branch_code) dataPayload.append('tax_branch_code', formData.tax_branch_code)
    if (formData.rfm_segment) dataPayload.append('rfm_segment', formData.rfm_segment)
    if (formData.tags) dataPayload.append('tags', formData.tags)
    if (formData.notes) dataPayload.append('notes', formData.notes)
    dataPayload.append('is_active', formData.is_active ? '1' : '0')

    if (photoAction === 'change' && photoFile) {
      dataPayload.append('photo', photoFile)
    } else if (photoAction === 'remove') {
      dataPayload.append('photo', '')
      dataPayload.append('remove_photo', '1')
    }

    if (isEdit && customerId) {
      dataPayload.append('_method', 'PUT')
      updateMutation.mutate({ id: customerId, data: dataPayload })
    } else {
      createMutation.mutate(dataPayload)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const labelCls =
    'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isEdit && isErrorDetail) {
    return (
      <div className="p-6">
        <CustomErrorMessage
          details={detailError}
          onRetry={refetchDetail}
          message={t('customers.errorFailedLoad', 'Failed to load customer profile details.')}
        />
      </div>
    )
  }

  const selectedGroup = groups.find((g: any) => String(g.id) === String(formData.customer_group_id))

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isSubmitting={isSubmitting}
      header={
        <FormHeader
          isEdit={isEdit}
          title={isEdit ? t('customers.editCustomerProfile', 'Edit Customer Profile') : t('customers.registerCustomer', 'Register New Customer')}
          subtitle={t('customers.formSubtitle', 'Manage and complete customer profile in CRM')}
          breadcrumbs={[
            { label: t('customers.title', 'Customers'), href: '/customers' },
            { label: isEdit ? t('customers.edit', 'Edit') : t('customers.create', 'Create') }
          ]}
          backPath="/customers"
          backLabel={t('common.back', 'Back')}
          showSubmit={false}
        />
      }
      footer={
        <FormFooter
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/customers')}
          cancelPath="/customers"
          submitLabel={isEdit ? t('customers.saveChanges', 'Save Changes') : t('customers.registerCustomerBtn', 'Register Customer')}
        />
      }
    >
      <FormContent maxWidth="3xl" layout="two-column">
        {/* ─── LEFT MAIN COLUMN (lg:col-span-8) ─── */}
        <div className="lg:col-span-8 space-y-6">

          {/* CARD 1: Core Customer Profile & Contact */}
          <FormCard
            title={t('customers.sectionBasicDetails', 'General Information & Contact')}
            subtitle={t('customers.sectionBasicDetailsSub', 'Customer identity, contact details, and profile photo')}
            contentClassName="space-y-5"
          >

            {/* Profile Photo Avatar Section */}
            <div className="flex items-center gap-4.5 p-4 rounded-xl border border-border/70 dark:border-slate-800 bg-muted/20 dark:bg-slate-800/40">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-border/80 dark:border-slate-700 group shadow-xs shrink-0 bg-background dark:bg-slate-900 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Customer Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95">
                    <Camera size={13} />
                    <span>{photoPreview ? t('customers.changePhoto', 'Change Photo') : t('customers.uploadPhotoBtn', 'Upload Photo')}</span>
                    <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                  </label>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="h-8 px-2.5 rounded-lg border border-rose-500/30 dark:border-rose-500/40 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                      title={t('customers.removePhoto', 'Remove Photo')}
                    >
                      <Trash2 size={13} />
                      <span>{t('customers.removePhoto', 'Remove')}</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('customers.photoHint', 'PNG, JPG, WEBP up to 5MB')}
                </p>
              </div>
            </div>

            {/* Customer Full Name */}
            <div>
              <label className={labelCls}>
                {t('customers.fullName', 'Customer Full Name')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormField('name', e.target.value)}
                placeholder={t('customers.namePlaceholder', 'e.g. Sok Chandara / Tech Solutions Co., Ltd')}
                className={getFieldClass(formErrors.name, 'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg border transition-all')}
              />
              <FieldError error={formErrors.name} />
            </div>

            {/* Gender & Birth Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t('customers.gender', 'Gender')}</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormField('gender', e.target.value)}
                  className="form-select cursor-pointer"
                >
                  <option value="">{t('customers.selectGender', 'Select Gender')}</option>
                  <option value="male">{t('customers.genderMale', 'Male')}</option>
                  <option value="female">{t('customers.genderFemale', 'Female')}</option>
                  <option value="other">{t('customers.genderOther', 'Other')}</option>
                </select>
              </div>

              <div>
                <EnterpriseDatePicker
                  label={t('customers.birthDate', 'Date of Birth')}
                  value={formData.birth_date}
                  onChange={(val) => setFormField('birth_date', val)}
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className={labelCls}>{t('customers.phone', 'Phone Number')}</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => setFormField('phone', e.target.value.replace(/[^\d+ -]/g, ''))}
                  placeholder="012 345 678"
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className={labelCls}>{t('customers.email', 'Email Address')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormField('email', e.target.value)}
                  placeholder="customer@domain.com"
                  className="form-input"
                />
              </div>
            </div>

            {/* Linked User Login Account */}
            <div>
              <label className={labelCls}>
                {t('customers.linkedUserLogin', 'Linked User Portal Account')}
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormField('user_id', e.target.value)}
                className="form-select cursor-pointer"
              >
                <option value="">{t('customers.noLinkedUser', 'Not linked to any user account')}</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </FormCard>

          {/* CARD 2: Enterprise Credit & B2B Financial Terms */}
          <FormCard
            title={t('customers.sectionCreditTax', 'B2B Credit, Payment Terms & Tax')}
            subtitle={t('customers.sectionCreditTaxSub', 'Corporate payment limits, credit rules, and official VAT invoicing')}
            contentClassName="space-y-5"
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  {t('customers.paymentTermsLabel', 'Payment Terms')}
                </label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormField('payment_terms', e.target.value)}
                  className="form-select cursor-pointer font-mono font-bold"
                >
                  <option value="prepaid">{t('customers.paymentTermPrepaid', 'Prepaid (Direct Payment)')}</option>
                  <option value="net_15">{t('customers.paymentTermNet15', 'Net 15 Days')}</option>
                  <option value="net_30">{t('customers.paymentTermNet30', 'Net 30 Days (Standard Corporate)')}</option>
                  <option value="net_60">{t('customers.paymentTermNet60', 'Net 60 Days')}</option>
                  <option value="eom">{t('customers.paymentTermEom', 'End of Month (EOM)')}</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  {t('customers.creditLimitLabel', 'Credit Limit ($)')}
                </label>
                <input
                  type="number"
                  step="100"
                  value={formData.credit_limit}
                  onChange={(e) => setFormField('credit_limit', e.target.value)}
                  placeholder="5000.00"
                  className="form-input font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  {t('customers.taxNumberLabel', 'Tax Identification Number (VAT ID / Tax Number)')}
                </label>
                <input
                  type="text"
                  value={formData.tax_number}
                  onChange={(e) => setFormField('tax_number', e.target.value.toUpperCase())}
                  placeholder="K00123456"
                  className="form-input font-mono uppercase"
                />
              </div>

              <div>
                <label className={labelCls}>
                  {t('customers.taxBranchCodeLabel', 'Tax Branch Code (e-Invoice Standard)')}
                </label>
                <input
                  type="text"
                  value={formData.tax_branch_code}
                  onChange={(e) => setFormField('tax_branch_code', e.target.value)}
                  placeholder="00001 (Head Office)"
                  className="form-input font-mono"
                />
              </div>
            </div>

            {/* Credit Hold Checkbox Card */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                formData.is_credit_hold
                  ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/40 dark:border-rose-500/50 shadow-2xs'
                  : 'bg-muted/20 dark:bg-slate-800/30 border-border/70 dark:border-slate-700/60 hover:bg-muted/40 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.is_credit_hold}
                onChange={(e) => setFormField('is_credit_hold', e.target.checked)}
                className="checkbox mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground dark:text-slate-200 block">
                  {t('customers.creditHoldTitle', 'Lock Account / Credit Hold')}
                </span>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {t('customers.creditHoldDesc', 'Temporarily suspend credit purchasing for this account')}
                </p>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400 mt-1.5">
                  {t('customers.creditHoldHelper', 'When enabled, POS and order checkouts will be blocked for this customer')}
                </p>
              </div>
            </label>
          </FormCard>

        </div>

        {/* ─── RIGHT SIDEBAR COLUMN (lg:col-span-4) ─── */}
        <div className="lg:col-span-4 space-y-6">

          {/* SIDEBAR CARD 1: Status & Classification */}
          <FormCard
            title={t('customers.sidebarGroupStatus', 'Group & Account Status')}
            subtitle={t('customers.sidebarGroupStatusSub', 'Membership tier, RFM segment and active state')}
            contentClassName="space-y-5"
          >

            {/* Active Status Checkbox Card */}
            <label
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                formData.is_active
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/40 dark:border-primary/40 shadow-2xs'
                  : 'bg-muted/20 dark:bg-slate-800/30 border-border/70 dark:border-slate-700/60 hover:bg-muted/40 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormField('is_active', e.target.checked)}
                className="checkbox mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground dark:text-slate-200 block">
                  {t('customers.accountActiveStatus', 'Account Active Status')}
                </span>
                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                  {formData.is_active
                    ? t('customers.statusActiveText', 'Account is Active')
                    : t('customers.statusInactiveText', 'Account is Suspended')}
                </p>
              </div>
            </label>

            {/* Customer Group */}
            <div>
              <label className={labelCls}>{t('customers.customerGroup', 'Customer Group')}</label>
              <select
                value={formData.customer_group_id}
                onChange={(e) => setFormField('customer_group_id', e.target.value)}
                className="form-select cursor-pointer"
              >
                <option value="">{t('customers.standardGroup', 'General / Standard Group')}</option>
                {groups.map((g: any) => (
                  <option key={g.id} value={g.id}>
                    {getCustomerGroupDisplayName(g.name, t)} {g.discount_percent ? `(${g.discount_percent}% OFF)` : ''}
                  </option>
                ))}
              </select>
              {selectedGroup?.discount_percent && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-semibold">
                  {t('customers.discountPercentLabel', { percent: selectedGroup.discount_percent })}
                </p>
              )}
            </div>

            {/* RFM Segment */}
            <div>
              <label className={labelCls}>
                {t('customers.rfmSegmentLabel', 'RFM Segment')}
              </label>
              <select
                value={formData.rfm_segment}
                onChange={(e) => setFormField('rfm_segment', e.target.value)}
                className="form-select cursor-pointer font-semibold"
              >
                <option value="new">{t('customers.rfmNewCustomer', 'New Customer')}</option>
                <option value="potential">{t('customers.rfmPotentialLoyalist', 'Potential Loyalist')}</option>
                <option value="loyal">{t('customers.rfmLoyalCustomer', 'Loyal Customer')}</option>
                <option value="champions">{t('customers.rfmChampionsCustomer', 'Champions (VIP Top Spender)')}</option>
                <option value="at_risk">{t('customers.rfmAtRiskCustomer', 'At-Risk (Churn Warning)')}</option>
                <option value="hibernating">{t('customers.rfmHibernatingCustomer', 'Hibernating / Inactive')}</option>
              </select>
            </div>

            {/* Customer Tags */}
            <div>
              <label className={labelCls}>
                {t('customers.customerTags', 'Customer Tags')}
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormField('tags', e.target.value)}
                placeholder={t('customers.customerTagsPlaceholder', '#VIP, #Wholesale, #B2BContract')}
                className="form-input"
              />
              <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-1.5">
                {t('customers.tagsHelperText', 'Separate tags with commas (e.g. #VIP, #Wholesale)')}
              </p>
            </div>
          </FormCard>

          {/* SIDEBAR CARD 2: Internal Notes */}
          <FormCard
            title={t('customers.sectionNotes', 'Internal Notes')}
            subtitle={t('customers.sectionNotesSub', 'Operational remarks, preferences, and special contracts')}
            contentClassName="space-y-4"
          >

            <div>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormField('notes', e.target.value)}
                placeholder={t('customers.notesPlaceholder', 'Customer preferences, contracts or internal remarks...')}
                className="form-input h-auto min-h-[100px] resize-none py-2.5 leading-relaxed"
              />
            </div>
          </FormCard>

        </div>
      </FormContent>
    </FormLayout>
  )
}

export default CustomerFormPage
