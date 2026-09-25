import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { dashboardService } from '@/services/dashboardService'
import { useThemeStore } from '@/stores/themeStore'
import { DEFAULT_WIDGETS_LIST } from '@/config/dashboardWidgets'

// Subcomponents imports
import DashboardHeader from './components/DashboardHeader'
import DashboardStats from './components/DashboardStats'
import DashboardCharts from './components/DashboardCharts'
import DashboardRow3 from './components/DashboardRow3'
import DashboardRow4 from './components/DashboardRow4'
import DashboardRow5 from './components/DashboardRow5'
import DashboardRow6 from './components/DashboardRow6'
import DashboardRow7 from './components/DashboardRow7'
import DashboardRow8 from './components/DashboardRow8'
import DashboardRow9 from './components/DashboardRow9'
import DashboardRow10 from './components/DashboardRow10'
import QuickActions from './components/QuickActions'
import RecentActivities from './components/RecentActivities'
import BusinessAlertsWidget from './components/BusinessAlertsWidget'
import SystemHealthWidget from './components/SystemHealthWidget'

const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const { widgetsList } = useThemeStore()
  const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Real backend query for stats
  const { 
    data: statsRes, 
    isLoading: statsLoading, 
    isError: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['dashboard-stats', selectedBranchId],
    queryFn: () => dashboardService.getStats(selectedBranchId),
    staleTime: 30000,
  })

  // Real backend query for multi-dataset charts
  const { 
    data: chartsRes, 
    isLoading: chartsLoading,
    refetch: refetchCharts
  } = useQuery({
    queryKey: ['dashboard-charts', selectedBranchId],
    queryFn: () => dashboardService.getCharts(selectedBranchId),
    staleTime: 60000,
  })

  // Real backend query for sales chart fallback
  const { data: salesChartRes } = useQuery({
    queryKey: ['sales-chart', selectedBranchId],
    queryFn: () => dashboardService.getSalesChart(selectedBranchId),
    staleTime: 60000,
  })

  // Real backend query for operation panels
  const { data: panelsRes, refetch: refetchPanels } = useQuery({
    queryKey: ['dashboard-operation-panels'],
    queryFn: () => dashboardService.getOperationPanels(),
    staleTime: 30000,
  })

  // Real backend query for business alerts
  const { data: alertsRes, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: () => dashboardService.getAlerts(),
    staleTime: 30000,
  })

  // Real backend query for system health
  const { data: healthRes, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['dashboard-system-health'],
    queryFn: () => dashboardService.getSystemHealth(),
    staleTime: 60000,
  })

  // Legacy fallback queries
  const { data: topProductsRes } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => dashboardService.getTopProducts(),
  })

  const { data: lowStockRes } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => dashboardService.getLowStock(),
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([
      refetchStats(),
      refetchCharts(),
      refetchPanels(),
      refetchAlerts(),
      refetchHealth(),
    ])
    setIsRefreshing(false)
  }

  // Active widgets visibility map
  const activeWidgetMap = React.useMemo(() => {
    const list = widgetsList && widgetsList.length > 0 ? widgetsList : DEFAULT_WIDGETS_LIST
    const map = new Map<string, boolean>()
    list.forEach((w) => map.set(w.id, w.visible))
    return map
  }, [widgetsList])

  const isWidgetVisible = (widgetId: string) => {
    return activeWidgetMap.get(widgetId) !== false
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  }

  const hasAnyStatWidget = ['today_sales', 'today_orders', 'total_customers', 'total_products'].some((id) => isWidgetVisible(id))

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-4 sm:space-y-6 max-w-full 2xl:max-w-[1800px] mx-auto p-1.5 sm:p-4 md:p-6 min-w-0"
    >
      {/* Dashboard Top Header */}
      <motion.div variants={itemVariants}>
        <DashboardHeader 
          onBranchChange={(bId) => setSelectedBranchId(bId)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </motion.div>

      {/* Error state banner */}
      {statsError && (
        <div className="p-3.5 sm:p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-700 dark:text-rose-400 text-xs font-bold shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{t('dashboard.errorLoading')}</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-3.5 py-1.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('dashboard.retry')}</span>
          </button>
        </div>
      )}

      {/* 1. Business Alerts Feed Widget (Top Banner) */}
      {isWidgetVisible('business_alerts') && (
        <motion.div variants={itemVariants}>
          <BusinessAlertsWidget alerts={alertsRes || []} isLoading={alertsLoading} />
        </motion.div>
      )}

      {/* 2. Full Width Enterprise KPI Cards */}
      {hasAnyStatWidget && (
        <motion.div variants={itemVariants} className="w-full">
          <DashboardStats stats={statsRes} isLoading={statsLoading} />
        </motion.div>
      )}

      {/* 3. Primary Responsive Enterprise Grid (Center Panel + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Main Center Panel (2 cols on LG, 3 cols on XL) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-4 sm:space-y-6 min-w-0">
          {/* Primary Analytics & Category Sales Charts */}
          {(isWidgetVisible('sales_overview') || isWidgetVisible('category_sales')) && (
            <motion.div variants={itemVariants}>
              <DashboardCharts 
                salesData={salesChartRes || []} 
                chartsData={chartsRes} 
                isLoading={chartsLoading} 
              />
            </motion.div>
          )}

          {/* Row 3: Top Selling, Recent Orders, Latest Customers */}
          {isWidgetVisible('recent_orders') && (
            <motion.div variants={itemVariants}>
              <DashboardRow3 
                topProducts={topProductsRes || []} 
                recentOrders={panelsRes?.pending_orders || []}
                latestCustomers={panelsRes?.latest_customers || []} 
              />
            </motion.div>
          )}

          {/* Row 4: Inventory & Warehouse Summary */}
          {isWidgetVisible('low_stock') && (
            <motion.div variants={itemVariants}>
              <DashboardRow4 
                lowStockList={lowStockRes || []} 
                stats={statsRes} 
              />
            </motion.div>
          )}

          {/* Row 5: Financial Metrics & Profit Margins */}
          {isWidgetVisible('financial_metrics') && (
            <motion.div variants={itemVariants}>
              <DashboardRow5 stats={statsRes} />
            </motion.div>
          )}

          {/* Row 6: Active Campaigns & Coupon Usage */}
          {isWidgetVisible('campaigns_promotions') && (
            <motion.div variants={itemVariants}>
              <DashboardRow6 />
            </motion.div>
          )}

          {/* Row 7: Customer Insights & Demographics */}
          {isWidgetVisible('customer_insights') && (
            <motion.div variants={itemVariants}>
              <DashboardRow7 />
            </motion.div>
          )}

          {/* Row 8: Web Conversion Metrics & Visitor Devices */}
          {isWidgetVisible('web_conversion') && (
            <motion.div variants={itemVariants}>
              <DashboardRow8 />
            </motion.div>
          )}

          {/* Row 9: Mobile App Downloads & Active Users */}
          {isWidgetVisible('mobile_app') && (
            <motion.div variants={itemVariants}>
              <DashboardRow9 />
            </motion.div>
          )}

          {/* Row 10: Attendance, Top Performers & Departments */}
          {isWidgetVisible('staff_performance') && (
            <motion.div variants={itemVariants}>
              <DashboardRow10 />
            </motion.div>
          )}

          {/* System Health Diagnostics Monitor */}
          {isWidgetVisible('system_health') && (
            <motion.div variants={itemVariants}>
              <SystemHealthWidget 
                healthData={healthRes} 
                isLoading={healthLoading} 
                onRefresh={refetchHealth}
              />
            </motion.div>
          )}
        </div>

        {/* Right Sidebar Widgets (Quick Actions & Activity Timeline) */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {isWidgetVisible('quick_actions') && (
            <motion.div variants={itemVariants}>
              <QuickActions />
            </motion.div>
          )}

          {isWidgetVisible('recent_activities') && (
            <motion.div variants={itemVariants}>
              <RecentActivities 
                activityLog={panelsRes?.activity_log || []} 
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardPage
