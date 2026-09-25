import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/formatters'
import { toLocalDateStr } from './FinanceStatsCards'

interface FinanceTrendsChartProps {
  allSales?: any[]
  allExpenses?: any[]
}

type PeriodType = '7d' | '30d' | '14d'

export const FinanceTrendsChart: React.FC<FinanceTrendsChartProps> = ({
  allSales = [],
  allExpenses = [],
}) => {
  const { t, i18n } = useTranslation(['finance', 'common'])
  const currentLocale = i18n.language === 'km' ? 'km-KH' : i18n.language

  const [period, setPeriod] = useState<PeriodType>('7d')
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Aggregate real daily data based on selected period (using local date alignment)
  const chartData = useMemo(() => {
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30
    const result: { date: string; rawDate: Date; revenue: number; expense: number; profit: number }[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = toLocalDateStr(d)

      const daySales = allSales.filter((s: any) => {
        if (s.status === 'cancelled' || s.status === 'refunded') return false
        const sDate = toLocalDateStr(s.date || s.created_at || s.sale_date || '')
        return sDate === dateStr
      })
      const dayRev = daySales.reduce(
        (acc: number, s: any) => acc + Number(s.total_amount || s.grand_total || s.total || 0), 0
      )

      const dayExpRecords = allExpenses.filter((e: any) => {
        if (e.status === 'rejected') return false
        const eDate = toLocalDateStr(e.date || e.created_at || '')
        return eDate === dateStr
      })
      const dayExp = dayExpRecords.reduce(
        (acc: number, e: any) => acc + Number(e.amount || 0), 0
      )

      const shortLabel = d.toLocaleDateString(currentLocale, { month: 'numeric', day: 'numeric' })
      result.push({
        date: shortLabel,
        rawDate: d,
        revenue: Number(dayRev.toFixed(2)),
        expense: Number(dayExp.toFixed(2)),
        profit: Number((dayRev - dayExp).toFixed(2)),
      })
    }

    return result
  }, [allSales, allExpenses, period, currentLocale])

  const totalPeriodRevenue = useMemo(() => chartData.reduce((sum, item) => sum + item.revenue, 0), [chartData])
  const totalPeriodExpense = useMemo(() => chartData.reduce((sum, item) => sum + item.expense, 0), [chartData])
  const netPeriodProfit = totalPeriodRevenue - totalPeriodExpense
  const profitMarginPercent = totalPeriodRevenue > 0 ? ((netPeriodProfit / totalPeriodRevenue) * 100).toFixed(1) : '0.0'

  return (
    <div className={`bg-card border border-border/70 rounded-2xl shadow-xs print:hidden transition-all duration-200 ${isCollapsed ? 'p-3 sm:p-3.5' : 'p-4 sm:p-5 space-y-4'}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>{t('finance.trend_analysis_title', 'Revenue vs Expense Trends')}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                +{profitMarginPercent}% {t('finance.margin_label', 'Margin')}
              </span>
            </h2>
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('finance.trend_subtitle', 'Live comparative cash inflow and operational outlays trajectory')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {!isCollapsed && (
            <>
              {/* Period Toggle Pills */}
              <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => setPeriod('7d')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    period === '7d'
                      ? 'bg-card text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  7 {t('finance.days_short', 'Days')}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('14d')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    period === '14d'
                      ? 'bg-card text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  14 {t('finance.days_short', 'Days')}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('30d')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    period === '30d'
                      ? 'bg-card text-foreground shadow-2xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  30 {t('finance.days_short', 'Days')}
                </button>
              </div>
            </>
          )}

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl border border-border/60 hover:bg-muted/70 transition-all cursor-pointer"
          >
            <span>{isCollapsed ? t('finance.view_chart', 'Trends Chart') : t('finance.hide_chart', 'Hide Chart')}</span>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                {t('finance.total_revenue_period', 'Gross Inflow')}
              </span>
              <p className="text-base sm:text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(totalPeriodRevenue, { locale: currentLocale })}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15">
              <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">
                {t('finance.total_expenses_period', 'Operating Outflow')}
              </span>
              <p className="text-base sm:text-lg font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                {formatCurrency(totalPeriodExpense, { locale: currentLocale })}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/15">
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                {t('finance.net_period_profit', 'Net Cash Balance')}
              </span>
              <p className="text-base sm:text-lg font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                {formatCurrency(netPeriodProfit, { locale: currentLocale })}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15">
              <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                {t('finance.profit_ratio', 'Profit Ratio')}
              </span>
              <p className="text-base sm:text-lg font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {profitMarginPercent}%
              </p>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="h-64 sm:h-72 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  className="text-muted-foreground text-[11px] font-medium"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground text-[11px] font-mono"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover text-popover-foreground p-3 rounded-2xl border border-border shadow-xl text-xs space-y-1.5 font-sans">
                          <p className="font-bold text-foreground border-b border-border/60 pb-1">{label}</p>
                          <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>{t('finance.gross_sales_revenue', 'Revenue')}:</span>
                            <span className="font-mono font-bold">${payload[0]?.value}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-rose-600 dark:text-rose-400 font-semibold">
                            <span>{t('finance.operating_expenses', 'Expense')}:</span>
                            <span className="font-mono font-bold">${payload[1]?.value}</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name={t('finance.gross_sales_revenue', 'Sales Revenue')}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name={t('finance.operating_expenses', 'Operating Expenses')}
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

export default FinanceTrendsChart
