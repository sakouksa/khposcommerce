import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn, resolveMediaUrl } from '@/lib/utils'

export interface SpotlightItem {
  id: number
  title: string
  subtitle?: string | null
  image: string
  link: string
  price_tag?: string
  brand?: string
  badge?: string
}

const DEFAULT_SPOTLIGHTS: SpotlightItem[] = [
  {
    id: 1,
    title: '5G Wi-Fi 6 Mobile Routers',
    subtitle: 'High-speed portable Wi-Fi 6 for 25 provinces.',
    image: resolveMediaUrl('banners/banner_spotlight_1.webp', 'banner'),
    link: '/products?category=smartphones',
    price_tag: 'From $49.00',
    brand: 'ProLink',
  },
  {
    id: 2,
    title: 'MSI Cyborg 15 Pro Gaming',
    subtitle: 'Intel i7 RTX 4060 144Hz IPS display.',
    image: resolveMediaUrl('banners/banner_spotlight_5.webp', 'banner'),
    link: '/products?category=laptops',
    price_tag: '$1,139.00',
    brand: 'MSI',
  },
  {
    id: 3,
    title: 'Lenovo IdeaPad Slim 3 Ryzen',
    subtitle: 'Ultra-thin, all-day battery with fast charge.',
    image: resolveMediaUrl('banners/banner_spotlight_2.webp', 'banner'),
    link: '/products?category=laptops',
    price_tag: '$499.00',
    brand: 'Lenovo',
  },
  {
    id: 4,
    title: 'ASUS Official Service & Warranty',
    subtitle: '100% Genuine parts & certified warranty centers.',
    image: resolveMediaUrl('banners/banner_spotlight_4.webp', 'banner'),
    link: '/about',
    price_tag: 'Official Service',
    brand: 'ASUS',
  },
]

interface SpotlightBannersGridProps {
  items?: SpotlightItem[]
  className?: string
}

export const SpotlightBannersGrid: React.FC<SpotlightBannersGridProps> = ({
  items = DEFAULT_SPOTLIGHTS,
  className,
}) => {
  const { t } = useTranslation()
  const displayItems = items && items.length > 0 ? items.slice(0, 4) : DEFAULT_SPOTLIGHTS
  const fallbackImg = '/images/placeholder-product.png'

  return (
    <section className={cn('w-full pt-4 sm:pt-6', className)}>
      <div className="container-site">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayItems.map((item, idx) => {
            const imgSrc = resolveMediaUrl(item.image, 'banner') || fallbackImg

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
              >
                <Link
                  to={item.link || '/products'}
                  className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden h-full min-h-[180px]"
                >
                  {/* Top Row: Brand & Price Tag */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.brand || 'Enterprise'}
                    </span>
                    {item.price_tag && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200/60 dark:border-slate-700/60">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{item.price_tag}</span>
                      </span>
                    )}
                  </div>

                  {/* Center / Image & Title */}
                  <div className="relative z-10 flex items-center justify-between gap-3 my-2">
                    <div className="space-y-1 max-w-[65%]">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 p-1 flex-shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-700/50 group-hover:scale-105 transition-transform">
                      <img
                        src={imgSrc}
                        alt={item.title}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = fallbackImg
                        }}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Bottom CTA Action Link */}
                  <div className="relative z-10 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <span className="text-[11px]">
                      {t('common.explore_promotion', 'Explore Promotion')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default SpotlightBannersGrid
