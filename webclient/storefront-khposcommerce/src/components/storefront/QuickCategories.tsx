import React from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import CategoryCard, { type CategoryItem } from './CategoryCard'

interface QuickCategoriesProps {
  categories: CategoryItem[]
}

export const QuickCategories: React.FC<QuickCategoriesProps> = ({ categories }) => {
  const { t } = useTranslation()

  if (!categories || categories.length === 0) return null

  return (
    <section className="container-site py-4 sm:py-6">
      <SectionHeader
        title={t('section.categories_title')}
        subtitle={t('section.categories_sub')}
        icon={<LayoutGrid className="w-5 h-5" />}
        viewAllLink="/products"
        viewAllText={t('nav.all_categories')}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {categories.slice(0, 12).map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  )
}

export default QuickCategories
