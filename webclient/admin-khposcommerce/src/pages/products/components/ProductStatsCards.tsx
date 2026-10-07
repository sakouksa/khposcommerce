import React from 'react'
import { useTranslation } from 'react-i18next'
import { Package, DollarSign, Award, Layers } from 'lucide-react'
import {
  StatsCard,
  StatsGrid,
} from '@/components/common'
import { useThemeStore } from '@/stores/themeStore'

export interface ProductAnalyticsData {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  outOfStock: number
  categoriesCount: number
  brandsCount: number
  attributesCount: number
  variantsCount: number
  costValue: number
  sellingValue: number
  potentialProfit: number
  averagePrice: number
  bestSelling: number
  lowSelling: number
  mostViewed: number
  averageRating: number
  todayNewProducts: number
  lowStockProducts: number
  productsOnSale: number
  productsWithDiscount: number
  recentlyUpdated: number
}

interface ProductStatsCardsProps {
  analytics: ProductAnalyticsData
  formatCurrency: (val: number) => string
}

export const ProductStatsCards: React.FC<ProductStatsCardsProps> = ({ analytics, formatCurrency }) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['products', 'common', 'inventory'])

  const totalProducts = analytics?.totalProducts || 0
  const activeProducts = analytics?.activeProducts || 0
  const outOfStock = analytics?.outOfStock || 0
  const sellingValue = analytics?.sellingValue || 0
  const costValue = analytics?.costValue || 0
  const potentialProfit = analytics?.potentialProfit || 0
  const bestSelling = analytics?.bestSelling || 0
  const averageRating = analytics?.averageRating || 0
  const brandsCount = analytics?.brandsCount || 0
  const variantsCount = analytics?.variantsCount || 0
  const lowStockProducts = analytics?.lowStockProducts || 0

  return (
    <div className="print:hidden select-none">
      <StatsGrid columns={4}>
        {/* Card 1: Total Products Catalog */}
        <StatsCard
          title={t('products:totalProducts', language === 'km' ? 'ទំនិញក្នុងប្រព័ន្ធសរុប' : 'Total System Products')}
          value={totalProducts}
          useCounter={true}
          icon={Package}
          variant="blue"
          delay={0.05}
          subtitle={
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {activeProducts} {language === 'km' ? 'សកម្ម' : 'Active'}
              </span>
              <span>•</span>
              <span>
                {outOfStock > 0 ? (
                  <span className="text-rose-500 dark:text-rose-400 font-semibold">
                    {outOfStock} {language === 'km' ? 'អស់ពីស្តុក' : 'Out of Stock'}
                  </span>
                ) : (
                  <span>{language === 'km' ? 'ស្តុកគ្រប់គ្រាន់' : 'All in stock'}</span>
                )}
              </span>
            </div>
          }
          tooltip={language === 'km' ? 'ចំនួនទំនិញសរុបក្នុងប្រព័ន្ធ' : 'Total system products'}
        />

        {/* Card 2: Inventory Value & Profitability */}
        <StatsCard
          title={t('products:inventoryValueHeader', language === 'km' ? 'តម្លៃស្តុកសរុប' : 'Total Inventory Value')}
          value={sellingValue}
          prefix="$"
          decimals={2}
          useCounter={true}
          icon={DollarSign}
          variant="emerald"
          delay={0.1}
          subtitle={
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground mt-0.5">
              <span>{language === 'km' ? 'ថ្លៃដើម:' : 'Cost:'}</span>
              <span className="font-semibold text-foreground">{formatCurrency(costValue)}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                +{formatCurrency(potentialProfit)} {language === 'km' ? 'ចំណេញ' : 'Profit'}
              </span>
            </div>
          }
          tooltip={language === 'km' ? 'តម្លៃលក់សរុបនៃស្តុក និងប្រាក់ចំណេញរំពឹងទុក' : 'Total retail stock value & potential profit'}
        />

        {/* Card 3: Sales Performance & Reach */}
        <StatsCard
          title={t('products:productPerformance', language === 'km' ? 'ទំនិញលក់បានសរុប' : 'Total Units Sold')}
          value={bestSelling}
          useCounter={true}
          icon={Award}
          variant="amber"
          delay={0.15}
          subtitle={
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ★ {Number(averageRating || 0).toFixed(1)}
              </span>
              <span>•</span>
              <span>
                {brandsCount} {language === 'km' ? 'ម៉ាក' : 'Brands'}
              </span>
              <span>•</span>
              <span>
                {variantsCount} {language === 'km' ? 'ជម្រើស' : 'Variants'}
              </span>
            </div>
          }
          tooltip={language === 'km' ? 'ចំនួនទំនិញដែលលក់ចេញ និងការវាយតម្លៃ' : 'Total units sold & catalog variety'}
        />

        {/* Card 4: Stock Alerts & Restock */}
        <StatsCard
          title={t('products:lowStock', language === 'km' ? 'ទំនិញជិតអស់ស្តុក' : 'Low Stock Warning')}
          value={lowStockProducts}
          useCounter={true}
          icon={Layers}
          variant={lowStockProducts > 0 ? 'rose' : 'purple'}
          delay={0.2}
          subtitle={
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              {lowStockProducts > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {language === 'km' ? 'ត្រូវការបញ្ចូលស្តុកបន្ថែម' : 'Requires restock'}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ {language === 'km' ? 'កម្រិតស្តុកមានស្ថិរភាព' : 'Optimal stock levels'}
                </span>
              )}
            </div>
          }
          tooltip={language === 'km' ? 'ទំនិញដែលដល់កម្រិតដាស់តឿនស្តុកទាប' : 'Products reaching low stock threshold'}
        />
      </StatsGrid>
    </div>
  )
}

export default ProductStatsCards
