import React from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import QuickActionDropdown from './QuickActionDropdown'
import LanguageDropdown from './LanguageDropdown'
import ThemeSwitcher from './ThemeSwitcher'
import NotificationDropdown from './NotificationDropdown'
import ProfileDropdown from './ProfileDropdown'

import { useThemeStore } from '@/stores/themeStore'

const HeaderActions: React.FC = () => {
  const { t } = useTranslation()
  const { hasPermission } = useAuthStore()
  const { navbar } = useThemeStore()
  const customTextColor = navbar?.textColor

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2.5 flex-shrink-0">
      {/* POS Quick Link */}
      {hasPermission('sale.create') && (
        <Link
          to="/pos"
          style={{ color: customTextColor || undefined }}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center opacity-90 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-all duration-200 cursor-pointer"
          title={t('nav.posTerminal', 'POS Terminal')}
        >
          <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </Link>
      )}

      {/* Quick Action Button Dropdown */}
      <QuickActionDropdown />

      <div className="h-4 w-px bg-border/60 mx-0.5 hidden md:block" />

      {/* Language dropdown */}
      <LanguageDropdown isInNavbar={true} />

      {/* Dark/Light mode theme switcher */}
      <ThemeSwitcher isInNavbar={true} />

      {/* Notifications trigger dropdown */}
      <NotificationDropdown />

      {/* Profile menu dropdown (includes Switch Account modal) */}
      <ProfileDropdown />
    </div>
  )
}

export default HeaderActions
