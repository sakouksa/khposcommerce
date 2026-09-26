import React from 'react'
import { History } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductItem } from '@/types/store'
import ProductSection from '@/components/ecommerce/ProductSection'

export interface RecentlyViewedSectionProps {
  products?: ProductItem[]
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({ products = [] }) => {
  const { t } = useTranslation()

  return (
    <ProductSection
      products={products}
      title={t('section.recently_viewed_title', 'Recently Viewed')}
      subtitle={t('section.recently_viewed_sub', 'Products you browsed recently')}
      icon={<History className="w-5 h-5 text-slate-500" />}
      badge="Your History"
      viewAllLink="/products"
    />
  )
}

export default RecentlyViewedSection
