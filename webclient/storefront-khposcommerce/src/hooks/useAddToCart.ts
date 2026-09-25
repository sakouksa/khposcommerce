import { useState, useCallback } from 'react'
import { useCartStore } from '@/stores/cartStore'
import cartService from '@/services/cartService'

export interface UseAddToCartOptions {
  openDrawerOnAdd?: boolean
  feedbackDuration?: number
  onSuccess?: () => void
  onError?: (error: any) => void
}

export function useAddToCart(options: UseAddToCartOptions = {}) {
  const { openDrawerOnAdd = false, feedbackDuration = 1800, onSuccess, onError } = options
  const setCart = useCartStore((s) => s.setCart)
  const setOpen = useCartStore((s) => s.setOpen)

  const [addingId, setAddingId] = useState<number | null>(null)
  const [addedId, setAddedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addToCart = useCallback(
    async (
      productId: number,
      quantity = 1,
      variantId?: number | null,
      e?: React.MouseEvent
    ) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      setAddingId(productId)
      setError(null)

      try {
        const cartData = await cartService.addItem({
          product_id: productId,
          product_variant_id: variantId || null,
          quantity,
        })
        setCart(cartData)
        setAddedId(productId)

        if (openDrawerOnAdd) {
          setOpen(true)
        }

        onSuccess?.()

        setTimeout(() => {
          setAddedId((current) => (current === productId ? null : current))
        }, feedbackDuration)

        return true
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to add item to cart'
        setError(msg)
        onError?.(err)
        return false
      } finally {
        setAddingId((current) => (current === productId ? null : current))
      }
    },
    [setCart, setOpen, openDrawerOnAdd, feedbackDuration, onSuccess, onError]
  )

  const isAdding = useCallback((productId: number) => addingId === productId, [addingId])
  const isAdded = useCallback((productId: number) => addedId === productId, [addedId])

  return {
    addToCart,
    isAdding,
    isAdded,
    addingId,
    addedId,
    error,
  }
}

export default useAddToCart
