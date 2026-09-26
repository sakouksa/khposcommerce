import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShieldCheck,
  FileText,
  Clock,
  RotateCcw,
  ArrowLeftRight,
  Receipt,
  Package,
  Star,
  Info,
  Check,
} from 'lucide-react'
import {
  EnterpriseModal,
  ModalFooter,
  ToggleSwitch,
  FieldError,
  getFieldClass,
} from '@/components/common'
import { orderReturnService } from '@/services/orderReturnService'
import { useToast } from '@/hooks/useToast'
import type { ReturnPolicy } from '@/types/orderReturn.types'
import { getCategoryDisplayName } from '../ReturnPoliciesPage'

export interface ReturnPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  editingPolicy?: ReturnPolicy | null
  categories: { id: number; name: string }[]
  companyId: number
  onSuccess?: () => void
}

// Available standard return condition tags
const AVAILABLE_CONDITIONS = [
  { code: 'resellable_condition', labelKm: 'ស្ថានភាពអាចលក់វិញបាន', labelEn: 'Resellable Condition' },
  { code: 'serial_imei_match', labelKm: 'ត្រូវលេខ Serial/IMEI', labelEn: 'Serial / IMEI Match' },
  { code: 'icloud_google_unlocked', labelKm: 'ដោះសោ iCloud/Google', labelEn: 'iCloud / Google Unlocked' },
  { code: 'unwashed', labelKm: 'មិនទាន់បោកគក់', labelEn: 'Unwashed / Unworn' },
  { code: 'no_scratches', labelKm: 'គ្មានស្នាមឆ្កូត', labelEn: 'No Scratches' },
  { code: 'all_in_box_accessories', labelKm: 'គ្រឿងបន្លាស់គ្រប់ក្នុងប្រអប់', labelEn: 'All Accessories Present' },
]

export const ReturnPolicyModal: React.FC<ReturnPolicyModalProps> = ({
  isOpen,
  onClose,
  editingPolicy,
  categories,
  companyId,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation(['returns', 'nav', 'sales', 'common'])
  const isKhmer = (i18n.language || 'km').startsWith('km')
  const toast = useToast()
  const queryClient = useQueryClient()
  const isEdit = Boolean(editingPolicy?.id)

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

  // Sync states on modal open / editingPolicy change
  useEffect(() => {
    if (isOpen) {
      setNameError(null)
      if (editingPolicy) {
        setName(editingPolicy.name || '')
        setCategoryId(editingPolicy.category_id || '')
        setReturnWindowDays(Number(editingPolicy.return_window_days) || 0)
        setIsReturnable(editingPolicy.is_returnable ?? true)
        setAllowExchange(editingPolicy.allow_exchange ?? true)
        setRestockingFeePct(Number(editingPolicy.restocking_fee_percentage) || 0)
        setCustomerShippingFee(Number(editingPolicy.customer_fault_shipping_fee) || 0)
        setStoreShippingFee(Number(editingPolicy.store_fault_shipping_fee) || 0)
        setRequiresPackaging(editingPolicy.requires_original_packaging ?? true)
        setRequiresReceipt(editingPolicy.requires_receipt ?? true)
        setIsDefault(Boolean(editingPolicy.is_default))
        setConditionsAccepted(
          Array.isArray(editingPolicy.conditions_accepted) ? editingPolicy.conditions_accepted : []
        )
      } else {
        setName('')
        setCategoryId('')
        setReturnWindowDays(7)
        setIsReturnable(true)
        setAllowExchange(true)
        setRestockingFeePct(0)
        setCustomerShippingFee(0)
        setStoreShippingFee(0)
        setRequiresPackaging(true)
        setRequiresReceipt(true)
        setIsDefault(false)
        setConditionsAccepted([])
      }
    }
  }, [isOpen, editingPolicy])

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit && editingPolicy
        ? orderReturnService.updatePolicy(editingPolicy.id, payload)
        : orderReturnService.createPolicy({ ...payload, company_id: companyId }),
    onSuccess: () => {
      toast.success(
        isEdit
          ? t('policies.policyUpdated', 'កែប្រែគោលការណ៍ជោគជ័យ!')
          : t('policies.policySaved', 'បានបង្កើតគោលការណ៍ថ្មីជោគជ័យ!')
      )
      queryClient.invalidateQueries({ queryKey: ['return-policies'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || t('common.errorOccurred', 'មានបញ្ហាក្នុងការរក្សាទុក'))
    },
  })

  // Quick preset chips for return window
  const PRESET_DAYS = [7, 14, 30, 45, 60]

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
      setNameError(t('policies.nameRequired', 'Please enter a policy name'))
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

  // Live summary text for footer
  const getInfoSummary = () => {
    const scope = categoryId
      ? categories.find((c) => c.id === categoryId)?.name || t('policies.tabs.category', 'Category')
      : t('policies.tabs.storewide', 'Store-Wide')
    const daysLabel = isReturnable ? `${returnWindowDays} ${t('policies.days', 'ថ្ងៃ')}` : t('policies.tabs.finalSale', 'Final Sale')
    const restock = Number(restockingFeePct) > 0 ? `Restock ${restockingFeePct}%` : t('policies.freeRestocking', 'ឥតគិតកម្រៃ')

    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Info size={13} className="text-primary shrink-0" />
        <span className="truncate max-w-[280px] sm:max-w-md">
          {scope} • {daysLabel} • {restock}
          {isDefault && ` • ${t('policies.default', 'Default')}`}
        </span>
      </div>
    )
  }

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? t('policies.editPolicy', 'កែប្រែគោលការណ៍បង្វិលសង')
          : t('policies.addPolicy', 'បង្កើតគោលការណ៍ថ្មី')
      }
      subtitle={t(
        'policies.subtitle',
        'កំណត់រយៈពេលអនុញ្ញាតបង្វិលសង ច្បាប់ទទួលខុសត្រូវ និងកម្រៃ Restocking តាមប្រភេទមុខទំនិញ'
      )}
      icon={<ShieldCheck className="w-5 h-5" />}
      iconVariant="blue"
      badge={
        isEdit && editingPolicy ? (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
            #{editingPolicy.id}
          </span>
        ) : undefined
      }
      size="2xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('policies.cancel', 'បោះបង់')}
          submitLabel={
            isEdit
              ? t('policies.saveChanges', t('policies.save', 'រក្សាទុកការកែប្រែ'))
              : t('policies.save', 'រក្សាទុកគោលការណ៍')
          }
          isSubmitting={saveMutation.isPending}
          isEdit={isEdit}
          onSubmit={handleSubmit}
          submitVariant="primary"
          infoSummary={getInfoSummary()}
        />
      }
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1: ព័ត៌មានទូទៅនៃគោលការណ៍ (GENERAL INFORMATION)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border/80 bg-muted/20 dark:bg-slate-900/40 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
            <FileText size={14} className="text-primary shrink-0" />
            <span>{t('policies.sectionGeneral', 'ព័ត៌មានទូទៅនៃគោលការណ៍')}</span>
          </div>

          <div className="space-y-3.5">
            {/* 1. Policy Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('policies.policyName', 'ឈ្មោះគោលការណ៍')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (nameError) setNameError(null)
                  }}
                  placeholder={t('policies.policyNamePlaceholder', 'ឧ. គោលការណ៍បង្វិលសងស្តង់ដារ 7 ថ្ងៃ')}
                  className={getFieldClass(
                    nameError,
                    'w-full h-10 px-3.5 text-xs sm:text-[13px] rounded-xl border bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 shadow-2xs font-medium'
                  )}
                />
              </div>
              <FieldError error={nameError} />
            </div>

            {/* 2. Category Assignment */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  {t('policies.category', 'ប្រភេទមុខទំនិញ')}
                </label>
                <span className="text-[11px] text-muted-foreground font-normal">
                  {categoryId === ''
                    ? t('policies.appliesStorewide', 'អនុវត្តទូទាំងហាង')
                    : t('policies.categoryOnly', 'អនុវត្តតាមប្រភេទមុខទំនិញ')}
                </span>
              </div>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 px-3.5 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer shadow-2xs"
                >
                  <option value="">{t('policies.allCategories', 'គ្រប់ប្រភេទមុខទំនិញ (អនុវត្តទូទាំងហាង)')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {getCategoryDisplayName(c.name, t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Store-wide Default Toggle Card */}
            <div
              onClick={() => setIsDefault(!isDefault)}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isDefault
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-card dark:bg-slate-800/60 border-border/70 hover:border-border text-foreground'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isDefault
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-muted text-muted-foreground border-border/60'
                  }`}
                >
                  <Star size={16} className={isDefault ? 'fill-amber-500 text-amber-500' : ''} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">
                    {t('policies.defaultStorewide', 'កំណត់ជាគោលការណ៍ទូទៅប្រចាំហាង')}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {t(
                      'policies.defaultStorewideDesc',
                      'ប្រើជាលំនាំដើមលើរាល់ទំនិញដែលមិនមានគោលការណ៍ដាច់ដោយឡែក'
                    )}
                  </p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <ToggleSwitch
                  checked={isDefault}
                  onChange={setIsDefault}
                  size="sm"
                  activeColor="amber"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2: កាលកំណត់ និងកម្រៃសេវា (WINDOW & LOGISTICS FEES)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border/80 bg-muted/20 dark:bg-slate-900/40 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
            <Clock size={14} className="text-primary shrink-0" />
            <span>{t('policies.sectionFees', 'កាលកំណត់ និងកម្រៃសេវា')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Return Window Days */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('policies.windowDays', 'រយៈពេលអនុញ្ញាត (ថ្ងៃ)')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={returnWindowDays}
                  onChange={(e) => setReturnWindowDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full h-10 pl-3.5 pr-14 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold shadow-2xs"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">
                  {t('policies.days', 'ថ្ងៃ')}
                </span>
              </div>
              {/* Quick Preset Chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground mr-1">
                  {t('policies.quickPresets', 'កំណត់រហ័ស:')}
                </span>
                {PRESET_DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setReturnWindowDays(d)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                      returnWindowDays === d
                        ? 'bg-primary text-white border-primary shadow-2xs'
                        : 'bg-card dark:bg-slate-800 text-muted-foreground border-border/70 hover:border-border hover:text-foreground'
                    }`}
                  >
                    {d} {t('policies.days', 'ថ្ងៃ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Restocking Fee (%) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  {t('policies.restockingFee', 'កម្រៃសេវា Restocking (%)')}
                </label>
                <span className="text-[11px] text-muted-foreground font-normal">
                  {restockingFeePct === 0
                    ? t('policies.freeRestocking', 'ឥតគិតកម្រៃ')
                    : `${restockingFeePct}%`}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={restockingFeePct}
                  onChange={(e) => setRestockingFeePct(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full h-10 pl-3.5 pr-10 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold shadow-2xs"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                  %
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {t('policies.restockingDesc', 'កម្រៃកាត់ទុកសម្រាប់ដំណើរការត្រួតពិនិត្យ និងស្តុកឡើងវិញ')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Customer Shipping Fee */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('policies.customerShipping', 'ថ្លៃដឹកជញ្ជូនកំហុសអតិថិជន ($)')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={customerShippingFee}
                  onChange={(e) => setCustomerShippingFee(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full h-10 pl-8 pr-3 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('policies.customerShippingDesc', 'អតិថិជនរ៉ាប់រងពេលផ្លាស់ប្តូរចិត្ត')}
              </p>
            </div>

            {/* Store Shipping Fee */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t('policies.storeShipping', 'ថ្លៃដឹកជញ្ជូនកំហុសហាង ($)')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={storeShippingFee}
                  onChange={(e) => setStoreShippingFee(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full h-10 pl-8 pr-3 text-xs sm:text-[13px] rounded-xl border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('policies.storeShippingDesc', 'ហាងរ៉ាប់រងពេលទំនិញខូច ឬច្រឡំ')}
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 3: លក្ខខណ្ឌ និងការអនុញ្ញាត (RULES & ELIGIBILITY)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-border/80 bg-muted/20 dark:bg-slate-900/40 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/90">
            <ShieldCheck size={14} className="text-primary shrink-0" />
            <span>{t('policies.sectionRules', 'លក្ខខណ្ឌ និងការអនុញ្ញាត')}</span>
          </div>

          {/* 4 Interactive Toggle Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Allow Return */}
            <div
              onClick={() => setIsReturnable(!isReturnable)}
              className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isReturnable
                  ? 'bg-primary/5 border-primary/25 shadow-2xs'
                  : 'bg-card dark:bg-slate-800/40 border-border/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                    isReturnable
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-muted-foreground border-border/60'
                  }`}
                >
                  <RotateCcw size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground leading-tight">
                    {t('policies.isReturnable', 'អនុញ្ញាតឱ្យបង្វិលសង')}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {t('policies.isReturnableDesc', 'អតិថិជនអាចស្នើសុំបង្វិលសងប្រាក់វិញ')}
                  </p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()} className="shrink-0 mt-0.5">
                <ToggleSwitch
                  checked={isReturnable}
                  onChange={setIsReturnable}
                  size="sm"
                  activeColor="primary"
                />
              </div>
            </div>

            {/* 2. Allow Exchange */}
            <div
              onClick={() => setAllowExchange(!allowExchange)}
              className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                allowExchange
                  ? 'bg-blue-500/5 border-blue-500/25 shadow-2xs'
                  : 'bg-card dark:bg-slate-800/40 border-border/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                    allowExchange
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      : 'bg-muted text-muted-foreground border-border/60'
                  }`}
                >
                  <ArrowLeftRight size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground leading-tight">
                    {t('policies.allowExchange', 'អនុញ្ញាតឱ្យប្តូរទំនិញ')}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {t('policies.allowExchangeDesc', 'អតិថិជនអាចប្តូរទំហំ ពណ៌ ឬម៉ូដ')}
                  </p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()} className="shrink-0 mt-0.5">
                <ToggleSwitch
                  checked={allowExchange}
                  onChange={setAllowExchange}
                  size="sm"
                  activeColor="blue"
                />
              </div>
            </div>

            {/* 3. Require Receipt */}
            <div
              onClick={() => setRequiresReceipt(!requiresReceipt)}
              className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                requiresReceipt
                  ? 'bg-amber-500/5 border-amber-500/25 shadow-2xs'
                  : 'bg-card dark:bg-slate-800/40 border-border/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                    requiresReceipt
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-muted text-muted-foreground border-border/60'
                  }`}
                >
                  <Receipt size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground leading-tight">
                    {t('policies.receiptRequired', 'ទាមទារវិក្កយបត្រដើម')}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {t('policies.receiptRequiredDesc', 'ភ្ជាប់មកជាមួយវិក្កយបត្រ ឬលេខ Order')}
                  </p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()} className="shrink-0 mt-0.5">
                <ToggleSwitch
                  checked={requiresReceipt}
                  onChange={setRequiresReceipt}
                  size="sm"
                  activeColor="amber"
                />
              </div>
            </div>

            {/* 4. Require Original Packaging */}
            <div
              onClick={() => setRequiresPackaging(!requiresPackaging)}
              className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                requiresPackaging
                  ? 'bg-emerald-500/5 border-emerald-500/25 shadow-2xs'
                  : 'bg-card dark:bg-slate-800/40 border-border/60 opacity-80'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                    requiresPackaging
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border/60'
                  }`}
                >
                  <Package size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-foreground leading-tight">
                    {t('policies.packagingRequired', 'ទាមទារប្រអប់ដើម')}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {t('policies.packagingRequiredDesc', 'ប្រអប់ ស្លាកសញ្ញា និងកាតុងដើម')}
                  </p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()} className="shrink-0 mt-0.5">
                <ToggleSwitch
                  checked={requiresPackaging}
                  onChange={setRequiresPackaging}
                  size="sm"
                  activeColor="emerald"
                />
              </div>
            </div>
          </div>

          {/* Additional Acceptance Conditions Chips */}
          <div className="pt-2 border-t border-border/60">
            <label className="block text-xs font-semibold text-foreground mb-2">
              {t('policies.additionalConditions', 'លក្ខខណ្ឌត្រួតពិនិត្យបន្ថែម (QC Requirements)')}
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CONDITIONS.map((cond) => {
                const isChecked = conditionsAccepted.includes(cond.code)
                return (
                  <button
                    key={cond.code}
                    type="button"
                    onClick={() => toggleCondition(cond.code)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-primary/10 text-primary border-primary/30 shadow-2xs font-semibold'
                        : 'bg-card dark:bg-slate-800 text-muted-foreground border-border/70 hover:border-border hover:text-foreground'
                    }`}
                  >
                    <Check
                      size={13}
                      className={`transition-opacity ${isChecked ? 'opacity-100' : 'opacity-30'}`}
                      strokeWidth={isChecked ? 2.5 : 2}
                    />
                    <span>{isKhmer ? cond.labelKm : cond.labelEn}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </form>
    </EnterpriseModal>
  )
}

export default ReturnPolicyModal
