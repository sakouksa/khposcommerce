import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Store, Layers, Users, Percent, CreditCard,
  Database, FileClock, Settings, ChevronRight, ChevronLeft,
  Shield, ShieldCheck, LogOut, ChevronDown, Activity, Sparkles,
  Boxes, Server, Lock, ExternalLink, X
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useTranslation } from 'react-i18next'
import Header from './Header'
import Footer from './Footer'
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
  badge?: string
}

interface NavGroup {
  groupKey: string
  groupLabelKey?: string
  items: NavItem[]
}

// ─── Category Icon Color & Styling Map ───────────────────────────────────────

const CATEGORY_STYLES: Record<string, { colorClass: string; bgClass: string; hexColor: string }> = {
  dashboard:      { colorClass: 'text-sky-500',      bgClass: 'bg-sky-500/15 dark:bg-sky-500/25',      hexColor: '#0284c7' },
  platform:       { colorClass: 'text-indigo-600',   bgClass: 'bg-indigo-500/15 dark:bg-indigo-500/25', hexColor: '#6366f1' },
  administration: { colorClass: 'text-emerald-500',  bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/25', hexColor: '#10b981' },
  security:       { colorClass: 'text-rose-500',     bgClass: 'bg-rose-500/15 dark:bg-rose-500/25',     hexColor: '#f43f5e' },
  settings:       { colorClass: 'text-blue-600',     bgClass: 'bg-blue-600/15 dark:bg-blue-600/25',     hexColor: '#2563eb' },
  activity:       { colorClass: 'text-violet-500',   bgClass: 'bg-violet-500/15 dark:bg-violet-500/25', hexColor: '#7c3aed' },
}

// ─── Navigation Structure for Platform Super Admin ──────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'dashboard',
    groupLabelKey: 'Platform Overview',
    items: [
      { labelKey: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    ],
  },
  {
    groupKey: 'platform',
    groupLabelKey: 'Multi-Tenant SaaS',
    items: [
      { labelKey: 'Shops & Tenants', icon: <Store size={18} />, path: '/shops', badge: 'Tenants' },
      { labelKey: 'Subscription Plans', icon: <Layers size={18} />, path: '/plans' },
      { labelKey: 'Resellers & Partners', icon: <Percent size={18} />, path: '/resellers' },
    ],
  },
  {
    groupKey: 'administration',
    groupLabelKey: 'Platform Administration',
    items: [
      { labelKey: 'Super Admins & Staff', icon: <Users size={18} />, path: '/users' },
      { labelKey: 'Roles & Permissions', icon: <Shield size={18} />, path: '/roles' },
      { labelKey: 'Billing & Invoices', icon: <CreditCard size={18} />, path: '/billing', badge: 'KHQR' },
    ],
  },
  {
    groupKey: 'security',
    groupLabelKey: 'Operations & Security',
    items: [
      { labelKey: 'System Health & Backup', icon: <Boxes size={18} />, path: '/backup' },
      { labelKey: 'Audit & Activity Logs', icon: <FileClock size={18} />, path: '/activity-logs' },
      { labelKey: 'Platform Settings', icon: <Settings size={18} />, path: '/settings' },
    ],
  },
]

// ─── NavItem Component ───────────────────────────────────────────────────────

interface SidebarItemProps {
  item: NavItem
  collapsed: boolean
  groupKey: string
  onItemClick?: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, collapsed, groupKey, onItemClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation(['nav', 'common'])
  const { sidebar } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const isChildren = item.children && item.children.length > 0

  const isActive = Boolean(
    item.path &&
      (location.pathname === item.path ||
        (item.path !== '/dashboard' && location.pathname.startsWith(item.path)))
  )

  const activeCategory = CATEGORY_STYLES[groupKey] || CATEGORY_STYLES.platform
  const activeColor = sidebar?.activeColor || activeCategory.hexColor

  if (isChildren) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}
          `}
        >
          <div className="flex items-center gap-3">
            <span className={isActive ? activeCategory.colorClass : 'text-slate-400'}>
              {item.icon}
            </span>
            {!collapsed && <span>{item.labelKey}</span>}
          </div>
          {!collapsed && (
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        <AnimatePresence>
          {isOpen && !collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-8 space-y-1 overflow-hidden"
            >
              {item.children?.map((child) => {
                const isChildActive = location.pathname === child.path
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={onItemClick}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                      ${isChildActive ? 'bg-primary/15 text-primary font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}
                    `}
                  >
                    {child.icon}
                    <span>{child.labelKey}</span>
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
    <NavLink
      to={item.path || '#'}
      onClick={onItemClick}
      title={collapsed ? item.labelKey : undefined}
      className={({ isActive: navActive }) => `
        relative group flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
        ${
          navActive || isActive
            ? 'bg-primary text-white shadow-md shadow-primary/25 font-bold'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }
      `}
      style={({ isActive: navActive }) => (navActive || isActive ? { backgroundColor: activeColor } : {})}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
        <span className="shrink-0 transition-transform group-hover:scale-110">
          {item.icon}
        </span>
        {!collapsed && <span className="truncate">{item.labelKey}</span>}
      </div>

      {!collapsed && item.badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

// ─── PlatformLayout Main Component ──────────────────────────────────────────

export const PlatformLayout: React.FC = () => {
  const [isCollapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { sidebar } = useThemeStore()
  const { t } = useTranslation(['common'])

  const sidebarWidth = isCollapsed ? 76 : 260

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* ─── Mobile Sidebar Overlay / Drawer ──────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="relative w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-2xl h-full"
            >
              {/* Logo Header */}
              <div className="flex items-center justify-between h-[72px] px-4 border-b border-slate-800">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    navigate('/dashboard')
                    setMobileOpen(false)
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                    <ShieldCheck size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-white">
                      KHPosCommerce
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                        PLATFORM CORE
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold truncate">
                        SaaS Admin
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-6">
                {NAV_GROUPS.map((group) => (
                  <div key={group.groupKey} className="space-y-1.5">
                    {group.groupLabelKey && (
                      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {group.groupLabelKey}
                      </p>
                    )}
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <SidebarItem
                          key={item.labelKey}
                          item={item}
                          collapsed={false}
                          groupKey={group.groupKey}
                          onItemClick={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {/* User Profile Footer */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/60">
                <div
                  onClick={() => {
                    navigate('/profile')
                    setMobileOpen(false)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer group"
                >
                  <UserAvatar
                    src={user?.avatar}
                    name={user?.name || 'Super Admin'}
                    sizeClassName="w-8 h-8"
                    className="ring-2 ring-indigo-500/30"
                  />
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {user?.name || 'Super Admin'}
                    </p>
                    <p className="text-[10px] text-indigo-400 font-semibold truncate">
                      SaaS Super Admin
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLogout()
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Desktop Collapsible Sidebar Rail ─────────────────────────────── */}
      <aside
        style={{
          width: sidebarWidth,
          backgroundColor: sidebar?.bgColor || '#0f172a',
          borderColor: sidebar?.borderColor || 'rgba(128, 128, 128, 0.15)',
        }}
        className="hidden lg:flex flex-col transition-all duration-300 ease-in-out border-r relative z-30 flex-shrink-0 shadow-sm print:hidden select-none"
      >
        {/* Brand Header */}
        <div
          style={{ borderColor: sidebar?.borderColor || 'rgba(128, 128, 128, 0.15)' }}
          className="flex items-center h-[72px] px-3.5 border-b flex-shrink-0"
        >
          {!isCollapsed ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-3 cursor-pointer min-w-0"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <ShieldCheck size={22} className="text-white" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-black uppercase tracking-wider text-white truncate">
                  KHPosCommerce
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                    PLATFORM CORE
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold truncate">
                    SaaS Super Admin
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="mx-auto cursor-pointer"
              onClick={() => setCollapsed(false)}
              title="KHPosCommerce Platform Core"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck size={22} className="text-white" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupKey} className="space-y-1.5">
              {!isCollapsed && group.groupLabelKey && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.groupLabelKey}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.labelKey}
                    item={item}
                    collapsed={isCollapsed}
                    groupKey={group.groupKey}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Footer inside Sidebar */}
        <div
          style={{ borderColor: sidebar?.borderColor || 'rgba(128, 128, 128, 0.15)' }}
          className="p-3 border-t flex-shrink-0"
        >
          {!isCollapsed ? (
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <UserAvatar
                src={user?.avatar}
                name={user?.name || 'Super Admin'}
                sizeClassName="w-8 h-8"
                className="ring-2 ring-indigo-500/30"
              />
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Super Admin'}
                </p>
                <p className="text-[10px] text-indigo-400 font-semibold truncate capitalize">
                  {user?.roles?.[0]?.replace('_', ' ') || 'SaaS Super Admin'}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLogout()
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                onClick={() => navigate('/profile')}
                className="cursor-pointer hover:scale-105 transition-transform"
                title={user?.name || 'Super Admin'}
              >
                <UserAvatar
                  src={user?.avatar}
                  name={user?.name || 'Super Admin'}
                  sizeClassName="w-8 h-8"
                  className="ring-2 ring-indigo-500/30"
                />
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Collapse / Expand toggle button */}
        <button
          type="button"
          onClick={() => setCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shadow-md transition-colors z-40 cursor-pointer"
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ─── Main Content Container ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 print:overflow-visible print:block">
        <Header onToggleSidebar={() => setMobileOpen(!mobileOpen)} />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 print:p-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mx-auto max-w-7xl min-h-[calc(100vh-14rem)]"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Enterprise System Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default PlatformLayout
