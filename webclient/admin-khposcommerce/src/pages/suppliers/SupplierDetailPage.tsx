import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Copy, Check, ExternalLink,
  ShoppingCart, Plus, Eye, Edit2, Edit3,
  Phone, Mail, Globe
} from 'lucide-react'
import { supplierService } from '@/services/supplierService'
import { useToast } from '@/hooks/useToast'
import {
  FormHeader,
  FormHeaderButton,
  StatusBadge,
  LoadingSpinner,
  SupplierLogo,
} from '@/components/common'
import CustomErrorMessage from '@/components/ui/CustomErrorMessage'
import WorkspaceTabs, { type WorkspaceTabItem } from '@/components/shared/WorkspaceTabs'
import { usePageTab } from '@/hooks/usePageTab'
import type { Supplier } from './types/supplier.types'

type TabKey = 'overview' | 'financials' | 'purchases' | 'products' | 'performance'

export const SupplierDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const supplierId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('suppliers')
  const toast = useToast()

  const [activeTab, setActiveTab] = usePageTab<TabKey>({
    storageKey: 'supplier_detail_active_tab',
    defaultTab: 'overview',
    validTabs: ['overview', 'financials', 'purchases', 'products', 'performance'],
    deleteDefaultFromUrl: true,
  })
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const {
    data: supplier,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['supplier-detail', supplierId],
    queryFn: () => (supplierId ? supplierService.show(supplierId) : null),
    enabled: !!supplierId && !isNaN(supplierId),
  })

  const handleCopy = (text?: string | null, key?: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (key) {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    }
    toast.success(t('suppliers.copiedToClipboard', 'បានចម្លងទៅក្ដារតម្បៀតខ្ទាស់'))
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

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 max-w-xl mx-auto text-center">
        <CustomErrorMessage
          variant="card"
          severity="error"
          code={(error as any)?.response?.status || 404}
          title={t('suppliers.loadErrorTitle', 'មិនអាចទាញយកទិន្នន័យអ្នកផ្គត់ផ្គង់')}
          message={(error as any)?.response?.data?.message || t('suppliers.loadErrorDesc', 'រកមិនឃើញអ្នកផ្គត់ផ្គង់ ឬមានបញ្ហាក្នុងការទាញយកទិន្នន័យ។')}
          onRetry={() => refetch()}
          action={{
            label: t('suppliers.back', 'ត្រឡប់ក្រោយ'),
            onClick: () => navigate('/suppliers'),
          }}
          className="w-full shadow-2xl"
        />
      </div>
    )
  }

  const supp: Supplier = supplier

  const totalPurchased = Number(supp.total_purchases_sum ?? supp.total_purchased ?? 0)
  const totalPaid = Number(supp.total_paid_sum ?? supp.total_paid ?? 0)
  const totalDue = Number(supp.total_due_sum ?? supp.total_due ?? supp.outstanding_balance ?? 0)
  const creditLimit = Number(supp.credit_limit ?? 0)
  const purchasesCount = Number(supp.purchases_count ?? supp.recent_purchases?.length ?? 0)
  const productsCount = Number(supp.supplied_products?.length ?? 0)
  const contactsCount = Number(supp.contacts?.length ?? 0)

  const primaryContact = supp.contacts?.find((c) => c.is_primary) || supp.contacts?.[0]

  const fullAddress = [
    supp.address,
    supp.city,
    supp.province,
    supp.country,
    supp.postal_code,
  ]
    .filter(Boolean)
    .join(', ')

  const workspaceTabs: WorkspaceTabItem[] = [
    {
      id: 'overview',
      label: t('suppliers.tabGeneral', 'ព័ត៌មានទូទៅ'),
    },
    {
      id: 'financials',
      label: t('suppliers.tabBanking', 'ព័ត៌មានធនាគារ'),
    },
    {
      id: 'purchases',
      label: t('suppliers.tabPurchases', 'ប្រវត្តិបញ្ជាទិញ'),
      count: purchasesCount,
    },
    {
      id: 'products',
      label: t('suppliers.tabProducts', 'កាតាឡុកទំនិញ'),
      count: productsCount,
    },
    {
      id: 'performance',
      label: t('suppliers.operationalSla', 'ការវាយតម្លៃប្រសិទ្ធភាព និងកិច្ចព្រមព្រៀង SLA'),
    },
  ]

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'strategic':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
            {t('suppliers.strategicPartner', 'ដៃគូយុទ្ធសាស្ត្រ')}
          </span>
        )
      case 'preferred':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            {t('suppliers.preferred', 'អ្នកផ្គត់ផ្គង់អាទិភាព')}
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border shadow-2xs">
            {t('suppliers.regular', 'ធម្មតា')}
          </span>
        )
    }
  }

  const getTypeBadge = (type?: string) => {
    if (!type) return null
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted/80 text-foreground border border-border shadow-2xs">
        {t(`suppliers.${type}`, type.replace('_', ' '))}
      </span>
    )
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* ── 1. ENTERPRISE FORM HEADER ────────────────────────────────────── */}
      <FormHeader
        title={supp.name}
        subtitle={
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{supp.code}</span>
            <button
              type="button"
              onClick={() => handleCopy(supp.code, 'header_code')}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={t('suppliers.copy', 'ចម្លង')}
            >
              {copiedKey === 'header_code' ? (
                <Check size={12} className="text-emerald-500" />
              ) : (
                <Copy size={12} />
              )}
            </button>
            <span className="text-border">|</span>
            {getTierBadge(supp.tier)}
            {getTypeBadge(supp.supplier_type)}
          </div>
        }
        statusBadge={<StatusBadge status={supp.is_active} rounded="full" />}
        breadcrumbs={[
          { label: t('suppliers.procurementVolume', 'ការទិញទំនិញ'), path: '/purchases' },
          { label: t('suppliers.title', 'អ្នកផ្គត់ផ្គង់'), path: '/suppliers' },
          { label: supp.name },
        ]}
        backPath="/suppliers"
        backLabel={t('suppliers.back', 'ត្រឡប់ក្រោយ')}
        extraActions={
          <div className="flex items-center gap-2">
            <FormHeaderButton
              variant="emerald"
              icon={<ShoppingCart size={14} />}
              onClick={() => navigate(`/purchases/create?supplier_id=${supp.id}`)}
            >
              {t('suppliers.createPO', 'បង្កើតការបញ្ជាទិញ')}
            </FormHeaderButton>
            <FormHeaderButton
              variant="primary"
              icon={<Edit2 size={14} />}
              onClick={() => navigate(`/suppliers/${supp.id}/edit`)}
            >
              {t('suppliers.editSupplier', 'កែសម្រួលអ្នកផ្គត់ផ្គង់')}
            </FormHeaderButton>
          </div>
        }
      />

      {/* ── 2. TOP 4 METRIC KPI CARDS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Purchased */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('suppliers.totalPurchased', 'បរិមាណទិញសរុប')}
          </p>
          <p className="text-2xl font-black font-mono text-foreground tracking-tight">
            ${totalPurchased.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {purchasesCount} {t('suppliers.posCount', 'ការបញ្ជាទិញ')}
          </p>
        </div>

        {/* Card 2: Total Paid */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('suppliers.paid', 'បានបង់')}
          </p>
          <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate">
            {t('suppliers.settledPaymentsToDate', 'ការទូទាត់ដោះស្រាយរួច')}
          </p>
        </div>

        {/* Card 3: Outstanding AP Due */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('suppliers.due', 'បំណុលជំពាក់')}
          </p>
          <p
            className={`text-2xl font-black font-mono tracking-tight ${
              totalDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
            }`}
          >
            ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-medium truncate">
            {totalDue > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {t('suppliers.pendingSettlementPayment', 'នៅសល់ទឹកប្រាក់ត្រូវទូទាត់')}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {t('suppliers.noOutstandingBalance', 'គ្មានបំណុលត្រូវទូទាត់')}
              </span>
            )}
          </p>
        </div>

        {/* Card 4: Credit Limit & Terms */}
        <div className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-1 transition-all hover:border-primary/40">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('suppliers.creditLimit', 'កម្រិតឥណទាន ($)')}
          </p>
          <p className="text-2xl font-black font-mono text-foreground tracking-tight">
            ${creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-medium text-muted-foreground truncate">
            {supp.payment_terms || 'Net 30'} · {supp.lead_time_days ?? 3} {t('suppliers.daysLeadTime', 'ថ្ងៃដឹកជញ្ជូន')}
          </p>
        </div>
      </div>

      {/* ── 3. MAIN 2-COLUMN WORKSPACE (lg:grid-cols-3) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── LEFT COLUMN (lg:col-span-2): TABS ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workspace Tabs Navigation */}
          <WorkspaceTabs
            tabs={workspaceTabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as TabKey)}
            variant="underline"
          />

          {/* TAB 1: OVERVIEW & GENERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Card 1: B2B Company Profile & Commercial Identity */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <div className="pb-3 border-b border-border/80">
                  <h3 className="text-base font-bold text-foreground">
                    {t('suppliers.companyProfile', 'ព័ត៌មានក្រុមហ៊ុន និងការចុះបញ្ជី')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('suppliers.companyProfileDesc', 'ព័ត៌មានអត្តសញ្ញាណក្រុមហ៊ុន និងទិន្នន័យនីតិបុគ្គលរបស់អ្នកផ្គត់ផ្គង់')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.name', 'ឈ្មោះអ្នកផ្គត់ផ្គង់')}
                    </span>
                    <p className="font-bold text-foreground text-sm truncate">{supp.name}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.code', 'កូដអ្នកផ្គត់ផ្គង់')}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground text-sm">{supp.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(supp.code, 'overview_code')}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title={t('suppliers.copy', 'ចម្លង')}
                      >
                        {copiedKey === 'overview_code' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.taxNumber', 'លេខសារពើពន្ធ')}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground text-sm">{supp.tax_number || '—'}</span>
                      {supp.tax_number && (
                        <button
                          type="button"
                          onClick={() => handleCopy(supp.tax_number, 'tax_number')}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                          title={t('suppliers.copy', 'ចម្លង')}
                        >
                          {copiedKey === 'tax_number' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.supplierType', 'ប្រភេទអ្នកផ្គត់ផ្គង់')}
                    </span>
                    <p className="font-semibold text-foreground capitalize">
                      {supp.supplier_type ? t(`suppliers.${supp.supplier_type}`, supp.supplier_type.replace('_', ' ')) : '—'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.partnershipTier', 'កម្រិតដៃគូ')}
                    </span>
                    <div className="pt-0.5">{getTierBadge(supp.tier)}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.registeredDate', 'កាលបរិច្ឆេទចុះឈ្មោះ')}
                    </span>
                    <p className="font-mono font-semibold text-foreground text-sm">
                      {formatDate(supp.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Recent Purchase Orders Preview */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {t('suppliers.recentPurchasesPreview', 'ការបញ្ជាទិញថ្មីៗ')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('suppliers.recentPurchasesPreviewDesc', 'បញ្ជីការបញ្ជាទិញទំនិញចុងក្រោយពីអ្នកផ្គត់ផ្គង់នេះ')}
                    </p>
                  </div>

                  {supp.recent_purchases && supp.recent_purchases.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('purchases')}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      {t('suppliers.viewAllPurchases', 'មើលទាំងអស់')}
                    </button>
                  )}
                </div>

                {(!supp.recent_purchases || supp.recent_purchases.length === 0) ? (
                  <div className="py-8 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {t('suppliers.noPurchases', 'មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ')}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/purchases/create?supplier_id=${supp.id}`)}
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{t('suppliers.createPO', 'បង្កើតការបញ្ជាទិញ')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3.5">{t('purchases.referenceNumber', 'លេខកូដ PO')}</th>
                          <th className="py-2.5 px-3.5">{t('purchases.date', 'កាលបរិច្ឆេទ')}</th>
                          <th className="py-2.5 px-3.5">{t('purchases.destination', 'សាខា / ឃ្លាំង')}</th>
                          <th className="py-2.5 px-3.5 text-right">{t('purchases.grandTotal', 'សរុបរួម')}</th>
                          <th className="py-2.5 px-3.5 text-center">{t('purchases.paymentStatus', 'ការទូទាត់')}</th>
                          <th className="py-2.5 px-3.5 text-center">{t('common.actions', 'សកម្មភាព')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {supp.recent_purchases.slice(0, 5).map((po) => (
                          <tr key={po.id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-2.5 px-3.5 font-mono font-bold text-foreground">
                              <Link
                                to={`/purchases/${po.id}`}
                                className="hover:text-primary transition-colors inline-flex items-center gap-1"
                              >
                                <span>{po.reference_number}</span>
                                <ExternalLink size={10} className="text-muted-foreground" />
                              </Link>
                            </td>
                            <td className="py-2.5 px-3.5 text-muted-foreground whitespace-nowrap">
                              {formatDate(po.date)}
                            </td>
                            <td className="py-2.5 px-3.5 text-muted-foreground truncate max-w-[150px]">
                              {po.branch_name || po.warehouse_name || 'Main Warehouse'}
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-mono font-bold text-foreground">
                              ${Number(po.grand_total).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  po.payment_status === 'paid'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : po.payment_status === 'partial'
                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                }`}
                              >
                                {po.payment_status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-center">
                              <Link
                                to={`/purchases/${po.id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                              >
                                <Eye size={12} />
                                <span>{t('common.view', 'មើល')}</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Card 3: Contact Representatives */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <div className="pb-3 border-b border-border/80">
                  <h3 className="text-base font-bold text-foreground">
                    {t('suppliers.contactRepresentatives', 'តំណាងទំនាក់ទំនង & អ្នកគ្រប់គ្រងគណនី')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('suppliers.contactRepresentativesDesc', 'តំណាងគណនី អ្នកសម្របសម្រួលការទិញ និងទំនាក់ទំនងបន្ទាន់')}
                  </p>
                </div>

                {contactsCount === 0 ? (
                  <div className="py-8 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {t('suppliers.noContactsDesc', 'មិនទាន់មានតំណាងទំនាក់ទំនងនៅឡើយទេ។')}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/suppliers/${supp.id}/edit`)}
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{t('suppliers.addContactsInEdit', 'បន្ថែមទំនាក់ទំនងក្នុងការកែប្រែ')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {supp.contacts?.map((contact, idx) => (
                      <div
                        key={contact.id || idx}
                        className="p-4 rounded-xl border border-border/80 bg-background/60 dark:bg-slate-900/60 space-y-3 relative hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-foreground text-xs truncate">{contact.name}</h4>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {contact.title || contact.position || t('suppliers.accountRep', 'តំណាងគណនី')}
                              </p>
                            </div>
                          </div>
                          {contact.is_primary && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                              {t('suppliers.primary', 'ចម្បង')}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs">
                          {contact.phone && (
                            <div className="flex items-center justify-between gap-2">
                              <a
                                href={`tel:${contact.phone}`}
                                className="font-mono text-muted-foreground hover:text-primary transition-colors truncate"
                              >
                                {contact.phone}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopy(contact.phone, `c_phone_${idx}`)}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                title={t('suppliers.copy', 'ចម្លង')}
                              >
                                {copiedKey === `c_phone_${idx}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                              </button>
                            </div>
                          )}

                          {contact.email && (
                            <div className="flex items-center justify-between gap-2">
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-muted-foreground hover:text-primary transition-colors truncate"
                              >
                                {contact.email}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopy(contact.email, `c_email_${idx}`)}
                                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                                title={t('suppliers.copy', 'ចម្លង')}
                              >
                                {copiedKey === `c_email_${idx}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 4: Internal Remarks */}
              {supp.notes && (
                <div className="bg-amber-500/5 rounded-2xl border border-amber-500/20 shadow-xs p-5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {t('suppliers.internalRemarks', 'កំណត់ចំណាំផ្ទៃក្នុង & លក្ខខណ្ឌពិសេស')}
                  </h4>
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {supp.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FINANCIALS & AP CREDIT */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* Card 1: Bank Account Settlement Details */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <div className="pb-3 border-b border-border/80">
                  <h3 className="text-base font-bold text-foreground">
                    {t('suppliers.bankSettlementAccount', 'គណនីធនាគារទូទាត់ប្រាក់')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('suppliers.bankSettlementAccountDesc', 'គណនីធនាគារផ្លូវការសម្រាប់ផ្ទេរប្រាក់ និងទូទាត់វិក្កយបត្រ')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.bankName', 'ឈ្មោះធនាគារ')}
                    </span>
                    <p className="font-bold text-foreground text-sm">{supp.bank_name || '—'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.bankAccountName', 'ឈ្មោះម្ចាស់គណនី')}
                    </span>
                    <p className="font-bold text-foreground text-sm uppercase">{supp.bank_account_name || supp.name}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.bankAccountNumber', 'លេខគណនីធនាគារ')}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground text-sm">
                        {supp.bank_account_number || '—'}
                      </span>
                      {supp.bank_account_number && (
                        <button
                          type="button"
                          onClick={() => handleCopy(supp.bank_account_number, 'bank_acc')}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                          title={t('suppliers.copy', 'ចម្លង')}
                        >
                          {copiedKey === 'bank_acc' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.swiftCode', 'កូដ SWIFT / Routing')}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-foreground text-sm uppercase">
                        {supp.swift_code || '—'}
                      </span>
                      {supp.swift_code && (
                        <button
                          type="button"
                          onClick={() => handleCopy(supp.swift_code, 'swift')}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                          title={t('suppliers.copy', 'ចម្លង')}
                        >
                          {copiedKey === 'swift' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Commercial AP Terms & Settlement Conditions */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <div className="pb-3 border-b border-border/80">
                  <h3 className="text-base font-bold text-foreground">
                    {t('suppliers.apCreditTerms', 'លក្ខខណ្ឌឥណទានពាណិជ្ជកម្ម (AP)')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('suppliers.apCreditTermsDesc', 'កាលកំណត់ទូទាត់វិក្កយបត្រ និងរយៈពេលដឹកជញ្ជូនដែលបានព្រមព្រៀង')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.paymentTerms', 'លក្ខខណ្ឌទូទាត់')}
                    </span>
                    <p className="font-bold text-foreground text-sm">{supp.payment_terms || 'Net 30'}</p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {supp.payment_term_days ?? 30} {t('suppliers.days', 'ថ្ងៃ')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.leadTimeDays', 'រយៈពេលដឹកជញ្ជូន')}
                    </span>
                    <p className="font-bold text-foreground text-sm">
                      {supp.lead_time_days ?? 3} {t('suppliers.days', 'ថ្ងៃ')}
                    </p>
                    <span className="text-[10px] text-muted-foreground">គិតចាប់ពីពេលចេញ PO</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {t('suppliers.currency', 'រូបិយប័ណ្ណទូទាត់')}
                    </span>
                    <p className="font-mono font-bold text-foreground text-sm">{supp.currency_code || 'USD'}</p>
                    <span className="text-[10px] text-muted-foreground">រូបិយប័ណ្ណប្រតិបត្តិការចម្បង</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PURCHASE ORDERS HISTORY */}
          {activeTab === 'purchases' && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {t('suppliers.tabPurchases', 'ប្រវត្តិបញ្ជាទិញ')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('suppliers.purchasesDesc', 'បញ្ជីកត់ត្រាការបញ្ជាទិញទាំងអស់ដែលបានចេញទៅកាន់អ្នកផ្គត់ផ្គង់នេះ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/purchases/create?supplier_id=${supp.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <Plus size={13} />
                  <span>{t('suppliers.createPO', 'បង្កើតការបញ្ជាទិញ')}</span>
                </button>
              </div>

              {(!supp.recent_purchases || supp.recent_purchases.length === 0) ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-foreground">
                    {t('suppliers.noPurchases', 'មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ')}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    {t('suppliers.noPurchasesDesc', 'លោកអ្នកមិនទាន់បានបង្កើតការបញ្ជាទិញណាមួយសម្រាប់អ្នកផ្គត់ផ្គង់នេះនៅឡើយទេ។')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3.5">{t('purchases.referenceNumber', 'លេខកូដ PO')}</th>
                        <th className="py-2.5 px-3.5">{t('purchases.date', 'កាលបរិច្ឆេទ')}</th>
                        <th className="py-2.5 px-3.5">{t('purchases.destination', 'សាខា / ឃ្លាំង')}</th>
                        <th className="py-2.5 px-3.5 text-right">{t('purchases.grandTotal', 'សរុបរួម')}</th>
                        <th className="py-2.5 px-3.5 text-right">{t('purchases.paidAmount', 'បានបង់')}</th>
                        <th className="py-2.5 px-3.5 text-right">{t('purchases.dueAmount', 'ជំពាក់')}</th>
                        <th className="py-2.5 px-3.5 text-center">{t('purchases.paymentStatus', 'ការទូទាត់')}</th>
                        <th className="py-2.5 px-3.5 text-center">{t('purchases.status', 'ស្ថានភាព')}</th>
                        <th className="py-2.5 px-3.5 text-center">{t('common.actions', 'សកម្មភាព')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {supp.recent_purchases.map((po) => (
                        <tr key={po.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-foreground">
                            <Link
                              to={`/purchases/${po.id}`}
                              className="hover:text-primary transition-colors inline-flex items-center gap-1"
                            >
                              <span>{po.reference_number}</span>
                              <ExternalLink size={10} className="text-muted-foreground" />
                            </Link>
                          </td>
                          <td className="py-3 px-3.5 text-muted-foreground whitespace-nowrap">
                            {formatDate(po.date)}
                          </td>
                          <td className="py-3 px-3.5 text-muted-foreground truncate max-w-[160px]">
                            {po.branch_name || po.warehouse_name || 'Main Warehouse'}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground">
                            ${Number(po.grand_total).toFixed(2)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            ${Number(po.paid_amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-semibold">
                            {Number(po.due_amount) > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400">
                                ${Number(po.due_amount).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">$0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                po.payment_status === 'paid'
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                  : po.payment_status === 'partial'
                                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                              }`}
                            >
                              {po.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-foreground border border-border">
                              {po.status}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <Link
                              to={`/purchases/${po.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                            >
                              <Eye size={12} />
                              <span>{t('common.view', 'មើល')}</span>
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

          {/* TAB 4: SUPPLIED PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
              <div className="pb-3 border-b border-border/80">
                <h3 className="text-base font-bold text-foreground">
                  {t('suppliers.tabProducts', 'កាតាឡុកទំនិញ')}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('suppliers.productsDesc', 'បញ្ជីមុខទំនិញ និង SKU ដែលបានបញ្ជាទិញពីអ្នកផ្គត់ផ្គង់នេះ')}
                </p>
              </div>

              {(!supp.supplied_products || supp.supplied_products.length === 0) ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-foreground">
                    {t('suppliers.noSuppliedProducts', 'មិនទាន់មានទិន្នន័យទំនិញផ្គត់ផ្គង់ទេ')}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    {t('suppliers.noSuppliedProductsDesc', 'មុខទំនិញនឹងត្រូវកត់ត្រាដោយស្វ័យប្រវត្តិនៅពេលទទួលទំនិញពី PO។')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3.5">{t('inventory.product', 'ទំនិញ')}</th>
                        <th className="py-2.5 px-3.5">{t('inventory.sku', 'កូដទំនិញ (SKU)')}</th>
                        <th className="py-2.5 px-3.5">{t('inventory.category', 'ប្រភេទ')}</th>
                        <th className="py-2.5 px-3.5 text-right">{t('purchases.lastCost', 'តម្លៃទិញចុងក្រោយ')}</th>
                        <th className="py-2.5 px-3.5 text-right">{t('purchases.totalQty', 'បរិមាណទិញសរុប')}</th>
                        <th className="py-2.5 px-3.5 text-right">{t('purchases.lastPurchased', 'ទិញចុងក្រោយ')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {supp.supplied_products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-foreground">
                            {prod.name}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-muted-foreground">
                            <div>{prod.sku}</div>
                            {prod.barcode && <div className="text-[10px] opacity-75">{prod.barcode}</div>}
                          </td>
                          <td className="py-3 px-3.5 text-muted-foreground">
                            {prod.category_name || 'General'}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground">
                            ${Number(prod.last_cost).toFixed(2)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-semibold">
                            {Number(prod.total_qty).toLocaleString()}
                          </td>
                          <td className="py-3 px-3.5 text-right text-muted-foreground whitespace-nowrap">
                            {formatDate(prod.last_purchased)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PERFORMANCE & SLA */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Card 1: SLA Performance Reliability Scores */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <div className="pb-3 border-b border-border/80">
                  <h3 className="text-base font-bold text-foreground">
                    {t('suppliers.operationalSla', 'ការវាយតម្លៃប្រសិទ្ធភាព និងកិច្ចព្រមព្រៀង SLA')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('suppliers.slaDesc', 'កម្រិតទំនុកចិត្តលើការដឹកជញ្ជូនទាន់ពេល និងអត្រាផ្គត់ផ្គង់ពេញលេញ')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t('suppliers.fulfillmentRate', 'អត្រាផ្គត់ផ្គង់ពេញលេញ')}
                    </span>
                    <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">98.5%</p>
                    <span className="text-[10px] text-muted-foreground">ទំនិញត្រូវបានដឹកជញ្ជូនគ្រប់ចំនួន</span>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {t('suppliers.onTimeRate', 'អត្រាដឹកជញ្ជូនទាន់ពេល')}
                    </span>
                    <p className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">96.0%</p>
                    <span className="text-[10px] text-muted-foreground">មកដល់តាមកាលបរិច្ឆេទសន្យា</span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      {t('suppliers.returnRate', 'ការប្រគល់ទំនិញត្រឡប់')}
                    </span>
                    <p className="text-2xl font-black font-mono text-foreground">
                      {supp.returns_count ?? 0}
                    </p>
                    <span className="text-[10px] text-muted-foreground">ករណីខូចខាត ឬប្រគល់ត្រឡប់</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Internal Commercial Notes */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
                <div className="pb-3 border-b border-border/80">
                  <h3 className="text-base font-bold text-foreground">
                    {t('suppliers.internalRemarks', 'កំណត់ចំណាំផ្ទៃក្នុង & លក្ខខណ្ឌពិសេស')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('suppliers.internalRemarksDesc', 'កំណត់ត្រាពាណិជ្ជកម្ម និងកិច្ចព្រមព្រៀងផ្ទៃក្នុង')}
                  </p>
                </div>

                {supp.notes ? (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {supp.notes}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-4">
                    {t('suppliers.noNotesDesc', 'មិនមានកំណត់ចំណាំ ឬលក្ខខណ្ឌពិសេសបន្ថែមសម្រាប់អ្នកផ្គត់ផ្គង់នេះទេ។')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (lg:col-span-1): SIDEBAR ────────────────────────── */}
        <div className="space-y-6">
          {/* Widget 1: Profile & Clean Communication Actions */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-5">
            <div className="flex flex-col items-center text-center pb-5 border-b border-border/80">
              <div className="relative mb-3">
                <SupplierLogo
                  logo={supp.logo}
                  name={supp.name}
                  size={80}
                  className="rounded-2xl border-2 border-background shadow-md"
                />
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${
                    supp.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </div>

              <h3 className="text-base font-bold text-foreground">{supp.name}</h3>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{supp.code}</p>

              <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                {getTierBadge(supp.tier)}
                {getTypeBadge(supp.supplier_type)}
              </div>

              {/* Standard Communication Actions: Phone, Email, Website, Edit */}
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                {supp.phone && (
                  <a
                    href={`tel:${supp.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs"
                  >
                    <Phone size={13} />
                    <span>{t('suppliers.callAction', 'ទូរស័ព្ទ')}</span>
                  </a>
                )}

                {supp.email && (
                  <a
                    href={`mailto:${supp.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs"
                  >
                    <Mail size={13} />
                    <span>{t('suppliers.emailAction', 'អ៊ីមែល')}</span>
                  </a>
                )}

                {supp.website && (
                  <a
                    href={supp.website.startsWith('http') ? supp.website : `https://${supp.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs"
                  >
                    <Globe size={13} />
                    <span>{t('suppliers.websiteAction', 'គេហទំព័រ')}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/suppliers/${supp.id}/edit`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>{t('suppliers.editAction', 'កែសម្រួល')}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {t('suppliers.totalPOsCount', 'ការបញ្ជាទិញសរុប')}
                </span>
                <span className="text-base font-black font-mono text-foreground mt-0.5 block">
                  {purchasesCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  {t('suppliers.lifetimeSpend', 'ការចំណាយសរុប')}
                </span>
                <span className="text-base font-black font-mono text-primary mt-0.5 block">
                  ${totalPurchased.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Widget 2: Location & Physical Warehouse */}
          <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-4">
            <div className="pb-3 border-b border-border/80">
              <h3 className="text-sm font-bold text-foreground">
                {t('suppliers.locationWarehouse', 'ទីតាំង & ឃ្លាំងទំនិញ')}
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2.5">
              <p className="text-xs text-foreground font-medium leading-relaxed">
                {fullAddress || t('suppliers.noAddress', 'មិនទាន់មានអាសយដ្ឋានជាក់លាក់នៅឡើយទេ។')}
              </p>

              {fullAddress && (
                <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => handleCopy(fullAddress, 'sidebar_addr')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    {copiedKey === 'sidebar_addr' ? (
                      <Check size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                    <span>{t('suppliers.copy', 'ចម្លង')}</span>
                  </button>

                  <span className="text-border">·</span>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('suppliers.openMap', 'មើលលើផែនទី')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Widget 3: Key Primary Representative */}
          {primaryContact && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('suppliers.primaryAccountContact', 'តំណាងទំនាក់ទំនងចម្បង')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {t('suppliers.primary', 'ចម្បង')}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm shrink-0">
                  {primaryContact.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-sm truncate">{primaryContact.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {primaryContact.title || primaryContact.position || t('suppliers.accountManager', 'អ្នកគ្រប់គ្រងគណនី')}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-xs">
                {primaryContact.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('suppliers.phone', 'ទូរស័ព្ទ')}:</span>
                    <a href={`tel:${primaryContact.phone}`} className="font-mono font-semibold text-primary hover:underline">
                      {primaryContact.phone}
                    </a>
                  </div>
                )}
                {primaryContact.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('suppliers.email', 'អ៊ីមែល')}:</span>
                    <a href={`mailto:${primaryContact.email}`} className="text-primary hover:underline truncate max-w-[170px]">
                      {primaryContact.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Widget 4: Quick Bank Account Summary */}
          {supp.bank_name && (
            <div className="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-3">
              <div className="pb-2 border-b border-border/80">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('suppliers.quickBankSummary', 'គណនីធនាគារសង្ខេប')}
                </span>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('suppliers.bankName', 'ធនាគារ')}:</span>
                  <span className="font-bold text-foreground">{supp.bank_name}</span>
                </div>
                {supp.bank_account_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('suppliers.bankAccountNumber', 'លេខគណនី')}:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground">{supp.bank_account_number}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(supp.bank_account_number, 'side_bank_acc')}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title={t('suppliers.copy', 'ចម្លង')}
                      >
                        {copiedKey === 'side_bank_acc' ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>
                )}
                {supp.swift_code && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">SWIFT:</span>
                    <span className="font-mono font-semibold text-foreground uppercase">{supp.swift_code}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupplierDetailPage
