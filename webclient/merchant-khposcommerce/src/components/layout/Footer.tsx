import React from 'react'
import { useTranslation } from 'react-i18next'

export const Footer: React.FC = () => {
  const { t } = useTranslation(['common', 'auth', 'dashboard'])

  return (
    <footer className="border-t border-border/40 py-2.5 px-4 sm:px-6 bg-card/60 backdrop-blur-md text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 print:hidden transition-colors">
      <div className="flex items-center gap-2">
        <span>© {new Date().getFullYear()} KHPosCommerce. {t('auth.copyright', 'All rights reserved.')}</span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{t('dashboard.allSystemsOperational', 'All Systems Operational')}</span>
        </div>
        <span className="text-muted-foreground/40">•</span>
        <span className="font-mono text-muted-foreground/70">v1.0.0</span>
      </div>
    </footer>
  )
}

export default Footer
