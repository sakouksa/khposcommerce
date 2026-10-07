import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { MapPin, Check, X } from 'lucide-react'
import api from '@/api/client'
import { useToast } from '@/hooks/useToast'
import EnterpriseModal from './Modal'
import ModalFooter from './ModalFooter'
import { formatPhoneNumber } from '@/utils/formatters'

export interface CustomerAddress {
  id?: number
  customer_id: number | string
  customer?: { id?: number; name: string; email?: string; phone?: string; photo?: string; avatar?: string }
  label: 'Home' | 'Office' | 'Warehouse' | 'Other' | string
  name: string
  phone: string
  address: string
  city: string
  province: string
  country: string
  postal_code: string
  latitude?: number | string
  longitude?: number | string
  is_default: boolean
  created_at?: string
}

export interface AddressFormData {
  customer_id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  province: string
  country: string
  postal_code: string
  is_default: boolean
}

export interface CustomerAddressModalProps {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Close callback */
  onClose: () => void
  /** Existing address data to edit, or null/undefined to create new */
  initialData?: CustomerAddress | null
  /** Optional customer ID to lock address to a specific customer */
  customerId?: number | string
  /** Optional customer name to display when customerId is locked */
  customerName?: string
  /** Callback fired after successfully creating or updating an address */
  onSuccess?: (address: CustomerAddress) => void
  /** Optional extra CSS classes for modal container */
  className?: string
}

const PRESET_TYPES = [
  { value: 'Home', labelKey: 'customers.labelHome', defaultLabel: 'Home' },
  { value: 'Office', labelKey: 'customers.labelOffice', defaultLabel: 'Office' },
  { value: 'Warehouse', labelKey: 'customers.labelWarehouse', defaultLabel: 'Warehouse' },
  { value: 'Other', labelKey: 'customers.labelOther', defaultLabel: 'Other' },
] as const

const QUICK_SUGGESTIONS = [
  { key: 'labelStore', defaultLabel: 'Store' },
  { key: 'labelBranch', defaultLabel: 'Branch' },
  { key: 'labelCondo', defaultLabel: 'Condo' },
  { key: 'labelVilla', defaultLabel: 'Villa' },
  { key: 'labelFactory', defaultLabel: 'Factory' },
  { key: 'labelHotel', defaultLabel: 'Hotel' },
  { key: 'labelApartment', defaultLabel: 'Apartment' },
  { key: 'labelHQ', defaultLabel: 'HQ' },
]

export const CustomerAddressModal: React.FC<CustomerAddressModalProps> = ({
  isOpen,
  onClose,
  initialData,
  customerId,
  customerName,
  onSuccess,
  className = '',
}) => {
  const { t } = useTranslation(['customers', 'common'])
  const toast = useToast()
  const qc = useQueryClient()
  const [selectedPreset, setSelectedPreset] = useState<'Home' | 'Office' | 'Warehouse' | 'Other'>('Home')
  const [customLabel, setCustomLabel] = useState('')

  const isEdit = Boolean(initialData?.id)

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    defaultValues: {
      customer_id: customerId ? String(customerId) : '',
      label: 'Home',
      name: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      country: 'Cambodia',
      postal_code: '',
      is_default: false,
    },
  })

  const currentCustomerId = watch('customer_id')

  // Fetch customers if not pre-locked
  const { data: customers = [] } = useQuery({
    queryKey: ['all-customers-select'],
    queryFn: async () => {
      const res = await api.get('/customers', { params: { per_page: 200 } })
      return res.data?.data?.data || res.data?.data || res.data || []
    },
    enabled: isOpen && !customerId,
    staleTime: 5 * 60 * 1000,
  })

  // Populate form values on open or when initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const rawLabel = initialData.label || 'Home'
        const isPreset = ['Home', 'Office', 'Warehouse'].includes(rawLabel)

        if (isPreset) {
          setSelectedPreset(rawLabel as any)
          setCustomLabel('')
        } else {
          setSelectedPreset('Other')
          setCustomLabel(rawLabel === 'Other' ? '' : rawLabel)
        }

        reset({
          customer_id: String(initialData.customer_id || customerId || ''),
          label: rawLabel,
          name: initialData.name || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
          city: initialData.city || '',
          province: initialData.province || '',
          country: initialData.country || 'Cambodia',
          postal_code: initialData.postal_code || '',
          is_default: Boolean(initialData.is_default),
        })
      } else {
        setSelectedPreset('Home')
        setCustomLabel('')
        reset({
          customer_id: customerId ? String(customerId) : '',
          label: 'Home',
          name: '',
          phone: '',
          address: '',
          city: '',
          province: '',
          country: 'Cambodia',
          postal_code: '',
          is_default: false,
        })
      }
    }
  }, [isOpen, initialData, customerId, reset])

  // Extract friendly error message
  const extractErrorMessage = (err: any, defaultMsg: string) => {
    const serverErrors = err.response?.data?.errors
    let msg = err.response?.data?.message || defaultMsg
    if (serverErrors && typeof serverErrors === 'object') {
      const firstKey = Object.keys(serverErrors)[0]
      if (firstKey && Array.isArray(serverErrors[firstKey]) && serverErrors[firstKey][0]) {
        msg = `${msg}: ${serverErrors[firstKey][0]}`
      }
    }
    return msg
  }

  // Save / Update Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post('/customer-addresses', payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['customer-addresses'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success(t('customers.addressCreatedSuccess', t('common.savedSuccessfully', 'Address saved successfully!')))
      if (onSuccess) {
        onSuccess(res.data?.data || res.data)
      }
      onClose()
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, t('common.errorOccurred', 'Failed to save address')))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/customer-addresses/${id}`, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['customer-addresses'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success(t('customers.addressUpdatedSuccess', t('common.savedSuccessfully', 'Address updated successfully!')))
      if (onSuccess) {
        onSuccess(res.data?.data || res.data)
      }
      onClose()
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, t('common.errorOccurred', 'Failed to update address')))
    },
  })

  // Submit Handler
  const onSubmit = async (data: AddressFormData) => {
    const finalLabel = selectedPreset === 'Other'
      ? (customLabel.trim() || 'Other')
      : selectedPreset

    const payload = {
      customer_id: Number(data.customer_id),
      label: finalLabel,
      name: data.name.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      province: data.province.trim(),
      country: data.country.trim() || 'Cambodia',
      postal_code: data.postal_code.trim(),
      latitude: initialData?.latitude ? Number(initialData.latitude) : null,
      longitude: initialData?.longitude ? Number(initialData.longitude) : null,
      is_default: Boolean(data.is_default),
    }

    if (isEdit && initialData?.id) {
      await updateMutation.mutateAsync({ id: initialData.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
  }

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending

  // Find resolved customer name if pre-locked or selected
  const resolvedCustomerName =
    customerName ||
    (customerId
      ? undefined
      : (customers as any[]).find((c) => String(c.id) === String(currentCustomerId))?.name)

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
          ? t('customers.editAddressTitle', t('customers.editAddress', 'Edit Delivery Address'))
          : t('customers.addAddressTitle', t('customers.addAddress', 'Add Delivery Address'))
      }
      subtitle={t(
        'customers.addressModalSubtitle',
        'Manage delivery address and recipient contact details'
      )}
      icon={<MapPin size={20} />}
      iconVariant="emerald"
      size="2xl"
      className={className}
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSaving}
          isEdit={isEdit}
          submitLabel={
            isEdit
              ? t('customers.saveChanges', 'Save Changes')
              : t('customers.saveAddress', 'Save Address')
          }
          submitIcon={<Check size={14} strokeWidth={2.5} />}
          onSubmit={handleSubmit(onSubmit)}
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-4">
        {/* ─── Customer Selection ─── */}
        <div>
          {customerId ? (
            <div>
              <label className={labelCls}>
                {t('customers.customer', 'Customer')}
              </label>
              <div className="flex items-center h-10 px-3.5 rounded-lg border border-border/80 dark:border-slate-700/80 bg-muted/30 dark:bg-slate-800/60 text-foreground dark:text-slate-200 text-xs sm:text-[13px] font-semibold">
                <span className="truncate">{resolvedCustomerName || `Customer #${customerId}`}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className={labelCls}>
                {t('customers.customer', 'Customer')} <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('customer_id', {
                  required: t('customers.validation.customerRequired', 'Customer is required'),
                })}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="">{t('customers.selectCustomer', '-- Select Customer --')}</option>
                {(customers ?? []).map((c: any) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
              {errors.customer_id && (
                <p className="text-rose-500 text-[11px] mt-1 font-medium">
                  {errors.customer_id.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ─── Address Label (Clean Segmented Capsule) ─── */}
        <div>
          <label className={labelCls}>
            {t('customers.addressLabel', 'Address Label')} <span className="text-rose-500">*</span>
          </label>

          {/* Segmented Capsule Track */}
          <div className="p-1 bg-muted/60 dark:bg-slate-900 border border-border/70 dark:border-slate-800 rounded-xl grid grid-cols-4 gap-1">
            {PRESET_TYPES.map((type) => {
              const isSelected = selectedPreset === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(type.value as any)
                    if (type.value !== 'Other') {
                      setValue('label', type.value)
                    } else {
                      setValue('label', customLabel.trim() || 'Other')
                    }
                  }}
                  className={`h-9 px-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-foreground dark:text-white font-semibold shadow-xs border border-border/50 dark:border-slate-700'
                      : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200 hover:bg-background/40 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span className="truncate">{t(type.labelKey, type.defaultLabel)}</span>
                </button>
              )
            })}
          </div>

          {/* Other / Custom Label Input & Suggestions */}
          {selectedPreset === 'Other' && (
            <div className="mt-3 p-3.5 bg-muted/30 dark:bg-slate-900/60 border border-border/70 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1">
              <div>
                <label className="block text-[11px] font-semibold text-foreground/80 dark:text-slate-300 mb-1">
                  {t('customers.customAddressLabel', 'Custom Label Name')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => {
                      setCustomLabel(e.target.value)
                      setValue('label', e.target.value.trim() || 'Other')
                    }}
                    placeholder={t('customers.customAddressLabelPlaceholder', 'e.g. Villa, Branch Store, Condo, Factory...')}
                    className="w-full h-9 px-3 pr-8 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700 bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    autoFocus
                  />
                  {customLabel && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLabel('')
                        setValue('label', 'Other')
                      }}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Suggestions Chips (Clean Text Badges) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-muted-foreground dark:text-slate-400">
                  {t('customers.customLabelSuggestions', 'Quick suggestions:')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.map((sug) => {
                    const translatedSug = t(`customers.${sug.key}`, sug.defaultLabel)
                    const isChipSelected =
                      customLabel.trim().toLowerCase() === translatedSug.toLowerCase() ||
                      customLabel.trim().toLowerCase() === sug.defaultLabel.toLowerCase()
                    return (
                      <button
                        key={sug.key}
                        type="button"
                        onClick={() => {
                          setCustomLabel(translatedSug)
                          setValue('label', translatedSug)
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer active:scale-95 border ${
                          isChipSelected
                            ? 'bg-foreground text-background dark:bg-white dark:text-slate-900 border-transparent font-semibold shadow-xs'
                            : 'bg-background dark:bg-slate-900/80 hover:bg-muted text-muted-foreground dark:text-slate-300 border-border/70 dark:border-slate-700 hover:text-foreground'
                        }`}
                      >
                        {translatedSug}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Recipient Name & Phone Number ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              {t('customers.receiverName', 'Recipient Name')} <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('name', {
                required: t('customers.validation.receiverNameRequired', 'Recipient name is required'),
              })}
              placeholder={t('customers.receiverNamePlaceholder', 'e.g. Sok Chantha')}
              className={inputCls}
            />
            {errors.name && (
              <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>
              {t('customers.phone', 'Phone Number')} <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('phone', {
                required: t('customers.validation.phoneRequired', 'Phone number is required'),
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/[^\d+ -]/g, '')
                },
              })}
              type="tel"
              inputMode="tel"
              placeholder="012 345 678"
              className={`${inputCls} font-mono`}
            />
            {errors.phone && (
              <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* ─── Street Address ─── */}
        <div>
          <label className={labelCls}>
            {t('customers.streetAddress', 'Street Address')} <span className="text-rose-500">*</span>
          </label>
          <input
            {...register('address', {
              required: t('customers.validation.addressRequired', 'Street address is required'),
            })}
            placeholder={t('customers.streetAddressPlaceholder', 'e.g. #123 St. 456, Sangkat Boeung Keng Kang 1')}
            className={inputCls}
          />
          {errors.address && (
            <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.address.message}</p>
          )}
        </div>

        {/* ─── City, Province, Postal Code (Spacious Clean 3-column Grid) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Hidden Country field for background auto-save */}
          <input type="hidden" {...register('country')} />

          <div>
            <label className={labelCls}>
              {t('customers.city', 'City')} <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('city', {
                required: t('customers.validation.cityRequired', 'City is required'),
              })}
              placeholder={t('customers.cityPlaceholder', 'e.g. Phnom Penh')}
              className={inputCls}
            />
            {errors.city && (
              <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>
              {t('customers.province', 'Province')} <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('province', {
                required: t('customers.validation.provinceRequired', 'Province is required'),
              })}
              placeholder={t('customers.provincePlaceholder', 'Phnom Penh')}
              className={inputCls}
            />
            {errors.province && (
              <p className="text-rose-500 text-[11px] mt-1 font-medium">{errors.province.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>
              {t('customers.postalCode', 'Postal Code')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              {...register('postal_code', {
                required: t('customers.validation.postalCodeRequired', 'Postal code is required'),
                onChange: (e: any) => {
                  e.target.value = e.target.value.replace(/[^0-9a-zA-Z-]/g, '')
                }
              })}
              placeholder={t('customers.postalCodePlaceholder', '12000')}
              className={`${inputCls} font-mono`}
            />
            {errors.postal_code && (
              <p className="text-rose-500 text-[11px] mt-1 font-medium">
                {errors.postal_code.message}
              </p>
            )}
          </div>
        </div>

        {/* ─── Default Address Toggle Card ─── */}
        <div className="p-4 bg-muted/15 dark:bg-slate-900/60 border border-border/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <label
              htmlFor="isDefaultAddressCheckbox"
              className="text-xs sm:text-[13px] font-bold text-foreground dark:text-slate-100 cursor-pointer select-none block"
            >
              {t('customers.setDefault', 'Set as Default Address')}
            </label>
            <p className="text-[11px] text-muted-foreground dark:text-slate-400">
              {t(
                'customers.defaultAddressHelp',
                'Use this address as primary default for orders and POS deliveries'
              )}
            </p>
          </div>
          <input
            type="checkbox"
            id="isDefaultAddressCheckbox"
            {...register('is_default')}
            className="form-checkbox h-5 w-5 text-primary rounded border-border focus:ring-primary cursor-pointer"
          />
        </div>
      </form>
    </EnterpriseModal>
  )
}

export default CustomerAddressModal
