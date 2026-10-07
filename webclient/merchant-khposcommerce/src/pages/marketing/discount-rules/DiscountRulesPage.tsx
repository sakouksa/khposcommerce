import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Breadcrumb from '@/components/common/Breadcrumb'
import { HeaderActionsGroup, AddButton } from '@/components/common'
import { marketingService } from '@/services/marketingService'
import { DiscountRulesSection } from './components/DiscountRulesSection'
import DiscountRulesStatsCards from './components/DiscountRulesStatsCards'
import { PromotionSimulatorModal } from '../promotions/components/PromotionSimulatorModal'
import { type PromotionCampaign } from '../promotions/types'

export const DiscountRulesPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'nav'])
  const navigate = useNavigate()

  const [simulatorOpen, setSimulatorOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => marketingService.getPromotions({ per_page: 100 }),
  })

  const campaigns: PromotionCampaign[] = React.useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.data?.data)) return data.data.data
    return []
  }, [data])

  const openCreateModal = () => {
    navigate('/marketing/promotions/create')
  }

  const openEditModal = (promo: PromotionCampaign) => {
    navigate(`/marketing/promotions/${promo.id}/edit`)
  }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.marketingManagement', t('nav.marketing', 'Marketing')), path: '/marketing/promotions' },
          { label: t('marketing.discountRulesTitle', 'Discount Rules') },
        ]}
      />

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {t('marketing.discountRulesTitle', 'Discount Rules')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t(
              'marketing.discountRulesSubtitle',
              'Manage discount rules across products, brands, categories, carts, BOGO, and bundles per campaign.'
            )}
          </p>
        </div>

        <HeaderActionsGroup>
          <AddButton
            onClick={openCreateModal}
            label={t('marketing.addCampaign', 'Campaign')}
          />
        </HeaderActionsGroup>
      </div>

      {/* Stats Cards */}
      <DiscountRulesStatsCards campaigns={campaigns} isLoading={isLoading} />

      <DiscountRulesSection
        campaigns={campaigns}
        onOpenCampaign={(promo) => openEditModal(promo)}
        onOpenSimulator={() => setSimulatorOpen(true)}
      />

      <PromotionSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />
    </div>
  )
}

export default DiscountRulesPage
