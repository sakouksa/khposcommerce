import React from 'react'
import { motion } from 'framer-motion'
import { Building2, TrendingUp, ArrowUpRight, Wallet, Activity } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { CircularProgressRing } from '@/components/shared/CircularProgressRing'
import { formatCurrency } from '@/utils/formatters'

interface AnalyticsData {
  totalCompanies: number
  activeCompanies: number
  inactiveCompanies: number
  totalRevenue: number
  totalOrders: number
  aov: number
  totalIncome: number
  totalExpense: number
  netProfit: number
  totalBranches: number
  totalEmployees: number
  activeWarehouses: number
  todaysRevenue: number
  todaysOrders: number
  newCustomers: number
  newEmployees: number
  pendingPayments: number
  lowStockAlerts: number
}

interface CompanyStatsCardsProps {
  analytics: AnalyticsData
}

export const CompanyStatsCards: React.FC<CompanyStatsCardsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
      {/* CARD 1: Company Overview */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-[26px] bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              COMPANY OVERVIEW
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <TrendingUp size={11} />
                <span>+100%</span>
              </span>
              <span className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                <AnimatedCounter value={analytics.totalCompanies} />
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Total Registered Companies</div>
            </div>
            <CircularProgressRing
              percentage={(analytics.activeCompanies / (analytics.totalCompanies || 1)) * 100}
              colorClass="text-blue-500"
              size={48}
            />
          </div>
        </div>
        <div>
          <div className="w-full bg-blue-500 h-1 rounded-full my-3.5" />
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Active</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{analytics.activeCompanies}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Inactive</div>
              <div className="font-bold text-muted-foreground mt-0.5">{analytics.inactiveCompanies}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">HQ Status</div>
              <div className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">Primary</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: Business Performance */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-[26px] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              BUSINESS PERFORMANCE
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ArrowUpRight size={11} />
                <span>+18.4%</span>
              </span>
              <span className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                <AnimatedCounter value={analytics.totalRevenue} prefix="$" decimals={2} />
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Gross Company Revenue</div>
            </div>
            <CircularProgressRing percentage={92} colorClass="text-emerald-500" size={48} />
          </div>
        </div>
        <div>
          <div className="w-full bg-emerald-500 h-1 rounded-full my-3.5" />
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Orders</div>
              <div className="font-bold text-foreground mt-0.5">{analytics.totalOrders}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Avg Order</div>
              <div className="font-bold text-emerald-600 mt-0.5">{formatCurrency(analytics.aov, 'USD')}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Growth</div>
              <div className="font-bold text-teal-600 mt-0.5">+18.4%</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CARD 3: Net Profit & Income */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-[26px] bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              NET PROFIT & INCOME
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Wallet size={11} />
                <span>+24.1%</span>
              </span>
              <span className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                <AnimatedCounter value={analytics.netProfit} prefix="$" decimals={2} />
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Net Profit Ledger Margin</div>
            </div>
            <CircularProgressRing percentage={78} colorClass="text-purple-500" size={48} />
          </div>
        </div>
        <div>
          <div className="w-full bg-purple-500 h-1 rounded-full my-3.5" />
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Gross Income</div>
              <div className="font-bold text-foreground mt-0.5">${analytics.totalIncome.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Expenses</div>
              <div className="font-bold text-rose-500 mt-0.5">${analytics.totalExpense.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Margin</div>
              <div className="font-bold text-purple-600 mt-0.5">38.5%</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CARD 4: Network & Workforce Operations */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-[26px] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              NETWORK OPERATIONS
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Activity size={11} />
                <span>Operational</span>
              </span>
              <span className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity size={18} />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                <AnimatedCounter value={analytics.totalBranches} />
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">Active Branches & Locations</div>
            </div>
            <CircularProgressRing percentage={88} colorClass="text-amber-500" size={48} />
          </div>
        </div>
        <div>
          <div className="w-full bg-amber-500 h-1 rounded-full my-3.5" />
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Employees</div>
              <div className="font-bold text-foreground mt-0.5">{analytics.totalEmployees}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Warehouses</div>
              <div className="font-bold text-amber-600 mt-0.5">{analytics.activeWarehouses}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px] font-medium">Status</div>
              <div className="font-bold text-emerald-600 mt-0.5">Healthy</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CompanyStatsCards
