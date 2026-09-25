import React from 'react'
import { useTranslation } from 'react-i18next'
import { Truck, Wallet, ShoppingCart, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react'
import { EnterpriseStatsCard, EnterpriseStatsGrid } from '@/components/common'
import type { Supplier } from '../types/supplier.types'

interface SuppliersStatsCardsProps {
  suppliers: Supplier[]
  reportData?: any
  totalSuppliersCount?: number
}

export const SuppliersStatsCards: React.FC<SuppliersStatsCardsProps> = ({
  suppliers,
  reportData,
  totalSuppliersCount,
}) => {
  const { t } = useTranslation(['suppliers', 'common'])

  const count = totalSuppliersCount ?? suppliers.length
  
  // Prefer reportData summary if provided, otherwise compute accurately
  const reportActiveCount = reportData?.summary?.active_count ?? reportData?.active_count
  const reportInactiveCount = reportData?.summary?.inactive_count ?? reportData?.inactive_count

  let activeCount: number
  let inactiveCount: number

  if (reportActiveCount !== undefined && reportActiveCount !== null) {
    activeCount = Number(reportActiveCount)
    inactiveCount = reportInactiveCount !== undefined ? Number(reportInactiveCount) : Math.max(0, count - activeCount)
  } else if (suppliers.length > 0) {
    const pageActive = suppliers.filter(s => s.is_active).length
    if (count === suppliers.length) {
      activeCount = pageActive
      inactiveCount = suppliers.length - activeCount
    } else {
      // Proportionally calculate based on page sample
      const ratio = pageActive / suppliers.length
      activeCount = Math.round(count * ratio)
      inactiveCount = Math.max(0, count - activeCount)
    }
  } else {
    activeCount = 0
    inactiveCount = 0
  }

  // Total Procurement Volume
  const reportTotalPurchases = Number(reportData?.summary?.total_purchases ?? reportData?.total_purchases ?? 0)
  const listTotalPurchases = suppliers.reduce((sum, s) => sum + (Number(s.total_purchases_sum ?? s.total_purchased) || 0), 0)
  const totalVolume = reportTotalPurchases > 0 ? reportTotalPurchases : listTotalPurchases

  // Total Outstanding AP Debt
  const reportTotalDue = Number(reportData?.summary?.total_due ?? reportData?.total_due ?? 0)
  const listTotalDue = suppliers.reduce((sum, s) => sum + (Number(s.total_due_sum ?? s.total_due ?? s.outstanding_balance) || 0), 0)
  const totalDueAmount = reportTotalDue > 0 ? reportTotalDue : listTotalDue

  // Total POs
  const reportPoCount = Number(reportData?.summary?.total_purchases_count ?? reportData?.purchases_count ?? 0)
  const listPoCount = suppliers.reduce((sum, s) => sum + (Number(s.purchases_count) || 0), 0)
  const totalPos = reportPoCount > 0 ? reportPoCount : listPoCount

  return (
    <EnterpriseStatsGrid columns={4} className="print:hidden">
      {/* Card 1: Total Suppliers */}
      <EnterpriseStatsCard
        title={t('suppliers.totalSuppliers', 'Total Suppliers')}
        value={count}
        subtitle={
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {activeCount} {t('suppliers.active', 'Active')}
            </span>
            <span>•</span>
            <span className="text-muted-foreground">
              {inactiveCount} {t('suppliers.inactive', 'Inactive')}
            </span>
          </span>
        }
        icon={Truck}
        variant="blue"
      />

      {/* Card 2: Procurement Volume */}
      <EnterpriseStatsCard
        title={t('suppliers.procurementVolume', 'Total Procurement Volume')}
        value={totalVolume}
        prefix="$"
        decimals={2}
        subtitle={t('suppliers.acrossSupplyChain', 'Across enterprise supply chain')}
        icon={Wallet}
        variant="purple"
        delay={0.05}
      />

      {/* Card 3: Outstanding AP Debt (បំណុលជំពាក់សរុប) */}
      <EnterpriseStatsCard
        title={t('suppliers.outstandingPayment', 'Outstanding AP Debt')}
        value={totalDueAmount}
        prefix="$"
        decimals={2}
        valueClassName="text-rose-600 dark:text-rose-400"
        subtitle={
          totalDueAmount > 0 ? (
            <span className="flex items-center gap-1 text-rose-500 font-semibold">
              <AlertTriangle size={12} className="text-rose-500 shrink-0" />
              {t('suppliers.unpaidInvoices', 'Pending AP Invoices')}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              {t('suppliers.allPaid', 'All accounts balanced')}
            </span>
          )
        }
        icon={DollarSign}
        variant="rose"
        delay={0.1}
      />

      {/* Card 4: Total POs & Fulfillment */}
      <EnterpriseStatsCard
        title={t('suppliers.totalPOs', 'Total POs Issued')}
        value={totalPos}
        valueClassName="text-emerald-600 dark:text-emerald-400"
        subtitle={
          <span className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 size={12} className="text-emerald-500" />
            {t('suppliers.ordersFulfilled', 'Orders fulfilled')}
          </span>
        }
        icon={ShoppingCart}
        variant="emerald"
        delay={0.15}
      />
    </EnterpriseStatsGrid>
  )
}
