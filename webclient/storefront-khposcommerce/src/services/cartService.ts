import api from '@/lib/api'
import type { CartItem } from '@/types/store'

export interface CartPayloadItem {
  product_id: number
  product_variant_id?: number | null
  quantity: number
}

export interface CartResponse {
  items: CartItem[]
  subtotal: number
  total: number
  item_count: number
  discount?: number
  coupon_code?: string
}

export const cartService = {
  /**
   * Fetch current active cart from server
   */
  async getCart(): Promise<CartResponse> {
    const res = await api.get('/cart')
    return res.data?.data || { items: [], subtotal: 0, total: 0, item_count: 0 }
  },

  /**
   * Add product or variant to cart
   */
  async addItem(item: CartPayloadItem): Promise<CartResponse> {
    const res = await api.post('/cart/add', item)
    return res.data?.data || { items: [], subtotal: 0, total: 0, item_count: 0 }
  },

  /**
   * Update quantity of a cart item
   */
  async updateQuantity(itemId: number, quantity: number): Promise<CartResponse> {
    const res = await api.put('/cart/update', { item_id: itemId, quantity })
    return res.data?.data || { items: [], subtotal: 0, total: 0, item_count: 0 }
  },

  /**
   * Remove specific item from cart
   */
  async removeItem(itemId: number): Promise<CartResponse> {
    const res = await api.delete('/cart/remove', { data: { item_id: itemId } })
    return res.data?.data || { items: [], subtotal: 0, total: 0, item_count: 0 }
  },

  /**
   * Clear all items in cart
   */
  async clearCart(): Promise<void> {
    await api.delete('/cart/clear')
  },

  /**
   * Apply promotional coupon code
   */
  async applyCoupon(code: string): Promise<CartResponse> {
    const res = await api.post('/cart/apply-coupon', { code })
    return res.data?.data || { items: [], subtotal: 0, total: 0, item_count: 0 }
  },

  /**
   * Validate coupon eligibility
   */
  async validateCoupon(code: string, subtotal: number): Promise<any> {
    const res = await api.post('/coupons/validate', { code, subtotal })
    return res.data?.data || null
  },
}

export default cartService
