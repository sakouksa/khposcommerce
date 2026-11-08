import React from 'react'
import { Calculator } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Breadcrumb from '@/components/common/Breadcrumb'
import { PricingSimulatorSection } from './components/PricingSimulatorSection'

export const PricingSimulatorPage: React.FC = () => {
  const { t } = useTranslation(['marketing', 'common', 'nav'])

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.marketingManagement', t('nav.marketing', 'Marketing')), path: '/marketing/promotions' },
          { label: t('marketing.pricingSimulatorTitle', 'Pricing Simulator') },
        ]}
      />

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Calculator size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
              {t('marketing.pricingSimulatorTitle', 'Central Pricing Engine Simulator')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t(
              'marketing.pricingSimulatorSubtitle',
              'Test real-time discount calculations, verify stacking rules, branch scope, channel validation, and vouchers before launch.'
            )}
          </p>
        </div>
      </div>

      <PricingSimulatorSection />
    </div>
  )
}

export default PricingSimulatorPage
