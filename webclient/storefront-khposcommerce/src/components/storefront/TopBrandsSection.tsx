import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import BrandCard, { type BrandItem } from './BrandCard'

interface TopBrandsSectionProps {
  brands: BrandItem[]
}

export const TopBrandsSection: React.FC<TopBrandsSectionProps> = ({ brands }) => {
  const { t } = useTranslation()

  if (!brands || brands.length === 0) return null

  return (
    <section className="container-site py-4 sm:py-6">
      <SectionHeader
        title={t('section.brands_title')}
        subtitle={t('section.brands_sub')}
        icon={<ShieldCheck className="w-5 h-5 text-blue-500" />}
        badge="100% Genuine"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {brands.slice(0, 10).map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </section>
  )
}

export default TopBrandsSection
