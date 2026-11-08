import React from 'react'
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart,
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  Activity,
  Zap,
  Clock,
  Bell,
  Megaphone,
  Smile,
  Globe2,
  Smartphone,
  UserCheck,
} from 'lucide-react'

export type SupportedLang = 'km' | 'en'

export interface MultiLangString {
  km: string
  en: string
}

export interface WidgetDefinition {
  id: string
  name: MultiLangString
  description: MultiLangString
  category: 'kpi' | 'analytics' | 'inventory' | 'finance' | 'system'
  categoryLabel: MultiLangString
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  badgeColor: string
  defaultSize: 'small' | 'medium' | 'large'
  defaultOrder: number
}

export const DASHBOARD_WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  business_alerts: {
    id: 'business_alerts',
    name: {
      km: 'ដំណឹង និងការជូនដំណឹងអាជីវកម្ម',
      en: 'Business Alerts & Feeds',
    },
    description: {
      km: 'បង្ហាញការជូនដំណឹងសំខាន់ៗ ដំណឹងស្តុក និងសកម្មភាពមិនប្រក្រតី',
      en: 'Displays high-priority business alerts, low stock warnings, and unusual transactions',
    },
    category: 'system',
    categoryLabel: {
      km: 'ប្រព័ន្ធ & ការជូនដំណឹង',
      en: 'System & Alerts',
    },
    icon: Bell,
    gradient: 'from-amber-500 to-rose-500',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    defaultSize: 'large',
    defaultOrder: 0,
  },
  today_sales: {
    id: 'today_sales',
    name: {
      km: 'ការលក់ប្រចាំថ្ងៃ',
      en: 'Today Sales Revenue',
    },
    description: {
      km: 'បង្ហាញចំណូលសរុបបានមកពីការលក់ប្រចាំថ្ងៃ',
      en: 'Displays today total sales revenue and trend',
    },
    category: 'kpi',
    categoryLabel: {
      km: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: TrendingUp,
    gradient: 'from-blue-500 to-indigo-600',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    defaultSize: 'medium',
    defaultOrder: 1,
  },
  today_orders: {
    id: 'today_orders',
    name: {
      km: 'ការកុម្ម៉ង់ប្រចាំថ្ងៃ',
      en: 'Today Orders Count',
    },
    description: {
      km: 'ចំនួនប្រតិបត្តិការវិក្កយបត្រលក់ដែលបានចេញថ្ងៃនេះ',
      en: 'Total count of sales invoices processed today',
    },
    category: 'kpi',
    categoryLabel: {
      km: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: ShoppingCart,
    gradient: 'from-purple-500 to-violet-600',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    defaultSize: 'medium',
    defaultOrder: 2,
  },
  total_customers: {
    id: 'total_customers',
    name: {
      km: 'អតិថិជនសរុប',
      en: 'Total Customers',
    },
    description: {
      km: 'ចំនួនអតិថិជនដែលបានចុះឈ្មោះ និងកំណើនអតិថិជន',
      en: 'Registered customer count and growth metrics',
    },
    category: 'kpi',
    categoryLabel: {
      km: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: Users,
    gradient: 'from-sky-500 to-cyan-600',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    defaultSize: 'medium',
    defaultOrder: 3,
  },
  total_products: {
    id: 'total_products',
    name: {
      km: 'ទំនិញសរុប',
      en: 'Total Products in Catalog',
    },
    description: {
      km: 'ចំនួនមុខទំនិញសរុបក្នុងកាតាឡុកប្រព័ន្ធ',
      en: 'Total number of catalog items in system database',
    },
    category: 'inventory',
    categoryLabel: {
      km: 'ស្តុក & ទំនិញ',
      en: 'Inventory & Catalog',
    },
    icon: Package,
    gradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    defaultSize: 'medium',
    defaultOrder: 4,
  },
  sales_overview: {
    id: 'sales_overview',
    name: {
      km: 'ក្រាហ្វិកវិភាគការលក់',
      en: 'Sales Analytics Charts',
    },
    description: {
      km: 'ក្រាហ្វិកប្រៀបធៀបចំណូលប្រចាំសប្តាហ៍ ខែ និងប្រចាំឆ្នាំ',
      en: 'Weekly, monthly, and annual revenue analytics visual charts',
    },
    category: 'analytics',
    categoryLabel: {
      km: 'វិភាគ & ក្រាហ្វិក',
      en: 'Analytics & Visuals',
    },
    icon: BarChart3,
    gradient: 'from-indigo-500 to-blue-600',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    defaultSize: 'large',
    defaultOrder: 5,
  },
  category_sales: {
    id: 'category_sales',
    name: {
      km: 'ការលក់តាមប្រភេទទំនិញ',
      en: 'Category Sales Breakdown',
    },
    description: {
      km: 'ក្រាហ្វិកបង្ហាញភាគរយចំណូលតាមប្រភេទក្រុមទំនិញ',
      en: 'Breakdown pie/donut chart of revenue by product category',
    },
    category: 'analytics',
    categoryLabel: {
      km: 'វិភាគ & ក្រាហ្វិក',
      en: 'Analytics & Visuals',
    },
    icon: PieChart,
    gradient: 'from-fuchsia-500 to-pink-600',
    badgeColor: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
    defaultSize: 'medium',
    defaultOrder: 6,
  },
  recent_orders: {
    id: 'recent_orders',
    name: {
      km: 'ការកុម្ម៉ង់ថ្មីៗ & ទំនិញលក់ដាច់',
      en: 'Recent Orders & Top Products',
    },
    description: {
      km: 'បញ្ជីវិក្កយបត្រចុងក្រោយ ទំនិញលក់ដាច់បំផុត និងអតិថិជនថ្មីៗ',
      en: 'Live view of recent orders, top revenue products, and new customers',
    },
    category: 'kpi',
    categoryLabel: {
      km: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: ShoppingBag,
    gradient: 'from-blue-600 to-indigo-700',
    badgeColor: 'bg-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-600/20',
    defaultSize: 'large',
    defaultOrder: 7,
  },
  low_stock: {
    id: 'low_stock',
    name: {
      km: 'ទំនិញជិតអស់ស្តុក & ឃ្លាំង',
      en: 'Low Stock & Warehouse Alerts',
    },
    description: {
      km: 'បញ្ជីទំនិញដែលជិតអស់ពីស្តុក និងការបែងចែកស្តុកតាមឃ្លាំង',
      en: 'Critical inventory stock level warnings and warehouse breakdown',
    },
    category: 'inventory',
    categoryLabel: {
      km: 'ស្តុក & ទំនិញ',
      en: 'Inventory & Catalog',
    },
    icon: AlertTriangle,
    gradient: 'from-rose-500 to-amber-600',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    defaultSize: 'large',
    defaultOrder: 8,
  },
  financial_metrics: {
    id: 'financial_metrics',
    name: {
      km: 'ព័ត៌មានហិរញ្ញវត្ថុ & ចំណេញ',
      en: 'Financial Metrics & Margins',
    },
    description: {
      km: 'សូចនាករប្រាក់ចំណេញដុល ចំណេញសុទ្ធ និងចំណាយប្រតិបត្តិការ',
      en: 'Gross profit, net profit margins, and operating expense breakdown',
    },
    category: 'finance',
    categoryLabel: {
      km: 'ហិរញ្ញវត្ថុ & គណនេយ្យ',
      en: 'Finance & Accounting',
    },
    icon: DollarSign,
    gradient: 'from-emerald-600 to-teal-700',
    badgeColor: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-600/20',
    defaultSize: 'large',
    defaultOrder: 9,
  },
  campaigns_promotions: {
    id: 'campaigns_promotions',
    name: {
      km: 'យុទ្ធនាការ និងប័ណ្ណបញ្ចុះតម្លៃ',
      en: 'Active Campaigns & Coupons',
    },
    description: {
      km: 'បញ្ជីយុទ្ធនាការទីផ្សារ ប័ណ្ណបញ្ចុះតម្លៃ និងកម្មវិធីណែនាំ',
      en: 'Active marketing campaigns, coupon usages, and affiliate referrals',
    },
    category: 'analytics',
    categoryLabel: {
      km: 'វិភាគ & ក្រាហ្វិក',
      en: 'Analytics & Visuals',
    },
    icon: Megaphone,
    gradient: 'from-purple-600 to-pink-600',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    defaultSize: 'large',
    defaultOrder: 10,
  },
  customer_insights: {
    id: 'customer_insights',
    name: {
      km: 'ការវិភាគអតិថិជន & ទីតាំង',
      en: 'Customer Insights & Locations',
    },
    description: {
      km: 'កំណើនអតិថិជន ប្រភេទអតិថិជន និងតំបន់អតិថិជនសកម្មបំផុត',
      en: 'Customer growth, retention rates, and top active locations',
    },
    category: 'analytics',
    categoryLabel: {
      km: 'វិភាគ & ក្រាហ្វិក',
      en: 'Analytics & Visuals',
    },
    icon: Smile,
    gradient: 'from-sky-500 to-indigo-600',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    defaultSize: 'large',
    defaultOrder: 11,
  },
  web_conversion: {
    id: 'web_conversion',
    name: {
      km: 'វិភាគទស្សនកិច្ចវេបសាយ',
      en: 'Web Traffic & Conversion',
    },
    description: {
      km: 'អត្រាបំប្លែងការទស្សនា បញ្ជីទំព័រមើលច្រើន និងឧបករណ៍ប្រើប្រាស់',
      en: 'Web conversion rates, top visited pages, and visitor device breakdown',
    },
    category: 'analytics',
    categoryLabel: {
      km: 'វិភាគ & ក្រាហ្វិក',
      en: 'Analytics & Visuals',
    },
    icon: Globe2,
    gradient: 'from-blue-500 to-cyan-600',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    defaultSize: 'large',
    defaultOrder: 12,
  },
  mobile_app: {
    id: 'mobile_app',
    name: {
      km: 'កម្មវិធីទូរស័ព្ទ & អ្នកប្រើប្រាស់',
      en: 'Mobile App Analytics',
    },
    description: {
      km: 'ចំនួនទាញយកកម្មវិធី អ្នកប្រើប្រាស់សកម្មប្រចាំថ្ងៃ និង Push Notifications',
      en: 'App downloads, daily active users (DAU), and push notification delivery',
    },
    category: 'analytics',
    categoryLabel: {
      km: 'វិភាគ & ក្រាហ្វិក',
      en: 'Analytics & Visuals',
    },
    icon: Smartphone,
    gradient: 'from-indigo-500 to-purple-600',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    defaultSize: 'large',
    defaultOrder: 13,
  },
  staff_performance: {
    id: 'staff_performance',
    name: {
      km: 'វត្តមានបុគ្គលិក & បើកប្រាក់បៀវត្សរ៍',
      en: 'Staff Attendance & Performance',
    },
    description: {
      km: 'អត្រាវត្តមានបុគ្គលិក បុគ្គលិកឆ្នើមលក់ដាច់បំផុត និងកញ្ចប់បៀវត្សរ៍',
      en: 'Staff attendance rate, top POS sales champions, and active department stats',
    },
    category: 'system',
    categoryLabel: {
      km: 'ប្រព័ន្ធ & ការជូនដំណឹង',
      en: 'System & Alerts',
    },
    icon: UserCheck,
    gradient: 'from-blue-600 to-teal-600',
    badgeColor: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-600/20',
    defaultSize: 'large',
    defaultOrder: 14,
  },
  system_health: {
    id: 'system_health',
    name: {
      km: 'ស្ថានភាពប្រព័ន្ធ & សុខភាព',
      en: 'System Health Diagnostics',
    },
    description: {
      km: 'ត្រួតពិនិត្យល្បឿន Server, Database Connection, និងសេវាកម្ម',
      en: 'Server performance monitor, database status, and API health response times',
    },
    category: 'system',
    categoryLabel: {
      km: 'ប្រព័ន្ធ & ការជូនដំណឹង',
      en: 'System & Alerts',
    },
    icon: Activity,
    gradient: 'from-teal-500 to-cyan-600',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    defaultSize: 'large',
    defaultOrder: 15,
  },
  quick_actions: {
    id: 'quick_actions',
    name: {
      km: 'សកម្មភាពរហ័ស',
      en: 'Quick Actions Bar',
    },
    description: {
      km: 'ប៊ូតុងផ្លូវកាត់សម្រាប់បង្កើតការលក់ថ្មី បន្ថែមទំនិញ ឬមើលរបាយការណ៍',
      en: 'Shortcut launchpad to quickly initiate sales, add products, or check reports',
    },
    category: 'kpi',
    categoryLabel: {
      km: 'ពាណិជ្ជកម្ម & KPI',
      en: 'Commerce & KPI',
    },
    icon: Zap,
    gradient: 'from-amber-500 to-yellow-600',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    defaultSize: 'medium',
    defaultOrder: 16,
  },
  recent_activities: {
    id: 'recent_activities',
    name: {
      km: 'កំណត់ហេតុសកម្មភាពថ្មីៗ',
      en: 'Recent Activity Timeline',
    },
    description: {
      km: 'បន្ទាត់ពេលវេលានៃសកម្មភាពអ្នកប្រើប្រាស់ និងប្រតិបត្តិការចុងក្រោយ',
      en: 'Chronological timeline of real-time user updates and audit logs',
    },
    category: 'system',
    categoryLabel: {
      km: 'ប្រព័ន្ធ & ការជូនដំណឹង',
      en: 'System & Alerts',
    },
    icon: Clock,
    gradient: 'from-slate-600 to-slate-800',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    defaultSize: 'medium',
    defaultOrder: 17,
  },
}

export const DEFAULT_WIDGETS_LIST = Object.values(DASHBOARD_WIDGET_REGISTRY).map((w) => ({
  id: w.id,
  visible: true,
  size: w.defaultSize,
  order: w.defaultOrder,
}))

export const PRESET_LAYOUTS = [
  {
    id: 'default',
    name: {
      km: 'ទម្រង់ដើមប្រព័ន្ធ',
      en: 'Standard Default',
    },
    desc: {
      km: 'បង្ហាញ widgets ទាំងអស់តាមលំដាប់លំដោយស្តង់ដារ',
      en: 'Shows all widgets in balanced standard order',
    },
  },
  {
    id: 'sales_focus',
    name: {
      km: 'ផ្តោតលើការលក់ & KPI',
      en: 'Sales & KPI Focus',
    },
    desc: {
      km: 'បង្ហាញតែ widgets ការលក់ ចំណូល វិក្កយបត្រ និងក្រាហ្វិកវិភាគ',
      en: 'Prioritizes sales metrics, orders, revenue charts, and top items',
    },
  },
  {
    id: 'inventory_focus',
    name: {
      km: 'ផ្តោតលើស្តុក & ឃ្លាំង',
      en: 'Inventory Focus',
    },
    desc: {
      km: 'បង្ហាញ widgets ទំនិញ ស្តុកជិតអស់ ឃ្លាំង និងដំណឹងអាជីវកម្ម',
      en: 'Prioritizes product catalog, low stock alerts, and warehouse analytics',
    },
  },
  {
    id: 'compact',
    name: {
      km: 'ទម្រង់បង្រួមតូច',
      en: 'Compact Minimal',
    },
    desc: {
      km: 'លាក់ widgets មិនចាំបាច់ ដើម្បីមើលតែ metrics សំខាន់ៗបំផុត',
      en: 'Hides low priority widgets for a clutter-free executive view',
    },
  },
]

export function getWidgetLocalizedString(
  strObj: MultiLangString | undefined,
  lang: string
): string {
  if (!strObj) return ''
  const validLang: SupportedLang = lang.startsWith('en') ? 'en' : 'km'
  return strObj[validLang] || strObj.km || strObj.en || ''
}
