import React from 'react'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductItem } from '@/types/store'
import ProductSection from '@/components/ecommerce/ProductSection'

export interface BestRatedSectionProps {
  products: ProductItem[]
}

export const BestRatedSection: React.FC<BestRatedSectionProps> = ({ products }) => {
  const { t } = useTranslation()

  return (
    <ProductSection
      products={products}
      title={t('section.best_rated_title')}
      subtitle={t('section.best_rated_sub')}
      icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
      badge="Top Reviews"
      viewAllLink="/products?sort=rating"
    />
  )
}

export default BestRatedSection
