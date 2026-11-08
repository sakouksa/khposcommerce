import api from '@/api/client'

export interface PlatformSummaryStats {
  total_shops: number
  active_shops: number
  resellers: number
  customers: number
  total_products: number
  total_orders: number
  total_revenue: number
  saas_revenue: number
  active_subscriptions: number
}

export interface RevenueChartPoint {
  date: string
  fullDate: string
  revenue: number
}

export interface OrderStatusPoint {
  name: string
  value: number
  color: string
}

export interface MonthShopPoint {
  month: string
  shops: number
}

export interface PlanShopPoint {
  plan: string
  slug: string
  count: number
  price: number
}

export interface RecentCompanyItem {
  id: number
  name: string
  slug: string
  email: string | null
  phone: string | null
  is_active: boolean
  owner_name: string
  plan_name: string
  plan_slug: string
  sub_status: string
  branches_count: number
  stores_count: number
  created_at: string
}

export interface PlatformStatsResponse {
  summary: PlatformSummaryStats
  revenue_chart: RevenueChartPoint[]
  orders_by_status: OrderStatusPoint[]
  new_shops_by_month: MonthShopPoint[]
  shops_by_plan: PlanShopPoint[]
  recent_companies: RecentCompanyItem[]
}

export const platformService = {
  async getDashboardStats(): Promise<PlatformStatsResponse> {
    const res = await api.get('/platform/dashboard/stats')
    return res.data?.data
  },

  async getCompanies(params?: Record<string, any>) {
    const res = await api.get('/platform/companies', { params })
    return res.data?.data
  },

  async getPlans() {
    const res = await api.get('/platform/plans')
    return res.data?.data
  },
}
