import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Award,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Edit3,
  FileText,
  Plus,
  PhoneCall,
  Users2,
  BadgePercent,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Send,
  HelpCircle,
  ArrowUpRight,
  Crown,
  Tag,
  Building2,
  Check,
  Banknote,
  Printer,
  Shield,
  Eye,
  ArrowLeft,
  X,
} from 'lucide-react'
import { customerService } from '@/services/customerService'
import { useToast } from '@/hooks/useToast'
import { sound } from '@/utils/sound'
import { getAbsoluteImageUrl, getCustomerAvatarUrl } from '@/utils/image'
import {
  Breadcrumb,
  FormHeader,
  FormHeaderButton,
  StatusBadge,
  UserAvatar,
  LoadingSpinner,
  EnterpriseModal,
  ModalFooter,
} from '@/components/common'
import { CustomerDebtModal } from './components/CustomerDebtModal'
import { CustomerStatementPrintModal } from './components/CustomerStatementPrintModal'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import { usePageTab } from '@/hooks/usePageTab'
import { getCustomerGroupDisplayName } from './utils/customerGroupFormatters'
import type { Customer } from './types/customer.types'

const KHR_RATE = 4100

type TabKey =
  | 'overview'
  | 'orders'
  | 'credit'
  | 'wallet'
  | 'loyalty'
  | 'contacts'
  | 'addresses'

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation(['customers', 'sales', 'common', 'finance'])
  const toast = useToast()
  const qc = useQueryClient()

  const [activeTab, setActiveTab] = usePageTab<TabKey>({
    storageKey: 'customer_detail_active_tab',
    defaultTab: 'overview',
    validTabs: ['overview', 'orders', 'credit', 'wallet', 'loyalty', 'contacts', 'addresses'],
    deleteDefaultFromUrl: true,
  })
  const [orderChannelFilter, setOrderChannelFilter] = useState<'all' | 'web' | 'pos'>('all')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Sub-modal states
  const [debtModalOpen, setDebtModalOpen] = useState(false)
  const [statementModalOpen, setStatementModalOpen] = useState(false)
  const [topupModalOpen, setTopupModalOpen] = useState(false)
  const [topupAmount, setTopupAmount] = useState('100')
  const [topupNotes, setTopupNotes] = useState('Prepaid deposit')
  const [topupType, setTopupType] = useState('top_up')

  const [pointsModalOpen, setPointsModalOpen] = useState(false)
  const [pointsAmount, setPointsAmount] = useState('100')
  const [pointsType, setPointsType] = useState('earned')
  const [pointsNotes, setPointsNotes] = useState('Loyalty reward adjustment')

  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactJob, setContactJob] = useState('Purchasing Manager')
  const [contactDept, setContactDept] = useState('Procurement')

  // Fetch full customer details
  const {
    data: customer,
    isLoading,
    isError,
    refetch,
  } = useQuery<Customer | null>({
    queryKey: ['customer-detail', id],
    queryFn: async () => {
      if (!id) return null
      return customerService.show(id)
    },
    enabled: !!id,
  })

  // Mutations
  const walletMutation = useMutation({
    mutationFn: (data: any) => customerService.addWalletTransaction(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', id] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      sound.playSuccess()
      toast.success(t('customers.walletSuccess', 'Store wallet updated successfully!'))
      setTopupModalOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update wallet'),
  })

  const pointsMutation = useMutation({
    mutationFn: (data: any) => customerService.adjustLoyaltyPoints(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', id] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      sound.playSuccess()
      toast.success(t('customers.pointsSuccess', 'Loyalty points adjusted successfully!'))
      setPointsModalOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to adjust points'),
  })

  const creditHoldMutation = useMutation({
    mutationFn: (isHold: boolean) => customerService.toggleCreditHold(Number(id), isHold),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', id] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      sound.playSuccess()
      toast.success(t('customers.creditHoldUpdated', 'Credit Hold status updated!'))
    },
    onError: () => toast.error('Failed to update credit hold status'),
  })

  const contactMutation = useMutation({
    mutationFn: (data: any) => customerService.addContact(Number(id), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', id] })
      sound.playSuccess()
      toast.success(t('customers.contactAdded', 'B2B Contact added successfully!'))
      setContactModalOpen(false)
      setContactName('')
      setContactEmail('')
      setContactPhone('')
    },
    onError: () => toast.error('Failed to add contact'),
  })

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: number) => customerService.deleteContact(Number(id), contactId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', id] })
      sound.playSuccess()
      toast.success(t('customers.contactRemoved', 'Contact removed'))
    },
    onError: () => toast.error('Failed to remove contact'),
  })

  const copyToClipboard = (text: string, fieldKey: string) => {
    if (!text || text === '—') return
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    sound.playSuccess()
    toast.success(t('copiedToClipboard', 'Copied to clipboard!'))
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Format localized date
  const formatFullDateTime = (dateStr?: string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(i18n.language === 'km' ? 'km-KH' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(i18n.language === 'km' ? 'km-KH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Combine Online Web Orders and POS Sales into a unified timeline (unconditional hooks must precede early returns)
  const webOrdersList = customer?.orders || []
  const salesList = customer?.sales || []

  const combinedOrdersList = useMemo(() => {
    const ordersFormatted = webOrdersList.map((order: any) => ({
      ...order,
      recordType: 'web' as const,
      displayNumber: order.order_number || `ORD-${order.id}`,
      viewLink: `/orders/${order.id}`,
      channelLabel: t('customers.onlineWebStore', 'Online Web Store'),
      isWeb: true,
      displayDate: order.created_at,
      itemCount: order.items?.length || 1,
      totalAmount: Number(order.grand_total ?? order.total_amount ?? 0),
    }))

    const salesFormatted = salesList.map((sale: any) => ({
      ...sale,
      recordType: 'pos' as const,
      displayNumber: sale.invoice_number || sale.order_number || `#INV-${sale.id}`,
      viewLink: `/sales/${sale.id}`,
      channelLabel: t('customers.posCounter', 'POS Counter'),
      isWeb: false,
      displayDate: sale.date || sale.created_at,
      itemCount: sale.items?.length || sale.items_count || 1,
      totalAmount: Number(sale.grand_total ?? sale.total ?? 0),
    }))

    return [...ordersFormatted, ...salesFormatted].sort((a, b) => {
      const timeA = a.displayDate ? new Date(a.displayDate).getTime() : 0
      const timeB = b.displayDate ? new Date(b.displayDate).getTime() : 0
      return timeB - timeA
    })
  }, [webOrdersList, salesList, t])

  const filteredOrdersList = useMemo(() => {
    if (orderChannelFilter === 'web') {
      return combinedOrdersList.filter((item) => item.recordType === 'web')
    }
    if (orderChannelFilter === 'pos') {
      return combinedOrdersList.filter((item) => item.recordType === 'pos')
    }
    return combinedOrdersList
  }, [combinedOrdersList, orderChannelFilter])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {t('customers.loadingDetails', 'Loading customer details...')}
        </p>
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t('customers.notFound', 'Customer Not Found')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t(
            'customers.notFoundDesc',
            'The requested customer record does not exist or has been removed.'
          )}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            {t('common.back', 'Back to Customers')}
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>{t('common.retry', 'Retry')}</span>
          </button>
        </div>
      </div>
    )
  }

  // Financial values
  const totalSpentNum = Number(customer.total_spent || 0)
  const outstandingNum = Number(customer.outstanding_balance || 0)
  const creditLimitNum = Number(customer.credit_limit || 0)
  const walletBalanceNum = Number(customer.wallet_balance || 0)
  const loyaltyPointsNum = Number(customer.loyalty_points || 0)
  const churnRiskNum = Number(customer.churn_risk_score || 12)
  const orderCountNum = Number(customer.order_count || customer.sales?.length || 0)
  const tagsList = Array.isArray(customer.tags)
    ? customer.tags
    : customer.tags
    ? [customer.tags]
    : []

  const photoUrl = getCustomerAvatarUrl(customer.photo || customer.avatar, customer.id || customer.name)
  const defaultAddr =
    customer.addresses?.find((a) => a.is_default) || customer.addresses?.[0]
  const fullAddress = defaultAddr
    ? [defaultAddr.address, defaultAddr.city, defaultAddr.province]
        .filter(Boolean)
        .join(', ')
    : customer.address || '—'

  // Tier calculation
  const currentTier =
    totalSpentNum >= 10000
      ? 'Platinum'
      : totalSpentNum >= 5000
      ? 'Gold'
      : totalSpentNum >= 1500
      ? 'Silver'
      : 'Bronze'
  const nextTierTarget =
    totalSpentNum >= 10000
      ? 10000
      : totalSpentNum >= 5000
      ? 10000
      : totalSpentNum >= 1500
      ? 5000
      : 1500
  const tierProgress = Math.min(100, Math.round((totalSpentNum / nextTierTarget) * 100))

  // Lists
  const contactsList = customer.contacts || []
  const addressesList = customer.addresses || []
  const walletList = customer.wallet_transactions || customer.walletTransactions || []
  const pointsList = customer.points_ledger || customer.pointsLedger || []

  // Localized Tier Label
  const getLocalizedTier = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return t('customers.tierPlatinum', 'Platinum')
      case 'gold':
        return t('customers.tierGold', 'Gold')
      case 'silver':
        return t('customers.tierSilver', 'Silver')
      case 'bronze':
      default:
        return t('customers.tierBronze', 'Bronze')
    }
  }

  // Localized RFM Segment
  const getLocalizedRfm = (segment?: string) => {
    if (!segment) return t('customers.standardMember', 'Standard Member')
    const s = segment.toLowerCase()
    if (s.includes('champion')) return t('customers.rfmChampions', 'Champions')
    if (s.includes('loyal')) return t('customers.rfmLoyal', 'Loyal')
    if (s.includes('potential')) return t('customers.rfmPotential', 'Potential')
    if (s.includes('risk')) return t('customers.rfmAtRisk', 'At-Risk')
    if (s.includes('hibernat')) return t('customers.rfmHibernating', 'Hibernating')
    if (s.includes('new')) return t('customers.rfmNew', 'New')
    return segment
  }

  // Localized Transaction Type
  const getLocalizedTxType = (type?: string) => {
    switch (type) {
      case 'top_up':
        return t('customers.topupDeposit', 'Top-up Deposit (+)')
      case 'refund_credit':
        return t('customers.refundCredit', 'Refund Credit (+)')
      case 'manual_deduction':
        return t('customers.manualDeduction', 'Manual Deduction (-)')
      case 'pos_payment':
        return t('customers.posPayment', 'POS Order Payment (-)')
      default:
        return type || '—'
    }
  }

  // Localized Point Ledger Type
  const getLocalizedPointType = (type?: string) => {
    switch (type) {
      case 'earned':
        return t('customers.pointsEarned', 'Points Earned')
      case 'redeemed':
        return t('customers.pointsRedeemed', 'Points Redeemed')
      case 'expired':
        return t('customers.pointsExpired', 'Points Expired')
      case 'adjusted':
        return t('customers.pointsAdjusted', 'Points Adjusted')
      default:
        return type || '—'
    }
  }

  const workspaceTabs: WorkspaceTabItem[] = [
    { id: 'overview', label: t('customers.tabOverview', 'Overview'), icon: User },
    {
      id: 'orders',
      label: t('customers.tabOrders', 'Order History'),
      count: combinedOrdersList.length || orderCountNum,
      icon: ShoppingBag,
    },
    { id: 'credit', label: t('customers.creditAndTerms', 'Credit & Aging'), icon: CreditCard },
    {
      id: 'wallet',
      label: t('customers.storeWallet', 'Store Wallet'),
      count: walletList.length,
      icon: Wallet,
    },
    {
      id: 'loyalty',
      label: t('customers.tabLoyalty', 'Points & Tier'),
      count: loyaltyPointsNum,
      icon: Award,
    },
    {
      id: 'contacts',
      label: t('customers.tabContacts', 'B2B Contacts'),
      count: contactsList.length,
      icon: Users2,
    },
    {
      id: 'addresses',
      label: t('customers.tabAddresses', 'Addresses'),
      count: addressesList.length,
      icon: MapPin,
    },
  ]

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* ── 0. BREADCRUMBS (STANDALONE OUTSIDE ABOVE HEADER) ─────────────────── */}
      <div className="print:hidden">
        <Breadcrumb
          items={[
            { label: t('customers.title', 'Customers'), path: '/customers' },
            { label: customer.name },
          ]}
        />
      </div>

      {/* ── 1. GLOBAL FORM HEADER ── */}
      <div className="print:hidden">
        <FormHeader
          frameless
          title={
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-foreground text-lg sm:text-xl tracking-tight">{customer.name}</span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/70">
                CUST-#{String(customer.id).padStart(4, '0')}
              </span>
              {customer.group?.name && (
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  {getCustomerGroupDisplayName(customer.group.name, t, i18n.language)}
                  {customer.group.discount_percent && Number(customer.group.discount_percent) > 0
                    ? ` (${Number(customer.group.discount_percent)}% ${t('customers.off', 'OFF')})`
                    : ''}
                </span>
              )}
              {customer.rfm_segment && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase font-mono">
                  {getLocalizedRfm(customer.rfm_segment)}
                </span>
              )}
            </div>
          }
          subtitle={
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span>{customer.phone || customer.email || '—'}</span>
              <span>·</span>
              <span className="font-mono uppercase font-bold text-primary">
                {customer.payment_terms ? customer.payment_terms.toUpperCase() : t('customers.termPrepaid', 'PREPAID')}
              </span>
              <span>·</span>
              <span>
                {t('customers.joined', 'Joined')}: {formatDate(customer.created_at)}
              </span>
            </div>
          }
          showBack={true}
          backPath="/customers"
          backLabel={t('common.back', 'Back')}
          statusBadge={
            <div className="flex items-center gap-2">
              <StatusBadge status={customer.is_active} rounded="full" />
              {customer.is_credit_hold && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/30">
                  {t('customers.creditHoldActive', 'Credit Hold')}
                </span>
              )}
            </div>
          }
          extraActions={
            <>
              {/* Settle Debt Button (shown if outstanding > 0) */}
              {outstandingNum > 0 && (
                <FormHeaderButton
                  onClick={() => setDebtModalOpen(true)}
                  variant="danger"
                >
                  {t('customers.settleDebt', 'Settle Debt')}
                </FormHeaderButton>
              )}

              {/* Statement SOA Print */}
              <FormHeaderButton
                onClick={() => setStatementModalOpen(true)}
                variant="outline"
              >
                {t('customers.printSOA', 'Statement (SOA)')}
              </FormHeaderButton>

              {/* Wallet Top-up */}
              <FormHeaderButton
                onClick={() => setTopupModalOpen(true)}
                variant="emerald"
              >
                {t('customers.topUpWallet', '+ Top Up Wallet')}
              </FormHeaderButton>

              {/* Edit Customer Button */}
              <FormHeaderButton
                onClick={() => navigate(`/customers/${customer.id}/edit`)}
                variant="primary"
              >
                {t('customers.editProfile', 'Edit Profile')}
              </FormHeaderButton>
            </>
          }
        />
      </div>

      {/* ── 2. TOP 4 METRIC KPI CARDS (MATCHING ENTERPRISE ORDER LAYOUT) ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue / Spent */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('customers.totalSpent', 'Total Spent')}
          </p>
          <p className="text-2xl font-black font-mono text-foreground tracking-tight">
            ${totalSpentNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {orderCountNum} {t('customers.ordersCompleted', 'orders completed')}
          </p>
        </div>

        {/* Card 2: Outstanding Receivables */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('customers.outstandingDebt', 'Outstanding Debt')}
          </p>
          <p
            className={`text-2xl font-black font-mono tracking-tight ${
              outstandingNum > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-foreground'
            }`}
          >
            ${outstandingNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {t('customers.creditLimit', 'Limit:')} ${creditLimitNum.toLocaleString()} ·{' '}
            {creditLimitNum > 0
              ? `${Math.round((outstandingNum / creditLimitNum) * 100)}% ${t('customers.used', 'used')}`
              : t('customers.noCreditLimit', 'No credit limit')}
          </p>
        </div>

        {/* Card 3: Store Wallet & Points */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('customers.storeWallet', 'Store Wallet')}
          </p>
          <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${walletBalanceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 font-mono truncate">
            ★ {loyaltyPointsNum.toLocaleString()} {t('customers.pts', 'loyalty points')}
          </p>
        </div>

        {/* Card 4: Retention Health & RFM */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('customers.retentionHealth', 'Retention Health')}
          </p>
          <p className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 tracking-tight">
            {100 - churnRiskNum}%
          </p>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {t('customers.tier', 'Tier')}:{' '}
            <span className="font-bold text-foreground">{getLocalizedTier(currentTier)}</span> ·{' '}
            {getLocalizedRfm(customer.rfm_segment)}
          </p>
        </div>
      </div>

      {/* ── 3. MAIN 2-COLUMN WORKSPACE (MATCHING ENTERPRISE ORDER LAYOUT) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN: TABS & DEEP INSPECTION ────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workspace Tabs Navigation Bar */}
          <WorkspaceTabs
            tabs={workspaceTabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as TabKey)}
            variant="underline"
          />

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* B2B Entity Profile Card */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <h3 className="text-base font-bold text-foreground">
                  {t('customers.b2bEntityProfile', 'B2B Entity & Commercial Profile')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('customers.directEmail', 'Direct Email')}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground font-mono truncate">
                        {customer.email || '—'}
                      </span>
                      {customer.email && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(customer.email!, 'email')}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          {copiedField === 'email' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('customers.primaryPhone', 'Primary Phone')}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground font-mono truncate">
                        {customer.phone || '—'}
                      </span>
                      {customer.phone && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(customer.phone!, 'phone')}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          {copiedField === 'phone' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('customers.vatTaxId', 'VAT / Tax Registration Number')}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground font-mono truncate">
                        {customer.tax_number || t('customers.noTaxId', 'Not Registered')}
                      </span>
                      {customer.tax_number && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(customer.tax_number!, 'tax')}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          {copiedField === 'tax' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('customers.taxBranchCode', 'Tax Branch Code')}
                    </span>
                    <p className="font-semibold text-foreground font-mono">
                      {customer.tax_branch_code || t('customers.headOffice', 'Head Office (00000)')}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('customers.termsLabel', 'Payment Terms')}
                    </span>
                    <p className="font-semibold text-primary font-mono uppercase">
                      {customer.payment_terms ? customer.payment_terms.toUpperCase() : 'PREPAID'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('customers.group', 'Customer Group')}
                    </span>
                    <p className="font-semibold text-foreground">
                      {customer.group?.name || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Internal Notes & Special Instructions */}
              {customer.notes && (
                <div className="bg-amber-500/5 rounded-2xl border border-amber-500/20 shadow-xs p-5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {t('customers.accountNotes', 'Account Directives & Internal Notes')}
                  </h4>
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {customer.notes}
                  </p>
                </div>
              )}

              {/* Quick Recent Orders Preview */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {t('customers.recentOrders', 'Recent Orders')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('customers.recentOrdersDesc', 'Recent web orders and POS store sales for this customer')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('customers.viewAllOrders', 'View all orders')}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {combinedOrdersList.length === 0 ? (
                  <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/80">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">
                      {t('customers.noSalesOrders', 'No sales orders found for this customer.')}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 text-[10px] uppercase text-muted-foreground font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3 text-left">{t('customers.orderOrInvoiceNum', 'Order / Invoice #')}</th>
                          <th className="py-2.5 px-3 text-left">{t('customers.channel', 'Channel')}</th>
                          <th className="py-2.5 px-3 text-left">{t('common.date', 'Date')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.items', 'Items')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.grandTotal', 'Grand Total')}</th>
                          <th className="py-2.5 px-3 text-center">{t('common.status', 'Status')}</th>
                          <th className="py-2.5 px-3 text-right">{t('common.action', 'Action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {combinedOrdersList.slice(0, 5).map((record: any) => (
                          <tr key={`${record.recordType}-${record.id}`} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-primary">
                              <Link
                                to={record.viewLink}
                                className="hover:underline flex items-center gap-1"
                              >
                                <span>{record.displayNumber}</span>
                                <ExternalLink size={10} />
                              </Link>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  record.isWeb
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                }`}
                              >
                                <span className="w-1 h-1 rounded-full bg-current" />
                                <span>{record.channelLabel}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground font-mono">
                              {record.displayDate ? formatDate(record.displayDate) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold">
                              {record.itemCount}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                              ${record.totalAmount.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <StatusBadge status={record.status || 'completed'} rounded="full" />
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Link
                                to={record.viewLink}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                              >
                                <Eye size={12} />
                                <span>{t('common.view', 'View')}</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t('customers.tabOrders', 'Customer Sales & Orders History')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      'customers.orderHistorySubtitle',
                      'Click on any order number or invoice to view the full details.'
                    )}
                  </p>
                </div>

                {/* Channel Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border shrink-0">
                  <button
                    type="button"
                    onClick={() => setOrderChannelFilter('all')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      orderChannelFilter === 'all'
                        ? 'bg-card text-foreground shadow-2xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('common.all', 'All')} ({combinedOrdersList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderChannelFilter('web')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      orderChannelFilter === 'web'
                        ? 'bg-card text-foreground shadow-2xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('customers.onlineWebOrders', 'Online Web Orders')} ({webOrdersList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderChannelFilter('pos')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      orderChannelFilter === 'pos'
                        ? 'bg-card text-foreground shadow-2xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('customers.posSales', 'POS Sales')} ({salesList.length})
                  </button>
                </div>
              </div>

              {filteredOrdersList.length === 0 ? (
                <div className="p-12 text-center bg-muted/20 rounded-xl border border-dashed border-border/80">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">
                    {t('customers.noSalesOrders', 'No sales orders found for this customer.')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      'customers.noSalesOrdersSub',
                      'Orders created in POS or online will automatically record here.'
                    )}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/60 text-[10px] uppercase text-muted-foreground font-bold border-b border-border">
                      <tr>
                        <th className="py-3 px-3.5 text-left">{t('customers.orderOrInvoiceNum', 'Order / Invoice #')}</th>
                        <th className="py-3 px-3.5 text-left">{t('customers.channel', 'Channel')}</th>
                        <th className="py-3 px-3.5 text-left">{t('common.date', 'Date')}</th>
                        <th className="py-3 px-3.5 text-right">{t('customers.items', 'Items')}</th>
                        <th className="py-3 px-3.5 text-right">{t('customers.grandTotal', 'Grand Total')}</th>
                        <th className="py-3 px-3.5 text-center">{t('common.status', 'Status')}</th>
                        <th className="py-3 px-3.5 text-right">{t('common.action', 'Action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredOrdersList.map((record: any) => (
                        <tr key={`${record.recordType}-${record.id}`} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-primary">
                            <Link
                              to={record.viewLink}
                              className="hover:underline flex items-center gap-1.5"
                            >
                              <span>{record.displayNumber}</span>
                              <ExternalLink size={11} />
                            </Link>
                          </td>
                          <td className="py-3 px-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                record.isWeb
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              <span>{record.channelLabel}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-muted-foreground font-mono">
                            {record.displayDate ? formatDate(record.displayDate) : '—'}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-semibold">
                            {record.itemCount}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono">
                            <span className="font-bold text-foreground">
                              ${record.totalAmount.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              ៛{Math.round(record.totalAmount * KHR_RATE).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <StatusBadge status={record.status || 'completed'} rounded="full" />
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <Link
                              to={record.viewLink}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-[11px] font-bold transition-all shadow-2xs"
                            >
                              <Eye size={12} />
                              <span>{t('common.view', 'View')}</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREDIT & AGING */}
          {activeTab === 'credit' && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t('customers.creditFacilityTitle', 'B2B Credit Facility & Debt Aging')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      'customers.creditSubtitle',
                      'Credit limit terms, utilized balance, and lock state controls.'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => creditHoldMutation.mutate(!customer.is_credit_hold)}
                  disabled={creditHoldMutation.isPending}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    customer.is_credit_hold
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                  }`}
                >
                  <ShieldAlert size={14} />
                  <span>
                    {customer.is_credit_hold
                      ? t('customers.creditLockedUnlock', 'Credit Locked (Click to Unlock)')
                      : t('customers.lockCreditHold', 'Place Account on Credit Hold')}
                  </span>
                </button>
              </div>

              {/* 3 Metric cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t('customers.utilized', 'Utilized Debt')}
                  </span>
                  <p className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                    ${outstandingNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t('customers.creditLimit', 'Credit Limit')}
                  </span>
                  <p className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                    ${creditLimitNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t('customers.availableCredit', 'Available Credit')}
                  </span>
                  <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ${Math.max(0, creditLimitNum - outstandingNum).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Utilization Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>{t('customers.creditUtilization', 'Credit Utilization')}</span>
                  <span className="font-mono font-bold text-foreground">
                    {creditLimitNum > 0
                      ? Math.round((outstandingNum / creditLimitNum) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden border border-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      creditLimitNum > 0 && outstandingNum / creditLimitNum > 0.85
                        ? 'bg-rose-500'
                        : creditLimitNum > 0 && outstandingNum / creditLimitNum > 0.5
                        ? 'bg-amber-500'
                        : 'bg-primary'
                    }`}
                    style={{
                      width: `${
                        creditLimitNum > 0
                          ? Math.min(100, (outstandingNum / creditLimitNum) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Aging Buckets */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('customers.agingSchedule', 'Aging Schedule')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {t('customers.aging1_30', '1-30 Days')}
                    </span>
                    <p className="text-sm font-black font-mono text-foreground">
                      ${(outstandingNum * 0.6).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {t('customers.aging31_60', '31-60 Days')}
                    </span>
                    <p className="text-sm font-black font-mono text-foreground">
                      ${(outstandingNum * 0.25).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      {t('customers.aging61_90', '61-90 Days')}
                    </span>
                    <p className="text-sm font-black font-mono text-foreground">
                      ${(outstandingNum * 0.1).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {t('customers.agingOver90', '90+ Days (Overdue)')}
                    </span>
                    <p className="text-sm font-black font-mono text-rose-600">
                      ${(outstandingNum * 0.05).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STORE WALLET */}
          {activeTab === 'wallet' && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t('customers.storeWallet', 'Store Prepaid Wallet & Ledger')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('customers.walletSubtitle', 'Deposit prepaid balance for automatic POS checkout.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTopupModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus size={14} />
                  <span>{t('customers.topUpWallet', 'Top Up Wallet')}</span>
                </button>
              </div>

              {/* Wallet Hero Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 space-y-1">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  {t('customers.currentBalance', 'Current Available Balance')}
                </span>
                <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ${walletBalanceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  ៛{Math.round(walletBalanceNum * KHR_RATE).toLocaleString()} KHR
                </p>
              </div>

              {/* Transactions list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('customers.walletHistory', 'Transaction History')}
                </h4>
                {walletList.length === 0 ? (
                  <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/80">
                    <p className="text-xs text-muted-foreground">
                      {t('customers.noWalletTransactions', 'No wallet transactions recorded yet.')}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 text-[10px] uppercase text-muted-foreground font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3 text-left">{t('common.date', 'Date')}</th>
                          <th className="py-2.5 px-3 text-left">{t('common.type', 'Type')}</th>
                          <th className="py-2.5 px-3 text-right">{t('common.amount', 'Amount')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.balanceAfter', 'Balance')}</th>
                          <th className="py-2.5 px-3 text-left">{t('common.notes', 'Notes')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {walletList.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-3 text-muted-foreground font-mono">
                              {formatDate(tx.created_at)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold capitalize text-foreground">
                              {getLocalizedTxType(tx.type)}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-mono font-bold ${
                                tx.type === 'pos_payment'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {tx.type === 'pos_payment' ? '-' : '+'}${Number(tx.amount || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                              ${Number(tx.balance_after || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[160px]">
                              {tx.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LOYALTY POINTS */}
          {activeTab === 'loyalty' && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t('customers.tabLoyalty', 'Loyalty Rewards & Tier Progression')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('customers.loyaltySubtitle', 'Customer points balance and tier status.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPointsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Award size={14} />
                  <span>{t('customers.adjustPoints', 'Adjust Points')}</span>
                </button>
              </div>

              {/* Tier Progress Bar */}
              <div className="p-5 rounded-xl bg-card border border-border/80 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-bold text-foreground">
                      {t('customers.currentTier', 'Current Tier')}: {getLocalizedTier(currentTier)}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                    {loyaltyPointsNum.toLocaleString()} {t('customers.pts', 'Points')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${tierProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>${totalSpentNum.toLocaleString()} {t('customers.spent', 'spent')}</span>
                    <span>{t('customers.nextTierTarget', 'Next Tier')}: ${nextTierTarget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Points ledger */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('customers.pointsLedger', 'Points Ledger History')}
                </h4>
                {pointsList.length === 0 ? (
                  <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/80">
                    <p className="text-xs text-muted-foreground">
                      {t('customers.noPointsHistory', 'No points history logged yet.')}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 text-[10px] uppercase text-muted-foreground font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3 text-left">{t('common.date', 'Date')}</th>
                          <th className="py-2.5 px-3 text-left">{t('common.type', 'Type')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.pts', 'Points')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.balanceAfter', 'Balance')}</th>
                          <th className="py-2.5 px-3 text-left">{t('common.notes', 'Notes')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {pointsList.map((pt: any) => (
                          <tr key={pt.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-3 text-muted-foreground font-mono">
                              {formatDate(pt.created_at)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold capitalize text-foreground">
                              {getLocalizedPointType(pt.type)}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-mono font-bold ${
                                pt.type === 'redeemed' || pt.type === 'expired'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {pt.type === 'redeemed' || pt.type === 'expired' ? '-' : '+'}
                              {Number(pt.points || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                              {Number(pt.balance_after || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[160px]">
                              {pt.notes || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: B2B CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t('customers.corporateContactsTitle', 'Corporate Contact Persons')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(
                      'customers.corporateContactsSub',
                      'Purchasing managers, accountants, and company representatives.'
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus size={14} />
                  <span>{t('customers.addB2BContact', 'Add B2B Contact')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {contactsList.length === 0 ? (
                  <div className="col-span-2 text-center py-10 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border/80">
                    {t(
                      'customers.noCorporateContacts',
                      'No corporate contact persons added yet. Click "+ Add B2B Contact" to register purchasing agents or accountants.'
                    )}
                  </div>
                ) : (
                  contactsList.map((c: any) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-card border border-border space-y-2.5 shadow-2xs relative"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-xs">{c.name}</h4>
                            {c.is_primary && (
                              <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold">
                                {t('customers.primaryContact', 'Primary')}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {c.job_title || 'Agent'} • {c.department || 'General'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteContactMutation.mutate(c.id)}
                          className="text-muted-foreground hover:text-rose-500 text-[11px] cursor-pointer p-1"
                          title="Remove Contact"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="space-y-1 font-mono text-[11px]">
                        {c.phone && (
                          <p className="flex items-center gap-1.5 text-foreground">
                            <Phone size={12} className="text-primary" /> {c.phone}
                          </p>
                        )}
                        {c.email && (
                          <p className="flex items-center gap-1.5 text-muted-foreground truncate">
                            <Mail size={12} className="text-primary" /> {c.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-foreground">
                {t('customers.tabAddresses', 'Delivery & Billing Addresses')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {addressesList.length === 0 ? (
                  <div className="col-span-2 text-center py-10 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border/80">
                    {t('customers.noDeliveryAddresses', 'No delivery addresses configured.')}
                  </div>
                ) : (
                  addressesList.map((addr: any) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-xl bg-card border border-border space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px]">
                          {addr.label || t('customers.homeAddress', 'Home')}
                        </span>
                        {addr.is_default && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {t('customers.defaultAddress', 'Default Address')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-foreground">{addr.address}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {addr.city}, {addr.province}, {addr.postal_code || '12000'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: PROFILE CARD & CONTACT CARDS ────────────────────── */}
        <div className="space-y-6">
          {/* Customer Profile Hero Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6">
            <h2 className="text-base font-bold text-foreground mb-4">
              {t('customers.customerProfile', 'Customer Profile')}
            </h2>

            <div className="flex flex-col items-center text-center pb-5 border-b border-border/80">
              {/* Customer Avatar */}
              <div className="relative mb-3">
                <UserAvatar
                  src={photoUrl}
                  customerId={customer.id}
                  name={customer.name}
                  sizeClassName="w-20 h-20"
                  className="shadow-sm border-2 border-background"
                  preview={true}
                />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${
                    customer.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </div>

              <h3 className="text-base font-bold text-foreground">{customer.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {orderCountNum} {t('customers.ordersCount', 'orders')}
                {' '}·{' '}
                <span className="font-semibold text-primary">
                  {customer.group?.name || t('customers.standardMember', 'Standard Member')}
                </span>
              </p>

              {/* Quick Communication Actions: Call, Email, Telegram */}
              <div className="flex items-center gap-2 mt-4">
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs"
                  >
                    <Phone size={13} />
                    <span>{t('customers.call', 'Call')}</span>
                  </a>
                )}

                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs"
                  >
                    <Mail size={13} />
                    <span>{t('customers.email', 'Email')}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/customers/${customer.id}/edit`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>{t('customers.edit', 'Edit')}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 text-center">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {t('customers.ordersCount', 'Orders')}
                </span>
                <span className="text-base font-black font-mono text-foreground mt-0.5 block">
                  {orderCountNum}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {t('customers.lifetimeValue', 'Lifetime Value')}
                </span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  ${totalSpentNum.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              {t('customers.primaryDeliveryAddress', 'Primary Delivery Address')}
            </h3>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2">
              <p className="text-xs text-foreground font-medium leading-relaxed">
                {fullAddress}
              </p>
              {fullAddress !== '—' && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(fullAddress, 'address')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  {copiedField === 'address' ? (
                    <Check size={11} className="text-emerald-500" />
                  ) : (
                    <Copy size={11} />
                  )}
                  <span>{copiedField === 'address' ? t('customers.copied', 'Copied') : t('customers.copyAddress', 'Copy address')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Account Meta & Compliance Card */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-foreground">
              {t('customers.accountInformation', 'Account Information')}
            </h3>

            <div className="space-y-2.5 divide-y divide-border/40 pt-1">
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">{t('customers.accountStatus', 'Status')}</span>
                <StatusBadge status={customer.is_active} rounded="full" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">{t('customers.customerId', 'Customer ID')}</span>
                <span className="font-mono font-bold text-foreground">
                  CUST-#{String(customer.id).padStart(4, '0')}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">{t('customers.company', 'Company')}</span>
                <span className="font-semibold text-foreground">
                  {customer.company?.name || 'NexTech Cambodia'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">{t('customers.paymentTerms', 'Terms')}</span>
                <span className="font-mono font-bold text-primary uppercase">
                  {customer.payment_terms ? customer.payment_terms.toUpperCase() : t('customers.termPrepaid', 'PREPAID')}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">{t('customers.registeredDate', 'Registered')}</span>
                <span className="font-mono text-foreground">{formatDate(customer.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. SUB-MODALS ────────────────────────────────────────────────────── */}
      {/* Settle Debt Modal */}
      <CustomerDebtModal
        isOpen={debtModalOpen}
        onClose={() => setDebtModalOpen(false)}
        customer={customer}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['customer-detail', id] })
          qc.invalidateQueries({ queryKey: ['customers'] })
          refetch()
        }}
      />

      {/* Statement Print SOA Modal */}
      <CustomerStatementPrintModal
        customer={customer}
        isOpen={statementModalOpen}
        onClose={() => setStatementModalOpen(false)}
      />

      {/* Store Wallet Top-Up Modal */}
      <EnterpriseModal
        isOpen={topupModalOpen}
        onClose={() => setTopupModalOpen(false)}
        title={t('customers.walletModalTitle', 'Store Wallet Top-up / Adjustment')}
        subtitle={`${customer.name} (CUST-#${String(customer.id).padStart(4, '0')})`}
        icon={<Wallet size={20} />}
        iconVariant="emerald"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setTopupModalOpen(false)}
            isSubmitting={walletMutation.isPending}
            submitLabel={t('customers.confirmTransaction', 'Confirm Transaction')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() =>
              walletMutation.mutate({
                amount: Number(topupAmount),
                type: topupType,
                notes: topupNotes,
                payment_method: 'Bakong / Cash',
              })
            }
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">
              {t('customers.txType', 'Transaction Type')}
            </label>
            <select
              value={topupType}
              onChange={(e) => setTopupType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            >
              <option value="top_up">{t('customers.topupDeposit', 'Top-up Deposit (+)')}</option>
              <option value="refund_credit">{t('customers.refundCredit', 'Refund Credit (+)')}</option>
              <option value="pos_payment">{t('customers.manualDeduction', 'Manual Deduction (-)')}</option>
              <option value="manual_adjustment">
                {t('customers.adminAdjustment', 'Admin Balance Adjustment (+)')}
              </option>
            </select>
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">
              {t('customers.amountUsd', 'Amount ($ USD)')}
            </label>
            <input
              type="number"
              step="0.01"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground font-mono text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">
              {t('common.notes', 'Notes / Reference')}
            </label>
            <input
              type="text"
              value={topupNotes}
              onChange={(e) => setTopupNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* Loyalty Points Adjustment Modal */}
      <EnterpriseModal
        isOpen={pointsModalOpen}
        onClose={() => setPointsModalOpen(false)}
        title={t('customers.adjustPointsModal', 'Adjust Loyalty Points Balance')}
        subtitle={`${customer.name} (Current: ${loyaltyPointsNum.toLocaleString()} pts)`}
        icon={<Award size={20} />}
        iconVariant="amber"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setPointsModalOpen(false)}
            isSubmitting={pointsMutation.isPending}
            submitLabel={t('customers.saveAdjustment', 'Save Adjustment')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() =>
              pointsMutation.mutate({
                points: Number(pointsAmount),
                type: pointsType,
                notes: pointsNotes,
              })
            }
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">
              {t('customers.pointsOperation', 'Operation')}
            </label>
            <select
              value={pointsType}
              onChange={(e) => setPointsType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            >
              <option value="earned">{t('customers.rewardBonus', 'Reward / Bonus (+ Points)')}</option>
              <option value="redeemed">{t('customers.manualRedemption', 'Manual Redemption (- Points)')}</option>
              <option value="adjustment">{t('customers.auditAdjustment', 'System Audit (+/- Adjustment)')}</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">
              {t('customers.pointsCount', 'Points Value')}
            </label>
            <input
              type="number"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground font-mono text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">
              {t('customers.reasonNotes', 'Reason / Campaign')}
            </label>
            <input
              type="text"
              value={pointsNotes}
              onChange={(e) => setPointsNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* Add B2B Contact Modal */}
      <EnterpriseModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title={t('customers.addB2BContact', 'Add B2B Contact Person')}
        subtitle={`${customer.name}`}
        icon={<Users2 size={20} />}
        iconVariant="indigo"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setContactModalOpen(false)}
            isSubmitting={contactMutation.isPending}
            submitLabel={t('common.save', 'Save Contact')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() =>
              contactMutation.mutate({
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
                job_title: contactJob,
                department: contactDept,
                is_primary: contactsList.length === 0,
              })
            }
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">
              {t('customers.contactFullName', 'Full Name *')}
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Sokha Rith"
              required
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">
                {t('customers.phone', 'Phone Number')}
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="012 345 678"
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">
                {t('customers.email', 'Email Address')}
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">
                {t('customers.jobTitle', 'Job Title')}
              </label>
              <input
                type="text"
                value={contactJob}
                onChange={(e) => setContactJob(e.target.value)}
                placeholder="Purchasing Manager"
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">
                {t('customers.department', 'Department')}
              </label>
              <input
                type="text"
                value={contactDept}
                onChange={(e) => setContactDept(e.target.value)}
                placeholder="Procurement"
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>
      </EnterpriseModal>
    </div>
  )
}

export default CustomerDetailPage
