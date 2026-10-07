import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Menu, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import HeaderSearch from './HeaderSearch'
import HeaderActions from './HeaderActions'
import { useThemeStore } from '@/stores/themeStore'

interface HeaderProps {
  onToggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation(['common', 'nav'])
  const { navbar, themeMode } = useThemeStore()
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Generate dynamic breadcrumbs based on active route path
  const pathSegments = location.pathname.split('/').filter(Boolean)
  
  const getBreadcrumbLabel = (segment: string) => {
    switch (segment) {
      case 'dashboard':
        return t('nav.platformDashboard', 'Platform Dashboard')
      case 'shops':
        return t('nav.shops', 'Shops & Tenants')
      case 'plans':
        return t('nav.plans', 'Subscription Plans')
      case 'users':
        return t('nav.superAdmins', 'Super Admins & Staff')
      case 'resellers':
        return t('nav.resellers', 'Resellers & Partners')
      case 'billing':
        return t('nav.billing', 'Billing & Invoices')
      case 'backup':
        return t('nav.backup', 'System Health & Backup')
      case 'activity-logs':
        return t('nav.activityLogs', 'Audit Logs')
      case 'settings':
        return t('nav.platformSettings', 'Platform Settings')
      case 'roles':
        return t('nav.roles', 'Roles')
      case 'permissions':
        return t('nav.permissions', 'Permissions')
      case 'notifications':
        return t('nav.broadcastNotifications', 'Broadcast Notifications')
      case 'notification-templates':
        return t('nav.notificationTemplates', 'Notification Templates')
      case 'chatbot':
        return t('nav.chatbot', 'AI Chatbot & Telegram')
      case 'profile':
        return t('profile.title', 'Super Admin Profile')
      case 'create':
        return t('common.create', 'Create')
      case 'edit':
        return t('common.edit', 'Edit')
      default:
        return segment.charAt(0).toUpperCase() + segment.slice(1)
    }
  }

  const customTextColor = navbar?.textColor

  const getShadowStyle = (shadow?: string, darkMode?: boolean) => {
    if (!shadow || shadow === 'none') return 'none'

    if (darkMode) {
      switch (shadow) {
        case 'sm':
          return '0 3px 12px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.3)'
        case 'md':
          return '0 8px 24px -2px rgba(0, 0, 0, 0.7), 0 4px 10px -2px rgba(0, 0, 0, 0.5)'
        case 'lg':
          return '0 18px 45px -4px rgba(0, 0, 0, 0.9), 0 8px 18px -4px rgba(0, 0, 0, 0.7)'
        default:
          return '0 3px 12px rgba(0, 0, 0, 0.45)'
      }
    }

    switch (shadow) {
      case 'sm':
        return '0 2px 8px -1px rgba(0, 0, 0, 0.09), 0 1px 4px -1px rgba(0, 0, 0, 0.06)'
      case 'md':
        return '0 6px 20px -2px rgba(0, 0, 0, 0.16), 0 3px 8px -2px rgba(0, 0, 0, 0.1)'
      case 'lg':
        return '0 16px 36px -4px rgba(0, 0, 0, 0.28), 0 6px 16px -3px rgba(0, 0, 0, 0.16)'
      default:
        return '0 2px 8px -1px rgba(0, 0, 0, 0.09)'
    }
  }

  return (
    <header
      style={{
        backgroundColor: navbar?.bgColor || undefined,
        color: navbar?.textColor || undefined,
        borderColor: navbar?.borderColor || undefined,
        height: navbar?.height ? `${navbar.height}px` : undefined,
        opacity: navbar?.transparency !== undefined ? navbar.transparency : 1,
        boxShadow: getShadowStyle(navbar?.shadow, isDark),
      }}
      className={`sticky top-0 left-0 right-0 z-30 flex items-center justify-between px-2.5 sm:px-4 md:px-6 h-14 sm:h-16 border-b backdrop-blur-md transition-all duration-300 print:hidden ${
        !navbar?.bgColor ? 'bg-white/70 dark:bg-slate-900/70 border-border/40' : ''
      }`}
    >
      {/* Left side actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5 min-w-0">
        {/* Toggle button */}
        <button
          onClick={onToggleSidebar}
          style={{ color: customTextColor || undefined }}
          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 opacity-90 hover:opacity-100 rounded-lg transition-all flex-shrink-0 cursor-pointer"
          title={t('common.toggle_sidebar', 'Toggle Sidebar')}
        >
          <Menu size={20} />
        </button>

        {/* Dynamic breadcrumb */}
        <nav
          style={{ color: customTextColor || undefined }}
          className="hidden lg:flex items-center gap-1 sm:gap-1.5 text-xs font-semibold min-w-0 truncate opacity-90"
        >
          <Link
            to="/dashboard"
            style={{ color: customTextColor || undefined }}
            className="hover:opacity-100 transition-opacity flex-shrink-0"
          >
            {t('Dashboard', 'Dashboard')}
          </Link>
          
          {pathSegments.map((segment, idx) => {
            // Don't duplicate dashboard or show raw numeric IDs (e.g. /suppliers/2/edit)
            if (segment === 'dashboard' || /^\d+$/.test(segment)) return null
            
            const isLast = idx === pathSegments.length - 1
            const path = `/${pathSegments.slice(0, idx + 1).join('/')}`
            const label = getBreadcrumbLabel(segment)

            return (
              <React.Fragment key={idx}>
                <ChevronRight size={12} className="opacity-60 flex-shrink-0" />
                {isLast ? (
                  <span
                    style={{ color: customTextColor || undefined }}
                    className="truncate max-w-[110px] lg:max-w-[160px] font-bold opacity-100"
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    to={path}
                    style={{ color: customTextColor || undefined }}
                    className="hover:opacity-100 transition-opacity truncate max-w-[80px] lg:max-w-[110px]"
                  >
                    {label}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </nav>

        {/* Global Search Component */}
        <HeaderSearch />
      </div>

      {/* Right side controls */}
      <HeaderActions />
    </header>
  )
}

export default Header
