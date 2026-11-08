import React from 'react'
import { ShieldCheck, Activity, Globe, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Footer: React.FC = () => {
  const { t } = useTranslation(['common'])

  return (
    <footer className="border-t border-border/40 py-3 px-4 sm:px-6 bg-card/60 backdrop-blur-md text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-foreground/80 tracking-wide">
          KHPosCommerce Platform Core
        </span>
        <span className="text-muted-foreground/40">•</span>
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
          v1.0.0 SaaS
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="size-3.5" />
          Multi-Tenant Isolation Secure
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <div className="hidden sm:flex items-center gap-1.5">
          <Activity className="size-3.5 text-indigo-500" />
          <span>API Gateway: <strong className="text-foreground font-semibold">24ms (Healthy)</strong></span>
        </div>
        <span className="hidden sm:inline text-muted-foreground/40">•</span>
        <div className="flex items-center gap-1.5">
          <Globe className="size-3.5 text-sky-500" />
          <span>Bakong KHQR: <strong className="text-foreground font-semibold">Online</strong></span>
        </div>
        <span className="text-muted-foreground/40">•</span>
        <span>© 2026 KHPosCommerce Ecosystem</span>
      </div>
    </footer>
  )
}

export default Footer
