import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '@/hooks'
import CategorySidebar from './CategorySidebar'
import HeroBannerSlider, { type BannerItem } from './HeroBannerSlider'
import { cn, resolveMediaUrl } from '@/lib/utils'

interface HeroRetailGridProps {
  banners?: BannerItem[]
  className?: string
}

export const HeroRetailGrid: React.FC<HeroRetailGridProps> = ({ banners = [], className }) => {
  const { t } = useTranslation()
  const { data: categories = [] } = useCategories()

  const cardStyling = [
    { bgGradient: 'from-[#f5b841] to-[#f7c844]', arrowBg: 'bg-[#e09e1f]' },
    { bgGradient: 'from-[#e6007e] to-[#f06ea9]', arrowBg: 'bg-[#c4006b]' },
    { bgGradient: 'from-[#f26565] to-[#f88585]', arrowBg: 'bg-[#db4848]' },
  ]

  // Dynamic quick category cards derived from real database categories
  const quickCards = (categories.length >= 3 ? categories.slice(0, 3) : []).map((cat, idx) => ({
    id: cat.id,
    title: cat.name,
    link: `/products?category=${cat.slug}`,
    bgGradient: cardStyling[idx % 3].bgGradient,
    arrowBg: cardStyling[idx % 3].arrowBg,
    image: resolveMediaUrl(cat.image, 'category'),
  }))

  const displayCards = quickCards.length > 0 ? quickCards : [
    {
      id: 1,
      title: t('hero.computers_laptops', 'កុំព្យូទ័រ & Laptops'),
      link: '/products?category=laptops',
      bgGradient: 'from-[#f5b841] to-[#f7c844]',
      arrowBg: 'bg-[#e09e1f]',
      image: resolveMediaUrl('categories/laptops.webp', 'category'),
    },
    {
      id: 2,
      title: t('hero.gaming_arena', 'ហ្គេម & Gaming Arena'),
      link: '/products?category=keyboards',
      bgGradient: 'from-[#e6007e] to-[#f06ea9]',
      arrowBg: 'bg-[#c4006b]',
      image: resolveMediaUrl('categories/keyboards.webp', 'category'),
    },
    {
      id: 3,
      title: t('hero.audio_accessories', 'សំឡេង & គ្រឿងបន្លាស់'),
      link: '/products?category=audio',
      bgGradient: 'from-[#f26565] to-[#f88585]',
      arrowBg: 'bg-[#db4848]',
      image: resolveMediaUrl('categories/audio.webp', 'category'),
    },
  ]

  return (
    <div className={cn('w-full pt-3 sm:pt-4', className)}>
      <div className="container-site">
        <div className="flex gap-3 lg:gap-4 items-stretch">
          {/* Desktop Left Category Tree Menu (AEON Style Sidebar) */}
          <CategorySidebar className="flex-shrink-0" />

          {/* Center / Right Hero Section (Slider + 3 AEON Quick Promo Cards) */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
            {/* Top: AEON Style Hero Banner Slider */}
            <HeroBannerSlider banners={banners} className="pt-0" />

            {/* Bottom: 3 Promotional Sub-Banners with Diagonal Arrow Button ↗ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {displayCards.map((card) => (
                <Link
                  key={card.id}
                  to={card.link}
                  className={cn(
                    'group relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 select-none bg-gradient-to-r',
                    card.bgGradient
                  )}
                >
                  {/* Left Title & Arrow Button */}
                  <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
                    <h3 className="text-xs sm:text-sm font-black font-display tracking-tight leading-snug drop-shadow-xs truncate max-w-[120px] sm:max-w-none">
                      {card.title}
                    </h3>
                    <div
                      className={cn(
                        'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45',
                        card.arrowBg
                      )}
                    >
                      <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                  </div>

                  {/* Right Cutout Image */}
                  <div className="relative w-20 h-16 sm:w-24 sm:h-18 flex-shrink-0 flex items-center justify-end overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/images/placeholder-product.png'
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroRetailGrid
