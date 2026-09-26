import api from '@/lib/api'
import type { ProductItem } from '@/types/store'

export interface WishlistItem {
  id: number
  product_id: number
  product: ProductItem
  created_at: string
}

export const wishlistService = {
  /**
   * Fetch all items in customer wishlist
   */
  async getWishlist(): Promise<WishlistItem[]> {
    const res = await api.get('/wishlist')
    return res.data?.data || []
  },

  /**
   * Add a product to wishlist
   */
  async addToWishlist(productId: number): Promise<void> {
    await api.post('/wishlist/add', { product_id: productId })
  },

  /**
   * Remove a product from wishlist by product ID
   */
  async removeFromWishlist(productId: number): Promise<void> {
    await api.delete(`/wishlist/product/${productId}`)
  },

  /**
   * Check if a product is in wishlist
   */
  async checkWishlist(productId: number): Promise<boolean> {
    const res = await api.get(`/wishlist/check/${productId}`)
    return Boolean(res.data?.in_wishlist || res.data?.data?.in_wishlist)
  },

  /**
   * Move all wishlist items into active shopping cart
   */
  async moveAllToCart(): Promise<any> {
    const res = await api.post('/wishlist/move-all-to-cart')
    return res.data?.data || null
  },
}

export default wishlistService
