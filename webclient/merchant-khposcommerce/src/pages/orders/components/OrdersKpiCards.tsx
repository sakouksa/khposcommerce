import React from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Clock, Truck, DollarSign } from 'lucide-react'
import {
  EnterpriseStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'
import { useThemeStore } from '@/stores/themeStore'

const KHR_RATE = 4100

export interface OrdersStatsData {
  total_orders: number
  total_revenue: number
  pending_count: number
  processing_count: number
  shipped_count: number
  completed_count: number
  cancelled_count: number
  unpaid_count: number
  unpaid_total: number
  unfulfilled_count: number
}

interface OrdersKpiCardsProps {
  stats?: OrdersStatsData
  isLoading?: boolean
  activeTab: string
  onTabChange: (tabId: string) => void
  onSelectUnpaid?: () => void
}

export const OrdersKpiCards: React.FC<OrdersKpiCardsProps> = ({
  stats,
  activeTab,
  onTabChange,
  onSelectUnpaid,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['orders', 'sales', 'common'])

  const totalOrders = stats?.total_orders || 0
  const totalRevenue = stats?.total_revenue || 0
  const pendingCount = stats?.pending_count || 0
  const activeFulfillmentCount = (stats?.processing_count || 0) + (stats?.shipped_count || 0)
  const unpaidCount = stats?.unpaid_count || 0
  const unpaidTotal = stats?.unpaid_total || 0

  const pendingRate = totalOrders > 0 ? (pendingCount / totalOrders) * 100 : 0
  const completedCount = stats?.completed_count || 0
  const completionRate = totalOrders > 0 ? (completedCount / totalOrders) * 100 : 0

  return (
    <div className="space-y-4 print:hidden select-none">
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Total Orders & Gross Revenue */}
        <EnterpriseStatsCard
          title={t('orders:totalWebOrders', language === 'km' ? 'ការបញ្ជាទិញសរុប' : 'Total Web Orders')}
          value={totalOrders}
          useCounter={true}
          icon={ShoppingBag}
          variant="blue"
          delay={0.05}
          subtitle={
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground mt-0.5">
              <span>{language === 'km' ? 'ចំណូល:' : 'Revenue:'}</span>
              <span className="font-bold text-foreground">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-muted-foreground/80">
                (៛{Math.round(totalRevenue * KHR_RATE).toLocaleString()})
              </span>
            </div>
          }
        />

        {/* Card 2: Needs Action / Urgent Fulfillment */}
        <EnterpriseStatsCard
          title={t('orders:needsAction', language === 'km' ? 'ត្រូវរៀបចំភ្លាមៗ' : 'Needs Action')}
          value={pendingCount}
          useCounter={true}
          icon={Clock}
          variant="amber"
          delay={0.1}
          subtitle={
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>{language === 'km' ? 'រង់ចាំបញ្ជាក់ & វេចខ្ចប់' : 'Awaiting confirmation & packing'}</span>
            </div>
          }
        />

        {/* Card 3: In Transit & Active Delivery */}
        <EnterpriseStatsCard
          title={t('orders:inTransitLogistics', language === 'km' ? 'កំពុងដឹកជញ្ជូន' : 'In Transit / Logistics')}
          value={activeFulfillmentCount}
          useCounter={true}
          icon={Truck}
          variant="purple"
          delay={0.15}
          subtitle={
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span>{language === 'km' ? 'ដៃគូដឹកជញ្ជូន:' : 'Couriers:'}</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                VET • J&T • Grab
              </span>
            </div>
          }
          trend={{
            value: `${completedCount} ${language === 'km' ? 'បានបញ្ចប់' : 'completed'}`,
            isPositive: true,
          }}
        />

        {/* Card 4: Pending Settlement / COD */}
        <EnterpriseStatsCard
          title={t('orders:pendingCodUnpaid', language === 'km' ? 'ប្រាក់ត្រូវប្រមូល COD' : 'Pending COD / Unpaid')}
          value={unpaidTotal}
          prefix="$"
          decimals={2}
          useCounter={true}
          icon={DollarSign}
          variant="emerald"
          delay={0.2}
          subtitle={
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground mt-0.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {unpaidCount} {language === 'km' ? 'កញ្ចប់មិនទាន់ទូទាត់' : 'unpaid parcels'}
              </span>
              <span>•</span>
              <span>៛{Math.round(unpaidTotal * KHR_RATE).toLocaleString()}</span>
            </div>
          }
          trend={{
            value: `${unpaidCount} ${language === 'km' ? 'រង់ចាំប្រមូល' : 'to collect'}`,
            isPositive: false,
          }}
        />
      </EnterpriseStatsGrid>
    </div>
  )
}

export default OrdersKpiCards
