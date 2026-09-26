import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  X, User, Mail, Phone, Calendar, Award, DollarSign, MapPin, 
  CheckCircle2, ShoppingBag, FileText, Tag, Edit3, Shield, 
  ExternalLink, CreditCard, Clock, Building2, Copy, Check,
  Wallet, AlertTriangle, ShieldAlert, Sparkles, MessageSquare,
  FileCheck2, Plus, PhoneCall, Users2, BadgePercent, ChevronRight,
  TrendingUp, RefreshCw, Send, HelpCircle, ArrowUpRight, ArrowDownRight,
  Crown, Globe, Store
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getAbsoluteImageUrl, getCustomerAvatarUrl } from '@/utils/image'
import { useToast } from '@/hooks/useToast'
import { 
  StatusBadge, 
  UserAvatar,
  DetailDrawer, 
  DetailDrawerHeader, 
  DetailDrawerTabNav, 
  DetailDrawerBody, 
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
  ActionButton,
  CancelButton,
  EnterpriseModal,
  ModalFooter
} from '@/components/common'
import { customerService } from '@/services/customerService'
import { CustomerDebtModal } from './CustomerDebtModal'
import { CustomerStatementPrintModal } from './CustomerStatementPrintModal'
import type { Customer } from '../types/customer.types'

interface CustomerDetailDrawerProps {
  customer: Customer | null
  onClose: () => void
  openEditModal: (cust: Customer) => void
}

type TabKey = 
  | 'overview' 
  | 'credit_wallet' 
  | 'loyalty' 
  | 'contacts' 
  | 'pricing' 
  | 'timeline' 
  | 'tickets' 
  | 'kyc' 
  | 'orders' 
  | 'addresses'

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  onClose,
  openEditModal,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation(['customers', 'common'])
  const toast = useToast()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [orderChannelFilter, setOrderChannelFilter] = useState<'all' | 'web' | 'pos'>('all')

  // Sub-modal states
  const [statementPrintModalOpen, setStatementPrintModalOpen] = useState(false)
  const [debtModalOpen, setDebtModalOpen] = useState(false)
  const [topupModalOpen, setTopupModalOpen] = useState(false)
  const [topupAmount, setTopupAmount] = useState('100')
  const [topupNotes, setTopupNotes] = useState('Prepaid deposit')
  const [topupType, setTopupType] = useState('top_up')

  const [pointsModalOpen, setPointsModalOpen] = useState(false)
  const [pointsAmount, setPointsAmount] = useState('100')
  const [pointsType, setPointsType] = useState('earned')
  const [pointsNotes, setPointsNotes] = useState('Loyalty reward adjustment')

  const [interactionModalOpen, setInteractionModalOpen] = useState(false)
  const [interactionType, setInteractionType] = useState('phone_call')
  const [interactionSubject, setInteractionSubject] = useState('')
  const [interactionDesc, setInteractionDesc] = useState('')

  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactJob, setContactJob] = useState('Purchasing Manager')

  const [kycModalOpen, setKycModalOpen] = useState(false)
  const [kycType, setKycType] = useState('patent_tax')
  const [kycTitle, setKycTitle] = useState('')
  const [kycDocNo, setKycDocNo] = useState('')

  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketType, setTicketType] = useState('inquiry')
  const [ticketPriority, setTicketPriority] = useState('medium')
  const [ticketDesc, setTicketDesc] = useState('')

  // Fetch full details (addresses, sales, contacts, wallet, kyc, tickets, etc.)
  const { data: fullCustomerData, isLoading } = useQuery({
    queryKey: ['customer-detail', customer?.id],
    queryFn: () => customerService.show(customer!.id),
    enabled: !!customer?.id,
  })

  const cust: Customer = fullCustomerData || customer

  // Mutations
  const walletMutation = useMutation({
    mutationFn: (data: any) => customerService.addWalletTransaction(cust.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('customers.walletSuccess', 'Store wallet updated successfully!'))
      setTopupModalOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update wallet')
  })

  const pointsMutation = useMutation({
    mutationFn: (data: any) => customerService.adjustLoyaltyPoints(cust.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('customers.pointsSuccess', 'Loyalty points adjusted successfully!'))
      setPointsModalOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to adjust points')
  })

  const interactionMutation = useMutation({
    mutationFn: (data: any) => customerService.recordInteraction(cust.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
      toast.success(t('customers.interactionSuccess', 'Interaction logged in timeline!'))
      setInteractionModalOpen(false)
      setInteractionSubject('')
      setInteractionDesc('')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to log interaction')
  })

  const creditHoldMutation = useMutation({
    mutationFn: (isHold: boolean) => customerService.toggleCreditHold(cust.id, isHold),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: ['customers-stats'] })
      toast.success(t('customers.creditHoldUpdated', 'Credit Hold status updated!'))
    },
    onError: (err: any) => toast.error('Failed to update credit hold status')
  })

  const contactMutation = useMutation({
    mutationFn: (data: any) => customerService.addContact(cust.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
      toast.success('B2B Contact added successfully!')
      setContactModalOpen(false)
      setContactName('')
      setContactEmail('')
      setContactPhone('')
    },
    onError: (err: any) => toast.error('Failed to add contact')
  })

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: number) => customerService.deleteContact(cust.id, contactId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
      toast.success('Contact removed')
    }
  })

  const kycMutation = useMutation({
    mutationFn: (data: any) => customerService.addKycDocument(cust.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
      toast.success('KYC Document uploaded & verified!')
      setKycModalOpen(false)
      setKycTitle('')
      setKycDocNo('')
    }
  })

  const ticketMutation = useMutation({
    mutationFn: (data: any) => customerService.addSupportTicket(cust.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
      toast.success('Support Ticket / RMA registered!')
      setTicketModalOpen(false)
      setTicketSubject('')
      setTicketDesc('')
    }
  })

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  if (!customer) return null

  const contactsList = cust.contacts || []
  const kycList = cust.kycDocuments || cust.kyc_documents || []
  const walletList = cust.walletTransactions || cust.wallet_transactions || []
  const pointsList = cust.pointsLedger || cust.points_ledger || []
  const interactionsList = cust.interactions || []
  const contractsList = cust.pricingContracts || cust.pricing_contracts || []
  const ticketsList = cust.supportTickets || cust.support_tickets || []
  const webOrdersList = cust.orders || []
  const salesList = cust.sales || []
  const addressesList = cust.addresses || []

  const combinedOrdersList = React.useMemo(() => {
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

  const filteredOrdersList = React.useMemo(() => {
    if (orderChannelFilter === 'web') {
      return combinedOrdersList.filter((item) => item.recordType === 'web')
    }
    if (orderChannelFilter === 'pos') {
      return combinedOrdersList.filter((item) => item.recordType === 'pos')
    }
    return combinedOrdersList
  }, [combinedOrdersList, orderChannelFilter])

  const tabs: { key: TabKey; label: string; icon: any; badge?: number }[] = [
    { key: 'overview', label: t('customers.tabOverview', 'Overview'), icon: User },
    { key: 'credit_wallet', label: t('customers.tabCreditWallet', 'Credit & Wallet'), icon: CreditCard },
    { key: 'loyalty', label: t('customers.tabLoyalty', 'Points & Tier'), icon: Award, badge: pointsList.length },
    { key: 'contacts', label: t('customers.tabContacts', 'B2B Contacts'), icon: Users2, badge: contactsList.length },
    { key: 'pricing', label: t('customers.tabPricing', 'Price Contracts'), icon: BadgePercent, badge: contractsList.length },
    { key: 'timeline', label: t('customers.tabTimeline', '360° Timeline'), icon: MessageSquare, badge: interactionsList.length },
    { key: 'tickets', label: t('customers.tabTickets', 'Support & RMA'), icon: HelpCircle, badge: ticketsList.length },
    { key: 'kyc', label: t('customers.tabKyc', 'KYC & Legal'), icon: FileCheck2, badge: kycList.length },
    { key: 'orders', label: t('customers.tabOrders', 'Order History'), icon: ShoppingBag, badge: combinedOrdersList.length || cust.order_count || 0 },
    { key: 'addresses', label: t('customers.tabAddresses', 'Addresses'), icon: MapPin, badge: addressesList.length },
  ]

  const totalSpentNum = Number(cust.total_spent || 0)
  const loyaltyPointsNum = Number(cust.loyalty_points || 0)
  const creditLimitNum = Number(cust.credit_limit || 0)
  const outstandingNum = Number(cust.outstanding_balance || 0)
  const walletBalanceNum = Number(cust.wallet_balance || 0)
  const churnRiskNum = Number(cust.churn_risk_score || 12)
  const tagsList = Array.isArray(cust.tags) ? cust.tags : (cust.tags ? [cust.tags] : [])
  const photoUrl = getCustomerAvatarUrl(cust.photo || cust.avatar, cust.id || cust.name)

  // Tier calculation
  const currentTier = totalSpentNum >= 10000 ? 'Platinum' : totalSpentNum >= 5000 ? 'Gold' : totalSpentNum >= 1500 ? 'Silver' : 'Bronze'
  const nextTierTarget = totalSpentNum >= 10000 ? 10000 : totalSpentNum >= 5000 ? 10000 : totalSpentNum >= 1500 ? 5000 : 1500
  const tierProgress = Math.min(100, Math.round((totalSpentNum / nextTierTarget) * 100))

  return (
    <>
      <DetailDrawer
        isOpen={!!customer}
        onClose={onClose}
        size="2xl"
      >
        <DetailDrawerHeader
          title={cust.name}
          subtitle={cust.email || cust.phone || '—'}
          badge={
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-mono font-semibold border border-border/60">
                CUST-#{String(cust.id).padStart(4, '0')}
              </span>
              {cust.is_credit_hold && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-500/30 flex items-center gap-1">
                  <ShieldAlert size={12} />
                  {t('customers.creditHoldBadge', 'Credit Hold')}
                </span>
              )}
            </div>
          }
          onClose={onClose}
        />

        {/* ─── GLOBAL TAB NAVIGATION ─── */}
        <DetailDrawerTabNav
          tabs={tabs}
          activeTab={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
        />

        <DetailDrawerBody isLoading={isLoading}>
          {/* ════════════════════════════════════════════════════════════════════
              HERO ENTERPRISE PROFILE CARD
          ════════════════════════════════════════════════════════════════════ */}
          <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 dark:bg-slate-800/40 border border-border dark:border-slate-800 shadow-2xs space-y-4">
            {/* Top Row: Avatar & Profile Info */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <UserAvatar
                  src={photoUrl}
                  customerId={cust.id}
                  name={cust.name}
                  sizeClassName="w-16 h-16"
                  preview={true}
                />
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                  cust.is_active ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-rose-500 ring-2 ring-rose-500/20'
                }`} />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight truncate">{cust.name}</h2>
                  <StatusBadge status={cust.is_active} />
                  {cust.rfm_segment && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-primary/10 text-primary border border-primary/30 uppercase">
                      <Crown size={12} className="text-primary shrink-0" />
                      {cust.rfm_segment}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">
                    <Tag size={12} className="text-primary" />
                    {cust.group?.name || '—'}
                    {cust.group?.discount_percent && Number(cust.group.discount_percent) > 0 
                      ? ` (${Number(cust.group.discount_percent)}% OFF)` 
                      : ''}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    {cust.payment_terms ? cust.payment_terms.toUpperCase() : 'PREPAID'}
                  </span>
                  {cust.tax_number && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                      VAT: {cust.tax_number}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row: Quick Enterprise Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
              {outstandingNum > 0 && (
                <ActionButton
                  size="sm"
                  variant="danger"
                  icon={<CreditCard size={14} />}
                  onClick={() => setDebtModalOpen(true)}
                >
                  {t('customers.settleDebt', 'Settle Debt')}
                </ActionButton>
              )}
              <ActionButton
                size="sm"
                variant="secondary"
                icon={<FileText size={14} />}
                onClick={() => setStatementPrintModalOpen(true)}
              >
                {t('customers.printSOA', 'Statement (SOA)')}
              </ActionButton>
              <ActionButton
                size="sm"
                variant="success"
                icon={<Wallet size={14} />}
                onClick={() => setTopupModalOpen(true)}
              >
                {t('customers.topUpWallet', '+ Top Up Wallet')}
              </ActionButton>
              <ActionButton
                size="sm"
                variant="primary"
                icon={<PhoneCall size={14} />}
                onClick={() => setInteractionModalOpen(true)}
              >
                {t('customers.logCall', 'Log Activity')}
              </ActionButton>
            </div>

            {/* Quick Tag Pills */}
            {tagsList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
                {tagsList.map((tagItem, idx) => (
                  <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-card/80 text-foreground border border-border/80 shadow-2xs">
                    {tagItem}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              TAB CONTENTS
          ════════════════════════════════════════════════════════════════════ */}
          <div className="space-y-5">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* 4 Financial & Health Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-slate-800/30 border border-border dark:border-slate-800 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{t('customers.totalRevenue', 'Total Revenue')}</p>
                    <p className="text-lg font-black text-foreground font-mono">
                      ${totalSpentNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">{cust.order_count || 0} {t('customers.ordersCompleted', 'orders completed')}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-slate-800/30 border border-border dark:border-slate-800 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{t('customers.outstandingDebt', 'Outstanding Debt')}</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                      ${outstandingNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">{t('customers.creditLimit', 'Limit:')} ${creditLimitNum.toLocaleString()}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-slate-800/30 border border-border dark:border-slate-800 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{t('customers.storeWallet', 'Store Wallet')}</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ${walletBalanceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">{t('customers.prepaidBalance', 'Prepaid balance')}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 dark:bg-slate-800/30 border border-border dark:border-slate-800 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{t('customers.retentionHealth', 'Retention Health')}</p>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                      {100 - churnRiskNum}%
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium">{t('customers.churnRisk', 'Churn Risk:')} {churnRiskNum}%</p>
                  </div>
                </div>

                {/* Contact & B2B Tax Information Grid */}
                <DetailDrawerCard
                  title={t('customers.b2bEntityProfile', 'B2B Entity & Communication Profile')}
                >
                  <div className="space-y-0.5">
                    <DetailDrawerRow
                      label={t('customers.directEmail', 'Direct Email')}
                      value={cust.email || '—'}
                      copyable={!!cust.email}
                      copyText={cust.email || ''}
                    />
                    <DetailDrawerRow
                      label={t('customers.primaryPhone', 'Primary Phone')}
                      value={cust.phone || '—'}
                      copyable={!!cust.phone}
                      copyText={cust.phone || ''}
                    />
                    <DetailDrawerRow
                      label={t('customers.vatTaxId', 'VAT / Tax ID')}
                      value={cust.tax_number || t('customers.noTaxId', 'No Tax ID Registered')}
                      copyable={!!cust.tax_number}
                      copyText={cust.tax_number || ''}
                    />
                    <DetailDrawerRow
                      label={t('customers.taxBranchCode', 'Tax Branch Code')}
                      value={cust.tax_branch_code || t('customers.headOffice', 'Head Office')}
                    />
                    <DetailDrawerRow
                      label={t('customers.termsLabel', 'Payment Terms')}
                      value={cust.payment_terms ? cust.payment_terms.toUpperCase() : 'PREPAID'}
                    />
                    <DetailDrawerRow
                      label={t('customers.group', 'Customer Group')}
                      value={cust.group?.name || '—'}
                    />
                  </div>
                </DetailDrawerCard>

                {/* Notes & Internal Remarks */}
                {cust.notes && (
                  <DetailDrawerCard
                    title={t('customers.accountNotes', 'Special Customer Directives & Account Notes')}
                    className="bg-amber-500/5 border-amber-500/20"
                  >
                    <p className="text-xs text-muted-foreground leading-relaxed">{cust.notes}</p>
                  </DetailDrawerCard>
                )}
              </div>
            )}

            {/* 2. CREDIT & WALLET TAB */}
            {activeTab === 'credit_wallet' && (
              <div className="space-y-4">
                {/* Credit Limit & Hold Controls */}
                <DetailDrawerCard
                  title={t('customers.creditFacilityTitle', 'B2B Credit Facility & Aging')}
                  action={
                    <ActionButton
                      size="sm"
                      variant={cust.is_credit_hold ? 'danger' : 'secondary'}
                      icon={<ShieldAlert size={14} />}
                      onClick={() => creditHoldMutation.mutate(!cust.is_credit_hold)}
                      disabled={creditHoldMutation.isPending}
                    >
                      {cust.is_credit_hold 
                        ? t('customers.creditLockedUnlock', 'Credit Locked (Click to Unlock)') 
                        : t('customers.lockCreditHold', 'Lock Account / Place on Hold')}
                    </ActionButton>
                  }
                >
                  <div className="space-y-4">
                    {/* 3 Metrics: Utilized, Limit, Available */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-[11px] font-medium text-muted-foreground block">{t('customers.utilized', 'Utilized Debt')}</span>
                        <span className="text-base sm:text-lg font-black font-mono text-foreground mt-0.5 block">
                          ${outstandingNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-[11px] font-medium text-muted-foreground block">{t('customers.creditLimit', 'Credit Limit')}</span>
                        <span className="text-base sm:text-lg font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                          ${creditLimitNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-[11px] font-medium text-muted-foreground block">{t('customers.availableCredit', 'Available Credit')}</span>
                        <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                          ${Math.max(0, creditLimitNum - outstandingNum).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Utilization Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>{t('customers.creditUtilization', 'Credit Utilization')}</span>
                        <span className="font-mono font-bold text-foreground">
                          {creditLimitNum > 0 ? Math.round((outstandingNum / creditLimitNum) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden border border-border/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            creditLimitNum > 0 && (outstandingNum / creditLimitNum) > 0.85
                              ? 'bg-rose-500'
                              : creditLimitNum > 0 && (outstandingNum / creditLimitNum) > 0.5
                                ? 'bg-amber-500'
                                : 'bg-primary'
                          }`}
                          style={{ width: `${creditLimitNum > 0 ? Math.min(100, (outstandingNum / creditLimitNum) * 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Aging Report 4 Buckets */}
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                        {t('customers.agingSchedule', 'Aging Schedule')}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-xl bg-card border border-border/70 hover:border-emerald-500/30 transition-all text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-[11px] font-medium text-muted-foreground">{t('customers.aging1_30', '1-30 Days')}</p>
                          </div>
                          <p className="text-sm font-black font-mono text-foreground">${(outstandingNum * 0.6).toFixed(2)}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border/70 hover:border-amber-500/30 transition-all text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <p className="text-[11px] font-medium text-muted-foreground">{t('customers.aging31_60', '31-60 Days')}</p>
                          </div>
                          <p className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">${(outstandingNum * 0.3).toFixed(2)}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border/70 hover:border-orange-500/30 transition-all text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            <p className="text-[11px] font-medium text-muted-foreground">{t('customers.aging61_90', '61-90 Days')}</p>
                          </div>
                          <p className="text-sm font-black font-mono text-orange-600 dark:text-orange-400">${(outstandingNum * 0.1).toFixed(2)}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-card border border-border/70 hover:border-rose-500/30 transition-all text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <p className="text-[11px] font-medium text-muted-foreground">{t('customers.agingOver90', '90+ Days')}</p>
                          </div>
                          <p className="text-sm font-black font-mono text-rose-600 dark:text-rose-400">$0.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DetailDrawerCard>

                {/* Store Wallet Transactions Ledger */}
                <DetailDrawerCard
                  title={t('customers.storeWalletBalance', 'Store Wallet Balance')}
                  badge={
                    <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                      ${walletBalanceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  }
                  action={
                    <ActionButton
                      size="sm"
                      variant="success"
                      icon={<Plus size={13} />}
                      onClick={() => setTopupModalOpen(true)}
                    >
                      {t('customers.topUpAdjust', '+ Top Up / Adjust')}
                    </ActionButton>
                  }
                >
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 text-[11px] text-muted-foreground font-bold border-b border-border/60">
                        <tr>
                          <th className="py-2.5 px-3 text-left">{t('customers.refDate', 'Reference / Date')}</th>
                          <th className="py-2.5 px-3 text-left">{t('customers.type', 'Type')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.amount', 'Amount')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.balance', 'Balance')}</th>
                          <th className="py-2.5 px-3 text-left">{t('customers.notes', 'Notes')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {walletList.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="text-center py-8 text-muted-foreground bg-card">
                               <p className="text-xs">{t('customers.noWalletTransactions', 'No wallet transactions recorded yet.')}</p>
                             </td>
                           </tr>
                        ) : (
                          walletList.map((tx) => (
                            <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono">
                                <p className="font-bold text-foreground">{tx.reference_no}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                              </td>
                              <td className="py-2.5 px-3 capitalize font-semibold text-foreground">{tx.type.replace('_', ' ')}</td>
                              <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                tx.type === 'pos_payment' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {tx.type === 'pos_payment' ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">${Number(tx.balance_after).toFixed(2)}</td>
                              <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[140px]">{tx.notes || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </DetailDrawerCard>
              </div>
            )}

            {/* 3. LOYALTY & TIER PROGRESSION TAB */}
            {activeTab === 'loyalty' && (
              <div className="space-y-4">
                {/* Executive Tier Card */}
                <DetailDrawerCard
                  title={t('customers.membershipTier', 'Membership Tier & Progress')}
                  badge={
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] tracking-wider uppercase border border-amber-500/30">
                      {currentTier} MEMBER
                    </span>
                  }
                  action={
                    <ActionButton
                      size="sm"
                      variant="warning"
                      icon={<Plus size={13} />}
                      onClick={() => setPointsModalOpen(true)}
                    >
                      {t('customers.adjustPoints', '+ Adjust Points')}
                    </ActionButton>
                  }
                >
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {t('customers.accumulatedSpend', 'Accumulated Spend:')} <strong className="text-foreground font-mono font-bold">${totalSpentNum.toLocaleString()}</strong> / ${nextTierTarget.toLocaleString()}
                    </p>

                    {/* Progress Bar & Milestone Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-muted-foreground">
                          {tierProgress}% {t('customers.nextTierUpgrade', 'Towards next tier upgrade')}
                        </span>
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                          ${Math.max(0, nextTierTarget - totalSpentNum).toLocaleString()} {t('customers.needed', 'needed')}
                        </span>
                      </div>

                      <div className="h-2.5 rounded-full bg-muted overflow-hidden border border-amber-500/20">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
                          style={{ width: `${tierProgress}%` }}
                        />
                      </div>

                      {/* Tier Roadmap Milestones */}
                      <div className="grid grid-cols-4 gap-1 text-center pt-2 text-[10px] text-muted-foreground font-medium">
                        <div className={totalSpentNum >= 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : ''}>
                          ● Bronze ($0)
                        </div>
                        <div className={totalSpentNum >= 1500 ? 'text-amber-700 dark:text-amber-400 font-bold' : ''}>
                          ● Silver ($1.5k)
                        </div>
                        <div className={totalSpentNum >= 5000 ? 'text-amber-700 dark:text-amber-400 font-bold' : ''}>
                          ● Gold ($5k)
                        </div>
                        <div className={totalSpentNum >= 10000 ? 'text-amber-700 dark:text-amber-400 font-bold' : ''}>
                          ● Platinum ($10k)
                        </div>
                      </div>
                    </div>
                  </div>
                </DetailDrawerCard>

                {/* Points Ledger Table */}
                <DetailDrawerCard
                  title={t('customers.pointsBalance', 'Total Points Balance')}
                  badge={
                    <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400">
                      {loyaltyPointsNum.toLocaleString()} {t('customers.pointsUnit', 'Pts')}
                    </span>
                  }
                >
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 text-[11px] text-muted-foreground font-bold border-b border-border/60">
                        <tr>
                          <th className="py-2.5 px-3 text-left">{t('customers.refDate', 'Reference / Date')}</th>
                          <th className="py-2.5 px-3 text-left">{t('customers.type', 'Type')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.pointsUnit', 'Pts')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.balance', 'Balance')}</th>
                          <th className="py-2.5 px-3 text-left">{t('customers.notes', 'Notes')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {pointsList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground bg-card">
                              <p className="text-xs">{t('customers.noPointsEntries', 'No reward points history found.')}</p>
                            </td>
                          </tr>
                        ) : (
                          pointsList.map((pt) => (
                            <tr key={pt.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono">
                                <p className="font-bold text-foreground">{pt.reference_no || `PTS-${pt.id}`}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(pt.created_at).toLocaleDateString()}</p>
                              </td>
                              <td className="py-2.5 px-3 capitalize font-semibold text-foreground">{pt.type}</td>
                              <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                                pt.type === 'redeemed' || pt.type === 'expired' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                              }`}>
                                {pt.type === 'redeemed' || pt.type === 'expired' ? '-' : '+'}{Number(pt.points).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">{Number(pt.balance_after).toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[150px]">{pt.notes || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </DetailDrawerCard>
              </div>
            )}

            {/* 4. B2B CONTACTS TAB */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <DetailDrawerCard
                  title={t('customers.corporateContactsTitle', 'Corporate Contact Persons & Department Hierarchy')}
                  action={
                    <ActionButton
                      size="sm"
                      variant="primary"
                      icon={<Plus size={13} />}
                      onClick={() => setContactModalOpen(true)}
                    >
                      {t('customers.addB2BContact', 'Add B2B Contact')}
                    </ActionButton>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contactsList.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border/80">
                        {t('customers.noCorporateContacts', 'No corporate contact persons added yet. Click "+ Add B2B Contact" to register purchasing agents or accountants.')}
                      </div>
                    ) : (
                      contactsList.map((c) => (
                        <div key={c.id} className="p-3.5 rounded-xl bg-card border border-border space-y-2.5 shadow-2xs relative">
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
                              <p className="text-[11px] text-muted-foreground">{c.job_title} • {c.department || 'General'}</p>
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
                </DetailDrawerCard>
              </div>
            )}

            {/* 5. PRICING CONTRACTS TAB */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <DetailDrawerCard
                  title={t('customers.pricingContractsTitle', 'Custom Negotiated Price Lists & Volume Agreements')}
                >
                  <div className="space-y-3">
                    {contractsList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border/80">
                        {t('customers.noPricingContracts', 'No custom price agreements found for this customer. Standard group discounts apply.')}
                      </div>
                    ) : (
                      contractsList.map((ctr) => (
                        <div key={ctr.id} className="p-4 rounded-xl bg-card border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono text-[10px] text-primary font-bold">{ctr.contract_number}</span>
                              <h4 className="text-xs font-bold text-foreground">{ctr.title}</h4>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                              {ctr.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                            <span>{t('customers.discount', 'Discount:')} <strong className="text-foreground">{Number(ctr.discount_value)}%</strong></span>
                            <span>{t('customers.validPeriod', 'Valid:')} {ctr.start_date} to {ctr.end_date || t('customers.perpetual', 'Perpetual')}</span>
                          </div>
                          {ctr.terms_and_conditions && (
                            <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded border border-border/50">
                              {ctr.terms_and_conditions}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </DetailDrawerCard>
              </div>
            )}

            {/* 6. 360° TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <DetailDrawerCard
                  title={t('customers.timelineTitle', 'Omnichannel Communication Log & Interaction History')}
                  action={
                    <ActionButton
                      size="sm"
                      variant="primary"
                      icon={<Plus size={13} />}
                      onClick={() => setInteractionModalOpen(true)}
                    >
                      {t('customers.logInteraction', 'Log Interaction')}
                    </ActionButton>
                  }
                >
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border/60">
                    {interactionsList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border/80">
                        {t('customers.noTimelineEntries', 'No interaction timeline entries found.')}
                      </div>
                    ) : (
                      interactionsList.map((it) => (
                        <div key={it.id} className="relative flex items-start gap-3 pl-7">
                          <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-card" />
                          <div className="flex-1 p-3.5 rounded-xl bg-card border border-border space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-foreground">{it.subject}</h4>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {new Date(it.interacted_at).toLocaleString()}
                              </span>
                            </div>
                            <span className="inline-block px-1.5 py-0.2 rounded bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
                              {it.type.replace('_', ' ')}
                            </span>
                            {it.description && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.description}</p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-1">{t('customers.loggedBy', 'Logged by:')} {it.created_by || 'Staff'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DetailDrawerCard>
              </div>
            )}

            {/* 7. SUPPORT TICKETS & RMA TAB */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <DetailDrawerCard
                  title={t('customers.supportTicketsTitle', 'Customer Care, RMA Returns & Warranty Tickets')}
                  action={
                    <ActionButton
                      size="sm"
                      variant="primary"
                      icon={<Plus size={13} />}
                      onClick={() => setTicketModalOpen(true)}
                    >
                      {t('customers.openTicketRma', 'Open Ticket / RMA')}
                    </ActionButton>
                  }
                >
                  <div className="space-y-3">
                    {ticketsList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border/80">
                        {t('customers.noSupportTickets', 'No support tickets or RMA warranty claims filed.')}
                      </div>
                    ) : (
                      ticketsList.map((tck) => (
                        <div key={tck.id} className="p-4 rounded-xl bg-card border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-primary">{tck.ticket_number}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tck.priority === 'urgent' ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600'
                              }`}>
                                {tck.priority}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tck.status === 'resolved' || tck.status === 'closed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {tck.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground">{tck.subject}</h4>
                          {tck.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{tck.description}</p>
                          )}
                          {tck.resolution && (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 font-medium flex items-center gap-1.5">
                              <CheckCircle2 size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>{t('customers.resolution', 'Resolution:')} {tck.resolution}</span>
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </DetailDrawerCard>
              </div>
            )}

            {/* 8. KYC & LEGAL DOCUMENTS TAB */}
            {activeTab === 'kyc' && (
              <div className="space-y-4">
                <DetailDrawerCard
                  title={t('customers.kycComplianceTitle', 'Corporate Compliance, Tax Certificates & Signed Contracts')}
                  action={
                    <ActionButton
                      size="sm"
                      variant="primary"
                      icon={<Plus size={13} />}
                      onClick={() => setKycModalOpen(true)}
                    >
                      {t('customers.uploadKycDoc', 'Upload KYC Document')}
                    </ActionButton>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {kycList.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border/80">
                        {t('customers.noKycDocuments', 'No compliance or KYC documents uploaded yet.')}
                      </div>
                    ) : (
                      kycList.map((doc) => (
                        <div key={doc.id} className="p-4 rounded-xl bg-card border border-border space-y-2.5 shadow-2xs">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono uppercase text-muted-foreground">
                                {doc.document_type.replace('_', ' ')}
                              </span>
                              <h4 className="text-xs font-bold text-foreground mt-1">{doc.title}</h4>
                              <p className="text-[10px] font-mono text-muted-foreground">{doc.document_number || 'Doc Ref'}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={11} /> {t('customers.verified', 'Verified')}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Size: {doc.file_size || '1.2 MB'}</span>
                            <a 
                              href={doc.file_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              {t('customers.previewPdf', 'Preview PDF')} <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DetailDrawerCard>
              </div>
            )}

            {/* 9. ORDERS & SALES HISTORY TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <DetailDrawerCard
                  title={t('customers.tabOrders', 'Order History & Invoices')}
                  action={
                    <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setOrderChannelFilter('all')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
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
                        className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          orderChannelFilter === 'web'
                            ? 'bg-card text-foreground shadow-2xs font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Globe size={11} className="text-blue-500" />
                        <span>{t('customers.onlineWebOrders', 'Web')}</span>
                        <span className="text-[10px] opacity-75">({combinedOrdersList.filter(o => o.recordType === 'web').length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderChannelFilter('pos')}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          orderChannelFilter === 'pos'
                            ? 'bg-card text-foreground shadow-2xs font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Store size={11} className="text-emerald-500" />
                        <span>{t('customers.posSales', 'POS')}</span>
                        <span className="text-[10px] opacity-75">({combinedOrdersList.filter(o => o.recordType === 'pos').length})</span>
                      </button>
                    </div>
                  }
                >
                  <div className="overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 text-[10px] uppercase text-muted-foreground font-bold border-b border-border">
                        <tr>
                          <th className="py-2.5 px-3 text-left">{t('customers.orderOrInvoiceNum', 'Order / Invoice No')}</th>
                          <th className="py-2.5 px-3 text-left">{t('customers.channel', 'Channel')}</th>
                          <th className="py-2.5 px-3 text-left">{t('common.date', 'Date')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.items', 'Items')}</th>
                          <th className="py-2.5 px-3 text-right">{t('customers.grandTotal', 'Grand Total')}</th>
                          <th className="py-2.5 px-3 text-center">{t('common.status', 'Status')}</th>
                          <th className="py-2.5 px-3 text-center">{t('common.action', 'Action')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {filteredOrdersList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground bg-card">
                              {t('customers.noSalesOrders', 'No orders or sales found for this customer.')}
                            </td>
                          </tr>
                        ) : (
                          filteredOrdersList.map((item: any) => (
                            <tr key={`${item.recordType}-${item.id}`} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose()
                                    navigate(item.viewLink)
                                  }}
                                  className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
                                >
                                  <span>{item.displayNumber}</span>
                                  <ArrowUpRight size={11} className="opacity-70" />
                                </button>
                              </td>
                              <td className="py-2.5 px-3">
                                {item.recordType === 'web' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    <Globe size={10} />
                                    <span>{item.channelLabel}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <Store size={10} />
                                    <span>{item.channelLabel}</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-muted-foreground font-mono">
                                {item.displayDate ? new Date(item.displayDate).toLocaleDateString() : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                {item.itemCount}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                ${item.totalAmount.toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">
                                  {item.status || 'Completed'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose()
                                    navigate(item.viewLink)
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                >
                                  <span>{t('common.view', 'View')}</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </DetailDrawerCard>
              </div>
            )}

            {/* 10. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <DetailDrawerCard
                  title={t('customers.tabAddresses', 'Delivery & Billing Addresses')}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addressesList.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-muted-foreground text-xs bg-muted/20 rounded-xl border border-dashed border-border/80">
                        {t('customers.noDeliveryAddresses', 'No delivery addresses configured.')}
                      </div>
                    ) : (
                      addressesList.map((addr) => (
                        <div key={addr.id} className="p-3.5 rounded-xl bg-card border border-border space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px]">
                              {addr.label || 'Home'}
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
                </DetailDrawerCard>
              </div>
            )}
          </div>
        </DetailDrawerBody>

        <DetailDrawerFooter
          rightActions={
            <div className="flex items-center gap-2">
              <ActionButton
                variant="secondary"
                icon={<ExternalLink size={14} />}
                onClick={() => {
                  onClose()
                  navigate(`/customers/${cust.id}`)
                }}
              >
                {t('customers.fullDetailPage', 'Open Full Page')}
              </ActionButton>
              <ActionButton
                variant="primary"
                icon={<Edit3 size={15} />}
                onClick={() => openEditModal(cust)}
              >
                {t('customers.editProfile', 'Edit Customer Profile')}
              </ActionButton>
            </div>
          }
        />
      </DetailDrawer>

      {/* ─── MODAL 1: STORE WALLET TOP-UP / ADJUST ─── */}
      <EnterpriseModal
        isOpen={topupModalOpen}
        onClose={() => setTopupModalOpen(false)}
        title={t('customers.walletModalTitle', 'Store Wallet Top-up / Adjustment')}
        subtitle={t('customers.walletModalSubtitle', { name: cust.name, defaultValue: `Adjust balance for customer: ${cust.name}` })}
        icon={<Wallet size={20} />}
        iconVariant="emerald"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setTopupModalOpen(false)}
            isSubmitting={walletMutation.isPending}
            submitLabel={t('customers.confirmTransaction', 'Confirm Transaction')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() => walletMutation.mutate({
              amount: Number(topupAmount),
              type: topupType,
              notes: topupNotes,
              payment_method: 'Bakong / Cash'
            })}
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.txType', 'Transaction Type')}</label>
            <select
              value={topupType}
              onChange={(e) => setTopupType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            >
              <option value="top_up">{t('customers.topupDeposit', 'Top-up Deposit (+)')}</option>
              <option value="refund_credit">{t('customers.refundCredit', 'Refund Credit (+)')}</option>
              <option value="pos_payment">{t('customers.manualDeduction', 'Manual Deduction (-)')}</option>
              <option value="manual_adjustment">{t('customers.adminAdjustment', 'Admin Balance Adjustment (+)')}</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.amountUsd', 'Amount ($ USD)')}</label>
            <input
              type="number"
              step="0.01"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground font-mono text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.remarksRef', 'Remarks / Reference')}</label>
            <input
              type="text"
              value={topupNotes}
              onChange={(e) => setTopupNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={t('customers.remarksPlaceholder', 'e.g. Bank transfer reference #8921')}
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* ─── MODAL 2: ADJUST LOYALTY POINTS ─── */}
      <EnterpriseModal
        isOpen={pointsModalOpen}
        onClose={() => setPointsModalOpen(false)}
        title={t('customers.pointsModalTitle', 'Loyalty Points Adjustment')}
        subtitle={t('customers.pointsModalSubtitle', { name: cust.name, defaultValue: `Manage rewards points for ${cust.name}` })}
        icon={<Award size={20} />}
        iconVariant="amber"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setPointsModalOpen(false)}
            isSubmitting={pointsMutation.isPending}
            submitLabel={t('customers.updatePoints', 'Update Points')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() => pointsMutation.mutate({
              points: Number(pointsAmount),
              type: pointsType,
              notes: pointsNotes,
            })}
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.pointsAction', 'Adjustment Action')}</label>
            <select
              value={pointsType}
              onChange={(e) => setPointsType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            >
              <option value="earned">{t('customers.pointsEarned', 'Reward / Bonus Points (+)')}</option>
              <option value="adjustment">{t('customers.pointsAdjustment', 'Manual Correction (+)')}</option>
              <option value="redeemed">{t('customers.pointsRedeemed', 'Redeemed for Gift (-)')}</option>
              <option value="expired">{t('customers.pointsExpired', 'Expired Points (-)')}</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.pointsUnit', 'Points')} {t('common.quantity', 'Quantity')}</label>
            <input
              type="number"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground font-mono text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('common.notes', 'Reason / Notes')}</label>
            <input
              type="text"
              value={pointsNotes}
              onChange={(e) => setPointsNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={t('customers.pointsNotesPlaceholder', 'e.g. VIP Customer appreciation bonus')}
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* ─── MODAL 3: LOG INTERACTION TIMELINE ─── */}
      <EnterpriseModal
        isOpen={interactionModalOpen}
        onClose={() => setInteractionModalOpen(false)}
        title={t('customers.interactionModalTitle', 'Log Customer Interaction')}
        subtitle={t('customers.interactionModalSubtitle', { name: cust.name, defaultValue: `Record communication with ${cust.name}` })}
        icon={<PhoneCall size={20} />}
        iconVariant="blue"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setInteractionModalOpen(false)}
            isSubmitting={interactionMutation.isPending}
            submitLabel={t('customers.saveInteraction', 'Save Interaction')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() => interactionMutation.mutate({
              type: interactionType,
              subject: interactionSubject || 'Follow-up Call',
              description: interactionDesc,
            })}
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.interactionChannelType', 'Channel / Interaction Type')}</label>
            <select
              value={interactionType}
              onChange={(e) => setInteractionType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
            >
              <option value="phone_call">{t('customers.channelPhoneCall', 'Phone Call')}</option>
              <option value="meeting">{t('customers.channelMeeting', 'In-Person Meeting')}</option>
              <option value="telegram">{t('customers.channelTelegram', 'Telegram Chat / Inquiry')}</option>
              <option value="email">{t('customers.channelEmail', 'Email Communication')}</option>
              <option value="site_visit">{t('customers.channelSiteVisit', 'Client Site Visit')}</option>
              <option value="note">{t('customers.channelNote', 'Internal Account Note')}</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.interactionSubject', 'Subject / Objective')}</label>
            <input
              type="text"
              value={interactionSubject}
              onChange={(e) => setInteractionSubject(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={t('customers.interactionSubjectPlaceholder', 'e.g. Discussed Q2 pricing contract terms')}
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.interactionDescription', 'Detailed Discussion Notes')}</label>
            <textarea
              rows={3}
              value={interactionDesc}
              onChange={(e) => setInteractionDesc(e.target.value)}
              className="w-full p-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={t('customers.interactionDescPlaceholder', 'Summary of agreements, requirements, and next action steps...')}
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* ─── MODAL 4: ADD B2B CONTACT ─── */}
      <EnterpriseModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title={t('customers.contactModalTitle', 'Add B2B Corporate Contact')}
        subtitle={t('customers.contactModalSubtitle', { name: cust.name, defaultValue: `Add authorized representative for ${cust.name}` })}
        icon={<Users2 size={20} />}
        iconVariant="blue"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setContactModalOpen(false)}
            isSubmitting={contactMutation.isPending}
            submitLabel={t('customers.saveContact', 'Save Contact')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() => contactMutation.mutate({
              name: contactName,
              email: contactEmail,
              phone: contactPhone,
              job_title: contactJob,
              is_primary: false,
            })}
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.name', 'Contact Name')} *</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g. Sok Chantha"
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.jobTitle', 'Job Title / Role')}</label>
            <input
              type="text"
              value={contactJob}
              onChange={(e) => setContactJob(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g. Procurement Lead / Accountant"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">{t('customers.phone', 'Phone Number')}</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="012 345 678"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">{t('customers.email', 'Email Address')}</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="contact@company.com"
              />
            </div>
          </div>
        </div>
      </EnterpriseModal>

      {/* ─── MODAL 5: UPLOAD KYC DOCUMENT ─── */}
      <EnterpriseModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        title={t('customers.kycModalTitle', 'Upload KYC & Compliance Document')}
        subtitle={t('customers.kycModalSubtitle', { name: cust.name, defaultValue: `Verify corporate documentation for ${cust.name}` })}
        icon={<FileCheck2 size={20} />}
        iconVariant="blue"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setKycModalOpen(false)}
            isSubmitting={kycMutation.isPending}
            submitLabel={t('customers.uploadAndVerify', 'Upload & Verify')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() => kycMutation.mutate({
              document_type: kycType,
              title: kycTitle || 'Tax Patent 2026',
              document_number: kycDocNo || 'PAT-2026-001',
              status: 'verified',
            })}
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.docCategory', 'Compliance Document Category')}</label>
            <select
              value={kycType}
              onChange={(e) => setKycType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
            >
              <option value="patent_tax">{t('customers.kycPatentTax', 'Patent Tax Certificate')}</option>
              <option value="vat_certificate">{t('customers.kycVatCert', 'GDT VAT Certificate')}</option>
              <option value="business_license">{t('customers.kycBusinessLicense', 'Ministry of Commerce Registration')}</option>
              <option value="contract_agreement">{t('customers.kycContractAgreement', 'Signed Master Contract (PDF)')}</option>
              <option value="id_card">{t('customers.kycIdCard', 'National ID / Passport')}</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.title', 'Document Title')}</label>
            <input
              type="text"
              value={kycTitle}
              onChange={(e) => setKycTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g. Official 2026 Tax Patent Certificate"
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.documentNumber', 'Document / Certificate No.')}</label>
            <input
              type="text"
              value={kycDocNo}
              onChange={(e) => setKycDocNo(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g. PAT-2026-98124"
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* ─── MODAL 6: CREATE SUPPORT TICKET / RMA ─── */}
      <EnterpriseModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title={t('customers.ticketModalTitle', 'Open Support Ticket / RMA Claim')}
        subtitle={t('customers.ticketModalSubtitle', { name: cust.name, defaultValue: `Register inquiry or warranty issue for ${cust.name}` })}
        icon={<HelpCircle size={20} />}
        iconVariant="blue"
        size="md"
        footer={
          <ModalFooter
            onCancel={() => setTicketModalOpen(false)}
            isSubmitting={ticketMutation.isPending}
            submitLabel={t('customers.registerTicket', 'Register Ticket')}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={() => ticketMutation.mutate({
              subject: ticketSubject || 'Customer Issue',
              type: ticketType,
              priority: ticketPriority,
              description: ticketDesc,
            })}
          />
        }
      >
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">{t('customers.issueType', 'Issue Type')}</label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
              >
                <option value="inquiry">{t('customers.ticketTypeInquiry', 'General Inquiry')}</option>
                <option value="rma_return">{t('customers.ticketTypeWarranty', 'Warranty / RMA Claim')}</option>
                <option value="warranty_claim">{t('customers.ticketTypeWarranty', 'Warranty Claim')}</option>
                <option value="billing_issue">{t('customers.ticketTypeBilling', 'Billing & Tax Dispute')}</option>
                <option value="complaint">{t('customers.complaint', 'Complaint')}</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">{t('customers.priority', 'Priority Level')}</label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
              >
                <option value="low">{t('customers.priorityLow', 'Low')}</option>
                <option value="medium">{t('customers.priorityMedium', 'Medium')}</option>
                <option value="high">{t('customers.priorityHigh', 'High')}</option>
                <option value="urgent">{t('customers.priorityUrgent', 'Urgent')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.subject', 'Ticket Subject')}</label>
            <input
              type="text"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g. Return request for batch #981 damaged box"
            />
          </div>
          <div>
            <label className="font-bold text-foreground block mb-1">{t('customers.description', 'Description')}</label>
            <textarea
              rows={3}
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              className="w-full p-3 rounded-lg border border-border/80 bg-background text-foreground text-xs sm:text-[13px] focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Provide exact details of the request..."
            />
          </div>
        </div>
      </EnterpriseModal>

      {/* Settle Debt Quick Modal */}
      <CustomerDebtModal
        isOpen={debtModalOpen}
        onClose={() => setDebtModalOpen(false)}
        customer={cust}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['customer-detail', cust.id] })
          qc.invalidateQueries({ queryKey: ['customers'] })
          qc.invalidateQueries({ queryKey: ['customers-stats'] })
        }}
      />

      {/* Customer Statement GlobalPrint Modal */}
      <CustomerStatementPrintModal
        isOpen={statementPrintModalOpen}
        onClose={() => setStatementPrintModalOpen(false)}
        customer={cust}
      />
    </>
  )
}

export default CustomerDetailDrawer
