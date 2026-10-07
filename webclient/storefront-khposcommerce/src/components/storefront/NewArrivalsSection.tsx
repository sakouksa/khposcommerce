import React from 'react'
import { Sparkle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductItem } from '@/types/store'
import ProductSection from '@/components/ecommerce/ProductSection'

export interface NewArrivalsSectionProps {
  products: ProductItem[]
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({ products }) => {
  const { t } = useTranslation()

  return (
    <ProductSection
      products={products}
      title={t('section.new_arrivals_title')}
      subtitle={t('section.new_arrivals_sub')}
      icon={<Sparkle className="w-5 h-5 text-emerald-500" />}
      badge="Just Landed"
      viewAllLink="/products?sort=newest"
    />
  )
}

export default NewArrivalsSection
