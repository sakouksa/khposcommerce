import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Coins, CheckCircle2, ArrowRightLeft, Sparkles } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'

export interface CurrencyStatsCardsProps {
  currencies?: any[]
  isLoading?: boolean
}

export const CurrencyStatsCards: React.FC<CurrencyStatsCardsProps> = ({
  currencies = [],
  isLoading = false,
}) => {
  const { t } = useTranslation(['finance', 'common'])

  const stats = useMemo(() => {
    const baseCurrency =
      currencies.find((c: any) => c.is_default) ||
      currencies.find((c: any) => (c.code || '').toUpperCase() === 'USD') ||
      currencies[0] || { code: 'USD', symbol: '$', name: 'US Dollar' }

    const khrCurrency = currencies.find((c: any) => (c.code || '').toUpperCase() === 'KHR')
    const khrNumericRate = Number(khrCurrency?.exchange_rate || 4100)
    const khrRate = khrNumericRate.toLocaleString('en-US')
    const inverse10k = (10000 / khrNumericRate).toFixed(2)
    const inverse1 = (1 / khrNumericRate).toFixed(5)

    return {
      baseCode: (baseCurrency.code || 'USD').toUpperCase(),
      baseSymbol: baseCurrency.symbol || '$',
      baseName: baseCurrency.name || 'US Dollar',
      khrRate,
      inverse10k,
      inverse1,
    }
  }, [currencies])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
      {/* 1. Base Currency (USD) */}
      <StatCard
        title={t('finance.base_currency_title', 'Base Currency')}
        value={`${stats.baseCode} (${stats.baseSymbol})`}
        description={t('finance.base_rate_desc', 'US Dollar • Base Rate 1.0000')}
        icon={Coins}
        variant="primary"
        loading={isLoading}
      />

      {/* 2. Official KHR Exchange Rate */}
      <StatCard
        title={t('finance.khr_exchange_rate', 'KHR Exchange Rate')}
        value={`1 $ = ${stats.khrRate} ៛`}
        description={t('finance.pos_exchange_rate_desc', 'Rate calculated in POS / invoices')}
        icon={ArrowRightLeft}
        variant="purple"
        loading={isLoading}
      />

      {/* 3. Inverse Rate for Quick Cashier Change */}
      <StatCard
        title={t('finance.inverse_rate_title', 'Inverse Rate (10,000 KHR ➔ $)')}
        value={`10,000 ៛ = $${stats.inverse10k}`}
        description={`1 ៛ ≈ $${stats.inverse1}`}
        icon={Sparkles}
        variant="blue"
        loading={isLoading}
      />

      {/* 4. Active In-Use Currencies */}
      <StatCard
        title={t('finance.operational_currencies_title', 'Operational Currencies')}
        value="USD & KHR"
        description={t('finance.operational_currencies_desc', 'Dollar ($) and Riel (៛) in POS system')}
        icon={CheckCircle2}
        variant="emerald"
        loading={isLoading}
      />
    </div>
  )
}

export default CurrencyStatsCards
