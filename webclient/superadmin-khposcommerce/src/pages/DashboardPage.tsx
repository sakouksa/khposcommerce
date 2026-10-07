import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Box,
  Percent,
  Users,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  RefreshCw,
  Building2,
  Crown,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { platformService, type PlatformStatsResponse } from '@/services/platformService'
import { toast } from '@/stores/toastStore'
import { Link } from 'react-router-dom'

export const PlatformDashboardPage: React.FC = () => {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  const {
    data: statsData,
    isLoading,
    refetch
  } = useQuery<PlatformStatsResponse>({
    queryKey: ['platform-dashboard-stats'],
    queryFn: platformService.getDashboardStats,
    staleTime: 60000,
  })

  const handleRefresh = async () => {
    setIsManualRefreshing(true)
    try {
      await refetch()
      toast.success('ទិន្នន័យប្រព័ន្ធត្រូវបានធ្វើបច្ចុប្បន្នភាពរួចរាល់')
    } catch {
      toast.error('មិនអាចទាញយកទិន្នន័យបានទេ')
    } finally {
      setIsManualRefreshing(false)
    }
  }

  const summary = statsData?.summary ?? {
    total_shops: 3,
    active_shops: 3,
    resellers: 1,
    customers: 100,
    total_products: 100,
    total_orders: 330,
    total_revenue: 1015.77,
    saas_revenue: 1970.0,
    active_subscriptions: 3,
  }

  const revenueChart = statsData?.revenue_chart ?? []
  const ordersByStatus = statsData?.orders_by_status ?? [
    { name: 'Paid (ជោគជ័យ)', value: 38, color: '#3b82f6' },
    { name: 'Pending (រង់ចាំ)', value: 10, color: '#10b981' },
    { name: 'Failed (បរាជ័យ)', value: 4, color: '#6366f1' },
  ]
  const newShopsByMonth = statsData?.new_shops_by_month ?? []
  const shopsByPlan = statsData?.shops_by_plan ?? []
  const recentCompanies = statsData?.recent_companies ?? []

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Top Header Section ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="size-3.5" />
              SaaS Super Admin
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ KHPosCommerce (Overview & Analytics)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isManualRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${isManualRefreshing || isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            <span>ធ្វើបច្ចុប្បន្នភាព</span>
          </button>

          <Link
            to="/shops"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Building2 className="size-4" />
            <span>គ្រប់គ្រងហាង SaaS</span>
          </Link>
        </div>
      </div>

      {/* ─── Top 6 Stat Cards (MiniStore KH Design Pattern) ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {/* Card 1: TOTAL SHOPS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-[11.5px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              TOTAL SHOPS (ហាងសរុប)
            </p>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.total_shops}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3.5" />
              <span>{summary.active_shops} ហាងកំពុងដំណើរការសកម្ម</span>
            </div>
          </div>
          <div className="size-13 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Box className="size-6" />
          </div>
        </motion.div>

        {/* Card 2: RESELLERS / BRANCHES */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-[11.5px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              RESELLERS (តំណាងចែកចាយ / សាខា)
            </p>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.resellers}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>ដៃគូបែងចែក & សាខាពហុទីតាំង</span>
            </div>
          </div>
          <div className="size-13 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Percent className="size-6" />
          </div>
        </motion.div>

        {/* Card 3: CUSTOMERS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-[11.5px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              CUSTOMERS (អតិថិជន)
            </p>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.customers}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <span>សរុបទូទាំងគ្រប់ហាង & E-Commerce</span>
            </div>
          </div>
          <div className="size-13 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="size-6" />
          </div>
        </motion.div>

        {/* Card 4: TOTAL PRODUCTS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-[11.5px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              TOTAL PRODUCTS (ទំនិញសរុប)
            </p>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.total_products}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>មុខទំនិញក្នុងប្រព័ន្ធ SKU សរុប</span>
            </div>
          </div>
          <div className="size-13 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShoppingCart className="size-6" />
          </div>
        </motion.div>

        {/* Card 5: TOTAL ORDERS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-[11.5px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              TOTAL ORDERS (ការបញ្ជាទិញ)
            </p>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.total_orders}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
              <span>POS Sales & Online Orders</span>
            </div>
          </div>
          <div className="size-13 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="size-6" />
          </div>
        </motion.div>

        {/* Card 6: TOTAL REVENUE */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.25 }}
          className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-[11.5px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              TOTAL REVENUE (ចំណូលសរុប)
            </p>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              ${Number(summary.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <span>SaaS Subscriptions: ${Number(summary.saas_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="size-13 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <DollarSign className="size-6" />
          </div>
        </motion.div>
      </div>

      {/* ─── 4 Analytics Charts Section (2x2 Grid) ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue - last 30 days */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue — last 30 days (ចំណូល ៣០ ថ្ងៃចុងក្រោយ)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ការប្រែប្រួលចំណូលលក់ប្រចាំថ្ងៃទូទាំងប្រព័ន្ធ ($)
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              30 ថ្ងៃ
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlatformRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'ចំណូល']}
                  labelFormatter={(lbl) => `កាលបរិច្ឆេទ: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPlatformRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Orders by payment status */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Orders by payment status (ការបញ្ជាទិញតាមស្ថានភាពទូទាត់)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                សមាមាត្រវិក្កយបត្រតាមស្ថានភាពទូទាត់
              </p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [val, 'ចំនួនវិក្កយបត្រ']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: New shops by month */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                New shops by month (ហាងបង្កើតតាមខែ)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ចំនួនអាជីវកម្ម ឬ Tenants ថ្មីដែលបានចុះឈ្មោះ
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
              ៦ ខែចុងក្រោយ
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newShopsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [val, 'ហាងថ្មី']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="shops"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Shops by plan */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Shops by plan (ហាងតាមប្រភេទ Plan)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ការបែងចែកក្រុមហ៊ុនតាមកញ្ចប់ Starter, Business, Enterprise
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50">
              SaaS Plans
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shopsByPlan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="plan" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [val, 'ចំនួនហាង']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Recent Companies / Tenants Table ───────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="size-5 text-indigo-600 dark:text-indigo-400" />
              <span>ក្រុមហ៊ុន និងហាងសកម្ម (Active Tenants)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              បញ្ជីក្រុមហ៊ុនដែលកំពុងដំណើរការក្នុងប្រព័ន្ធ KHPosCommerce Multi-Tenant SaaS
            </p>
          </div>

          <Link
            to="/company"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>មើលទាំងអស់</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-5">ក្រុមហ៊ុន / ហាង</th>
                <th className="py-3 px-5">ម្ចាស់អាជីវកម្ម (Primary Owner 👑)</th>
                <th className="py-3 px-5">កញ្ចប់សេវា (Plan)</th>
                <th className="py-3 px-5 text-center">សាខា</th>
                <th className="py-3 px-5">ស្ថានភាព</th>
                <th className="py-3 px-5">កាលបរិច្ឆេទ</th>
                <th className="py-3 px-5 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {recentCompanies.map((company) => {
                const planColor =
                  company.plan_slug === 'enterprise'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                    : company.plan_slug === 'business'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
                    : 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800'

                return (
                  <tr key={company.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {company.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {company.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Crown className="size-3.5 text-amber-500 shrink-0" />
                        <span>{company.owner_name}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {company.phone || company.email || '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${planColor}`}>
                        <Layers className="size-3" />
                        {company.plan_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center font-semibold">
                      {company.branches_count}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {company.created_at}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/shops`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <span>គ្រប់គ្រង</span>
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export { PlatformDashboardPage as DashboardPage }
export default PlatformDashboardPage

