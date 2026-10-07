import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  FormLayout,
  FormContent,
  FormCard,
  FormHeader,
  FormFooter,
  FormField,
  getFieldClass,
  LoadingSpinner,
  ToggleSwitch,
} from '@/components/common'
import { orderReturnService } from '@/services/orderReturnService'
import { categoryService } from '@/services/categoryService'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/stores/authStore'
import { getCategoryDisplayName } from './ReturnPoliciesPage'

// Standard return condition keys (translated via local returns.json conditionLabels)
const AVAILABLE_CONDITION_KEYS = [
  'resellable_condition',
  'serial_imei_match',
  'icloud_google_unlocked',
  'all_in_box_accessories',
  'no_scratches',
  'unwashed',
  'price_tags_attached',
  'original_shoe_box',
]

// Preset quick window days
const PRESET_DAYS = [7, 14, 30, 45, 60]

export const ReturnPolicyFormPage: React.FC = () => {
  const { t } = useTranslation(['returns', 'nav', 'sales', 'common'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const policyId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const companyId = user?.company?.id || (user as any)?.company_id || 1

  // Form states
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [returnWindowDays, setReturnWindowDays] = useState(7)
  const [isReturnable, setIsReturnable] = useState(true)
  const [allowExchange, setAllowExchange] = useState(true)
  const [restockingFeePct, setRestockingFeePct] = useState(0)
  const [customerShippingFee, setCustomerShippingFee] = useState(0)
  const [storeShippingFee, setStoreShippingFee] = useState(0)
  const [requiresPackaging, setRequiresPackaging] = useState(true)
  const [requiresReceipt, setRequiresReceipt] = useState(true)
  const [isDefault, setIsDefault] = useState(false)
  const [conditionsAccepted, setConditionsAccepted] = useState<string[]>([])
  const [nameError, setNameError] = useState<string | null>(null)

  // 1. Fetch Categories
  const { data: catData } = useQuery({
    queryKey: ['categories-for-policies'],
    queryFn: () => categoryService.list({ per_page: 100 }),
  })
  const categories: Array<{ id: number; name: string }> = Array.isArray(catData?.data)
    ? catData.data
    : Array.isArray(catData?.data?.data)
    ? catData.data.data
    : []

  // 2. Fetch Existing Policy if in Edit Mode
  const { data: existingPolicy, isLoading: isLoadingPolicy } = useQuery({
    queryKey: ['return-policy', policyId],
    queryFn: () => orderReturnService.getPolicy(policyId!),
    enabled: isEdit && !!policyId,
  })

  // Populate data when existing policy loads
  useEffect(() => {
    if (isEdit && existingPolicy) {
      setName(existingPolicy.name || '')
      setCategoryId(existingPolicy.category_id || '')
      setReturnWindowDays(Number(existingPolicy.return_window_days) || 0)
      setIsReturnable(existingPolicy.is_returnable ?? true)
      setAllowExchange(existingPolicy.allow_exchange ?? true)
      setRestockingFeePct(Number(existingPolicy.restocking_fee_percentage) || 0)
      setCustomerShippingFee(Number(existingPolicy.customer_fault_shipping_fee) || 0)
      setStoreShippingFee(Number(existingPolicy.store_fault_shipping_fee) || 0)
      setRequiresPackaging(existingPolicy.requires_original_packaging ?? true)
      setRequiresReceipt(existingPolicy.requires_receipt ?? true)
      setIsDefault(Boolean(existingPolicy.is_default))
      setConditionsAccepted(
        Array.isArray(existingPolicy.conditions_accepted) ? existingPolicy.conditions_accepted : []
      )
    }
  }, [isEdit, existingPolicy])

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit && policyId
        ? orderReturnService.updatePolicy(policyId, payload)
        : orderReturnService.createPolicy({ ...payload, company_id: companyId }),
    onSuccess: () => {
      toast.success(isEdit ? t('policies.policyUpdated') : t('policies.policySaved'))
      queryClient.invalidateQueries({ queryKey: ['return-policies'] })
      navigate('/return-policies')
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          t('common.errorOccurred', 'មានបញ្ហាក្នុងការរក្សាទុក')
      )
    },
  })

  // Toggle condition tag
  const toggleCondition = (code: string) => {
    setConditionsAccepted((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  // Handle Form Submit
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(t('policies.nameRequired'))
      return
    }
    setNameError(null)

    saveMutation.mutate({
      name: trimmedName,
      category_id: categoryId === '' ? null : Number(categoryId),
      return_window_days: Number(returnWindowDays) || 0,
      is_returnable: isReturnable,
      allow_exchange: allowExchange,
      restocking_fee_percentage: Number(restockingFeePct) || 0,
      restocking_fee_flat: 0,
      customer_fault_shipping_fee: Number(customerShippingFee) || 0,
      store_fault_shipping_fee: Number(storeShippingFee) || 0,
      requires_original_packaging: requiresPackaging,
      requires_receipt: requiresReceipt,
      conditions_accepted: conditionsAccepted,
      is_default: isDefault,
    })
  }

  // Summary for bottom footer
  const getInfoSummary = () => {
    const scope = categoryId
      ? categories.find((c) => c.id === categoryId)?.name || t('policies.category')
      : t('policies.appliesStorewide')
    const daysLabel = isReturnable
      ? `${returnWindowDays} ${t('policies.days')}`
      : t('policies.nonReturnable')
    const restock =
      Number(restockingFeePct) > 0
        ? `Restock ${restockingFeePct}%`
        : t('policies.freeRestocking')

    return (
      <div className="text-xs text-muted-foreground font-medium truncate">
        {scope} • {daysLabel} • {restock}
        {isDefault && ` • ${t('policies.default')}`}
      </div>
    )
  }

  if (isEdit && isLoadingPolicy) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isSubmitting={saveMutation.isPending}
      maxWidth="full"
      header={
        <FormHeader
          isEdit={isEdit}
          title={isEdit ? t('policies.editPolicy') : t('policies.addPolicy')}
          subtitle={t('policies.subtitle')}
          backPath="/return-policies"
          breadcrumbs={[
            { label: t('nav.home', 'ទំព័រដើម'), path: '/' },
            { label: t('nav.sales', 'ការគ្រប់គ្រងការលក់'), path: '/sales' },
            { label: t('policies.title'), path: '/return-policies' },
            {
              label: isEdit ? t('policies.editPolicy') : t('policies.addPolicy'),
            },
          ]}
          statusBadge={
            isEdit && policyId ? (
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                #{policyId}
              </span>
            ) : undefined
          }
        />
      }
      footer={
        <FormFooter
          isEdit={isEdit}
          isSubmitting={saveMutation.isPending}
          cancelPath="/return-policies"
          cancelLabel={t('policies.cancel')}
          submitLabel={isEdit ? t('policies.saveChanges') : t('policies.save')}
          onCancel={() => navigate('/return-policies')}
          infoSummary={getInfoSummary()}
        />
      }
    >
      <FormContent maxWidth="full" className="space-y-6">
        {/* CARD 1: General Information */}
        <FormCard
          title={t('policies.sectionGeneral')}
          subtitle={t('policies.sectionGeneralSubtitle')}
          contentClassName="space-y-5"
        >
          {/* Policy Name & Category in a 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Policy Name */}
            <FormField
              label={t('policies.policyName')}
              required
              error={nameError}
            >
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) setNameError(null)
                }}
                placeholder={t('policies.policyNamePlaceholder')}
                className={getFieldClass(nameError, 'form-input')}
              />
            </FormField>

            {/* Category Assignment */}
            <FormField
              label={t('policies.category')}
            >
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                className="form-select cursor-pointer"
              >
                <option value="">{t('policies.allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCategoryDisplayName(c.name, t)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Store-Wide Default Row */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border/80 bg-muted/20 dark:bg-slate-800/30">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs sm:text-sm font-semibold text-foreground">
                {t('policies.defaultStorewide')}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {t('policies.defaultStorewideDesc')}
              </p>
            </div>
            <ToggleSwitch
              checked={isDefault}
              onChange={setIsDefault}
              size="md"
            />
          </div>
        </FormCard>

        {/* CARD 2: Window & Logistics Fees */}
        <FormCard
          title={t('policies.sectionFees')}
          subtitle={t('policies.sectionFeesSubtitle')}
          contentClassName="space-y-5"
        >
          {/* Row 1: Return Window Days and Quick Presets side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <FormField label={t('policies.windowDays')} required>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  required
                  value={returnWindowDays}
                  onChange={(e) => setReturnWindowDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="form-input pr-16"
                />
                <div className="absolute right-0 top-0 bottom-0 px-3.5 bg-muted/50 dark:bg-slate-800/60 border-l border-border/80 dark:border-slate-700/80 rounded-r-lg flex items-center text-xs font-semibold text-muted-foreground pointer-events-none select-none">
                  {t('policies.days')}
                </div>
              </div>
            </FormField>

            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                {t('policies.quickPresets')}
              </label>
              <div className="flex items-center gap-1.5 h-10 flex-wrap">
                {PRESET_DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setReturnWindowDays(d)}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      returnWindowDays === d
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-card dark:bg-slate-800 text-muted-foreground border-border/80 hover:border-border hover:text-foreground'
                    }`}
                  >
                    {d} {t('policies.days')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: 3 Aligned Fee Inputs with Attached Addon Badges */}
          <div className="pt-4 border-t border-border/70">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Restocking Fee */}
              <FormField label={t('policies.restockingFee')}>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={restockingFeePct}
                    onChange={(e) =>
                      setRestockingFeePct(
                        Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                      )
                    }
                    className="form-input pr-12"
                  />
                  <div className="absolute right-0 top-0 bottom-0 px-3.5 bg-muted/50 dark:bg-slate-800/60 border-l border-border/80 dark:border-slate-700/80 rounded-r-lg flex items-center text-xs font-semibold text-muted-foreground pointer-events-none select-none">
                    %
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {t('policies.restockingDesc')}
                </p>
              </FormField>

              {/* Customer Fault Shipping */}
              <FormField label={t('policies.customerShipping')}>
                <div className="relative flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 px-3.5 bg-muted/50 dark:bg-slate-800/60 border-r border-border/80 dark:border-slate-700/80 rounded-l-lg flex items-center text-xs font-semibold text-muted-foreground pointer-events-none select-none">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={customerShippingFee}
                    onChange={(e) =>
                      setCustomerShippingFee(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="form-input pl-11"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {t('policies.customerShippingDesc')}
                </p>
              </FormField>

              {/* Store Fault Shipping */}
              <FormField label={t('policies.storeShipping')}>
                <div className="relative flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 px-3.5 bg-muted/50 dark:bg-slate-800/60 border-r border-border/80 dark:border-slate-700/80 rounded-l-lg flex items-center text-xs font-semibold text-muted-foreground pointer-events-none select-none">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={storeShippingFee}
                    onChange={(e) =>
                      setStoreShippingFee(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="form-input pl-11"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {t('policies.storeShippingDesc')}
                </p>
              </FormField>
            </div>
          </div>
        </FormCard>

        {/* CARD 3: Rules & Conditions */}
        <FormCard
          title={t('policies.sectionRules')}
          subtitle={t('policies.sectionRulesSubtitle')}
          contentClassName="space-y-4"
        >
          {/* 4 Clean Enterprise Toggle Cards across 4 columns on large screen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Allow Return */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card dark:bg-slate-800/40">
              <div className="space-y-0.5 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  {t('policies.isReturnable')}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t('policies.isReturnableDesc')}
                </p>
              </div>
              <ToggleSwitch
                checked={isReturnable}
                onChange={setIsReturnable}
                size="sm"
              />
            </div>

            {/* 2. Allow Exchange */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card dark:bg-slate-800/40">
              <div className="space-y-0.5 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  {t('policies.allowExchange')}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t('policies.allowExchangeDesc')}
                </p>
              </div>
              <ToggleSwitch
                checked={allowExchange}
                onChange={setAllowExchange}
                size="sm"
              />
            </div>

            {/* 3. Require Receipt */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card dark:bg-slate-800/40">
              <div className="space-y-0.5 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  {t('policies.receiptRequired')}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t('policies.receiptRequiredDesc')}
                </p>
              </div>
              <ToggleSwitch
                checked={requiresReceipt}
                onChange={setRequiresReceipt}
                size="sm"
              />
            </div>

            {/* 4. Require Original Packaging */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card dark:bg-slate-800/40">
              <div className="space-y-0.5 pr-3">
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  {t('policies.packagingRequired')}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t('policies.packagingRequiredDesc')}
                </p>
              </div>
              <ToggleSwitch
                checked={requiresPackaging}
                onChange={setRequiresPackaging}
                size="sm"
              />
            </div>
          </div>

          {/* Acceptance Condition Chips */}
          <div className="pt-3 border-t border-border/70">
            <label className="block text-xs font-semibold text-foreground mb-2.5">
              {t('policies.additionalConditions')}
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CONDITION_KEYS.map((code) => {
                const isChecked = conditionsAccepted.includes(code)
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleCondition(code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-2xs'
                        : 'bg-card dark:bg-slate-800 text-muted-foreground border-border/70 hover:border-border hover:text-foreground'
                    }`}
                  >
                    {t(`policies.conditionLabels.${code}`, code)}
                  </button>
                )
              })}
            </div>
          </div>
        </FormCard>
      </FormContent>
    </FormLayout>
  )
}

export default ReturnPolicyFormPage

