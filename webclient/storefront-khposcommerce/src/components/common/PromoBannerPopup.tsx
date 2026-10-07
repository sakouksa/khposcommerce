import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Tag, ArrowRight, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBanners } from '@/hooks'
import { resolveMediaUrl } from '@/lib/utils'
import type { Banner } from '@/types/store'

// Fallback high-converting promo banner if API is loading or empty
const FALLBACK_POPUP_BANNER: Banner = {
  id: 'promo-default',
  title: 'HAPPY TECH WEEKEND',
  subtitle: 'មហោស្រពទិញទំនិញអេឡិចត្រូនិកប្រចាំខែ បញ្ចុះតម្លៃពិសេសលើ Laptops, Mac & Gaming Gear ជំនាន់ថ្មី 2026',
  badge: 'AEON ONLINE TECH',
  discount_tag: 'បញ្ចុះតម្លៃ $300',
  button_text: 'ទិញឥឡូវនេះ',
  link: '/products',
  image: '/images/hero-1.webp',
  position: 'popup',
  is_active: true,
}

export const PromoBannerPopup: React.FC = () => {
  const { t } = useTranslation()
  const { data: banners = [] } = useBanners()
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowToday, setDontShowToday] = useState(false)

  // Find a designated popup banner, or fall back to the highest sort promo banner or fallback banner
  const popupBanner =
    banners.find((b) => b.position === 'popup' && b.is_active) ||
    banners.find((b) => b.discount_tag && b.is_active) ||
    banners[0] ||
    FALLBACK_POPUP_BANNER

  // Dynamic 5-Language Translation Resolvers
  const displayBadge =
    popupBanner?.badge && popupBanner.badge !== 'AEON ONLINE TECH' && popupBanner.badge !== 'EXCLUSIVE OFFER'
      ? popupBanner.badge
      : t('popup.badge', 'EXCLUSIVE PROMO')

  const displayDiscount =
    popupBanner?.discount_tag && popupBanner.discount_tag !== 'បញ្ចុះតម្លៃ $300'
      ? popupBanner.discount_tag
      : t('popup.discount_tag', 'SAVE UP TO $300')

  const displayTitle =
    popupBanner?.title && popupBanner.title !== 'HAPPY TECH WEEKEND'
      ? popupBanner.title
      : t('popup.title', 'HAPPY TECH WEEKEND')

  const displaySubtitle =
    popupBanner?.subtitle && !popupBanner.subtitle.includes('មហោស្រព')
      ? popupBanner.subtitle
      : t(
          'popup.subtitle',
          'Monthly exclusive electronics festival with huge discounts on Laptops, Mac & Gaming Gear 2026.'
        )

  const displayButtonText =
    popupBanner?.button_text && popupBanner.button_text !== 'ទិញឥឡូវនេះ'
      ? popupBanner.button_text
      : t('popup.shop_now', 'Shop Deal Now')

  useEffect(() => {
    // Check if user specifically selected "Don't show today" in localStorage (24 hours)
    const hideUntil = localStorage.getItem('hide_promo_banner_until')
    const now = Date.now()
    if (hideUntil && now < Number(hideUntil)) {
      return
    }

    // Open promptly on page open (500ms delay for smooth mount)
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [popupBanner])

  const handleClose = () => {
    setIsOpen(false)
    if (dontShowToday) {
      // 24-hour dismissal in localStorage only when explicitly checked
      localStorage.setItem('hide_promo_banner_until', String(Date.now() + 24 * 60 * 60 * 1000))
    }
  }

  const handleActionClick = () => {
    setIsOpen(false)
    if (dontShowToday) {
      localStorage.setItem('hide_promo_banner_until', String(Date.now() + 24 * 60 * 60 * 1000))
    }
  }

  if (!popupBanner) return null

  const bannerImg = resolveMediaUrl(popupBanner.image || popupBanner.mobile_image, 'banner')

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Smooth Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-colors"
          />

          {/* Modal Container: Clean, Modern, Adaptive Light & Dark Mode */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/70 z-10 text-slate-900 dark:text-white transition-colors duration-200 group"
          >
            {/* Top Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={t('popup.close', 'Close')}
              aria-label={t('popup.close', 'Close')}
            >
              <X size={15} />
            </button>

            {/* Banner Top Image Header */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
              <img
                src={bannerImg}
                alt={displayTitle}
                className="w-full h-full object-cover brightness-[0.96] dark:brightness-[0.78] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/images/placeholder-product.png'
                }}
              />
              {/* Dual-theme seamless soft gradient transition from image to body */}
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/30 dark:via-slate-900/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent dark:from-black/60" />

              {/* Floating Badges */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2 flex-wrap z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 dark:bg-white/90 text-white dark:text-slate-900 text-[11px] font-bold tracking-wide backdrop-blur-md border border-white/20 dark:border-slate-300 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
                  <span>{displayBadge}</span>
                </span>
                {displayDiscount && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e6007e] text-white text-[11px] font-black shadow-md border border-white/20">
                    <Tag className="w-3 h-3" />
                    <span>{displayDiscount}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Banner Content Body */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-snug">
                  {displayTitle}
                </h3>
                {displaySubtitle && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {displaySubtitle}
                  </p>
                )}
              </div>

              {/* Countdown / Guarantee Pill */}
              <div className="flex items-center gap-2 py-2.5 px-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="leading-tight">{t('popup.limited_time', 'Limited time promotion available across all 25 provinces')}</span>
              </div>

              {/* Action Button */}
              <div className="pt-1.5">
                <Link
                  to={popupBanner.link || '/products'}
                  onClick={handleActionClick}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#e6007e] via-[#db0077] to-[#c20069] hover:from-[#db0077] hover:to-[#a8005b] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-pink-500/25 dark:shadow-pink-950/50 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer border border-white/20 group/btn"
                >
                  <span>{displayButtonText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>

              {/* Dismissal Checkbox */}
              <div className="flex items-center justify-center pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={dontShowToday}
                    onChange={(e) => setDontShowToday(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[#e6007e] focus:ring-[#e6007e] cursor-pointer w-3.5 h-3.5"
                  />
                  <span>{t('popup.dont_show_today', "Don't show this promotion again today")}</span>
                </label>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PromoBannerPopup
