import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn, resolveMediaUrl } from '@/lib/utils'

export interface BannerItem {
  id: number
  title: string
  subtitle?: string | null
  image?: string | null
  mobile_image?: string | null
  link?: string | null
  button_text?: string | null
  type?: string
  position?: string
  badge?: string
  discount_tag?: string
  theme_gradient?: string
}

interface HeroBannerSliderProps {
  banners?: BannerItem[]
  className?: string
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({ banners, className }) => {
  const { t } = useTranslation()
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const SLIDE_DURATION = 5500

  const defaultBanners: BannerItem[] = [
    {
      id: 1,
      title: 'HAPPY TECH WEEKEND',
      subtitle: 'មហោស្រពទំនិញបច្ចេកវិទ្យាប្រចាំខែ បញ្ចុះតម្លៃពិសេសលើ Laptops, Mac & Gaming Gear ជំនាន់ថ្មី 2026',
      image: resolveMediaUrl('banners/banner_hero_1.webp', 'banner'),
      link: '/products?sort=deals',
      button_text: t('hero.shop_now', 'ទិញឥឡូវនេះ'),
      badge: 'AEON ONLINE TECH',
      discount_tag: 'បញ្ចុះតម្លៃ $300',
      theme_gradient: 'from-[#4a0b27]/95 via-[#2b0616]/85 via-50% to-transparent',
    },
    {
      id: 2,
      title: 'NEXT-GEN PRO GAMING ARENA',
      subtitle: 'ឧបករណ៍ហ្គេមអាជីព RTX 5090, 240Hz OLED Displays & Mechanical Keyboards ធានាផ្លូវការ',
      image: resolveMediaUrl('banners/banner_hero_2.webp', 'banner'),
      link: '/products?category=keyboards',
      button_text: t('hero.explore', 'ស្វែងរកទំនិញ'),
      badge: 'OFFICIAL ESPORTS GEAR',
      discount_tag: 'បញ្ចុះតម្លៃ 35%',
      theme_gradient: 'from-[#0f1130]/95 via-[#090b20]/85 via-50% to-transparent',
    },
    {
      id: 3,
      title: 'STUDIO AUDIO & WIRELESS HI-RES',
      subtitle: 'សំឡេងកម្រិតស្ទូឌីយោ Spatial Audio & Active Noise Cancellation គុណភាពខ្ពស់បំផុត',
      image: resolveMediaUrl('banners/banner_hero_3.webp', 'banner'),
      link: '/products?category=audio-sound',
      button_text: t('hero.view_collection', 'មើលការប្រមូលផ្តុំ'),
      badge: 'HI-RES AUDIOPHILE',
      discount_tag: 'តម្លៃចាប់ពី $99',
      theme_gradient: 'from-[#06203d]/95 via-[#031326]/85 via-50% to-transparent',
    },
    {
      id: 4,
      title: 'ENTERPRISE SMART POS HARDWARE',
      subtitle: 'ប្រព័ន្ធគ្រប់គ្រងការលក់ POS All-in-One, ម៉ាស៊ីនស្កេនបាកូដ និងម៉ាស៊ីនព្រីនវិក្កយបត្រស្ដង់ដារ',
      image: resolveMediaUrl('banners/banner_hero_4.webp', 'banner'),
      link: '/products?category=printers-scanners',
      button_text: t('hero.shop_now', 'ទិញឥឡូវនេះ'),
      badge: 'ENTERPRISE SOLUTION',
      discount_tag: 'ធានារយៈពេល ២ ឆ្នាំ',
      theme_gradient: 'from-[#0e243d]/95 via-[#071524]/85 via-50% to-transparent',
    },
    {
      id: 5,
      title: 'FLAGSHIP SMARTPHONES & 5G',
      subtitle: 'ទូរស័ព្ទស្មាតហ្វូន & ថេប្លេត Flagship ជំនាន់ចុងក្រោយ បង់រំលស់ការប្រាក់ 0%',
      image: resolveMediaUrl('banners/banner_hero_5.webp', 'banner'),
      link: '/products?category=smartphones',
      button_text: t('hero.shop_now', 'ទិញឥឡូវនេះ'),
      badge: 'PRE-ORDER NOW',
      discount_tag: 'ថែមជូនកាដូ $120',
      theme_gradient: 'from-[#2d0d2e]/95 via-[#1a071b]/85 via-50% to-transparent',
    },
  ]

  const items = banners && banners.length > 0 ? banners : defaultBanners

  useEffect(() => {
    if (items.length <= 1 || isPaused) return

    setProgress(0)
    const intervalTime = 50
    const step = (intervalTime / SLIDE_DURATION) * 100

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIdx((current) => (current + 1) % items.length)
          return 0
        }
        return prev + step
      })
    }, intervalTime)

    return () => clearInterval(progressTimer)
  }, [items.length, isPaused, activeIdx])

  const nextSlide = () => {
    setProgress(0)
    setActiveIdx((prev) => (prev + 1) % items.length)
  }

  const prevSlide = () => {
    setProgress(0)
    setActiveIdx((prev) => (prev - 1 + items.length) % items.length)
  }

  const selectSlide = (index: number) => {
    setProgress(0)
    setActiveIdx(index)
  }

  return (
    <div
      className={cn('relative w-full select-none', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Main Slideshow Container ── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-slate-950 border border-slate-200/50 dark:border-slate-800 h-[280px] sm:h-[340px] lg:h-[380px] xl:h-[400px] flex items-center">
        <AnimatePresence mode="wait">
          {items.map((banner, idx) => {
            if (idx !== activeIdx) return null

            const imgSrc = resolveMediaUrl(banner.image || banner.mobile_image, 'banner')

            return (
              <motion.div
                key={banner.id || idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center"
              >
                {/* Background Imagery with Subtle Dimming Filter & Smooth Motion */}
                <motion.div
                  initial={{ scale: 1.04 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 5.5, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={imgSrc}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center brightness-[0.68] contrast-[1.08] saturate-[0.95]"
                    loading="eager"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/images/placeholder-product.png'
                    }}
                  />
                </motion.div>

                {/* Subtle dark tint layer over whole image for clean contrast */}
                <div className="absolute inset-0 bg-slate-950/35 z-[1]" />

                {/* Lateral Directional Ambient Gradient Overlay (Clean Subtle Dark Scrim) */}
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-r w-full md:w-[78%] z-[2]',
                    banner.theme_gradient || 'from-slate-950/95 via-slate-950/80 via-50% to-transparent'
                  )}
                />

                {/* Vertical Ambient Shadow for Mobile & Tablets */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent md:hidden z-[2]" />

                {/* Banner Content (Headline, Badge, Pricing, CTA) */}
                <div className="relative z-10 w-full max-w-xl p-5 sm:p-8 lg:p-10 space-y-2.5 sm:space-y-3.5">
                  {/* Top Badge & Discount Tag */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                    className="flex items-center gap-2 flex-wrap"
                  >
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{banner.badge || 'OFFICIAL TECH STORE'}</span>
                    </span>

                    {banner.discount_tag && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e6007e] text-white text-[10px] sm:text-xs font-bold shadow-md border border-white/20">
                        <Tag className="w-3 h-3" />
                        <span>{banner.discount_tag}</span>
                      </span>
                    )}
                  </motion.div>

                  {/* Main Title (Clean High-Contrast Typography) */}
                  <motion.h2
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="text-xl sm:text-3xl lg:text-4xl font-black text-white font-display leading-[1.16] tracking-tight drop-shadow-md"
                  >
                    {banner.title}
                  </motion.h2>

                  {/* Subtitle / Description */}
                  {banner.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.22 }}
                      className="text-[11px] sm:text-xs lg:text-sm text-slate-200/90 font-normal leading-relaxed line-clamp-2 max-w-lg"
                    >
                      {banner.subtitle}
                    </motion.p>
                  )}

                  {/* Action Button & Service Guarantees */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="pt-1.5 sm:pt-2 flex items-center gap-3 flex-wrap"
                  >
                    <Link
                      to={banner.link || '/products'}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#e6007e] hover:bg-[#cf0071] text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-950/40 transition-all transform active:scale-95 inline-flex items-center gap-1.5 group cursor-pointer border border-white/15"
                    >
                      <span>{banner.button_text || t('hero.shop_now', 'ទិញឥឡូវនេះ')}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-slate-300 font-medium">
                      <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-xs">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t('hero.nationwide_delivery', '២៥ ខេត្តក្រុង')}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                        <span>{t('hero.guarantee_100', 'ធានា ១០០%')}</span>
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* ── Circular Side Arrow Controls ── */}
        {items.length > 1 && (
          <>
            {/* Left Prev Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/50 hover:bg-slate-950/80 text-white shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-90 cursor-pointer border border-white/20"
              aria-label="Previous Banner"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Right Next Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/50 hover:bg-slate-950/80 text-white shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-90 cursor-pointer border border-white/20"
              aria-label="Next Banner"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* ── Pagination Capsule ── */}
        {items.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-20 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 shadow-2xl">
            {items.map((_, idx) => {
              const isActive = activeIdx === idx

              return (
                <button
                  key={idx}
                  onClick={() => selectSlide(idx)}
                  className={cn(
                    'transition-all duration-300 rounded-full cursor-pointer relative flex items-center justify-center',
                    isActive
                      ? 'w-7 sm:w-9 h-2 sm:h-2.5 bg-[#e6007e] shadow-xs shadow-pink-500/80'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/60 hover:bg-white'
                  )}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  {/* Progress Fill Animation on Active Pink Pill */}
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-white/30 rounded-full transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default HeroBannerSlider
