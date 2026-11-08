import type { Purchase } from '../types/purchase.types'
import { formatCurrency as formatUnifiedCurrency } from '@/utils/formatters'

export const formatCurrency = (val: number | string, curr: string = 'USD'): string => {
  return formatUnifiedCurrency(val, { currency: curr })
}

export const getDualValues = (amountInSelected: number, currencyCode: string = 'USD', exchangeRate: number | string = 4100) => {
  const rate = typeof exchangeRate === 'number' ? exchangeRate : parseFloat(exchangeRate) || 4100
  if (currencyCode === 'USD') {
    return {
      usd: amountInSelected,
      khr: amountInSelected * rate
    }
  } else {
    return {
      usd: amountInSelected / rate,
      khr: amountInSelected
    }
  }
}

export const getDetailDualValues = (amountInSelected: number, purchase: Purchase) => {
  const rate = parseFloat(purchase.exchange_rate?.toString()) || 4100
  if (purchase.currency_code === 'USD') {
    return {
      usd: amountInSelected,
      khr: amountInSelected * rate
    }
  } else {
    return {
      usd: amountInSelected / rate,
      khr: amountInSelected
    }
  }
}

export const formatListDualCurrency = (val: number, row: Purchase): string => {
  const vals = getDetailDualValues(val, row)
  return `${formatCurrency(vals.usd, 'USD')} (${formatCurrency(vals.khr, 'KHR')})`
}
