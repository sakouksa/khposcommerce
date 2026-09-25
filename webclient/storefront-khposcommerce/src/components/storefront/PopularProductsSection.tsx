import React from 'react'
import { Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductItem } from '@/types/store'
import ProductSection from '@/components/ecommerce/ProductSection'

export interface PopularProductsSectionProps {
  products: ProductItem[]
}

export const PopularProductsSection: React.FC<PopularProductsSectionProps> = ({ products }) => {
  const { t } = useTranslation()

  return (
    <ProductSection
      products={products}
      title={t('section.popular_title')}
      subtitle={t('section.popular_sub')}
      icon={<Flame className="w-5 h-5 text-rose-500" />}
      badge="Trending"
      viewAllLink="/products?sort=popular"
    />
  )
}

export default PopularProductsSection
