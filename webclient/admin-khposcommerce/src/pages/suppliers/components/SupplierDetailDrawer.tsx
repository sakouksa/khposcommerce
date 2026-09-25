import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Truck, Mail, Phone, MapPin, Edit2, Copy, Check,
  CreditCard, FileText, User, ExternalLink, Globe,
  Building2, ShieldCheck, ShoppingCart,
  Package, Award, DollarSign, Plus
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getAbsoluteImageUrl } from '@/utils/image'
import { supplierService } from '@/services/supplierService'
import { 
  StatusBadge, 
  DetailDrawer, 
  DetailDrawerHeader, 
  DetailDrawerTabNav, 
  DetailDrawerBody, 
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
  ActionButton,
  CancelButton,
  SupplierLogo,
} from '@/components/common'
import type { Supplier } from '../types/supplier.types'

interface SupplierDetailDrawerProps {
  supplier: Supplier | null
  onClose: () => void
  onOpenEdit: (s: Supplier) => void
}

type TabKey = 'overview' | 'financials' | 'purchases' | 'products' | 'performance'

export const SupplierDetailDrawer: React.FC<SupplierDetailDrawerProps> = ({
  supplier,
  onClose,
  onOpenEdit,
}) => {
  const { t } = useTranslation(['suppliers', 'common', 'nav', 'inventory', 'purchases'])
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Fetch full details whenever drawer opens for a supplier
  const { data: fullSupplierData, isLoading } = useQuery({
    queryKey: ['supplier-detail', supplier?.id],
    queryFn: async () => {
      return supplierService.show(supplier!.id)
    },
    enabled: !!supplier?.id,
    staleTime: 30000,
  })

  if (!supplier) return null

  const supp: Supplier = fullSupplierData || supplier

  const handleCopy = (text: string, key: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const tabs = [
    {
      key: 'overview',
      label: t('suppliers.tabGeneral', 'General & Contact'),
      icon: Building2,
    },
    {
      key: 'financials',
      label: t('suppliers.tabBanking', 'Finance & AP Credit'),
      icon: CreditCard,
    },
    {
      key: 'purchases',
      label: t('suppliers.tabPurchases', 'Purchase Orders'),
      icon: ShoppingCart,
      badge: supp?.purchases_count || supp?.recent_purchases?.length || 0,
    },
    {
      key: 'products',
      label: t('suppliers.tabProducts', 'Supplied Products'),
      icon: Package,
      badge: supp?.supplied_products?.length || 0,
    },
    {
      key: 'performance',
      label: t('suppliers.tabPerformance', 'Performance & Terms'),
      icon: Award,
    },
  ]

  const totalPurchased = Number(supp.total_purchases_sum ?? supp.total_purchased ?? 0)
  const totalPaid = Number(supp.total_paid_sum ?? supp.total_paid ?? 0)
  const totalDue = Number(supp.total_due_sum ?? supp.total_due ?? supp.outstanding_balance ?? 0)
  const creditLimit = Number(supp.credit_limit ?? 0)
  const creditUsedPercent = creditLimit > 0 ? Math.min(100, Math.round((totalDue / creditLimit) * 100)) : 0

  return (
    <DetailDrawer
      isOpen={!!supp}
      onClose={onClose}
      size="2xl"
    >
      {/* ─── GLOBAL HEADER ─── */}
      <DetailDrawerHeader
        title={supp.name}
        subtitle={
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-mono">
            <span>{supp.code}</span>
            <button
              type="button"
              onClick={() => handleCopy(supp.code, 'code')}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={t('common.copy', 'Copy Code')}
            >
              {copiedKey === 'code' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
          </div>
        }
        badge={<StatusBadge status={supp.is_active ? 'active' : 'inactive'} />}
        onClose={onClose}
      />

      {/* ─── GLOBAL TAB NAVIGATION ─── */}
      <DetailDrawerTabNav
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      />

      {/* ─── GLOBAL BODY CONTENT ─── */}
      <DetailDrawerBody isLoading={isLoading}>
        {/* HERO VENDOR SUMMARY BANNER */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-purple-500/5 border border-primary/20 shadow-2xs relative overflow-hidden space-y-4">
          <div className="flex items-center gap-4 min-w-0">
            <SupplierLogo
              logo={supp.logo}
              name={supp.name}
              size={64}
              className="rounded-2xl border-2 border-primary/30 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-base text-foreground truncate">{supp.name}</h4>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {supp.tier === 'strategic' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Award size={11} />
                    {t('suppliers.strategicPartner', 'Strategic Partner')}
                  </span>
                )}
                {supp.tier === 'preferred' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck size={11} />
                    {t('suppliers.preferred', 'Preferred Supplier')}
                  </span>
                )}
                {supp.supplier_type && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-background/80 border border-border text-foreground uppercase tracking-wider">
                    {t(`suppliers.${supp.supplier_type}`, supp.supplier_type.replace('_', ' '))}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics KPI Grid */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40">
            <div className="p-2.5 rounded-xl bg-background/60 dark:bg-slate-900/60 border border-border/50 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold block">{t('suppliers.tablePurchases', 'Total Purchased')}</span>
              <span className="text-xs font-bold text-foreground font-mono mt-0.5 block">
                ${totalPurchased.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-background/60 dark:bg-slate-900/60 border border-border/50 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold block">{t('suppliers.paid', 'Total Paid')}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-background/60 dark:bg-slate-900/60 border border-border/50 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold block">{t('suppliers.tableDue', 'Outstanding AP')}</span>
              <span className={`text-xs font-black font-mono mt-0.5 block ${totalDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* ─── TAB 1: OVERVIEW & CONTACT ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* General Company Information */}
            <DetailDrawerCard
              title={t('suppliers.tabGeneral', 'General Company Information')}
            >
              <div className="space-y-0.5">
                <DetailDrawerRow
                  label={t('suppliers.name', 'Company Name')}
                  value={supp.name}
                />
                <DetailDrawerRow
                  label={t('suppliers.code', 'Supplier Code')}
                  value={supp.code}
                  copyable
                />
                <DetailDrawerRow
                  label={t('suppliers.taxNumber', 'Tax Number')}
                  value={supp.tax_number || '—'}
                  copyable={!!supp.tax_number}
                />
                <DetailDrawerRow
                  label={t('suppliers.supplierType', 'Supplier Type')}
                  value={supp.supplier_type ? t(`suppliers.${supp.supplier_type}`, supp.supplier_type.replace('_', ' ')) : '—'}
                />
                <DetailDrawerRow
                  label={t('suppliers.status', 'Operational Status')}
                  value={
                    <span className={`font-bold ${supp.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {supp.is_active ? t('suppliers.active', 'Active') : t('suppliers.inactive', 'Inactive')}
                    </span>
                  }
                />
              </div>
            </DetailDrawerCard>

            {/* Official Contact Channels */}
            <DetailDrawerCard
              title={t('suppliers.tabContact', 'Official Contact Channels')}
            >
              <div className="space-y-0.5">
                <DetailDrawerRow
                  label={t('suppliers.email', 'Primary Email')}
                  value={supp.email || '—'}
                  copyable={!!supp.email}
                />
                <DetailDrawerRow
                  label={t('suppliers.phone', 'Phone Number')}
                  value={supp.phone || '—'}
                  copyable={!!supp.phone}
                />
                {supp.hotline && (
                  <DetailDrawerRow
                    label={t('suppliers.hotline', 'Emergency Hotline')}
                    value={supp.hotline}
                    copyable
                  />
                )}
                {supp.website && (
                  <DetailDrawerRow
                    label={t('suppliers.website', 'Official Website')}
                    value={
                      <a
                        href={supp.website.startsWith('http') ? supp.website : `https://${supp.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <span>{supp.website}</span>
                        <ExternalLink size={11} />
                      </a>
                    }
                  />
                )}
              </div>
            </DetailDrawerCard>

            {/* Location & Physical Address */}
            <DetailDrawerCard
              title={t('suppliers.tabLocation', 'Location & Freight Address')}
            >
              <div className="space-y-0.5">
                <DetailDrawerRow
                  label={t('suppliers.address', 'Street Address / Building')}
                  value={supp.address || '—'}
                />
                <DetailDrawerRow
                  label={t('suppliers.city', 'City')}
                  value={supp.city || '—'}
                />
                <DetailDrawerRow
                  label={t('suppliers.province', 'State / Province')}
                  value={supp.province || '—'}
                />
                <DetailDrawerRow
                  label={t('suppliers.country', 'Country')}
                  value={supp.country || '—'}
                />
                <DetailDrawerRow
                  label={t('suppliers.postalCode', 'Postal Code')}
                  value={supp.postal_code || '—'}
                  copyable={!!supp.postal_code}
                />
              </div>
            </DetailDrawerCard>

            {/* Representatives */}
            {supp.contacts && supp.contacts.length > 0 && (
              <DetailDrawerCard
                title={t('suppliers.tabRepresentatives', 'Key Representatives')}
                badge={
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                    {supp.contacts.length}
                  </span>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {supp.contacts.map((c, idx) => (
                    <div key={idx} className="p-3 bg-muted/20 dark:bg-slate-800/50 border border-border/60 dark:border-slate-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{c.name}</span>
                        {c.is_primary && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {t('common.primary', 'Primary')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-primary font-medium block">{c.title || c.position || 'Representative'}</span>
                      <div className="text-[11px] text-muted-foreground space-y-0.5 font-mono">
                        {c.phone && <div className="flex items-center gap-1"><Phone size={10} /> {c.phone}</div>}
                        {c.email && <div className="flex items-center gap-1"><Mail size={10} /> {c.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </DetailDrawerCard>
            )}
          </div>
        )}

        {/* ─── TAB 2: FINANCIALS & AP CREDIT ─── */}
        {activeTab === 'financials' && (
          <div className="space-y-4">
            {/* Credit Limit & Debt Gauge */}
            <DetailDrawerCard
              title={t('suppliers.creditFacility', 'Accounts Payable & Credit Facility')}
              icon={<DollarSign size={15} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-muted/20 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800">
                  <span className="text-[10px] text-muted-foreground font-semibold block">{t('suppliers.creditLimit', 'Credit Limit')}</span>
                  <span className="text-base font-black text-foreground font-mono mt-0.5 block">
                    ${creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{t('suppliers.approvedTerms', 'Approved trade credit')}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/20 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">{t('suppliers.outstandingPayment', 'Current AP Debt')}</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
                    ${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{t('suppliers.pendingInvoices', 'Unpaid supplier invoices')}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/20 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">{t('suppliers.availableCredit', 'Available Credit')}</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                    ${Math.max(0, creditLimit - totalDue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{t('suppliers.remainingPurchasingPower', 'Remaining purchasing capacity')}</span>
                </div>
              </div>

              {/* Progress Bar */}
              {creditLimit > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">{t('suppliers.creditUtilization', 'Credit Utilization')}</span>
                    <span className="font-mono font-bold text-foreground">{creditUsedPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        creditUsedPercent > 90 ? 'bg-rose-500' : creditUsedPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, creditUsedPercent)}%` }}
                    />
                  </div>
                </div>
              )}
            </DetailDrawerCard>

            {/* Banking Details */}
            <DetailDrawerCard
              title={t('suppliers.tabBanking', 'Bank Account & Wire Transfer Remittance')}
            >
              <div className="space-y-0.5">
                <DetailDrawerRow
                  label={t('suppliers.bankName', 'Bank Name')}
                  value={supp.bank_name || '—'}
                />
                <DetailDrawerRow
                  label={t('suppliers.bankAccountNumber', 'Account Number')}
                  value={supp.bank_account_number || '—'}
                  copyable={!!supp.bank_account_number}
                />
                <DetailDrawerRow
                  label={t('suppliers.bankAccountName', 'Beneficiary Account Name')}
                  value={supp.bank_account_name || '—'}
                />
                <DetailDrawerRow
                  label={t('suppliers.swiftCode', 'SWIFT / BIC Code')}
                  value={supp.swift_code || '—'}
                  copyable={!!supp.swift_code}
                />
                <DetailDrawerRow
                  label={t('suppliers.currency', 'Settlement Currency')}
                  value={
                    <span className="font-bold text-primary font-mono">
                      {supp.currency_code || supp.currency || 'USD'}
                    </span>
                  }
                />
                <DetailDrawerRow
                  label={t('suppliers.paymentTerms', 'Payment Terms')}
                  value={supp.payment_terms || 'Net 30'}
                />
              </div>
            </DetailDrawerCard>
          </div>
        )}

        {/* ─── TAB 3: PURCHASE ORDERS HISTORY ─── */}
        {activeTab === 'purchases' && (
          <div className="space-y-4">
            <DetailDrawerCard
              title={t('suppliers.recentPurchaseOrders', 'Recent Purchase Orders (POs)')}
              action={
                <ActionButton
                  size="sm"
                  variant="primary"
                  icon={<Plus size={13} />}
                  label={t('suppliers.newPO', 'New PO')}
                  onClick={() => {
                    onClose()
                    navigate(`/purchases/create?supplier_id=${supp.id}`)
                  }}
                />
              }
            >
              {supp.recent_purchases && supp.recent_purchases.length > 0 ? (
                <div className="border border-border/70 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 dark:bg-slate-800/60 border-b border-border/70 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground">{t('purchases.reference', 'PO Ref')}</th>
                        <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground">{t('purchases.date', 'Date')}</th>
                        <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground">{t('purchases.status', 'Status')}</th>
                        <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground">{t('purchases.grandTotal', 'Total')}</th>
                        <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground">{t('purchases.dueAmount', 'Due')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 dark:divide-slate-800/60">
                      {supp.recent_purchases.map((po) => (
                        <tr
                          key={po.id}
                          className="hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                          onClick={() => {
                            onClose()
                            navigate(`/purchases`)
                          }}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-primary">
                            {po.reference_number}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground font-mono whitespace-nowrap">
                            {po.date || '—'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              po.status === 'received'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : po.status === 'ordered'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                            ${po.grand_total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            {po.due_amount > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400 font-black">
                                ${po.due_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">$0.00</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border/80 dark:border-slate-800 rounded-xl bg-muted/10">
                  <p className="text-xs font-semibold text-foreground">
                    {t('suppliers.noPOsYet', 'No purchase orders recorded yet.')}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t('suppliers.createFirstPO', 'Create a purchase order to start tracking procurement and inventory receipts.')}
                  </p>
                </div>
              )}
            </DetailDrawerCard>
          </div>
        )}

        {/* ─── TAB 4: SUPPLIED PRODUCTS ─── */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <DetailDrawerCard
              title={t('suppliers.tabProducts', 'Sourced Products & Item Catalog')}
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  {supp.supplied_products?.length || 0}
                </span>
              }
            >
              {supp.supplied_products && supp.supplied_products.length > 0 ? (
                <div className="border border-border/70 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 dark:bg-slate-800/60 border-b border-border/70 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground">{t('inventory.product', 'Product')}</th>
                        <th className="py-2.5 px-3 text-left font-semibold text-muted-foreground">{t('inventory.sku', 'SKU')}</th>
                        <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground">{t('inventory.cost', 'Last Cost')}</th>
                        <th className="py-2.5 px-3 text-right font-semibold text-muted-foreground">{t('inventory.totalQty', 'Total Qty Sourced')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 dark:divide-slate-800/60">
                      {supp.supplied_products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-foreground text-xs">{prod.name}</div>
                            <span className="text-[10px] text-muted-foreground">{prod.category_name}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">
                            {prod.sku}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                            ${prod.last_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                            {prod.total_qty.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border/80 dark:border-slate-800 rounded-xl bg-muted/10">
                  <p className="text-xs font-semibold text-foreground">
                    {t('suppliers.noSuppliedProducts', 'No product catalog linked yet.')}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t('suppliers.productsAutoLinked', 'Products will be automatically linked as you issue purchase orders.')}
                  </p>
                </div>
              )}
            </DetailDrawerCard>
          </div>
        )}

        {/* ─── TAB 5: PERFORMANCE & TERMS ─── */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            {/* Vendor Scorecard */}
            <DetailDrawerCard
              title={t('suppliers.vendorScorecard', 'Vendor Quality & SLA Scorecard')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-muted/20 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800">
                  <span className="text-[10px] text-muted-foreground font-semibold block">{t('suppliers.onTimeDelivery', 'On-Time Delivery Rate')}</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                    {supp.performance?.on_time_rate ?? 96.0}%
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{t('suppliers.highPunctuality', 'High delivery punctuality')}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/20 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800">
                  <span className="text-[10px] text-muted-foreground font-semibold block">{t('suppliers.fulfillmentAccuracy', 'Fulfillment Accuracy')}</span>
                  <span className="text-lg font-black text-primary font-mono mt-0.5 block">
                    {supp.performance?.fulfillment_rate ?? 98.5}%
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{t('suppliers.minimalDefects', 'Minimal inventory discrepancies')}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/20 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800">
                  <span className="text-[10px] text-muted-foreground font-semibold block">{t('suppliers.averageLeadTime', 'Average Lead Time')}</span>
                  <span className="text-lg font-black text-foreground font-mono mt-0.5 block">
                    {supp.lead_time_days ?? 3} {t('suppliers.days', 'Days')}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">{t('suppliers.leadTimeSLA', 'Standard order to delivery SLA')}</span>
                </div>
              </div>
            </DetailDrawerCard>

            {/* Notes & Supply Agreements */}
            <DetailDrawerCard
              title={t('suppliers.tabTerms', 'Notes & Supply Agreements')}
            >
              {supp.notes ? (
                <div className="p-3.5 rounded-xl bg-muted/20 dark:bg-slate-800/40 border border-border/60 dark:border-slate-800">
                  <p className="text-foreground leading-relaxed text-xs whitespace-pre-wrap font-medium">
                    {supp.notes}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-border/80 dark:border-slate-800 rounded-xl bg-muted/10">
                  <FileText size={28} className="mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {t('suppliers.noNotes', 'No supply agreements or special terms noted.')}
                  </p>
                </div>
              )}
            </DetailDrawerCard>

            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border border-primary/20 flex items-start gap-3">
              <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {t('suppliers.procurementPartner', 'Enterprise Supply Chain Verification')}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {t('suppliers.guidelineText', 'This vendor profile is integrated with real-time accounts payable, automated purchase order generation, and multi-warehouse restocking.')}
                </p>
              </div>
            </div>
          </div>
        )}
      </DetailDrawerBody>

      {/* ─── GLOBAL STICKY FOOTER ─── */}
      <DetailDrawerFooter
        rightActions={
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={onClose}
              label={t('common.close', 'Close')}
              variant="secondary"
            />
            <ActionButton
              onClick={() => {
                onClose()
                navigate(`/purchases/create?supplier_id=${supp.id}`)
              }}
              label={t('suppliers.createPO', 'Create PO')}
              icon={<ShoppingCart size={15} />}
              variant="emerald"
            />
            <ActionButton
              onClick={() => {
                const target = supp
                onClose()
                onOpenEdit(target)
              }}
              label={t('suppliers.editSupplier', 'Edit Supplier')}
              icon={<Edit2 size={15} />}
              variant="primary"
            />
          </div>
        }
      />
    </DetailDrawer>
  )
}

export default SupplierDetailDrawer
