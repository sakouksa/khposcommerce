import React from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, DollarSign, Wallet, Truck } from 'lucide-react'
import { EnterpriseStatsCard, EnterpriseStatsGrid } from '@/components/common'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import type { Purchase } from '../types/purchase.types'

interface PurchasesStatsCardsProps {
  reportData?: any
  purchases?: Purchase[]
  suppliersCount?: number
  totalOrdersCount?: number
  warehousesCount?: number
}

export const PurchasesStatsCards: React.FC<PurchasesStatsCardsProps> = ({
  reportData,
  purchases = [],
  suppliersCount = 0,
  totalOrdersCount = 0,
  warehousesCount = 0,
}) => {
  const { t } = useTranslation(['purchases', 'common'])

  // ─── Real-Time Business Calculations ────────────────────────────────────────
  const totalOrders = reportData?.purchases_count !== undefined
    ? Number(reportData.purchases_count)
    : (reportData?.total_orders !== undefined
      ? Number(reportData.total_orders)
      : (totalOrdersCount > 0 ? totalOrdersCount : purchases.length))

  const totalValue = reportData?.total_purchases !== undefined
    ? Number(reportData.total_purchases)
    : (reportData?.total_purchase_cost !== undefined
      ? Number(reportData.total_purchase_cost)
      : purchases.reduce((acc, p) => acc + Number(p.grand_total_base ?? p.grand_total ?? 0), 0))

  const totalPaid = reportData?.total_paid !== undefined
    ? Number(reportData.total_paid)
    : purchases.reduce((acc, p) => acc + Number(p.paid_amount_base ?? p.paid_amount ?? 0), 0)

  const totalDue = reportData?.total_due !== undefined
    ? Number(reportData.total_due)
    : (reportData?.outstanding_payments !== undefined
      ? Number(reportData.outstanding_payments)
      : Math.max(0, Math.round((totalValue - totalPaid) * 100) / 100))

  // Status counts
  const receivedCount = reportData?.received_count !== undefined
    ? Number(reportData.received_count)
    : purchases.filter(p => p.status === 'received' || p.status === 'completed').length

  const pendingCount = reportData?.pending_count !== undefined
    ? Number(reportData.pending_count)
    : purchases.filter(p => p.status === 'ordered' || p.status === 'partial' || p.status === 'draft').length

  const receivedRate = totalOrders > 0
    ? Math.round((receivedCount / totalOrders) * 100)
    : (purchases.length > 0 ? Math.round((receivedCount / purchases.length) * 100) : 100)

  const totalSuppliers = reportData?.total_suppliers !== undefined
    ? Number(reportData.total_suppliers)
    : (suppliersCount || (new Set(purchases.map(p => p.supplier?.id).filter(Boolean)).size) || 0)

  const totalItemsProcured = reportData?.items_purchased !== undefined
    ? Number(reportData.items_purchased)
    : (reportData?.total_items_sold !== undefined
      ? Number(reportData.total_items_sold)
      : purchases.reduce((sum, p) => sum + (p.items_count || p.items?.length || 0), 0))

  return (
    <EnterpriseStatsGrid columns={4} className="print:hidden">
      {/* ─── CARD 1: Total Purchases ─── */}
      <EnterpriseStatsCard
        title={t('purchases.totalPurchasesCard', 'ការបញ្ជាទិញសរុប')}
        value={totalOrders}
        subtitle={
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <AnimatedCounter value={receivedCount} /> {t('purchases.received', 'បានទទួល')}
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              <AnimatedCounter value={pendingCount} /> {t('purchases.pending', 'រង់ចាំ')}
            </span>
          </span>
        }
        icon={ShoppingCart}
        variant="primary"
      />

      {/* ─── CARD 2: Purchase Value ─── */}
      <EnterpriseStatsCard
        title={t('purchases.purchaseAmountCard', 'តម្លៃទិញសរុប')}
        value={totalValue}
        prefix="$"
        decimals={2}
        subtitle={
          <span className="text-xs text-muted-foreground truncate">
            <AnimatedCounter value={totalItemsProcured} /> {t('purchases.items', 'មុខទំនិញ')} • <AnimatedCounter value={totalOrders} /> {t('purchases.orders', 'ប័ណ្ណ')}
          </span>
        }
        icon={DollarSign}
        variant="emerald"
        delay={0.05}
      />

      {/* ─── CARD 3: Settlements & Outstanding ─── */}
      <EnterpriseStatsCard
        title={t('purchases.paymentStatusCard', 'ការទូទាត់ប្រាក់ & ជំពាក់')}
        value={totalPaid}
        prefix="$"
        decimals={2}
        subtitle={
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            {totalDue > 0 ? (
              <span className="text-rose-500 dark:text-rose-400 font-bold font-mono">
                {t('purchases.due', 'ជំពាក់')}: <AnimatedCounter value={totalDue} prefix="$" decimals={2} />
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {t('common.paid', 'ទូទាត់រួចរាល់')}
              </span>
            )}
          </span>
        }
        icon={Wallet}
        variant="indigo"
        delay={0.1}
      />

      {/* ─── CARD 4: Suppliers Network ─── */}
      <EnterpriseStatsCard
        title={t('purchases.suppliersCard', 'អ្នកផ្គត់ផ្គង់')}
        value={totalSuppliers}
        subtitle={
          <span className="text-xs text-muted-foreground truncate">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{receivedRate}%</span> {t('purchases.fulfillment', 'អត្រាទទួលទំនិញ')}
          </span>
        }
        icon={Truck}
        variant="blue"
        delay={0.15}
      />
    </EnterpriseStatsGrid>
  )
}

export default PurchasesStatsCards


