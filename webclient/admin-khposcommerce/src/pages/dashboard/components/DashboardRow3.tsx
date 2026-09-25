import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, Users, ArrowUpRight } from 'lucide-react'
import { FlattenCard } from '@/components/common/cards'
import StatusBadge from '@/components/common/badges/StatusBadge'
import { formatCurrency } from '@/utils/formatters'

interface DashboardRow3Props {
  topProducts: any[]
  recentOrders: any[]
  latestCustomers?: any[]
}

export const DashboardRow3: React.FC<DashboardRow3Props> = ({
  topProducts,
  recentOrders,
  latestCustomers,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* 1. Top Selling Products Card */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            <span>{t('dashboard.bestSellingProduct')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewAll')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-3.5">
          {topProducts?.slice(0, 5).map((p: any, i: number) => (
            <div
              key={p.id || i}
              className="flex items-center justify-between gap-4 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {p.name || p.product_name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                  {p.sku || `ID: #${p.id}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                  {formatCurrency(p.total_revenue || p.price || 0, { locale })}
                </span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {p.value || p.total_qty || 0} {t('dashboard.sold', 'sold')}
                </p>
              </div>
            </div>
          ))}
          {(!topProducts || topProducts.length === 0) && (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              {t('dashboard.noDataAvailable')}
            </div>
          )}
        </div>
      </FlattenCard>

      {/* 2. Latest Orders Card */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>{t('dashboard.pendingOrders')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewAll')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2">{t('dashboard.id', 'ID')}</th>
                <th className="pb-2">{t('dashboard.customer', 'Customer')}</th>
                <th className="pb-2 text-right">{t('dashboard.total', 'Total')}</th>
                <th className="pb-2 text-right">{t('dashboard.status', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders?.slice(0, 5).map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 font-bold text-[#0e5a77] dark:text-cyan-400 font-mono">
                    #{order.order_number || order.id}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[80px]">
                    {order.customer_name || t('dashboard.walkInCustomer', 'Walk-in')}
                  </td>
                  <td className="py-2.5 text-right font-bold text-slate-800 dark:text-white font-mono">
                    {formatCurrency(order.grand_total, { locale })}
                  </td>
                  <td className="py-2.5 text-right">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    {t('dashboard.noDataAvailable')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FlattenCard>

      {/* 3. Latest Registered Customers Card */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span>{t('dashboard.latestCustomers')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewAll')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-3.5">
          {(latestCustomers && latestCustomers.length > 0 ? latestCustomers : []).slice(0, 5).map((cust: any) => (
            <div
              key={cust.id}
              className="flex items-center justify-between gap-4 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{cust.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                  {cust.phone || cust.email || `ID: #${cust.id}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40 font-bold px-2 py-0.5 rounded-full">
                  {t('dashboard.newCustomers')}
                </span>
              </div>
            </div>
          ))}
          {(!latestCustomers || latestCustomers.length === 0) && (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              {t('dashboard.noDataAvailable')}
            </div>
          )}
        </div>
      </FlattenCard>
    </div>
  )
}

export default DashboardRow3
