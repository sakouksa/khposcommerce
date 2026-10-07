import React from 'react'
import { DollarSign, Wallet, Percent, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FlattenCard } from '@/components/common/cards'
import { formatCurrency } from '@/utils/formatters'

interface DashboardRow5Props {
  stats?: any
}

export const DashboardRow5: React.FC<DashboardRow5Props> = ({ stats }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  const sales = stats?.today_sales || 0
  const expenses = stats?.today_expenses || 0
  const grossProfit = stats?.gross_profit || 0
  const netMargin = sales > 0 ? ((grossProfit - expenses) / sales) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* 1. Cash Flow Summary */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-500" />
            <span>{t('dashboard.netCashFlow', 'Net Cash Flow')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/finance')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewAll')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.todayIncome')}</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-base text-slate-800 dark:text-white font-mono">
                {formatCurrency(stats?.today_income || sales, { locale })}
              </span>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.todayExpenses')}</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-base text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(expenses, { locale })}
              </span>
            </div>
          </div>
        </div>
      </FlattenCard>

      {/* 2. Account Receivables & Payables */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>{t('dashboard.receivablesPayables', 'Receivables & Payables')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/reports/profit-loss')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewAll')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.pendingPayment')}</span>
            <h5 className="font-bold text-base text-slate-800 dark:text-white font-mono mt-1">
              {formatCurrency(stats?.pending_payments || 0, { locale })}
            </h5>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.pendingPurchase')}</span>
            <h5 className="font-bold text-base text-slate-800 dark:text-white font-mono mt-1">
              {formatCurrency(stats?.today_purchases || 0, { locale })}
            </h5>
          </div>
        </div>
      </FlattenCard>

      {/* 3. Net Profit Margin */}
      <FlattenCard
        title={
          <span className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-purple-500" />
            <span>{t('dashboard.profitTrend', 'Profit Margin Trend')}</span>
          </span>
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/reports/profit-loss')}
            className="text-xs font-bold text-[#0e5a77] dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{t('dashboard.viewAll')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        }
        className="md:col-span-2 lg:col-span-1"
      >
        <div className="space-y-4">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.grossProfit')}</span>
            <h5 className="font-bold text-base text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {formatCurrency(grossProfit, { locale })}
            </h5>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{t('dashboard.netProfit')}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-base text-slate-800 dark:text-white font-mono">{netMargin.toFixed(1)}%</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                netMargin >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
              }`}>
                {netMargin >= 0 ? t('dashboard.positive', 'Positive') : t('dashboard.deficit', 'Deficit')}
              </span>
            </div>
          </div>
        </div>
      </FlattenCard>
    </div>
  )
}

export default DashboardRow5
