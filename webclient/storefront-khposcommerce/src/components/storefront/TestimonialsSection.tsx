import React from 'react'
import { Link } from 'react-router-dom'
import { MessageSquareQuote, Star, CheckCircle, Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import SectionHeader from './SectionHeader'

export interface TestimonialItem {
  id: number
  customer_name: string
  rating: number
  comment: string
  created_at?: string
  product_name?: string
  product_slug?: string
  product_image?: string | null
}

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[]
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const { t } = useTranslation()

  if (!testimonials || testimonials.length === 0) return null

  return (
    <section className="container-site py-4 sm:py-6">
      <SectionHeader
        title={t('section.testimonials_title')}
        subtitle={t('section.testimonials_sub')}
        icon={<MessageSquareQuote className="w-5 h-5 text-emerald-500" />}
        badge="Verified Reviews"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-xl transition-all duration-300 group"
          >
            <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-100 dark:text-gray-800 pointer-events-none group-hover:text-blue-500/20 transition-colors" />

            <div>
              {/* Rating Stars */}
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < (item.rating || 5) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'
                    )}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic line-clamp-3">
                "{item.comment}"
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {item.customer_name ? item.customer_name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-none flex items-center gap-1">
                    {item.customer_name}
                    <span title={t('testimonial.verified')}>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                    </span>
                  </h4>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {t('testimonial.verified')}
                  </span>
                </div>
              </div>

              {item.product_name && (
                <div className="text-right max-w-[130px]">
                  <span className="text-[10px] text-gray-400 block truncate">
                    Purchased:
                  </span>
                  {item.product_slug ? (
                    <Link
                      to={`/products/${item.product_slug}`}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {item.product_name}
                    </Link>
                  ) : (
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 truncate block">
                      {item.product_name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
