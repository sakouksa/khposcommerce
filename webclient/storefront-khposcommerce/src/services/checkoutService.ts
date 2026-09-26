import api from '@/lib/api'

export interface PaymentMethodItem {
  id: number
  name: string
  code: string
  type: 'qris' | 'ewallet' | 'credit_card' | 'cash' | 'bank_transfer' | 'debit_card' | string
  logo?: string | null
  fee_percent: number
  fee_fixed: number
  config?: Record<string, any> | null
}

export interface ShippingMethodItem {
  id: number
  name: string
  code: string
  provider: string
  base_price: number
}

export interface ProvinceItem {
  id: number
  name: string
  code: string
}

export const checkoutService = {
  async getPaymentMethods(): Promise<PaymentMethodItem[]> {
    const res = await api.get('/payment-methods')
    return res.data?.data || []
  },

  async getShippingMethods(): Promise<ShippingMethodItem[]> {
    const res = await api.get('/shipping-methods')
    return res.data?.data || []
  },

  async getProvinces(): Promise<ProvinceItem[]> {
    const res = await api.get('/provinces')
    return res.data?.data || []
  },
}

export default checkoutService
