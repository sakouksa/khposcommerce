import React from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductItem } from '@/types/store'
import ProductSection from '@/components/ecommerce/ProductSection'

export interface FeaturedProductsSectionProps {
  products: ProductItem[]
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({ products }) => {
  const { t } = useTranslation()

  return (
    <ProductSection
      products={products}
      title={t('section.featured_title')}
      subtitle={t('section.featured_sub')}
      icon={<Sparkles className="w-5 h-5" />}
      badge="Editor's Choice"
      viewAllLink="/products?featured=true"
    />
  )
}

export default FeaturedProductsSection
