import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  Receipt,
  Landmark,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  EnterpriseStatsCard,
  EnterpriseMiniStatsCard,
  EnterpriseStatsGrid,
} from '@/components/common'

export type FinanceTimeframe = 'all' | 'month' | 'today'

interface FinanceStatsCardsProps {
  analytics?: any
  allSales?: any[]
  allExpenses?: any[]
  allRegisters?: any[]
}

// ─── Date helpers (Cambodia Timezone Asia/Phnom_Penh) ────────────────────────
/**
 * Normalizes any date input (ISO 8601, SQL datetime, or YYYY-MM-DD) into 'YYYY-MM-DD'
 * in Asia/Phnom_Penh timezone.
 */
export const toLocalDateStr = (val: string | undefined | null): string => {
  if (!val) return ''
  const str = String(val).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }
  if (/^\d{4}-\d{2}-\d{2}\s/.test(str)) {
    return str.slice(0, 10)
  }
  const d = new Date(str)
  if (isNaN(d.getTime())) {
    return str.slice(0, 10)
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export const getLocalTodayStr = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export const getLocalMonthPrefix = (): string => {
  return getLocalTodayStr().slice(0, 7)
}

export function filterByPeriod<T>(
  items: T[],
  getDate: (item: T) => string,
  timeframe: FinanceTimeframe,
): T[] {
  if (!items || !items.length) return []
  if (timeframe === 'all') return items

  if (timeframe === 'today') {
    const today = getLocalTodayStr()
    return items.filter((item) => toLocalDateStr(getDate(item)) === today)
  }

  // timeframe === 'month'
  const month = getLocalMonthPrefix()
  return items.filter((item) => toLocalDateStr(getDate(item)).startsWith(month))
}

export const FinanceStatsCards: React.FC<FinanceStatsCardsProps> = ({
  analytics,
  allSales = [],
  allExpenses = [],
  allRegisters = [],
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const [timeframe, setTimeframe] = useState<FinanceTimeframe>('all')

  const summaryData = analytics?.summary
  const serverTf = analytics?.timeframes?.[timeframe]

  // ── Compute filtered KPIs ──────────────────────────────────────────────────
  // Prioritize backend SQL aggregation (analytics.timeframes) for 100% precision & zero truncation,
  // falling back to local Cambodia timezone filter if serverTf is not yet available.
  const { grossSalesVal, expensesVal, salesCount, expensesCount, netProfitsVal } = useMemo(() => {
    if (serverTf) {
      const gross = Number(serverTf.gross_sales ?? 0)
      const exp = Number(serverTf.expenses ?? 0)
      const sCount = Number(serverTf.sales_count ?? 0)
      const eCount = Number(serverTf.expenses_count ?? 0)
      const net = serverTf.net_profit != null ? Number(serverTf.net_profit) : Math.max(0, gross - exp)

      return {
        grossSalesVal: gross,
        expensesVal: exp,
        salesCount: sCount,
        expensesCount: eCount,
        netProfitsVal: net,
      }
    }

    // Fallback client-side filter
    const validSales = allSales.filter(
      (s: any) => s.status === 'completed' || s.status === 'paid' || (!s.status && Number(s.grand_total || s.total_amount || 0) > 0)
    )

    // Only non-rejected expenses count toward operating expenses
    const validExpenses = allExpenses.filter((e: any) => e.status !== 'rejected')

    // Filter sales by selected period
    const filteredSales = filterByPeriod(
      validSales,
      (s: any) => s.date || s.created_at || s.sale_date || '',
      timeframe,
    )

    // Filter expenses by selected period
    const filteredExpenses = filterByPeriod(
      validExpenses,
      (e: any) => e.date || e.created_at || '',
      timeframe,
    )

    const gross = filteredSales.reduce((acc: number, s: any) => {
      const v = parseFloat(s.total_amount ?? s.grand_total ?? s.total ?? 0)
      return acc + (isNaN(v) ? 0 : v)
    }, 0)

    const exp = filteredExpenses.reduce((acc: number, e: any) => {
      const v = parseFloat(e.amount ?? 0)
      return acc + (isNaN(v) ? 0 : v)
    }, 0)

    return {
      grossSalesVal: gross,
      expensesVal: exp,
      salesCount: filteredSales.length,
      expensesCount: filteredExpenses.length,
      netProfitsVal: Math.max(0, gross - exp),
    }
  }, [serverTf, allSales, allExpenses, timeframe])

  // Cash reserves: active till floats from open registers or backend summary
  const cashReservesVal = useMemo(() => {
    const registersSum = allRegisters.reduce((acc: number, reg: any) => {
      const v = parseFloat(reg.closing_balance || reg.opening_balance || reg.balance || reg.expected_balance || 0)
      return acc + (isNaN(v) ? 0 : v)
    }, 0)

    if (registersSum > 0) return registersSum
    if (summaryData?.cash_reserves != null && Number(summaryData.cash_reserves) > 0) {
      return Number(summaryData.cash_reserves)
    }
    return 0
  }, [summaryData, allRegisters])

  const registersCount = summaryData?.total_registers ?? (allRegisters.length || 10)
  const openRegistersCount =
    summaryData?.open_registers ??
    allRegisters.filter((r: any) => r.status === 'open' || !r.status).length

  // ── Derived financial ratios ───────────────────────────────────────────────
  const avgOrderVal = salesCount > 0 ? grossSalesVal / salesCount : 0
  const profitMarginNum = grossSalesVal > 0 ? (netProfitsVal / grossSalesVal) * 100 : 0
  const opexRatioNum = grossSalesVal > 0 ? (expensesVal / grossSalesVal) * 100 : 0

  const revenueMultiple = expensesVal > 0
    ? (grossSalesVal / expensesVal).toFixed(1)
    : grossSalesVal > 0
    ? '100+'
    : '0.0'

  // ── Financial health label ────────────────────────────────────────────────
  const healthStatus = useMemo(() => {
    if (salesCount === 0 && expensesCount === 0) {
      return {
        label: t('finance.health_neutral', 'No Activity'),
        color: 'text-muted-foreground bg-muted/30 border-border/60',
      }
    }
    if (profitMarginNum >= 80)
      return { label: t('finance.health_optimal', 'Optimal Growth'), color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    if (profitMarginNum >= 50)
      return { label: t('finance.health_healthy', 'Strong & Healthy'), color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' }
    if (profitMarginNum > 0)
      return { label: t('finance.health_moderate', 'Moderate'), color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' }
    return { label: t('finance.health_warning', 'Caution Needed'), color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' }
  }, [profitMarginNum, salesCount, expensesCount, t])

  return (
    <div className="space-y-4 print:hidden select-none">
      {/* ─── Compact Top Toolbar: Period Pills & Health ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/70 px-4 py-2.5 rounded-2xl shadow-xs">
        {/* Left: Health Status */}
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${healthStatus.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{healthStatus.label}</span>
          </span>
          <span className="text-xs text-muted-foreground hidden md:inline">
            • {revenueMultiple}x {t('finance.inflow_vs_opex', 'Inflow vs OPEX')}
          </span>
        </div>

        {/* Right: Timeframe Segmented Control — Today | This Month | All Time */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
          {(
            [
              { id: 'today', label: t('finance.period_today', 'Today') },
              { id: 'month', label: t('finance.period_month', 'This Month') },
              { id: 'all', label: t('finance.period_all', 'All Time') },
            ] as const
          ).map((item) => {
            const isActive = timeframe === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTimeframe(item.id)}
                className={`relative px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none ${
                  isActive
                    ? 'text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="finance-timeframe-pill"
                    className="absolute inset-0 bg-background rounded-lg border border-border/80 shadow-2xs"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── 4 KPI Cards ─── */}
      <EnterpriseStatsGrid columns={4}>
        {/* Card 1: Gross Sales (filtered by period) */}
        <EnterpriseStatsCard
          title={t('finance.gross_sales_revenue', 'Gross Sales Revenue')}
          value={grossSalesVal}
          prefix="$"
          decimals={2}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                +${avgOrderVal.toFixed(0)} avg
              </span>{' '}
              • {salesCount} {t('finance.sales', 'Sales')}
            </span>
          }
          icon={TrendingUp}
          variant="emerald"
        />

        {/* Card 2: Operating Expenses (filtered by period) */}
        <EnterpriseStatsCard
          title={t('finance.operating_expenses', 'Operating Expenses')}
          value={expensesVal}
          prefix="$"
          decimals={2}
          valueClassName="text-rose-600 dark:text-rose-400"
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">
                {opexRatioNum.toFixed(1)}% OPEX
              </span>{' '}
              • {expensesCount} {t('finance.records', 'Records')}
            </span>
          }
          icon={Receipt}
          variant="rose"
          delay={0.05}
        />

        {/* Card 3: Net Profit (filtered by period) */}
        <EnterpriseStatsCard
          title={t('finance.net_profit_balance', 'Net Profit Balance')}
          value={netProfitsVal}
          prefix="$"
          decimals={2}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">
                {netProfitsVal >= 0 ? '+' : ''}{profitMarginNum.toFixed(1)}% {t('finance.margin_label', 'Margin')}
              </span>{' '}
              • {revenueMultiple}x OPEX
            </span>
          }
          icon={Wallet}
          variant="blue"
          delay={0.1}
        />

        {/* Card 4: Cash Till Reserves (always global — register balance doesn't change by period) */}
        <EnterpriseStatsCard
          title={t('finance.till_float_reserves', 'Cash Till Reserves')}
          value={cashReservesVal}
          prefix="$"
          decimals={2}
          subtitle={
            <span className="flex items-center gap-1">
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {openRegistersCount}/{registersCount} {t('finance.registers_open', 'Open')}
              </span>{' '}
              • {t('finance.pos_ready', 'POS Ready')}
            </span>
          }
          icon={Landmark}
          variant="amber"
          delay={0.15}
        />
      </EnterpriseStatsGrid>

      {/* ─── Secondary Mini Metric Strip ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <EnterpriseMiniStatsCard
          label={t('finance.inflow_vs_opex', 'Inflow Multiple')}
          value={`${revenueMultiple}x`}
          valueColor="emerald"
        />
        <EnterpriseMiniStatsCard
          label={t('finance.opex_ratio', 'OPEX Ratio')}
          value={`${opexRatioNum.toFixed(1)}%`}
          valueColor="rose"
        />
        <EnterpriseMiniStatsCard
          label={t('finance.net_margin', 'Net Margin')}
          value={`${profitMarginNum.toFixed(1)}%`}
          valueColor="blue"
        />
        <EnterpriseMiniStatsCard
          label={t('finance.pos_liquidity', 'Open Registers')}
          value={`${openRegistersCount} / ${registersCount}`}
          valueColor="amber"
        />
      </div>
    </div>
  )
}

export default FinanceStatsCards
