import React from 'react'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/hooks/useWishlist'

export interface WishlistButtonProps {
  productId: number
  variant?: 'icon' | 'pill' | 'button'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

const iconSizes: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-4.5 h-4.5',
  lg: 'w-5 h-5',
}

const buttonSizes: Record<string, string> = {
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-2xl',
  lg: 'w-11 h-11 rounded-2xl',
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  variant = 'icon',
  size = 'md',
  className,
  showText = false,
}) => {
  const { isWishlisted, toggleWishlist, loadingId } = useWishlist()
  const active = isWishlisted(productId)
  const loading = loadingId === productId

  const handleClick = (e: React.MouseEvent) => {
    toggleWishlist(productId, e)
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none active:scale-95',
          active
            ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/50'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50',
          className
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            active ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
          )}
        />
        {showText && <span>{active ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>}
      </button>
    )
  }

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      disabled={loading}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs',
        buttonSizes[size],
        active
          ? 'bg-rose-500 text-white shadow-rose-500/20 shadow-md'
          : 'bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60',
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          active ? 'fill-current' : 'transition-colors duration-200'
        )}
      />
    </motion.button>
  )
}

export default WishlistButton
