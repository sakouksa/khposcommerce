import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import queryKeys from '@/constants/queryKeys'
import SEOHead from '@/components/seo/SEOHead'
import AnimatedSection from '@/components/common/AnimatedSection'
import HeroRetailGrid from '@/components/storefront/HeroRetailGrid'
import SpotlightBannersGrid, { type SpotlightItem } from '@/components/storefront/SpotlightBannersGrid'
import ValuePropositionStrip from '@/components/storefront/ValuePropositionStrip'
import QuickCategories from '@/components/storefront/QuickCategories'
import FlashSaleSection, { type FlashSaleData } from '@/components/storefront/FlashSaleSection'
import CouponsSection from '@/components/storefront/CouponsSection'
import FeaturedProductsSection from '@/components/storefront/FeaturedProductsSection'
import TodaysDealsSection from '@/components/storefront/TodaysDealsSection'
import CategoryShowcaseSection, { type ShowcaseCategory } from '@/components/storefront/CategoryShowcaseSection'
import BestSellersSection from '@/components/storefront/BestSellersSection'
import PopularProductsSection from '@/components/storefront/PopularProductsSection'
import NewArrivalsSection from '@/components/storefront/NewArrivalsSection'
import BestRatedSection from '@/components/storefront/BestRatedSection'
import RecommendedSection from '@/components/storefront/RecommendedSection'
import RecentlyViewedSection from '@/components/storefront/RecentlyViewedSection'
import TopBrandsSection from '@/components/storefront/TopBrandsSection'
import TestimonialsSection, { type TestimonialItem } from '@/components/storefront/TestimonialsSection'
import BlogSection, { type BlogPostItem } from '@/components/storefront/BlogSection'
import NewsletterSection from '@/components/storefront/NewsletterSection'
import LoadingSkeleton from '@/components/storefront/LoadingSkeleton'
import EmptyState from '@/components/common/EmptyState'
import type { BannerItem } from '@/components/storefront/HeroBannerSlider'
import type { ProductItem, CategoryItem, BrandItem, CouponItem } from '@/types/store'

interface HomepageApiResponse {
  announcement?: {
    enabled?: boolean
    message?: string
    link?: string
    code?: string
  }
  hero_banners: BannerItem[]
  spotlight_banners?: SpotlightItem[]
  quick_categories: CategoryItem[]
  flash_sale?: FlashSaleData | null
  featured_products: ProductItem[]
  best_sellers: ProductItem[]
  popular_products: ProductItem[]
  new_arrivals: ProductItem[]
  today_deals: ProductItem[]
  top_brands: BrandItem[]
  recommendations: ProductItem[]
  coupons: CouponItem[]
  category_showcase: ShowcaseCategory[]
  top_rated_products: ProductItem[]
  testimonials: TestimonialItem[]
  blog_posts: BlogPostItem[]
  store_info?: {
    site_name?: string
    site_email?: string
    company_phone?: string
    company_address?: string
    currency_base?: string
    hotlines?: string[]
    delivery_headline?: string
  }
  stats?: {
    total_products?: number
    total_categories?: number
    total_brands?: number
    active_promotions?: number
  }
}

export const HomePage: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery<HomepageApiResponse>({
    queryKey: queryKeys.store.homepage,
    queryFn: async () => {
      const res = await api.get('/homepage')
      return res.data?.data
    },
    staleTime: 3 * 60 * 1000,
  })

  const seoElement = (
    <SEOHead
      title="OptaPOS Store — Genuine Laptops, Smartphones, Audio & POS Hardware"
      description="Shop authentic flagship laptops, gaming gear, smartwatches, audio accessories, and enterprise POS hardware with fast nationwide delivery in Cambodia."
      canonical="/"
    />
  )

  if (isLoading) {
    return (
      <>
        {seoElement}
        <div className="space-y-6 pb-16 pt-4">
          <LoadingSkeleton type="banner" />
          <LoadingSkeleton type="categories" />
          <LoadingSkeleton type="grid" count={6} />
        </div>
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        {seoElement}
        <div className="container-site py-16">
          <EmptyState
            title="Unable to load catalog"
            description="A network or server error occurred while retrieving live product data."
            actionLabel="Retry Connection"
            onAction={() => refetch()}
          />
        </div>
      </>
    )
  }

  return (
    <>
      {seoElement}

      <div className="space-y-4 sm:space-y-8 pb-16 overflow-hidden">
        {/* 1. Hero Retail Grid (Category Sidebar + Hero Slider) */}
        <HeroRetailGrid banners={data.hero_banners || []} />

        {/* 2. 4 Below-Hero Spotlight Tech Deals Grid */}
        <AnimatedSection>
          <SpotlightBannersGrid items={data.spotlight_banners} />
        </AnimatedSection>

        {/* 3. Tech Store Guarantees & Value Proposition Strip */}
        <AnimatedSection>
          <ValuePropositionStrip />
        </AnimatedSection>

        {/* 4. Live Flash Sale Section with Countdown Timer */}
        <AnimatedSection id="flash-sale">
          <FlashSaleSection flashSale={data.flash_sale} />
        </AnimatedSection>

        {/* 5. Quick Category Cards Icon Bar */}
        <AnimatedSection id="categories">
          <QuickCategories categories={data.quick_categories || []} />
        </AnimatedSection>

        {/* 6. Featured Hardware & Laptops */}
        <AnimatedSection id="featured">
          <FeaturedProductsSection products={data.featured_products || []} />
        </AnimatedSection>

        {/* 7. Today's Super Deals */}
        <AnimatedSection id="deals">
          <TodaysDealsSection products={data.today_deals || []} />
        </AnimatedSection>

        {/* 8. Tabbed Category Showcase */}
        <AnimatedSection>
          <CategoryShowcaseSection categories={data.category_showcase || []} />
        </AnimatedSection>

        {/* 9. Best Selling Tech Products */}
        <AnimatedSection>
          <BestSellersSection products={data.best_sellers || []} />
        </AnimatedSection>

        {/* 10. Official Top Brands Showcase */}
        <AnimatedSection id="brands">
          <TopBrandsSection brands={data.top_brands || []} />
        </AnimatedSection>

        {/* 11. Popular Community Tech Products */}
        <AnimatedSection>
          <PopularProductsSection products={data.popular_products || []} />
        </AnimatedSection>

        {/* 12. New Tech Arrivals */}
        <AnimatedSection>
          <NewArrivalsSection products={data.new_arrivals || []} />
        </AnimatedSection>

        {/* 13. Top Rated Tech Products (4.8+ Stars) */}
        <AnimatedSection>
          <BestRatedSection products={data.top_rated_products || []} />
        </AnimatedSection>

        {/* 14. Promotional Discount Coupons with 1-Click Copy */}
        <AnimatedSection>
          <CouponsSection coupons={data.coupons || []} />
        </AnimatedSection>

        {/* 15. Personalized AI Recommendations */}
        <AnimatedSection>
          <RecommendedSection products={data.recommendations || []} />
        </AnimatedSection>

        {/* 16. Recently Viewed Products */}
        <AnimatedSection>
          <RecentlyViewedSection />
        </AnimatedSection>

        {/* 17. Customer Testimonials & Verified Reviews */}
        <AnimatedSection>
          <TestimonialsSection testimonials={data.testimonials || []} />
        </AnimatedSection>

        {/* 18. Latest Tech News, Reviews & Buying Guides */}
        <AnimatedSection id="blog">
          <BlogSection posts={data.blog_posts || []} />
        </AnimatedSection>

        {/* 19. Newsletter Subscription Voucher Reward */}
        <AnimatedSection>
          <NewsletterSection />
        </AnimatedSection>
      </div>
    </>
  )
}

export default HomePage
