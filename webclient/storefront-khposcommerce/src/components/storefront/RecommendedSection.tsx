import React from 'react'
import { Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductItem } from '@/types/store'
import ProductSection from '@/components/ecommerce/ProductSection'

export interface RecommendedSectionProps {
  products: ProductItem[]
}

export const RecommendedSection: React.FC<RecommendedSectionProps> = ({ products }) => {
  const { t } = useTranslation()

  return (
    <ProductSection
      products={products}
      title={t('section.recommended_title', 'Recommended For You')}
      subtitle={t('section.recommended_sub', 'Personalized picks based on your browsing')}
      icon={<Compass className="w-5 h-5 text-indigo-500" />}
      badge="For You"
      viewAllLink="/products"
    />
  )
}

export default RecommendedSection
