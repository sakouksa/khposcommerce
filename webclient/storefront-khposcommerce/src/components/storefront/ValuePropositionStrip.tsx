import React from 'react'
import { Truck, ShieldCheck, CheckCircle2, CreditCard, Headphones, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export const ValuePropositionStrip: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation()

  const benefits = [
    {
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: '1-Hour Express & 25 Provinces',
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      icon: ShieldCheck,
      title: 'Official Warranty',
      subtitle: '1-Year Authorized Centers',
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      icon: CheckCircle2,
      title: '100% Genuine Tech',
      subtitle: 'Direct from Top Brands',
      color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      subtitle: 'ABA KHQR, Wing, Cards',
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      subtitle: 'Expert IT Tech Help',
      color: 'text-amber-500 bg-amber-500/10',
    },
  ]

  return (
    <section className={cn('w-full py-4 sm:py-6', className)}>
      <div className="container-site">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg">
          {benefits.map((b, idx) => {
            const Icon = b.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
                    b.color
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {b.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {b.subtitle}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ValuePropositionStrip
