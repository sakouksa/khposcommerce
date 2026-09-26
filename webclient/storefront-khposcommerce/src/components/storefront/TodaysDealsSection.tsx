import React from 'react'
import { Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProductItem } from '@/types/store'
import ProductSection from '@/components/ecommerce/ProductSection'

export interface TodaysDealsSectionProps {
  products: ProductItem[]
}

export const TodaysDealsSection: React.FC<TodaysDealsSectionProps> = ({ products }) => {
  const { t } = useTranslation()

  return (
    <ProductSection
      products={products}
      title={t('section.deals_title', "Today's Top Deals")}
      subtitle={t('section.deals_sub', 'Exclusive discounts and unbeatable value for money')}
      icon={<Tag className="w-5 h-5 text-emerald-500" />}
      badge="Special Offer"
      viewAllLink="/products?deals=true"
    />
  )
}

export default TodaysDealsSection
