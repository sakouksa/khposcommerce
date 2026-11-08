import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { marketingService } from '@/services/marketingService'
import { companyService } from '@/services/companyService'
import { financeService } from '@/services/financeService'
import { customerService } from '@/services/customerService'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/hooks/useToast'
import {
  FormLayout,
  FormContent,
  FormCard,
  FormHeader,
  FormFooter,
  FormField,
  Input,
  Textarea,
  ToggleSwitch,
  EnterpriseDateTimePicker,
} from '@/components/common'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { formatDateTimeLocal, type ChannelScope, type PromotionCampaign } from './types'

export const PromotionFormPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'nav'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const promoId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const toast = useToast()

  // Base Form States
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('percentage')
  const [channelScope, setChannelScope] = useState<ChannelScope>('all')
  const [branchIds, setBranchIds] = useState('all')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [priority, setPriority] = useState('10')
  const [isActive, setIsActive] = useState(true)

  // Scope & Item Targets
  const [applyScope, setApplyScope] = useState<'all' | 'category' | 'brand' | 'product'>('all')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])

  // Conditions
  const [minSpendUsd, setMinSpendUsd] = useState('')
  const [minSpendKhr, setMinSpendKhr] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['all'])
  const [customerGroups, setCustomerGroups] = useState<string[]>(['all'])
  const [buyQuantity, setBuyQuantity] = useState('2')
  const [getQuantity, setGetQuantity] = useState('1')
  const [buyProductId, setBuyProductId] = useState<string>('all')
  const [getProductId, setGetProductId] = useState<string>('same')

  // Rewards
  const [discountValue, setDiscountValue] = useState('15')
  const [maxDiscountCap, setMaxDiscountCap] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD')
  const [freeGiftName, setFreeGiftName] = useState('')
  const [freeGiftProductId, setFreeGiftProductId] = useState<string>('')

  // Budget & Stacking
  const [totalBudgetCap, setTotalBudgetCap] = useState('2500')
  const [maxRedemptions, setMaxRedemptions] = useState('500')
  const [perCustomerLimit, setPerCustomerLimit] = useState('1')
  const [isStackable, setIsStackable] = useState(true)

  // Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Branch data
  const accessibleBranches = useAuthStore((s) => s.user?.accessible_branches) || []
  const currentUserBranch = useAuthStore((s) => s.user?.branch)

  const { data: branchesData } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.getBranches({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const availableBranches = useMemo(() => {
    if (Array.isArray(branchesData?.data)) return branchesData.data
    if (Array.isArray(branchesData?.data?.data)) return branchesData.data.data
    if (accessibleBranches.length > 0) return accessibleBranches
    if (currentUserBranch) return [currentUserBranch]
    return []
  }, [branchesData, accessibleBranches, currentUserBranch])

  // Payment methods list from database
  const { data: paymentMethodsData } = useQuery({
    queryKey: ['payment-methods-active'],
    queryFn: () => financeService.getPaymentMethods({ per_page: 100, status: 'active' }),
    staleTime: 5 * 60 * 1000,
  })

  const paymentOptions = useMemo(() => {
    const allOption = { id: 'all', label: t('marketing.payAll', 'All Payment Methods') }
    const rawList = Array.isArray(paymentMethodsData?.data)
      ? paymentMethodsData.data
      : Array.isArray(paymentMethodsData?.data?.data)
      ? paymentMethodsData.data.data
      : Array.isArray(paymentMethodsData)
      ? paymentMethodsData
      : []

    if (rawList.length > 0) {
      const dynamicOptions = rawList
        .filter((m: any) => m.is_active !== false)
        .map((m: any) => ({
          id: m.code || String(m.id),
          label: m.name,
        }))
      return [allOption, ...dynamicOptions]
    }

    return [
      allOption,
      { id: 'bakong_khqr', label: t('marketing.payKhqr', 'Bakong KHQR') },
      { id: 'aba_khqr', label: t('marketing.payAba', 'ABA PAY') },
      { id: 'wing_bank', label: t('marketing.payWing', 'Wing Bank') },
      { id: 'acleda_mobile', label: t('marketing.payAcleda', 'ACLEDA Mobile') },
      { id: 'pos_cash', label: t('marketing.payCash', 'Cash Counter') },
    ]
  }, [paymentMethodsData, t])

  // Customer groups list from database
  const { data: customerGroupsData } = useQuery({
    queryKey: ['customer-groups-active'],
    queryFn: () => customerService.groups({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const customerGroupOptions = useMemo(() => {
    const allOption = { id: 'all', label: t('marketing.custAll', 'All Shoppers') }
    const rawList = Array.isArray(customerGroupsData?.data)
      ? customerGroupsData.data
      : Array.isArray(customerGroupsData?.data?.data)
      ? customerGroupsData.data.data
      : Array.isArray(customerGroupsData)
      ? customerGroupsData
      : []

    if (rawList.length > 0) {
      const dynamicOptions = rawList
        .filter((g: any) => g.is_active !== false)
        .map((g: any) => ({
          id: String(g.id),
          label:
            g.name +
            (g.discount_percent && parseFloat(g.discount_percent) > 0
              ? ` (${parseFloat(g.discount_percent)}%)`
              : ''),
        }))
      return [allOption, ...dynamicOptions]
    }

    return [
      allOption,
      { id: 'first_time', label: t('marketing.custFirstTime', 'First-time Buyer') },
      { id: 'vip_silver', label: t('marketing.custVipSilver', 'VIP Silver') },
      { id: 'vip_gold', label: t('marketing.custVipGold', 'VIP Gold') },
      { id: 'vip_platinum', label: t('marketing.custVipPlatinum', 'VIP Platinum') },
      { id: 'wholesale', label: t('marketing.custWholesale', 'B2B Wholesale') },
    ]
  }, [customerGroupsData, t])

  // Currencies from database
  const { data: currenciesData } = useQuery({
    queryKey: ['currencies-active'],
    queryFn: () => financeService.getCurrencies({ status: 'active', per_page: 50 }),
    staleTime: 10 * 60 * 1000,
  })

  const availableCurrencies = useMemo(() => {
    const raw = Array.isArray(currenciesData?.data)
      ? currenciesData.data
      : Array.isArray(currenciesData?.data?.data)
      ? currenciesData.data.data
      : Array.isArray(currenciesData)
      ? currenciesData
      : []
    if (raw.length > 0) return raw.filter((c: any) => c.is_active !== false)
    return [
      { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', exchange_rate: 1 },
      { id: 2, code: 'KHR', name: 'Cambodian Riel', symbol: '៛', exchange_rate: 4100 },
    ]
  }, [currenciesData])

  const khrExchangeRate = useMemo(() => {
    const khr = availableCurrencies.find((c: any) => c.code === 'KHR')
    return khr && parseFloat(khr.exchange_rate) > 0 ? parseFloat(khr.exchange_rate) : 4100
  }, [availableCurrencies])

  // Categories from database
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-list-all'],
    queryFn: () => categoryService.list({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const availableCategories = useMemo(() => {
    const raw = Array.isArray(categoriesData?.data)
      ? categoriesData.data
      : Array.isArray(categoriesData?.data?.data)
      ? categoriesData.data.data
      : Array.isArray(categoriesData)
      ? categoriesData
      : []
    return raw
  }, [categoriesData])

  // Brands from database
  const { data: brandsData } = useQuery({
    queryKey: ['brands-list-all'],
    queryFn: () => brandService.list({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const availableBrands = useMemo(() => {
    const raw = Array.isArray(brandsData?.data)
      ? brandsData.data
      : Array.isArray(brandsData?.data?.data)
      ? brandsData.data.data
      : Array.isArray(brandsData)
      ? brandsData
      : []
    return raw
  }, [brandsData])

  // Products from database (for Free Gift, BOGO, and Target Products)
  const { data: productsData } = useQuery({
    queryKey: ['products-list-all'],
    queryFn: () => productService.list({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  const availableProducts = useMemo(() => {
    const raw = Array.isArray(productsData?.data)
      ? productsData.data
      : Array.isArray(productsData?.data?.data)
      ? productsData.data.data
      : Array.isArray(productsData)
      ? productsData
      : []
    return raw
  }, [productsData])

  // Currency auto conversion handler
  const handleMinSpendUsdChange = (val: string) => {
    setMinSpendUsd(val)
    if (val && !isNaN(parseFloat(val))) {
      const converted = Math.round(parseFloat(val) * khrExchangeRate)
      setMinSpendKhr(converted.toString())
    } else if (!val) {
      setMinSpendKhr('')
    }
  }

  // Free gift product selection handler
  const handleFreeGiftProductChange = (prodId: string) => {
    setFreeGiftProductId(prodId)
    if (prodId) {
      const prod = availableProducts.find((p: any) => String(p.id) === prodId)
      if (prod) {
        setFreeGiftName(prod.name)
        if (formErrors.freeGiftName) {
          setFormErrors((prev) => ({ ...prev, freeGiftName: '' }))
        }
      }
    }
  }

  // Fetch promotion detail if in edit mode
  const { data: promoDetail, isLoading: isLoadingPromo } = useQuery({
    queryKey: ['promotion-detail', promoId],
    queryFn: () => (promoId ? marketingService.getPromotion(promoId) : null),
    enabled: isEdit && !isNaN(promoId as number),
  })

  // Populate data when editing
  useEffect(() => {
    if (promoDetail) {
      setName(promoDetail.name || '')
      setDescription(promoDetail.description || '')
      setType(promoDetail.type || promoDetail.rules?.[0]?.rule_type || 'percentage')
      setChannelScope((promoDetail.channel_scope || promoDetail.channels?.[0]?.channel || 'all') as ChannelScope)
      setBranchIds(
        typeof promoDetail.branch_ids === 'string'
          ? promoDetail.branch_ids
          : promoDetail.branches?.[0]?.id?.toString() || 'all'
      )
      setStartsAt(formatDateTimeLocal(promoDetail.start_at || promoDetail.starts_at))
      setEndsAt(formatDateTimeLocal(promoDetail.end_at || promoDetail.ends_at))
      setPriority(promoDetail.priority?.toString() || '10')
      setIsActive(promoDetail.is_active ?? true)

      const conditions = promoDetail.conditions || {}
      const rewards = promoDetail.rewards || {}

      setMinSpendUsd(conditions.min_spend_usd?.toString() || '')
      setMinSpendKhr(conditions.min_spend_khr?.toString() || '')
      setMinQuantity(conditions.min_quantity?.toString() || '')
      setPaymentMethods(conditions.payment_methods || ['all'])
      setCustomerGroups(conditions.customer_groups || ['all'])
      setBuyQuantity(conditions.buy_quantity?.toString() || '2')
      setGetQuantity(conditions.get_quantity?.toString() || '1')

      setDiscountValue(rewards.discount_value?.toString() || '15')
      setMaxDiscountCap(rewards.max_discount_cap?.toString() || '')
      setCurrency(rewards.currency || 'USD')
      setFreeGiftName(rewards.free_gift_name || '')

      if (rewards.free_gift_product_id) {
        setFreeGiftProductId(String(rewards.free_gift_product_id))
      }
      if (conditions.buy_product_id) {
        setBuyProductId(String(conditions.buy_product_id))
      }
      if (conditions.get_product_id) {
        setGetProductId(String(conditions.get_product_id))
      }

      // Populate Scope & Item Targets
      if (promoDetail.rules?.[0]) {
        const firstRule = promoDetail.rules[0]
        if (firstRule.rule_type === 'category_discount' || (firstRule.categories && firstRule.categories.length > 0)) {
          setApplyScope('category')
          setSelectedCategoryIds(firstRule.categories?.map((c: any) => c.id) || [])
        } else if (firstRule.rule_type === 'brand_discount' || (firstRule.brands && firstRule.brands.length > 0)) {
          setApplyScope('brand')
          setSelectedBrandIds(firstRule.brands?.map((b: any) => b.id) || [])
        } else if (firstRule.rule_type === 'product_discount' || (firstRule.products && firstRule.products.length > 0)) {
          setApplyScope('product')
          setSelectedProductIds(firstRule.products?.map((p: any) => p.id) || [])
        } else {
          setApplyScope('all')
        }
      } else if (conditions.apply_scope) {
        setApplyScope(conditions.apply_scope)
        setSelectedCategoryIds(conditions.category_ids || [])
        setSelectedBrandIds(conditions.brand_ids || [])
        setSelectedProductIds(conditions.product_ids || [])
      }

      setTotalBudgetCap(promoDetail.total_budget_cap?.toString() || '2500')
      setMaxRedemptions(promoDetail.max_redemptions?.toString() || '500')
      setPerCustomerLimit(promoDetail.per_customer_limit?.toString() || '1')
      setIsStackable(promoDetail.is_stackable ?? true)
    }
  }, [promoDetail])

  // Handle duplicate from navigation state
  useEffect(() => {
    if (!isEdit && location.state?.duplicateFrom) {
      const promo: PromotionCampaign = location.state.duplicateFrom
      setName(`${promo.name} (Copy)`)
      setDescription(promo.description || '')
      setType(promo.type || 'percentage')
      setChannelScope(promo.channel_scope || 'all')
      setBranchIds('all')
      setStartsAt('')
      setEndsAt('')
      setPriority((promo.priority || 10).toString())
      setIsActive(true)

      const conditions = promo.conditions || {}
      const rewards = promo.rewards || {}

      setMinSpendUsd(conditions.min_spend_usd?.toString() || '')
      setMinSpendKhr(conditions.min_spend_khr?.toString() || '')
      setPaymentMethods(conditions.payment_methods || ['all'])
      setCustomerGroups(conditions.customer_groups || ['all'])
      setDiscountValue(rewards.discount_value?.toString() || '15')
      setMaxDiscountCap(rewards.max_discount_cap?.toString() || '')
      if (conditions.apply_scope) {
        setApplyScope(conditions.apply_scope)
        setSelectedCategoryIds(conditions.category_ids || [])
        setSelectedBrandIds(conditions.brand_ids || [])
        setSelectedProductIds(conditions.product_ids || [])
      }
      if (rewards.free_gift_product_id) {
        setFreeGiftProductId(String(rewards.free_gift_product_id))
      }
    }
  }, [isEdit, location.state])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => marketingService.createPromotion(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] })
      toast.success(t('marketing.promoCreated', 'Promotion campaign created successfully.'))
      navigate('/marketing/promotions')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create promotion.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => marketingService.updatePromotion(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions'] })
      qc.invalidateQueries({ queryKey: ['promotion-detail', promoId] })
      toast.success(t('marketing.promoUpdated', 'Promotion campaign updated successfully.'))
      navigate('/marketing/promotions')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update promotion.'),
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const togglePaymentMethod = (method: string) => {
    if (method === 'all') {
      setPaymentMethods(['all'])
      return
    }
    const current = paymentMethods.filter((m) => m !== 'all')
    if (current.includes(method)) {
      const next = current.filter((m) => m !== method)
      setPaymentMethods(next.length === 0 ? ['all'] : next)
    } else {
      setPaymentMethods([...current, method])
    }
  }

  const toggleCustomerGroup = (group: string) => {
    if (group === 'all') {
      setCustomerGroups(['all'])
      return
    }
    const current = customerGroups.filter((g) => g !== 'all')
    if (current.includes(group)) {
      const next = current.filter((g) => g !== group)
      setCustomerGroups(next.length === 0 ? ['all'] : next)
    } else {
      setCustomerGroups([...current, group])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!name.trim()) {
      errors.name = t('marketing.validationNameRequired', 'Campaign headline name is required')
    }

    if ((type === 'percentage' || type === 'fixed_amount') && !discountValue.trim()) {
      errors.discountValue = t('marketing.validationDiscountValueRequired', 'Discount value is required')
    }

    if (type === 'bogo' && (!buyQuantity.trim() || !getQuantity.trim())) {
      errors.bogo = t('marketing.validationBogoRequired', 'Buy and Get quantities are required')
    }

    if (type === 'free_gift' && !freeGiftName.trim()) {
      errors.freeGiftName = t('marketing.validationFreeGiftRequired', 'Free gift item name is required')
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    setFormErrors({})

    const structuredConditions: any = {
      ...(minSpendUsd && { min_spend_usd: parseFloat(minSpendUsd) }),
      ...(minSpendKhr && { min_spend_khr: parseFloat(minSpendKhr) }),
      ...(minQuantity && { min_quantity: parseInt(minQuantity, 10) }),
      payment_methods: paymentMethods,
      customer_groups: customerGroups,
      branch_ids: branchIds === 'all' ? 'all' : [parseInt(branchIds, 10)],
      apply_scope: applyScope,
      category_ids: applyScope === 'category' ? selectedCategoryIds : [],
      brand_ids: applyScope === 'brand' ? selectedBrandIds : [],
      product_ids: applyScope === 'product' ? selectedProductIds : [],
      ...(type === 'bogo' && {
        buy_quantity: parseInt(buyQuantity, 10) || 2,
        get_quantity: parseInt(getQuantity, 10) || 1,
        buy_product_id: buyProductId,
        get_product_id: getProductId,
      }),
    }

    const structuredRewards: any = {
      discount_type: type,
      discount_value: parseFloat(discountValue) || 0,
      ...(maxDiscountCap && { max_discount_cap: parseFloat(maxDiscountCap) }),
      currency,
      ...(type === 'free_gift' && {
        free_gift_name: freeGiftName.trim(),
        free_gift_product_id: freeGiftProductId ? parseInt(freeGiftProductId, 10) : null,
      }),
    }

    const payload: any = {
      name: name.trim(),
      description: description.trim() || null,
      type,
      channel_scope: channelScope,
      channels: channelScope === 'all' ? ['all'] : [channelScope === 'pos_only' ? 'pos' : 'web'],
      branch_ids: branchIds === 'all' ? 'all' : [parseInt(branchIds, 10)],
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      start_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      end_at: endsAt ? new Date(endsAt).toISOString() : null,
      priority: parseInt(priority, 10) || 10,
      is_active: isActive,
      conditions: structuredConditions,
      rewards: structuredRewards,
      total_budget_cap: totalBudgetCap ? parseFloat(totalBudgetCap) : null,
      max_redemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : null,
      usage_limit: maxRedemptions ? parseInt(maxRedemptions, 10) : null,
      per_customer_limit: perCustomerLimit ? parseInt(perCustomerLimit, 10) : 1,
      is_stackable: isStackable,
      customer_group_ids: customerGroups.includes('all')
        ? []
        : customerGroups.map((g) => parseInt(g, 10)).filter((n) => !isNaN(n)),
      rules: [
        {
          name: name.trim(),
          rule_type:
            type === 'bogo'
              ? 'buy_x_get_y'
              : type === 'free_shipping'
              ? 'free_shipping'
              : applyScope === 'category'
              ? 'category_discount'
              : applyScope === 'brand'
              ? 'brand_discount'
              : applyScope === 'product'
              ? 'product_discount'
              : 'cart_discount',
          discount_type:
            type === 'free_gift'
              ? 'free_item'
              : type === 'free_shipping'
              ? 'free_shipping'
              : type === 'fixed_amount'
              ? 'fixed_amount'
              : 'percentage',
          discount_value: parseFloat(discountValue) || 0,
          min_qty: minQuantity ? parseInt(minQuantity, 10) : null,
          min_subtotal: minSpendUsd ? parseFloat(minSpendUsd) : null,
          max_discount_amount: maxDiscountCap ? parseFloat(maxDiscountCap) : null,
          priority: parseInt(priority, 10) || 10,
          is_stackable: isStackable,
          is_active: isActive,
          product_ids: applyScope === 'product' ? selectedProductIds : [],
          category_ids: applyScope === 'category' ? selectedCategoryIds : [],
          brand_ids: applyScope === 'brand' ? selectedBrandIds : [],
        },
      ],
    }

    if (isEdit && promoId) {
      updateMutation.mutate({ id: promoId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isLoading={isLoadingPromo}
      isSubmitting={isSubmitting}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? t('marketing.editPromotionTitle', 'Edit Promotion Campaign')
              : t('marketing.createPromotionTitle', 'Create Promotion Campaign')
          }
          subtitle={t(
            'marketing.promotionFormSubtitle',
            'Configure Omni-Channel promotions, discount rules, conditions, and budget limits.'
          )}
          breadcrumbs={[
            { label: t('marketing.breadcrumbMarketing', 'Marketing'), path: '/marketing/promotions' },
            { label: t('marketing.breadcrumbPromotions', 'Promotions'), path: '/marketing/promotions' },
            {
              label: isEdit
                ? t('marketing.breadcrumbEdit', 'Edit')
                : t('marketing.breadcrumbCreate', 'Create'),
            },
          ]}
          statusBadge={
            isEdit ? (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {isActive ? t('marketing.active', 'Active') : t('marketing.inactive', 'Inactive')}
              </span>
            ) : undefined
          }
          backPath="/marketing/promotions"
          backLabel={t('common.back', 'Back')}
        />
      }
      footer={
        <FormFooter
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/marketing/promotions')}
          cancelPath="/marketing/promotions"
          cancelLabel={t('marketing.btnCancel', 'Cancel')}
          submitLabel={
            isEdit
              ? t('marketing.btnSavePromo', 'Save Changes')
              : t('marketing.btnCreatePromo', 'Create Promotion')
          }
          sticky
        />
      }
    > 
      <FormContent maxWidth="5xl" layout="stack">
        {/* ─── CARD 1: GENERAL INFORMATION & CHANNELS ─── */}
        <FormCard
          title={t('marketing.sectionBasic', 'General Information & Channels')}
          subtitle={t(
            'marketing.sectionBasicDesc',
            'Campaign identity, active schedule, sales channel scope, and target branches'
          )}
          contentClassName="space-y-5"
        >
          {/* Campaign Headline */}
          <FormField
            label={t('marketing.campaignHeadline', 'Campaign Headline Name')}
            required
            error={formErrors.name}
          >
            <Input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (formErrors.name) {
                  setFormErrors((prev) => ({ ...prev, name: '' }))
                }
              }}
              placeholder={t(
                'marketing.campaignHeadlinePlaceholder',
                'e.g. Khmer New Year Special Discount 15%'
              )}
              error={formErrors.name}
            />
          </FormField>

          {/* Description & Terms */}
          <FormField
            label={t('marketing.campaignDescription', 'Campaign Description & Terms')}
          >
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(
                'marketing.campaignDescriptionPlaceholder',
                'Describe how customers qualify for this promotion...'
              )}
              rows={3}
            />
          </FormField>

          {/* Sales Channel Scope */}
          <FormField
            label={t('marketing.salesChannelScope', 'Sales Channel Scope')}
            required
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setChannelScope('all')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  channelScope === 'all'
                    ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="text-xs font-bold">
                  {t('marketing.channelBoth', 'Omni-Channel')}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 font-normal">
                  {t('marketing.channelBothDesc', 'Both POS Register & Storefront')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setChannelScope('pos_only')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  channelScope === 'pos_only'
                    ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="text-xs font-bold">
                  {t('marketing.channelPosOnly', 'POS Only')}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 font-normal">
                  {t('marketing.channelPosDesc', 'In-store Cashier Registers')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setChannelScope('storefront_only')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  channelScope === 'storefront_only'
                    ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="text-xs font-bold">
                  {t('marketing.channelStorefrontOnly', 'Storefront Only')}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 font-normal">
                  {t('marketing.channelStorefrontDesc', 'Online E-Commerce Website')}
                </div>
              </button>
            </div>
          </FormField>

          {/* Branch Target & Priority Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('marketing.targetBranches', 'Target Branches')}>
              <select
                value={branchIds}
                onChange={(e) => setBranchIds(e.target.value)}
                className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">
                  {t('marketing.allBranchesNationwide', 'All Branches Nationwide')}
                </option>
                {availableBranches.map((b: any) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name} {b.code ? `(${b.code})` : ''}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label={t(
                'marketing.priorityWeight',
                'Priority Weight (Higher applies first)'
              )}
            >
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="10"
              />
            </FormField>
          </div>

          {/* Schedule Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnterpriseDateTimePicker
              label={t('marketing.startsAt', 'Starts At')}
              value={startsAt}
              onChange={setStartsAt}
              outputFormat="YYYY-MM-DDTHH:mm"
            />
            <EnterpriseDateTimePicker
              label={t('marketing.endsAt', 'Ends At')}
              minDateTime={startsAt}
              value={endsAt}
              onChange={setEndsAt}
              outputFormat="YYYY-MM-DDTHH:mm"
            />
          </div>

          {/* Campaign Active Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-slate-800/40 rounded-xl border border-border/70 dark:border-slate-800">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">
                {t('marketing.campaignActiveStatus', 'Campaign Active Status')}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t(
                  'marketing.campaignActiveDesc',
                  'Enable or pause this promotion rule immediately'
                )}
              </p>
            </div>
            <ToggleSwitch
              checked={isActive}
              onChange={setIsActive}
              activeColor="primary"
            />
          </div>
        </FormCard>

        {/* ─── CARD 2: DISCOUNT ACTION & REWARDS ─── */}
        <FormCard
          title={t('marketing.sectionDiscountRule', 'Discount Action & Rewards')}
          subtitle={t(
            'marketing.sectionDiscountRuleDesc',
            'Configure promotion model, discount percentage, fixed amount, or BOGO rewards'
          )}
          contentClassName="space-y-5"
        >
          {/* Promotion Model Type */}
          <FormField
            label={t('marketing.promoModelType', 'Promotion Model Type')}
            required
          >
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
            >
              <option value="percentage">
                {t('marketing.optPercentage', 'Percentage Discount (% OFF)')}
              </option>
              <option value="fixed_amount">
                {t('marketing.optFixedAmount', 'Fixed Amount Discount ($ or KHR OFF)')}
              </option>
              <option value="bogo">
                {t('marketing.optBogo', 'Buy X Get Y Free (BOGO)')}
              </option>
              <option value="bundle">
                {t('marketing.optBundle', 'Bundle / Combo Package Special')}
              </option>
              <option value="tier_quantity">
                {t('marketing.optTierQuantity', 'Tiered Quantity Volume Breaks')}
              </option>
              <option value="free_gift">
                {t('marketing.optFreeGift', 'Free Gift with Purchase (GWP)')}
              </option>
              <option value="free_shipping">
                {t('marketing.optFreeShipping', 'Free Shipping Voucher')}
              </option>
            </select>
          </FormField>

          {/* Applicable Items Target Scope */}
          <FormField label={t('marketing.applyScope', 'Applicable Items Scope')} required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'all', label: t('marketing.scopeAll', 'All Store Products') },
                { id: 'category', label: t('marketing.scopeCategory', 'By Categories') },
                { id: 'brand', label: t('marketing.scopeBrand', 'By Brands') },
                { id: 'product', label: t('marketing.scopeProduct', 'By Specific Products') },
              ].map((scope) => (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => setApplyScope(scope.id as any)}
                  className={`p-2.5 rounded-lg border text-xs text-left font-medium transition-all cursor-pointer ${
                    applyScope === scope.id
                      ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/20'
                      : 'border-border bg-card text-foreground hover:bg-muted/50'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>
          </FormField>

          {/* Dynamic Category Selector */}
          {applyScope === 'category' && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-2">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('marketing.selectCategories', 'Select Categories')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableCategories.map((c: any) => {
                  const isSelected = selectedCategoryIds.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryIds((prev) =>
                          prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                        )
                      }}
                      className={`p-2 rounded-lg border text-xs text-left transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dynamic Brand Selector */}
          {applyScope === 'brand' && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-2">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('marketing.selectBrands', 'Select Brands')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableBrands.map((b: any) => {
                  const isSelected = selectedBrandIds.includes(b.id)
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBrandIds((prev) =>
                          prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                        )
                      }}
                      className={`p-2 rounded-lg border text-xs text-left transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {b.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dynamic Product Selector */}
          {applyScope === 'product' && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-2">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('marketing.selectProducts', 'Select Specific Products')}
              </label>
              <select
                multiple
                value={selectedProductIds.map(String)}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value, 10))
                  setSelectedProductIds(options)
                }}
                className="w-full h-32 px-3 py-2 text-xs rounded-lg border border-border/80 bg-background text-foreground transition-all outline-none focus:border-primary"
              >
                {availableProducts.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.sku ? `[${p.sku}] ` : ''}{p.name} (${p.selling_price || 0})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Hold Ctrl (Cmd) to select multiple products
              </p>
            </div>
          )}

          {/* Percentage Discount Inputs */}
          {type === 'percentage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/70">
              <FormField
                label={t('marketing.discountPercentage', 'Discount Percentage (%)')}
                required
                error={formErrors.discountValue}
              >
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value)
                    if (formErrors.discountValue) {
                      setFormErrors((prev) => ({ ...prev, discountValue: '' }))
                    }
                  }}
                  placeholder="15"
                  suffix="%"
                  error={formErrors.discountValue}
                />
              </FormField>

              <FormField
                label={t('marketing.maxDiscountCap', 'Max Discount Cap ($ USD)')}
              >
                <Input
                  type="number"
                  value={maxDiscountCap}
                  onChange={(e) => setMaxDiscountCap(e.target.value)}
                  placeholder="15.00"
                  prefix="$"
                />
              </FormField>
            </div>
          )}

          {/* Fixed Amount Discount Inputs */}
          {type === 'fixed_amount' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/70">
              <FormField
                label={t('marketing.discountAmount', 'Discount Amount')}
                required
                error={formErrors.discountValue}
              >
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value)
                    if (formErrors.discountValue) {
                      setFormErrors((prev) => ({ ...prev, discountValue: '' }))
                    }
                  }}
                  placeholder="5.00"
                  error={formErrors.discountValue}
                />
              </FormField>

              <FormField label={t('marketing.currency', 'Currency')}>
                <select
                  value={currency}
                  onChange={(e: any) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {availableCurrencies.map((c: any) => (
                    <option key={c.id} value={c.code}>
                      {c.name} ({c.symbol || c.code})
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          )}

          {/* BOGO Inputs */}
          {type === 'bogo' && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t('marketing.buyQuantity', 'Buy Quantity (X)')}
                  required
                  error={formErrors.bogo}
                >
                  <Input
                    type="number"
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(e.target.value)}
                    placeholder="2"
                  />
                </FormField>

                <FormField
                  label={t('marketing.getQuantity', 'Get Free Quantity (Y)')}
                  required
                >
                  <Input
                    type="number"
                    value={getQuantity}
                    onChange={(e) => setGetQuantity(e.target.value)}
                    placeholder="1"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={t('marketing.buyProductTarget', 'Target Product to Buy')}>
                  <select
                    value={buyProductId}
                    onChange={(e) => setBuyProductId(e.target.value)}
                    className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">{t('marketing.anyProduct', 'Any Qualifying Product')}</option>
                    {availableProducts.map((p: any) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.sku ? `[${p.sku}] ` : ''}{p.name} (${p.selling_price || 0})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label={t('marketing.getProductTarget', 'Reward / Free Product')}>
                  <select
                    value={getProductId}
                    onChange={(e) => setGetProductId(e.target.value)}
                    className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="same">{t('marketing.sameProduct', 'Same Product Purchased')}</option>
                    {availableProducts.map((p: any) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.sku ? `[${p.sku}] ` : ''}{p.name} (${p.selling_price || 0})
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>
          )}

          {/* Free Gift Inputs */}
          {type === 'free_gift' && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-3">
              <FormField
                label={t('marketing.freeGiftProduct', 'Select Free Gift Product from Inventory')}
                required
              >
                <select
                  value={freeGiftProductId}
                  onChange={(e) => handleFreeGiftProductChange(e.target.value)}
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-lg border border-border/80 bg-background text-foreground transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                >
                  <option value="">{t('marketing.chooseGiftFromInventory', '-- Select gift item from inventory --')}</option>
                  {availableProducts.map((p: any) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.sku ? `[${p.sku}] ` : ''}{p.name} (Stock: {p.stock_quantity ?? p.inventory_quantity ?? 'Available'} | ${p.selling_price || 0})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label={t('marketing.freeGiftName', 'Free Gift Display Name')}
                required
                error={formErrors.freeGiftName}
              >
                <Input
                  type="text"
                  value={freeGiftName}
                  onChange={(e) => {
                    setFreeGiftName(e.target.value)
                    if (formErrors.freeGiftName) {
                      setFormErrors((prev) => ({ ...prev, freeGiftName: '' }))
                    }
                  }}
                  placeholder="Premium Tumbler / Canvas Bag"
                  error={formErrors.freeGiftName}
                />
              </FormField>
            </div>
          )}
        </FormCard>

        {/* ─── CARD 3: CONDITIONS & ELIGIBILITY ─── */}
        <FormCard
          title={t('marketing.sectionConditions', 'Conditions & Eligibility')}
          subtitle={t(
            'marketing.sectionConditionsDesc',
            'Cart spend thresholds, accepted payment methods, and customer segment eligibility'
          )}
          contentClassName="space-y-5"
        >
          {/* Spend Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                label={t('marketing.minSpendUsd', 'Minimum Cart Subtotal (USD $)')}
              >
                <Input
                  type="number"
                  value={minSpendUsd}
                  onChange={(e) => handleMinSpendUsdChange(e.target.value)}
                  placeholder="30.00"
                  prefix="$"
                />
              </FormField>
              {minSpendUsd && !isNaN(parseFloat(minSpendUsd)) && (
                <p className="text-[11px] text-primary font-medium mt-1">
                  {t('marketing.rateNotice', { rate: khrExchangeRate.toLocaleString() })}
                </p>
              )}
            </div>

            <FormField
              label={t('marketing.minSpendKhr', 'Minimum Cart Subtotal (KHR ៛)')}
            >
              <Input
                type="number"
                value={minSpendKhr}
                onChange={(e) => setMinSpendKhr(e.target.value)}
                placeholder="120000"
                suffix="៛"
              />
            </FormField>
          </div>

          {/* Min Item Quantity */}
          <FormField
            label={t(
              'marketing.minQuantity',
              'Minimum Item Quantity in Cart'
            )}
          >
            <Input
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              placeholder="1"
            />
          </FormField>

          {/* Cambodia Payment Methods */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground/90">
                {t(
                  'marketing.cambodiaPaymentTriggers',
                  'Cambodia Payment Method Triggers'
                )}
              </label>
              <span className="text-[11px] text-muted-foreground">
                {t('marketing.selectMultipleOrAll', 'Select multiple or All')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {paymentOptions.map((method) => {
                const isSelected =
                  paymentMethods.includes(method.id) ||
                  (method.id === 'aba_khqr' && paymentMethods.includes('aba_pay')) ||
                  (method.id === 'bakong_khqr' && paymentMethods.includes('khqr_bakong')) ||
                  (method.id === 'pos_cash' && paymentMethods.includes('cash'))
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/20'
                        : 'border-border bg-card text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {method.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Customer Segmentation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground/90">
                {t(
                  'marketing.customerSegmentation',
                  'Customer Segmentation & Member Tiers'
                )}
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {customerGroupOptions.map((group) => {
                const isSelected = customerGroups.includes(group.id)
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleCustomerGroup(group.id)}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/20'
                        : 'border-border bg-card text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {group.label}
                  </button>
                )
              })}
            </div>
          </div>
        </FormCard>

        {/* ─── CARD 4: BUDGET & STACKING SAFETY LIMITS ─── */}
        <FormCard
          title={t('marketing.sectionBudget', 'Budget & Stacking Limits')}
          subtitle={t(
            'marketing.sectionBudgetDesc',
            'Safety budget limits, total redemption ceilings, and voucher stacking rules'
          )}
          contentClassName="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FormField
                label={t('marketing.totalBudgetCap', 'Total Budget Cap ($ USD)')}
              >
                <Input
                  type="number"
                  value={totalBudgetCap}
                  onChange={(e) => setTotalBudgetCap(e.target.value)}
                  placeholder="2500"
                  prefix="$"
                />
              </FormField>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t('marketing.autoPausesWhenReached', 'Auto-pauses when reached')}
              </p>
            </div>

            <div>
              <FormField
                label={t('marketing.maxTotalRedemptions', 'Max Total Redemptions')}
              >
                <Input
                  type="number"
                  value={maxRedemptions}
                  onChange={(e) => setMaxRedemptions(e.target.value)}
                  placeholder="500"
                />
              </FormField>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t('marketing.totalPromoUsages', 'Total promo usages')}
              </p>
            </div>

            <div>
              <FormField
                label={t('marketing.perCustomerLimit', 'Per-Customer Limit')}
              >
                <Input
                  type="number"
                  value={perCustomerLimit}
                  onChange={(e) => setPerCustomerLimit(e.target.value)}
                  placeholder="1"
                />
              </FormField>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t('marketing.maxTimesPerUser', 'Max times per user/phone')}
              </p>
            </div>
          </div>

          {/* Stacking Rule */}
          <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-slate-800/40 rounded-xl border border-border/70 dark:border-slate-800">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">
                {t(
                  'marketing.stackableWithVouchers',
                  'Stackable with Vouchers & Coupons'
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t(
                  'marketing.stackableDesc',
                  'Allow customers to combine this promotion with checkout coupon codes'
                )}
              </p>
            </div>
            <ToggleSwitch
              checked={isStackable}
              onChange={setIsStackable}
              activeColor="primary"
            />
          </div>
        </FormCard>
      </FormContent>
    </FormLayout>
  )
}

export default PromotionFormPage
