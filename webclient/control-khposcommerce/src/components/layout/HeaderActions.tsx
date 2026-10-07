import React from 'react'
import { ShieldCheck } from 'lucide-react'
import LanguageDropdown from './LanguageDropdown'
import ThemeSwitcher from './ThemeSwitcher'
import NotificationDropdown from './NotificationDropdown'
import ProfileDropdown from './ProfileDropdown'

const HeaderActions: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
      {/* Platform Super Admin Badge */}

      <div className="h-4 w-px bg-border/60 mx-0.5 hidden lg:block" />

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
