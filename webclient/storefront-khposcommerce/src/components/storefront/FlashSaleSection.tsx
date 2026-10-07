import React from 'react'
import { Link } from 'react-router-dom'
import { Flame, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CountdownTimer from './CountdownTimer'
import CustomerProductCard, { type ProductItem } from './CustomerProductCard'

export interface FlashSaleData {
  id: number
  name: string
  ends_at?: string
  products: ProductItem[]
}

interface FlashSaleSectionProps {
  flashSale?: FlashSaleData | null
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ flashSale }) => {
  const { t } = useTranslation()

  if (!flashSale || !flashSale.products || flashSale.products.length === 0) {
    return null
  }

  return (
    <section className="container-site py-4 sm:py-6">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 p-5 sm:p-8 lg:p-10 text-white shadow-2xl border border-red-500/40">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/20 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        {/* Header with Title & Countdown */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 border-b border-white/15">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-white shadow-md">
              <Flame className="w-7 h-7 fill-amber-300 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px] font-extrabold uppercase tracking-wider text-amber-300 border border-white/20">
                  Hot Deals
                </span>
                <h2 className="text-xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                  {flashSale.name || t('section.flash_sale_title')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-red-100 mt-1">
                {t('section.flash_sale_sub')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-100 hidden sm:inline">
                {t('timer.ends_in')}:
              </span>
              <CountdownTimer targetDate={flashSale.ends_at} variant="fire" />
            </div>

            <Link
              to="/products?sort=deals"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
            >
              {t('common.view_all')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-5">
          {flashSale.products.slice(0, 4).map((prod) => (
            <div key={prod.id} className="flex flex-col">
              <CustomerProductCard product={prod} className="bg-white/95 text-gray-900 shadow-lg" />
              
              {/* Sold progress indicator if sold_count is present */}
              {prod.sold_count !== undefined && (
                <div className="mt-2 px-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-red-100 mb-1">
                    <span>{t('product.sold')}: {prod.sold_count}</span>
                    <span>{prod.quota ? `${prod.quota} ${t('product.available')}` : ''}</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-300 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(15, ((prod.sold_count || 1) / (prod.quota || 50)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FlashSaleSection
