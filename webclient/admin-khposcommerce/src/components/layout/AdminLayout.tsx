import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Warehouse,
  ShoppingBag, Settings, ChevronRight, ChevronLeft,
  Bell, Search, Sun, Moon, LogOut, User, Building2, Truck,
  DollarSign, BarChart3, ChevronDown, Store, Zap,
  Briefcase, FileText, History, ShieldAlert, ShieldCheck, BarChart2, Globe, X,
  Receipt, PackageCheck, RotateCcw, CreditCard, ArrowLeftRight, Tag, Ticket,
  Image, GitBranch, TrendingUp, Boxes, UserCheck, Shield, KeyRound,
  Trash2, FileClock, BellRing, SlidersHorizontal, Laptop, Lock, Bot,
  Clock, CalendarCheck, Calendar
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore, applyPrimaryCssVar } from '@/stores/themeStore'
import { useCompanyStore } from '@/stores/companyStore'
import { BrandLogo } from '@/components/common/BrandLogo'
import { useTranslation } from 'react-i18next'
import api from '@/api/client'
import Header from './Header'
import UserAvatar from '@/components/common/UserAvatar'

// ─── Navigation Types ────────────────────────────────────────────────────────

interface NavChild {
  labelKey: string
  path: string
  permission?: string | string[]
  icon?: React.ReactNode
}

interface NavItem {
  labelKey: string
  icon: React.ReactNode
  path?: string
  children?: NavChild[]
  permission?: string | string[]
}

interface NavGroup {
  groupKey: string
  groupLabelKey?: string
  items: NavItem[]
}

// ─── Category Icon Color & Styling Map ───────────────────────────────────────

const CATEGORY_STYLES: Record<string, { colorClass: string; bgClass: string; hexColor: string }> = {
  dashboard:      { colorClass: 'text-sky-500',      bgClass: 'bg-sky-500/15 dark:bg-sky-500/25',      hexColor: '#0284c7' },
  products:       { colorClass: 'text-indigo-500',   bgClass: 'bg-indigo-500/15 dark:bg-indigo-500/25', hexColor: '#6366f1' },
  inventory:      { colorClass: 'text-emerald-500',  bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/25', hexColor: '#10b981' },
  sales:          { colorClass: 'text-amber-500',    bgClass: 'bg-amber-500/15 dark:bg-amber-500/25',   hexColor: '#f59e0b' },
  customers:      { colorClass: 'text-pink-500',     bgClass: 'bg-pink-500/15 dark:bg-pink-500/25',     hexColor: '#ec4899' },
  purchases:      { colorClass: 'text-purple-500',   bgClass: 'bg-purple-500/15 dark:bg-purple-500/25', hexColor: '#8b5cf6' },
  employees:      { colorClass: 'text-teal-500',     bgClass: 'bg-teal-500/15 dark:bg-teal-500/25',     hexColor: '#14b8a6' },
  finance:        { colorClass: 'text-green-500',    bgClass: 'bg-green-500/15 dark:bg-green-500/25',   hexColor: '#22c55e' },
  cms:            { colorClass: 'text-blue-500',     bgClass: 'bg-blue-500/15 dark:bg-blue-500/25',     hexColor: '#3b82f6' },
  marketing:      { colorClass: 'text-yellow-500',   bgClass: 'bg-yellow-500/15 dark:bg-yellow-500/25', hexColor: '#eab308' },
  shipping:       { colorClass: 'text-orange-500',   bgClass: 'bg-orange-500/15 dark:bg-orange-500/25', hexColor: '#f97316' },
  company:        { colorClass: 'text-cyan-500',     bgClass: 'bg-cyan-500/15 dark:bg-cyan-500/25',     hexColor: '#06b6d4' },
  reports:        { colorClass: 'text-fuchsia-500',  bgClass: 'bg-fuchsia-500/15 dark:bg-fuchsia-500/25', hexColor: '#d946ef' },
  administration: { colorClass: 'text-rose-500',     bgClass: 'bg-rose-500/15 dark:bg-rose-500/25',     hexColor: '#f43f5e' },
  activity:       { colorClass: 'text-violet-500',   bgClass: 'bg-violet-500/15 dark:bg-violet-500/25', hexColor: '#7c3aed' },
  notifications:  { colorClass: 'text-indigo-400',   bgClass: 'bg-indigo-400/15 dark:bg-indigo-400/25', hexColor: '#818cf8' },
  chatbot:        { colorClass: 'text-indigo-500',   bgClass: 'bg-indigo-500/15 dark:bg-indigo-500/25', hexColor: '#6366f1' },
  security:       { colorClass: 'text-emerald-500',  bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/25', hexColor: '#10b981' },
  settings:       { colorClass: 'text-blue-600',     bgClass: 'bg-blue-600/15 dark:bg-blue-600/25',     hexColor: '#2563eb' },
}

// ─── Navigation Structure ─────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'dashboard',
    groupLabelKey: '',
    items: [
      { labelKey: 'Dashboard', icon: <LayoutDashboard size={17} />, path: '/dashboard' },
    ],
  },
  {
    groupKey: 'products',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.productManagement',
        icon: <Package size={17} />,
        path: '/products',
        permission: 'product.view',
      },
    ],
  },
  {
    groupKey: 'inventory',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.inventoryManagement',
        icon: <Warehouse size={17} />,
        path: '/inventory',
        permission: 'inventory.view',
      },
    ],
  },
  {
    groupKey: 'sales',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.salesManagement',
        icon: <ShoppingCart size={17} />,
        permission: 'sale.view',
        children: [
          { labelKey: 'nav.posTerminal',    path: '/pos', permission: ['pos.access', 'sale.create'], icon: <Store size={13.5} /> },
          { labelKey: 'nav.salesOrders',    path: '/sales', permission: ['sale.view', 'sales.view'], icon: <Receipt size={13.5} /> },
          { labelKey: 'orders',             path: '/orders', permission: ['order.view', 'orders.view'], icon: <PackageCheck size={13.5} /> },
          { labelKey: 'nav.returnsExchanges', path: '/returns', permission: ['order.view', 'orders.view', 'return.view'], icon: <RotateCcw size={13.5} /> },
          { labelKey: 'nav.returnPolicies', path: '/return-policies', permission: ['order.view', 'orders.view', 'return.view'], icon: <ShieldCheck size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'customers',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.customerManagement',
        icon: <Users size={17} />,
        path: '/customers',
        permission: 'customer.view',
      },
    ],
  },
  {
    groupKey: 'purchases',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.purchaseManagement',
        icon: <ShoppingBag size={17} />,
        permission: 'purchase.view',
        children: [
          { labelKey: 'nav.purchaseOrders', path: '/purchases', permission: 'purchase.view', icon: <ShoppingBag size={13.5} /> },
          { labelKey: 'nav.suppliers',       path: '/suppliers', permission: 'supplier.view', icon: <Truck size={13.5} /> },
          { labelKey: 'nav.purchaseReturns',path: '/purchases/returns', permission: 'purchase_return.view', icon: <RotateCcw size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'employees',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.employeeManagement',
        icon: <Briefcase size={17} />,
        permission: ['employee.view', 'employees.view'],
        children: [
          { labelKey: 'nav.employeeDirectory',    path: '/employees?tab=employees', permission: ['employee.view', 'employees.view'], icon: <Users size={13.5} /> },
          { labelKey: 'nav.attendanceManagement', path: '/employees?tab=attendance', permission: ['employee.view', 'employees.view'], icon: <Clock size={13.5} /> },
          { labelKey: 'nav.leaveManagement',      path: '/employees?tab=leaves', permission: ['employee.view', 'employees.view'], icon: <CalendarCheck size={13.5} /> },
          { labelKey: 'nav.holidays',             path: '/employees?tab=holidays', permission: ['employee.view', 'employees.view'], icon: <Calendar size={13.5} /> },
          { labelKey: 'nav.payrollManagement',    path: '/employees?tab=payrolls', permission: ['employee.view', 'employees.view', 'payroll.view'], icon: <DollarSign size={13.5} /> },
          { labelKey: 'nav.orgStructure',         path: '/employees?tab=org', permission: ['employee.view', 'employees.view', 'department.view'], icon: <Building2 size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'finance',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.financeManagement',
        icon: <DollarSign size={17} />,
        path: '/expenses',
        permission: 'finance.view',
      },
    ],
  },
  {
    groupKey: 'cms',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.contentManagement',
        icon: <FileText size={17} />,
        path: '/cms',
        permission: 'cms.view',
      },
    ],
  },
  {
    groupKey: 'marketing',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.marketing',
        icon: <Zap size={17} />,
        permission: 'promotions.view',
        children: [
          { labelKey: 'nav.promotions', path: '/marketing/promotions', permission: 'promotions.view', icon: <Tag size={13.5} /> },
          { labelKey: 'nav.coupons',    path: '/marketing/coupons', permission: 'coupons.view', icon: <Ticket size={13.5} /> },
          { labelKey: 'nav.flashSales', path: '/marketing/flash-sales', permission: 'flash_sales.view', icon: <Zap size={13.5} /> },
          { labelKey: 'nav.banners',    path: '/marketing/banners', permission: 'banners.view', icon: <Image size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'shipping',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.shippingManagement',
        icon: <Truck size={17} />,
        path: '/shipping',
        permission: 'shipping.view',
      },
    ],
  },
  {
    groupKey: 'company',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.companyManagement',
        icon: <Building2 size={17} />,
        permission: 'company.view',
        children: [
          { labelKey: 'nav.companyInfo', path: '/company', permission: 'company.view', icon: <Building2 size={13.5} /> },
          { labelKey: 'nav.branches',    path: '/branches', permission: 'company.view', icon: <GitBranch size={13.5} /> },
          { labelKey: 'nav.stores',      path: '/stores', permission: 'company.view', icon: <Store size={13.5} /> },
          { labelKey: 'nav.warehouses',  path: '/warehouses', permission: 'inventory.view', icon: <Warehouse size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'reports',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.reports',
        icon: <BarChart3 size={17} />,
        permission: 'report.view',
        children: [
          { labelKey: 'nav.salesReport',     path: '/reports/sales', permission: 'report.view', icon: <TrendingUp size={13.5} /> },
          { labelKey: 'nav.purchaseReport',  path: '/reports/purchase', permission: 'report.view', icon: <ShoppingBag size={13.5} /> },
          { labelKey: 'nav.inventoryReport', path: '/reports/inventory', permission: 'report.view', icon: <Boxes size={13.5} /> },
          { labelKey: 'nav.profitLossReport',path: '/reports/profit-loss', permission: 'report.view', icon: <DollarSign size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'administration',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.administration',
        icon: <ShieldAlert size={17} />,
        permission: 'user.view',
        children: [
          { labelKey: 'nav.users',       path: '/users', permission: 'user.view', icon: <UserCheck size={13.5} /> },
          { labelKey: 'nav.roles',       path: '/roles', permission: 'role.view', icon: <Shield size={13.5} /> },
          { labelKey: 'nav.permissions', path: '/permissions', permission: 'permission.view', icon: <KeyRound size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'activity',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.systemManagement',
        icon: <History size={17} />,
        permission: 'activity_log.view',
        children: [
          { labelKey: 'nav.recycleBin',      path: '/recycle-bin', permission: 'activity_log.view', icon: <Trash2 size={13.5} /> },
          { labelKey: 'nav.activityLogs',    path: '/activity-logs', permission: 'activity_log.view', icon: <FileClock size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'notifications',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.notifications',
        icon: <Bell size={17} />,
        permission: 'notification.view',
        children: [
          { labelKey: 'nav.allNotifications', path: '/notifications', permission: 'notification.view', icon: <BellRing size={13.5} /> },
          { labelKey: 'nav.notificationTemplates', path: '/notification-templates', permission: 'notification.template.view', icon: <FileText size={13.5} /> },
          { labelKey: 'nav.notificationSettings', path: '/notifications/settings', permission: 'notification.view', icon: <SlidersHorizontal size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'chatbot',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'AI Chatbot & Telegram',
        icon: <Bot size={17} />,
        path: '/chatbot',
      },
    ],
  },
  {
    groupKey: 'security',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.securityManagement',
        icon: <ShieldCheck size={17} />,
        children: [
          { labelKey: 'nav.securityOverview', path: '/security/overview', icon: <ShieldAlert size={13.5} /> },
          { labelKey: 'nav.connectedDevices',  path: '/security/devices', icon: <Laptop size={13.5} /> },
          { labelKey: 'nav.securitySettings', path: '/security/settings', permission: 'settings.view', icon: <Lock size={13.5} /> },
        ],
      },
    ],
  },
  {
    groupKey: 'settings',
    groupLabelKey: '',
    items: [
      {
        labelKey: 'nav.settingsManagement',
        icon: <Settings size={17} />,
        path: '/settings',
        permission: 'setting.view',
      },
    ],
  },
]

// ─── Route Match Helper for Sidebar Active States & Submenu Persistence ────────

export const isRouteActive = (
  currentUrl: string,
  targetUrl?: string,
  siblingPaths: string[] = []
): boolean => {
  if (!targetUrl) return false

  const [currentPath, currentQuery] = currentUrl.split('?')
  const [targetPath, targetQuery] = targetUrl.split('?')

  const cleanCurrent = currentPath.replace(/\/+$/, '') || '/'
  const cleanTarget = targetPath.replace(/\/+$/, '') || '/'

  // 0. Target has query parameters (e.g. /employees?tab=attendance)
  if (targetQuery) {
    if (cleanCurrent !== cleanTarget) return false
    const currentParams = new URLSearchParams(currentQuery || '')
    const targetParams = new URLSearchParams(targetQuery)
    let matches = true
    targetParams.forEach((val, key) => {
      const curVal = currentParams.get(key)
      if (key === 'tab' && val === 'org' && (curVal === 'org' || curVal === 'departments' || curVal === 'positions')) {
        return
      }
      if (key === 'tab' && val === 'employees' && (!curVal || curVal === 'employees')) {
        return
      }
      if (curVal !== val) matches = false
    })
    return matches
  }

  // If targetUrl has no query string, but siblings have query strings on the same base path (e.g. /employees vs /employees?tab=attendance)
  const hasSiblingWithQuery = siblingPaths.some(sib => {
    const [sibBase, sibQuery] = sib.split('?')
    return sibBase.replace(/\/+$/, '') === cleanTarget && Boolean(sibQuery)
  })

  if (hasSiblingWithQuery && cleanCurrent === cleanTarget) {
    const currentParams = new URLSearchParams(currentQuery || '')
    // If currentUrl has query matching any sibling, this default target is NOT active
    const matchesAnySibling = siblingPaths.some(sib => {
      const [, sibQuery] = sib.split('?')
      if (!sibQuery) return false
      const sibParams = new URLSearchParams(sibQuery)
      let allMatch = true
      sibParams.forEach((val, key) => {
        const curVal = currentParams.get(key)
        if (key === 'tab' && val === 'org' && (curVal === 'org' || curVal === 'departments' || curVal === 'positions')) {
          return
        }
        if (curVal !== val) allMatch = false
      })
      return allMatch
    })
    if (matchesAnySibling) return false
    // Also if default tab is employees, /employees?tab=employees matches /employees
    if (!currentParams.get('tab') || currentParams.get('tab') === 'employees') {
      return true
    }
    return false
  }

  // 1. Dashboard special case
  if (cleanTarget === '/dashboard') {
    return cleanCurrent === '/dashboard' || cleanCurrent === '/'
  }

  // 2. Exact match
  if (cleanCurrent === cleanTarget) {
    return true
  }

  // 3. Sibling specificity check (e.g. /purchases vs /purchases/returns)
  const hasMoreSpecificSibling = siblingPaths.some(sib => {
    const cleanSib = sib.split('?')[0].replace(/\/+$/, '')
    if (cleanSib === cleanTarget) return false
    return (cleanCurrent === cleanSib || cleanCurrent.startsWith(`${cleanSib}/`)) && cleanSib.length > cleanTarget.length
  })
  if (hasMoreSpecificSibling) {
    return false
  }

  // 4. Sub-route prefix matching (e.g. /suppliers/create matches /suppliers, /customers/1/edit matches /customers)
  if (cleanCurrent.startsWith(`${cleanTarget}/`)) {
    return true
  }

  // 5. Associated modular sub-paths
  // Products subpages (when products is standalone path /products):
  if (cleanTarget === '/products') {
    const productSubpages = ['/categories', '/brands', '/units', '/taxes', '/attributes', '/reviews']
    if (productSubpages.some(p => cleanCurrent === p || cleanCurrent.startsWith(`${p}/`))) {
      return true
    }
  }

  // Customers subpages:
  if (cleanTarget === '/customers') {
    const customerSubpages = ['/customers/groups', '/customers/addresses']
    if (customerSubpages.some(p => cleanCurrent === p || cleanCurrent.startsWith(`${p}/`))) {
      return true
    }
  }

  // Marketing base path:
  if (cleanTarget === '/marketing/promotions' && cleanCurrent === '/marketing') {
    return true
  }

  // Reports base path:
  if (cleanTarget === '/reports/sales' && cleanCurrent === '/reports') {
    return true
  }

  // Security base path:
  if (cleanTarget === '/security/overview' && cleanCurrent === '/security') {
    return true
  }

  return false
}

const getRadiusValue = (r?: string) => {
  if (!r) return '0.75rem'
  if (r === 'rounded-none') return '0px'
  if (r === 'rounded-sm') return '0.125rem'
  if (r === 'rounded' || r === 'rounded-md' || r === '0.375rem') return '0.375rem'
  if (r === 'rounded-lg' || r === '0.5rem') return '0.5rem'
  if (r === 'rounded-xl' || r === '0.75rem') return '0.75rem'
  if (r === 'rounded-2xl' || r === '1rem') return '1rem'
  if (r === 'rounded-3xl' || r === '1.5rem') return '1.5rem'
  if (r === 'rounded-full' || r === 'rounded-pill') return '9999px'
  if (r.endsWith('px') || r.endsWith('rem') || r.endsWith('%')) return r
  return '0.75rem'
}

// ─── SidebarItem Component with Micro-Animations & Curated Icon Colors ─────────

const SidebarItem: React.FC<{
  item: NavItem
  groupKey: string
  collapsed: boolean
  onItemClick?: () => void
  onExpand?: () => void
}> = ({ item, groupKey, collapsed, onItemClick, onExpand }) => {
  const { t } = useTranslation()
  const { hasPermission } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebar: sidebarConfig } = useThemeStore()

  const catStyle = CATEGORY_STYLES[groupKey] || { colorClass: 'text-primary', bgClass: 'bg-primary/15', hexColor: '#3b82f6' }

  // Filter children by permission
  const visibleChildren = item.children?.filter(child =>
    !child.permission || hasPermission(child.permission)
  )

  const childPaths = visibleChildren?.map(c => c.path) || []
  const currentFullUrl = location.pathname + location.search

  // Check if any child route is active
  const isGroupActive = visibleChildren && visibleChildren.length > 0
    ? visibleChildren.some(c => isRouteActive(currentFullUrl, c.path, childPaths))
    : false

  // Standalone item active check
  const isSingleActive = !visibleChildren || visibleChildren.length === 0
    ? isRouteActive(currentFullUrl, item.path)
    : false

  // Controlled open state: initialized with isGroupActive on load/refresh, updates on location change
  const [open, setOpen] = useState(() => isGroupActive)

  useEffect(() => {
    if (isGroupActive) {
      setOpen(true)
    }
  }, [currentFullUrl, isGroupActive])

  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const [flyoutCoords, setFlyoutCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (!collapsed) return
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const estimatedHeight = 45 + (visibleChildren?.length || 1) * 36
      const maxTop = window.innerHeight - estimatedHeight - 16
      const top = Math.max(12, Math.min(rect.top, maxTop))
      setFlyoutCoords({
        top,
        left: rect.right + 8,
      })
    }
    setFlyoutOpen(true)
  }

  const handleMouseLeave = () => {
    if (!collapsed) return
    closeTimerRef.current = setTimeout(() => {
      setFlyoutOpen(false)
    }, 150)
  }

  const handleFlyoutMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setFlyoutOpen(true)
  }

  const handleFlyoutMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setFlyoutOpen(false)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const paddingClass = collapsed ? 'py-2 px-1 justify-center' : (sidebarConfig?.compact ? 'py-1.5 px-2' : 'py-2 px-2.5')
  const roundedRadius = getRadiusValue(sidebarConfig?.roundedStyle)

  const customTextColor = sidebarConfig?.textColor
  const customActiveBg = sidebarConfig?.activeBgColor || 'hsl(var(--primary))'
  const customActiveText = sidebarConfig?.activeTextColor || '#ffffff'

  if (visibleChildren && visibleChildren.length > 0) {
    return (
      <div
        ref={anchorRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="space-y-1 relative"
      >
        <motion.button
          type="button"
          onClick={() => {
            if (collapsed) {
              if (onExpand) onExpand()
              else if (visibleChildren[0]?.path) navigate(visibleChildren[0].path)
            } else {
              setOpen(o => !o)
            }
          }}
          whileHover={{ x: collapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            borderRadius: roundedRadius,
            color: isGroupActive ? customActiveBg : (customTextColor || undefined),
            backgroundColor: isGroupActive ? `${customActiveBg}18` : undefined,
          }}
          className={`flex items-center w-full justify-between gap-3 text-xs font-bold transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${paddingClass} ${
            !isGroupActive ? 'hover:bg-foreground/10' : ''
          } ${!customTextColor && !isGroupActive ? 'text-foreground' : ''}`}
        >
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center mx-auto' : ''}`}>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                backgroundColor: isGroupActive ? customActiveBg : undefined,
                color: isGroupActive ? customActiveText : undefined,
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs ${
                !isGroupActive ? `${catStyle.bgClass} ${catStyle.colorClass}` : ''
              }`}
            >
              {item.icon}
            </motion.div>
            {!collapsed && <span className="font-bold tracking-wide">{t(item.labelKey)}</span>}
          </div>
          {!collapsed && (
            <ChevronDown
              size={14}
              style={{ color: isGroupActive ? customActiveBg : (customTextColor || undefined) }}
              className={`transition-transform duration-200 shrink-0 opacity-70 group-hover:opacity-100 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </motion.button>

        {/* Floating Flyout Submenu via Portal when Collapsed */}
        {collapsed && flyoutOpen && createPortal(
          <div
            onMouseEnter={handleFlyoutMouseEnter}
            onMouseLeave={handleFlyoutMouseLeave}
            style={{
              top: `${flyoutCoords.top}px`,
              left: `${flyoutCoords.left}px`,
              backgroundColor: sidebarConfig?.bgColor || '#0f172a',
              borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.2)',
              borderRadius: roundedRadius || '0.75rem',
              boxShadow: '0 16px 40px -6px rgba(0, 0, 0, 0.6), 0 6px 18px -3px rgba(0, 0, 0, 0.4)',
            }}
            className="fixed z-[9999] min-w-[210px] max-w-[260px] backdrop-blur-xl border p-2 space-y-1 select-none animate-in fade-in-50 zoom-in-95 duration-150"
          >
            {/* Invisible bridge for smooth mouse hover continuity across gap */}
            <div className="absolute -left-3 top-0 bottom-0 w-3" />

            <div
              style={{ borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.2)' }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 border-b mb-1"
            >
              <div
                style={{
                  backgroundColor: isGroupActive ? customActiveBg : undefined,
                  color: isGroupActive ? customActiveText : undefined,
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                  !isGroupActive ? `${catStyle.bgClass} ${catStyle.colorClass}` : ''
                }`}
              >
                {item.icon}
              </div>
              <span
                style={{ color: sidebarConfig?.textColor || '#ffffff' }}
                className="text-xs font-black tracking-wide truncate"
              >
                {t(item.labelKey)}
              </span>
            </div>

            <div className="space-y-0.5">
              {visibleChildren.map((child) => {
                const isChildActive = isRouteActive(currentFullUrl, child.path, childPaths)
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={() => {
                      setFlyoutOpen(false)
                      if (onItemClick) onItemClick()
                    }}
                    style={{
                      borderRadius: roundedRadius,
                      backgroundColor: isChildActive ? customActiveBg : undefined,
                      color: isChildActive ? customActiveText : (customTextColor || '#94a3b8'),
                    }}
                    className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-bold transition-all duration-150 ${
                      isChildActive
                        ? 'shadow-xs scale-[1.01]'
                        : 'hover:bg-white/10 hover:translate-x-1'
                    }`}
                  >
                    {child.icon ? (
                      <span
                        style={{ color: isChildActive ? customActiveText : catStyle.hexColor }}
                        className="shrink-0 transition-colors"
                      >
                        {child.icon}
                      </span>
                    ) : (
                      <span
                        style={{ backgroundColor: isChildActive ? customActiveText : catStyle.hexColor }}
                        className={`rounded-full shrink-0 transition-transform ${
                          isChildActive ? 'w-2 h-2 shadow-xs' : 'w-1.5 h-1.5 opacity-80'
                        }`}
                      />
                    )}
                    <span className="truncate">{t(child.labelKey)}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>,
          document.body
        )}

        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ borderColor: isGroupActive ? `${customActiveBg}60` : `${catStyle.hexColor}40` }}
              className="overflow-hidden ml-5 pl-2.5 border-l-2 space-y-1 my-1"
            >
              {visibleChildren.map((child) => {
                const isChildActive = isRouteActive(currentFullUrl, child.path, childPaths)
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={onItemClick}
                    style={{
                      borderRadius: roundedRadius,
                      backgroundColor: isChildActive ? customActiveBg : undefined,
                      color: isChildActive ? customActiveText : (customTextColor || undefined),
                    }}
                    className={`group flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold transition-all whitespace-nowrap ${
                      isChildActive
                        ? 'shadow-xs scale-[1.01]'
                        : `hover:bg-foreground/10 hover:translate-x-1 ${!customTextColor ? 'text-foreground' : ''}`
                    }`}
                  >
                    {child.icon ? (
                      <span
                        style={{ color: isChildActive ? customActiveText : catStyle.hexColor }}
                        className="shrink-0 opacity-85 group-hover:opacity-100 transition-opacity"
                      >
                        {child.icon}
                      </span>
                    ) : (
                      <motion.span
                        whileHover={{ scale: 1.5 }}
                        style={{ backgroundColor: isChildActive ? customActiveText : catStyle.hexColor }}
                        className={`rounded-full shrink-0 transition-transform ${
                          isChildActive ? 'w-2 h-2 shadow-xs' : 'w-1.5 h-1.5 opacity-70 group-hover:opacity-100'
                        }`}
                      />
                    )}
                    <span className="truncate">{t(child.labelKey)}</span>
                  </NavLink>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div
      ref={anchorRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <NavLink
        to={item.path!}
        onClick={onItemClick}
        style={{
          borderRadius: roundedRadius,
          backgroundColor: isSingleActive ? customActiveBg : undefined,
          color: isSingleActive ? customActiveText : (customTextColor || undefined),
        }}
        className={`group flex items-center gap-2.5 text-xs font-bold transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${paddingClass} ${
          isSingleActive
            ? 'shadow-md font-bold scale-[1.01]'
            : `hover:bg-foreground/10 hover:translate-x-1 ${!customTextColor ? 'text-foreground' : ''}`
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{
            backgroundColor: isSingleActive ? customActiveText : undefined,
            color: isSingleActive ? customActiveBg : undefined,
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs ${
            !isSingleActive ? `${catStyle.bgClass} ${catStyle.colorClass}` : ''
          }`}
        >
          {item.icon}
        </motion.div>
        {!collapsed && <span className="font-bold tracking-wide">{t(item.labelKey)}</span>}
      </NavLink>

      {/* Floating Single Item Pill via Portal when Collapsed */}
      {collapsed && flyoutOpen && createPortal(
        <div
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
          onClick={() => {
            setFlyoutOpen(false)
            navigate(item.path!)
            if (onItemClick) onItemClick()
          }}
          style={{
            top: `${flyoutCoords.top}px`,
            left: `${flyoutCoords.left}px`,
            backgroundColor: sidebarConfig?.bgColor || '#0f172a',
            borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.2)',
            color: sidebarConfig?.textColor || '#ffffff',
            borderRadius: roundedRadius || '0.75rem',
            boxShadow: '0 16px 40px -6px rgba(0, 0, 0, 0.6), 0 6px 18px -3px rgba(0, 0, 0, 0.4)',
          }}
          className="fixed z-[9999] flex items-center gap-2.5 px-3 py-2 backdrop-blur-xl border text-xs font-bold cursor-pointer select-none animate-in fade-in-50 zoom-in-95 duration-150 hover:bg-white/10"
        >
          <div className="absolute -left-3 top-0 bottom-0 w-3" />
          <div
            style={{
              backgroundColor: isSingleActive ? customActiveBg : undefined,
              color: isSingleActive ? customActiveText : undefined,
            }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              !isSingleActive ? `${catStyle.bgClass} ${catStyle.colorClass}` : ''
            }`}
          >
            {item.icon}
          </div>
          <span className="truncate">{t(item.labelKey)}</span>
        </div>,
        document.body
      )}
    </div>
  )
}

// ─── SidebarGroup Component ───────────────────────────────────────────────────

const SidebarGroup: React.FC<{
  group: NavGroup
  collapsed: boolean
  hasPermission: (p: string | string[]) => boolean
  onItemClick?: () => void
  onExpand?: () => void
}> = ({ group, collapsed, hasPermission, onItemClick, onExpand }) => {
  const { t } = useTranslation()
  const { sidebar: sidebarConfig } = useThemeStore()

  const visibleItems = group.items.filter(item => {
    if (item.permission && !hasPermission(item.permission)) return false

    if (item.children) {
      const visibleChildren = item.children.filter(child =>
        !child.permission || hasPermission(child.permission)
      )
      return visibleChildren.length > 0
    }

    return true
  })

  if (visibleItems.length === 0) return null

  return (
    <div className="space-y-0.5">
      {!collapsed && group.groupLabelKey && (
        <p
          style={{ color: sidebarConfig?.textColor || undefined }}
          className="px-3 pt-3.5 pb-1 text-[10px] font-extrabold uppercase tracking-widest opacity-60 select-none"
        >
          {t(group.groupLabelKey)}
        </p>
      )}
      {collapsed && group.groupLabelKey && (
        <div
          style={{ borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.15)' }}
          className="border-t my-2"
        />
      )}
      {visibleItems.map(item => (
        <SidebarItem
          key={item.labelKey}
          item={item}
          groupKey={group.groupKey}
          collapsed={collapsed}
          onItemClick={onItemClick}
          onExpand={onExpand}
        />
      ))}
    </div>
  )
}

// ─── AdminLayout Component ────────────────────────────────────────────────────

const AdminLayout: React.FC = () => {
  // Collapse by default on screens < 1280px (tablets, smaller laptops, resized windows)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1280
    }
    return false
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, darkMode, logout, hasPermission } = useAuthStore()
  const { primaryColor, sidebar: sidebarConfig } = useThemeStore()
  const { branding, fetchBranding } = useCompanyStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (primaryColor) {
      applyPrimaryCssVar(primaryColor)
    }
  }, [primaryColor])

  // Automatically close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Handle responsive resizing (flexible auto-expand on large screens and auto-collapse on small/medium screens)
  useEffect(() => {
    let prevWidth = typeof window !== 'undefined' ? window.innerWidth : 1280

    const handleResize = () => {
      const currentWidth = window.innerWidth

      // When expanding from small/medium screen (<1280) to large screen (>=1280): auto-expand
      if (prevWidth < 1280 && currentWidth >= 1280) {
        setCollapsed(false)
      }
      // When shrinking from large screen (>=1280) to medium screen (<1280): auto-collapse
      else if (prevWidth >= 1280 && currentWidth < 1280 && currentWidth >= 640) {
        setCollapsed(true)
      }

      // Close mobile drawer when resized to desktop (>=640)
      if (currentWidth >= 640) {
        setMobileOpen(false)
      }

      prevWidth = currentWidth
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    navigate('/login')
  }

  const handleToggleSidebar = () => {
    if (window.innerWidth < 640) {
      setMobileOpen(prev => !prev)
    } else {
      setCollapsed(prev => !prev)
    }
  }

  const isCollapsed = collapsed
  const sidebarWidth = isCollapsed
    ? '68px'
    : sidebarConfig?.width
    ? `${sidebarConfig.width}px`
    : '256px'

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Mobile Sidebar Drawer & Backdrop (for phones < 640px) ─────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs sm:hidden cursor-pointer print:hidden"
            />

            {/* Slide-out Mobile Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                width: '280px',
                backgroundColor: sidebarConfig?.bgColor || '#0f172a',
                borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.15)',
              }}
              className="fixed top-0 bottom-0 left-0 z-[70] flex flex-col border-r shadow-2xl sm:hidden print:hidden"
            >
              {/* Header with Close Button */}
              <div
                style={{ borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.15)' }}
                className="flex items-center justify-between h-[72px] px-4 border-b flex-shrink-0"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                  onClick={() => {
                    navigate('/dashboard')
                    setMobileOpen(false)
                  }}
                >
                  <BrandLogo size="md" customLogo={branding.logo || user?.company?.logo} customName={branding.brand_name || user?.company?.name || 'OptaPOS'} />
                  <div className="overflow-hidden min-w-0">
                    <p
                      style={{ color: sidebarConfig?.textColor || undefined }}
                      className="text-sm font-black uppercase tracking-wider leading-none truncate"
                    >
                      {branding.brand_name || user?.company?.name || 'OptaPOS'}
                    </p>
                    <span
                      style={{ color: sidebarConfig?.textColor || undefined }}
                      className="text-[11px] opacity-70 font-semibold block mt-1 truncate"
                    >
                      {user?.branch?.name || t('common.management_system', 'Management System')}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: sidebarConfig?.textColor || undefined }}
                  className="p-2 rounded-xl hover:bg-foreground/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
                  aria-label="Close Sidebar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-1">
                {NAV_GROUPS.map(group => (
                  <SidebarGroup
                    key={group.groupKey}
                    group={group}
                    collapsed={false}
                    hasPermission={hasPermission}
                    onItemClick={() => setMobileOpen(false)}
                  />
                ))}
              </nav>

              {/* User Profile Footer */}
              <div
                style={{ borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.15)' }}
                className="p-3 border-t"
              >
                <div
                  onClick={() => {
                    navigate('/profile')
                    setMobileOpen(false)
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-foreground/10 transition-colors cursor-pointer group shadow-2xs"
                >
                  <UserAvatar
                    src={user?.avatar}
                    name={user?.name || 'Super Admin'}
                    sizeClassName="w-8 h-8"
                    className="ring-2 ring-primary/20"
                  />
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p
                      style={{ color: sidebarConfig?.textColor || undefined }}
                      className="text-xs font-extrabold truncate"
                    >
                      {user?.name || 'Super Admin'}
                    </p>
                    <p
                      style={{ color: sidebarConfig?.textColor || undefined }}
                      className="text-[10px] opacity-70 truncate capitalize font-semibold"
                    >
                      {user?.roles?.[0]?.replace('_', ' ') || 'super admin'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLogout()
                    }}
                    style={{ color: sidebarConfig?.textColor || undefined }}
                    className="opacity-70 hover:opacity-100 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                    title={t('auth.logout', 'Logout')}
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Icon Rail & Collapsible Sidebar (Visible on sm+ screens) ──────── */}
      <aside
        style={{
          width: sidebarWidth,
          backgroundColor: sidebarConfig?.bgColor || '#0f172a',
          borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.15)',
        }}
        className="hidden sm:flex flex-col transition-all duration-300 ease-in-out border-r relative z-50 flex-shrink-0 shadow-sm print:hidden"
      >
        {/* Logo Header with Spring Glow */}
        <div
          style={{ borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.15)' }}
          className="flex items-center h-[72px] px-3.5 border-b flex-shrink-0"
        >
          {!isCollapsed ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer min-w-0"
              onClick={() => navigate('/dashboard')}
            >
              <BrandLogo size="md" customLogo={branding.logo || user?.company?.logo} customName={branding.brand_name || user?.company?.name || 'OptaPOS'} />
              <div className="overflow-hidden min-w-0">
                <p
                  style={{ color: sidebarConfig?.textColor || undefined }}
                  className="text-sm font-black uppercase tracking-wider leading-none truncate"
                >
                  {branding.brand_name || user?.company?.name || 'OptaPOS'}
                </p>
                <span
                  style={{ color: sidebarConfig?.textColor || undefined }}
                  className="text-[11px] opacity-70 font-semibold block mt-1 truncate"
                >
                  {user?.branch?.name || t('common.management_system', 'Management System')}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="mx-auto cursor-pointer"
              onClick={() => setCollapsed(false)}
              title={user?.company?.name || branding.brand_name || 'OptaPOS'}
            >
              <BrandLogo size="md" customLogo={branding.logo || user?.company?.logo} customName={branding.brand_name || user?.company?.name || 'OptaPOS'} />
            </motion.div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-1">
          {NAV_GROUPS.map(group => (
            <SidebarGroup
              key={group.groupKey}
              group={group}
              collapsed={isCollapsed}
              hasPermission={hasPermission}
              onExpand={() => setCollapsed(false)}
            />
          ))}
        </nav>

        {/* User Card with Micro-Spring Animation */}
        {!isCollapsed ? (
          <div
            style={{ borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.15)' }}
            className="p-3 border-t"
          >
            <motion.div
              whileHover={{ scale: 1.02, x: 2 }}
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-foreground/10 transition-colors cursor-pointer group shadow-2xs"
            >
              <UserAvatar
                src={user?.avatar}
                name={user?.name || 'Super Admin'}
                sizeClassName="w-8 h-8"
                className="ring-2 ring-primary/20"
              />
              <div className="flex-1 overflow-hidden min-w-0">
                <p
                  style={{ color: sidebarConfig?.textColor || undefined }}
                  className="text-xs font-extrabold truncate"
                >
                  {user?.name || 'Super Admin'}
                </p>
                <p
                  style={{ color: sidebarConfig?.textColor || undefined }}
                  className="text-[10px] opacity-70 truncate capitalize font-semibold"
                >
                  {user?.roles?.[0]?.replace('_', ' ') || 'super admin'}
                </p>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleLogout()
                }}
                style={{ color: sidebarConfig?.textColor || undefined }}
                className="opacity-70 hover:opacity-100 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                title={t('auth.logout', 'Logout')}
              >
                <LogOut size={15} />
              </motion.button>
            </motion.div>
          </div>
        ) : (
          <div
            style={{ borderColor: sidebarConfig?.borderColor || 'rgba(128, 128, 128, 0.15)' }}
            className="p-2 border-t flex flex-col items-center gap-2"
          >
            <div
              onClick={() => navigate('/profile')}
              title={user?.name || 'Super Admin'}
              className="cursor-pointer hover:scale-110 transition-transform"
            >
              <UserAvatar
                src={user?.avatar}
                name={user?.name || 'Super Admin'}
                sizeClassName="w-8 h-8"
                className="ring-2 ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{ color: sidebarConfig?.textColor || undefined }}
              className="opacity-70 hover:opacity-100 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
              title={t('auth.logout', 'Logout')}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Collapse / Expand toggle button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full
                     flex items-center justify-center text-muted-foreground hover:text-foreground
                     shadow-md transition-colors z-30 cursor-pointer print:hidden"
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </motion.button>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 print:overflow-visible print:block">
        <Header onToggleSidebar={handleToggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background print:overflow-visible print:bg-white print:p-0">
          <div className="p-4 sm:p-6 print:p-0">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="print:opacity-100 print:transform-none"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
