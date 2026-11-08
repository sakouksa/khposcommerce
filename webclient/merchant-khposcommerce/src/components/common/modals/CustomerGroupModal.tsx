import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Award, Sparkles } from 'lucide-react'
import api from '@/api/client'
import { useToast } from '@/hooks/useToast'
import EnterpriseModal from './Modal'
import ModalFooter from './ModalFooter'
import { FieldError, getFieldClass } from '../forms/FormField'

export interface CustomerGroup {
  id: number
  company_id: number
  company?: { name: string }
  name: string
  description?: string | null
  discount_percent: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CustomerGroupFormData {
  company_id: string
  name: string
  discount_percent: number
  description: string
  is_active: boolean
}

export interface CustomerGroupModalProps {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Callback to close modal */
  onClose: () => void
  /** Existing group record when editing (null for new group creation) */
  initialData?: CustomerGroup | null
  /** Optional pre-locked company ID */
  companyId?: number | string
  /** Callback fired after successfully creating or updating group */
  onSuccess?: (group: CustomerGroup) => void
  /** Optional custom class for modal container */
  className?: string
}

export const CustomerGroupModal: React.FC<CustomerGroupModalProps> = ({
  isOpen,
  onClose,
  initialData,
  companyId,
  onSuccess,
  className = '',
}) => {
  const { t } = useTranslation(['customers', 'common'])
  const toast = useToast()
  const qc = useQueryClient()
  const isEdit = Boolean(initialData?.id)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerGroupFormData>({
    defaultValues: {
      company_id: String(companyId || '1'),
      name: '',
      discount_percent: 0,
      description: '',
      is_active: true,
    },
  })

  const watchDiscount = watch('discount_percent')

  // Fetch Companies dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies-dropdown'],
    queryFn: () => api.get('/companies', { params: { per_page: 100 } }).then((r) => r.data.data ?? []),
    enabled: isOpen && !companyId,
    staleTime: 5 * 60 * 1000,
  })

  // Reset form on open / change of initialData
  useEffect(() => {
    if (isOpen) {
      const defaultCompId = String(companies?.[0]?.id || companyId || '1')
      if (initialData) {
        reset({
          company_id: String(initialData.company_id || defaultCompId),
          name: initialData.name || '',
          discount_percent: Number(initialData.discount_percent || 0),
          description: initialData.description || '',
          is_active: Boolean(initialData.is_active),
        })
      } else {
        reset({
          company_id: defaultCompId,
          name: '',
          discount_percent: 0,
          description: '',
          is_active: true,
        })
      }
    }
  }, [isOpen, initialData, companyId, companies, reset])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/customer-groups', payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['customer-groups'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success(t('toast.created', { item: t('customers.customerGroups') }))
      if (onSuccess) {
        onSuccess(res.data?.data || res.data)
      }
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/customer-groups/${id}`, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['customer-groups'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success(t('toast.updated', { item: t('customers.customerGroups') }))
      if (onSuccess) {
        onSuccess(res.data?.data || res.data)
      }
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    },
  })

  const onSubmit = (formData: CustomerGroupFormData) => {
    const payload = {
      company_id: parseInt(formData.company_id, 10),
      name: formData.name.trim(),
      discount_percent: Number(formData.discount_percent || 0),
      description: formData.description?.trim() || null,
      is_active: Boolean(formData.is_active),
    }

    if (isEdit && initialData?.id) {
      updateMutation.mutate({ id: initialData.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending

  const inputCls =
    'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:[color-scheme:dark]'
  const labelCls =
    'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? t('customers.editGroupTitle', t('customers.editGroup', 'Edit Customer Group'))
          : t('customers.addGroupTitle', t('customers.addGroup', 'Add Customer Group'))
      }
      subtitle={t(
        'customers.groupModalSubtitle',
        'Define customer group details and automatic discount rate'
      )}
      icon={<Award size={20} />}
      iconVariant="emerald"
      size="xl"
      className={className}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSaving}
          isEdit={isEdit}
          submitLabel={
            isEdit
              ? t('customers.saveChanges', 'Save Changes')
              : t('customers.saveGroup', 'Save Group')
          }
          onSubmit={handleSubmit(onSubmit)}
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-4">
        {/* Company Select (if not pre-locked) */}
        {!companyId && (
          <div>
            <label className={labelCls}>
              {t('customers.company', 'Company')} <span className="text-rose-500 font-bold">*</span>
            </label>
            <select
              {...register('company_id', {
                required: t('customers.validation.companyRequired', 'Company is required'),
              })}
              className={`${getFieldClass(errors.company_id?.message, 'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border font-medium')} cursor-pointer`}
            >
              <option value="">{t('customers.selectCompany', '-- Select Company --')}</option>
              {(companies ?? []).map((c: any) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError error={errors.company_id?.message} />
          </div>
        )}

        {/* Group Name */}
        <div>
          <label className={labelCls}>
            {t('customers.groupName', 'Group Name')} <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            {...register('name', {
              required: t('customers.validation.nameRequired', 'Group name is required'),
            })}
            placeholder={t('customers.groupNamePlaceholder', 'e.g. VIP Customers / Wholesale')}
            className={getFieldClass(errors.name?.message, 'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border font-medium')}
          />
          <FieldError error={errors.name?.message} />
        </div>

        {/* Discount Percent */}
        <div>
          <label className={labelCls}>
            {t('customers.discountPercent', 'Discount Percent (%)')} <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register('discount_percent', {
              required: t('customers.validation.discountNumeric', 'Discount percent must be numeric'),
              valueAsNumber: true,
              min: { value: 0, message: t('customers.validation.discountMin', 'Discount cannot be negative') },
              max: { value: 100, message: t('customers.validation.discountMax', 'Discount cannot exceed 100%') },
            })}
            placeholder="0.00"
            className={`${getFieldClass(errors.discount_percent?.message, 'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border font-medium')} font-mono`}
          />
          <FieldError error={errors.discount_percent?.message} />
        </div>

        {/* Information Callout Banner */}
        <div className="p-3.5 bg-muted/20 dark:bg-slate-900/60 rounded-xl border border-border/80 dark:border-slate-800 flex items-start gap-2.5">
          <Sparkles size={16} className="text-primary mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground dark:text-slate-300 leading-relaxed">
            <p className="font-semibold text-foreground dark:text-slate-100 mb-0.5">
              {t('customers.groupBenefits', 'Membership Benefits')}
            </p>
            {Number(watchDiscount || 0) > 0
              ? t(
                  'customers.discountPreviewNotice',
                  'Customers in this group will receive an automatic {{discount}}% discount on POS & sales orders.',
                  { discount: watchDiscount }
                )
              : t(
                  'customers.groupStandardNotice',
                  'Customers in the standard group will receive regular pricing and standard loyalty point accrual.'
                )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>
            {t('customers.description', 'Description & Notes')}
          </label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder={t(
              'customers.groupDescriptionPlaceholder',
              'Additional notes or criteria for this customer group...'
            )}
            className="w-full min-h-[70px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
          />
        </div>

        {/* Active Toggle Card */}
        <div className="p-4 bg-muted/15 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <label
              htmlFor="isActiveCustomerGroupCheckbox"
              className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 cursor-pointer select-none block"
            >
              {t('customers.activeGroupStatus', 'Active Group Status')}
            </label>
            <p className="text-[11px] text-muted-foreground dark:text-slate-400">
              {t('customers.activeGroupHelp', 'Allow this group to be assigned to customers and used in sales')}
            </p>
          </div>
          <input
            type="checkbox"
            id="isActiveCustomerGroupCheckbox"
            {...register('is_active')}
            className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary cursor-pointer"
          />
        </div>
      </form>
    </EnterpriseModal>
  )
}

export default CustomerGroupModal
