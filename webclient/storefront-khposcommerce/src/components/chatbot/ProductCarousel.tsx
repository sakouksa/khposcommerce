import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard, { type StructuredProduct } from './ProductCard'

interface ProductCarouselProps {
  products: StructuredProduct[]
  onProductClick?: () => void
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ products, onProductClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) return null

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 250
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative group/carousel my-2 -mx-2 px-2">
      {/* Scroll Left Button */}
      {products.length > 1 && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
        style={{ scrollbarWidth: 'thin' }}
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start">
            <ProductCard product={p} onProductClick={onProductClick} />
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      {products.length > 1 && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default ProductCarousel
