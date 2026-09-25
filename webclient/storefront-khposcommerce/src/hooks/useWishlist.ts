import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useWishlistStore, useAuthStore } from '@/stores'
import wishlistService from '@/services/wishlistService'

export function useWishlist() {
  const { items, addItem, removeItem, has } = useWishlistStore()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const navigate = useNavigate()
  const location = useLocation()
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const isWishlisted = useCallback(
    (productId: number) => has(productId),
    [has]
  )

  const toggleWishlist = useCallback(
    async (productId: number, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      // If user is not authenticated, redirect to login page
      if (!isLoggedIn) {
        navigate('/auth/login', {
          state: {
            from: location.pathname,
            message:
              'សូមចូលគណនីរបស់អ្នកដើម្បីរក្សាទុកទំនិញពេញចិត្ត (Please sign in to save products to your wishlist)',
          },
        })
        return
      }

      setLoadingId(productId)
      const currentlySaved = has(productId)

      // Optimistic state update
      if (currentlySaved) {
        removeItem(productId)
      } else {
        addItem(productId)
      }

      try {
        if (currentlySaved) {
          await wishlistService.removeFromWishlist(productId)
        } else {
          await wishlistService.addToWishlist(productId)
        }
      } catch {
        // Revert on failure
        if (currentlySaved) {
          addItem(productId)
        } else {
          removeItem(productId)
        }
      } finally {
        setLoadingId(null)
      }
    },
    [isLoggedIn, navigate, location.pathname, has, addItem, removeItem]
  )

  return {
    wishlistItems: items,
    wishlistCount: items.length,
    isWishlisted,
    toggleWishlist,
    loadingId,
  }
}

export default useWishlist
