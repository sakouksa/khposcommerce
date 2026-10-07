import { create } from 'zustand'
import type { CartItem } from '@/types/store'

export type { CartItem }

export interface CartState {
  items: CartItem[]
  subtotal: number
  total: number
  item_count: number
  coupon_code?: string
  discount?: number
  isOpen: boolean

  // Actions
  setCart: (data: {
    items: CartItem[]
    subtotal: number
    total: number
    item_count?: number
    coupon_code?: string
    discount?: number
  }) => void
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  applyCoupon: (code: string, discount: number) => void
  clearCoupon: () => void
  reset: () => void
}

// ─── Cart Store ──────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  subtotal: 0,
  total: 0,
  item_count: 0,
  coupon_code: undefined,
  discount: undefined,
  isOpen: false,

  setCart: (data) =>
    set((s) => {
      const discountAmount = data.discount ?? s.discount ?? 0
      const activeTotal = data.total || Math.max(0, data.subtotal - discountAmount)
      return {
        items: data.items || [],
        subtotal: data.subtotal || 0,
        total: activeTotal,
        item_count: data.item_count ?? (data.items ? data.items.reduce((acc, i) => acc + i.quantity, 0) : 0),
        coupon_code: data.coupon_code ?? s.coupon_code,
        discount: data.discount ?? s.discount,
      }
    }),

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  applyCoupon: (code, discount) =>
    set((s) => ({
      coupon_code: code,
      discount,
      total: Math.max(0, s.subtotal - discount),
    })),

  clearCoupon: () =>
    set((s) => ({
      coupon_code: undefined,
      discount: undefined,
      total: s.subtotal,
    })),

  reset: () =>
    set({
      items: [],
      subtotal: 0,
      total: 0,
      item_count: 0,
      coupon_code: undefined,
      discount: undefined,
    }),
}))

export default useCartStore
