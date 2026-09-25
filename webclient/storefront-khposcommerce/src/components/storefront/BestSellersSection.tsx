import React from 'react'
import { Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductItem } from '@/types/store'
import ProductSection from '@/components/ecommerce/ProductSection'

export interface BestSellersSectionProps {
  products: ProductItem[]
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ products }) => {
  const { t } = useTranslation()

  return (
    <ProductSection
      products={products}
      title={t('section.best_sellers_title')}
      subtitle={t('section.best_sellers_sub')}
      icon={<Award className="w-5 h-5 text-indigo-500" />}
      badge="Customer Favorites"
      viewAllLink="/products?sort=sales"
    />
  )
}

export default BestSellersSection
