import api from '@/lib/api'
import type { Order } from '@/types/store'

export interface CheckoutPayload {
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_country: string
  payment_method: 'aba_khqr' | 'acleda' | 'card' | 'cod'
  customer_notes?: string
  shipping_cost?: number
}

export const orderService = {
  /**
   * Fetch customer order history
   */
  async getOrders(params: { page?: number; per_page?: number; status?: string } = {}): Promise<Order[]> {
    const res = await api.get('/orders', { params })
    return res.data?.data || []
  },

  /**
   * Fetch single order detail by order number
   */
  async getOrderDetail(orderNumber: string): Promise<Order | null> {
    const res = await api.get(`/orders/${orderNumber}`)
    return res.data?.data || null
  },

  /**
   * Live track order by order number and optional email
   */
  async trackOrder(orderNumber: string, email?: string): Promise<any> {
    const params = email?.trim() ? { email: email.trim() } : undefined
    const res = await api.get(`/track/${orderNumber.trim()}`, { params })
    return res.data?.data || null
  },

  /**
   * Submit checkout order
   */
  async checkout(payload: CheckoutPayload): Promise<any> {
    const res = await api.post('/cart/checkout', payload)
    return res.data?.data || res.data
  },
}

export default orderService
