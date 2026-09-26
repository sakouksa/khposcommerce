import React from 'react'
import type { ProductItem } from '@/types/store'
import SectionHeader from '@/components/storefront/SectionHeader'
import ProductCard from './ProductCard'
import { cn } from '@/lib/utils'

export interface ProductSectionProps {
  products?: ProductItem[]
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  badge?: string
  viewAllLink?: string
  viewAllText?: string
  limit?: number
  gridCols?: string
  cardVariant?: 'default' | 'compact' | 'featured'
  className?: string
  containerClassName?: string
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  title,
  subtitle,
  icon,
  badge,
  viewAllLink,
  viewAllText,
  limit = 12,
  gridCols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  cardVariant = 'default',
  className,
  containerClassName = 'container-site py-4 sm:py-6',
}) => {
  if (!products || products.length === 0) return null

  const displayProducts = limit ? products.slice(0, limit) : products

  return (
    <section className={cn(containerClassName, className)}>
      {title && (
        <SectionHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          badge={badge}
          viewAllLink={viewAllLink}
          viewAllText={viewAllText}
        />
      )}

      <div className={cn('grid gap-3 sm:gap-4', gridCols)}>
        {displayProducts.map((prod) => (
          <ProductCard
            key={prod.id}
            product={prod}
            variant={cardVariant}
          />
        ))}
      </div>
    </section>
  )
}

export default ProductSection
