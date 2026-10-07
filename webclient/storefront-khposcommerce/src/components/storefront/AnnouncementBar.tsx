import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, X, Copy, Check, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface AnnouncementBarProps {
  announcement?: {
    enabled?: boolean
    message?: string
    message_km?: string
    link?: string
    code?: string
    coupon_code?: string
    bg_gradient?: string
    badge_text?: string
  }
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ announcement }) => {
  const { t, i18n } = useTranslation()
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied] = useState(false)

  if (dismissed || !announcement || announcement.enabled === false) {
    return null
  }

  const isKm = i18n.language === 'km'
  const message = isKm && announcement.message_km
    ? announcement.message_km
    : (announcement.message || announcement.message_km || t('nav.free_shipping'))

  const coupon = announcement.code || announcement.coupon_code
  const bgGradient = announcement.bg_gradient || 'from-indigo-600 to-purple-700'
  const badge = announcement.badge_text || 'SPECIAL PROMO'

  const handleCopyCoupon = () => {
    if (!coupon) return
    navigator.clipboard.writeText(coupon)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative text-white text-xs font-medium py-2 px-4 shadow-sm z-30 transition-all bg-gradient-to-r', bgGradient)}>
      <div className="container-site flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          {badge && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" /> {badge}
            </span>
          )}

          <span className="font-semibold">{message}</span>

          {coupon && (
            <button
              type="button"
              onClick={handleCopyCoupon}
              title={t('common.copy', 'Copy Code')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/35 font-mono font-bold text-[11px] border border-white/25 hover:bg-black/50 transition-colors cursor-pointer"
            >
              <Tag className="w-3 h-3 text-amber-300" />
              <span>{coupon}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400 ml-0.5" /> : <Copy className="w-2.5 h-2.5 text-white/70 ml-0.5" />}
            </button>
          )}

          {announcement.link && (
            <Link
              to={announcement.link}
              className="inline-flex items-center gap-0.5 underline font-bold hover:text-amber-200 transition-colors ml-1"
            >
              {t('hero.shop_now', 'Shop Now')} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white transition-colors p-1 -mr-1 rounded-lg hover:bg-white/10"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default AnnouncementBar
